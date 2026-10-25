"""Local test RPC only; reuses H14.47's shared DB fixture/driver."""
from pathlib import Path
import io
import json
import runpy
import sys
from single_write_boundary import install,disable
x=json.load(sys.stdin)
if x['op']=='install':
    print(json.dumps(install(x['path'],enabled=x.get('enabled',False))))
elif x['op']=='disable':
    print(json.dumps(disable(x['path'])))
else:
    old=Path(__file__).resolve().parents[1]/'h14-47/sqlite_lab_driver.py'
    sys.path.insert(0,str(old.parent))
    sys.stdin=io.StringIO(json.dumps(x))
    runpy.run_path(str(old),run_name='__main__')
