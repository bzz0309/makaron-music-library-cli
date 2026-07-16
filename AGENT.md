# Agent instructions

- Keep the CLI compatible with Node.js 18+ and keep stdout machine-readable.
- Keep `skills/makaron-music-library/` limited to one `SKILL.md`.
- Treat `vendor/music-prompt-library` as an upstream snapshot and record its source commit.
- Default Agent search/recommendation to the authenticated Worker API; require `--local` or `--library` for owner filesystem access.
- Never log or accept credentials as command arguments. Read secrets only from environment variables or Cloudflare Worker Secrets.
- Store self-registered Agent credentials only in `~/.musiclib/auth.json` with `0600` permissions; store only credential hashes in D1 and return raw credentials only once.
- Keep unattended registration origin-throttled, proof-of-work protected, individually revocable, and subject to route-specific daily quotas.
- Never return local paths or R2 object keys to remote Agents.
- Keep the R2 bucket private. Issue only short-lived HMAC-signed audio links after Bearer authentication.
- Keep `/v1/health` public and free of catalog metadata.
- Preserve HTTP Range support on signed audio responses.
- Never overwrite source media. Treat music rights as unknown unless explicit metadata proves otherwise.
- Do not create paid Cloudflare resources, publish npm, or push release changes without explicit user approval.
- Before release run syntax checks, `npm test`, Skill validation, a packaged-install smoke test, `npm audit --omit=dev`, and `npm pack --dry-run`.
