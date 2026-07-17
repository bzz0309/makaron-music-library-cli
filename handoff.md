# Handoff

Production is `makaron-music-library-cli` version 0.3.1 on GitHub `main` and npm `latest`. Worker version `cf075773-1808-4553-8592-2b2f51c0d32b` keeps explicit no-vocals intent as a hard constraint, adds automatic Makaron-original fallback for remote video soundtracks, and deduplicates recommendations by canonical title and artist while preferring non-B-Roll variants.

The Tencent relay now caps browser and player audio requests at 4MB so SCF stays below its response-body limit. Browser links return a bounded `206` audio preview instead of `406 ERR_INVALID_RESPONSE`; non-browser full downloads preserve the CLI's complete multi-range fallback. The change is server-side, so no npm package update or CLI reinstall is required. R2 and D1 catalog contents are unchanged.

## Current architecture

- Any Agent installs the npm CLI and the single-file Skill.
- Setup automatically registers each Agent and saves a private local credential; the owner no longer distributes shared Tokens.
- Remote `search`, `recommend`, and `access` use a Tencent Hong Kong SCF Web Function, which relays the allowlisted Agent routes to the Cloudflare Worker.
- D1 stores searchable metadata; private R2 stores audio.
- Signed audio routes hide object keys and support HTTP Range.
- Owner-only `init`, `index`, `cloud-sync`, and `soundtrack` operate on local files.
- Makaron handles original generation when matching or rights are insufficient.

Worker routes:

- `GET /v1/health`
- `POST /v1/register`
- `POST /v1/register/verify`
- `GET /v1/search`
- `POST /v1/recommend`
- `POST /v1/tracks/:id/access`
- `GET /v1/tracks/:id/audio`
- `PUT /v1/admin/tracks/:id/audio`
- `POST /v1/admin/tracks/batch`

Worker secrets are `SIGNING_SECRET`, `ADMIN_TOKEN`, and `RELAY_SHARED_SECRET`; Tencent SCF stores the matching value as `MUSICLIB_RELAY_SECRET`. Production still has legacy `AGENT_TOKENS`. The owner CLI reads the matching administrator value from `MUSICLIB_ADMIN_TOKEN`; it does not need Cloudflare account or R2 S3 credentials. Never commit or print any secret.

## Next actions

1. Test the public `soundtrack-remote` command in Miaoda or another Agent with a real direct CDN video URL.
2. Do not sync all 4,291 local rows until their audio is uploaded.

Cloudflare D1 database `makaron-music-library` contains 934 tracks and private R2 contains the uploaded collection. The Tencent endpoint is `https://1358141432-dnfx3j6t7j.ap-hongkong.tencentscf.com`. Live health, self-registration, K-pop search, signed access URL rewriting, and a 1KB Range read all pass through it. The local source now contains 4,291 tracks, so only the filtered 934-track manifest may receive metadata-only updates until additional audio uploads are explicitly approved.

## Known later work

- Admin CLI/API for listing and revoking Agent credentials without direct D1 commands.
- Remote video upload and server-side soundtrack mixing.
- Beat, vocal, and climax analysis beyond current metadata/profile matching.
- Direct Baidu cloud API ingestion after a supported authorization flow is selected.
- A first-party preview page on a normal web/CDN origin if direct in-browser playback is required; Tencent SCF's function URL currently forces `Content-Disposition: attachment`.
