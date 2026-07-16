# Makaron Music Library CLI

An npm CLI and authenticated central-library API for Makaron and any external AI agent. Agents can understand a music request, search an authorized collection, request a short-lived audio URL, create original music through Makaron, and use local owner tools when needed.

The product has three layers:

- A bundled, platform-neutral music intelligence layer with 40 reviewed Profiles, Chinese/English intent parsing, explainable ranking, multi-turn refinement, and adapters for Makaron, video editors, and short-video agents.
- A remote Agent client. `search` and `recommend` connect to the central API by default, so the Agent never needs access to the owner's Mac or Baidu Netdisk path.
- An owner/server layer for indexing real audio files, protecting them with Agent tokens, issuing short-lived links, and performing local soundtrack assembly.

## Install for any Agent

```bash
npx makaron-music-library-cli setup --api-url https://music.example.com
export MUSICLIB_API_TOKEN=agent_token_from_library_owner
```

`setup` installs the `musiclib` command, saves the non-secret API URL, and installs the bundled single-file Agent Skill. Tokens are read only from `MUSICLIB_API_TOKEN`; they are never accepted as CLI arguments or written into the Skill.

## Quick start

```bash
musiclib search --query "日系治愈、轻快、纯音乐"
musiclib brief --request "20秒K-pop女团舞台，强节拍、副歌高潮" --duration 20 --adapter makaron
musiclib recommend --scene kpop-stage --duration 20
musiclib access --track TRACK_ID
```

Search results never expose server filesystem paths. `access` returns a short-lived audio URL that an authorized Agent can pass to Makaron or download before expiry.

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

## Run the central library

The owner indexes a Baidu Netdisk-synced folder and starts the authenticated API:

```bash
musiclib init --local --name "My Music"
musiclib index --local --source "/path/to/BaiduNetdisk/Music" --source-name baidu-netdisk-local
export MUSICLIB_SERVER_TOKEN=replace_with_a_long_random_agent_token
musiclib serve --local --host 127.0.0.1 --port 8787
```

For external Agents, deploy the same command behind HTTPS on an always-on server. Do not expose the owner's Mac directly to the internet. Version 0.1.0 uses one shared Agent token; per-Agent token issuance, revocation, audit logs, cloud video upload, object storage, and server-side video mixing remain later server milestones.

### Deploy on Render

The repository includes `Dockerfile` and `render.yaml`. The Blueprint creates a Singapore-region Docker web service, a 10GB persistent disk at `/data`, and the public `/v1/health` check. Search, recommendation, and audio access remain token-protected.

1. Push this repository to GitHub only after release approval.
2. In Render, create a Blueprint from the repository.
3. Enter a long random value for `MUSICLIB_SERVER_TOKEN` when Render prompts. Store the same value in a password manager; do not commit it.
4. Wait for `/v1/health` to return `ok: true`.
5. Add an SSH public key to Render and copy the local music folder to `/data/source` using the service-specific SCP command shown by Render.
6. Open the service Shell and index the uploaded folder:

```bash
node /app/bin/musiclib.mjs index \
  --library /data/library \
  --source /data/source \
  --source-name baidu-netdisk-upload
```

7. Configure an Agent with the HTTPS service URL and the shared token:

```bash
npx makaron-music-library-cli setup --api-url https://YOUR-SERVICE.onrender.com
export MUSICLIB_API_TOKEN=YOUR_AGENT_TOKEN
musiclib doctor --remote
musiclib search --query "K-pop stage"
```

Render requires a paid service for SSH and a persistent disk. Its official documentation supports transferring disk files with SCP/SFTP. For a larger or multi-instance library, move audio to private object storage and issue provider-managed presigned URLs instead of increasing the service disk.

To use local owner mode explicitly:

```bash
musiclib search --local --query "Taylor Swift Love Story"
musiclib recommend --local --scene ecommerce --duration 15
musiclib soundtrack --local --video input.mp4 --output output.mp4
```

## Baidu Netdisk

Version 0.1.0 indexes folders that the Baidu Netdisk desktop client has made visible on the server or owner filesystem. Remote Agents query the central index rather than Baidu directly. A cloud-only file must be downloaded on the central server before it can issue an audio link.

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

Set `MUSICLIB_API_URL` and `MUSICLIB_API_TOKEN` for Agent access. Set `MUSICLIB_LIBRARY` to change the owner library location (`~/.musiclib`). Run `musiclib doctor --remote` to verify the central API, or `musiclib doctor --local --live` to verify the owner toolchain and Makaron.

## Rights

Possessing a music file does not prove permission to publish it. Search is allowed with unknown metadata, but `--commercial-only` only returns tracks explicitly marked `commercial_use: true`.
