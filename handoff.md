# Handoff

The project is `makaron-music-library-cli` version 0.1.0 at `https://github.com/bzz0309/makaron-music-library-cli`. The Cloudflare deployment is live at `https://makaron-music-library-api.bzz0309.workers.dev`.

## Current architecture

- Any Agent installs the npm CLI and the single-file Skill.
- Remote `search`, `recommend`, and `access` call a Cloudflare Worker.
- D1 stores searchable metadata; private R2 stores audio.
- Signed audio routes hide object keys and support HTTP Range.
- Owner-only `init`, `index`, `cloud-sync`, and `soundtrack` operate on local files.
- Makaron handles original generation when matching or rights are insufficient.

Worker routes:

- `GET /v1/health`
- `GET /v1/search`
- `POST /v1/recommend`
- `POST /v1/tracks/:id/access`
- `GET /v1/tracks/:id/audio`
- `PUT /v1/admin/tracks/:id/audio`
- `POST /v1/admin/tracks/batch`

Worker secrets are `AGENT_TOKENS`, `SIGNING_SECRET`, and `ADMIN_TOKEN`. The owner CLI reads the matching administrator value from `MUSICLIB_ADMIN_TOKEN`; it does not need Cloudflare account or R2 S3 credentials. Never commit or print any secret.

## Next actions

1. Deploy the administrator upload routes and install `ADMIN_TOKEN`.
2. Refresh the filtered 934-track metadata manifest with `--metadata-only`; do not sync all 4,291 local rows until their audio is uploaded.
3. Verify K-pop and e-commerce recommendations after the metadata refresh.
4. Test a clean Agent installation before publishing npm.

Cloudflare D1 database `makaron-music-library` contains 934 tracks and private R2 contains the uploaded collection. Health, Agent authentication, title/artist search, signed access, and Range playback are live. The local source now contains 4,291 tracks, so only the filtered 934-track manifest may receive metadata-only updates until additional audio uploads are explicitly approved.

## Known later work

- Per-Agent token issuance, revocation, and audit logs.
- Remote video upload and server-side soundtrack mixing.
- Beat, vocal, and climax analysis beyond current metadata/profile matching.
- Direct Baidu cloud API ingestion after a supported authorization flow is selected.
