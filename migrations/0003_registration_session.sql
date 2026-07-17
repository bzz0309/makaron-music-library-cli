ALTER TABLE registration_challenges ADD COLUMN session_hash TEXT;

CREATE INDEX IF NOT EXISTS registration_challenges_session_idx
  ON registration_challenges(session_hash);
