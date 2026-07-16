# Agent instructions

- Keep the wrapper compatible with Node.js 18+ and limit runtime dependencies to the vendored intelligence layer's audited requirements.
- Treat `vendor/music-prompt-library` as an upstream snapshot. Record its source commit and rerun both upstream and wrapper tests before updating it.
- Keep the bundled Agent Skill at `skills/makaron-music-library/SKILL.md`; do not add files inside that Skill folder.
- Emit machine-readable JSON on stdout and errors on stderr.
- Never log credentials or accept API keys as command arguments.
- Default Agent-facing search and recommendation to the authenticated central API. Require `--local` or `--library` before accessing an owner index.
- Never return server filesystem paths to a remote Agent. Issue short-lived signed audio URLs only after token authentication.
- Bind unauthenticated test servers only to localhost. Production deployment must use HTTPS and a secret manager.
- Never overwrite source audio or video files.
- Treat music rights as unknown unless explicit metadata says otherwise.
- Run `node --check bin/musiclib.mjs`, `npm test`, a packaged-install smoke test, the Skill validator, `npm audit --omit=dev`, and `npm pack --dry-run` before release.
