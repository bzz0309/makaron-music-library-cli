#!/bin/sh
set -eu

LIBRARY="${MUSICLIB_LIBRARY:-/data/library}"

if [ ! -f "$LIBRARY/library.json" ]; then
  node /app/bin/musiclib.mjs init --library "$LIBRARY" --name "${MUSICLIB_NAME:-Central Music Library}"
fi

exec node /app/bin/musiclib.mjs serve \
  --library "$LIBRARY" \
  --host "${HOST:-0.0.0.0}"
