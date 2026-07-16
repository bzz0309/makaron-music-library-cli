import { queryMusic } from './intelligence.js';

const CONCEPTS = {
  healing: ['healing', 'warm', 'cozy', '治愈', '温暖', '温馨'],
  happy: ['happy', 'joy', 'bright', 'upbeat', '欢快', '开心', '明亮', '活泼'],
  romantic: ['romantic', 'love', 'sweet', '浪漫', '爱情', '甜蜜'],
  sad: ['sad', 'melancholy', 'emotional', '悲伤', '伤感', '催泪'],
  tense: ['tense', 'suspense', 'thriller', '紧张', '悬疑', '惊悚'],
  epic: ['epic', 'heroic', 'trailer', '史诗', '英雄', '预告片'],
  energetic: ['energetic', 'dynamic', 'sports', '活力', '动感', '运动'],
  cinematic: ['cinematic', 'film', 'score', '电影感', '影视', '配乐'],
  japanese: ['japanese', 'japan', 'anime', '日系', '日本', '动漫'],
  chinese: ['chinese', 'oriental', '古风', '国风', '中国风'],
  piano: ['piano', '钢琴'],
  guitar: ['guitar', '吉他'],
  electronic: ['electronic', 'synth', 'edm', '电子', '合成器'],
  dance: ['dance', 'dance-pop', 'dj', '舞曲', '跳舞', '劲爆'],
  pop: ['pop', '流行', '热歌'],
  kpop: ['k-pop', 'kpop', 'korean pop', '韩国流行', '韩语', '韩流', '女团', '男团'],
  trending: ['trending', 'viral', 'tiktok', '抖音', '热门', '爆款'],
  bgm: ['bgm', 'background music', '背景音乐'],
  product: ['product', 'ecommerce', 'e-commerce', '商品', '产品', '电商', '带货'],
  luxury: ['luxury', 'premium', 'elegant', '奢华', '高级', '高端'],
  no_vocals: ['instrumental', 'no vocals', '纯音乐', '无歌词', '无人声'],
};
const SCENES = {
  'kpop-stage': 'K-pop stage performance, high energy dance-pop, electronic production, strong beat, clear build and performance climax',
  ecommerce: 'e-commerce product marketing, clean catchy background music, clear rhythm, upbeat modern production, product-focused, minimal or no vocals',
};

function json(payload, status = 200) {
  return new Response(`${JSON.stringify(payload)}\n`, { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
function error(code, message, status = 400) { return json({ ok: false, error: { code, message } }, status); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function conceptsFor(text) {
  const value = String(text || '').toLowerCase();
  return Object.entries(CONCEPTS).filter(([, words]) => words.some((word) => value.includes(word))).map(([concept]) => concept);
}
function queryTerms(query) {
  const lexical = String(query || '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((term) => term.length >= 2 || /[^\x00-\x7F]/.test(term));
  return unique([...lexical, ...conceptsFor(query)]).slice(0, 12);
}
function authorized(request, env) {
  const candidate = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  const tokens = String(env.AGENT_TOKENS || '').split(',').map((item) => item.trim()).filter(Boolean);
  return candidate && tokens.includes(candidate);
}
function adminAuthorized(request, env) {
  const candidate = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  return Boolean(candidate && env.ADMIN_TOKEN && candidate === env.ADMIN_TOKEN);
}
function safeTrack(row) {
  let tags = [];
  try { tags = JSON.parse(row.tags_json || '[]'); } catch {}
  return {
    schema_version: '1.0', id: row.id, title: row.title, artist: row.artist, album: row.album,
    source: row.source, size_bytes: row.size_bytes, duration_seconds: row.duration_seconds,
    tags, description: row.description || '',
    license: row.license || 'unknown', commercial_use: row.commercial_use === null ? null : Boolean(row.commercial_use),
    modified_at: row.modified_at,
  };
}
function score(row, terms) {
  const text = String(row.search_text || '').toLowerCase(); let tags = []; let value = 0; const matched = [];
  try { tags = JSON.parse(row.tags_json || '[]'); } catch {}
  for (const term of terms) {
    if (tags.includes(term)) { value += 4; matched.push(term); }
    else if (text.includes(term)) { value += 2; matched.push(term); }
  }
  return { score: value, matched: unique(matched) };
}
async function searchTracks(env, query, options = {}) {
  const terms = queryTerms(query); if (!terms.length) return [];
  const conditions = terms.map(() => 'search_text LIKE ?').join(' OR ');
  const filters = [`(${conditions})`]; const params = terms.map((term) => `%${term}%`);
  if (options.commercial_only) filters.push('commercial_use = 1');
  const statement = env.DB.prepare(`SELECT * FROM tracks WHERE ${filters.join(' AND ')} LIMIT 250`).bind(...params);
  const result = await statement.all();
  return (result.results || [])
    .map((row) => ({ ...safeTrack(row), match: score(row, terms) }))
    .filter((track) => track.match.score > 0)
    .sort((a, b) => b.match.score - a.match.score || a.title.localeCompare(b.title))
    .slice(0, Math.min(Number(options.limit || 10), 50));
}
function musicPrompt(intelligence) { return intelligence?.seed_audio?.music_prompt || intelligence?.music_prompt || intelligence?.music_cue?.prompt || intelligence?.short_video_music?.hook_prompt || ''; }
function recommendationDecision(track) {
  if (!track) return { action: 'generate-original', publish_ready: false, reason: 'No matching library track was found.' };
  if (track.commercial_use === true && track.license !== 'unknown') return { action: 'use-library-track', publish_ready: true, reason: 'The selected track is explicitly marked for commercial use.' };
  return { action: 'review-rights-or-generate-original', publish_ready: false, reason: 'The selected track has no verified commercial-use metadata.' };
}
async function hmac(secret, value) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
async function validSignature(secret, value, candidate) {
  if (!candidate) return false;
  const expected = await hmac(secret, value);
  if (candidate.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) difference |= expected.charCodeAt(index) ^ candidate.charCodeAt(index);
  return difference === 0;
}
async function trackRow(env, id) { return env.DB.prepare('SELECT * FROM tracks WHERE id = ? LIMIT 1').bind(id).first(); }
const AUDIO_TYPES = {
  mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', aac: 'audio/aac',
  flac: 'audio/flac', ogg: 'audio/ogg', opus: 'audio/opus', aiff: 'audio/aiff', aif: 'audio/aiff',
};
const TRACK_COLUMNS = ['id', 'title', 'artist', 'album', 'object_key', 'source', 'size_bytes', 'duration_seconds', 'tags_json', 'description', 'license', 'commercial_use', 'modified_at', 'search_text'];
function uploadDescriptor(id, extension) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;
  const normalized = String(extension || '').toLowerCase().replace(/^\./, '');
  if (!AUDIO_TYPES[normalized]) return null;
  return { object_key: `audio/${id}.${normalized}`, content_type: AUDIO_TYPES[normalized] };
}
function adminTrackRow(track) {
  const descriptor = uploadDescriptor(String(track.id || ''), track.extension);
  if (!descriptor || !track.title || !Number.isFinite(Number(track.size_bytes))) return null;
  const tags = Array.isArray(track.tags) ? track.tags.map(String) : [];
  const searchText = [track.title, track.artist, track.album, track.description, ...tags].filter(Boolean).join(' ').toLowerCase();
  return [
    track.id, String(track.title), track.artist ? String(track.artist) : null, track.album ? String(track.album) : null,
    descriptor.object_key, track.source ? String(track.source) : null, Number(track.size_bytes),
    Number.isFinite(Number(track.duration_seconds)) ? Number(track.duration_seconds) : null,
    JSON.stringify(tags), track.description ? String(track.description) : '', track.license ? String(track.license) : 'unknown',
    track.commercial_use === null || track.commercial_use === undefined ? null : track.commercial_use ? 1 : 0,
    track.modified_at ? String(track.modified_at) : null, searchText,
  ];
}
async function upsertAdminTracks(env, tracks) {
  if (!Array.isArray(tracks) || tracks.length < 1 || tracks.length > 50) throw new Error('Provide between 1 and 50 tracks.');
  const rows = tracks.map(adminTrackRow);
  if (rows.some((row) => !row)) throw new Error('One or more tracks contain invalid metadata.');
  const placeholders = TRACK_COLUMNS.map(() => '?').join(',');
  const updates = TRACK_COLUMNS.filter((column) => column !== 'id').map((column) => `${column}=excluded.${column}`).join(',');
  const sql = `INSERT INTO tracks (${TRACK_COLUMNS.join(',')}) VALUES (${placeholders}) ON CONFLICT(id) DO UPDATE SET ${updates}, updated_at=CURRENT_TIMESTAMP`;
  await env.DB.batch(rows.map((row) => env.DB.prepare(sql).bind(...row)));
}
function requestedRange(header, total) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (!match[1] && !match[2]) || !Number.isFinite(total) || total <= 0) return false;
  let start;
  let end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isInteger(suffix) || suffix <= 0) return false;
    start = Math.max(0, total - suffix);
    end = total - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : total - 1;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start >= total || end < start) return false;
    end = Math.min(end, total - 1);
  }
  return { offset: start, length: end - start + 1, start, end };
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (request.method === 'GET' && url.pathname === '/v1/health') return json({ ok: true, service: 'makaron-music-library-worker', api_version: 'v1', storage: 'r2', catalog: 'd1' });
      const adminUpload = url.pathname.match(/^\/v1\/admin\/tracks\/([^/]+)\/audio$/);
      if (request.method === 'PUT' && adminUpload) {
        if (!adminAuthorized(request, env)) return error('ADMIN_UNAUTHORIZED', 'A valid administrator token is required.', 401);
        const id = decodeURIComponent(adminUpload[1]);
        const descriptor = uploadDescriptor(id, url.searchParams.get('extension'));
        const size = Number(request.headers.get('content-length'));
        const maximum = Number(env.MAX_UPLOAD_BYTES || 100 * 1024 * 1024);
        if (!descriptor) return error('INVALID_AUDIO_UPLOAD', 'Use a valid track ID and supported audio extension.');
        if (!request.body || !Number.isFinite(size) || size < 1 || size > maximum) return error('INVALID_AUDIO_SIZE', `Audio must include a content length between 1 and ${maximum} bytes.`);
        const object = await env.MUSIC.put(descriptor.object_key, request.body, { httpMetadata: { contentType: descriptor.content_type } });
        return json({ ok: true, id, size_bytes: size, etag: object?.httpEtag || object?.etag || null });
      }
      if (request.method === 'POST' && url.pathname === '/v1/admin/tracks/batch') {
        if (!adminAuthorized(request, env)) return error('ADMIN_UNAUTHORIZED', 'A valid administrator token is required.', 401);
        const body = await request.json();
        await upsertAdminTracks(env, body.tracks);
        return json({ ok: true, indexed: body.tracks.length });
      }
      const audio = url.pathname.match(/^\/v1\/tracks\/([^/]+)\/audio$/);
      if (request.method === 'GET' && audio) {
        const id = decodeURIComponent(audio[1]); const expires = Number(url.searchParams.get('expires')); const signature = url.searchParams.get('signature');
        if (!expires || expires < Math.floor(Date.now() / 1000) || !(await validSignature(env.SIGNING_SECRET, `${id}:${expires}`, signature))) return error('INVALID_OR_EXPIRED_LINK', 'This audio link is invalid or expired.', 401);
        const row = await trackRow(env, id); if (!row) return error('TRACK_NOT_FOUND', 'Track not found.', 404);
        const total = Number(row.size_bytes);
        const range = requestedRange(request.headers.get('range'), total);
        if (range === false) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${total}`, 'accept-ranges': 'bytes' } });
        const object = await env.MUSIC.get(row.object_key, range ? { range: { offset: range.offset, length: range.length } } : undefined);
        if (!object) return error('AUDIO_NOT_FOUND', 'Audio object is unavailable.', 404);
        const headers = new Headers({
          'content-type': object.httpMetadata?.contentType || 'application/octet-stream',
          'content-length': String(range ? range.length : total || object.size),
          'cache-control': 'private, max-age=60',
          'accept-ranges': 'bytes',
        });
        if (object.httpEtag) headers.set('etag', object.httpEtag);
        if (range) headers.set('content-range', `bytes ${range.start}-${range.end}/${total}`);
        return new Response(object.body, { status: range ? 206 : 200, headers });
      }
      if (!authorized(request, env)) return error('UNAUTHORIZED', 'A valid Agent token is required.', 401);
      if (request.method === 'GET' && url.pathname === '/v1/search') {
        const query = url.searchParams.get('query'); if (!query) return error('MISSING_REQUIRED_OPTION', 'Missing query.');
        const tracks = await searchTracks(env, query, { limit: url.searchParams.get('limit'), commercial_only: url.searchParams.get('commercial_only') === 'true' });
        return json({ ok: true, query, count: tracks.length, tracks });
      }
      if (request.method === 'POST' && url.pathname === '/v1/recommend') {
        const body = await request.json(); if (body.video) return error('REMOTE_VIDEO_UPLOAD_NOT_IMPLEMENTED', 'Send a textual video brief or request.');
        const requestText = unique([SCENES[body.scene], body.request, body.brief]).join('. ');
        if (!requestText) return error('MISSING_INPUT', 'Provide request, brief, or scene.');
        const input = { request: requestText, duration: Number(body.duration || 0) || undefined, workflow_context: { platform: body.platform || 'makaron', content_type: body['content-type'], style: body.style, target: body.target } };
        input.workflow_context = Object.fromEntries(Object.entries(input.workflow_context).filter(([, value]) => value !== undefined));
        const intelligence = queryMusic(input, body.adapter || 'generic');
        const attributes = Object.values(intelligence.matched_attributes || {}).flatMap((value) => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [value]);
        const localQuery = unique([requestText, intelligence.profile_id, musicPrompt(intelligence), ...attributes.map(String)]).join(' ');
        const tracks = await searchTracks(env, localQuery, { limit: body.limit || 5, commercial_only: body['commercial-only'] });
        const recommendation = tracks[0] || null;
        return json({ ok: true, profile_id: intelligence.profile_id, intelligence, request: requestText, duration_seconds: input.duration || null, count: tracks.length, recommendation, decision: recommendationDecision(recommendation), generation_prompt: musicPrompt(intelligence), tracks });
      }
      const access = url.pathname.match(/^\/v1\/tracks\/([^/]+)\/access$/);
      if (request.method === 'POST' && access) {
        const id = decodeURIComponent(access[1]); const row = await trackRow(env, id); if (!row) return error('TRACK_NOT_FOUND', 'Track not found.', 404);
        const ttl = Math.max(30, Math.min(Number(env.LINK_TTL_SECONDS || 900), 3600)); const expires = Math.floor(Date.now() / 1000) + ttl;
        const signature = await hmac(env.SIGNING_SECRET, `${id}:${expires}`);
        return json({ ok: true, track: safeTrack(row), url: `${url.origin}/v1/tracks/${encodeURIComponent(id)}/audio?expires=${expires}&signature=${signature}`, expires_at: new Date(expires * 1000).toISOString() });
      }
      return error('NOT_FOUND', 'API route not found.', 404);
    } catch (cause) {
      return error('UNEXPECTED_ERROR', cause instanceof Error ? cause.message : String(cause), 500);
    }
  },
};
