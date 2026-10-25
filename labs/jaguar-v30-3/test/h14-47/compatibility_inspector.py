"""Read-only, synthetic lab database compatibility audit. No backfill or grading."""
import hashlib
import json
import sqlite3
from pathlib import Path
from collections import Counter


def inspect(path):
    con=sqlite3.connect(Path(path).resolve().as_uri()+'?mode=ro',uri=True)
    con.row_factory=sqlite3.Row
    counts=Counter()
    problems=set()
    try:
        con.execute('BEGIN') # Consistent read snapshot across rows and companion metadata.
        tables={r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        required={'v30_85c_occurrences','mock_action_consumption','mock_scope_reservations'}
        if not required.issubset(tables):
            return dict(status='BLOCKED_COMPANION_METADATA_ABSENT',counts={},problems=['MISSING_LAB_METADATA'],cutoverReady=False,evaluationAllowed=False)
        claims={(r['subject'],r['action_reference']):r['event_id'] for r in con.execute('SELECT * FROM mock_action_consumption')}
        scopes={r['scope_key'] for r in con.execute('SELECT * FROM mock_scope_reservations')}
        actions={}
        events=set()
        matched_claims=set()
        for r in con.execute('SELECT * FROM v30_85c_occurrences'):
            counts['occurrences']+=1
            events.add((r['learner_subject'],r['event_id']))
            payload=r['payload_json']
            if hashlib.sha256(payload.encode()).hexdigest()!=r['payload_sha256']:
                counts['invalid_integrity']+=1;problems.add('INTEGRITY_FAILURE');continue
            try: e=json.loads(payload)
            except ValueError:
                counts['invalid_integrity']+=1;problems.add('INTEGRITY_FAILURE');continue
            if not isinstance(e,dict) or e.get('bindingVersion')!='h14.41.v0.1':
                counts['legacy_unbound']+=1;problems.add('LEGACY_DISPOSITION_REQUIRED');continue
            if (r['skill_id']!='why.use.contextual-reason' or r['question_word']!='WHY' or r['status']!='pending' or r['purpose']!='assessment' or
                any(e.get(k)!=r[c] for k,c in [('language','language'),('originExperienceId','origin_experience_id'),('currentExperienceId','current_experience_id'),('contractVersion','contract_version'),('questionWord','question_word')]) or
                any(not isinstance(e.get(k),str) or not e[k] for k in ['contractId','actionReference','assessmentTargetId','exposureReference']) or
                e.get('modelExposure') not in ['exposed','not_exposed'] or
                e.get('dimension') not in ['question-function','reason-answer(local)','reason-answer(transfer)'] or
                e.get('intent') not in ['start','resume','transfer']):
                counts['invalid_binding']+=1;problems.add('INVALID_BINDING');continue
            transfer=e['dimension']=='reason-answer(transfer)'
            if transfer!=(e['intent']=='transfer') or transfer==(e['originExperienceId']==e['currentExperienceId']):
                counts['invalid_binding']+=1;problems.add('INVALID_BINDING');continue
            scope=json.dumps([r['learner_subject'],r['skill_id'],r['language'],r['origin_experience_id'],e['contractId'],r['contract_version'],r['question_word']],ensure_ascii=False,separators=(',',':'))
            if scope not in scopes:
                counts['missing_scope']+=1;problems.add('UNRESERVED_SCOPE')
            key=(r['learner_subject'],e['actionReference'])
            actions.setdefault(key,set()).add(r['event_id'])
            if claims.get(key)!=r['event_id']:
                counts['missing_or_mismatched_claim']+=1;problems.add('UNRESERVED_OR_CONFLICTING_ACTION')
            else:
                matched_claims.add(key)
            counts['bound']+=1
        if any(len(ids)>1 for ids in actions.values()):
            problems.add('ACTION_REUSED_ACROSS_UUIDS')
        if any((subject,event) not in events for (subject,_),event in claims.items()):
            problems.add('ORPHAN_ACTION_CLAIM')
        if set(claims)-matched_claims:
            problems.add('UNVERIFIED_ACTION_CLAIM')
        return dict(status='BLOCKED_COMPATIBILITY_REVIEW' if problems else 'LOCAL_STORAGE_COMPATIBLE_NOT_AUTHORIZED',counts=dict(counts),problems=sorted(problems),cutoverReady=False,evaluationAllowed=False)
    finally:
        con.close()
