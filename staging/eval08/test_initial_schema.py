import sqlite3
from pathlib import Path
MIGRATION=Path('staging/eval08/migrations/0001_eval08_initial.sql')
sql=MIGRATION.read_text(encoding='utf8')
assert 'lab_eval_' not in sql
assert 'v30_85c_occurrences' not in sql
assert 'CREATE TABLE' in sql
assert 'DROP TABLE' not in sql.upper()
assert 'INSERT INTO' not in sql.upper()
db=sqlite3.connect(':memory:')
db.execute('PRAGMA foreign_keys=ON')
db.executescript(sql)
tables={r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'eval08_%'")}
expected={'eval08_sessions','eval08_contracts','eval08_actions','eval08_occurrences','eval08_attempts','eval08_evidence','eval08_outbox'}
assert tables==expected,(tables,expected)
assert sum(db.execute('SELECT COUNT(*) FROM '+n).fetchone()[0] for n in expected)==0
def rejects(stmt,args=()):
 try:
  db.execute(stmt,args)
 except sqlite3.IntegrityError:
  return
 raise AssertionError('SQL must reject: '+stmt)
rejects("INSERT INTO eval08_contracts(contract_id,contract_version,revision,subject_key,session_key,skill_id,language,origin_experience_id,current_experience_id,question_word,phase,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",('c','1',1,'x','s','why','en','S1','S2','WHY','transfer',1000))
db.execute("INSERT INTO eval08_sessions VALUES('SUB','SESSION','TEST_ISSUER',9999999999,0)")
db.execute("INSERT INTO eval08_contracts(contract_id,contract_version,revision,subject_key,session_key,skill_id,language,origin_experience_id,current_experience_id,question_word,phase,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",('CONTRACT','0.1',1,'SUB','SESSION','why.use.contextual-reason','en','having-dinner','having-dinner','WHY','local',9999999999))
assert db.execute('SELECT authorized FROM eval08_contracts').fetchone()[0]==0
eid='f7027810-0c12-4b65-ae3e-18f538d67e18'
db.execute("INSERT INTO eval08_actions(action_key,event_id,subject_key,session_key,contract_id,contract_version,contract_revision,skill_id,language,origin_experience_id,current_experience_id,question_word,dimension,mode,phase,source,recorded_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",('ACT',eid,'SUB','SESSION','CONTRACT','0.1',1,'why.use.contextual-reason','en','having-dinner','having-dinner','WHY','reason-answer','local','local','DIRECT_LEARNER_ACTION',10))
rejects("INSERT INTO eval08_occurrences(subject_key,event_id,action_key,skill_id,language,origin_experience_id,current_experience_id,question_word,purpose,status,payload_sha256,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",('SUB',eid,'ACT','why.use.contextual-reason','en','having-dinner','having-dinner','WHY','assessment','accepted','0'*64,10))
db.execute("INSERT INTO eval08_occurrences VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",('SUB',eid,'ACT','why.use.contextual-reason','en','having-dinner','having-dinner','WHY','assessment','pending','0'*64,10))
packet='{"test":true}'
rejects("INSERT INTO eval08_attempts VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",('SUB',eid,'ACT','CONTRACT','0.1',1,'SCOPE','why.use.contextual-reason','en','having-dinner','having-dinner','reason-answer','local','fail','PROOF',packet,10))
rejects("INSERT INTO eval08_evidence VALUES(?,?,?,?,?,?,?)",('SUB',eid,'SCOPE','why.use.contextual-reason','en','having-dinner',packet))
rejects("UPDATE eval08_attempts SET result='pass' WHERE subject_key='SUB'")
assert db.execute('SELECT COUNT(*) FROM eval08_evidence').fetchone()[0]==0
assert db.execute('PRAGMA foreign_key_check').fetchall()==[]
print('EVAL-08 STAGING SCHEMA PASS: 7 empty tables, keys, default DENY, fail cannot mint Evidence, immutable Attempts, no lab tables')
