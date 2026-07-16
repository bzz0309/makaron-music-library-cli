# Handoff

The project is `makaron-music-library-cli` version 0.1.0. The public baseline repository is `https://github.com/bzz0309/makaron-music-library-cli`. The current Cloudflare changes are staged locally and are not yet pushed.

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

Worker secrets are `AGENT_TOKENS` and `SIGNING_SECRET`. Owner upload secrets are `CLOUDFLARE_API_TOKEN`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY`; account/database/bucket identifiers use the documented environment variables. Never commit or print any of them.

## Next actions

1. Finish local syntax, smoke, package, Skill, and dependency checks.
2. Rebuild or locate the real 934-track local index and run `cloud-sync --dry-run`.
3. Show the user the exact pending file/architecture changes.
4. Only after explicit approval, copy the staged changes into the real repository and push.
5. Only after separate explicit approval and Cloudflare login, create R2/D1, set Worker Secrets, deploy, and upload audio.
6. Test the final Workers URL from a clean Agent installation before publishing npm.

Cloudflare D1 database `makaron-music-library` and private R2 bucket `makaron-music-library` have been created. The D1 migration is applied. The Worker and secrets are deployed at `https://makaron-music-library-api.bzz0309.workers.dev`; verify TLS propagation before calling the public endpoint live.

## Known later work

- Per-Agent token issuance, revocation, and audit logs.
- Remote video upload and server-side soundtrack mixing.
- Beat, vocal, and climax analysis beyond current metadata/profile matching.
- Direct Baidu cloud API ingestion after a supported authorization flow is selected.
