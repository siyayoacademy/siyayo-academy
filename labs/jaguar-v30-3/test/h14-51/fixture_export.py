"""Export existing synthetic fixture DDL only. No database driver or query execution."""
from pathlib import Path
import json
import sys
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'h14-46'))
sys.path.insert(0,str(root/'h14-48'))
from transactional_lab import FIXTURE_SCHEMA
from single_write_boundary import TRIGGERS
schema=(root.parent/'migrations/0004_v30_85c_occurrences.sql').read_text()+FIXTURE_SCHEMA
print(json.dumps(dict(schema=schema,triggers=TRIGGERS)))
