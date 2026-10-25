// H14.53 TEST FIXTURE ONLY; not a product migration or remote D1 schema.
// Immutable synthetic action capture plus SQL claim-time provenance guard.
export const TRUSTED_PROVENANCE_DDL = [
`CREATE TABLE mock_h1453_action_provenance(
 action_key TEXT PRIMARY KEY,
 session_handle TEXT NOT NULL,
 subject TEXT NOT NULL,
 target_id TEXT NOT NULL,
 action_reference TEXT NOT NULL,
 authorization_revision INTEGER NOT NULL CHECK(authorization_revision>0),
 source TEXT NOT NULL CHECK(source IN ('DIRECT_LEARNER_ACTION','PATITA_OBSERVATION')),
 model_exposure TEXT NOT NULL,
 exposure_reference TEXT NOT NULL,
 recorded_at INTEGER NOT NULL,
 binding_sha256 TEXT NOT NULL,
 intent TEXT NOT NULL CHECK(intent IN ('start','resume','transfer')),
 UNIQUE(subject,action_reference)
)`,
`CREATE TRIGGER h1453_provenance_no_update BEFORE UPDATE ON mock_h1453_action_provenance
 BEGIN SELECT RAISE(ABORT,'h1453_provenance_immutable'); END`,
`CREATE TRIGGER h1453_provenance_no_delete BEFORE DELETE ON mock_h1453_action_provenance
 BEGIN SELECT RAISE(ABORT,'h1453_provenance_immutable'); END`,
`CREATE TRIGGER h1453_consumption_provenance BEFORE INSERT ON mock_action_consumption
BEGIN
 SELECT CASE WHEN NOT EXISTS (
  SELECT 1 FROM mock_h1453_action_provenance p
  JOIN mock_actions a ON a.subject=p.subject AND a.reference=p.action_reference AND a.target_id=p.target_id
  JOIN mock_sessions s ON s.handle=p.session_handle AND s.subject=p.subject
  JOIN mock_targets t ON t.id=p.target_id AND t.subject=p.subject
  WHERE p.subject=NEW.subject AND p.action_reference=NEW.action_reference
   AND p.source='DIRECT_LEARNER_ACTION' AND a.direct=1
   AND p.model_exposure=a.exposure AND p.exposure_reference=a.exposure_reference
   AND s.revoked=0 AND s.expires>unixepoch()
   AND t.revision=p.authorization_revision AND t.authorized=1 AND t.revoked=0 AND t.expires>unixepoch()
   AND p.recorded_at<=unixepoch() AND p.recorded_at>=unixepoch()-3600
 ) THEN RAISE(ABORT,'h1453_action_provenance_required') END;
END`
];
