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
