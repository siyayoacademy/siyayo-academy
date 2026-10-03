#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const experience=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items.find(x=>x.id==='shopping-for-dinner');
const what=experience.thinkingMind.find(x=>x.questionWord==='what');
const which=experience.thinkingMind.find(x=>x.questionWord==='which');

const calls=[];
const sandbox=vm.createContext({Object,Promise});
sandbox.globalThis=sandbox;
sandbox.GreenPassAuthorityPolicy={contractAuthoritySkills:['which.use.determiner']};
sandbox.SIYAYOVerbExplorerAdaptiveReadinessTrigger={signal(){calls.push('readiness');return Promise.resolve(true);}};
for(const path of [
  'js/leaf-assessment-target-authority.js',
  'js/leaf-assessment-target-readiness.js',
  'js/leaf-assessment-target-provider.js',
  'js/verb-explorer-thinking-mind-assessment-selection.js'
]){
  vm.runInContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});
}

(async()=>{
  const Selection=sandbox.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
  const Authority=sandbox.SIYAYOLeafAssessmentTargetAuthority;

  assert.equal(await Selection.select(what),false,'ordinary QW exploration must preserve WAIT/no target');
  assert.equal(Authority.getTarget(),null);
  assert.deepEqual(calls,[]);

  assert.equal(await Selection.select(which),true,'explicit canonical assessmentTarget may cross the boundary');
  assert.equal(Authority.getSkill(),'which.use.determiner');
  assert.equal(Authority.getDefinitionPath(),'data/learning/skills/which.json');
  assert.deepEqual(calls,['readiness']);

  Authority.clear();
  const inferred={questionWord:'where',intention:'place'};
  assert.equal(await Selection.select(inferred),false,'questionWord/intention must never manufacture a Skill');
  assert.equal(Authority.getTarget(),null);

  console.log('Thinking Mind assessment boundary: PASS — exploration stays targetless/WAIT; only an explicit authorized assessmentTarget signals readiness.');
})().catch(error=>{console.error(error);process.exit(1);});
