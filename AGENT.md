# Agent instructions

- Keep the package dependency-free and compatible with Node.js 18+.
- Keep the bundled Agent Skill at `skills/makaron-music-library/SKILL.md`; do not add files inside that Skill folder.
- Emit machine-readable JSON on stdout and errors on stderr.
- Never log credentials or accept API keys as command arguments.
- Never overwrite source audio or video files.
- Treat music rights as unknown unless explicit metadata says otherwise.
- Run `node --check bin/musiclib.mjs`, `npm test`, the Skill validator, and `npm pack --dry-run` before release.
