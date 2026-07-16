import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'musiclib.mjs');
const fake = path.join(root, 'test', 'fake-makaron.mjs');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'musiclib-smoke-'));
const library = path.join(temp, 'library');
const source = path.join(temp, 'BaiduNetdisk', 'Music');
const fakeLog = path.join(temp, 'fake-makaron.jsonl');
const env = { ...process.env, MAKARON_CLI_COMMAND: `${process.execPath} ${fake}`, MAKARON_FAKE_LOG: fakeLog };

function call(args, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', env });
  assert.equal(result.status, expectedStatus, `${args.join(' ')}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  return result.stdout.trim() ? JSON.parse(result.stdout) : null;
}

try {
  fs.mkdirSync(source, { recursive: true });
  const healing = path.join(source, '日系治愈钢琴.mp3');
  const epic = path.join(source, '史诗管弦预告片.wav');
  const kpopDir = path.join(source, '2024-韩语榜单');
  const ecommerceDir = path.join(source, '电商广告BGM');
  fs.mkdirSync(kpopDir, { recursive: true }); fs.mkdirSync(ecommerceDir, { recursive: true });
  const kpop = path.join(kpopDir, '高能女团Dance Pop.mp3');
  const ecommerce = path.join(ecommerceDir, 'Upbeat Product Background.mp3');
  fs.writeFileSync(healing, 'offline fixture');
  fs.writeFileSync(epic, 'offline fixture');
  fs.writeFileSync(kpop, 'offline fixture'); fs.writeFileSync(ecommerce, 'offline fixture');
  fs.writeFileSync(`${healing}.music.json`, JSON.stringify({ tags: ['japanese', 'healing', 'piano', 'no_vocals'], license: 'owned-commercial-license', commercial_use: true }));

  const setup = call(['setup', '--dry-run']);
  assert.equal(setup.ok, true);
  assert.match(setup.skill_install.skill_file, /skills\/makaron-music-library\/SKILL\.md$/);

  assert.equal(call(['init', '--library', library, '--name', 'Smoke']).ok, true);
  const indexed = call(['index', '--library', library, '--source', source]);
  assert.equal(indexed.scanned, 4);
  assert.equal(indexed.source_name, 'baidu-netdisk-local');

  const searched = call(['search', '--library', library, '--query', '日系治愈纯音乐', '--commercial-only']);
  assert.equal(searched.count, 1);
  assert.match(searched.tracks[0].title, /日系治愈/);

  const recommended = call(['recommend', '--library', library, '--brief', '史诗、紧张的电影预告片管弦乐']);
  assert.match(recommended.recommendation.title, /史诗管弦/);

  const profiles = call(['profiles', '--library', library]);
  assert.equal(profiles.count, 40);
  assert.ok(profiles.profiles.some((profile) => profile.metadata.id === 'kpop_performance_001'));
  const brief = call(['brief', '--request', '20秒K-pop女团舞台，强节拍、副歌高潮', '--duration', '20', '--adapter', 'makaron']);
  assert.equal(brief.intelligence.profile_id, 'kpop_performance_001');
  assert.match(brief.intelligence.seed_audio.music_prompt, /K-pop/i);
  const kpopRecommended = call(['recommend', '--library', library, '--scene', 'kpop-stage']);
  assert.match(kpopRecommended.recommendation.title, /女团Dance Pop/);
  assert.equal(kpopRecommended.profile_id, 'kpop_performance_001');
  assert.ok(!kpopRecommended.recommendation.match.matched.includes('k'));
  assert.equal(kpopRecommended.decision.publish_ready, false);
  const ecommerceRecommended = call(['recommend', '--library', library, '--scene', 'ecommerce', '--brief', '美妆产品快速展示']);
  assert.match(ecommerceRecommended.recommendation.title, /Upbeat Product/);
  assert.ok(['beauty_commercial_glow_001', 'product_launch_motion_001'].includes(ecommerceRecommended.profile_id));

  const exported = call(['export', '--library', library, '--track', searched.tracks[0].id, '--output', path.join(temp, 'export.mp3')]);
  assert.ok(fs.existsSync(exported.output));

  const video = path.join(temp, 'input.mp4'); fs.writeFileSync(video, 'offline video fixture');
  const soundtrack = call(['soundtrack', '--library', library, '--video', video, '--track', searched.tracks[0].id, '--output', path.join(temp, 'output.mp4'), '--dry-run']);
  assert.equal(soundtrack.plan.track_id, searched.tracks[0].id);

  const generated = call(['generate', '--prompt', 'gentle original piano music']);
  assert.equal(generated.ok, true);
  assert.equal(generated.outputs[0].type, 'audio');
  assert.equal(generated.run_id, 'run_music_1');

  const validated = call(['validate', '--library', library]);
  assert.equal(validated.ok, true);
  assert.equal(validated.unknown_rights.length, 3);

  console.log('Music library CLI smoke test passed');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
