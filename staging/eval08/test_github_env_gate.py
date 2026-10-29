#!/usr/bin/env python3
"""Static EVAL-08 GitHub Actions & Environment contract: NO API, no secrets."""
import json
from pathlib import Path
p=json.loads(Path('staging/eval08/environment_gate_policy.json').read_text(encoding='utf-8'))
f=Path(p['workflow'])
s=f.read_text(encoding='utf-8')
assert p['environment']=='eval08-staging-d1'
assert p['environment_branch' if 'environment_branch' in p else 'required_environment_branch']=='jaguar/eval08-wrangler-gate-20261028'
assert p['external_environment_config']=='NOT_VERIFIED'
assert p['environment_secret_presence']=='NOT_VERIFIED'
assert p['migration_remote_execution']=='NOT_AUTHORIZED_AND_NOT_EXECUTED'
assert 'workflow_dispatch:' in s and 'options: [dry_run, apply_0001]' in s
assert "default: dry_run" in s
assert 'environment: eval08-staging-d1' in s
assert 'github.event_name == \'workflow_dispatch\'' in s
assert "github.ref == 'refs/heads/jaguar/eval08-wrangler-gate-20261028'" in s
assert "inputs.operation == 'apply_0001'" in s
assert "inputs.database_confirmation == 'siyayo-academy-staging'" in s
assert "inputs.migration_confirmation == 'APPLY-0001-STAGING'" in s
assert s.count("wrangler d1 migrations apply siyayo-academy-staging --remote") == 1
assert 'wrangler deploy' not in s
assert 'CLOUDFLARE_API_TOKEN: ${{ secrets.SIYAYO_EVAL08_CF_D1_TOKEN }}' in s
assert 'CLOUDFLARE_ACCOUNT_ID: ${{ secrets.SIYAYO_EVAL08_CF_ACCOUNT_ID }}' in s
assert 'permissions:\n  contents: read' in s
assert 'cancel-in-progress: false' in s
assert 'gh api' not in s and 'curl -X POST' not in s
config=json.loads(Path('staging/eval08/wrangler.jsonc').read_text(encoding='utf-8'))
assert config['workers_dev'] is False and config['preview_urls'] is False
assert len(config['d1_databases'])==1 and config['d1_databases'][0]['database_id']==p['database_id']
assert 'main' not in config and 'routes' not in config
print('ENVIRONMENT POLICY STATIC GREEN: no remote job on push, manual confirmations + environment required')
print('EXTERNAL PROTECTION RULES AND SECRETS REMAIN UNVERIFIED')
