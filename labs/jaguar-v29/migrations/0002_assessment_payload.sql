-- V17: apply after V15; payload is untrusted until server-side canonical validation.
ALTER TABLE assessment_occurrences ADD COLUMN payload_json TEXT;
-- New rows written by V17 always contain payload_json; old rows are deliberately not backfilled.
