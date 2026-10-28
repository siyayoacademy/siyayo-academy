#!/usr/bin/env python3
"""Fail-closed Wrangler setup preflight. NO network, database or deploy."""
import json,subprocess
from pathlib import Path
base=Path('staging/eval08')
cfg=json.loads((base/'wrangler.jsonc').read_text())
assert cfg['name']=='siyayo-academy-staging-api'
assert cfg['workers_dev'] is False and cfg['preview_urls'] is False
assert not (set(cfg)&{'route','routes','triggers','main','assets','account_id'})
assert len(cfg['d1_databases'])==1
d=cfg['d1_databases'][0]
assert d=={
  'binding':'ASSESSMENT_DB',
  'database_name':'siyayo-academy-staging',
  'database_id':'cc48dd16-ac40-4af1-a206-f2d72ed4e7f0',
  'migrations_dir':'migrations',
  'migrations_table':'d1_migrations'
}
migration=base/d['migrations_dir']/'0001_eval08_initial.sql'
assert migration.is_file()
assert sorted(p.name for p in migration.parent.glob('*.sql'))==['0001_eval08_initial.sql']
assert subprocess.check_output(['git','hash-object',str(migration)],text=True).strip()=='9ec9e52f471abf7218bfeb11f82bdb9591050ae2', 'Migration content mismatch against previously GREEN-approved SQL: STOP'
assert 'CREATE TABLE' in migration.read_text()
print('DRY RUN GREEN: staging-only target + exact migration git blob + no public routes/deploy')
