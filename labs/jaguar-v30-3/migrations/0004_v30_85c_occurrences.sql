-- JAGUAR V30.3.85C: separate, additive LOCAL-ONLY SQLite/D1 study migration.
-- NEVER apply remotely. Does not modify or copy V29 or V30.3 legacy tables.
-- The client NICK is deliberately absent. Owner must come from verified server principal.
CREATE TABLE IF NOT EXISTS v30_85c_occurrences (
  learner_subject TEXT NOT NULL,
  event_id TEXT NOT NULL CHECK(length(event_id) = 36),
  skill_id TEXT NOT NULL,
  language TEXT NOT NULL CHECK(language IN ('en','es','pt')),
  origin_experience_id TEXT NOT NULL,
  current_experience_id TEXT NOT NULL,
  question_word TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK(purpose IN ('exploration','assessment')),
  status TEXT NOT NULL CHECK (
    (purpose='exploration' AND status='observed_exploratory') OR
    (purpose='assessment' AND status='pending')
  ),
  contract_version TEXT NOT NULL,
  source_occurrence_id TEXT NOT NULL,
  payload_sha256 TEXT NOT NULL CHECK(length(payload_sha256) = 64),
  payload_json TEXT NOT NULL CHECK(json_valid(payload_json)),
  recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (learner_subject, event_id)
);
CREATE INDEX IF NOT EXISTS v30_85c_scope_read
  ON v30_85c_occurrences
  (learner_subject,skill_id,language,origin_experience_id,contract_version,question_word,purpose,recorded_at,event_id);
