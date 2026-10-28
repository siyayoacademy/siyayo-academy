import sqlite3,json
from pathlib import Path
sql=Path('staging/eval08/migrations/0001_eval08_initial.sql').read_text()
assert 'lab_eval_' not in sql and 'DROP TABLE' not in sql.upper()
db=sqlite3.connect(':memory:');db.execute('PRAGMA foreign_keys=ON');db.executescript(sql)
names={r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'eval08_%'")}
assert len(names)==7,names
def reject(s,args=()):
 try: db.execute(s,args)
 except sqlite3.IntegrityError:return
 raise AssertionError('Expected rejection: '+s[:100])
e='f7027810-0c12-4b65-ae3e-18f538d67e18'
scope=json.dumps(['SUB','why.use.contextual-reason','en','having-dinner'],separators=(',',':'))
packet=json.dumps({'skill':'why.use.contextual-reason','result':'pass','dimension':'reason-answer','mode':'local','support':'none','context':{'occurrenceId':e,'language':'en','experienceId':'having-dinner','fromExperienceId':None,'assessmentScope':{'key':scope,'learnerId':'SUB','skill':'why.use.contextual-reason','language':'en','originExperienceId':'having-dinner'}}},separators=(',',':'))
db.execute("INSERT INTO eval08_sessions VALUES('SUB','SESSION','ISSUER',9999999999,0)")
db.execute("INSERT INTO eval08_contracts(contract_id,contract_version,revision,subject_key,session_key,skill_id,language,origin_experience_id,current_experience_id,question_word,phase,expires_at) VALUES('C','1',1,'SUB','SESSION','why.use.contextual-reason','en','having-dinner','having-dinner','WHY','local',9999999999)")
db.execute("INSERT INTO eval08_actions(action_key,event_id,subject_key,session_key,contract_id,contract_version,contract_revision,skill_id,language,origin_experience_id,current_experience_id,question_word,dimension,mode,phase,source,recorded_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",('A',e,'SUB','SESSION','C','1',1,'why.use.contextual-reason','en','having-dinner','having-dinner','WHY','reason-answer','local','local','DIRECT_LEARNER_ACTION',100))
reject("INSERT INTO eval08_occurrences VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",('WRONG',e,'A','why.use.contextual-reason','en','having-dinner','having-dinner','WHY','assessment','pending','0'*64,100))
db.execute("INSERT INTO eval08_occurrences VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",('SUB',e,'A','why.use.contextual-reason','en','having-dinner','having-dinner','WHY','assessment','pending','0'*64,100))
cols="(subject_key,event_id,action_key,contract_id,contract_version,contract_revision,scope_key,skill_id,language,origin_experience_id,current_experience_id,dimension,mode,result,verdict_provenance_key,packet_json,committed_at)"
ins="INSERT INTO eval08_attempts "+cols+" VALUES ("+','.join('?' for _ in range(17))+")"
a=('SUB',e,'A','C','1',1,scope,'why.use.contextual-reason','en','having-dinner','having-dinner','reason-answer','local','pass','EVAL',packet,110)
reject(ins,a) # default DENY
db.execute("UPDATE eval08_contracts SET authorized=1 WHERE contract_id='C'")
reject(ins,a) # action not consumed
db.execute("UPDATE eval08_actions SET consumed=1 WHERE action_key='A'")
reject("UPDATE eval08_actions SET consumed=0 WHERE action_key='A'")
reject(ins,a[:8]+('es',)+a[9:]) # wrong language
db.execute(ins,a)
reject("INSERT INTO eval08_outbox VALUES(?,?,?,?,NULL)",('SUB',e,'EVIDENCE_COMMITTED',scope))
reject("INSERT INTO eval08_evidence VALUES(?,?,?,?,?,?,?)",('SUB',e,'WRONG','why.use.contextual-reason','en','having-dinner',packet))
db.execute("INSERT INTO eval08_evidence VALUES(?,?,?,?,?,?,?)",('SUB',e,scope,'why.use.contextual-reason','en','having-dinner',packet))
db.execute("INSERT INTO eval08_outbox VALUES(?,?,?,?,NULL)",('SUB',e,'EVIDENCE_COMMITTED',scope))
reject("INSERT INTO eval08_outbox VALUES(?,?,?,?,NULL)",('SUB',e,'ATTEMPT_REJECTED',scope))
reject("UPDATE eval08_attempts SET result='fail' WHERE subject_key='SUB'")
# Exploration is independent of direct action
x='72db13d6-27db-4bc0-a99f-3b71a643ec14'
db.execute("INSERT INTO eval08_occurrences VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",('SUB',x,None,'why.use.contextual-reason','es','shopping-for-dinner','shopping-for-dinner','WHY','exploration','observed_exploratory','0'*64,100))
assert db.execute('PRAGMA foreign_key_check').fetchall()==[]
assert db.execute('SELECT count(*) FROM eval08_evidence').fetchone()[0]==1
print('EVAL-08 PREMIGRATION PASS: 7 tables; denied/unconsumed actions blocked, immutable attempts, matching Evidence/outbox, exploration separate')
