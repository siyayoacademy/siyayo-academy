"""Real local SQLite races; all authority/actions are synthetic fixtures."""
from pathlib import Path
import concurrent.futures
import json
import sqlite3
import tempfile
import threading
import unittest
from transactional_lab import submit,FIXTURE_SCHEMA,canonical

UUID='f7027810-0c12-4b65-ae3e-18f538d67e18'
UUID2='72db13d6-27db-4bc0-a99f-3b71a643ec14'
class Transactions(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        self.path=str(Path(self.tmp.name)/'85c.sqlite')
        with sqlite3.connect(self.path) as c:
            c.executescript((Path(__file__).resolve().parents[2]/'migrations/0004_v30_85c_occurrences.sql').read_text()+FIXTURE_SCHEMA)
            c.execute('INSERT INTO mock_sessions VALUES (?,?,0,200)',('MOCK_SESSION','mock-a'))
        self.binding=dict(skillId='why.use.contextual-reason',questionWord='WHY',language='en',dimension='reason-answer(local)',contractId='MOCK_CONTRACT',contractVersion='0.1.0',originExperienceId='shopping-for-dinner',currentExperienceId='shopping-for-dinner')
        self.target('MOCK_TARGET',self.binding)
        self.action('MOCK_ACTION','MOCK_TARGET')
        self.request=dict(sessionHandle='MOCK_SESSION',eventId=UUID,targetId='MOCK_TARGET',actionReference='MOCK_ACTION',intent='start',expectedRevision=1)
    def sql(self,sql,args=()):
        with sqlite3.connect(self.path,timeout=5) as c:
            return c.execute(sql,args).fetchall()
    def target(self,id,binding,subject='mock-a'):
        self.sql('INSERT INTO mock_targets VALUES (?,?,1,1,0,200,?)',(id,subject,canonical(binding)))
    def action(self,reference,target,subject='mock-a'):
        self.sql('INSERT INTO mock_actions VALUES (?,?,?,1,?,?)',(subject,reference,target,'not_exposed','MOCK_EXPOSURE'))
    def run_request(self,**patch):
        return submit(self.path,{**self.request,**patch},enabled=True,clock=lambda:100)
    def counts(self):
        return tuple(self.sql('SELECT count(*) FROM '+t)[0][0] for t in ['v30_85c_occurrences','mock_scope_reservations','mock_action_consumption'])
    def race(self,functions):
        barrier=threading.Barrier(len(functions))
        def run(f):
            barrier.wait(timeout=5);return f()
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(functions)) as pool:
            return [f.result(timeout=15) for f in [pool.submit(run,fn) for fn in functions]]
    def test_disabled_by_default(self):
        self.assertEqual(submit(self.path,self.request)['reason'],'adapter_disabled');self.assertEqual(self.counts(),(0,0,0))
    def test_atomic_scope_action_occurrence(self):
        self.assertEqual(self.run_request()['receipt'],'created');self.assertEqual(self.counts(),(1,1,1))
    def test_eight_concurrent_same_uuid(self):
        results=self.race([lambda:self.run_request()]*8)
        self.assertEqual(sum(r.get('receipt')=='created' for r in results),1)
        self.assertEqual(sum(r.get('receipt')=='duplicate' for r in results),7);self.assertEqual(self.counts(),(1,1,1))
    def test_same_action_different_uuid_only_one_consumer(self):
        self.run_request()
        results=self.race([lambda:self.run_request(eventId=UUID2,intent='resume')]*4)
        self.assertTrue(all(r['reason']=='action_already_consumed' for r in results));self.assertEqual(self.counts(),(1,1,1))
    def test_two_starts_different_actions_one_scope(self):
        self.action('MOCK_ACTION_2','MOCK_TARGET')
        results=self.race([lambda:self.run_request(),lambda:self.run_request(eventId=UUID2,actionReference='MOCK_ACTION_2')])
        self.assertEqual(sum(r.get('receipt')=='created' for r in results),1)
        self.assertEqual(sum(r.get('reason')=='scope_already_exists' for r in results),1);self.assertEqual(self.counts(),(1,1,1))
    def test_fault_after_claim_rolls_back_all_three(self):
        def crash(c): raise RuntimeError('injected')
        r=submit(self.path,self.request,enabled=True,clock=lambda:100,after_claim=crash)
        self.assertEqual(r['reason'],'transaction_failure');self.assertEqual(self.counts(),(0,0,0));self.assertEqual(self.run_request()['receipt'],'created')
    def test_stale_revision_no_reservation(self):
        self.sql('UPDATE mock_targets SET revision=2')
        self.assertEqual(self.run_request()['reason'],'stale_authorization');self.assertEqual(self.counts(),(0,0,0))
    def test_revoke_before_submit_denies(self):
        self.sql('UPDATE mock_targets SET revoked=1,revision=2')
        self.assertEqual(self.run_request()['reason'],'target_not_authorized');self.assertEqual(self.counts(),(0,0,0))
    def test_concurrent_revoke_serialized_with_write(self):
        def revoke():
            self.sql('UPDATE mock_targets SET revoked=1,revision=2');return 'revoked'
        r,_=self.race([lambda:self.run_request(),revoke])
        if r['ok']: self.assertEqual(self.counts(),(1,1,1))
        else: self.assertEqual(r['reason'],'target_not_authorized');self.assertEqual(self.counts(),(0,0,0))
        self.assertEqual(self.sql('SELECT revoked FROM mock_targets')[0][0],1)
    def test_receipt_after_revoke_not_reauthorization(self):
        self.run_request();self.sql('UPDATE mock_targets SET revoked=1,revision=2')
        r=self.run_request();self.assertEqual(r['receipt'],'duplicate');self.assertFalse(r['evaluationAllowed']);self.assertFalse(r['evidenceAllowed'])
    def test_session_revoked_denies_receipt(self):
        self.run_request();self.sql('UPDATE mock_sessions SET revoked=1')
        self.assertEqual(self.run_request()['reason'],'unauthenticated')
    def test_invalid_request_no_metadata(self):
        self.assertEqual(self.run_request(subject='forged')['reason'],'invalid_request');self.assertEqual(self.counts(),(0,0,0))
    def test_transfer_before_local_proof(self):
        # Establish scope with question-function, without local reason proof.
        b={**self.binding,'dimension':'question-function'}
        self.sql('UPDATE mock_targets SET binding_json=?',(canonical(b),));self.run_request()
        transfer={**self.binding,'dimension':'reason-answer(transfer)','currentExperienceId':'preparing-dinner'}
        self.target('MOCK_TRANSFER',transfer);self.action('MOCK_TRANSFER_ACTION','MOCK_TRANSFER')
        r=self.run_request(eventId=UUID2,targetId='MOCK_TRANSFER',actionReference='MOCK_TRANSFER_ACTION',intent='transfer')
        self.assertEqual(r['receipt'],'created');self.assertEqual(self.counts(),(2,1,2))
    def test_language_scope_independent(self):
        self.run_request()
        self.target('MOCK_PT',{**self.binding,'language':'pt'});self.action('MOCK_PT_ACTION','MOCK_PT')
        self.assertEqual(self.run_request(eventId=UUID2,targetId='MOCK_PT',actionReference='MOCK_PT_ACTION')['receipt'],'created');self.assertEqual(self.counts(),(2,2,2))
    def test_same_uuid_changed_intent_conflicts(self):
        self.run_request();self.assertEqual(self.run_request(intent='resume')['reason'],'occurrence_conflict')
    def test_unknown_exposure_and_patita_cannot_consume(self):
        for query in ["UPDATE mock_actions SET exposure='unknown'","UPDATE mock_actions SET exposure='not_exposed',direct=0"]:
            self.sql(query);self.assertEqual(self.run_request()['reason'],'unverified_action');self.assertEqual(self.counts(),(0,0,0))
    def test_scope_missing_for_resume(self):
        self.assertEqual(self.run_request(intent='resume')['reason'],'scope_not_found');self.assertEqual(self.counts(),(0,0,0))
    def test_same_uuid_distinct_subject_isolated(self):
        self.run_request()
        self.sql('INSERT INTO mock_sessions VALUES (?,?,0,200)',('MOCK_SESSION_B','mock-b'))
        self.target('MOCK_TARGET_B',self.binding,'mock-b');self.action('MOCK_ACTION','MOCK_TARGET_B','mock-b')
        self.assertEqual(self.run_request(sessionHandle='MOCK_SESSION_B',targetId='MOCK_TARGET_B')['receipt'],'created');self.assertEqual(self.counts(),(2,2,2))

    def test_new_action_race_different_uuid_one_winner(self):
        self.run_request();self.action('MOCK_NEW_ACTION','MOCK_TARGET')
        ids=[UUID2,'a9515c2a-9f83-4945-b185-3c55720f9c9d']
        results=self.race([lambda id=id:self.run_request(eventId=id,actionReference='MOCK_NEW_ACTION',intent='resume') for id in ids])
        self.assertEqual(sum(r.get('receipt')=='created' for r in results),1)
        self.assertEqual(sum(r.get('reason')=='action_already_consumed' for r in results),1)
        self.assertEqual(self.counts(),(2,1,2))
    def test_expiry_before_commit_rolls_back_claim_scope_occurrence(self):
        moments=iter([100,201])
        r=submit(self.path,self.request,enabled=True,clock=lambda:next(moments))
        self.assertEqual(r['reason'],'expired_before_commit');self.assertEqual(self.counts(),(0,0,0))

if __name__=='__main__':unittest.main()
