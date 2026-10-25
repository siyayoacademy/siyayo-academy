from pathlib import Path
import hashlib
import sqlite3
import sys
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'h14-46'))
import transactional_lab_test as original
from legacy_destination_plan import plan

class DestinationPlan(unittest.TestCase):
    def fixture(self):
        f=original.Transactions();f.setUp();self.addCleanup(f.doCleanups);return f
    def test_consistent_data_never_means_deploy(self):
        f=self.fixture();f.run_request();before=f.sql('SELECT * FROM v30_85c_occurrences');r=plan(f.path)
        self.assertEqual(r['status'],'LOCAL_DATA_CONSISTENT_DESTINATION_UNVERIFIED');self.assertFalse(r['mayDeploy']);self.assertFalse(r['mayWrite']);self.assertFalse(r['mayIssueEvidence']);self.assertEqual(f.sql('SELECT * FROM v30_85c_occurrences'),before)
    def test_unbound_history_preserved_without_promotion(self):
        f=self.fixture();f.run_request();payload='{"choice":"synthetic"}';f.sql('UPDATE v30_85c_occurrences SET payload_json=?,payload_sha256=?',(payload,hashlib.sha256(payload.encode()).hexdigest()))
        before=f.sql('SELECT * FROM v30_85c_occurrences');r=plan(f.path);self.assertEqual(r['status'],'BLOCKED_DATA_RECONCILIATION');self.assertIn('LEGACY_DISPOSITION_REQUIRED',[a['problem'] for a in r['actions']]);self.assertEqual(f.sql('SELECT * FROM v30_85c_occurrences'),before)
    def test_unreserved_bound_rows_get_no_automatic_backfill(self):
        f=self.fixture();f.run_request();f.sql('DELETE FROM mock_action_consumption');f.sql('DELETE FROM mock_scope_reservations')
        r=plan(f.path);self.assertIn('UNRESERVED_SCOPE',[a['problem'] for a in r['actions']]);self.assertIn('UNRESERVED_OR_CONFLICTING_ACTION',[a['problem'] for a in r['actions']]);self.assertEqual(f.counts(),(1,0,0))
    def test_integrity_fault_requires_investigation(self):
        f=self.fixture();f.run_request();f.sql("UPDATE v30_85c_occurrences SET payload_json='{}'")
        r=plan(f.path);a=next(a for a in r['actions'] if a['problem']=='INTEGRITY_FAILURE');self.assertIn('INVESTIGATE',a['disposition']);self.assertEqual(f.counts(),(1,1,1))
    def test_orphan_claim_is_not_deleted(self):
        f=self.fixture();f.run_request();f.sql('DELETE FROM v30_85c_occurrences');r=plan(f.path)
        self.assertIn('ORPHAN_ACTION_CLAIM',[a['problem'] for a in r['actions']]);self.assertEqual(f.counts(),(0,1,1))
    def test_missing_metadata_is_not_recreated(self):
        f=self.fixture();f.sql('DROP TABLE mock_action_consumption');before=f.sql('SELECT name FROM sqlite_master ORDER BY name');r=plan(f.path)
        self.assertIn('MISSING_LAB_METADATA',[a['problem'] for a in r['actions']]);self.assertEqual(f.sql('SELECT name FROM sqlite_master ORDER BY name'),before)
    def test_missing_file_does_not_create_database(self):
        f=self.fixture();path=str(Path(f.path).with_name('absent.sqlite'));r=plan(path)
        self.assertEqual(r['status'],'STOP_UNREADABLE_SOURCE');self.assertFalse(Path(path).exists())
    def test_zero_rows_is_not_a_transaction_error_in_sqlite(self):
        f=self.fixture()
        with sqlite3.connect(f.path) as con:
            con.execute('INSERT INTO mock_actions VALUES (?,?,?,1,?,?)',('mock-a','MOCK_NEW','MOCK_TARGET','not_exposed','MOCK_EXPOSURE'))
            changed=con.execute("UPDATE mock_targets SET revision=2 WHERE id='ABSENT'").rowcount
            self.assertEqual(changed,0)
        self.assertEqual(f.sql("SELECT count(*) FROM mock_actions WHERE reference='MOCK_NEW'")[0][0],1)
    def test_real_statement_failure_rolls_back_prior_changes_in_sqlite(self):
        f=self.fixture()
        with self.assertRaises(sqlite3.IntegrityError):
            with sqlite3.connect(f.path) as con:
                con.execute('INSERT INTO mock_actions VALUES (?,?,?,1,?,?)',('mock-a','MOCK_NEW','MOCK_TARGET','not_exposed','MOCK_EXPOSURE'))
                con.execute('INSERT INTO mock_actions VALUES (?,?,?,1,?,?)',('mock-a','MOCK_ACTION','MOCK_TARGET','not_exposed','MOCK_EXPOSURE'))
        self.assertEqual(f.sql("SELECT count(*) FROM mock_actions WHERE reference='MOCK_NEW'")[0][0],0)

if __name__=='__main__':unittest.main()
