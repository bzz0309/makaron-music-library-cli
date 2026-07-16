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
