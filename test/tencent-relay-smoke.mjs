import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const relayFile = path.join(root, 'tencent-relay', 'app.mjs');
const upstreamPort = 23000 + (process.pid % 500);
const relayPort = upstreamPort + 500;
const upstreamOrigin = `http://127.0.0.1:${upstreamPort}`;
const relayOrigin = `http://127.0.0.1:${relayPort}`;
const relaySecret = 'relay-smoke-secret';
const clientIp = '203.0.113.9';
let relayHeaders;

const upstream = http.createServer(async (request, response) => {
  if (request.url === '/v1/health') {
    response.setHeader('content-type', 'application/json');
    return response.end(JSON.stringify({ ok: true, service: 'upstream' }));
  }
  if (request.url === '/v1/register') {
    relayHeaders = request.headers;
    response.setHeader('content-type', 'application/json');
    return response.end(JSON.stringify({ ok: true, challenge_id: 'relay-challenge' }));
  }
  if (request.url === '/v1/tracks/trk_1/access') {
    response.setHeader('content-type', 'application/json');
    return response.end(JSON.stringify({ ok: true, url: `${upstreamOrigin}/v1/tracks/trk_1/audio?expires=9999999999&signature=test` }));
  }
  if (request.url?.startsWith('/v1/tracks/trk_1/audio?')) {
    assert.equal(request.headers.range, 'bytes=0-3');
    response.writeHead(206, { 'content-type': 'audio/mpeg', 'content-range': 'bytes 0-3/10', 'content-length': '4', 'accept-ranges': 'bytes' });
    return response.end('test');
  }
  response.writeHead(404, { 'content-type': 'application/json' });
  response.end(JSON.stringify({ ok: false }));
});

async function waitForRelay() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${relayOrigin}/v1/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Relay did not start.');
}

await new Promise((resolve) => upstream.listen(upstreamPort, '127.0.0.1', resolve));
const relay = spawn(process.execPath, [relayFile], {
  env: {
    ...process.env,
    PORT: String(relayPort),
    MUSICLIB_UPSTREAM_URL: upstreamOrigin,
    MUSICLIB_RELAY_SECRET: relaySecret,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

try {
  await waitForRelay();
  const registration = await fetch(`${relayOrigin}/v1/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': clientIp },
    body: '{}',
  });
  assert.equal(registration.status, 200);
  assert.equal(relayHeaders['x-musiclib-relay-origin'], clientIp);
  assert.equal(relayHeaders['x-musiclib-relay-signature'], crypto.createHmac('sha256', relaySecret).update(clientIp).digest('hex'));

  const access = await fetch(`${relayOrigin}/v1/tracks/trk_1/access`, {
    method: 'POST',
    headers: { authorization: 'Bearer test', 'x-forwarded-proto': 'http' },
  });
  const accessBody = await access.json();
  assert.equal(accessBody.url, `${relayOrigin}/v1/tracks/trk_1/audio?expires=9999999999&signature=test`);

  const audio = await fetch(accessBody.url, { headers: { range: 'bytes=0-3' } });
  assert.equal(audio.status, 206);
  assert.equal(audio.headers.get('content-range'), 'bytes 0-3/10');
  assert.equal(await audio.text(), 'test');

  const admin = await fetch(`${relayOrigin}/v1/admin/tracks/batch`, { method: 'POST', body: '{}' });
  assert.equal(admin.status, 404);
  console.log('Tencent relay smoke test passed');
} finally {
  relay.kill('SIGTERM');
  await new Promise((resolve) => upstream.close(resolve));
}
