CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  object_key TEXT NOT NULL UNIQUE,
  source TEXT,
  size_bytes INTEGER NOT NULL,
  duration_seconds REAL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  license TEXT NOT NULL DEFAULT 'unknown',
  commercial_use INTEGER,
  modified_at TEXT,
  search_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS tracks_artist_idx ON tracks(artist);
CREATE INDEX IF NOT EXISTS tracks_title_idx ON tracks(title);
CREATE INDEX IF NOT EXISTS tracks_commercial_idx ON tracks(commercial_use);
