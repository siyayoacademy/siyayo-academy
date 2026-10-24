#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const bridge=require('./jaguar-h14-13-specialized-mirror-reference.js');
const fixture=process.argv.includes('--fixture');
const plan=read('data/learning/references/jaguar-h14-13-progressive-explorer-integration-v0.1.json');
let exp,fn;
if(fixture){
 const ids=plan.moduleAxis.experiences;
 exp=ids.map(id=>({id,thinkingMind:[{questionWord:'what'},{questionWord:'why'}],perspectives:Object.fromEntries(plan.moduleAxis.perspectives.map(p=>[p.id,{line:p.color,examples:{en:['Authored source example'],es:['Ejemplo de referencia'],pt:['Exemplo original da cena']}}]))}));
 fn={cells:ids.flatMap(id=>plan.moduleAxis.verbFunctions.map(functionId=>({experienceId:id,functionId,status:'PENDING_HOMOLOGATION',provenance:'SIYAYO_ADAPTATION',assessmentAuthority:false,assessmentEvidence:false,tense:'present',example:{en:'Function example',es:'Ejemplo de función',pt:'Exemplo da função'}})))};
}else{
 exp=read('data/learning/experience-seeds.json').items;
 fn=read('data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json');
 const old=read('data/learning/references/jaguar-h14-12-integration-ledger-v0.1.json');
 const gitSha=bytes=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+bytes.length+'\0'),bytes])).digest('hex');
 assert.equal(old.assets.length,14);
 for(const item of old.assets)assert.equal(gitSha(fs.readFileSync(item.path)),item.gitBlobSha,item.id+' changed without review');
}
assert.equal(plan.moduleAxis.combinatorialRelationships,80);
assert.equal(plan.integrationStages.length,7);
assert.equal(plan.deliveryState.githubBranchCreated,true);
assert.equal(plan.deliveryState.githubCommitCreated,true);
assert.equal(plan.deliveryState.integrationPublishedToExplorer,false);
assert.equal(plan.assessment.newEvidence,false);
assert.equal(plan.masterVipRules.perspectiveConclusionIsNotGreenPass,true);
let count=0;
const before=JSON.stringify(exp),beforeFn=JSON.stringify(fn);
for(const experience of exp)for(const functionId of plan.moduleAxis.verbFunctions)for(const p of plan.moduleAxis.perspectives){
 for(const language of ['en','es','pt']){
  const selection={experienceId:experience.id,functionId,perspective:p.id,language,tense:'present',mode:'affirmative',period:'none'};
  const x=bridge.project({experiences:exp,functionsMatrix:fn,selection});
  assert.ok(x,JSON.stringify(selection));
  assert.equal(x.color,p.color);assert.equal(x.contextualAnswer,null);assert.equal(x.canAwardEvidence,false);
  assert.equal(x.canGrantGreenPass,false);assert.equal(x.assessmentAuthority,false);assert.equal(x.question,null);
  const cell=fn.cells.find(c=>c.experienceId===experience.id&&c.functionId===functionId);
  const authoredNow=cell.tense==='present'||cell.tense==='present-habitual';
  assert.equal(x.functionSourceExample,authoredNow?cell.example[language]:null);
  const off=bridge.project({experiences:exp,functionsMatrix:fn,selection:{...selection,tense:'past',mode:'interrogative'}});
  assert.ok(off);assert.equal(off.functionSourceExample,null);
  assert.equal(off.functionExampleStatus,'NOT_AUTHORED_FOR_SELECTED_GRAMMAR');
 }
 count++;
}
assert.equal(count,80);
const s=bridge.project({experiences:exp,functionsMatrix:fn,selection:{experienceId:exp[0].id,functionId:'existence',perspective:'concluding',language:'pt',tense:'present',mode:'affirmative',period:'none',questionWord:'why'}});
assert.ok(s);assert.equal(s.selectedQuestionWord,'why');assert.equal(s.contextualAnswer,null);
assert.equal(bridge.project({experiences:exp,functionsMatrix:fn,selection:{experienceId:exp[0].id,functionId:'existence',perspective:'concluding',language:'fr'}}),null);
assert.equal(bridge.project({experiences:exp,functionsMatrix:fn,selection:{experienceId:exp[0].id,functionId:'existence',perspective:'concluding',language:'pt',questionWord:'how-far'}}),null);
assert.equal(JSON.stringify(exp),before);assert.equal(JSON.stringify(fn),beforeFn);
const source=fs.readFileSync('scripts/jaguar-h14-13-specialized-mirror-reference.js','utf8');
for(const forbidden of ['fetch(', 'localStorage', 'sessionStorage','submitObservedAttempt','recordOutcome(', 'createEvidence(','addEventListener('])assert.equal(source.includes(forbidden),false,forbidden);
console.log('PASS H14.13: 80 source-level crossings / 240 language views; grammar not inferred; prior source unchanged; no assessment authority'+(fixture?' (fixture mode)':' (full-repo mode)'));
