"""JAGUAR 85C — real SQLite schema and restart tests. LOCAL ONLY."""
from pathlib import Path
import sqlite3
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
MIG=ROOT/'migrations/0004_v30_85c_occurrences.sql'
OLD=ROOT/'migrations/0003_v30_occurrences.sql'
UUID='f7027810-0c12-4b65-ae3e-18f538d67e18'
UUID2='72db13d6-27db-4bc0-a99f-3b71a643ec14'
FIELDS=('learner_subject','event_id','skill_id','language','origin_experience_id',
        'current_experience_id','question_word','purpose','status','contract_version',
        'source_occurrence_id','payload_sha256','payload_json')
def data(**kw):
    d=dict(zip(FIELDS,('opaque-a',UUID,'which.use.determiner','en','shopping-for-dinner',
      'shopping-for-dinner','WHICH','assessment','pending','0.1.0',
      'choice-select:1','a'*64,'{"choice":"books"}')))
    d.update(kw)
    return tuple(d[k] for k in FIELDS)
def write(con,values=None):
    con.execute("INSERT INTO v30_85c_occurrences ("+','.join(FIELDS)+") VALUES ("+
      ','.join('?' for _ in FIELDS)+")",values if values is not None else data())

class DurableStorageSchema(unittest.TestCase):
    def setUp(self):
        self.con=sqlite3.connect(':memory:')
        self.con.executescript(OLD.read_text()+'\n'+MIG.read_text())
    def tearDown(self):
        self.con.close()
    def test_new_table_is_additive(self):
        names={row[0] for row in self.con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        self.assertIn('v30_occurrences',names)
        self.assertIn('v30_85c_occurrences',names)
    def test_old_table_remains_writable(self):
        self.con.execute("""INSERT INTO v30_occurrences
        (learner_subject,scope_key,occurrence_id,purpose,status,contract_version,payload_sha256,payload_json)
        VALUES (?,?,?,?,?,?,?,?)""",('opaque-a','which/en/s1','one','exploration','observed_exploratory','0.1.0','a'*64,'{}'))
        self.assertEqual(self.con.execute('SELECT count(*) FROM v30_occurrences').fetchone()[0],1)
    def test_insert_pending(self):
        write(self.con)
        self.assertEqual(self.con.execute('SELECT status FROM v30_85c_occurrences').fetchone()[0],'pending')
    def test_insert_exploration(self):
        write(self.con,data(purpose='exploration',status='observed_exploratory'))
        self.assertEqual(self.con.execute('SELECT purpose FROM v30_85c_occurrences').fetchone()[0],'exploration')
    def test_exploration_cannot_mint_pending(self):
        with self.assertRaises(sqlite3.IntegrityError): write(self.con,data(purpose='exploration',status='pending'))
    def test_assessment_cannot_mint_exploratory(self):
        with self.assertRaises(sqlite3.IntegrityError): write(self.con,data(purpose='assessment',status='observed_exploratory'))
    def test_confirmed_and_green_pass_rejected(self):
        for status in ('confirmed','greenPass'):
            with self.assertRaises(sqlite3.IntegrityError): write(self.con,data(status=status))
    def test_invalid_language_rejected(self):
        with self.assertRaises(sqlite3.IntegrityError): write(self.con,data(language='fr'))
    def test_invalid_purpose_rejected(self):
        with self.assertRaises(sqlite3.IntegrityError): write(self.con,data(purpose='credit'))
    def test_bad_payload_json_rejected(self):
        with self.assertRaises(sqlite3.IntegrityError): write(self.con,data(payload_json='{bad'))
    def test_same_subject_event_id_duplicate_rejected_even_with_other_scope(self):
        write(self.con)
        with self.assertRaises(sqlite3.IntegrityError): write(self.con,data(language='pt'))
    def test_same_event_id_different_subject_allowed(self):
        write(self.con)
        write(self.con,data(learner_subject='opaque-b'))
        self.assertEqual(self.con.execute('SELECT count(*) FROM v30_85c_occurrences').fetchone()[0],2)
    def test_same_origin_across_shopping_preparing_having(self):
        write(self.con)
        write(self.con,data(event_id=UUID2,current_experience_id='preparing-dinner'))
        self.assertEqual(self.con.execute("""SELECT count(*) FROM v30_85c_occurrences
          WHERE learner_subject=? AND skill_id=? AND language=? AND origin_experience_id=?""",
          ('opaque-a','which.use.determiner','en','shopping-for-dinner')).fetchone()[0],2)
    def test_scope_index_exists(self):
        indexes={row[1] for row in self.con.execute("PRAGMA index_list('v30_85c_occurrences')")}
        self.assertIn('v30_85c_scope_read',indexes)
    def test_storage_survives_connection_reopen(self):
        with tempfile.TemporaryDirectory() as tmp:
            dbfile=Path(tmp)/'mock-d1.sqlite3'
            a=sqlite3.connect(dbfile);a.executescript(MIG.read_text());write(a);a.commit();a.close()
            b=sqlite3.connect(dbfile)
            self.assertEqual(b.execute('SELECT event_id FROM v30_85c_occurrences WHERE learner_subject=?',
              ('opaque-a',)).fetchone()[0],UUID)
            b.close()
    def test_migration_is_idempotent_and_existing_record_survives(self):
        write(self.con)
        self.con.executescript(MIG.read_text())
        self.assertEqual(self.con.execute('SELECT count(*) FROM v30_85c_occurrences').fetchone()[0],1)

if __name__=='__main__':unittest.main()
