CREATE TABLE IF NOT EXISTS registration_challenges (
  id TEXT PRIMARY KEY,
  nonce TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS registration_challenges_ip_created_idx
  ON registration_challenges(ip_hash, created_at);

CREATE TABLE IF NOT EXISTS agent_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  agent_name TEXT NOT NULL,
  client TEXT NOT NULL,
  client_version TEXT NOT NULL,
  scopes TEXT NOT NULL DEFAULT 'search,recommend,access',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT
);

CREATE INDEX IF NOT EXISTS agent_tokens_status_idx ON agent_tokens(status);

CREATE TABLE IF NOT EXISTS agent_usage (
  token_id TEXT NOT NULL,
  usage_day TEXT NOT NULL,
  search_count INTEGER NOT NULL DEFAULT 0,
  recommend_count INTEGER NOT NULL DEFAULT 0,
  access_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (token_id, usage_day),
  FOREIGN KEY (token_id) REFERENCES agent_tokens(id)
);
