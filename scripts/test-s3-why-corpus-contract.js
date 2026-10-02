#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const seeds=JSON.parse(fs.readFileSync(path.join(root,'data/learning/experience-seeds.json'),'utf8')).items;
const skill=JSON.parse(fs.readFileSync(path.join(root,'data/learning/skills/why.json'),'utf8'));
const byId=new Map(seeds.map(item=>[item.id,item]));
const s2=byId.get('preparing-dinner'),s3=byId.get('having-dinner'),s4=byId.get('after-dinner-conversation');
assert.equal(s2.toroidalNext.nextExperience,s3.id);
assert.equal(s3.toroidalNext.nextExperience,s4.id);
assert.equal(s2.thinkingMind.find(entry=>entry.questionWord==='what').assessmentTarget.skill,'what.use.object-question');
assert.equal(s3.thinkingMind.find(entry=>entry.questionWord==='what').assessmentTarget,undefined,
  'salmon remains a transfer response owned by S2');
assert.deepEqual(skill.passContract.requires,[
  {dimension:'question-function',result:'pass'},
  {dimension:'reason-answer',result:'pass',support:'none',mode:'local'},
  {dimension:'reason-answer',result:'pass',mode:'transfer',support:'none'}
]);
for(const [experience,accepted] of [[s3,'prepared-together'],[s4,'talking-together']]){
  const entries=experience.thinkingMind.filter(entry=>entry.questionWord==='why');
  assert.equal(entries.length,1);
  const entry=entries[0],ground=entry.reasonGrounding;
  assert.equal(ground.groundedIn,'situation');
  assert.equal(ground.acceptedReasonId,accepted);
  assert.equal(new Set(ground.alternatives.map(option=>option.id)).size,ground.alternatives.length);
  assert.equal(ground.alternatives.filter(option=>option.id===accepted).length,1);
  assert.equal(ground.alternatives.some(option=>option.id==='shopping-now'),true);
  for(const locale of ['en','es','pt']){
    assert.ok(entry.question[locale]&&entry.questionWordLabel[locale]&&experience.situation[locale]);
    assert.ok(ground.alternatives.every(option=>option.response[locale]));
    assert.ok(ground.alternatives.find(option=>option.id===accepted).response[locale]
      .toLocaleLowerCase().includes(locale==='es'?'juntos':locale==='pt'?'juntos':'together'));
  }
}
assert.deepEqual(s3.thinkingMind.find(entry=>entry.questionWord==='why').assessmentTarget,
  {skill:skill.id,definitionPath:'data/learning/skills/why.json'});
assert.equal(s4.thinkingMind.find(entry=>entry.questionWord==='why').assessmentTarget,undefined,
  'S4 reason is a transfer candidate, not automatic S4 adoption');
console.log('PASS — WHY target and distinct S3/S4 reasons are grounded in EN/ES/PT; S2 WHAT transfer remains separate.');
