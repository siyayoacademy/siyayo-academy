"""Test-only RPC driver: execute 85C JS SQL or H14.46 model on same SQLite file."""
import json
from pathlib import Path
import sqlite3
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'h14-46'))
from transactional_lab import submit,FIXTURE_SCHEMA,canonical
from compatibility_inspector import inspect
x=json.load(sys.stdin)
if x['op']=='model':
    print(json.dumps(submit(x['path'],x['request'],enabled=True,clock=lambda:100)))
elif x['op']=='audit':
    print(json.dumps(inspect(x['path'])))
else:
    con=sqlite3.connect(x['path']);con.row_factory=sqlite3.Row
    if x['op']=='init':
        con.executescript((Path(__file__).resolve().parents[2]/'migrations/0004_v30_85c_occurrences.sql').read_text())
        if x.get('metadata',True):
            con.executescript(FIXTURE_SCHEMA)
            b=dict(skillId='why.use.contextual-reason',questionWord='WHY',language='en',dimension='reason-answer(local)',contractId='MOCK_CONTRACT',contractVersion='0.1.0',originExperienceId='shopping-for-dinner',currentExperienceId='shopping-for-dinner')
            con.execute('INSERT INTO mock_sessions VALUES (?,?,0,200)',('MOCK_SESSION','mock-a'))
            con.execute('INSERT INTO mock_targets VALUES (?,?,1,1,0,200,?)',('MOCK_TARGET','mock-a',canonical(b)))
            con.execute('INSERT INTO mock_actions VALUES (?,?,?,1,?,?)',('mock-a','MOCK_ACTION','MOCK_TARGET','not_exposed','MOCK_EXPOSURE'))
        con.commit();print('{}')
    else:
        q=con.execute(x['sql'],x.get('args',[]))
        if x['op']=='first':
            r=q.fetchone();print(json.dumps(dict(r) if r else None))
        elif x['op']=='all':
            print(json.dumps([dict(r) for r in q.fetchall()]))
        else:
            changed=q.rowcount;con.commit();print(json.dumps(dict(meta=dict(changes=changed))))
    con.close()
