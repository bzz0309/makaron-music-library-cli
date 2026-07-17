import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'musiclib.mjs');
const home = fs.mkdtempSync(path.join(os.tmpdir(), 'musiclib-register-smoke-'));
const port = 21000 + (process.pid % 1000);
const apiUrl = `http://127.0.0.1:${port}`;
const nonce = 'registration-smoke-nonce';
const issuedToken = 'ml_live_registration_smoke_secret';
let challengeRequests = 0;
let verifyRequests = 0;
let registrationSession = null;

function expectedSolution() {
  for (let solution = 0; ; solution += 1) {
    if (crypto.createHash('sha256').update(`${nonce}:${solution}`).digest('hex').startsWith('00')) return String(solution);
  }
}

const server = http.createServer(async (request, response) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
  response.setHeader('content-type', 'application/json');
  if (request.url === '/v1/register') {
    challengeRequests += 1;
    registrationSession = request.headers['x-musiclib-registration-session'];
    assert.match(registrationSession, /^[A-Za-z0-9_-]{32,128}$/);
    response.end(JSON.stringify({ ok: true, challenge_id: 'challenge-1', challenge: { algorithm: 'sha256-prefix', nonce, difficulty: 2 } }));
    return;
  }
  if (request.url === '/v1/register/verify') {
    verifyRequests += 1;
    assert.equal(request.headers['x-musiclib-registration-session'], registrationSession);
    assert.equal(body.solution, expectedSolution());
    response.statusCode = 201;
    response.end(JSON.stringify({ ok: true, token_id: 'agt_smoke', api_token: issuedToken, scopes: ['search', 'recommend', 'access'], quotas: { search_per_day: 200 } }));
    return;
  }
  response.statusCode = 404;
  response.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'not found' } }));
});

function run(args, env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, ...args], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
}

await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
try {
  const env = { ...process.env, HOME: home };
  delete env.MUSICLIB_API_TOKEN;
  delete env.MUSICLIB_API_URL;
  const first = await run(['register', '--api-url', apiUrl, '--agent', 'smoke-agent'], env);
  assert.equal(first.status, 0, first.stderr);
  assert.equal(first.stdout.includes(issuedToken), false);
  const result = JSON.parse(first.stdout);
  assert.equal(result.registered, true);
  const authFile = path.join(home, '.musiclib', 'auth.json');
  const auth = JSON.parse(fs.readFileSync(authFile, 'utf8'));
  assert.equal(auth.api_token, issuedToken);
  if (process.platform !== 'win32') assert.equal(fs.statSync(authFile).mode & 0o777, 0o600);

  const second = await run(['register'], env);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(JSON.parse(second.stdout).reused, true);
  assert.equal(challengeRequests, 1);
  assert.equal(verifyRequests, 1);
  console.log('Agent self-registration smoke test passed');
} finally {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(home, { recursive: true, force: true });
}
