# Worklog

## 2026-07-16

- Created the independent npm CLI at version 0.1.0.
- Added local/Baidu Netdisk-synced indexing, title/artist/tag/natural-language search, Makaron generation, and local ffmpeg soundtrack assembly.
- Added scene-aware `kpop-stage` and `ecommerce` matching plus rights-aware decisions and generation fallback prompts.
- Re-indexed the real 934-track, roughly 7.1GB collection; macOS `afinfo` supplied duration fallback.
- Integrated `music-prompt-library` 0.8.1 at upstream commit `2d19e7c`, including 40 Profiles and four Agent adapters.
- Added remote-default CLI routing, Bearer authentication, signed audio links, and a single-file Agent Skill.
- Published the existing baseline repository at `bzz0309/makaron-music-library-cli`; npm publication was not performed in this Cloudflare iteration.

## Cloudflare R2 update — 2026-07-16

- Replaced the planned Render persistent-disk deployment with Cloudflare Workers + private R2 + D1.
- Added the Worker API for health, search, recommendation, signed access, and audio delivery.
- Added HTTP Range support for media playback and resumable clients.
- Added D1 schema/migration and a native Node R2/D1 synchronization command.
- Added dry-run synchronization and Worker smoke tests with fake D1/R2 bindings.
- Removed Render/Docker deployment artifacts and rewrote deployment documentation.
- Pushed the Cloudflare architecture after approval; no audio upload has started yet.
- Created the APAC D1 database and private Standard-class R2 bucket after explicit approval; applied `0001_tracks.sql`.
- The first Worker deployment exposed an unused vendored `node:fs/promises` import. Enabled Cloudflare's official `nodejs_compat` flag so the bundled upstream module graph can be validated without changing the local CLI snapshot.
- Registered the account-level `bzz0309.workers.dev` subdomain and published `makaron-music-library-api`; generated Agent and signing secrets were installed in Worker Secrets and backed up in macOS Keychain.
- The first public health check encountered expected new-subdomain TLS propagation; repeat the live check after DNS/certificate propagation.

## Live deployment — 2026-07-17

- Confirmed the public health endpoint, Agent-authenticated search, and K-pop recommendation on the deployed Worker.
- Added a separate `ADMIN_TOKEN` upload channel that streams owner audio into private R2 and batch-upserts safe metadata into D1.
- Verified that the largest indexed track is about 15.3MB, below the configured 100MB upload ceiling.
- Kept Agent tokens unable to call administrator routes and removed the need to distribute Cloudflare account or R2 S3 credentials.
- Completed a real canary upload, search, signed access, and 1KB HTTP Range read; added bounded exponential retry before the full 7.35GB upload.
- Confirmed the owner-completed full upload: D1 contains 934 tracks and 7,354,593,476 indexed bytes; title/artist search and signed Range delivery pass.
- A later rescan found 4,291 locally available files. Built a filtered 934-track refresh manifest so metadata updates cannot create D1 rows for audio that has not been uploaded.
- Added metadata-only synchronization, removed numeric/profile-ID and stop-word false matches, and applied scene weights so K-pop favors Korean-tagged tracks and e-commerce favors BGM-tagged tracks.
- Published `makaron-music-library-cli@0.1.0` as the public npm `latest` release after explicit approval.
- Verified the registry artifact from an empty directory: npx version execution and authenticated live BGM search both pass.

## Agent self-registration — 2026-07-17

- Prepared version 0.2.0 with automatic per-Agent registration; no production deployment or package publication has been performed yet.
- Added a short-lived SHA-256 prefix challenge and per-origin registration throttling.
- Added D1 tables for challenge state, hashed Agent credentials, status-based revocation, and daily search/recommend/access usage.
- Added automatic credential storage at `~/.musiclib/auth.json` with `0600` permissions and retained `MUSICLIB_API_TOKEN` plus legacy Worker token compatibility.
- Added default hosted API configuration so external Agents can run `npx makaron-music-library-cli setup` without an owner-provided URL or Token.
- Added Worker and CLI smoke coverage for registration, hash-only persistence, credential reuse, and daily quotas.
- Applied the production D1 migration and deployed Worker version `040382ec-acbc-4d18-919d-b1c8d5880bd1`.
- Published `makaron-music-library-cli@0.2.0` to public npm with `latest` after upgrading the publishing client from npm 11.0.0 to 11.6.2 to avoid a broken web-auth polling endpoint.
- Verified the public package from a clean install with live self-registration and K-pop search; revoked both release-smoke credentials afterward.

## Miaoda-compatible Tencent relay — 2026-07-17

- Confirmed Feishu Miaoda could not reach the `workers.dev` production hostname even though the public Worker was healthy elsewhere.
- Added a dependency-free Node.js 18 Tencent SCF Web Function in Hong Kong with an allowlist for Agent routes, bounded JSON request bodies, signed client-origin forwarding, access URL rewriting, and streamed HTTP Range responses.
- Kept administrator upload routes blocked at the relay and kept R2/D1 as the source of truth.
- Added `RELAY_SHARED_SECRET` to the Worker, deployed trusted relay-origin support, and stored the matching Tencent secret outside the repository.
- Enabled the account's required CLS service, then deployed the 128MB Web Function at `https://1358141432-dnfx3j6t7j.ap-hongkong.tencentscf.com`.
- Corrected Tencent client-origin handling to prefer `X-Forwarded-For` after a real registration exposed unstable `X-Real-IP` values.
- Passed live health, Agent self-registration, K-pop search, signed access URL rewriting, and a 1KB `206` Range read.
- Published version 0.2.1 to GitHub `main` and public npm `latest` after owner approval; the npm CLI reported a successful `+ makaron-music-library-cli@0.2.1` release.

## Miaoda rotating-origin registration fix — 2026-07-17

- Reproduced Miaoda's `REGISTRATION_ORIGIN_CHANGED`: challenge and verification can leave the sandbox through different egress IPs.
- Added a random per-registration Agent session, signed only by the trusted Tencent relay; kept network-origin throttling independent from session binding.
- Applied D1 migration `0003_registration_session.sql`, deployed Worker version `7ebe04a6-ee1e-47d9-b4b9-88b847f2604a`, and updated the Tencent SCF relay.
- Passed local CLI, Worker, relay, and registration smoke tests, including different simulated relay origins with one signed Agent session.
- Passed a production canary through Tencent: automatic self-registration, K-pop search, and short-lived audio access all succeeded without an owner-provided Token.
