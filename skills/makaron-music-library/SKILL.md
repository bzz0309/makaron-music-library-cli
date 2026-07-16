---
name: makaron-music-library
description: Understand music intent, search, recommend, generate, export, and add music to videos through the makaron-music-library-cli. Use when an agent needs an expert music brief, song lookup in a local or Baidu Netdisk-synced collection, fitting background music for a video or content Skill, original Makaron music, or a mixed soundtrack file.
---

# Makaron Music Library

Use `musiclib` when installed globally. Otherwise use `npx -y makaron-music-library-cli`. The CLI owns a bundled 40-Profile music intelligence layer, the local music index, natural-language retrieval, video-frame analysis, Makaron music jobs, and ffmpeg soundtrack assembly.

Never request, print, save, or pass `MAKARON_API_KEY` as a command argument. Read it only from the environment or Makaron's auth file. Treat every indexed track as rights-unknown until its metadata explicitly permits the intended use.

## Workflow

1. Run `musiclib doctor` before generation or video mixing.
2. Initialize once with `musiclib init`.
3. Index each local or Baidu Netdisk-synced music directory with `musiclib index`.
4. Use `musiclib brief --request` when another Agent needs structured music intelligence without a local song. Select `generic`, `makaron`, `video_editor`, or `short_video_agent` with `--adapter`.
5. For a known use case, use `musiclib recommend --request`, or pass the compatible aliases `--scene kpop-stage` and `--scene ecommerce`. For a video, add `--video`; the CLI combines visual analysis with the intelligence Profile.
6. Prefer a fitting owned-library track. Use `musiclib generate` when the library has no suitable result, rights are unclear, or the user asks for original music.
7. Before commercial delivery, verify license and `commercial_use` metadata. Never infer rights from possession of a file.
8. Use `musiclib soundtrack` to produce a new video file. Never overwrite the source video.

## Commands

Define the launcher:

```bash
MUSICLIB="musiclib"
command -v musiclib >/dev/null 2>&1 || MUSICLIB="npx -y makaron-music-library-cli"
```

Initialize and index a local Baidu Netdisk folder:

```bash
$MUSICLIB init --name "My Music Library"
$MUSICLIB index --source "/path/to/BaiduNetdisk/Music" --source-name baidu-netdisk-local
```

Search or export a track:

```bash
$MUSICLIB search --query "日系、治愈、轻快、纯音乐" --limit 5
$MUSICLIB export --track TRACK_ID --output "/path/to/delivery/music.mp3"
```

Build a structured brief for any Agent:

```bash
$MUSICLIB brief --request "20秒K-pop女团舞台，强节拍、副歌高潮" --duration 20 --adapter makaron
$MUSICLIB brief --request "15秒高端美妆电商视频，干净现代、无人声" --duration 15 --adapter video_editor
```

Recommend music for a video. Pass `--brief` to avoid live visual analysis:

```bash
$MUSICLIB recommend --video "/path/to/video.mp4"
$MUSICLIB recommend --video "/path/to/video.mp4" --brief "温柔治愈的日常 vlog，钢琴和木吉他，无人声"
```

Use a scene profile when another Skill already knows the video purpose:

```bash
$MUSICLIB recommend --scene kpop-stage --duration 20 --request "五人女团，强灯光切换，副歌高潮"
$MUSICLIB recommend --scene ecommerce --duration 15 --request "高端美妆精华，干净、现代、无人声"
```

Read `decision.action` before delivery. When it is `review-rights-or-generate-original`, verify rights or generate an original replacement:

```bash
$MUSICLIB generate --scene ecommerce --prompt "15 seconds, premium beauty product launch, clean electronic pulse, no vocals"
```

Create original music with Makaron:

```bash
$MUSICLIB generate --prompt "30 seconds, gentle Japanese acoustic pop, no vocals" --no-wait
$MUSICLIB wait --run-id RUN_ID
```

Add a selected or automatically recommended track to a new video:

```bash
$MUSICLIB soundtrack --video input.mp4 --track TRACK_ID --output output.mp4
$MUSICLIB soundtrack --video input.mp4 --brief "cinematic and hopeful" --output output.mp4
$MUSICLIB soundtrack --video input.mp4 --output output.mp4 --mix-original --music-volume 0.7 --original-volume 0.2
$MUSICLIB soundtrack --video input.mp4 --scene kpop-stage --output output.mp4
```

Use `--dry-run` on `generate` or `soundtrack` before spending credits or writing final media. For cloud-only Baidu Netdisk files, ask the user or sync client to download them locally before export or mixing.

## Result handling

- Prefer JSON fields over prose: `recommendation`, `tracks`, `run_id`, `outputs`, and `output`.
- Return `NO_MATCHING_TRACK` as a prompt to broaden the brief or generate original music.
- Return `TRACK_NOT_LOCAL` as a request to download the Baidu Netdisk file, not as a reason to re-index the whole library.
- Do not call a recommendation licensed or commercially safe unless metadata says so.
