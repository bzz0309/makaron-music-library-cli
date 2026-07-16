# Handoff

The initial 0.1.0 CLI is implemented as a separate npm package. Its core commands are `init`, `index`, `search`, `recommend`, `export`, `generate`, `wait`, and `soundtrack`. The Agent Skill is intentionally one `SKILL.md` file.

Before publishing, confirm the final npm/GitHub names and run the full validation set from `AGENT.md`. For Baidu Netdisk, version 0.1.0 supports the desktop client's locally visible files. Add direct cloud search only after selecting a supported Baidu OAuth/API flow and testing placeholder-download behavior.

Node syntax, smoke tests, Skill validation, and npm dry-pack pass. This machine did not have `ffmpeg` on 2026-07-16, so install it before performing the first real soundtrack assembly test.
