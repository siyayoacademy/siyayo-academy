'use strict';
// JAGUAR S4 · prevents a historical candidate being presented as ready DF/Head Probe.
const fs=require('node:fs'),assert=require('node:assert/strict');
const seeds=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const ledger=JSON.parse(fs.readFileSync('data/learning/references/jaguar-gear360-s4-source-reconciliation-20261113.json','utf8'));
const s4=seeds.items.find(x=>x.id==='after-dinner-conversation');
assert.ok(s4,'S4 missing');
assert.equal(ledger.target.experienceId,s4.id);
assert.deepEqual(ledger.target.questionWords,['what','who','how']);
for(const source of ledger.sources)assert.ok(fs.existsSync(source.path),'Provenance file missing: '+source.path);
let pending=0,integrated=0;
for(const entry of ledger.slots){
 const q=s4.thinkingMind.find(x=>x.questionWord===entry.qw);
 assert.ok(q,'S4 question removed: '+entry.qw);
 for(const lang of ['en','es','pt']){
  assert.equal(q.question?.[lang],entry.question[lang],'S4 authored source changed; reconcile ledger for '+entry.qw+'/'+lang);
 }
 const df=!!q.dependencyFocus,head=!!q.dependencyHeadProbe;
 assert.equal(df,head,'S4 missing matching Dependency Focus/Head Probe: '+entry.qw);
 if(df){
  // Once implemented, update handoff rather than silently maintaining stale pending status.
  assert.notEqual(entry.state,'QUESTION_AUTHORED_DEPENDENCY_NOT_AUTHORED',
    'S4 '+entry.qw+' is implemented: update provenance and verification before claiming coverage');
  integrated++;
 }else{
  assert.equal(entry.state,'QUESTION_AUTHORED_DEPENDENCY_NOT_AUTHORED',
    'S4 '+entry.qw+' pending status is inconsistent');
  assert.ok(entry.pending.length>1,'Missing authoring/review steps for '+entry.qw);
  pending++;
 }
 assert.ok(!q.assessmentTarget,'S4 entry must not inherit unintended assessment authority '+entry.qw);
}
const why=s4.thinkingMind.find(x=>x.questionWord==='why');
assert.ok(why?.dependencyFocus&&why?.dependencyHeadProbe,'WHY S4 canonical dependency regression');
assert.equal(why.assessmentTarget,undefined,'S4 is a transfer, not a new WHY assessment contract');
const summary={pending,integrated,whyPreserved:true};
console.log('PASS S4 provenance cross-check:',JSON.stringify(summary));
