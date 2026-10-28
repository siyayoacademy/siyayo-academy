-- SIYAYO Academy EVAL-08 · staging schema proposal v0.1, REVIEW ONLY.
-- DO NOT APPLY REMOTELY without separate authorized migration GO.
-- New product-domain tables, NOT the historical lab_* / V30 sandbox tables.
-- No bootstrap users, authorized contracts, learner responses or sample identities.
-- Authentication/contract approval must be verified by a trusted Worker service.
CREATE TABLE IF NOT EXISTS eval08_sessions (
 subject_key TEXT NOT NULL,
 session_key TEXT NOT NULL,
 issuer_key TEXT NOT NULL,
 expires_at INTEGER NOT NULL,
 revoked INTEGER NOT NULL DEFAULT 0 CHECK (revoked IN (0,1)),
 PRIMARY KEY (subject_key,session_key)
);
CREATE TABLE IF NOT EXISTS eval08_contracts (
 contract_id TEXT NOT NULL,
 contract_version TEXT NOT NULL,
 revision INTEGER NOT NULL CHECK (revision>=1),
 subject_key TEXT NOT NULL,
 session_key TEXT NOT NULL,
 skill_id TEXT NOT NULL,
 language TEXT NOT NULL CHECK (language IN ('en','es','pt')),
 origin_experience_id TEXT NOT NULL,
 current_experience_id TEXT NOT NULL,
 question_word TEXT NOT NULL,
 phase TEXT NOT NULL CHECK (phase IN ('local','transfer')),
 authorized INTEGER NOT NULL DEFAULT 0 CHECK (authorized IN (0,1)),
 revoked INTEGER NOT NULL DEFAULT 0 CHECK (revoked IN (0,1)),
 expires_at INTEGER NOT NULL,
 PRIMARY KEY(contract_id,contract_version,revision,subject_key,session_key),
 FOREIGN KEY(subject_key,session_key) REFERENCES eval08_sessions(subject_key,session_key)
);
CREATE TABLE IF NOT EXISTS eval08_actions (
 action_key TEXT PRIMARY KEY,
 event_id TEXT NOT NULL CHECK(length(event_id)=36),
 subject_key TEXT NOT NULL,
 session_key TEXT NOT NULL,
 contract_id TEXT NOT NULL,
 contract_version TEXT NOT NULL,
 contract_revision INTEGER NOT NULL,
 skill_id TEXT NOT NULL,
 language TEXT NOT NULL CHECK (language IN ('en','es','pt')),
 origin_experience_id TEXT NOT NULL,
 current_experience_id TEXT NOT NULL,
 question_word TEXT NOT NULL,
 dimension TEXT NOT NULL,
 mode TEXT NOT NULL,
 phase TEXT NOT NULL CHECK (phase IN ('local','transfer')),
 source TEXT NOT NULL CHECK (source='DIRECT_LEARNER_ACTION'),
 consumed INTEGER NOT NULL DEFAULT 0 CHECK (consumed IN (0,1)),
 recorded_at INTEGER NOT NULL,
 UNIQUE(subject_key,event_id),
 FOREIGN KEY(subject_key,session_key) REFERENCES eval08_sessions(subject_key,session_key),
 FOREIGN KEY(contract_id,contract_version,contract_revision,subject_key,session_key)
 REFERENCES eval08_contracts(contract_id,contract_version,revision,subject_key,session_key)
);
CREATE TABLE IF NOT EXISTS eval08_occurrences (
 subject_key TEXT NOT NULL,
 event_id TEXT NOT NULL CHECK(length(event_id)=36),
 action_key TEXT NOT NULL,
 skill_id TEXT NOT NULL,
 language TEXT NOT NULL CHECK (language IN ('en','es','pt')),
 origin_experience_id TEXT NOT NULL,
 current_experience_id TEXT NOT NULL,
 question_word TEXT NOT NULL,
 purpose TEXT NOT NULL CHECK (purpose IN ('exploration','assessment')),
 status TEXT NOT NULL CHECK (
  (purpose='exploration' AND status='observed_exploratory') OR
  (purpose='assessment' AND status='pending')
 ),
 payload_sha256 TEXT NOT NULL CHECK(length(payload_sha256)=64),
 created_at INTEGER NOT NULL,
 PRIMARY KEY(subject_key,event_id),
 UNIQUE(subject_key,action_key),
 FOREIGN KEY(action_key) REFERENCES eval08_actions(action_key)
);
CREATE TABLE IF NOT EXISTS eval08_attempts (
 subject_key TEXT NOT NULL,
 event_id TEXT NOT NULL,
 action_key TEXT NOT NULL,
 contract_id TEXT NOT NULL,
 contract_version TEXT NOT NULL,
 contract_revision INTEGER NOT NULL,
 scope_key TEXT NOT NULL,
 skill_id TEXT NOT NULL,
 language TEXT NOT NULL CHECK(language IN ('en','es','pt')),
 origin_experience_id TEXT NOT NULL,
 current_experience_id TEXT NOT NULL,
 dimension TEXT NOT NULL,
 mode TEXT NOT NULL,
 result TEXT NOT NULL CHECK(result IN ('pass','fail')),
 verdict_provenance_key TEXT NOT NULL,
 packet_json TEXT NOT NULL CHECK(json_valid(packet_json)),
 committed_at INTEGER NOT NULL,
 PRIMARY KEY(subject_key,event_id),
 UNIQUE(subject_key,action_key),
 FOREIGN KEY(subject_key,event_id) REFERENCES eval08_occurrences(subject_key,event_id),
 FOREIGN KEY(action_key) REFERENCES eval08_actions(action_key)
);
CREATE TABLE IF NOT EXISTS eval08_evidence (
 subject_key TEXT NOT NULL,
 event_id TEXT NOT NULL,
 scope_key TEXT NOT NULL,
 skill_id TEXT NOT NULL,
 language TEXT NOT NULL CHECK(language IN ('en','es','pt')),
 origin_experience_id TEXT NOT NULL,
 packet_json TEXT NOT NULL CHECK(json_valid(packet_json)),
 PRIMARY KEY(subject_key,event_id),
 FOREIGN KEY(subject_key,event_id) REFERENCES eval08_attempts(subject_key,event_id)
);
CREATE TABLE IF NOT EXISTS eval08_outbox (
 subject_key TEXT NOT NULL,
 event_id TEXT NOT NULL,
 event_kind TEXT NOT NULL CHECK(event_kind IN ('EVIDENCE_COMMITTED','ATTEMPT_REJECTED')),
 scope_key TEXT NOT NULL,
 published_at INTEGER,
 PRIMARY KEY(subject_key,event_id),
 FOREIGN KEY(subject_key,event_id) REFERENCES eval08_attempts(subject_key,event_id)
);
CREATE INDEX IF NOT EXISTS eval08_evidence_scope ON eval08_evidence(subject_key,scope_key,event_id);
CREATE INDEX IF NOT EXISTS eval08_contract_scope ON eval08_contracts(subject_key,skill_id,language,origin_experience_id,revision);
CREATE INDEX IF NOT EXISTS eval08_outbox_unpublished ON eval08_outbox(published_at,event_id);
-- Enforce proof-of-pass on Evidence at the database boundary.
CREATE TRIGGER IF NOT EXISTS eval08_evidence_requires_pass
BEFORE INSERT ON eval08_evidence
BEGIN
 SELECT CASE WHEN NOT EXISTS (
  SELECT 1 FROM eval08_attempts a
  WHERE a.subject_key=NEW.subject_key AND a.event_id=NEW.event_id
   AND a.result='pass' AND a.scope_key=NEW.scope_key
   AND a.skill_id=NEW.skill_id AND a.language=NEW.language
   AND a.origin_experience_id=NEW.origin_experience_id
   AND a.packet_json=NEW.packet_json
 ) THEN RAISE(ABORT,'evidence_requires_matching_pass') END;
END;
-- Append-only Evidence and Attempt ledger: corrections need separate audit events.
CREATE TRIGGER IF NOT EXISTS eval08_no_evidence_update BEFORE UPDATE ON eval08_evidence
BEGIN SELECT RAISE(ABORT,'immutable_evidence'); END;
CREATE TRIGGER IF NOT EXISTS eval08_no_evidence_delete BEFORE DELETE ON eval08_evidence
BEGIN SELECT RAISE(ABORT,'immutable_evidence'); END;
CREATE TRIGGER IF NOT EXISTS eval08_no_attempt_update BEFORE UPDATE ON eval08_attempts
BEGIN SELECT RAISE(ABORT,'immutable_attempt'); END;
CREATE TRIGGER IF NOT EXISTS eval08_no_attempt_delete BEFORE DELETE ON eval08_attempts
BEGIN SELECT RAISE(ABORT,'immutable_attempt'); END;
