import crypto from 'node:crypto';
import http from 'node:http';
import { Readable } from 'node:stream';

const PORT = Number(process.env.PORT || 9000);
const UPSTREAM = new URL(process.env.MUSICLIB_UPSTREAM_URL || 'https://makaron-music-library-api.bzz0309.workers.dev');
const RELAY_SECRET = process.env.MUSICLIB_RELAY_SECRET || '';
const MAX_JSON_BODY_BYTES = 512 * 1024;

const ROUTES = [
  ['GET', /^\/v1\/health$/],
  ['POST', /^\/v1\/register$/],
  ['POST', /^\/v1\/register\/verify$/],
  ['GET', /^\/v1\/search$/],
  ['POST', /^\/v1\/recommend$/],
  ['POST', /^\/v1\/tracks\/[^/]+\/access$/],
  ['GET', /^\/v1\/tracks\/[^/]+\/audio$/],
];

function json(response, status, payload) {
  const body = `${JSON.stringify(payload)}\n`;
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  response.end(body);
}

function allowed(method, pathname) {
  return ROUTES.some(([routeMethod, pattern]) => method === routeMethod && pattern.test(pathname));
}

function firstHeaderValue(value) {
  return String(value || '').split(',')[0].trim();
}

function clientOrigin(request) {
  return firstHeaderValue(request.headers['x-forwarded-for'])
    || firstHeaderValue(request.headers['x-real-ip'])
    || request.socket.remoteAddress
    || 'unknown';
}

function relayProof(origin) {
  return crypto.createHmac('sha256', RELAY_SECRET).update(origin).digest('hex');
}

function registrationSession(request) {
  const value = String(request.headers['x-musiclib-registration-session'] || '');
  return /^[A-Za-z0-9_-]{32,128}$/.test(value) ? value : null;
}

function publicOrigin(request) {
  if (process.env.MUSICLIB_PUBLIC_BASE_URL) return new URL(process.env.MUSICLIB_PUBLIC_BASE_URL).origin;
  const host = firstHeaderValue(request.headers['x-forwarded-host']) || firstHeaderValue(request.headers.host);
  if (!/^[A-Za-z0-9.-]+(?::\d{1,5})?$/.test(host)) throw new Error('Invalid public host.');
  const forwardedProtocol = firstHeaderValue(request.headers['x-forwarded-proto']);
  const protocol = forwardedProtocol === 'http' && /^(127\.0\.0\.1|localhost)(?::\d+)?$/.test(host) ? 'http' : 'https';
  return `${protocol}://${host}`;
}

async function requestBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_JSON_BODY_BYTES) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

function upstreamHeaders(request) {
  const headers = new Headers();
  for (const name of ['accept', 'authorization', 'content-type', 'range', 'user-agent']) {
    const value = request.headers[name];
    if (value) headers.set(name, String(value));
  }
  const origin = clientOrigin(request);
  headers.set('x-musiclib-relay-origin', origin);
  headers.set('x-musiclib-relay-signature', relayProof(origin));
  const session = registrationSession(request);
  if (session) {
    headers.set('x-musiclib-registration-session', session);
    headers.set('x-musiclib-registration-session-signature', relayProof(`registration-session:${session}`));
  }
  return headers;
}

function responseHeaders(upstreamResponse) {
  const headers = {};
  for (const name of ['accept-ranges', 'cache-control', 'content-length', 'content-range', 'content-type', 'etag', 'retry-after']) {
    const value = upstreamResponse.headers.get(name);
    if (value) headers[name] = value;
  }
  return headers;
}

function rewrittenAccessBody(body, request) {
  if (!body || typeof body !== 'object' || typeof body.url !== 'string') return body;
  const upstreamAudioPrefix = `${UPSTREAM.origin}/v1/tracks/`;
  if (!body.url.startsWith(upstreamAudioPrefix) || !body.url.includes('/audio?')) return body;
  const target = new URL(body.url);
  return { ...body, url: `${publicOrigin(request)}${target.pathname}${target.search}` };
}

async function proxy(request, response) {
  if (!RELAY_SECRET) return json(response, 503, { ok: false, error: { code: 'RELAY_NOT_CONFIGURED', message: 'Relay authentication is not configured.' } });
  const incoming = new URL(request.url, 'http://relay.local');
  if (!allowed(request.method, incoming.pathname)) return json(response, 404, { ok: false, error: { code: 'NOT_FOUND', message: 'API route not found.' } });

  const target = new URL(`${incoming.pathname}${incoming.search}`, UPSTREAM);
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await requestBody(request);
  const upstreamResponse = await fetch(target, {
    method: request.method,
    headers: upstreamHeaders(request),
    body,
    redirect: 'manual',
  });

  const contentType = upstreamResponse.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const payload = rewrittenAccessBody(await upstreamResponse.json(), request);
    return json(response, upstreamResponse.status, payload);
  }

  response.writeHead(upstreamResponse.status, responseHeaders(upstreamResponse));
  if (!upstreamResponse.body) return response.end();
  Readable.fromWeb(upstreamResponse.body).pipe(response);
}

export function createServer() {
  return http.createServer((request, response) => {
    proxy(request, response).catch((cause) => {
      if (!response.headersSent) json(response, 502, { ok: false, error: { code: 'UPSTREAM_UNREACHABLE', message: cause instanceof Error ? cause.message : String(cause) } });
      else response.destroy(cause);
    });
  });
}

if (process.env.MUSICLIB_RELAY_NO_LISTEN !== '1') {
  createServer().listen(PORT, '0.0.0.0');
}
