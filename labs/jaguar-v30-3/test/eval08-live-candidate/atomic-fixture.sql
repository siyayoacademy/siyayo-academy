-- JAGUAR EVAL-08 · LOCAL-ONLY atomic Evidence and outbox adapter fixture.
-- Separate from V30.3/85C. DO NOT APPLY to Cloudflare remote D1.
-- This is a sandbox schema, not product authentication/registry migration.
CREATE TABLE lab_eval_sessions (
 subject TEXT NOT NULL, session_id TEXT NOT NULL,
 issuer_verified INTEGER NOT NULL CHECK(issuer_verified IN (0,1)),
 revoked INTEGER NOT NULL CHECK(revoked IN (0,1)),
 expires_at INTEGER NOT NULL, PRIMARY KEY(subject,session_id)
);
CREATE TABLE lab_eval_contracts (
 id TEXT NOT NULL, version TEXT NOT NULL, revision INTEGER NOT NULL,
 subject TEXT NOT NULL, session_id TEXT NOT NULL,
 skill TEXT NOT NULL, language TEXT NOT NULL CHECK(language IN ('en','es','pt')),
 origin_experience_id TEXT NOT NULL, current_experience_id TEXT NOT NULL,
 phase TEXT NOT NULL CHECK(phase IN ('local','transfer')),
 authorized INTEGER NOT NULL CHECK(authorized IN (0,1)),
 revoked INTEGER NOT NULL CHECK(revoked IN (0,1)), expires_at INTEGER NOT NULL,
 PRIMARY KEY(id,version,revision,subject,session_id)
);
CREATE TABLE lab_eval_actions (
 action_key TEXT PRIMARY KEY, event_id TEXT NOT NULL, subject TEXT NOT NULL,
 session_id TEXT NOT NULL, skill TEXT NOT NULL, language TEXT NOT NULL,
 origin_experience_id TEXT NOT NULL, current_experience_id TEXT NOT NULL,
 dimension TEXT NOT NULL, mode TEXT NOT NULL, phase TEXT NOT NULL,
 source TEXT NOT NULL, consumed INTEGER NOT NULL CHECK(consumed IN (0,1)),
 recorded_at INTEGER NOT NULL
);
CREATE TABLE lab_eval_guard(
 id INTEGER PRIMARY KEY CHECK(id=1),ok INTEGER NOT NULL CHECK(ok=1)
);
CREATE TABLE lab_eval_attempts(
 subject TEXT NOT NULL, event_id TEXT NOT NULL, action_key TEXT NOT NULL,
 contract_id TEXT NOT NULL, contract_version TEXT NOT NULL,
 contract_revision INTEGER NOT NULL, scope_key TEXT NOT NULL,
 skill TEXT NOT NULL,language TEXT NOT NULL,origin_experience_id TEXT NOT NULL,
 current_experience_id TEXT NOT NULL, dimension TEXT NOT NULL,
 mode TEXT NOT NULL, result TEXT NOT NULL CHECK(result IN ('pass','fail')),
 provenance_id TEXT NOT NULL,
 packet_json TEXT NOT NULL CHECK(json_valid(packet_json)),
 committed_at INTEGER NOT NULL,
 PRIMARY KEY(subject,event_id),UNIQUE(subject,action_key)
);
CREATE TABLE lab_eval_evidence(
 subject TEXT NOT NULL,event_id TEXT NOT NULL,scope_key TEXT NOT NULL,
 contract_id TEXT NOT NULL,contract_version TEXT NOT NULL,
 skill TEXT NOT NULL,language TEXT NOT NULL,origin_experience_id TEXT NOT NULL,
 packet_json TEXT NOT NULL CHECK(json_valid(packet_json)),
 PRIMARY KEY(subject,event_id),
 FOREIGN KEY(subject,event_id) REFERENCES lab_eval_attempts(subject,event_id)
);
CREATE TABLE lab_eval_outbox(
 subject TEXT NOT NULL,event_id TEXT NOT NULL,
 event_kind TEXT NOT NULL CHECK(event_kind IN ('EVIDENCE_COMMITTED','ATTEMPT_REJECTED')),
 scope_key TEXT NOT NULL, published_at INTEGER,
 PRIMARY KEY(subject,event_id),
 FOREIGN KEY(subject,event_id) REFERENCES lab_eval_attempts(subject,event_id)
);
CREATE INDEX lab_eval_evidence_scope ON lab_eval_evidence(subject,scope_key,event_id);
