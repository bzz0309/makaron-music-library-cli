import assert from 'node:assert/strict';
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
    id: 'trk_calm', title: 'Calm Piano', artist: null, album: null,
    object_key: 'audio/trk_calm.mp3', source: 'test', size_bytes: 10, duration_seconds: 30,
    tags_json: JSON.stringify(['healing', 'piano', 'no_vocals']), description: 'gentle healing background',
    license: 'unknown', commercial_use: null, modified_at: '2026-07-16T00:00:00Z',
    search_text: 'calm piano gentle healing background no_vocals',
  },
];

class FakeStatement {
  constructor(sql) { this.sql = sql; this.params = []; }
  bind(...params) { this.params = params; return this; }
  async all() {
    const terms = this.params.map((value) => String(value).replaceAll('%', '').toLowerCase());
    const commercialOnly = this.sql.includes('commercial_use = 1');
    return { results: rows.filter((row) => (!commercialOnly || row.commercial_use === 1) && terms.some((term) => row.search_text.includes(term))) };
  }
  async first() { return rows.find((row) => row.id === this.params[0]) || null; }
}

const env = {
  AGENT_TOKENS: 'test-agent-token',
  SIGNING_SECRET: 'test-signing-secret',
  LINK_TTL_SECONDS: '900',
  DB: { prepare: (sql) => new FakeStatement(sql) },
  MUSIC: {
    async get(key, options) {
      if (key !== 'audio/trk_kpop.mp3') return null;
      const audio = 'remote audio fixture';
      const range = options?.range;
      const body = range ? audio.slice(range.offset, range.offset + range.length) : audio;
      return { body, size: audio.length, httpEtag: '"test"', httpMetadata: { contentType: 'audio/mpeg' } };
    },
  },
};

async function payload(response) { return JSON.parse(await response.text()); }
function request(path, options = {}) { return new Request(`https://music.example.com${path}`, options); }
function authorized(path, options = {}) {
  return request(path, { ...options, headers: { authorization: 'Bearer test-agent-token', ...(options.headers || {}) } });
}

const health = await worker.fetch(request('/v1/health'), env);
assert.equal(health.status, 200);
assert.equal((await payload(health)).storage, 'r2');

const rejected = await worker.fetch(request('/v1/search?query=kpop'), env);
assert.equal(rejected.status, 401);

const searched = await worker.fetch(authorized('/v1/search?query=K-pop%20stage'), env);
const searchBody = await payload(searched);
assert.equal(searchBody.count, 1);
assert.equal(searchBody.tracks[0].id, 'trk_kpop');
assert.equal('object_key' in searchBody.tracks[0], false);

const recommended = await worker.fetch(authorized('/v1/recommend', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ scene: 'kpop-stage', duration: 20, adapter: 'makaron' }),
}), env);
const recommendBody = await payload(recommended);
assert.equal(recommendBody.profile_id, 'kpop_performance_001');
assert.equal(recommendBody.recommendation.id, 'trk_kpop');

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
