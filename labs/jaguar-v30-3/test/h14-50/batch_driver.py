"""Test-only D1-shaped batch implementation using ONE local SQLite transaction.
No BEGIN SQL is emitted by the JS candidate; the test driver supplies atomicity.
"""
from pathlib import Path
import io
import json
import runpy
import sqlite3
import sys
x=json.load(sys.stdin)
if x['op']=='batch':
    c=sqlite3.connect(x['path']);c.row_factory=sqlite3.Row
    try:
        with c:
            out=[]
            for index,s in enumerate(x['statements']):
                if x.get('failAt')==index: raise RuntimeError('injected batch failure')
                q=c.execute(s['sql'],s.get('args',[]))
                results=[dict(r) for r in q.fetchall()] if q.description else []
                out.append(dict(success=True,meta=dict(changes=max(q.rowcount,0)),results=results))
        print(json.dumps(out))
    finally:
        c.close()
elif x['op']=='assertion_schema':
    with sqlite3.connect(x['path']) as c:
        c.execute('CREATE TABLE mock_h1450_assertion(id INTEGER PRIMARY KEY CHECK(id=1),ok INTEGER NOT NULL CHECK(ok=1))')
    print('{}')
else:
    old=Path(__file__).resolve().parents[1]/'h14-48/boundary_driver.py'
    sys.path.insert(0,str(old.parent));sys.stdin=io.StringIO(json.dumps(x))
    runpy.run_path(str(old),run_name='__main__')
