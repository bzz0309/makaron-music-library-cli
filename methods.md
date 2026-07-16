# Reusable methods

## Separate retrieval from generation

Search the owned library first. Generate music only when retrieval has no acceptable result or the user explicitly requests original music. This keeps cost and rights decisions visible.

## Treat cloud drives as data sources

Index a locally visible sync directory without coupling the catalog to one cloud vendor. Keep cloud authorization behind a future adapter and never collect account passwords.

## Sidecar metadata

Use `<audio-file>.music.json` for tags and rights fields that are missing from embedded audio metadata. This is portable and does not modify the source track.

## Scene profiles

Convert a video use case into a stable weighted music profile. Combine that profile with the video's visual brief, rank library tracks with explainable tag matches, and return a generation fallback when rights or relevance are insufficient.

## Intelligence and asset layers

Keep platform-neutral intent understanding separate from real audio assets. Let the vendored intelligence layer select and explain a Profile, then use its prompt and matched attributes to rank local tracks. Fall back to original generation when local relevance or rights are insufficient.

Vendor only compiled runtime files and normal recommendation data. Preserve the upstream commit in `vendor/music-prompt-library/UPSTREAM.md`, audit production dependencies, and rerun both upstream and wrapper test suites before updating the snapshot.
