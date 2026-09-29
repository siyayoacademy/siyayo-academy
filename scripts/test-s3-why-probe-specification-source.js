#!/usr/bin/env node
const assert=require('node:assert/strict');
const source=require('../js/adaptive-why-contextual-reason-probe-specification-source.js');
const items=require('../data/learning/experience-seeds.json').items;
const skill=require('../data/learning/skills/why.json');
const s2=items.find(item=>item.id==='preparing-dinner');
const s3=items.find(item=>item.id==='having-dinner');
const s4=items.find(item=>item.id==='after-dinner-conversation');
for(const language of ['en','es','pt']){
  const probes=source.resolve(skill,s3,s4,language);
  assert.ok(probes,`S3 WHY specifications missing in ${language}`);
  assert.equal(probes.functionProbe.expectedAlternativeId,'why');
  assert.deepEqual(probes.functionProbe.alternatives.map(item=>item.id),['why','how']);
  assert.equal(probes.localProbe.expectedAlternativeId,'prepared-together');
  assert.equal(probes.localProbe.experienceId,s3.id);
  assert.equal(probes.localProbe.fromExperienceId,null);
  assert.equal(probes.localProbe.mode,'local');
  assert.equal(probes.transferProbe.expectedAlternativeId,'talking-together');
  assert.equal(probes.transferProbe.fromExperienceId,s3.id);
  assert.equal(probes.transferProbe.experienceId,s4.id);
  assert.equal(probes.transferProbe.mode,'transfer');
  assert.equal(probes.transferProbe.dimension,'reason-answer');
  assert.notEqual(probes.localProbe.expectedAlternativeId,probes.transferProbe.expectedAlternativeId);
  assert.ok(Object.isFrozen(probes)&&Object.isFrozen(probes.transferProbe.alternatives));
  assert.equal(source.resolve(skill,s2,s3,language),null,'S2 WHAT must not become S3 WHY');
  assert.equal(source.resolve(skill,s4,s3,language),null,'reverse visit is not a transfer');
  assert.equal(source.resolve({...skill,id:'what.use.object-question'},s3,s4,language),null);
  const noTarget={...s3,thinkingMind:s3.thinkingMind.map(q=>q.questionWord==='why'?{...q,assessmentTarget:undefined}:q)};
  assert.equal(source.resolve(skill,noTarget,s4,language),null);
  const duplicate={...s3,thinkingMind:[...s3.thinkingMind,s3.thinkingMind.find(q=>q.questionWord==='why')]};
  assert.equal(source.resolve(skill,duplicate,s4,language),null);
  const wrongReason={...s3,thinkingMind:s3.thinkingMind.map(q=>q.questionWord==='why'
    ?{...q,reasonGrounding:{...q.reasonGrounding,acceptedReasonId:'not-declared'}}:q)};
  assert.equal(source.resolve(skill,wrongReason,s4,language),null);
  const noLocale={...s4,thinkingMind:s4.thinkingMind.map(q=>q.questionWord==='why'
    ?{...q,reasonGrounding:{...q.reasonGrounding,alternatives:q.reasonGrounding.alternatives.map((option,index)=>
      index===0?{...option,response:{...option.response,[language]:''}}:option)}}:q)};
  assert.equal(source.resolve(skill,s3,noLocale,language),null);
  const sameAnswer={...s4,thinkingMind:s4.thinkingMind.map(q=>q.questionWord==='why'
    ?{...q,reasonGrounding:{...q.reasonGrounding,acceptedReasonId:'prepared-together',
      alternatives:[{...q.reasonGrounding.alternatives[0],id:'prepared-together'},q.reasonGrounding.alternatives[1]]}}:q)};
  assert.equal(source.resolve(skill,s3,sameAnswer,language),null,'transfer needs a new reason');
}
console.log('PASS — read-only WHY specifications ground S3/S4 reasons in EN/ES/PT and fail closed.');
