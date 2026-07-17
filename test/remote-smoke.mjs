import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'musiclib.mjs');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'musiclib-remote-smoke-'));
const library = path.join(temp, 'library');
const source = path.join(temp, 'music');
const token = 'test-agent-token';
const port = 19000 + (process.pid % 1000);
const apiUrl = `http://127.0.0.1:${port}`;

function call(args, env = {}, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', env: { ...process.env, ...env } });
  assert.equal(result.status, expectedStatus, `${args.join(' ')}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  return result.stdout.trim() ? JSON.parse(result.stdout) : JSON.parse(result.stderr);
}

let server;
let serverErrors = '';
try {
  fs.mkdirSync(source, { recursive: true });
  const audio = path.join(source, 'K-pop Stage Beat.mp3');
  fs.writeFileSync(audio, 'remote audio fixture');
  fs.writeFileSync(`${audio}.music.json`, JSON.stringify({ tags: ['kpop', 'dance', 'energetic'], license: 'test-license', commercial_use: true }));
  call(['init', '--library', library]);
  call(['index', '--library', library, '--source', source]);

  server = spawn(process.execPath, [cli, 'serve', '--library', library, '--port', String(port)], {
    env: { ...process.env, MUSICLIB_SERVER_TOKEN: token },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  server.stderr.on('data', (chunk) => { serverErrors += chunk.toString(); });
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const health = await fetch(`${apiUrl}/v1/health`, { headers: { authorization: `Bearer ${token}` } });
      if (health.ok) { ready = true; break; }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.equal(ready, true, `remote server did not become ready\n${serverErrors}`);
  const publicHealth = await fetch(`${apiUrl}/v1/health`);
  assert.equal(publicHealth.status, 200);

  const remoteEnv = { MUSICLIB_API_URL: apiUrl, MUSICLIB_API_TOKEN: token };
  const searched = call(['search', '--query', 'K-pop stage'], remoteEnv);
  assert.equal(searched.count, 1);
  assert.equal(searched.scene_inferred, true);
  assert.equal('path' in searched.tracks[0], false);

  const recommended = call(['recommend', '--scene', 'kpop-stage', '--duration', '20'], remoteEnv);
  assert.equal(recommended.recommendation.id, searched.tracks[0].id);
  assert.equal('path' in recommended.recommendation, false);

  const access = call(['access', '--track', searched.tracks[0].id], remoteEnv);
  assert.match(access.url, /^http:\/\/127\.0\.0\.1:/);
  const downloaded = await fetch(access.url);
  assert.equal(downloaded.status, 200);
  assert.equal(await downloaded.text(), 'remote audio fixture');

  const fakeBin = path.join(temp, 'bin'); fs.mkdirSync(fakeBin, { recursive: true });
  const fakeProbe = path.join(fakeBin, 'ffprobe');
  const fakeFfmpeg = path.join(fakeBin, 'ffmpeg');
  fs.writeFileSync(fakeProbe, '#!/bin/sh\nif [ "$1" = "-version" ]; then exit 0; fi\nprintf \'%s\\n\' \'{"format":{"duration":"20"},"streams":[{"codec_type":"video"},{"codec_type":"audio"}]}\'\n', { mode: 0o755 });
  fs.writeFileSync(fakeFfmpeg, '#!/bin/sh\nif [ "$1" = "-version" ]; then exit 0; fi\nfor last do :; done\nprintf \'mixed video fixture\' > "$last"\n', { mode: 0o755 });
  const mixedOutput = path.join(temp, 'mixed.mp4');
  const mixed = call(['soundtrack-remote', '--video-url', access.url, '--scene', 'kpop-stage', '--output', mixedOutput], { ...remoteEnv, PATH: `${fakeBin}:${process.env.PATH}` });
  assert.equal(mixed.ok, true);
  assert.equal(mixed.track.id, searched.tracks[0].id);
  assert.equal(mixed.mix.original_audio_preserved, true);
  assert.equal(fs.readFileSync(mixedOutput, 'utf8'), 'mixed video fixture');

  const unauthorized = call(['search', '--query', 'K-pop'], { MUSICLIB_API_URL: apiUrl, MUSICLIB_API_TOKEN: 'wrong' }, 1);
  assert.equal(unauthorized.error.code, 'UNAUTHORIZED');
  console.log('Remote music library API smoke test passed');
} finally {
  if (server) {
    server.kill('SIGTERM');
    server.unref();
  }
  fs.rmSync(temp, { recursive: true, force: true });
}
