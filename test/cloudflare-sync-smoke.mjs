import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { syncCloudflare } from '../bin/cloudflare-sync.mjs';

const library = fs.mkdtempSync(path.join(os.tmpdir(), 'musiclib-cloud-sync-'));
const audio = path.join(library, 'fixture.mp3');
fs.writeFileSync(audio, 'fake audio');
fs.writeFileSync(path.join(library, 'tracks.json'), JSON.stringify([{
  id: 'fixture-track',
  title: 'Fixture Track',
  artist: 'Test Artist',
  album: null,
  path: audio,
  source: 'test',
  size_bytes: 10,
  duration_seconds: 15,
  tags: ['kpop', 'energetic'],
  description: 'Cloud sync fixture',
  license: 'unknown',
  commercial_use: null,
  modified_at: '2026-07-16T00:00:00Z',
}]));

const result = await syncCloudflare({
  library,
  accountId: 'test-account',
  databaseId: '00000000-0000-0000-0000-000000000000',
  bucket: 'test-bucket',
  dryRun: true,
});

assert.equal(result.ok, true);
assert.equal(result.dry_run, true);
assert.equal(result.tracks, 1);
assert.equal(result.bytes, 10);
assert.equal(result.bucket, 'test-bucket');

const originalFetch = globalThis.fetch;
const calls = [];
globalThis.fetch = async (url, options) => {
  if (options.body && typeof options.body[Symbol.asyncIterator] === 'function') {
    for await (const _chunk of options.body) {}
  }
  calls.push({ url: String(url), method: options.method, body: options.body });
  return new Response(JSON.stringify(options.method === 'PUT' ? { ok: true, id: 'fixture-track' } : { ok: true, indexed: 1 }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
process.env.MUSICLIB_ADMIN_TOKEN = 'test-admin-token';
const workerResult = await syncCloudflare({
  library,
  apiUrl: 'https://music.example.com',
  concurrency: 1,
});
delete process.env.MUSICLIB_ADMIN_TOKEN;
globalThis.fetch = originalFetch;

assert.equal(workerResult.transport, 'worker-admin');
assert.equal(workerResult.uploaded, 1);
assert.equal(calls.length, 2);
assert.match(calls[0].url, /\/v1\/admin\/tracks\/fixture-track\/audio\?extension=mp3$/);
assert.match(calls[1].url, /\/v1\/admin\/tracks\/batch$/);

fs.rmSync(library, { recursive: true, force: true });
console.log('Cloudflare sync smoke test passed');
