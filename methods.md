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
## Remote Agent music-library pattern

- Separate installation from content access: any Agent may install the npm package, while the central collection requires an Agent token.
- Store only the non-secret API URL in CLI config. Read client and server tokens from environment variables.
- Return safe track metadata without server filesystem paths.
- Convert an authorized track into a short-lived HMAC-signed URL instead of exposing permanent storage URLs.
- Keep local indexing and media assembly behind explicit owner mode.
- For a first single-instance deployment, mount one encrypted persistent disk and transfer the owner's files over SSH/SFTP. Keep the catalog and audio under the mount, not in the container image.
- Expose only a metadata-free health endpoint publicly. Protect every library operation with the Agent token.
