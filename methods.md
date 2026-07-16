# Reusable methods

## Separate retrieval from generation

Search the owned library first. Generate music only when retrieval has no acceptable result or the user explicitly requests original music. This keeps cost and rights decisions visible.

## Treat cloud drives as data sources

Index a locally visible sync directory without coupling the catalog to one cloud vendor. Keep cloud authorization behind a future adapter and never collect account passwords.

## Sidecar metadata

Use `<audio-file>.music.json` for tags and rights fields that are missing from embedded audio metadata. This is portable and does not modify the source track.
