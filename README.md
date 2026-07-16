# Makaron Music Library CLI

An npm CLI for AI agents to understand a music request, search an owned collection, recommend music for a video, create original music through Makaron, and mix a selected track into a new video file.

One installation contains two layers:

- A bundled, platform-neutral music intelligence layer with 40 reviewed Profiles, Chinese/English intent parsing, explainable ranking, multi-turn refinement, and adapters for Makaron, video editors, and short-video agents.
- A local execution layer for real audio files, Baidu Netdisk-synced folders, rights metadata, Makaron jobs, and video soundtrack assembly.

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
musiclib brief --request "20秒K-pop女团舞台，强节拍、副歌高潮" --duration 20 --adapter makaron
musiclib recommend --video "/path/to/video.mp4"
musiclib soundtrack --video input.mp4 --output output.mp4
```

Scene-aware matching lets another Agent or video Skill state the purpose directly:

```bash
musiclib recommend --scene kpop-stage --duration 20 \
  --brief "五人女团舞台，强节拍、灯光切换、副歌高潮"

musiclib recommend --scene ecommerce --duration 15 \
  --brief "高端美妆产品，干净现代、抓人、尽量无人声"
```

The result includes the selected intelligence Profile, interpreted intent, confidence, ranked local tracks, matching reasons, a rights-aware decision, and an original-generation fallback prompt. `kpop-stage` and `ecommerce` remain convenient aliases, while natural-language `--request` can access all 40 bundled Profiles.

## Music intelligence

Generate an agent-ready brief without searching local files:

```bash
musiclib brief \
  --request "15秒高端美妆精华电商视频，干净现代、抓人、无人声" \
  --duration 15 \
  --adapter makaron
```

Adapters:

- `generic`: professional generation brief
- `makaron`: Seed Audio prompt fields
- `video_editor`: structure, edit points, role, and loop behavior
- `short_video_agent`: hook, energy, beat-sync, and short-form loop behavior

Use `--turn` more than once for stateless multi-turn refinement:

```bash
musiclib brief \
  --turn "8秒手机发布会开场音乐" \
  --turn "更年轻一点" \
  --turn "不要太商业，更电影感" \
  --adapter makaron
```

The bundled intelligence snapshot comes from [`bzz0309/bzz`, branch `codex/music-prompt-library`](https://github.com/bzz0309/bzz/tree/codex/music-prompt-library/music-prompt-library). The wrapper ships only its compiled runtime and normal recommendation data.

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
- `ffprobe` for full media metadata; macOS `afinfo` is used as an audio-duration fallback
- `ffmpeg` for frame sampling and soundtrack assembly
- `makaron-cli` authentication for video analysis and original music generation
- Runtime dependencies `commander` and `zod`, installed automatically by npm

Set `MUSICLIB_LIBRARY` to change the default library location (`~/.musiclib`). Run `musiclib doctor --live` to verify the complete toolchain.

## Rights

Possessing a music file does not prove permission to publish it. Search is allowed with unknown metadata, but `--commercial-only` only returns tracks explicitly marked `commercial_use: true`.
