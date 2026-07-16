# Makaron Music Library CLI

An npm CLI for AI agents to search an owned music collection, recommend music for a video, create original music through Makaron, and mix a selected track into a new video file.

## Install for any Agent

```bash
npx makaron-music-library-cli setup
```

`setup` installs the `musiclib` command and the bundled single-file Agent Skill. The CLI and the Makaron Skill marketplace are separate systems.

## Quick start

```bash
musiclib init --name "My Music"
musiclib index --source "/path/to/BaiduNetdisk/Music" --source-name baidu-netdisk-local
musiclib search --query "日系治愈、轻快、纯音乐"
musiclib recommend --video "/path/to/video.mp4"
musiclib soundtrack --video input.mp4 --output output.mp4
```

Use an explicit brief when you do not want video frames analyzed through Makaron:

```bash
musiclib soundtrack --video input.mp4 \
  --brief "温暖治愈的生活 vlog，轻快木吉他，无人声" \
  --output output.mp4
```

Generate original music when the collection has no suitable result:

```bash
musiclib generate --prompt "30 seconds, warm piano and strings, cinematic, no vocals"
```

## Baidu Netdisk

Version 0.1.0 indexes folders that the Baidu Netdisk desktop client has made visible on the local filesystem. Search works from filenames, folders, embedded metadata, and optional adjacent `.music.json` sidecars. A cloud-only file must be downloaded locally before export or video mixing.

Example sidecar `song.mp3.music.json`:

```json
{
  "title": "Morning Walk",
  "artist": "Example Artist",
  "tags": ["japanese", "healing", "guitar", "no_vocals"],
  "description": "light daily vlog background music",
  "license": "owned-commercial-license",
  "commercial_use": true
}
```

Direct Baidu cloud-account search is intentionally left behind a future data-source adapter because it requires a supported Baidu authorization flow. The CLI never asks an Agent to expose a Netdisk password.

## Requirements

- Node.js 18+
- `ffprobe` for duration and media metadata
- `ffmpeg` for frame sampling and soundtrack assembly
- `makaron-cli` authentication for video analysis and original music generation

Set `MUSICLIB_LIBRARY` to change the default library location (`~/.musiclib`). Run `musiclib doctor --live` to verify the complete toolchain.

## Rights

Possessing a music file does not prove permission to publish it. Search is allowed with unknown metadata, but `--commercial-only` only returns tracks explicitly marked `commercial_use: true`.
