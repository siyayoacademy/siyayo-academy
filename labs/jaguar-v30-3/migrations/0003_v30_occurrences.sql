-- NEW LAB TABLE ONLY. Never modify V29 tables or apply remotely.
CREATE TABLE IF NOT EXISTS v30_occurrences (
 learner_subject TEXT NOT NULL,
 scope_key TEXT NOT NULL,
 occurrence_id TEXT NOT NULL,
 purpose TEXT NOT NULL CHECK(purpose IN ('exploration','assessment')),
 status TEXT NOT NULL CHECK ((purpose='exploration' AND status='observed_exploratory') OR (purpose='assessment' AND status='pending')),
 contract_version TEXT NOT NULL,
 payload_sha256 TEXT NOT NULL,
 payload_json TEXT NOT NULL,
 submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(learner_subject,scope_key,occurrence_id)
);