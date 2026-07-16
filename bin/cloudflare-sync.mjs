import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function fail(code, message) {
  const error = new Error(message); error.code = code; throw error;
}
function hmac(key, value, encoding) { return crypto.createHmac('sha256', key).update(value).digest(encoding); }
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
async function fileHash(file) {
  const hash = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
function awsDate(date = new Date()) {
  const compact = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  return { amz: compact, day: compact.slice(0, 8) };
}
function objectPath(bucket, key) {
  return `/${[bucket, ...key.split('/')].map((segment) => encodeURIComponent(segment)).join('/')}`;
}
function signingKey(secret, day) {
  const date = hmac(`AWS4${secret}`, day);
  const region = hmac(date, 'auto');
  const service = hmac(region, 's3');
  return hmac(service, 'aws4_request');
}
function contentType(file) {
  return {
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
    '.flac': 'audio/flac', '.ogg': 'audio/ogg', '.opus': 'audio/opus', '.aiff': 'audio/aiff', '.aif': 'audio/aiff',
  }[path.extname(file).toLowerCase()] || 'application/octet-stream';
}
async function putObject({ accountId, accessKeyId, secretAccessKey, bucket, key, file }) {
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const pathname = objectPath(bucket, key);
  const payloadHash = await fileHash(file);
  const { amz, day } = awsDate();
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amz}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonical = `PUT\n${pathname}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const scope = `${day}/auto/s3/aws4_request`;
  const toSign = `AWS4-HMAC-SHA256\n${amz}\n${scope}\n${sha256(canonical)}`;
  const signature = hmac(signingKey(secretAccessKey, day), toSign, 'hex');
  const stat = fs.statSync(file);
  const response = await fetch(`https://${host}${pathname}`, {
    method: 'PUT',
    headers: {
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'content-length': String(stat.size),
      'content-type': contentType(file),
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amz,
    },
    body: fs.createReadStream(file),
    duplex: 'half',
  });
  if (!response.ok) fail('R2_UPLOAD_FAILED', `R2 rejected ${key}: HTTP ${response.status} ${(await response.text()).slice(0, 500)}`);
}
async function cloudflareQuery({ accountId, databaseId, token, sql, params = [] }) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ sql, params }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) fail('D1_QUERY_FAILED', `D1 query failed: HTTP ${response.status} ${JSON.stringify(payload?.errors || payload).slice(0, 1000)}`);
  return payload;
}
function searchText(track) {
  return [track.title, track.artist, track.album, track.description, ...(track.tags || [])].filter(Boolean).join(' ').toLowerCase();
}
function objectKey(track) { return `audio/${track.id}${path.extname(track.path).toLowerCase()}`; }
function rowFor(track) {
  return [
    track.id, track.title, track.artist, track.album, objectKey(track), track.source, track.size_bytes,
    track.duration_seconds, JSON.stringify(track.tags || []), track.description || '', track.license || 'unknown',
    track.commercial_use === null || track.commercial_use === undefined ? null : track.commercial_use ? 1 : 0,
    track.modified_at, searchText(track),
  ];
}
const COLUMNS = ['id', 'title', 'artist', 'album', 'object_key', 'source', 'size_bytes', 'duration_seconds', 'tags_json', 'description', 'license', 'commercial_use', 'modified_at', 'search_text'];
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT, album TEXT, object_key TEXT NOT NULL UNIQUE,
    source TEXT, size_bytes INTEGER NOT NULL, duration_seconds REAL, tags_json TEXT NOT NULL DEFAULT '[]',
    description TEXT NOT NULL DEFAULT '', license TEXT NOT NULL DEFAULT 'unknown', commercial_use INTEGER,
    modified_at TEXT, search_text TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  'CREATE INDEX IF NOT EXISTS tracks_artist_idx ON tracks(artist)',
  'CREATE INDEX IF NOT EXISTS tracks_title_idx ON tracks(title)',
  'CREATE INDEX IF NOT EXISTS tracks_commercial_idx ON tracks(commercial_use)',
];
async function upsertRows(config, rows) {
  for (let offset = 0; offset < rows.length; offset += 50) {
    const chunk = rows.slice(offset, offset + 50);
    const placeholders = chunk.map(() => `(${COLUMNS.map(() => '?').join(',')})`).join(',');
    const updates = COLUMNS.filter((column) => column !== 'id').map((column) => `${column}=excluded.${column}`).join(',');
    const sql = `INSERT INTO tracks (${COLUMNS.join(',')}) VALUES ${placeholders} ON CONFLICT(id) DO UPDATE SET ${updates}, updated_at=CURRENT_TIMESTAMP`;
    await cloudflareQuery({ ...config, sql, params: chunk.flatMap(rowFor) });
  }
}
async function concurrent(items, limit, task) {
  let cursor = 0; let completed = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor; cursor += 1;
      await task(items[index], index);
      completed += 1;
      if (completed % 25 === 0 || completed === items.length) process.stderr.write(`Uploaded ${completed}/${items.length}\n`);
    }
  });
  await Promise.all(workers);
}

export async function syncCloudflare(options) {
  const library = path.resolve(options.library);
  const tracksFile = path.join(library, 'tracks.json');
  if (!fs.existsSync(tracksFile)) fail('NOT_A_LIBRARY', `No tracks.json found in ${library}`);
  const tracks = JSON.parse(fs.readFileSync(tracksFile, 'utf8')).filter((track) => fs.existsSync(track.path));
  const selected = options.limit ? tracks.slice(0, Number(options.limit)) : tracks;
  const accountId = options.accountId || process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = options.databaseId || process.env.CLOUDFLARE_D1_DATABASE_ID;
  const bucket = options.bucket || process.env.CLOUDFLARE_R2_BUCKET || 'makaron-music-library';
  if (!accountId || !databaseId) fail('CLOUDFLARE_CONFIG_REQUIRED', 'Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_D1_DATABASE_ID.');
  const summary = { ok: true, dry_run: Boolean(options.dryRun), library, bucket, database_id: databaseId, tracks: selected.length, bytes: selected.reduce((total, track) => total + Number(track.size_bytes || 0), 0) };
  if (options.dryRun) return summary;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!token || !accessKeyId || !secretAccessKey) fail('CLOUDFLARE_AUTH_REQUIRED', 'Set CLOUDFLARE_API_TOKEN, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.');
  const d1 = { accountId, databaseId, token };
  for (const sql of SCHEMA) await cloudflareQuery({ ...d1, sql });
  await concurrent(selected, Number(options.concurrency || 3), (track) => putObject({ accountId, accessKeyId, secretAccessKey, bucket, key: objectKey(track), file: track.path }));
  await upsertRows(d1, selected);
  return { ...summary, dry_run: false, uploaded: selected.length, indexed: selected.length };
}
