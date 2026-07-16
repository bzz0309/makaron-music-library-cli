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

fs.rmSync(library, { recursive: true, force: true });
console.log('Cloudflare sync smoke test passed');
