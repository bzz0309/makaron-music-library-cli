---
name: makaron-music-library
description: Search, recommend, generate, export, and add music to videos through the makaron-music-library-cli. Use when an agent needs to find songs in a local or Baidu Netdisk-synced collection, choose fitting background music from a video or creative brief, create original music with Makaron, or mix a selected track into a video.
---

# Makaron Music Library

Use `musiclib` when installed globally. Otherwise use `npx -y makaron-music-library-cli`. The CLI owns the music index, natural-language retrieval, video-frame analysis, Makaron music jobs, and ffmpeg soundtrack assembly.

Never request, print, save, or pass `MAKARON_API_KEY` as a command argument. Read it only from the environment or Makaron's auth file. Treat every indexed track as rights-unknown until its metadata explicitly permits the intended use.

## Workflow

1. Run `musiclib doctor` before generation or video mixing.
2. Initialize once with `musiclib init`.
3. Index each local or Baidu Netdisk-synced music directory with `musiclib index`.
4. For an explicit request, use `musiclib search --query`. For a video, use `musiclib recommend --video`; it samples three frames and asks Makaron for a concise music brief.
5. Prefer a fitting owned-library track. Use `musiclib generate` only when the library has no suitable result or the user asks for original music.
6. Before commercial delivery, verify license and `commercial_use` metadata. Never infer rights from possession of a file.
7. Use `musiclib soundtrack` to produce a new video file. Never overwrite the source video.

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

Recommend music for a video. Pass `--brief` to avoid live visual analysis:

```bash
$MUSICLIB recommend --video "/path/to/video.mp4"
$MUSICLIB recommend --video "/path/to/video.mp4" --brief "温柔治愈的日常 vlog，钢琴和木吉他，无人声"
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
```

Use `--dry-run` on `generate` or `soundtrack` before spending credits or writing final media. For cloud-only Baidu Netdisk files, ask the user or sync client to download them locally before export or mixing.

## Result handling

- Prefer JSON fields over prose: `recommendation`, `tracks`, `run_id`, `outputs`, and `output`.
- Return `NO_MATCHING_TRACK` as a prompt to broaden the brief or generate original music.
- Return `TRACK_NOT_LOCAL` as a request to download the Baidu Netdisk file, not as a reason to re-index the whole library.
- Do not call a recommendation licensed or commercially safe unless metadata says so.
