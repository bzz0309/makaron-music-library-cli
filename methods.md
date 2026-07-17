# Reusable methods

## Separate retrieval from generation

Search the authorized collection first. Generate original music only when retrieval has no acceptable result, rights are unclear, or the user explicitly asks for original work.

## Treat cloud drives as ingestion sources

Index a locally visible Baidu Netdisk sync directory. Do not expose cloud-drive credentials to Agents. Upload the resulting assets to private object storage so remote Agents do not depend on the owner's computer.

## Split metadata, bytes, and access

- D1 stores searchable safe metadata.
- Private R2 stores audio bytes.
- Worker authentication protects catalog operations.
- A short-lived HMAC URL grants temporary audio access without exposing object keys or permanent public URLs.

This split lets every Agent use the same library while keeping owner paths and storage credentials private.

## Cloud synchronization

Perform a dry-run first, upload objects with limited concurrency, then batch-upsert D1 metadata. Derive stable R2 keys from track IDs, never local filenames or paths. Repeat runs are idempotent at the track ID/object key level.

Prefer a dedicated Worker administrator token over distributing Cloudflare account or R2 S3 credentials. Keep administrator routes separate from Agent routes, enforce supported extensions and body-size limits, and stream request bodies directly into private R2.

## Media delivery

Support a single standard HTTP byte range on signed audio routes. Return `206`, `Content-Range`, and `Accept-Ranges` for valid ranges and `416` for invalid ranges, so browsers and media tools can seek without downloading the whole track.

## Agent-side remote soundtrack assembly

Keep public video bytes out of the central library service. Let the Agent download a bounded HTTP/HTTPS video to a temporary directory, probe its duration, request a scene-aware central recommendation, download the short-lived authorized audio, and run ffmpeg locally. Prefer system media tools and fall back to platform-specific npm binaries. When a regional relay rejects a full audio response, use bounded Range chunks and validate every `Content-Range`. Preserve original audio by default, apply bounded volumes and fades, refuse existing outputs, and always delete temporary media. Require an explicit non-commercial override when rights metadata is unknown.

For strongly typed scenes, distinguish retrieval from suitability. Plain search may return broad lexical matches; `recommend --scene` must enforce defining tags. A K-pop stage result without a `kpop` tag is a mismatch even if it is dance/pop.

Natural language is the public contract; commands are an internal implementation detail. Infer known scenes independently in the CLI and central service, apply the same constraints to both search and recommendation, and return the inferred scene plus matched evidence. This keeps results correct even when an Agent chooses a less-specific internal command.

## Rights remain explicit

Use sidecar `<audio>.music.json` files for tags and rights fields. Possession is not evidence of commercial permission; unknown rights must trigger review or original generation.

## Intelligence and asset layers

Keep platform-neutral intent understanding separate from real audio. Let the vendored intelligence layer select and explain a Profile, then use its prompt and attributes to rank D1 tracks.

## Self-service Agent credentials

Give each Agent a separate credential instead of distributing one shared secret. Use a short-lived proof-of-work challenge plus origin throttling to make unattended setup possible while slowing bulk registration. Return the raw credential only once, store only its SHA-256 hash in D1, save the client copy with owner-only file permissions, and enforce route-specific daily quotas. Keep legacy operator tokens as a migration path, not the default onboarding flow.

## China-accessible control and media relay

When an Agent platform cannot reach `workers.dev`, keep R2/D1 and the Worker as the source of truth and add a narrow regional relay instead of duplicating the library. Allowlist exact methods and paths, reject administrator routes and arbitrary targets, sign the forwarded client origin with a shared secret, rewrite only signed audio URLs belonging to the upstream, and stream Range responses without buffering complete tracks. Use the network origin for rate limiting, but bind multi-request registration to a random client session that the trusted relay signs; sandbox platforms may rotate egress IPs between challenge and verification.
