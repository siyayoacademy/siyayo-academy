"""H14.48 local-only DB write boundary. No product migration or deployment.
Requires reviewed synthetic companion metadata. No claim/scope backfill.
"""
from pathlib import Path
import sqlite3
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'h14-47'))
from compatibility_inspector import inspect

TRIGGERS=[
'''CREATE TRIGGER IF NOT EXISTS h1448_occurrence_insert BEFORE INSERT ON v30_85c_occurrences BEGIN
 SELECT CASE WHEN (SELECT enabled FROM mock_h1448_gate WHERE id=1) IS NOT 1 THEN RAISE(ABORT,'h1448_adapter_disabled') END;
 SELECT CASE WHEN NEW.purpose!='assessment' OR NEW.status!='pending' OR NEW.skill_id!='why.use.contextual-reason' OR NEW.question_word!='WHY'
 OR json_extract(NEW.payload_json,'$.bindingVersion') IS NOT 'h14.41.v0.1'
 OR json_extract(NEW.payload_json,'$.language') IS NOT NEW.language
 OR json_extract(NEW.payload_json,'$.originExperienceId') IS NOT NEW.origin_experience_id
 OR json_extract(NEW.payload_json,'$.currentExperienceId') IS NOT NEW.current_experience_id
 OR json_extract(NEW.payload_json,'$.contractVersion') IS NOT NEW.contract_version
 OR json_extract(NEW.payload_json,'$.questionWord') IS NOT NEW.question_word
 THEN RAISE(ABORT,'h1448_binding_required') END;
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM mock_action_consumption
 WHERE subject=NEW.learner_subject AND action_reference=json_extract(NEW.payload_json,'$.actionReference') AND event_id=NEW.event_id)
 THEN RAISE(ABORT,'h1448_action_reservation_required') END;
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM mock_scope_reservations
 WHERE scope_key=json_array(NEW.learner_subject,NEW.skill_id,NEW.language,NEW.origin_experience_id,json_extract(NEW.payload_json,'$.contractId'),NEW.contract_version,NEW.question_word))
 THEN RAISE(ABORT,'h1448_scope_reservation_required') END;
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM mock_targets
 WHERE id=json_extract(NEW.payload_json,'$.assessmentTargetId') AND subject=NEW.learner_subject
 AND authorized=1 AND revoked=0 AND revision=json_extract(NEW.payload_json,'$.authorizationRevision'))
 THEN RAISE(ABORT,'h1448_authorization_revision_required') END;
 END''',
'''CREATE TRIGGER IF NOT EXISTS h1448_occurrence_update BEFORE UPDATE ON v30_85c_occurrences BEGIN
 SELECT RAISE(ABORT,'h1448_occurrence_immutable'); END''',
'''CREATE TRIGGER IF NOT EXISTS h1448_occurrence_delete BEFORE DELETE ON v30_85c_occurrences BEGIN
 SELECT RAISE(ABORT,'h1448_occurrence_immutable'); END'''
]

def install(path, *, enabled=False):
    if enabled is not True:
        return dict(ok=False,reason='boundary_not_enabled')
    # Existing files only; never silently create a replacement DB on a bad path.
    con=sqlite3.connect(Path(path).resolve().as_uri()+'?mode=rw',uri=True,isolation_level=None,timeout=5)
    try:
        con.execute('BEGIN IMMEDIATE')
        audit=inspect(path) # Writer lock retained; no competing writer can invalidate this audit.
        if audit['problems']:
            con.rollback()
            return dict(ok=False,reason='legacy_or_inconsistent_database',problems=audit['problems'])
        # execute(), not executescript(): retain the transaction around DDL and audit.
        con.execute('CREATE TABLE IF NOT EXISTS mock_h1448_gate(id INTEGER PRIMARY KEY CHECK(id=1),enabled INTEGER NOT NULL CHECK(enabled IN (0,1)))')
        for sql in TRIGGERS:
            con.execute(sql)
        con.execute('INSERT INTO mock_h1448_gate VALUES(1,1) ON CONFLICT(id) DO UPDATE SET enabled=1')
        con.commit()
        return dict(ok=True,status='LOCAL_BOUNDARY_INSTALLED',productionAllowed=False)
    except Exception:
        con.rollback()
        return dict(ok=False,reason='boundary_install_failed')
    finally:
        con.close()


def disable(path):
    # Rollback means stop new inserts, keep reads and historical receipts available.
    with sqlite3.connect(Path(path).resolve().as_uri()+'?mode=rw',uri=True,timeout=5) as con:
        con.execute('UPDATE mock_h1448_gate SET enabled=0 WHERE id=1')
    return dict(ok=True,status='LOCAL_WRITES_DISABLED')
