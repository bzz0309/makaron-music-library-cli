# Handoff

The initial 0.1.0 CLI is implemented as a separate npm package. Its core commands are `init`, `index`, `search`, `recommend`, `export`, `generate`, `wait`, and `soundtrack`. The Agent Skill is intentionally one `SKILL.md` file.

Before publishing, confirm the final npm/GitHub names and run the full validation set from `AGENT.md`. For Baidu Netdisk, version 0.1.0 supports the desktop client's locally visible files. Add direct cloud search only after selecting a supported Baidu OAuth/API flow and testing placeholder-download behavior.

Node syntax, smoke tests, Skill validation, and npm dry-pack pass. This machine did not have `ffmpeg` on 2026-07-16, so install it before performing the first real soundtrack assembly test.

The first scene profiles are `kpop-stage` and `ecommerce`. Recommendations now return `decision` and `generation_prompt`; do not treat an unknown-rights library track as publish-ready.

The CLI now vendors the compiled runtime of `music-prompt-library` 0.8.1 from commit `2d19e7c`. `brief` exposes all 40 Profiles and four adapters; `recommend`, `generate`, and automatic `soundtrack` selection consume the same intelligence layer. The two old scene names remain aliases, not a separate source of truth.

Before release, keep the vendor snapshot, `commander`, and `zod` in the npm package. Do not publish the full upstream development data or its test dependencies.
## Remote-first update — 2026-07-16

The CLI now defaults Agent-facing `search` and `recommend` to a central API. Owner operations remain local and should use `--local` or `--library`. The server command is `musiclib serve`; it requires `MUSICLIB_SERVER_TOKEN`, and clients require the same value through `MUSICLIB_API_TOKEN` for the current shared-token MVP.

Implemented routes:

- `GET /v1/health`
- `GET /v1/search`
- `POST /v1/recommend`
- `POST /v1/tracks/:id/access`
- `GET /v1/tracks/:id/audio` with an expiring signature

Remaining production work: choose hosting and storage, deploy behind HTTPS, replace the shared token with per-Agent issuance/revocation and audit logs, then add remote video upload and server-side mixing. Do not claim these remaining items are complete.

## Render deployment preparation

`Dockerfile`, `bin/server-entrypoint.sh`, `.dockerignore`, and `render.yaml` prepare a Singapore Render web service with a 10GB disk mounted at `/data`. The entrypoint initializes an empty catalog on first boot. `/v1/health` is intentionally public and contains no track data; all content routes remain protected.

Deployment still requires explicit approval to push the repository and create a paid Render service. After deployment, transfer the 7.1GB local collection to `/data/source` using Render SSH/SCP and index it into `/data/library`. Then update the npm client default only after the final HTTPS URL exists.
