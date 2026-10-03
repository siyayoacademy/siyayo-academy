#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const seeds=require('../data/learning/experience-seeds.json').items;
const nouns=require('../data/lexicon/nouns/nouns.json');
const which=require('../data/learning/skills/which.json');
const what=require('../data/learning/skills/what.json');
const probes=require('../js/adaptive-what-object-question-probe-specification-source.js');
const root={Promise,Object,Array,Set};root.globalThis=root;
let definition=which,loads=0,compositions=0;
const session={decision:{experienceId:'shopping-for-dinner',skill:which.id}};
root.SIYAYOVerbExplorerLearnerIdentitySource={getId:()=> 'learner'};
root.SIYAYOVerbExplorerAdaptiveCoordinator={snapshot:()=>({session})};
root.SIYAYOVerbExplorerCanonicalSkillSource={getDefinition:()=>definition,
  adopt(value){definition=value;return true;}};
root.SIYAYOVerbExplorerCanonicalSkillLoader={load(path){
  loads++;
  if(path!=='data/learning/skills/what.json')return Promise.resolve(false);
  definition=what;return Promise.resolve(true);
}};
root.SIYAYOLeafAssessmentTargetAuthority={getTarget:()=>({skill:what.id,definitionPath:'data/learning/skills/what.json'})};
root.SIYAYOLeafCanonicalSkillBridge={loadTarget:()=>root.SIYAYOVerbExplorerCanonicalSkillLoader.load('data/learning/skills/what.json')};
root.SIYAYOVerbExplorerAdaptiveComposer={compose(){compositions++;return false;}};
root.SIYAYOLeafAssessmentTargetProvider={select(){return root.SIYAYOVerbExplorerAdaptiveLiveStart.tryCompose();}};
root.SIYAYOVerbExplorerExperienceNavigation={getExperience:id=>seeds.find(item=>item.id===id),getNouns:()=>nouns};
root.AdaptiveWhatObjectQuestionProbeSpecificationSource=probes;
root.SIYAYOVerbExplorerWhatAssessmentLive={mount(){return true;}};
root.AdaptiveSessionTransitionBoundary={authorize(input){return {
  status:'transition-authorized',fromExperience:'shopping-for-dinner',toExperience:'preparing-dinner',
  advanceSelection:input.advanceSelection,nextDecision:input.nextDecision
};}};
for(const file of ['js/verb-explorer-adaptive-live-start.js',
  'js/verb-explorer-thinking-mind-assessment-selection.js',
  'js/verb-explorer-next-assessment-target.js']){
  vm.runInNewContext(fs.readFileSync(file,'utf8'),root,{filename:file});
}
(async()=>{
  assert.equal(await root.SIYAYOVerbExplorerThinkingMindAssessmentSelection.select({assessmentTarget:{
    skill:what.id,definitionPath:'data/learning/skills/what.json'
  }}),false,'WHAT exploration cannot recompose active WHICH');
  assert.equal(definition,which,'early selection cannot replace the active Skill definition');
  assert.equal(loads,0,'no canonical load while the WHICH Session is active');
  assert.equal(compositions,0);
  const original={status:'transition-authorized',fromExperience:'shopping-for-dinner',toExperience:'preparing-dinner',
    advanceSelection:{action:'advance',status:'selected',fromExperience:'shopping-for-dinner',experienceId:'preparing-dinner'},
    nextDecision:{action:'advance',experienceId:'preparing-dinner',skill:which.id}};
  const event={observed:true,actor:'learner',intent:'continue-assessment',source:'pedagogical-session-adopt',
    experienceId:'preparing-dinner',occurrenceId:'adopt-after-early-what'};
  const prepared=await root.SIYAYOVerbExplorerNextAssessmentTarget.prepare({authorization:original,
    previousSession:session,language:'en',learnerEvent:event});
  assert.ok(prepared,'explicit S2 adoption still prepares WHAT');
  assert.equal(prepared.target.skill,what.id);
  assert.equal(definition,what);
  assert.equal(loads,1);
  console.log('PASS — early WHAT exploration preserves WHICH, and explicit S2 adoption prepares WHAT.');
})().catch(error=>{console.error(error);process.exitCode=1;});
