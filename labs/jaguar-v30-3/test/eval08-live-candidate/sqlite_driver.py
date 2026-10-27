import json,sqlite3,sys
from pathlib import Path
x=json.load(sys.stdin)
db=sqlite3.connect(x['path']);db.row_factory=sqlite3.Row;db.execute('PRAGMA foreign_keys=ON')
try:
 op=x['op']
 if op=='init':
  db.executescript((Path(__file__).parent/'atomic-fixture.sql').read_text())
  db.executescript((Path(__file__).parents[1]/'migrations/0004_v30_85c_occurrences.sql').read_text())
  db.commit();print('{}')
 elif op=='batch':
  out=[]
  try:
   with db:
    for i,s in enumerate(x['statements']):
     if x.get('failAt')==i:raise RuntimeError('injected SQL failure')
     q=db.execute(s['sql'],s.get('args',[]));out.append({'success':True,'results':[],'meta':{'changes':max(q.rowcount,0)}})
   print(json.dumps(out))
  except Exception as e:
   print(json.dumps({'error':str(e)}));sys.exit(1)
 elif op=='first':
  row=db.execute(x['sql'],x.get('args',[])).fetchone();print(json.dumps(dict(row) if row else None))
 elif op=='all':
  rows=db.execute(x['sql'],x.get('args',[])).fetchall();print(json.dumps({'success':True,'results':[dict(r) for r in rows]}))
 else:
  with db:q=db.execute(x['sql'],x.get('args',[]))
  print(json.dumps({'success':True,'changes':max(q.rowcount,0)}))
finally:db.close()
