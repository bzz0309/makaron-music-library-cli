#!/usr/bin/env node

import fs from 'node:fs';

const args = process.argv.slice(2);
if (process.env.MAKARON_FAKE_LOG) fs.appendFileSync(process.env.MAKARON_FAKE_LOG, `${JSON.stringify(args)}\n`);

if (args[0] === 'chat') {
  console.log(JSON.stringify({ runId: 'run_music_1', projectId: 'project_music_1', projectUrl: 'https://example.invalid/project_music_1' }));
} else if (args[0] === 'responses' && args[1] === 'watch') {
  console.log(JSON.stringify({ status: 'completed' }));
} else if (args[0] === 'responses' && args[1] === 'get' && args.includes('--pick')) {
  console.log('gentle healing Japanese acoustic music, light guitar and piano, no vocals');
} else if (args[0] === 'responses' && args[1] === 'get') {
  console.log(JSON.stringify({ status: 'completed', output: [{ id: 'audio_1', type: 'music', url: 'https://example.invalid/music.mp3', status: 'completed' }] }));
} else if (args[0] === 'list') {
  console.log(JSON.stringify({ ok: true }));
} else {
  console.error(`Unexpected fake Makaron args: ${JSON.stringify(args)}`);
  process.exitCode = 2;
}
