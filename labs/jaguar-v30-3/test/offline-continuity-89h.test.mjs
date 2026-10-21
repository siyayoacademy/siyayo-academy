// V30.3.89H — test-only continuity. No network / Cloudflare / customer identity.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {observationPreview85D} from './storage-contract/restore-observer.mjs';
import {read89D,inspect89D} from '../scripts/check-staging-architecture-89d.mjs';
const pause=JSON.parse(readFileSync(new URL('../governance/zero-trust-deferral-89h.json',import.meta.url)));
const old=read89D();
const c=(w,l,purpose,status)=>({ok:true,kind:'OBSERVATIONS_ONLY',questionWord:w,skillId:w.toLowerCase()+'.lab',
 language:l,originExperienceId:'shopping-for-dinner',events:[{
  questionWord:w,language:l,originExperienceId:'shopping-for-dinner',purpose,status
 }]});
test('user deferral is explicit and not an Access entitlement',()=>{
 assert.equal(pause.stage,'LOCAL_TESTS_ONLY');
 assert.equal(pause.decision,'DEFER_ZERO_TRUST_NO_PURCHASE');
 assert.equal(pause.checkoutObserved.paymentMethodRequested,true);
 assert.equal(pause.checkoutObserved.checkoutCompletionConfirmed,false);
 assert.equal(pause.checkoutObserved.accessAppPolicyVerified,false);
});
test('no financial, remote or production release permission',()=>{
 assert.ok(Object.entries(pause.securityFreeze).every(([k,v])=>
  k==='requiresFutureExplicitApproval'?v===true:v===false));
});
test('original fail-closed 89D design remains BLOCKED',()=>{
 const r=inspect89D(old);assert.equal(r.valid,true);assert.equal(r.verdict,'BLOCKED');
 assert.equal(r.blockedExternalGates,12);
});
test('external security proofs cannot be claimed by a CI test',()=>{
 assert.equal(pause.externalControls.length,12);
 assert.ok(pause.externalControls.every(x=>x.status==='blocked'));
});
test('local synthetic and official Explorer branches are separated',()=>{
 assert.equal(pause.labScope.branch,'jaguar/v30-3-recovery-archive');
 assert.equal(pause.labScope.syntheticLearnerDataOnly,true);
 assert.equal(pause.labScope.officialExplorerPin,'c7e83709cacf8479847df0f3cee4ed8a563aaae6');
});
test('four authored display QWs x three languages no automatic accepted progress',()=>{
 const q=pause.labScope.visibleQuestionWords,l=pause.labScope.languages;
 assert.deepEqual(q,['WHICH','WHAT','WHERE','WHY']);
 assert.deepEqual(l,['en','es','pt']);
 const cells=observationPreview85D(q.flatMap(w=>l.map(lang=>c(w,lang,'assessment','pending')))).cells;
 assert.equal(cells.length,12);
 assert.ok(cells.every(x=>x.pendingOccurrences===1&&x.acceptedProgress===null&&x.greenPass===false&&x.confirmed===false));
});
test('pending and exploratory observations stay separate',()=>{
 const p=observationPreview85D([c('WHAT','pt','assessment','pending'),c('WHAT','pt','exploration','observed_exploratory')]);
 const cell=p.cells.find(x=>x.questionWord==='WHAT'&&x.language==='pt');
 assert.equal(cell.pendingOccurrences,1);assert.equal(cell.exploratoryObservations,1);
 assert.equal(cell.acceptedProgress,null);assert.equal(cell.greenPass,false);
});
test('unobserved other languages/QWs do not inherit mock observation',()=>{
 const p=observationPreview85D([c('WHICH','en','assessment','pending')]);
 const english=p.cells.find(x=>x.questionWord==='WHICH'&&x.language==='en');
 const spanish=p.cells.find(x=>x.questionWord==='WHICH'&&x.language==='es');
 const where=p.cells.find(x=>x.questionWord==='WHERE'&&x.language==='en');
 assert.equal(english.pendingOccurrences,1);assert.equal(spanish.pendingOccurrences,0);
 assert.equal(where.pendingOccurrences,0);
});
test('non-authored QWs cannot silently expand visible scoring matrix',()=>{
 const p=observationPreview85D([c('HOW MANY','en','assessment','pending')]);
 assert.equal(p.cells.length,12);
 assert.equal(p.cells.some(x=>x.questionWord==='HOW MANY'),false);
});
