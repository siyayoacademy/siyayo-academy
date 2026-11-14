'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const d=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const s2=d.items.find(e=>e.id==='preparing-dinner');
for(const word of ['when','how','who']){
 const q=s2.thinkingMind.find(x=>x.questionWord===word);
 assert.equal(q.dialogueStatus?.kind,'illustrative-study-only',word+' must not claim observed truth');
 assert.equal(q.dialogueStatus.assessmentAuthority,false);
 assert.equal(q.dialogueStatus.assessmentEvidence,false);
 assert.ok(!q.assessmentTarget,'no inferred contract '+word);
 const unit=q.dialogueForms?.present?.affirmative;
 assert.ok(unit,'missing present affirmative '+word);
 assert.deepEqual(unit.question,q.question,'must reuse canonical question '+word);
 for(const lang of ['en','es','pt'])assert.ok(unit.response[lang]?.trim(),'missing response '+word+'/'+lang);
 assert.equal(Object.keys(q.dialogueForms).length,1,'no invented extra tenses');
 assert.equal(Object.keys(q.dialogueForms.present).length,1,'no invented extra modes');
 assert.ok(q.dependencyFocus&&q.dependencyHeadProbe,'Focus/Probe lost '+word);
}
const js=fs.readFileSync('js/verb-explorer.js','utf8');
assert.ok(js.includes('ILLUSTRATIVE RESPONSE · FREE STUDY'),'exploration label missing');
assert.ok(js.includes('if(!illustrative)return[]'),'previous dialogue behavior changed');
assert.ok(js.includes('CORPUS AUTHORING STATUS'),'missing safe fallback');
console.log('PASS S2 illustrative response coverage 3 QWs × EN/ES/PT, present affirmative only, no credits or invented modes');
