#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const VERSION = '0.3.0';
const PACKAGE = 'makaron-music-library-cli';
const MAKARON_VERSION = '0.13.0';
const CONFIG_FILE = path.join(os.homedir(), '.musiclib', 'config.json');
const AUTH_FILE = path.join(os.homedir(), '.musiclib', 'auth.json');
const DEFAULT_API_URL = 'https://1358141432-dnfx3j6t7j.ap-hongkong.tencentscf.com';
const API_VERSION = 'v1';
const require = createRequire(import.meta.url);
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.opus', '.aiff', '.aif']);
const CONCEPTS = {
  calm: ['calm', 'gentle', 'soft', 'peaceful', 'relax', '安静', '平静', '轻柔', '舒缓'],
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
  orchestral: ['orchestral', 'strings', 'symphony', '管弦', '弦乐', '交响'],
  rock: ['rock', '摇滚'],
  ambient: ['ambient', 'atmosphere', '氛围', '环境'],
  vlog: ['vlog', 'daily', 'lifestyle', '日常', '生活'],
  commercial: ['commercial', 'corporate', 'business', '广告', '商务', '企业'],
  no_vocals: ['instrumental', 'no vocals', '纯音乐', '无歌词', '无人声'],
};
const SCENE_PROFILES = {
  'kpop-stage': {
    label: 'K-pop stage performance',
    brief: 'K-pop stage performance, high energy dance-pop, electronic production, strong beat, clear build and performance climax',
    target_bpm: [118, 140], vocals: 'optional',
    weights: { kpop: 18, dance: 6, energetic: 5, electronic: 4, pop: 3, trending: 2 },
    avoid: { calm: 3, ambient: 3 },
  },
  ecommerce: {
    label: 'E-commerce marketing video',
    brief: 'e-commerce product marketing, clean catchy background music, clear rhythm, upbeat modern production, product-focused, minimal or no vocals',
    target_bpm: [100, 128], vocals: 'prefer-none',
    weights: { product: 9, bgm: 14, happy: 4, electronic: 3, trending: 3, no_vocals: 5, pop: 2 },
    avoid: { sad: 4, tense: 2 },
  },
};
const SCENE_REQUIRED_TAGS = { 'kpop-stage': ['kpop'] };

class CliError extends Error {
  constructor(code, message, retryable = false, details = {}) {
    super(message); this.code = code; this.retryable = retryable; this.details = details;
  }
}

function now() { return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); }
function emit(value) { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`); }
function fail(code, message, retryable = false, details = {}) { throw new CliError(code, message, retryable, details); }
function readJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { fail('INVALID_JSON', `Cannot read ${file}: ${error.message}`); } }
function writeJson(file, value, mode) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, mode ? { mode } : undefined);
  if (mode) fs.chmodSync(file, mode);
}
function redact(value) {
  if (typeof value === 'string') {
    return value
      .replace(/mk_(?:live|test)?_?[A-Za-z0-9_-]{8,}/g, '[REDACTED_MAKARON_KEY]')
      .replace(/ml_(?:live|test)_?[A-Za-z0-9_-]{8,}/g, '[REDACTED_MUSICLIB_TOKEN]');
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redact(item)]));
  return value;
}
function slug(value) { return String(value || '').normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 64); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function splitList(value) { return unique(String(value || '').split(',').map((item) => item.trim().toLowerCase())); }
function rootFor(options) { return path.resolve(options.library || process.env.MUSICLIB_LIBRARY || path.join(os.homedir(), '.musiclib')); }
function loadConfig() { return fs.existsSync(CONFIG_FILE) ? readJson(CONFIG_FILE) : {}; }
function loadAuth() { return fs.existsSync(AUTH_FILE) ? readJson(AUTH_FILE) : {}; }
function apiUrlFor(options) {
  const value = options['api-url'] || process.env.MUSICLIB_API_URL || loadConfig().api_url;
  return value ? String(value).replace(/\/+$/, '') : null;
}
function apiToken() { return process.env.MUSICLIB_API_TOKEN || loadAuth().api_token || null; }
function useLocal(options) { return Boolean(options.local || options.library || process.env.MUSICLIB_MODE === 'local'); }
function manifestFile(root) { return path.join(root, 'library.json'); }
function tracksFile(root) { return path.join(root, 'tracks.json'); }
function ensureLibrary(root) { if (!fs.existsSync(manifestFile(root))) fail('NOT_A_LIBRARY', `Not a music library: ${root}; run init first`); }
function loadTracks(root) { ensureLibrary(root); return fs.existsSync(tracksFile(root)) ? readJson(tracksFile(root)) : []; }
function saveTracks(root, tracks) { writeJson(tracksFile(root), tracks.sort((a, b) => a.id.localeCompare(b.id))); }

function parseArgs(argv) {
  const options = { _: [] };
  const repeatable = new Set(['tag', 'turn']);
  const flags = new Set(['json', 'force', 'live', 'dry-run', 'metadata-only', 'no-wait', 'global', 'yes', 'help', 'copy', 'mix-original', 'replace-audio', 'commercial-only', 'allow-unknown-rights', 'no-analyze', 'local', 'remote', 'allow-unauthenticated']);
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) { options._.push(token); continue; }
    const key = token.slice(2);
    if (flags.has(key)) { options[key] = true; continue; }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) fail('MISSING_OPTION_VALUE', `Missing value for --${key}`);
    index += 1;
    if (repeatable.has(key)) { options[key] ||= []; options[key].push(value); } else options[key] = value;
  }
  return options;
}
function required(options, key) { if (!options[key]) fail('MISSING_REQUIRED_OPTION', `Missing required option --${key}`); return options[key]; }
function inferredScene(text) {
  const concepts = new Set(conceptsFor(text));
  if (concepts.has('kpop')) return 'kpop-stage';
  if (concepts.has('product')) return 'ecommerce';
  return null;
}
function sceneProfile(value) {
  if (!value) return null;
  if (SCENE_PROFILES[value]) return { id: value, ...SCENE_PROFILES[value] };
  return { id: value, label: value, brief: value.replace(/[-_]+/g, ' '), weights: {}, avoid: {} };
}

function bundledExecutable(name) {
  try {
    if (name === 'ffmpeg') return require('@ffmpeg-installer/ffmpeg').path;
    if (name === 'ffprobe') return require('@ffprobe-installer/ffprobe').path;
  } catch {}
  return null;
}
function executablePath(name) {
  if (spawnSync(name, ['-version'], { encoding: 'utf8' }).status === 0) return name;
  const fallback = bundledExecutable(name);
  if (fallback && fs.existsSync(fallback) && spawnSync(fallback, ['-version'], { encoding: 'utf8' }).status === 0) return fallback;
  return null;
}
function executable(name) { return Boolean(executablePath(name)); }
function run(command, args, timeout = 900000) {
  const result = spawnSync(command, args, { encoding: 'utf8', env: { ...process.env, MAKARON_DISABLE_UPDATE_CHECK: '1' }, timeout, maxBuffer: 30 * 1024 * 1024 });
  if (result.error) fail('COMMAND_EXEC_FAILED', result.error.message, true);
  if (result.status !== 0) fail('COMMAND_FAILED', `${command} failed`, true, { exit_code: result.status, stderr_tail: redact((result.stderr || '').slice(-2000)) });
  return result;
}
function providerCommand() {
  if (process.env.MAKARON_CLI_COMMAND) return process.env.MAKARON_CLI_COMMAND.trim().split(/\s+/);
  return ['npx', '-y', `makaron-cli@${process.env.MAKARON_CLI_VERSION || MAKARON_VERSION}`];
}

function intelligenceRoot() { return fileURLToPath(new URL('../vendor/music-prompt-library', import.meta.url)); }
function intelligenceCli() { return path.join(intelligenceRoot(), 'dist', 'cli.js'); }
function intelligenceRun(args, input) {
  const cli = intelligenceCli();
  if (!fs.existsSync(cli)) fail('INTELLIGENCE_MISSING', `Bundled music intelligence layer not found: ${cli}`);
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: intelligenceRoot(), input: input === undefined ? undefined : JSON.stringify(input),
    encoding: 'utf8', timeout: 180000, maxBuffer: 30 * 1024 * 1024,
  });
  if (result.error) fail('INTELLIGENCE_EXEC_FAILED', result.error.message, true);
  const stdout = (result.stdout || '').trim();
  let payload = null;
  if (stdout) { try { payload = JSON.parse(stdout); } catch {} }
  if (result.status !== 0) fail(payload?.error_code || 'INTELLIGENCE_FAILED', payload?.message || 'Music intelligence layer failed', false, { stderr_tail: (result.stderr || '').slice(-2000) });
  if (!payload) fail('INTELLIGENCE_INVALID_RESPONSE', 'Music intelligence layer returned invalid JSON', true);
  return payload;
}
function intelligenceQuery(input, adapter = 'generic') { return intelligenceRun(['query', '--adapter', adapter], input); }
function intelligenceProfiles() { return intelligenceRun(['list', '--json']); }
function requestFrom(options, analysis = null) {
  const profile = sceneProfile(options.scene);
  const parts = [profile?.brief, options.request, analysis?.brief, !analysis ? options.brief : null].filter(Boolean);
  const request = unique(parts).join('. ');
  if (!request && !(options.turn || []).length) fail('MISSING_INPUT', 'Provide --request, --scene, --video, --brief, or --turn');
  return request;
}
function intelligenceInput(options, request, duration) {
  const workflow = {
    content_type: options['content-type'],
    duration: duration || undefined,
    style: options.style,
    target: options.target,
    platform: options.platform || 'makaron',
  };
  const workflow_context = Object.values(workflow).some((value) => value !== undefined) ? workflow : undefined;
  if ((options.turn || []).length) return { turns: options.turn.map((value) => ({ request: value })), workflow_context };
  return { request, duration: duration || undefined, workflow_context };
}
function intelligencePrompt(result) {
  return result?.seed_audio?.music_prompt || result?.music_prompt || '';
}
function intelligenceSearchText(result, request) {
  const attributes = result?.matched_attributes || {};
  const flattened = Object.values(attributes).flatMap((value) => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [value]);
  return unique([request, result?.profile_id, result?.reason, intelligencePrompt(result), ...flattened.map(String)]).join(' ');
}
function providerRun(args, timeout) { const command = providerCommand(); return run(command[0], [...command.slice(1), ...args], timeout); }
async function apiRequest(options, endpoint, init = {}) {
  const apiUrl = apiUrlFor(options);
  if (!apiUrl) fail('REMOTE_NOT_CONFIGURED', 'No central music library is configured. Run setup --api-url https://your-service.example or use --local for the owner library.');
  const token = apiToken();
  if (!token) fail('REMOTE_AUTH_REQUIRED', 'Set MUSICLIB_API_TOKEN before calling the central music library.');
  const headers = { accept: 'application/json', authorization: `Bearer ${token}`, ...(init.body ? { 'content-type': 'application/json' } : {}), ...init.headers };
  let response;
  try { response = await fetch(`${apiUrl}/${API_VERSION}${endpoint}`, { ...init, headers }); }
  catch (error) { fail('REMOTE_UNREACHABLE', `Cannot reach central music library: ${error.message}`, true, { api_url: apiUrl }); }
  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : {}; } catch {}
  if (!response.ok) {
    const remoteError = payload?.error || {};
    fail(remoteError.code || 'REMOTE_REQUEST_FAILED', remoteError.message || `Central music library returned HTTP ${response.status}`, response.status >= 500, { status: response.status });
  }
  if (!payload) fail('REMOTE_INVALID_RESPONSE', 'Central music library returned invalid JSON', true);
  return payload;
}
async function publicApiRequest(options, endpoint, init = {}) {
  const apiUrl = apiUrlFor(options);
  if (!apiUrl) fail('REMOTE_NOT_CONFIGURED', 'No central music library is configured. Run setup or config first.');
  const headers = { accept: 'application/json', ...(init.body ? { 'content-type': 'application/json' } : {}), ...init.headers };
  let response;
  try { response = await fetch(`${apiUrl}/${API_VERSION}${endpoint}`, { ...init, headers }); }
  catch (error) { fail('REMOTE_UNREACHABLE', `Cannot reach central music library: ${error.message}`, true, { api_url: apiUrl }); }
  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : {}; } catch {}
  if (!response.ok) {
    const remoteError = payload?.error || {};
    fail(remoteError.code || 'REMOTE_REQUEST_FAILED', remoteError.message || `Central music library returned HTTP ${response.status}`, response.status >= 500, { status: response.status });
  }
  if (!payload) fail('REMOTE_INVALID_RESPONSE', 'Central music library returned invalid JSON', true);
  return payload;
}
function solveChallenge(challenge) {
  if (challenge?.algorithm !== 'sha256-prefix' || !challenge.nonce || !Number.isInteger(challenge.difficulty)) {
    fail('UNSUPPORTED_REGISTRATION_CHALLENGE', 'The central library returned an unsupported registration challenge.');
  }
  if (challenge.difficulty < 1 || challenge.difficulty > 6) fail('UNSAFE_REGISTRATION_CHALLENGE', 'Registration challenge difficulty is outside the supported range.');
  const prefix = '0'.repeat(challenge.difficulty);
  for (let solution = 0; solution < 50_000_000; solution += 1) {
    const digest = crypto.createHash('sha256').update(`${challenge.nonce}:${solution}`).digest('hex');
    if (digest.startsWith(prefix)) return String(solution);
  }
  fail('REGISTRATION_CHALLENGE_FAILED', 'Could not solve the registration challenge.', true);
}
async function registerAgent(options) {
  if (apiToken() && !options.force) {
    return { ok: true, registered: false, reused: true, auth_file: fs.existsSync(AUTH_FILE) ? AUTH_FILE : null, token_source: process.env.MUSICLIB_API_TOKEN ? 'environment' : 'auth-file' };
  }
  const registrationSession = crypto.randomBytes(32).toString('base64url');
  const registrationHeaders = { 'x-musiclib-registration-session': registrationSession };
  const challenge = await publicApiRequest(options, '/register', {
    method: 'POST',
    headers: registrationHeaders,
    body: JSON.stringify({ agent_name: options.agent || 'generic-agent', client: PACKAGE, client_version: VERSION }),
  });
  const solution = solveChallenge(challenge.challenge);
  const issued = await publicApiRequest(options, '/register/verify', {
    method: 'POST',
    headers: registrationHeaders,
    body: JSON.stringify({
      challenge_id: challenge.challenge_id,
      solution,
      agent_name: options.agent || 'generic-agent',
      client: PACKAGE,
      client_version: VERSION,
    }),
  });
  if (!issued.api_token || !issued.token_id) fail('REGISTRATION_INVALID_RESPONSE', 'Registration succeeded without a usable Agent credential.', true);
  writeJson(AUTH_FILE, {
    api_token: issued.api_token,
    token_id: issued.token_id,
    scopes: issued.scopes || [],
    api_url: apiUrlFor(options),
    created_at: issued.created_at || now(),
  }, 0o600);
  return {
    ok: true,
    registered: true,
    token_id: issued.token_id,
    scopes: issued.scopes || [],
    quotas: issued.quotas || null,
    auth_file: AUTH_FILE,
    token_source: 'auth-file',
  };
}
function publicTrack(track) {
  const { path: ignoredPath, ...safe } = track;
  return safe;
}
function requestBaseUrl(request, options) {
  const configured = options['public-url'];
  if (configured) return String(configured).replace(/\/+$/, '');
  const forwarded = request.headers['x-forwarded-proto'];
  return `${forwarded || 'http'}://${request.headers.host}`;
}
function signedTrackUrl(trackId, baseUrl, secret, ttlSeconds = 900) {
  const expires = Math.floor(Date.now() / 1000) + Math.max(30, Math.min(Number(ttlSeconds) || 900, 3600));
  const signature = crypto.createHmac('sha256', secret).update(`${trackId}:${expires}`).digest('hex');
  return { url: `${baseUrl}/${API_VERSION}/tracks/${encodeURIComponent(trackId)}/audio?expires=${expires}&signature=${signature}`, expires_at: new Date(expires * 1000).toISOString() };
}
function validSignature(trackId, expires, signature, secret) {
  if (!expires || Number(expires) < Math.floor(Date.now() / 1000) || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${trackId}:${expires}`).digest('hex');
  const left = Buffer.from(String(signature)); const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
function sendJson(response, status, payload) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(`${JSON.stringify(payload)}\n`);
}
async function requestJson(request, limit = 1024 * 1024) {
  const chunks = []; let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) fail('REQUEST_TOO_LARGE', 'Request body is too large.');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { fail('INVALID_JSON', 'Request body must be valid JSON.'); }
}
function bearerAuthorized(request, secret, allowUnauthenticated) {
  if (allowUnauthenticated) return true;
  const header = request.headers.authorization || '';
  const candidate = header.startsWith('Bearer ') ? header.slice(7) : '';
  const left = Buffer.from(candidate); const right = Buffer.from(secret || '');
  return left.length === right.length && left.length > 0 && crypto.timingSafeEqual(left, right);
}
function parseProviderJson(stdout) {
  const value = stdout.trim();
  if (!value) fail('EMPTY_PROVIDER_RESPONSE', 'Makaron CLI returned no output', true);
  try { return JSON.parse(value); } catch {}
  for (const line of value.split(/\r?\n/).reverse()) { try { return JSON.parse(line); } catch {} }
  fail('INVALID_PROVIDER_RESPONSE', 'Makaron CLI did not return machine-readable JSON', true, { stdout_tail: redact(value.slice(-1000)) });
}
function providerJson(args, timeout = 180000) { return parseProviderJson(providerRun(args, timeout).stdout); }
function source(payload) { return payload?.result && typeof payload.result === 'object' ? payload.result : payload; }
function getRunId(payload) { const body = source(payload) || {}; const id = body.runId || body.run_id || body.id; if (!id) fail('RUN_ID_MISSING', 'Makaron response did not include a run ID'); return id; }
function mediaOutputs(payload) {
  const body = source(payload) || {}; const found = [];
  for (const item of Array.isArray(body.output) ? body.output : []) {
    const url = item?.url || item?.audioUrl || item?.musicUrl;
    if (url && ['audio', 'music', 'file'].includes(item?.type)) found.push({ id: item.id, type: 'audio', url, status: item.status || 'completed' });
  }
  for (const item of body.music || body.audio || body.audios || []) {
    const url = item?.url || item?.audioUrl || item?.musicUrl;
    if (url) found.push({ id: item.id, type: 'audio', url, status: item.status || 'completed' });
  }
  return [...new Map(found.map((item) => [item.url, item])).values()];
}
function waitFor(runId) {
  try { providerRun(['responses', 'watch', runId, '--jsonl']); } catch (error) { if (!(error instanceof CliError)) throw error; }
  const raw = providerJson(['responses', 'get', runId, '--json']);
  const body = source(raw) || {};
  if (['failed', 'aborted'].includes(body.status)) fail('MAKARON_RUN_FAILED', `Makaron run ended with ${body.status}`, body.status === 'failed', { response: redact(raw) });
  return { status: body.status, project_id: body.projectId || body.project_id, project_url: body.projectUrl || body.project_url, outputs: mediaOutputs(raw), raw: redact(raw) };
}

function probe(file) {
  const ffprobe = executablePath('ffprobe');
  if (ffprobe) {
    const result = spawnSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration:format_tags=title,artist,album,genre:stream=codec_type', '-of', 'json', file], { encoding: 'utf8', timeout: 30000 });
    if (!result.error && result.status === 0) {
      let data; try { data = JSON.parse(result.stdout || '{}'); } catch { data = null; }
      if (data) return {
        duration_seconds: Number(data.format?.duration || 0) || null,
        title: data.format?.tags?.title,
        artist: data.format?.tags?.artist,
        album: data.format?.tags?.album,
        genre: data.format?.tags?.genre,
        has_audio: (data.streams || []).some((item) => item.codec_type === 'audio'),
        has_video: (data.streams || []).some((item) => item.codec_type === 'video'),
        probe: 'ffprobe',
      };
    }
  }
  if (AUDIO_EXTENSIONS.has(path.extname(file).toLowerCase()) && fs.existsSync('/usr/bin/afinfo')) {
    const result = spawnSync('/usr/bin/afinfo', [file], { encoding: 'utf8', timeout: 30000 });
    if (!result.error && result.status === 0) {
      const duration = result.stdout.match(/estimated duration:\s*([\d.]+)\s*sec/i);
      return { duration_seconds: Number(duration?.[1] || 0) || null, has_audio: true, has_video: false, probe: 'afinfo' };
    }
  }
  return null;
}
function walk(directory) {
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...walk(file));
    else if (entry.isFile() && AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) found.push(file);
  }
  return found;
}
function conceptsFor(text) {
  const haystack = String(text || '').toLowerCase(); const tags = [];
  for (const [concept, words] of Object.entries(CONCEPTS)) if (words.some((word) => haystack.includes(word))) tags.push(concept);
  return tags;
}
function sidecar(file) {
  const candidates = [`${file}.music.json`, path.join(path.dirname(file), `${path.basename(file, path.extname(file))}.music.json`)];
  const found = candidates.find(fs.existsSync); return found ? readJson(found) : {};
}
function trackFromFile(file, sourceName) {
  const stat = fs.statSync(file); const meta = probe(file) || {}; const extra = sidecar(file);
  const relativeHint = `${path.basename(file, path.extname(file))} ${path.dirname(file)}`;
  const title = extra.title || meta.title || path.basename(file, path.extname(file));
  const artist = extra.artist || meta.artist || null;
  const tags = unique([...(extra.tags || []), ...splitList(meta.genre), ...conceptsFor(`${relativeHint} ${extra.description || ''}`)]);
  const id = `trk_${crypto.createHash('sha256').update(path.resolve(file)).digest('hex').slice(0, 12)}`;
  return {
    schema_version: '1.0', id, title, artist, album: extra.album || meta.album || null,
    path: path.resolve(file), source: sourceName, size_bytes: stat.size, modified_at: stat.mtime.toISOString(),
    duration_seconds: extra.duration_seconds || meta.duration_seconds || null,
    tags, description: extra.description || '', license: extra.license || 'unknown', commercial_use: extra.commercial_use ?? null,
    indexed_at: now(),
  };
}
function queryTerms(query) {
  const raw = String(query || '').toLowerCase();
  const stop = new Set(['and', 'the', 'with', 'for', 'from', 'into', 'music', 'production', 'no']);
  const lexical = raw.split(/[^\p{L}\p{N}]+/u).filter((term) => (term.length >= 2 || /[^\x00-\x7F]/.test(term)) && !/^\d+$/.test(term) && !stop.has(term));
  return unique([...lexical, ...conceptsFor(raw)]);
}
function scoreTrack(track, query, wantedDuration, profile = null) {
  const terms = queryTerms(query); const text = `${track.title} ${track.artist || ''} ${track.album || ''} ${track.description || ''} ${(track.tags || []).join(' ')}`.toLowerCase();
  let score = 0; const matched = [];
  for (const term of terms) if (text.includes(term) || track.tags?.includes(term)) { score += track.tags?.includes(term) ? 4 : 2; matched.push(term); }
  if (profile) {
    for (const [tag, weight] of Object.entries(profile.weights || {})) if (track.tags?.includes(tag)) { score += weight; matched.push(`scene:${tag}`); }
    for (const [tag, penalty] of Object.entries(profile.avoid || {})) if (track.tags?.includes(tag)) score -= penalty;
  }
  if (wantedDuration && track.duration_seconds) {
    const ratio = Math.abs(track.duration_seconds - wantedDuration) / Math.max(wantedDuration, 1);
    score += Math.max(0, 2 - ratio * 2);
  }
  return { score: Number(score.toFixed(3)), matched: unique(matched), scene: profile?.id || null };
}
function search(root, query, options = {}) {
  const limit = Number(options.limit || 10); const duration = Number(options.duration || 0); const profile = sceneProfile(options.scene);
  const requiredTags = SCENE_REQUIRED_TAGS[profile?.id] || [];
  return loadTracks(root)
    .filter((track) => !options['commercial-only'] || track.commercial_use === true)
    .filter((track) => !requiredTags.length || requiredTags.some((tag) => track.tags?.includes(tag)))
    .map((track) => ({ ...track, match: scoreTrack(track, query, duration, profile) }))
    .filter((track) => !query || track.match.score > 0)
    .sort((a, b) => b.match.score - a.match.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

function musicBrief(options, analysis = null) {
  const profile = sceneProfile(options.scene); const parts = [profile?.brief, analysis?.brief, !analysis ? options.brief : null].filter(Boolean);
  return { profile, brief: unique(parts).join('. '), source: analysis?.source || (options.brief ? 'user' : profile ? 'scene-profile' : null), run_id: analysis?.run_id };
}
function recommendationDecision(track) {
  if (!track) return { action: 'generate-original', publish_ready: false, reason: 'No matching library track was found.' };
  const rightsKnown = track.commercial_use === true && track.license !== 'unknown';
  if (rightsKnown) return { action: 'use-library-track', publish_ready: true, reason: 'The selected track is explicitly marked for commercial use.' };
  return { action: 'review-rights-or-generate-original', publish_ready: false, reason: 'The selected track has no verified commercial-use metadata.' };
}

function recommendLocal(root, options) {
  const request = requestFrom(options, musicBrief(options));
  const duration = Number(options.duration || 0);
  const intelligence = intelligenceQuery(intelligenceInput(options, request, duration), options.adapter || 'generic');
  const localQuery = intelligenceSearchText(intelligence, request);
  const tracks = search(root, localQuery, { ...options, duration, limit: options.limit || 5 }).map(publicTrack);
  const recommendation = tracks[0] || null;
  const generation_prompt = [intelligencePrompt(intelligence), intelligence.arrangement_notes || intelligence.seed_audio?.arrangement_notes, intelligence.seed_audio?.negative_prompt].filter(Boolean).join(' ');
  return { ok: true, profile_id: intelligence.profile_id, intelligence, request, duration_seconds: duration || null, count: tracks.length, recommendation, decision: recommendationDecision(recommendation), generation_prompt, tracks };
}

async function serveLibrary(root, options) {
  ensureLibrary(root);
  const host = options.host || process.env.HOST || '127.0.0.1';
  const port = Number(options.port || process.env.PORT || 8787);
  const allowUnauthenticated = Boolean(options['allow-unauthenticated']);
  const secret = process.env.MUSICLIB_SERVER_TOKEN;
  if (!allowUnauthenticated && !secret) fail('SERVER_TOKEN_REQUIRED', 'Set MUSICLIB_SERVER_TOKEN before starting the API server.');
  if (allowUnauthenticated && host !== '127.0.0.1' && host !== 'localhost') fail('UNSAFE_PUBLIC_SERVER', 'Unauthenticated mode may only bind to localhost.');
  const signingSecret = secret || crypto.randomBytes(32).toString('hex');
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
      const audioMatch = url.pathname.match(new RegExp(`^/${API_VERSION}/tracks/([^/]+)/audio$`));
      if (audioMatch && request.method === 'GET') {
        const trackId = decodeURIComponent(audioMatch[1]);
        if (!validSignature(trackId, url.searchParams.get('expires'), url.searchParams.get('signature'), signingSecret)) return sendJson(response, 401, { ok: false, error: { code: 'INVALID_OR_EXPIRED_LINK', message: 'This audio link is invalid or expired.' } });
        const track = findTrack(root, trackId);
        if (!fs.existsSync(track.path)) return sendJson(response, 404, { ok: false, error: { code: 'TRACK_NOT_LOCAL', message: 'The audio file is unavailable on the server.' } });
        const stat = fs.statSync(track.path);
        response.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': stat.size, 'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(path.basename(track.path))}`, 'cache-control': 'private, max-age=60' });
        return fs.createReadStream(track.path).pipe(response);
      }
      if (request.method === 'GET' && url.pathname === `/${API_VERSION}/health`) return sendJson(response, 200, { ok: true, service: PACKAGE, version: VERSION, api_version: API_VERSION });
      if (!bearerAuthorized(request, secret, allowUnauthenticated)) return sendJson(response, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'A valid Agent token is required.' } });
      if (request.method === 'GET' && url.pathname === `/${API_VERSION}/search`) {
        const query = url.searchParams.get('query') || '';
        if (!query) fail('MISSING_REQUIRED_OPTION', 'Missing query.');
        const searchOptions = {
          limit: url.searchParams.get('limit') || 10,
          duration: url.searchParams.get('duration') || 0,
          scene: url.searchParams.get('scene') || undefined,
          'commercial-only': url.searchParams.get('commercial_only') === 'true',
        };
        const tracks = search(root, query, searchOptions).map(publicTrack);
        return sendJson(response, 200, { ok: true, query, count: tracks.length, tracks });
      }
      if (request.method === 'POST' && url.pathname === `/${API_VERSION}/recommend`) {
        const body = await requestJson(request);
        if (body.video) fail('REMOTE_VIDEO_UPLOAD_NOT_IMPLEMENTED', 'Remote video upload is not available yet. Send --brief or --request, or analyze the video before calling recommend.');
        return sendJson(response, 200, recommendLocal(root, body));
      }
      const accessMatch = url.pathname.match(new RegExp(`^/${API_VERSION}/tracks/([^/]+)/access$`));
      if (accessMatch && request.method === 'POST') {
        const trackId = decodeURIComponent(accessMatch[1]); const track = findTrack(root, trackId);
        if (!fs.existsSync(track.path)) fail('TRACK_NOT_LOCAL', 'The audio file is unavailable on the server.');
        const access = signedTrackUrl(track.id, requestBaseUrl(request, options), signingSecret, options['link-ttl']);
        return sendJson(response, 200, { ok: true, track: publicTrack(track), ...access });
      }
      return sendJson(response, 404, { ok: false, error: { code: 'NOT_FOUND', message: 'API route not found.' } });
    } catch (error) {
      const known = error instanceof CliError;
      return sendJson(response, known ? 400 : 500, { ok: false, error: { code: known ? error.code : 'UNEXPECTED_ERROR', message: error.message } });
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  process.stderr.write(`Central music library listening on http://${host}:${port}/${API_VERSION}\n`);
  await new Promise((resolve) => {
    const stop = () => { server.close(resolve); server.closeAllConnections?.(); };
    process.once('SIGINT', stop); process.once('SIGTERM', stop);
  });
}

function extractFrames(video, directory) {
  const ffmpeg = executablePath('ffmpeg');
  if (!ffmpeg) fail('FFMPEG_REQUIRED', 'ffmpeg is required for automatic video analysis');
  fs.mkdirSync(directory, { recursive: true });
  const info = probe(video); const duration = info?.duration_seconds || 12; const positions = [0.15, 0.5, 0.85].map((ratio) => Math.max(0, duration * ratio));
  return positions.map((seconds, index) => {
    const output = path.join(directory, `frame-${index + 1}.jpg`);
    run(ffmpeg, ['-y', '-ss', String(seconds), '-i', video, '-frames:v', '1', '-vf', 'scale=960:-2', '-q:v', '3', output], 60000);
    return output;
  });
}
function analyzeVideo(video, options) {
  if (options.brief) return musicBrief(options, { brief: options.brief, source: 'user' });
  if (options['no-analyze']) return musicBrief(options, { brief: path.basename(video, path.extname(video)), source: 'filename', confidence: 'low' });
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'musiclib-frames-'));
  try {
    const frames = extractFrames(video, temp);
    const args = ['chat', '--project', options.project || 'auto', '--json', '--background'];
    for (const frame of frames) args.push('--image', frame);
    args.push('Analyze these ordered frames from one video. Return only a concise music-search brief: mood, energy, genre, instruments, pacing, and whether vocals should be avoided. Do not create media.');
    const submitted = providerJson(args); const runId = getRunId(submitted);
    providerRun(['responses', 'watch', runId, '--jsonl']);
    const text = providerRun(['responses', 'get', runId, '--pick', 'text']).stdout.trim().replace(/^"|"$/g, '');
    if (!text) fail('EMPTY_ANALYSIS', 'Makaron returned no music brief', true);
    return musicBrief(options, { brief: text, source: 'makaron-video-analysis', run_id: runId });
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
}
function submitGeneration(prompt, options) {
  const request = `Create one original, production-ready music track for this brief: ${prompt}. Respect the requested mood, energy, instrumentation, duration, and vocal preference. Avoid copyrighted melodies and return the audio artifact.`;
  const raw = providerJson(['chat', '--project', options.project || 'auto', '--json', '--background', request]);
  const body = source(raw) || {};
  return { run_id: getRunId(raw), project_id: body.projectId || body.project_id, project_url: body.projectUrl || body.project_url, raw: redact(raw) };
}
function findTrack(root, value) {
  const tracks = loadTracks(root); const direct = tracks.find((item) => item.id === value);
  if (direct) return direct;
  const matches = tracks.filter((item) => item.title.toLowerCase() === String(value).toLowerCase());
  if (matches.length !== 1) fail('TRACK_NOT_FOUND', `Track not found or title is ambiguous: ${value}`);
  return matches[0];
}
function copyTrack(track, output) {
  if (!fs.existsSync(track.path)) fail('TRACK_NOT_LOCAL', `Track must be downloaded locally first: ${track.path}`);
  const destination = path.resolve(output); fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.copyFileSync(track.path, destination); return destination;
}
function addSoundtrack(video, music, output, options) {
  const ffmpeg = executablePath('ffmpeg');
  if (!ffmpeg) fail('FFMPEG_REQUIRED', 'ffmpeg is required to add music to video');
  const videoMeta = probe(video); const args = ['-y', '-i', video, '-stream_loop', '-1', '-i', music];
  const duration = Number(videoMeta?.duration_seconds || 0); const fade = Math.max(0, Number(options['fade-seconds'] ?? 1));
  const trim = duration > 0 ? `atrim=0:${duration},asetpts=PTS-STARTPTS,` : '';
  const fades = fade > 0 && duration > fade ? `afade=t=in:st=0:d=${fade},afade=t=out:st=${Math.max(0, duration - fade)}:d=${fade},` : '';
  if (options['mix-original'] && videoMeta?.has_audio) {
    const original = Number(options['original-volume'] || 0.2); const musicVolume = Number(options['music-volume'] || 0.8);
    args.push('-filter_complex', `[0:a]volume=${original}[original];[1:a]${trim}${fades}volume=${musicVolume}[music];[original][music]amix=inputs=2:duration=first:dropout_transition=2[a]`, '-map', '0:v:0', '-map', '[a]');
  } else {
    args.push('-filter:a', `${trim}${fades}volume=${Number(options['music-volume'] || 0.8)}`, '-map', '0:v:0', '-map', '1:a:0');
  }
  args.push('-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', output);
  run(ffmpeg, args, 1800000); return path.resolve(output);
}

function remoteMediaUrl(value, label) {
  let parsed;
  try { parsed = new URL(value); } catch { fail('INVALID_MEDIA_URL', `${label} must be a valid HTTP or HTTPS URL.`); }
  if (!['http:', 'https:'].includes(parsed.protocol)) fail('INVALID_MEDIA_URL', `${label} must use HTTP or HTTPS.`);
  return parsed.toString();
}
async function saveRemoteBody(response, destination, maxBytes, label) {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > maxBytes) fail('MEDIA_TOO_LARGE', `${label} exceeds the ${Math.round(maxBytes / 1024 / 1024)}MB download limit.`);
  let received = 0;
  const limiter = new Transform({ transform(chunk, encoding, callback) {
    received += chunk.length;
    if (received > maxBytes) callback(new CliError('MEDIA_TOO_LARGE', `${label} exceeds the ${Math.round(maxBytes / 1024 / 1024)}MB download limit.`));
    else callback(null, chunk);
  } });
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  try { await pipeline(Readable.fromWeb(response.body), limiter, fs.createWriteStream(destination, { flags: 'wx' })); }
  catch (error) {
    fs.rmSync(destination, { force: true });
    if (error instanceof CliError) throw error;
    fail('MEDIA_DOWNLOAD_FAILED', `${label} could not be saved: ${error.message}`, true);
  }
  return { path: destination, bytes: received, content_type: response.headers.get('content-type') || null };
}
async function downloadRemoteMediaByRange(url, destination, maxBytes, label) {
  const chunkSize = 4 * 1024 * 1024; let start = 0; let total = null; let contentType = null; let handle = null;
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  try {
    handle = fs.openSync(destination, 'wx');
    while (total === null || start < total) {
      const end = Math.min(start + chunkSize - 1, maxBytes - 1);
      if (end < start) fail('MEDIA_TOO_LARGE', `${label} exceeds the ${Math.round(maxBytes / 1024 / 1024)}MB download limit.`);
      let response;
      try { response = await fetch(url, { headers: { range: `bytes=${start}-${end}` }, redirect: 'follow', signal: AbortSignal.timeout(120000) }); }
      catch (error) { fail('MEDIA_DOWNLOAD_FAILED', `${label} range download failed: ${error.message}`, true); }
      if (response.status !== 206 || !response.body) fail('MEDIA_DOWNLOAD_FAILED', `${label} range download returned HTTP ${response.status}.`, response.status >= 500);
      const contentRange = response.headers.get('content-range')?.match(/^bytes\s+(\d+)-(\d+)\/(\d+)$/i);
      if (!contentRange || Number(contentRange[1]) !== start) fail('MEDIA_DOWNLOAD_FAILED', `${label} returned an invalid Content-Range.`);
      total = Number(contentRange[3]);
      if (!Number.isFinite(total) || total > maxBytes) fail('MEDIA_TOO_LARGE', `${label} exceeds the ${Math.round(maxBytes / 1024 / 1024)}MB download limit.`);
      const chunk = Buffer.from(await response.arrayBuffer());
      if (!chunk.length || chunk.length !== Number(contentRange[2]) - start + 1) fail('MEDIA_DOWNLOAD_FAILED', `${label} returned an incomplete byte range.`, true);
      fs.writeSync(handle, chunk, 0, chunk.length, start); start += chunk.length;
      contentType ||= response.headers.get('content-type') || null;
    }
  } catch (error) {
    if (handle !== null) fs.closeSync(handle);
    handle = null; fs.rmSync(destination, { force: true });
    throw error;
  } finally { if (handle !== null) fs.closeSync(handle); }
  return { path: destination, bytes: start, content_type: contentType, ranged: true };
}
async function downloadRemoteMedia(url, destination, maxBytes, label, options = {}) {
  let response;
  try { response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(120000) }); }
  catch (error) { fail('MEDIA_DOWNLOAD_FAILED', `${label} download failed: ${error.message}`, true); }
  if (response.status === 406 && options.range_fallback) return downloadRemoteMediaByRange(url, destination, maxBytes, label);
  if (!response.ok || !response.body) fail('MEDIA_DOWNLOAD_FAILED', `${label} download returned HTTP ${response.status}.`, response.status >= 500);
  return saveRemoteBody(response, destination, maxBytes, label);
}
async function soundtrackRemote(options) {
  if (useLocal(options)) fail('REMOTE_COMMAND_MODE', 'soundtrack-remote uses the central library; remove --local and --library.');
  const videoUrl = remoteMediaUrl(required(options, 'video-url'), 'Video URL');
  const output = path.resolve(required(options, 'output'));
  if (fs.existsSync(output) && !options.force) fail('OUTPUT_EXISTS', `Output already exists: ${output}; choose another path or pass --force.`);
  const explicitScene = options.scene || null; const scene = explicitScene || inferredScene(unique([options.request, options.brief]).join('. '));
  if (scene) options = { ...options, scene };
  const plan = {
    video_url: videoUrl, output, scene: scene || null, scene_inferred: Boolean(scene && !explicitScene), track_id: options.track || null,
    analyze_video: !options.track && !options.scene && !options.request && !options.brief && !options['no-analyze'],
    mix_original: !options['replace-audio'], music_volume: Number(options['music-volume'] || 0.35),
    original_volume: Number(options['original-volume'] || 0.2), fade_seconds: Number(options['fade-seconds'] ?? 1),
    max_video_mb: Number(options['max-video-mb'] || 500), max_audio_mb: Number(options['max-audio-mb'] || 50),
  };
  if (options['dry-run']) return { ok: true, dry_run: true, plan };
  if (!executable('ffmpeg') || !executable('ffprobe')) fail('FFMPEG_REQUIRED', 'ffmpeg and ffprobe are required for soundtrack-remote.');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'musiclib-remote-soundtrack-'));
  try {
    const video = path.join(temp, 'source-video');
    const videoDownload = await downloadRemoteMedia(videoUrl, video, plan.max_video_mb * 1024 * 1024, 'Video');
    const duration = probe(video)?.duration_seconds || Number(options.duration || 0) || undefined;
    let analysis = null; let track = null; let decision = null; let access = null;
    if (options.track) {
      access = await apiRequest(options, `/tracks/${encodeURIComponent(options.track)}/access`, { method: 'POST', body: '{}' });
      track = access.track; decision = recommendationDecision(track);
    } else {
      if (plan.analyze_video) analysis = analyzeVideo(video, options);
      const requestBody = {
        request: options.request, brief: options.brief || analysis?.brief, scene: options.scene,
        duration, limit: options.limit || 5, adapter: options.adapter || 'video_editor',
        style: options.style, target: options.target, platform: options.platform,
        'content-type': options['content-type'], 'commercial-only': Boolean(options['commercial-only']),
      };
      const recommended = await apiRequest(options, '/recommend', { method: 'POST', body: JSON.stringify(requestBody) });
      track = recommended.recommendation; decision = recommended.decision; analysis = analysis || recommended.intelligence || null;
      if (!track) fail('NO_MATCHING_TRACK', 'No suitable central-library track was found; broaden the brief or generate original music.');
    }
    if (!options['allow-unknown-rights'] && decision?.publish_ready !== true) {
      fail('RIGHTS_REVIEW_REQUIRED', 'The selected track is not verified for commercial use. Review its rights or pass --allow-unknown-rights for an authorized non-commercial test.', false, { track, decision });
    }
    access ||= await apiRequest(options, `/tracks/${encodeURIComponent(track.id)}/access`, { method: 'POST', body: '{}' });
    const audioUrl = remoteMediaUrl(access.url, 'Audio URL'); const audio = path.join(temp, 'source-audio');
    const audioDownload = await downloadRemoteMedia(audioUrl, audio, plan.max_audio_mb * 1024 * 1024, 'Audio', { range_fallback: true });
    fs.mkdirSync(path.dirname(output), { recursive: true });
    const mixOptions = { ...options, 'mix-original': !options['replace-audio'], 'music-volume': plan.music_volume, 'original-volume': plan.original_volume, 'fade-seconds': plan.fade_seconds };
    const created = addSoundtrack(video, audio, output, mixOptions);
    return { ok: true, output: created, track, decision, duration_seconds: duration || null, analysis, mix: { original_audio_preserved: plan.mix_original, music_volume: plan.music_volume, original_volume: plan.original_volume, fade_seconds: plan.fade_seconds }, downloads: { video_bytes: videoDownload.bytes, audio_bytes: audioDownload.bytes } };
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
}

function installSkill(options) {
  const skillDir = fileURLToPath(new URL('../skills/makaron-music-library', import.meta.url));
  const skillFile = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) fail('SKILL_MISSING', `Bundled Skill not found: ${skillFile}`);
  const args = ['-y', 'skills', 'add', skillDir, '--skill', 'makaron-music-library', '--copy'];
  if (options.global) args.push('--global'); if (options.agent) args.push('--agent', options.agent); if (options.yes) args.push('--yes');
  if (options['dry-run']) return { ok: true, dry_run: true, command: ['npx', ...args], skill_file: skillFile };
  const result = spawnSync('npx', args, { stdio: 'inherit' });
  if (result.error || result.status !== 0) fail('SKILL_INSTALL_FAILED', 'Could not install Agent Skill', true, { exit_code: result.status });
  return { ok: true, installed: true, skill: 'makaron-music-library' };
}
function configure(options) {
  const apiUrl = String(options['api-url'] || DEFAULT_API_URL).replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(apiUrl)) fail('INVALID_API_URL', 'The central API URL must begin with https:// or http://.');
  const config = { ...loadConfig(), api_url: apiUrl, updated_at: now() };
  if (!options['dry-run']) writeJson(CONFIG_FILE, config);
  return { ok: true, dry_run: Boolean(options['dry-run']), config_file: CONFIG_FILE, api_url: apiUrl, token_source: 'environment-or-auth-file' };
}
async function setup(options) {
  const installArgs = ['install', '-g', `${PACKAGE}@${VERSION}`];
  const remote_config = configure(options);
  if (options['dry-run']) {
    return {
      ok: true,
      dry_run: true,
      global_install: ['npm', ...installArgs],
      skill_install: installSkill({ ...options, global: true, yes: true }),
      remote_config,
      registration: { automatic: true, endpoint: `${remote_config.api_url}/${API_VERSION}/register` },
    };
  }
  const result = spawnSync('npm', installArgs, { stdio: 'inherit' });
  if (result.error || result.status !== 0) fail('GLOBAL_INSTALL_FAILED', `Could not install ${PACKAGE} globally`, true, { exit_code: result.status });
  const skill_install = installSkill({ ...options, global: true, yes: true });
  const registration = await registerAgent(options);
  return { ok: true, installed: true, skill_install, remote_config, registration };
}
function help() {
  console.log(`makaron-music-library-cli ${VERSION}\n\nUsage:\n  npx ${PACKAGE} setup [--agent <agent>] [--api-url <central-api-url>]\n  musiclib <command> [options]\n\nAgent commands (remote by default):\n  register           Self-register this Agent and securely save its credential\n  search             Search the central library by title, artist, tags, or natural language\n  recommend          Use music intelligence and rank central-library tracks\n  access             Create a short-lived audio URL for an authorized track\n  soundtrack-remote  Download a public video, select remote music, and create a mixed video\n  brief              Turn a natural-language request into an agent-ready music brief\n  generate           Generate original music through Makaron\n  wait               Wait for a Makaron music run\n\nOwner/admin commands:\n  cloud-sync  Upload an indexed owner library to private R2 and D1\n  config      Save the central API URL\n  serve       Serve a local index as the authenticated central API\n  init        Initialize a local music library\n  index       Index a local or Baidu Netdisk-synced music folder\n  list        List local indexed tracks\n  export      Copy one local track to an output path\n  soundtrack  Add local music to a video\n  validate    Validate local files and rights metadata\n  doctor      Check remote, Makaron, ffmpeg, and authentication\n\nThe default hosted library is configured automatically. Credentials are read from MUSICLIB_API_TOKEN or ~/.musiclib/auth.json. Pass --local (or --library) for the owner's local index. All command results are JSON.`);
}

async function main() {
  const [command = 'help', ...rest] = process.argv.slice(2); const options = parseArgs(rest);
  if (command === 'help' || command === '--help' || options.help) return help();
  if (command === '--version' || command === 'version') return console.log(VERSION);
  if (command === 'setup') return emit(await setup(options));
  if (command === 'register') {
    if (options['api-url']) configure(options);
    else if (!apiUrlFor(options)) configure(options);
    return emit(await registerAgent(options));
  }
  if (command === 'install-skill') return emit(installSkill(options));
  if (command === 'cloud-sync') {
    const { syncCloudflare } = await import('./cloudflare-sync.mjs');
    const result = await syncCloudflare({
      library: rootFor(options), accountId: options['account-id'], databaseId: options['database-id'],
      apiUrl: apiUrlFor(options), bucket: options.bucket, concurrency: options.concurrency,
      limit: options.limit, dryRun: Boolean(options['dry-run']), metadataOnly: Boolean(options['metadata-only']),
    });
    return emit(result);
  }
  if (command === 'config') return emit(configure(options));
  if (command === 'serve') return serveLibrary(rootFor(options), options);
  if (command === 'doctor') {
    const authFile = fs.existsSync(path.join(os.homedir(), '.makaron', 'auth.json'));
    const profiles = intelligenceProfiles();
    const musiclibAuthFile = fs.existsSync(AUTH_FILE);
    const result = { ok: true, mode: useLocal(options) ? 'local' : 'remote', remote: { api_url: apiUrlFor(options), token_present: Boolean(apiToken()), configured: Boolean(apiUrlFor(options)), auth_file_present: musiclibAuthFile, token_source: process.env.MUSICLIB_API_TOKEN ? 'environment' : musiclibAuthFile ? 'auth-file' : null }, ffmpeg: executable('ffmpeg'), ffprobe: executable('ffprobe'), audio_duration_fallback: fs.existsSync('/usr/bin/afinfo') ? 'afinfo' : null, music_intelligence: { ok: profiles.status === 'ok', version: '0.8.1', profiles: profiles.count }, makaron_command: providerCommand(), makaron_auth: Boolean(process.env.MAKARON_API_KEY || authFile), api_key_env_present: Boolean(process.env.MAKARON_API_KEY), auth_file_present: authFile };
    if (options.remote || (options.live && apiUrlFor(options))) result.remote.health = await apiRequest(options, '/health');
    if (options.live) { providerRun(['list'], 60000); result.live_check = true; }
    return emit(redact(result));
  }

  const root = rootFor(options);
  if (command === 'init') {
    if (fs.existsSync(manifestFile(root)) && !options.force) fail('LIBRARY_EXISTS', `Library already exists: ${root}`);
    const manifest = { schema_version: '1.0', name: options.name || 'Music Library', created_at: now(), sources: [] };
    writeJson(manifestFile(root), manifest); writeJson(tracksFile(root), []); return emit({ ok: true, library: root, manifest });
  }
  if (command === 'index') {
    ensureLibrary(root); const source = path.resolve(required(options, 'source'));
    if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) fail('SOURCE_NOT_FOUND', `Music source directory not found: ${source}`);
    const sourceName = options['source-name'] || (source.toLowerCase().includes('baidu') ? 'baidu-netdisk-local' : path.basename(source));
    const existing = loadTracks(root); const byPath = new Map(existing.map((track) => [track.path, track]));
    const files = walk(source); for (const file of files) byPath.set(path.resolve(file), trackFromFile(file, sourceName));
    const tracks = [...byPath.values()]; saveTracks(root, tracks);
    const manifest = readJson(manifestFile(root)); manifest.sources = unique([...(manifest.sources || []), source]); manifest.updated_at = now(); writeJson(manifestFile(root), manifest);
    return emit({ ok: true, source, source_name: sourceName, scanned: files.length, total: tracks.length, library: root });
  }
  if (command === 'list') return emit({ ok: true, count: loadTracks(root).length, tracks: loadTracks(root) });
  if (command === 'profiles') {
    const result = intelligenceProfiles();
    return emit({ ok: result.status === 'ok', intelligence_version: '0.8.1', ...result });
  }
  if (command === 'brief') {
    const duration = Number(options.duration || 0); const request = requestFrom(options);
    const input = intelligenceInput(options, request, duration);
    const intelligence = intelligenceQuery(input, options.adapter || 'generic');
    return emit({ ok: true, request, adapter: options.adapter || 'generic', intelligence });
  }
  if (command === 'search') {
    const query = required(options, 'query');
    const explicitScene = options.scene || null; options.scene ||= inferredScene(query);
    if (!useLocal(options)) {
      const params = new URLSearchParams({ query, limit: String(options.limit || 10) });
      if (options.duration) params.set('duration', options.duration);
      if (options.scene) params.set('scene', options.scene);
      if (options['commercial-only']) params.set('commercial_only', 'true');
      const result = await apiRequest(options, `/search?${params}`);
      if (options.scene && !explicitScene) result.scene_inferred = true;
      return emit(result);
    }
    const tracks = search(root, query, options);
    return emit({ ok: true, mode: 'local', query, count: tracks.length, tracks });
  }
  if (command === 'recommend') {
    const explicitScene = options.scene || null; options.scene ||= inferredScene(unique([options.request, options.brief]).join('. '));
    if (!useLocal(options)) {
      const remoteOptions = { request: options.request, brief: options.brief, scene: options.scene, duration: options.duration, limit: options.limit, adapter: options.adapter, style: options.style, target: options.target, platform: options.platform, 'content-type': options['content-type'], 'commercial-only': Boolean(options['commercial-only']), video: options.video };
      const result = await apiRequest(options, '/recommend', { method: 'POST', body: JSON.stringify(remoteOptions) });
      if (options.scene && !explicitScene) result.scene_inferred = true;
      return emit(result);
    }
    ensureLibrary(root); const video = options.video ? path.resolve(options.video) : null;
    if (video && !fs.existsSync(video)) fail('VIDEO_NOT_FOUND', `Video not found: ${video}`);
    const analysis = video ? analyzeVideo(video, options) : musicBrief(options); const request = requestFrom(options, analysis);
    const duration = video ? probe(video)?.duration_seconds : Number(options.duration || 0);
    const input = intelligenceInput(options, request, duration); const intelligence = intelligenceQuery(input, options.adapter || 'generic');
    const localQuery = intelligenceSearchText(intelligence, request);
    const tracks = search(root, localQuery, { ...options, duration, limit: options.limit || 5 }); const recommendation = tracks[0] || null;
    const generation_prompt = [intelligencePrompt(intelligence), intelligence.arrangement_notes || intelligence.seed_audio?.arrangement_notes, intelligence.seed_audio?.negative_prompt].filter(Boolean).join(' ');
    return emit({ ok: true, profile_id: intelligence.profile_id, intelligence, scene: analysis.profile || null, analysis, request, video, duration_seconds: duration || null, count: tracks.length, recommendation, decision: recommendationDecision(recommendation), generation_prompt, tracks });
  }
  if (command === 'access') {
    if (useLocal(options)) fail('REMOTE_ONLY_COMMAND', 'access creates a central-library URL and is only available in remote mode.');
    const trackId = required(options, 'track');
    return emit(await apiRequest(options, `/tracks/${encodeURIComponent(trackId)}/access`, { method: 'POST', body: '{}' }));
  }
  if (command === 'soundtrack-remote') return emit(await soundtrackRemote(options));
  if (command === 'export') {
    const track = findTrack(root, required(options, 'track')); const output = copyTrack(track, required(options, 'output'));
    return emit({ ok: true, track, output });
  }
  if (command === 'generate') {
    let prompt = options.prompt;
    let intelligence = null;
    if (!prompt) {
      const duration = Number(options.duration || 0); const request = requestFrom(options);
      intelligence = intelligenceQuery(intelligenceInput(options, request, duration), 'makaron');
      prompt = [intelligencePrompt(intelligence), intelligence.seed_audio?.producer_notes, intelligence.seed_audio?.arrangement_notes, intelligence.seed_audio?.negative_prompt].filter(Boolean).join(' ');
    }
    if (options['dry-run']) return emit({ ok: true, dry_run: true, intelligence, prompt, provider: 'makaron' });
    const submitted = submitGeneration(prompt, options);
    if (options['no-wait']) return emit({ ok: true, status: 'submitted', ...submitted });
    const completed = waitFor(submitted.run_id); return emit({ ok: completed.outputs.length > 0, intelligence, ...submitted, ...completed });
  }
  if (command === 'wait') {
    const runId = required(options, 'run-id'); const completed = waitFor(runId); return emit({ ok: completed.outputs.length > 0, run_id: runId, ...completed });
  }
  if (command === 'soundtrack') {
    ensureLibrary(root); const video = path.resolve(required(options, 'video')); const output = path.resolve(required(options, 'output'));
    if (!fs.existsSync(video)) fail('VIDEO_NOT_FOUND', `Video not found: ${video}`);
    let track; let analysis = null;
    if (options.track) track = findTrack(root, options.track);
    else {
      analysis = analyzeVideo(video, options); const duration = probe(video)?.duration_seconds; const request = requestFrom(options, analysis);
      const intelligence = intelligenceQuery(intelligenceInput(options, request, duration), options.adapter || 'video_editor');
      analysis = { ...analysis, intelligence, request };
      const candidates = search(root, intelligenceSearchText(intelligence, request), { ...options, duration, limit: 5 });
      track = candidates[0]; if (!track) fail('NO_MATCHING_TRACK', 'No matching library track found; run generate or broaden the brief', false, { brief: analysis.brief });
    }
    if (!fs.existsSync(track.path)) fail('TRACK_NOT_LOCAL', `Download this Baidu Netdisk track locally before mixing: ${track.path}`);
    const plan = { video, music: track.path, track_id: track.id, output, scene: options.scene || null, analysis, decision: recommendationDecision(track), mix_original: Boolean(options['mix-original']), music_volume: Number(options['music-volume'] || 0.8), original_volume: Number(options['original-volume'] || 0.2) };
    if (options['dry-run']) return emit({ ok: true, dry_run: true, plan });
    const created = addSoundtrack(video, track.path, output, options); return emit({ ok: true, output: created, track, analysis });
  }
  if (command === 'validate') {
    const tracks = loadTracks(root); const missing = tracks.filter((track) => !fs.existsSync(track.path)).map((track) => track.id);
    const unknownRights = tracks.filter((track) => track.license === 'unknown' || track.commercial_use === null).map((track) => track.id);
    return emit({ ok: missing.length === 0, count: tracks.length, missing_files: missing, unknown_rights: unknownRights, note: 'Unknown rights do not block personal search, but must be reviewed before commercial use.' });
  }
  fail('UNKNOWN_COMMAND', `Unknown command: ${command}`);
}

main().catch((error) => {
  const payload = error instanceof CliError ? { ok: false, error: { code: error.code, message: error.message, retryable: error.retryable, details: redact(error.details) } } : { ok: false, error: { code: 'UNEXPECTED_ERROR', message: error.message, retryable: false } };
  process.stderr.write(`${JSON.stringify(payload, null, 2)}\n`); process.exitCode = 1;
});
