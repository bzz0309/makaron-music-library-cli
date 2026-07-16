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

## Media delivery

Support a single standard HTTP byte range on signed audio routes. Return `206`, `Content-Range`, and `Accept-Ranges` for valid ranges and `416` for invalid ranges, so browsers and media tools can seek without downloading the whole track.

## Rights remain explicit

Use sidecar `<audio>.music.json` files for tags and rights fields. Possession is not evidence of commercial permission; unknown rights must trigger review or original generation.

## Intelligence and asset layers

Keep platform-neutral intent understanding separate from real audio. Let the vendored intelligence layer select and explain a Profile, then use its prompt and attributes to rank D1 tracks.
