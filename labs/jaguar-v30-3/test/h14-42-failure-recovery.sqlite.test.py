"""H14.42: file-backed SQLite fault harness, NOT Worker/D1 or evaluation.
Uses unchanged 85C schema and INSERT/read/compare design. No second store.
The harness models the SQL protocol; JS contract regressions run separately.
"""
from pathlib import Path
import concurrent.futures
import hashlib
import json
import sqlite3
import subprocess
import sys
import tempfile
import threading
import unittest

MIG = Path(__file__).resolve().parents[1] / 'migrations/0004_v30_85c_occurrences.sql'
FIELDS = ('learner_subject,event_id,skill_id,language,origin_experience_id,'
          'current_experience_id,question_word,purpose,status,contract_version,'
          'source_occurrence_id,payload_sha256,payload_json')
INSERT = f'INSERT INTO v30_85c_occurrences ({FIELDS}) VALUES ({",".join("?" for _ in range(13))}) ON CONFLICT(learner_subject,event_id) DO NOTHING'
SELECT = f'SELECT {FIELDS} FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=?'
EVENT = 'f7027810-0c12-4b65-ae3e-18f538d67e18'

def row(subject='mock-a', language='en', dimension='reason-answer(local)', intent='start', purpose='assessment'):
    payload = json.dumps(dict(bindingVersion='h14.41.v0.1', assessmentTargetId='MOCK_ONLY',
        contractId='WHY-S1-S2-DRAFT', contractVersion='0.1.0', questionWord='WHY',
        language=language, originExperienceId='shopping-for-dinner',
        currentExperienceId='shopping-for-dinner', dimension=dimension, intent=intent,
        actionReference='MOCK_ACTION', exposureReference='MOCK_EXPOSURE'),sort_keys=True,separators=(',',':'))
    return (subject, EVENT, 'why.use.contextual-reason',language,'shopping-for-dinner',
        'shopping-for-dinner','WHY',purpose,'pending' if purpose=='assessment' else 'observed_exploratory',
        '0.1.0','mock-action:1',hashlib.sha256(payload.encode()).hexdigest(),payload)

def submit(path, values, barrier=None):
    with sqlite3.connect(path, timeout=5) as con:
        if barrier: barrier.wait(timeout=5)
        changed = con.execute(INSERT,values).rowcount
        con.commit()
        stored = con.execute(SELECT,values[:2]).fetchone()
        if stored != values: return 'conflict'
        return 'created' if changed else 'duplicate'

class FailureRecovery(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = str(Path(self.temp.name)/'85c.sqlite')
        with sqlite3.connect(self.path) as con: con.executescript(MIG.read_text())
    def tearDown(self): self.temp.cleanup()
    def rows(self):
        with sqlite3.connect(self.path) as con: return con.execute(f'SELECT {FIELDS} FROM v30_85c_occurrences').fetchall()
    def crash(self, committed):
        # Abrupt process death, no Python context-manager cleanup.
        code = ('import sqlite3,os,json,sys; c=sqlite3.connect(sys.argv[1]); '
                'c.execute(sys.argv[2],json.loads(sys.argv[3])); '
                + ('c.commit(); ' if committed else '') + 'os._exit(17)')
        p=subprocess.run([sys.executable,'-c',code,self.path,INSERT,json.dumps(row())],timeout=10)
        self.assertEqual(p.returncode,17)
    def test_crash_before_commit_then_retry(self):
        self.crash(False)
        self.assertEqual(self.rows(),[])
        self.assertEqual(submit(self.path,row()),'created')
    def test_commit_then_lost_response_retry_after_restart(self):
        self.crash(True)
        self.assertEqual(submit(self.path,row()),'duplicate')
        self.assertEqual(self.rows(),[row()])
    def race(self, values):
        gate=threading.Barrier(len(values))
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(values)) as pool:
            futures=[pool.submit(submit,self.path,v,gate) for v in values]
            return [f.result(timeout=15) for f in futures]
    def test_concurrent_identical_retries_one_created(self):
        results=self.race([row()]*8)
        self.assertEqual(results.count('created'),1)
        self.assertEqual(results.count('duplicate'),7)
        self.assertEqual(self.rows(),[row()])
    def test_concurrent_conflicting_payload_one_winner(self):
        candidates=[row(dimension=d) for d in ['question-function','reason-answer(local)','reason-answer(transfer)']]
        results=self.race(candidates)
        self.assertEqual(results.count('created'),1)
        self.assertEqual(results.count('conflict'),2)
        self.assertEqual(len(self.rows()),1)
        self.assertIn(self.rows()[0],candidates)
    def test_distinct_subjects_same_uuid_isolated(self):
        values=[row(subject='mock-a'),row(subject='mock-b')]
        self.assertEqual(self.race(values),['created','created'])
        self.assertEqual(set(self.rows()),set(values))
    def test_same_uuid_changed_language_intent_dimension_conflicts(self):
        submit(self.path,row())
        for changed in [row(language='es'),row(language='pt'),row(intent='resume'),row(dimension='question-function')]:
            self.assertEqual(submit(self.path,changed),'conflict')
        self.assertEqual(self.rows(),[row()])
    def test_storage_busy_then_retry_same_uuid(self):
        lock=sqlite3.connect(self.path)
        try:
            lock.execute('BEGIN IMMEDIATE')
            with sqlite3.connect(self.path,timeout=0.01) as other:
                with self.assertRaises(sqlite3.OperationalError): other.execute(INSERT,row())
        finally: lock.rollback();lock.close()
        self.assertEqual(submit(self.path,row()),'created')
    def test_failed_transaction_rolls_back_without_erasing_history(self):
        submit(self.path,row())
        with sqlite3.connect(self.path) as con:
            with self.assertRaises(sqlite3.IntegrityError):
                with con:
                    con.execute(INSERT,row(subject='mock-b'))
                    invalid=list(row(subject='mock-c'));invalid[8]='confirmed'
                    con.execute(INSERT,invalid)
        self.assertEqual(self.rows(),[row()])
    def test_disable_adapter_preserves_readability_and_legacy(self):
        submit(self.path,row())
        # Rollback is feature disable, not destructive schema rollback.
        enabled=False
        def guarded_submit(values):
            return submit(self.path,values) if enabled else 'adapter_disabled'
        self.assertEqual(guarded_submit(row(subject='mock-b')),'adapter_disabled')
        self.assertEqual(self.rows(),[row()])
        legacy=list(row(subject='mock-legacy'));legacy[-1]='{"choice":"synthetic"}'
        legacy[-2]=hashlib.sha256(legacy[-1].encode()).hexdigest()
        submit(self.path,tuple(legacy))
        self.assertEqual(len(self.rows()),2)
        self.assertNotIn('bindingVersion',json.loads(next(v for v in self.rows() if v[0]=='mock-legacy')[-1]))
    def test_pending_and_exploration_survive_without_promotion(self):
        submit(self.path,row())
        submit(self.path,row(subject='mock-b',purpose='exploration'))
        self.assertEqual({v[8] for v in self.rows()},{'pending','observed_exploratory'})
        with sqlite3.connect(self.path) as con:
            tables={v[0] for v in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        self.assertEqual(tables,{'v30_85c_occurrences'})

if __name__=='__main__': unittest.main()
