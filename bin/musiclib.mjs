#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const VERSION = '0.1.0';
const PACKAGE = 'makaron-music-library-cli';
const MAKARON_VERSION = '0.13.0';
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
  product: ['product', 'ecommerce', 'e-commerce', '商品', '产品', '电商', '带货'],
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
    weights: { product: 9, bgm: 10, happy: 4, electronic: 3, trending: 3, no_vocals: 5, pop: 2 },
    avoid: { sad: 4, tense: 2 },
  },
};

class CliError extends Error {
  constructor(code, message, retryable = false, details = {}) {
    super(message); this.code = code; this.retryable = retryable; this.details = details;
  }
}

function now() { return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); }
function emit(value) { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`); }
function fail(code, message, retryable = false, details = {}) { throw new CliError(code, message, retryable, details); }
function readJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { fail('INVALID_JSON', `Cannot read ${file}: ${error.message}`); } }
function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }
function redact(value) {
  if (typeof value === 'string') return value.replace(/mk_(?:live|test)?_?[A-Za-z0-9_-]{8,}/g, '[REDACTED_MAKARON_KEY]');
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redact(item)]));
  return value;
}
function slug(value) { return String(value || '').normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 64); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function splitList(value) { return unique(String(value || '').split(',').map((item) => item.trim().toLowerCase())); }
function rootFor(options) { return path.resolve(options.library || process.env.MUSICLIB_LIBRARY || path.join(os.homedir(), '.musiclib')); }
function manifestFile(root) { return path.join(root, 'library.json'); }
function tracksFile(root) { return path.join(root, 'tracks.json'); }
function ensureLibrary(root) { if (!fs.existsSync(manifestFile(root))) fail('NOT_A_LIBRARY', `Not a music library: ${root}; run init first`); }
function loadTracks(root) { ensureLibrary(root); return fs.existsSync(tracksFile(root)) ? readJson(tracksFile(root)) : []; }
function saveTracks(root, tracks) { writeJson(tracksFile(root), tracks.sort((a, b) => a.id.localeCompare(b.id))); }

function parseArgs(argv) {
  const options = { _: [] };
  const repeatable = new Set(['tag', 'turn']);
  const flags = new Set(['json', 'force', 'live', 'dry-run', 'no-wait', 'global', 'yes', 'help', 'copy', 'mix-original', 'commercial-only', 'no-analyze']);
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
function sceneProfile(value) {
  if (!value) return null;
  if (SCENE_PROFILES[value]) return { id: value, ...SCENE_PROFILES[value] };
  return { id: value, label: value, brief: value.replace(/[-_]+/g, ' '), weights: {}, avoid: {} };
}

function executable(name) { return spawnSync(name, ['-version'], { encoding: 'utf8' }).status === 0; }
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
  if (executable('ffprobe')) {
    const result = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:format_tags=title,artist,album,genre:stream=codec_type', '-of', 'json', file], { encoding: 'utf8', timeout: 30000 });
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
  const lexical = raw.split(/[^\p{L}\p{N}]+/u).filter((term) => term.length >= 2 || /[^\x00-\x7F]/.test(term));
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
  return loadTracks(root)
    .filter((track) => !options['commercial-only'] || track.commercial_use === true)
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

function extractFrames(video, directory) {
  if (!executable('ffmpeg')) fail('FFMPEG_REQUIRED', 'ffmpeg is required for automatic video analysis');
  fs.mkdirSync(directory, { recursive: true });
  const info = probe(video); const duration = info?.duration_seconds || 12; const positions = [0.15, 0.5, 0.85].map((ratio) => Math.max(0, duration * ratio));
  return positions.map((seconds, index) => {
    const output = path.join(directory, `frame-${index + 1}.jpg`);
    run('ffmpeg', ['-y', '-ss', String(seconds), '-i', video, '-frames:v', '1', '-vf', 'scale=960:-2', '-q:v', '3', output], 60000);
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
  if (!executable('ffmpeg')) fail('FFMPEG_REQUIRED', 'ffmpeg is required to add music to video');
  const videoMeta = probe(video); const args = ['-y', '-i', video, '-stream_loop', '-1', '-i', music];
  if (options['mix-original'] && videoMeta?.has_audio) {
    const original = Number(options['original-volume'] || 0.2); const musicVolume = Number(options['music-volume'] || 0.8);
    args.push('-filter_complex', `[0:a]volume=${original}[original];[1:a]volume=${musicVolume}[music];[original][music]amix=inputs=2:duration=first:dropout_transition=2[a]`, '-map', '0:v:0', '-map', '[a]');
  } else {
    args.push('-filter:a', `volume=${Number(options['music-volume'] || 0.8)}`, '-map', '0:v:0', '-map', '1:a:0');
  }
  args.push('-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', output);
  run('ffmpeg', args, 1800000); return path.resolve(output);
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
function setup(options) {
  const installArgs = ['install', '-g', `${PACKAGE}@${VERSION}`];
  if (options['dry-run']) return { ok: true, dry_run: true, global_install: ['npm', ...installArgs], skill_install: installSkill({ ...options, global: true, yes: true }) };
  const result = spawnSync('npm', installArgs, { stdio: 'inherit' });
  if (result.error || result.status !== 0) fail('GLOBAL_INSTALL_FAILED', `Could not install ${PACKAGE} globally`, true, { exit_code: result.status });
  return installSkill({ ...options, global: true, yes: true });
}
function help() {
  console.log(`makaron-music-library-cli ${VERSION}\n\nUsage:\n  npx ${PACKAGE} setup [--agent <agent>]\n  musiclib <command> [options]\n\nCommands:\n  setup       Install the CLI and Agent Skill\n  doctor      Check Makaron, ffmpeg, and authentication\n  init        Initialize a music library\n  index       Index a local or Baidu Netdisk-synced music folder\n  list        List indexed tracks\n  profiles    List all bundled music intelligence profiles\n  brief       Turn a natural-language request into an agent-ready music brief\n  search      Search the local library by title, artist, tags, or natural language\n  recommend   Use music intelligence, then rank matching local tracks\n  export      Copy one selected track to an output path\n  generate    Generate original music through Makaron\n  wait        Wait for a Makaron music run\n  soundtrack  Pick music and add it to a video\n  validate    Validate indexed files and rights metadata\n\nAll command results are JSON.`);
}

async function main() {
  const [command = 'help', ...rest] = process.argv.slice(2); const options = parseArgs(rest);
  if (command === 'help' || command === '--help' || options.help) return help();
  if (command === '--version' || command === 'version') return console.log(VERSION);
  if (command === 'setup') return emit(setup(options));
  if (command === 'install-skill') return emit(installSkill(options));
  if (command === 'doctor') {
    const authFile = fs.existsSync(path.join(os.homedir(), '.makaron', 'auth.json'));
    const profiles = intelligenceProfiles();
    const result = { ok: true, ffmpeg: executable('ffmpeg'), ffprobe: executable('ffprobe'), audio_duration_fallback: fs.existsSync('/usr/bin/afinfo') ? 'afinfo' : null, music_intelligence: { ok: profiles.status === 'ok', version: '0.8.1', profiles: profiles.count }, makaron_command: providerCommand(), makaron_auth: Boolean(process.env.MAKARON_API_KEY || authFile), api_key_env_present: Boolean(process.env.MAKARON_API_KEY), auth_file_present: authFile };
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
    const query = required(options, 'query'); const tracks = search(root, query, options);
    return emit({ ok: true, query, count: tracks.length, tracks });
  }
  if (command === 'recommend') {
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
