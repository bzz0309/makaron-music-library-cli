# Worklog

## 2026-07-16

- Created the independent npm CLI project at version 0.1.0.
- Added local/Baidu Netdisk-synced folder indexing and natural-language search.
- Added video-frame music analysis, Makaron music generation, export, and ffmpeg soundtrack assembly.
- Added a portable single-file Agent Skill and smoke-test scaffold.
- Passed Node syntax, smoke, Skill validation, and npm dry-pack checks.
- The current Mac does not have `ffmpeg`; the real media-assembly test is pending installation, while the CLI correctly reports the missing dependency.
- Direct Baidu cloud API integration remains open pending an approved OAuth/API route.
- Added scene-aware `kpop-stage` and `ecommerce` profiles, rights-aware recommendation decisions, generation fallback prompts, richer folder-name tagging, and macOS `afinfo` duration fallback.
- Re-indexed the real 934-track collection: all files received durations, K-pop results were constrained to the Korean chart collection, and e-commerce results prioritized the BGM collection. Beat, vocal, and climax analysis remains future work.
- Integrated `music-prompt-library` 0.8.1 at upstream commit `2d19e7c`: 40 Profiles, intent parsing, explainable confidence, multi-turn refinement, and four Agent adapters now ship inside the single CLI.
- Upstream 185 tests and all benchmark/workflow/adapter/confusion suites passed. Production dependency audit reported zero known vulnerabilities; reported upstream vulnerabilities were limited to development dependencies.
## Remote-first update — 2026-07-16

- Reframed the product as remote-first for Makaron and all external Agents.
- Added an authenticated central-library HTTP API with health, search, recommendation, and short-lived audio-access routes.
- Added remote-default CLI routing, `config`, `serve`, and `access`; retained explicit `--local` owner mode.
- Removed server paths from remote results and added bearer-token and signed-link validation.
- Added a remote API smoke test. Both local CLI and authenticated HTTP tests pass.
- Kept version `0.1.0` and did not publish to npm or GitHub.
