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
  fs.writeFileSync(healing, 'offline fixture');
  fs.writeFileSync(epic, 'offline fixture');
  fs.writeFileSync(`${healing}.music.json`, JSON.stringify({ tags: ['japanese', 'healing', 'piano', 'no_vocals'], license: 'owned-commercial-license', commercial_use: true }));

  const setup = call(['setup', '--dry-run']);
  assert.equal(setup.ok, true);
  assert.match(setup.skill_install.skill_file, /skills\/makaron-music-library\/SKILL\.md$/);

  assert.equal(call(['init', '--library', library, '--name', 'Smoke']).ok, true);
  const indexed = call(['index', '--library', library, '--source', source]);
  assert.equal(indexed.scanned, 2);
  assert.equal(indexed.source_name, 'baidu-netdisk-local');

  const searched = call(['search', '--library', library, '--query', '日系治愈纯音乐', '--commercial-only']);
  assert.equal(searched.count, 1);
  assert.match(searched.tracks[0].title, /日系治愈/);

  const recommended = call(['recommend', '--library', library, '--brief', '史诗、紧张的电影预告片管弦乐']);
  assert.match(recommended.recommendation.title, /史诗管弦/);

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
  assert.equal(validated.unknown_rights.length, 1);

  console.log('Music library CLI smoke test passed');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
