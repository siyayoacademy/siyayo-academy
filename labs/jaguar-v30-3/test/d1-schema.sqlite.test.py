"""Independent local SQLite enforcement tests for the V30.3 D1 schema. Never remote."""
import sqlite3
import unittest
from pathlib import Path

SCHEMA=Path(__file__).resolve().parents[1]/'migrations/0003_v30_occurrences.sql'

def insert(db,subject='opaque-a',scope='WHICH/en/S1',occurrence='v30demo',
           purpose='exploration',status='observed_exploratory'):
    return db.execute("""INSERT INTO v30_occurrences
      (learner_subject,scope_key,occurrence_id,purpose,status,contract_version,payload_sha256,payload_json)
      VALUES (?,?,?,?,?,?,?,?)""",
      (subject,scope,occurrence,purpose,status,'0.1.0','a'*64,'{"choice":"books"}'))

class SchemaTests(unittest.TestCase):
    def setUp(self):
        self.db=sqlite3.connect(':memory:')
        self.db.executescript(SCHEMA.read_text())
    def tearDown(self): self.db.close()
    def test_exploration_status(self):
        insert(self.db)
        self.assertEqual(self.db.execute('SELECT status FROM v30_occurrences').fetchone()[0],'observed_exploratory')
    def test_assessment_status(self):
        insert(self.db,purpose='assessment',status='pending')
        self.assertEqual(self.db.execute('SELECT status FROM v30_occurrences').fetchone()[0],'pending')
    def test_exploration_cannot_be_pending(self):
        with self.assertRaises(sqlite3.IntegrityError): insert(self.db,status='pending')
    def test_assessment_cannot_be_exploratory(self):
        with self.assertRaises(sqlite3.IntegrityError): insert(self.db,purpose='assessment')
    def test_invalid_credit_purpose_rejected(self):
        with self.assertRaises(sqlite3.IntegrityError): insert(self.db,purpose='credit',status='pending')
    def test_duplicate_same_subject_scope_id_rejected(self):
        insert(self.db)
        with self.assertRaises(sqlite3.IntegrityError): insert(self.db)
    def test_different_subject_same_id_isolated(self):
        insert(self.db)
        insert(self.db,subject='opaque-b')
        self.assertEqual(self.db.execute('SELECT count(*) FROM v30_occurrences').fetchone()[0],2)
        self.assertEqual(self.db.execute('SELECT count(*) FROM v30_occurrences WHERE learner_subject=? AND scope_key=? AND occurrence_id=?',
          ('opaque-b','WHICH/en/S1','v30demo')).fetchone()[0],1)
    def test_different_scope_same_id_allowed(self):
        insert(self.db)
        insert(self.db,scope='WHAT/en/S1')
        self.assertEqual(self.db.execute('SELECT count(*) FROM v30_occurrences').fetchone()[0],2)
    def test_cannot_update_status_to_confirmed(self):
        insert(self.db)
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE v30_occurrences SET status='confirmed' WHERE learner_subject='opaque-a'")
    def test_idempotent_conflict_do_nothing(self):
        insert(self.db)
        self.db.execute("""INSERT INTO v30_occurrences
          (learner_subject,scope_key,occurrence_id,purpose,status,contract_version,payload_sha256,payload_json)
          VALUES (?,?,?,?,?,?,?,?)
          ON CONFLICT(learner_subject,scope_key,occurrence_id) DO NOTHING""",
          ('opaque-a','WHICH/en/S1','v30demo','exploration','observed_exploratory','0.1.0','a'*64,'{"choice":"books"}'))
        self.assertEqual(self.db.execute('SELECT count(*) FROM v30_occurrences').fetchone()[0],1)

if __name__=='__main__': unittest.main()
