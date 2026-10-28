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
 action_key TEXT,
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
 CHECK ((purpose='exploration' AND action_key IS NULL) OR
        (purpose='assessment' AND action_key IS NOT NULL)),
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

-- Staging integrity gates: defend against cross-action, cross-learner and
-- stale authorization even if the future writer skips an application check.
-- IMPORTANT: these SQL guards DO NOT authenticate an issuer or a human.
CREATE TRIGGER IF NOT EXISTS eval08_occurrence_matches_action
BEFORE INSERT ON eval08_occurrences
WHEN NEW.purpose='assessment'
BEGIN
 SELECT CASE WHEN NOT EXISTS (
  SELECT 1 FROM eval08_actions a WHERE
    a.action_key=NEW.action_key AND a.event_id=NEW.event_id
    AND a.subject_key=NEW.subject_key
    AND a.skill_id=NEW.skill_id AND a.language=NEW.language
    AND a.origin_experience_id=NEW.origin_experience_id
    AND a.current_experience_id=NEW.current_experience_id
    AND a.question_word=NEW.question_word
    AND a.source='DIRECT_LEARNER_ACTION'
 ) THEN RAISE(ABORT,'assessment_occurrence_action_mismatch') END;
END;
CREATE TRIGGER IF NOT EXISTS eval08_attempt_requires_live_authority
BEFORE INSERT ON eval08_attempts
BEGIN
 SELECT CASE WHEN NOT EXISTS (
  SELECT 1 FROM eval08_actions a
  JOIN eval08_occurrences o
    ON o.action_key=a.action_key AND o.subject_key=a.subject_key
       AND o.event_id=a.event_id
  JOIN eval08_contracts c
    ON c.contract_id=a.contract_id
       AND c.contract_version=a.contract_version
       AND c.revision=a.contract_revision
       AND c.subject_key=a.subject_key AND c.session_key=a.session_key
  JOIN eval08_sessions s
    ON s.subject_key=a.subject_key AND s.session_key=a.session_key
  WHERE
    a.action_key=NEW.action_key AND a.event_id=NEW.event_id
    AND a.subject_key=NEW.subject_key
    AND c.contract_id=NEW.contract_id
    AND c.contract_version=NEW.contract_version
    AND c.revision=NEW.contract_revision
    AND c.authorized=1 AND c.revoked=0
    AND c.expires_at>NEW.committed_at
    AND s.revoked=0 AND s.expires_at>NEW.committed_at
    AND length(trim(s.issuer_key))>0
    AND a.consumed=1
    AND a.source='DIRECT_LEARNER_ACTION'
    AND a.recorded_at<=NEW.committed_at
    AND a.recorded_at>=NEW.committed_at-300
    AND o.purpose='assessment' AND o.status='pending'
    AND o.skill_id=NEW.skill_id
    AND o.language=NEW.language
    AND o.origin_experience_id=NEW.origin_experience_id
    AND o.current_experience_id=NEW.current_experience_id
    AND a.skill_id=NEW.skill_id
    AND a.language=NEW.language
    AND a.origin_experience_id=NEW.origin_experience_id
    AND a.current_experience_id=NEW.current_experience_id
    AND a.dimension=NEW.dimension
    AND a.mode=NEW.mode
    AND a.phase=c.phase
    AND a.question_word=c.question_word
    AND c.skill_id=NEW.skill_id
    AND c.language=NEW.language
    AND c.origin_experience_id=NEW.origin_experience_id
    AND c.current_experience_id=NEW.current_experience_id
    AND json_extract(NEW.packet_json,'$.result')=NEW.result
    AND json_extract(NEW.packet_json,'$.skill')=NEW.skill_id
    AND json_extract(NEW.packet_json,'$.dimension')=NEW.dimension
    AND json_extract(NEW.packet_json,'$.mode')=NEW.mode
    AND json_extract(NEW.packet_json,'$.support')='none'
    AND json_extract(NEW.packet_json,'$.context.occurrenceId')=NEW.event_id
    AND json_extract(NEW.packet_json,'$.context.language')=NEW.language
    AND json_extract(NEW.packet_json,'$.context.experienceId')=NEW.current_experience_id
    AND json_extract(NEW.packet_json,'$.context.assessmentScope.key')=NEW.scope_key
    AND json_extract(NEW.packet_json,'$.context.assessmentScope.learnerId')=NEW.subject_key
    AND json_extract(NEW.packet_json,'$.context.assessmentScope.skill')=NEW.skill_id
    AND json_extract(NEW.packet_json,'$.context.assessmentScope.language')=NEW.language
    AND json_extract(NEW.packet_json,'$.context.assessmentScope.originExperienceId')=NEW.origin_experience_id
    AND ((c.phase='local' AND NEW.current_experience_id=NEW.origin_experience_id
         AND json_extract(NEW.packet_json,'$.context.fromExperienceId') IS NULL)
      OR (c.phase='transfer' AND NEW.current_experience_id<>NEW.origin_experience_id
         AND json_extract(NEW.packet_json,'$.context.fromExperienceId')=NEW.origin_experience_id))
 ) THEN RAISE(ABORT,'attempt_requires_live_authority') END;
END;
CREATE TRIGGER IF NOT EXISTS eval08_outbox_requires_canonical_outcome
BEFORE INSERT ON eval08_outbox
BEGIN
 SELECT CASE WHEN NOT EXISTS (
  SELECT 1 FROM eval08_attempts a
  LEFT JOIN eval08_evidence e
    ON e.subject_key=a.subject_key AND e.event_id=a.event_id
  WHERE a.subject_key=NEW.subject_key AND a.event_id=NEW.event_id
    AND a.scope_key=NEW.scope_key
    AND ((NEW.event_kind='ATTEMPT_REJECTED'
       AND a.result='fail' AND e.event_id IS NULL)
      OR (NEW.event_kind='EVIDENCE_COMMITTED'
       AND a.result='pass' AND e.event_id IS NOT NULL
       AND e.scope_key=NEW.scope_key))
 ) THEN RAISE(ABORT,'outbox_requires_canonical_outcome') END;
END;
-- Stop after-the-fact modification of signed action identity, but allow only
-- one-way event consumption. A real writer still needs an atomic SQL batch.
CREATE TRIGGER IF NOT EXISTS eval08_actions_consumption_only
BEFORE UPDATE ON eval08_actions
WHEN NOT (
  OLD.consumed=0 AND NEW.consumed=1
  AND NEW.action_key=OLD.action_key AND NEW.event_id=OLD.event_id
  AND NEW.subject_key=OLD.subject_key AND NEW.session_key=OLD.session_key
  AND NEW.contract_id=OLD.contract_id AND NEW.contract_version=OLD.contract_version
  AND NEW.contract_revision=OLD.contract_revision
  AND NEW.skill_id=OLD.skill_id AND NEW.language=OLD.language
  AND NEW.origin_experience_id=OLD.origin_experience_id
  AND NEW.current_experience_id=OLD.current_experience_id
  AND NEW.question_word=OLD.question_word
  AND NEW.dimension=OLD.dimension AND NEW.mode=OLD.mode
  AND NEW.phase=OLD.phase AND NEW.source=OLD.source
  AND NEW.recorded_at=OLD.recorded_at
)
BEGIN SELECT RAISE(ABORT,'action_is_immutable_except_consume'); END;
CREATE TRIGGER IF NOT EXISTS eval08_occurrences_immutable_update
BEFORE UPDATE ON eval08_occurrences
BEGIN SELECT RAISE(ABORT,'immutable_occurrence'); END;
CREATE TRIGGER IF NOT EXISTS eval08_occurrences_immutable_delete
BEFORE DELETE ON eval08_occurrences
BEGIN SELECT RAISE(ABORT,'immutable_occurrence'); END;
