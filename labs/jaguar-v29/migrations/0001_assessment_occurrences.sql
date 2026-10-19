-- SIYAYO V15: isolated D1-oriented SQLite schema; no financial tables.
-- Apply only to a dedicated assessment database after Cloudflare environment review.
CREATE TABLE IF NOT EXISTS assessment_occurrences (
  learner_subject TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  occurrence_id TEXT NOT NULL,
  payload_sha256 TEXT NOT NULL CHECK(length(payload_sha256)=64),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','rejected')),
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (learner_subject, scope_key, occurrence_id)
);
CREATE INDEX IF NOT EXISTS idx_assessment_pending ON assessment_occurrences(status,submitted_at);
-- Confirmations/credits intentionally NOT implemented. The client cannot set status.
