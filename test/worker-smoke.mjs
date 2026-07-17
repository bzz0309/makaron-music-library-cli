import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import worker from '../worker/index.js';

const rows = [
  {
    id: 'trk_kpop', title: 'High Energy Girl Group', artist: 'Test Artist', album: 'K-pop Stage',
    object_key: 'audio/trk_kpop.mp3', source: 'test', size_bytes: 20, duration_seconds: 20,
    tags_json: JSON.stringify(['kpop', 'dance', 'energetic', 'electronic']), description: 'K-pop stage dance performance',
    license: 'test-commercial', commercial_use: 1, modified_at: '2026-07-16T00:00:00Z',
    search_text: 'high energy girl group test artist k-pop stage kpop dance energetic electronic performance',
  },
  {
    id: 'trk_generic_dance', title: 'Generic Viral Dance Pop', artist: 'DJ Test', album: null,
    object_key: 'audio/trk_generic_dance.mp3', source: 'test', size_bytes: 16, duration_seconds: 180,
    tags_json: JSON.stringify(['dance', 'pop', 'trending']), description: 'viral dance pop stage track',
    license: 'unknown', commercial_use: null, modified_at: '2026-07-16T00:00:00Z',
    search_text: 'generic viral dance pop dj stage trending girl group strong beat climax',
  },
  {
    id: 'trk_calm', title: 'Calm Piano', artist: null, album: null,
    object_key: 'audio/trk_calm.mp3', source: 'test', size_bytes: 10, duration_seconds: 30,
    tags_json: JSON.stringify(['healing', 'piano', 'no_vocals']), description: 'gentle healing background',
    license: 'unknown', commercial_use: null, modified_at: '2026-07-16T00:00:00Z',
    search_text: 'calm piano gentle healing background no_vocals',
  },
  {
    id: 'trk_bgm', title: 'Catchy Product BGM', artist: null, album: null,
    object_key: 'audio/trk_bgm.mp3', source: 'test', size_bytes: 18, duration_seconds: 15,
    tags_json: JSON.stringify(['bgm', 'trending', 'no_vocals']), description: 'clean modern ecommerce marketing background',
    license: 'unknown', commercial_use: null, modified_at: '2026-07-16T00:00:00Z',
    search_text: 'catchy product bgm clean modern ecommerce marketing background trending no_vocals',
  },
];

const challenges = [];
const agentTokens = [];
const usage = new Map();

class FakeStatement {
  constructor(sql) { this.sql = sql; this.params = []; }
  bind(...params) { this.params = params; return this; }
  async all() {
    const terms = this.params.map((value) => String(value).replaceAll('%', '').toLowerCase());
    const commercialOnly = this.sql.includes('commercial_use = 1');
    const tagQuery = this.sql.includes('tags_json LIKE');
    return { results: rows.filter((row) => (!commercialOnly || row.commercial_use === 1) && terms.some((term) => {
      const normalized = term.replaceAll('"', '');
      return tagQuery ? JSON.parse(row.tags_json).includes(normalized) : row.search_text.includes(normalized);
    })) };
  }
  async first() {
    if (this.sql.includes('COUNT(*) AS count FROM registration_challenges')) {
      return { count: challenges.filter((item) => item.ip_hash === this.params[0]).length };
    }
    if (this.sql.includes('FROM registration_challenges WHERE id')) return challenges.find((item) => item.id === this.params[0]) || null;
    if (this.sql.includes('FROM agent_tokens WHERE token_hash')) return agentTokens.find((item) => item.token_hash === this.params[0]) || null;
    if (this.sql.includes('FROM agent_usage')) {
      const item = usage.get(`${this.params[0]}:${this.params[1]}`) || { search_count: 0, recommend_count: 0, access_count: 0 };
      const column = this.sql.match(/SELECT (search_count|recommend_count|access_count) AS count/)?.[1];
      return { count: item[column] };
    }
    return rows.find((row) => row.id === this.params[0]) || null;
  }
  async run() {
    if (this.sql.startsWith('INSERT INTO registration_challenges')) {
      challenges.push({ id: this.params[0], nonce: this.params[1], difficulty: this.params[2], ip_hash: this.params[3], session_hash: this.params[4], expires_at: this.params[5], used_at: null });
      return { meta: { changes: 1 } };
    }
    if (this.sql.startsWith('UPDATE registration_challenges')) {
      const item = challenges.find((challenge) => challenge.id === this.params[0] && !challenge.used_at);
      if (!item) return { meta: { changes: 0 } };
      item.used_at = new Date().toISOString();
      return { meta: { changes: 1 } };
    }
    if (this.sql.includes('INSERT INTO agent_tokens')) {
      agentTokens.push({ id: this.params[0], token_hash: this.params[1], agent_name: this.params[2], client: this.params[3], client_version: this.params[4], scopes: this.params[5], status: 'active' });
      return { meta: { changes: 1 } };
    }
    if (this.sql.includes('INSERT INTO agent_usage')) {
      const key = `${this.params[0]}:${this.params[1]}`;
      const item = usage.get(key) || { search_count: 0, recommend_count: 0, access_count: 0 };
      const column = this.sql.match(/usage_day, (search_count|recommend_count|access_count)/)?.[1];
      item[column] += 1;
      usage.set(key, item);
      return { meta: { changes: 1 } };
    }
    throw new Error(`Unhandled fake run statement: ${this.sql}`);
  }
}

const env = {
  AGENT_TOKENS: 'test-agent-token',
  ADMIN_TOKEN: 'test-admin-token',
  SIGNING_SECRET: 'test-signing-secret',
  RELAY_SHARED_SECRET: 'test-relay-secret',
  LINK_TTL_SECONDS: '900',
  DAILY_SEARCH_LIMIT: '1',
  DB: { prepare: (sql) => new FakeStatement(sql) },
  MUSIC: {
    async put(key, body) {
      const text = await new Response(body).text();
      assert.equal(key, 'audio/trk_upload.mp3');
      assert.equal(text, 'uploaded audio');
      return { httpEtag: '"uploaded"' };
    },
    async get(key, options) {
      if (key !== 'audio/trk_kpop.mp3') return null;
      const audio = 'remote audio fixture';
      const range = options?.range;
      const body = range ? audio.slice(range.offset, range.offset + range.length) : audio;
      return { body, size: audio.length, httpEtag: '"test"', httpMetadata: { contentType: 'audio/mpeg' } };
    },
  },
};
env.DB.batch = async (statements) => {
  for (const statement of statements) {
    const values = statement.params;
    const row = Object.fromEntries([
      'id', 'title', 'artist', 'album', 'object_key', 'source', 'size_bytes', 'duration_seconds',
      'tags_json', 'description', 'license', 'commercial_use', 'modified_at', 'search_text',
    ].map((key, index) => [key, values[index]]));
    const current = rows.findIndex((item) => item.id === row.id);
    if (current >= 0) rows[current] = row; else rows.push(row);
  }
  return statements.map(() => ({ success: true }));
};

async function payload(response) { return JSON.parse(await response.text()); }
function request(path, options = {}) { return new Request(`https://music.example.com${path}`, options); }
function authorized(path, options = {}) {
  return request(path, { ...options, headers: { authorization: 'Bearer test-agent-token', ...(options.headers || {}) } });
}
function solve(challenge) {
  const prefix = '0'.repeat(challenge.difficulty);
  for (let solution = 0; ; solution += 1) {
    if (crypto.createHash('sha256').update(`${challenge.nonce}:${solution}`).digest('hex').startsWith(prefix)) return String(solution);
  }
}

const health = await worker.fetch(request('/v1/health'), env);
assert.equal(health.status, 200);
assert.equal((await payload(health)).storage, 'r2');

const rejected = await worker.fetch(request('/v1/search?query=kpop'), env);
assert.equal(rejected.status, 401);

const registrationHeaders = { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.7' };
const challengeResponse = await worker.fetch(request('/v1/register', {
  method: 'POST', headers: registrationHeaders, body: JSON.stringify({ agent_name: 'test-agent' }),
}), env);
assert.equal(challengeResponse.status, 200);
const challengeBody = await payload(challengeResponse);
const registrationResponse = await worker.fetch(request('/v1/register/verify', {
  method: 'POST',
  headers: registrationHeaders,
  body: JSON.stringify({ challenge_id: challengeBody.challenge_id, solution: solve(challengeBody.challenge), agent_name: 'test-agent', client: 'test-cli', client_version: '0.2.0' }),
}), env);
assert.equal(registrationResponse.status, 201);
const registrationBody = await payload(registrationResponse);
assert.match(registrationBody.api_token, /^ml_live_/);
assert.equal(agentTokens[0].token_hash, crypto.createHash('sha256').update(registrationBody.api_token).digest('hex'));
assert.equal(agentTokens[0].token_hash.includes(registrationBody.api_token), false);

const relayOrigin = '198.51.100.22';
const relayVerifyOrigin = '198.51.100.23';
const relaySession = 'relay_registration_session_1234567890abcdef';
const relaySignature = crypto.createHmac('sha256', env.RELAY_SHARED_SECRET).update(relayOrigin).digest('hex');
const relayVerifySignature = crypto.createHmac('sha256', env.RELAY_SHARED_SECRET).update(relayVerifyOrigin).digest('hex');
const relaySessionSignature = crypto.createHmac('sha256', env.RELAY_SHARED_SECRET).update(`registration-session:${relaySession}`).digest('hex');
const relayChallengeResponse = await worker.fetch(request('/v1/register', {
  method: 'POST',
  headers: {
    'cf-connecting-ip': '192.0.2.10',
    'x-musiclib-relay-origin': relayOrigin,
    'x-musiclib-relay-signature': relaySignature,
    'x-musiclib-registration-session': relaySession,
    'x-musiclib-registration-session-signature': relaySessionSignature,
  },
  body: '{}',
}), env);
const relayChallenge = await payload(relayChallengeResponse);
const relayRegistrationResponse = await worker.fetch(request('/v1/register/verify', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'cf-connecting-ip': '192.0.2.11',
    'x-musiclib-relay-origin': relayVerifyOrigin,
    'x-musiclib-relay-signature': relayVerifySignature,
    'x-musiclib-registration-session': relaySession,
    'x-musiclib-registration-session-signature': relaySessionSignature,
  },
  body: JSON.stringify({ challenge_id: relayChallenge.challenge_id, solution: solve(relayChallenge.challenge) }),
}), env);
assert.equal(relayRegistrationResponse.status, 201);

const registeredSearch = await worker.fetch(request('/v1/search?query=kpop', {
  headers: { authorization: `Bearer ${registrationBody.api_token}` },
}), env);
assert.equal(registeredSearch.status, 200);
const registeredSearchBody = await payload(registeredSearch);
assert.equal(registeredSearchBody.quota.remaining, 0);
const quotaRejected = await worker.fetch(request('/v1/search?query=kpop', {
  headers: { authorization: `Bearer ${registrationBody.api_token}` },
}), env);
assert.equal(quotaRejected.status, 429);

const rejectedAdmin = await worker.fetch(authorized('/v1/admin/tracks/trk_upload/audio?extension=mp3', {
  method: 'PUT', headers: { 'content-length': '14' }, body: 'uploaded audio',
}), env);
assert.equal(rejectedAdmin.status, 401);

const uploaded = await worker.fetch(request('/v1/admin/tracks/trk_upload/audio?extension=mp3', {
  method: 'PUT',
  headers: { authorization: 'Bearer test-admin-token', 'content-length': '14', 'content-type': 'audio/mpeg' },
  body: 'uploaded audio',
}), env);
assert.equal(uploaded.status, 200);

const indexed = await worker.fetch(request('/v1/admin/tracks/batch', {
  method: 'POST',
  headers: { authorization: 'Bearer test-admin-token', 'content-type': 'application/json' },
  body: JSON.stringify({ tracks: [{
    id: 'trk_upload', title: 'Uploaded Track', artist: 'Owner', extension: 'mp3', size_bytes: 14,
    duration_seconds: 12, tags: ['test'], license: 'unknown', commercial_use: null,
  }] }),
}), env);
assert.equal(indexed.status, 200);
assert.equal(rows.some((row) => row.id === 'trk_upload'), true);

const searched = await worker.fetch(authorized('/v1/search?query=K-pop%20stage'), env);
const searchBody = await payload(searched);
assert.equal(searchBody.scene, 'kpop-stage');
assert.equal(searchBody.scene_inferred, true);
assert.equal(searchBody.count, 1);
assert.equal(searchBody.tracks[0].id, 'trk_kpop');
assert.equal(searchBody.tracks[0].match.scene, 'kpop-stage');
assert.ok(searchBody.tracks[0].match.matched.includes('scene:kpop'));
assert.equal('object_key' in searchBody.tracks[0], false);

const sceneSearch = await worker.fetch(authorized('/v1/search?query=dance%20pop%20stage&scene=kpop-stage&limit=5'), env);
const sceneSearchBody = await payload(sceneSearch);
assert.equal(sceneSearchBody.count, 1);
assert.equal(sceneSearchBody.tracks[0].id, 'trk_kpop');
assert.ok(sceneSearchBody.tracks[0].match.matched.includes('scene:kpop'));

const recommended = await worker.fetch(authorized('/v1/recommend', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ scene: 'kpop-stage', duration: 20, adapter: 'makaron' }),
}), env);
const recommendBody = await payload(recommended);
assert.equal(recommendBody.profile_id, 'kpop_performance_001');
assert.equal(recommendBody.recommendation.id, 'trk_kpop');

const naturalRecommendation = await worker.fetch(authorized('/v1/recommend', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ request: '20秒 K-pop 女团舞台，节奏强，适合灯光切换，副歌有高潮', duration: 20 }),
}), env);
const naturalBody = await payload(naturalRecommendation);
assert.equal(naturalBody.scene, 'kpop-stage');
assert.equal(naturalBody.scene_inferred, true);
assert.equal(naturalBody.recommendation.id, 'trk_kpop');
assert.ok(naturalBody.tracks.every((track) => track.tags.includes('kpop')));

const ecommerce = await worker.fetch(authorized('/v1/recommend', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ scene: 'ecommerce', duration: 15, adapter: 'video_editor' }),
}), env);
const ecommerceBody = await payload(ecommerce);
assert.equal(ecommerceBody.recommendation.id, 'trk_bgm');

const access = await worker.fetch(authorized('/v1/tracks/trk_kpop/access', { method: 'POST' }), env);
const accessBody = await payload(access);
assert.match(accessBody.url, /^https:\/\/music\.example\.com\/v1\/tracks\/trk_kpop\/audio/);

const audio = await worker.fetch(new Request(accessBody.url), env);
assert.equal(audio.status, 200);
assert.equal(await audio.text(), 'remote audio fixture');

const partialAudio = await worker.fetch(new Request(accessBody.url, { headers: { range: 'bytes=0-5' } }), env);
assert.equal(partialAudio.status, 206);
assert.equal(partialAudio.headers.get('content-range'), 'bytes 0-5/20');
assert.equal(await partialAudio.text(), 'remote');

const invalidRange = await worker.fetch(new Request(accessBody.url, { headers: { range: 'bytes=999-1000' } }), env);
assert.equal(invalidRange.status, 416);

const invalidAudio = await worker.fetch(request('/v1/tracks/trk_kpop/audio?expires=1&signature=bad'), env);
assert.equal(invalidAudio.status, 401);

console.log('Cloudflare Worker smoke test passed');
