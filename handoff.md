# Handoff

The production CLI is `makaron-music-library-cli` version 0.2.0. npm `latest` and the live Cloudflare Worker provide self-service Agent registration. GitHub commit `029b2aa` is on `agent/self-register-agents` with draft PR #1 targeting `main`.

## Current architecture

- Any Agent installs the npm CLI and the single-file Skill.
- In the 0.2.0 candidate, setup automatically registers each Agent and saves a private local credential; the owner no longer distributes shared Tokens.
- Remote `search`, `recommend`, and `access` call a Cloudflare Worker.
- D1 stores searchable metadata; private R2 stores audio.
- Signed audio routes hide object keys and support HTTP Range.
- Owner-only `init`, `index`, `cloud-sync`, and `soundtrack` operate on local files.
- Makaron handles original generation when matching or rights are insufficient.

Worker routes:

- `GET /v1/health`
- `POST /v1/register` (0.2.0 candidate)
- `POST /v1/register/verify` (0.2.0 candidate)
- `GET /v1/search`
- `POST /v1/recommend`
- `POST /v1/tracks/:id/access`
- `GET /v1/tracks/:id/audio`
- `PUT /v1/admin/tracks/:id/audio`
- `POST /v1/admin/tracks/batch`

Worker secrets are `SIGNING_SECRET` and `ADMIN_TOKEN`; production still has legacy `AGENT_TOKENS`, which remains compatible after the 0.2.0 upgrade. The owner CLI reads the matching administrator value from `MUSICLIB_ADMIN_TOKEN`; it does not need Cloudflare account or R2 S3 credentials. Never commit or print any secret.

## Next actions

1. Review and merge GitHub PR #1 when the release diff is ready for `main`.
2. Verify `npx makaron-music-library-cli setup` from an external Agent; it should not request a Token.
3. Do not sync all 4,291 local rows until their audio is uploaded.

Cloudflare D1 database `makaron-music-library` contains 934 tracks and private R2 contains the uploaded collection. Health, Agent authentication, title/artist search, signed access, and Range playback are live. The local source now contains 4,291 tracks, so only the filtered 934-track manifest may receive metadata-only updates until additional audio uploads are explicitly approved.

## Known later work

- Admin CLI/API for listing and revoking Agent credentials without direct D1 commands.
- Remote video upload and server-side soundtrack mixing.
- Beat, vocal, and climax analysis beyond current metadata/profile matching.
- Direct Baidu cloud API ingestion after a supported authorization flow is selected.
