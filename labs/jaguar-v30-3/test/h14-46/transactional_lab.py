"""H14.46 LOCAL SQLITE TRANSACTION MODEL. Not an HTTP/auth/production adapter.
Companion metadata is TEST FIXTURE ONLY. Occurrences use unchanged 85C table.
All writers, including authority changes, must use the same SQLite transaction DB.
"""
import hashlib
import json
import re
import sqlite3
import time

# No occurrence mirror. Only mock authority/scope/action-consumption metadata.
FIXTURE_SCHEMA = '''
CREATE TABLE mock_sessions(handle TEXT PRIMARY KEY,subject TEXT NOT NULL,revoked INTEGER NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE mock_targets(id TEXT PRIMARY KEY,subject TEXT NOT NULL,revision INTEGER NOT NULL,authorized INTEGER NOT NULL,revoked INTEGER NOT NULL,expires INTEGER NOT NULL,binding_json TEXT NOT NULL);
CREATE TABLE mock_actions(subject TEXT NOT NULL,reference TEXT NOT NULL,target_id TEXT NOT NULL,direct INTEGER NOT NULL,exposure TEXT NOT NULL,exposure_reference TEXT NOT NULL,PRIMARY KEY(subject,reference));
CREATE TABLE mock_scope_reservations(scope_key TEXT PRIMARY KEY,created_by_event TEXT NOT NULL);
CREATE TABLE mock_action_consumption(subject TEXT NOT NULL,action_reference TEXT NOT NULL,event_id TEXT NOT NULL,PRIMARY KEY(subject,action_reference),UNIQUE(subject,event_id));
'''
COLUMNS = ('learner_subject,event_id,skill_id,language,origin_experience_id,'
           'current_experience_id,question_word,purpose,status,contract_version,'
           'source_occurrence_id,payload_sha256,payload_json')
INSERT = f'INSERT INTO v30_85c_occurrences ({COLUMNS}) VALUES ({",".join("?" for _ in range(13))})'
UUID = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
TOKEN = re.compile(r'^[A-Za-z0-9_.:-]{1,128}$')

def canonical(v):
    return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False)

def result(reason):
    return dict(ok=False,reason=reason)

class Stop(Exception):
    pass

def submit(path, request, *, enabled=False, clock=time.time, after_claim=None):
    """Request is synthetic. clock/after_claim are trusted test hooks, never HTTP input."""
    if not enabled:
        return result('adapter_disabled')
    keys={'sessionHandle','eventId','targetId','actionReference','intent','expectedRevision'}
    if (not isinstance(request,dict) or set(request)!=keys or
        any(not isinstance(request[k],str) for k in keys-{'expectedRevision'}) or
        not UUID.fullmatch(request['eventId']) or
        any(not TOKEN.fullmatch(request[k]) for k in ['targetId','actionReference']) or
        not 0<len(request['sessionHandle'])<=256 or
        request['intent'] not in ['start','resume','transfer'] or
        type(request['expectedRevision']) is not int or request['expectedRevision']<1):
        return result('invalid_request')
    con=sqlite3.connect(path,timeout=5,isolation_level=None)
    con.row_factory=sqlite3.Row
    try:
        con.execute('BEGIN IMMEDIATE')
        now=clock() # Checked after lock acquisition, not before waiting for writer.
        if type(now) not in (int,float) or not 0<=now<float('inf'):
            raise Stop('invalid_clock')
        session=con.execute('SELECT * FROM mock_sessions WHERE handle=?',(request['sessionHandle'],)).fetchone()
        if not session or session['revoked']!=0 or session['expires']<=now:
            raise Stop('unauthenticated')
        subject=session['subject']
        prior=con.execute('SELECT * FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=?',(subject,request['eventId'])).fetchone()
        if prior:
            payload=prior['payload_json']
            if hashlib.sha256(payload.encode()).hexdigest()!=prior['payload_sha256']:
                raise Stop('integrity_failure')
            event=json.loads(payload)
            if not isinstance(event,dict) or event.get('bindingVersion')!='h14.41.v0.1':
                raise Stop('legacy_unbound')
            if (prior['status']!='pending' or prior['purpose']!='assessment' or
                prior['skill_id']!='why.use.contextual-reason' or prior['question_word']!='WHY' or
                any(event.get(k)!=prior[c] for k,c in [('language','language'),('originExperienceId','origin_experience_id'),('currentExperienceId','current_experience_id'),('contractVersion','contract_version'),('questionWord','question_word')])):
                raise Stop('invalid_persisted_binding')
            if any(event.get(k)!=request[r] for k,r in [('assessmentTargetId','targetId'),('actionReference','actionReference'),('intent','intent')]):
                raise Stop('occurrence_conflict')
            # Historical receipt; no need for target to remain currently authorized.
            con.commit()
            return dict(ok=True,receipt='duplicate',status='pending',evaluationAllowed=False,evidenceAllowed=False)
        target=con.execute('SELECT * FROM mock_targets WHERE id=? AND subject=?',(request['targetId'],subject)).fetchone()
        if not target or target['authorized']!=1 or target['revoked']!=0 or target['expires']<=now:
            raise Stop('target_not_authorized')
        if target['revision']!=request['expectedRevision']:
            raise Stop('stale_authorization')
        b=json.loads(target['binding_json'])
        required={'skillId','questionWord','language','dimension','contractId','contractVersion','originExperienceId','currentExperienceId'}
        if (not isinstance(b,dict) or set(b)!=required or
            any(not isinstance(v,str) for v in b.values()) or
            b['skillId']!='why.use.contextual-reason' or b['questionWord']!='WHY' or
            b['language'] not in ['en','es','pt'] or
            b['dimension'] not in ['question-function','reason-answer(local)','reason-answer(transfer)'] or
            any(not TOKEN.fullmatch(b[k]) for k in ['contractId','contractVersion','originExperienceId','currentExperienceId'])):
            raise Stop('invalid_target_binding')
        transfer=b['dimension']=='reason-answer(transfer)'
        if transfer!=(request['intent']=='transfer') or transfer==(b['originExperienceId']==b['currentExperienceId']):
            raise Stop('dimension_origin_mismatch')
        action=con.execute('SELECT * FROM mock_actions WHERE subject=? AND reference=?',(subject,request['actionReference'])).fetchone()
        if not action or action['target_id']!=target['id'] or action['direct']!=1 or action['exposure'] not in ['exposed','not_exposed'] or not TOKEN.fullmatch(action['exposure_reference']):
            raise Stop('unverified_action')
        scope=canonical([subject,b['skillId'],b['language'],b['originExperienceId'],b['contractId'],b['contractVersion'],b['questionWord']])
        exists=con.execute('SELECT 1 FROM mock_scope_reservations WHERE scope_key=?',(scope,)).fetchone()
        if request['intent']=='start':
            if exists:
                raise Stop('scope_already_exists')
            con.execute('INSERT INTO mock_scope_reservations VALUES (?,?)',(scope,request['eventId']))
        elif not exists:
            raise Stop('scope_not_found')
        consumed=con.execute('SELECT event_id FROM mock_action_consumption WHERE subject=? AND action_reference=?',(subject,request['actionReference'])).fetchone()
        if consumed:
            raise Stop('action_already_consumed')
        con.execute('INSERT INTO mock_action_consumption VALUES (?,?,?)',(subject,request['actionReference'],request['eventId']))
        if after_claim:
            after_claim(con) # Fault injection, kept inside transaction.
        event={k:v for k,v in b.items() if k!='skillId'}
        event.update(bindingVersion='h14.41.v0.1',assessmentTargetId=target['id'],intent=request['intent'],actionReference=action['reference'],exposureReference=action['exposure_reference'],modelExposure=action['exposure'],authorizationRevision=target['revision'])
        payload=canonical(event)
        if len(payload)>4096:
            raise Stop('invalid_submission')
        values=(subject,request['eventId'],b['skillId'],b['language'],b['originExperienceId'],b['currentExperienceId'],b['questionWord'],'assessment','pending',b['contractVersion'],action['reference'],hashlib.sha256(payload.encode()).hexdigest(),payload)
        con.execute(INSERT,values)
        final_now=clock()
        if type(final_now) not in (int,float) or not 0<=final_now<float('inf'):
            raise Stop('invalid_clock')
        if session['expires']<=final_now or target['expires']<=final_now:
            raise Stop('expired_before_commit')
        con.commit()
        return dict(ok=True,receipt='created',status='pending',evaluationAllowed=False,evidenceAllowed=False)
    except Stop as e:
        con.rollback()
        return result(str(e))
    except Exception:
        con.rollback()
        return result('transaction_failure')
    finally:
        con.close()
