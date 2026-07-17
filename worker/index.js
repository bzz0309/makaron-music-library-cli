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
  product: ['product', 'ecommerce', 'e-commerce', 'marketing', 'advertising', '商品', '产品', '电商', '带货', '营销', '广告', '美妆'],
  luxury: ['luxury', 'premium', 'elegant', '奢华', '高级', '高端'],
  no_vocals: ['instrumental', 'no vocals', '纯音乐', '无歌词', '无人声'],
};
const SCENES = {
  'kpop-stage': 'K-pop stage performance, high energy dance-pop, electronic production, strong beat, clear build and performance climax',
  ecommerce: 'e-commerce product marketing, clean catchy background music, clear rhythm, upbeat modern production, product-focused, minimal or no vocals',
};
const SCENE_WEIGHTS = {
  'kpop-stage': { kpop: 18, dance: 6, energetic: 5, electronic: 4, pop: 3, trending: 2 },
  ecommerce: { product: 9, bgm: 14, happy: 4, electronic: 3, trending: 3, no_vocals: 5, pop: 2 },
};
const SCENE_REQUIRED_TAGS = { 'kpop-stage': ['kpop'] };

function inferScene(text) {
  const concepts = new Set(conceptsFor(text));
  if (concepts.has('kpop')) return 'kpop-stage';
  if (concepts.has('product')) return 'ecommerce';
  return null;
}

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
  const stop = new Set(['and', 'the', 'with', 'for', 'from', 'into', 'music', 'production', 'no']);
  const lexical = String(query || '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((term) => (term.length >= 2 || /[^\x00-\x7F]/.test(term)) && !/^\d+$/.test(term) && !stop.has(term));
  return unique([...lexical, ...conceptsFor(query)]).slice(0, 12);
}
function legacyAuthorized(request, env) {
  const candidate = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  const tokens = String(env.AGENT_TOKENS || '').split(',').map((item) => item.trim()).filter(Boolean);
  return Boolean(candidate && tokens.includes(candidate));
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
function score(row, terms, scene) {
  const text = String(row.search_text || '').toLowerCase(); let tags = []; let value = 0; const matched = [];
  try { tags = JSON.parse(row.tags_json || '[]'); } catch {}
  for (const term of terms) {
    if (tags.includes(term)) { value += 4; matched.push(term); }
    else if (text.includes(term)) { value += 2; matched.push(term); }
  }
  for (const [tag, weight] of Object.entries(SCENE_WEIGHTS[scene] || {})) {
    if (tags.includes(tag)) { value += weight; matched.push(`scene:${tag}`); }
  }
  return { score: value, matched: unique(matched), scene: scene || null };
}
async function searchTracks(env, query, options = {}) {
  const terms = queryTerms(query); if (!terms.length) return [];
  const conditions = terms.map(() => 'search_text LIKE ?').join(' OR ');
  const filters = [`(${conditions})`]; const params = terms.map((term) => `%${term}%`);
  if (options.commercial_only) filters.push('commercial_use = 1');
  const statement = env.DB.prepare(`SELECT * FROM tracks WHERE ${filters.join(' AND ')} LIMIT 250`).bind(...params);
  const result = await statement.all();
  let rows = result.results || [];
  const weights = SCENE_WEIGHTS[options.scene] || {};
  const preferredTags = Object.entries(weights).filter(([, weight]) => weight > 0);
  if (preferredTags.length) {
    const preferredConditions = preferredTags.map(() => 'tags_json LIKE ?').join(' OR ');
    const preferredFilters = [`(${preferredConditions})`];
    if (options.commercial_only) preferredFilters.push('commercial_use = 1');
    const order = preferredTags.map(([, weight]) => `(CASE WHEN tags_json LIKE ? THEN ${Number(weight)} ELSE 0 END)`).join(' + ');
    const tagParams = preferredTags.map(([tag]) => `%"${tag}"%`);
    const preferred = await env.DB.prepare(`SELECT * FROM tracks WHERE ${preferredFilters.join(' AND ')} ORDER BY ${order} DESC LIMIT 250`).bind(...tagParams, ...tagParams).all();
    rows = [...new Map([...(preferred.results || []), ...rows].map((row) => [row.id, row])).values()];
  }
  const requiredTags = unique([...(SCENE_REQUIRED_TAGS[options.scene] || []), ...(options.required_tags || [])]);
  return rows
    .map((row) => ({ ...safeTrack(row), match: score(row, terms, options.scene) }))
    .filter((track) => !requiredTags.length || requiredTags.every((tag) => track.tags.includes(tag)))
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
async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
function randomToken(bytes = 32) {
  const value = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
function bearerToken(request) {
  return request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
}
function scopesFrom(value) {
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}
async function authorize(request, env) {
  const candidate = bearerToken(request);
  if (!candidate) return null;
  if (legacyAuthorized(request, env)) return { type: 'legacy', token_id: 'legacy', scopes: ['search', 'recommend', 'access'] };
  const tokenHash = await sha256(candidate);
  const row = await env.DB.prepare('SELECT id, scopes, status FROM agent_tokens WHERE token_hash = ? LIMIT 1').bind(tokenHash).first();
  if (!row || row.status !== 'active') return null;
  return { type: 'registered', token_id: row.id, scopes: scopesFrom(row.scopes) };
}
const QUOTA_COLUMNS = { search: 'search_count', recommend: 'recommend_count', access: 'access_count' };
function quotaLimit(env, action) {
  const defaults = { search: 200, recommend: 100, access: 25 };
  const keys = { search: 'DAILY_SEARCH_LIMIT', recommend: 'DAILY_RECOMMEND_LIMIT', access: 'DAILY_ACCESS_LIMIT' };
  return Math.max(1, Number(env[keys[action]] || defaults[action]));
}
async function consumeQuota(env, auth, action) {
  if (auth.type === 'legacy') return { allowed: true, limit: null, remaining: null };
  if (!auth.scopes.includes(action)) return { allowed: false, reason: 'scope' };
  const column = QUOTA_COLUMNS[action];
  const day = new Date().toISOString().slice(0, 10);
  await env.DB.prepare(
    `INSERT INTO agent_usage (token_id, usage_day, ${column}) VALUES (?, ?, 1)
     ON CONFLICT(token_id, usage_day) DO UPDATE SET ${column} = ${column} + 1`,
  ).bind(auth.token_id, day).run();
  const usage = await env.DB.prepare(`SELECT ${column} AS count FROM agent_usage WHERE token_id = ? AND usage_day = ?`).bind(auth.token_id, day).first();
  const count = Number(usage?.count || 0);
  const limit = quotaLimit(env, action);
  return { allowed: count <= limit, reason: count <= limit ? null : 'quota', limit, remaining: Math.max(0, limit - count) };
}
async function registeredRequest(request, env, action) {
  const auth = await authorize(request, env);
  if (!auth) return { response: error('UNAUTHORIZED', 'A valid Agent credential is required.', 401) };
  const quota = await consumeQuota(env, auth, action);
  if (!quota.allowed) {
    if (quota.reason === 'scope') return { response: error('FORBIDDEN', `This Agent credential does not permit ${action}.`, 403) };
    return { response: error('DAILY_QUOTA_EXCEEDED', `The daily ${action} quota has been reached.`, 429) };
  }
  return { auth, quota };
}
function registrationQuotas(env) {
  return {
    search_per_day: quotaLimit(env, 'search'),
    recommend_per_day: quotaLimit(env, 'recommend'),
    access_per_day: quotaLimit(env, 'access'),
  };
}
async function registrationIdentity(request, env) {
  const relayOrigin = request.headers.get('x-musiclib-relay-origin') || '';
  const relaySignature = request.headers.get('x-musiclib-relay-signature') || '';
  const trustedRelay = relayOrigin && env.RELAY_SHARED_SECRET
    && await validSignature(env.RELAY_SHARED_SECRET, relayOrigin, relaySignature);
  const address = trustedRelay
    ? `relay:${relayOrigin}`
    : request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return hmac(env.SIGNING_SECRET, `registration-ip:${address}`);
}
async function registrationSessionIdentity(request, env, fallback) {
  const session = request.headers.get('x-musiclib-registration-session') || '';
  const signature = request.headers.get('x-musiclib-registration-session-signature') || '';
  const trustedSession = /^[A-Za-z0-9_-]{32,128}$/.test(session) && env.RELAY_SHARED_SECRET
    && await validSignature(env.RELAY_SHARED_SECRET, `registration-session:${session}`, signature);
  return trustedSession ? hmac(env.SIGNING_SECRET, `registration-session:${session}`) : fallback;
}
async function createRegistrationChallenge(request, env) {
  const ipHash = await registrationIdentity(request, env);
  const sessionHash = await registrationSessionIdentity(request, env, ipHash);
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM registration_challenges WHERE ip_hash = ? AND created_at >= datetime('now', '-1 hour')",
  ).bind(ipHash).first();
  const hourlyLimit = Math.max(1, Number(env.REGISTRATION_CHALLENGES_PER_HOUR || 10));
  if (Number(recent?.count || 0) >= hourlyLimit) return error('REGISTRATION_RATE_LIMITED', 'Too many registration attempts. Try again later.', 429);
  const id = crypto.randomUUID();
  const nonce = randomToken(24);
  const difficulty = Math.max(2, Math.min(Number(env.REGISTRATION_DIFFICULTY || 4), 6));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await env.DB.prepare(
    'INSERT INTO registration_challenges (id, nonce, difficulty, ip_hash, session_hash, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).bind(id, nonce, difficulty, ipHash, sessionHash, expiresAt).run();
  return json({
    ok: true,
    challenge_id: id,
    challenge: { algorithm: 'sha256-prefix', nonce, difficulty },
    expires_at: expiresAt,
  });
}
async function verifyRegistration(request, env) {
  const body = await request.json();
  const challengeId = String(body.challenge_id || '');
  const solution = String(body.solution || '');
  if (!challengeId || !/^\d{1,10}$/.test(solution)) return error('INVALID_REGISTRATION_PROOF', 'A valid challenge ID and numeric solution are required.');
  const challenge = await env.DB.prepare(
    'SELECT id, nonce, difficulty, ip_hash, session_hash, expires_at, used_at FROM registration_challenges WHERE id = ? LIMIT 1',
  ).bind(challengeId).first();
  if (!challenge || challenge.used_at || Date.parse(challenge.expires_at) <= Date.now()) return error('REGISTRATION_CHALLENGE_EXPIRED', 'The registration challenge is invalid, expired, or already used.', 400);
  const ipHash = await registrationIdentity(request, env);
  const sessionHash = await registrationSessionIdentity(request, env, ipHash);
  if (sessionHash !== (challenge.session_hash || challenge.ip_hash)) return error('REGISTRATION_ORIGIN_CHANGED', 'Complete registration from the same Agent session.', 400);
  const digest = await sha256(`${challenge.nonce}:${solution}`);
  if (!digest.startsWith('0'.repeat(Number(challenge.difficulty)))) return error('INVALID_REGISTRATION_PROOF', 'The registration proof is incorrect.', 400);
  const consumed = await env.DB.prepare(
    'UPDATE registration_challenges SET used_at = CURRENT_TIMESTAMP WHERE id = ? AND used_at IS NULL',
  ).bind(challengeId).run();
  if (Number(consumed?.meta?.changes || 0) !== 1) return error('REGISTRATION_CHALLENGE_USED', 'The registration challenge has already been used.', 409);
  const tokenId = `agt_${crypto.randomUUID().replaceAll('-', '')}`;
  const apiToken = `ml_live_${randomToken(32)}`;
  const tokenHash = await sha256(apiToken);
  const agentName = String(body.agent_name || 'generic-agent').slice(0, 80);
  const client = String(body.client || 'unknown').slice(0, 80);
  const clientVersion = String(body.client_version || 'unknown').slice(0, 32);
  const scopes = 'search,recommend,access';
  const createdAt = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO agent_tokens (id, token_hash, agent_name, client, client_version, scopes, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
  ).bind(tokenId, tokenHash, agentName, client, clientVersion, scopes, createdAt).run();
  return json({
    ok: true,
    token_id: tokenId,
    api_token: apiToken,
    scopes: scopesFrom(scopes),
    quotas: registrationQuotas(env),
    created_at: createdAt,
  }, 201);
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
      if (request.method === 'POST' && url.pathname === '/v1/register') return createRegistrationChallenge(request, env);
      if (request.method === 'POST' && url.pathname === '/v1/register/verify') return verifyRegistration(request, env);
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
      if (request.method === 'GET' && url.pathname === '/v1/search') {
        const authorization = await registeredRequest(request, env, 'search');
        if (authorization.response) return authorization.response;
        const query = url.searchParams.get('query'); if (!query) return error('MISSING_REQUIRED_OPTION', 'Missing query.');
        const explicitScene = url.searchParams.get('scene') || null; const scene = explicitScene || inferScene(query);
        const tracks = await searchTracks(env, query, { limit: url.searchParams.get('limit'), commercial_only: url.searchParams.get('commercial_only') === 'true', scene: scene || undefined, required_tags: conceptsFor(query).includes('no_vocals') ? ['no_vocals'] : [] });
        return json({ ok: true, query, scene, scene_inferred: Boolean(scene && !explicitScene), count: tracks.length, tracks, quota: authorization.quota });
      }
      if (request.method === 'POST' && url.pathname === '/v1/recommend') {
        const authorization = await registeredRequest(request, env, 'recommend');
        if (authorization.response) return authorization.response;
        const body = await request.json(); if (body.video) return error('REMOTE_VIDEO_UPLOAD_NOT_IMPLEMENTED', 'Send a textual video brief or request.');
        const explicitScene = body.scene || null; const scene = explicitScene || inferScene(unique([body.request, body.brief]).join('. '));
        const requestText = unique([SCENES[scene], body.request, body.brief]).join('. ');
        if (!requestText) return error('MISSING_INPUT', 'Provide request, brief, or scene.');
        const input = { request: requestText, duration: Number(body.duration || 0) || undefined, workflow_context: { platform: body.platform || 'makaron', content_type: body['content-type'], style: body.style, target: body.target } };
        input.workflow_context = Object.fromEntries(Object.entries(input.workflow_context).filter(([, value]) => value !== undefined));
        const intelligence = queryMusic(input, body.adapter || 'generic');
        const attributes = Object.values(intelligence.matched_attributes || {}).flatMap((value) => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [value]);
        const localQuery = unique([requestText, intelligence.profile_id, musicPrompt(intelligence), ...attributes.map(String)]).join(' ');
        const explicitRequest = unique([body.request, body.brief]).join('. ');
        const tracks = await searchTracks(env, localQuery, { limit: body.limit || 5, commercial_only: body['commercial-only'], scene: scene || undefined, required_tags: conceptsFor(explicitRequest).includes('no_vocals') ? ['no_vocals'] : [] });
        const recommendation = tracks[0] || null;
        return json({ ok: true, profile_id: intelligence.profile_id, intelligence, request: requestText, scene, scene_inferred: Boolean(scene && !explicitScene), duration_seconds: input.duration || null, count: tracks.length, recommendation, decision: recommendationDecision(recommendation), generation_prompt: musicPrompt(intelligence), tracks, quota: authorization.quota });
      }
      const access = url.pathname.match(/^\/v1\/tracks\/([^/]+)\/access$/);
      if (request.method === 'POST' && access) {
        const authorization = await registeredRequest(request, env, 'access');
        if (authorization.response) return authorization.response;
        const id = decodeURIComponent(access[1]); const row = await trackRow(env, id); if (!row) return error('TRACK_NOT_FOUND', 'Track not found.', 404);
        const ttl = Math.max(30, Math.min(Number(env.LINK_TTL_SECONDS || 900), 3600)); const expires = Math.floor(Date.now() / 1000) + ttl;
        const signature = await hmac(env.SIGNING_SECRET, `${id}:${expires}`);
        return json({ ok: true, track: safeTrack(row), url: `${url.origin}/v1/tracks/${encodeURIComponent(id)}/audio?expires=${expires}&signature=${signature}`, expires_at: new Date(expires * 1000).toISOString(), quota: authorization.quota });
      }
      return error('NOT_FOUND', 'API route not found.', 404);
    } catch (cause) {
      return error('UNEXPECTED_ERROR', cause instanceof Error ? cause.message : String(cause), 500);
    }
  },
};
