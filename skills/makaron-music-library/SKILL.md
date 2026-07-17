---
name: makaron-music-library
description: Understand music intent, remotely search and recommend an authorized central music collection, request short-lived audio access, generate original music, and add music to videos through makaron-music-library-cli. Use when Makaron or any external Agent needs song lookup by title or artist, fitting BGM for a video or content Skill, an expert music brief, original Makaron music, or owner-side local soundtrack assembly.
---

# Makaron Music Library

Use `musiclib` when installed globally. Otherwise use `npx -y makaron-music-library-cli`. Treat remote mode as the default for Makaron and external Agents. Use local mode only for an owner/admin who has filesystem access to the indexed collection.

Accept ordinary user language as the interface. Never ask the user to choose `search`, `recommend`, a scene ID, a CLI flag, or a track tag. Translate requests such as "给这个 K-pop 女团舞台配乐" or "给美妆广告找高级感 BGM" into internal CLI calls. The CLI and service infer known scenes from natural language even if an Agent chooses plain search.

Before first use, run `npx -y makaron-music-library-cli setup`. Setup automatically connects to the default hosted library, self-registers this Agent, and stores its credential in `~/.musiclib/auth.json`. If the CLI is already installed but no credential exists, run `musiclib register`. Do not ask the user or library owner to manually create or paste `MUSICLIB_API_TOKEN`.

Read central-library access from the private auth file or, when explicitly configured by an operator, `MUSICLIB_API_TOKEN`. Never print a credential, save it in generated files, pass it as a command argument, or copy it into chat. Apply the same rule to `MAKARON_API_KEY`. Treat every indexed track as rights-unknown until its metadata explicitly permits the intended use.

## Workflow

1. Run `musiclib doctor --remote` before central-library work. If authentication is missing, run `musiclib register` once and retry.
2. Search by title, artist, or exact metadata with `musiclib search`; do not add `--local`. For scene suitability, prefer `recommend` and pass the user's original wording through `--request`. Do not require the user to name a scene.
3. Use `musiclib brief --request` when another Agent needs structured music intelligence without selecting a song. Select `generic`, `makaron`, `video_editor`, or `short_video_agent` with `--adapter`.
4. Use `musiclib recommend --request` with the user's natural-language request. Known K-pop and e-commerce scenes are inferred automatically; explicit `--scene` is an internal optimization, never a user requirement. For inferred `kpop-stage`, accept only results with a `kpop` tag and `scene:kpop` in `match.matched`.
5. Read `decision` and rights metadata. When approved access is needed, call `musiclib access --track TRACK_ID` and use the returned URL before `expires_at`.
6. Use `musiclib generate` when no suitable result exists, rights are unclear, or the user asks for original music.
7. Use `--local` only when operating the owner's filesystem. Before commercial delivery, verify license and `commercial_use`; never infer rights from possession.
8. When given a direct public HTTP/HTTPS video URL, use `musiclib soundtrack-remote` to download, recommend, access, fade, and mix locally. Use `--allow-unknown-rights` only after the user authorizes a non-commercial test. Never overwrite an existing output unless the user explicitly asks.
9. Use local `musiclib soundtrack` for an owner-side local library and video.
9. When the owner explicitly asks to publish an indexed library, run `musiclib cloud-sync --dry-run` first. Upload only after the owner confirms the reported track and byte counts.

## Commands

Define the launcher:

```bash
MUSICLIB="musiclib"
command -v musiclib >/dev/null 2>&1 || MUSICLIB="npx -y makaron-music-library-cli"
```

Bootstrap an Agent without owner involvement:

```bash
npx -y makaron-music-library-cli setup
musiclib doctor --remote
```

Search the central library:

```bash
$MUSICLIB doctor --remote
$MUSICLIB search --query "Taylor Swift Love Story" --limit 5
$MUSICLIB search --query "日系、治愈、轻快、纯音乐" --limit 5
```

Request short-lived authorized audio access:

```bash
$MUSICLIB access --track TRACK_ID
```

Add fitting music to a public CDN video:

```bash
$MUSICLIB soundtrack-remote --video-url "https://cdn.example.com/video.mp4" --scene ecommerce --output output.mp4 --dry-run
$MUSICLIB soundtrack-remote --video-url "https://cdn.example.com/video.mp4" --scene ecommerce --output output.mp4
```

The URL must resolve directly to downloadable media. The CLI prefers system `ffmpeg` and `ffprobe`, then uses its installed platform binaries. By default the command preserves original audio at 0.2 volume, mixes music at 0.35, applies one-second fades, limits video downloads to 500MB, and refuses to overwrite an existing output.

Build a structured brief for any Agent:

```bash
$MUSICLIB brief --request "20秒K-pop女团舞台，强节拍、副歌高潮" --duration 20 --adapter makaron
$MUSICLIB brief --request "15秒高端美妆电商视频，干净现代、无人声" --duration 15 --adapter video_editor
```

Recommend music from a video description:

```bash
$MUSICLIB recommend --brief "温柔治愈的日常 vlog，钢琴和木吉他，无人声"
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

Owner-only local indexing and soundtrack assembly:

```bash
$MUSICLIB init --local --name "My Music Library"
$MUSICLIB index --local --source "/path/to/BaiduNetdisk/Music" --source-name baidu-netdisk-local
$MUSICLIB soundtrack --local --video input.mp4 --track TRACK_ID --output output.mp4
```

Owner-only Cloudflare synchronization:

```bash
$MUSICLIB cloud-sync --library "/path/to/index" --dry-run
$MUSICLIB cloud-sync --library "/path/to/index" --concurrency 3
$MUSICLIB cloud-sync --library "/path/to/index" --metadata-only
```

Read the upload endpoint from `MUSICLIB_API_URL` and the separate administrator credential from `MUSICLIB_ADMIN_TOKEN`. Never start the non-dry-run command without explicit owner approval.

Use `--dry-run` on `generate`, `soundtrack`, or `soundtrack-remote` before spending credits or writing final media. For cloud-only Baidu Netdisk files, ask the user or sync client to download them locally before export or mixing.

## Result handling

- Prefer JSON fields over prose: `recommendation`, `tracks`, `url`, `expires_at`, `run_id`, `outputs`, and `output`.
- Never expect or expose a remote track's server filesystem path.
- Return `NO_MATCHING_TRACK` as a prompt to broaden the brief or generate original music.
- Return `RIGHTS_REVIEW_REQUIRED` without mixing when the selected track lacks verified usage rights; never silently add `--allow-unknown-rights`.
- Return `DAILY_QUOTA_EXCEEDED` as a request to wait for the next quota window or contact the library owner; do not repeatedly self-register to evade limits.
- Return `TRACK_NOT_LOCAL` to the library owner, not as a request for an external Agent to access Baidu Netdisk.
- Do not call a recommendation licensed or commercially safe unless metadata says so.
