#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs');
const seeds=require('../data/learning/experience-seeds.json').items;
const Definition=require('../js/adaptive-dependency-head-probe-definition.js');
const grounding=require('../data/learning/where-spatial-answer-grounding.json');

for(const experienceId of ['shopping-for-dinner','preparing-dinner']){
  const exp=seeds.find(x=>x.id===experienceId);
  const q=exp.thinkingMind.find(q=>q.questionWord==='where');
  if(experienceId==='shopping-for-dinner')assert.deepEqual(q.assessmentTarget,{
    skill:'where.use.location-question',definitionPath:'data/learning/skills/where.json'
  });
  else assert.equal(q.assessmentTarget,undefined);
  if(experienceId==='preparing-dinner')assert.deepEqual(q.assessmentResumeTarget,{
    skill:'where.use.location-question',definitionPath:'data/learning/skills/where.json'
  });
  else assert.equal(q.assessmentResumeTarget,undefined);
  for(const language of ['en','es','pt']){
    const id=q.dependencyFocus.structureIds[language];
    const structure=require('../data/learning/dependencies/'+id+'.json');
    const relation=structure.relations.find(r=>r.dependent==='where');
    assert.ok(relation);
    const expected=experienceId==='shopping-for-dinner'?'find':'put';
    assert.deepEqual(relation,{head:expected,dependent:'where',relation:'advmod'});
    const def=Definition.create(structure,{
      experienceId,
      targetTokenId:'where',
      prompt:q.dependencyHeadProbe.prompt[language],
      alternativeTokenIds:q.dependencyHeadProbe.alternativeTokenIdsByLanguage[language]
    });
    assert.equal(def.expectedHeadTokenId,expected);
  }
}
assert.equal(grounding.assessmentAuthority,false);
assert.equal(grounding.records.length,2);
assert.equal(grounding.records[0].modeCandidate,'local');
assert.equal(grounding.records[1].modeCandidate,'transfer');
assert.ok(grounding.records.every(r=>r.doesNotClaim.includes('preposition-mastery')));
assert.equal(grounding.candidateFutureEvidence.requiresExplicitMode,true);
const runtime=fs.readFileSync('js/verb-explorer.js','utf8');
for(const prefix of ['shopping-where','preparing-where'])for(const language of ['en','es','pt'])
  assert.ok(runtime.includes('data/learning/dependencies/'+prefix+'-'+language+'.json'));
console.log('PASS — Shopping explicitly targets the WHERE location contract; Preparing stays transfer-only, and content grounding has no assessment authority.');
