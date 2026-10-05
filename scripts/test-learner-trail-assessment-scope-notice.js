#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Scope=require('../js/adaptive-assessment-scope.js');
const code=fs.readFileSync('js/verb-explorer-learner-trail-surface.js','utf8');

function node(){return {hidden:true,innerHTML:'',dataset:{},classList:{toggle(){}},style:{},closest(){return null;}}}
const surface=node(),title={textContent:'Shopping for a Nice Dinner'},next=node();
const doc={
  getElementById(id){return id==='learnerTrailSurface'?surface:id==='experienceTitle'?title:id==='nextExperience'?next:null;},
  addEventListener(){},
  createElement(){return node();}
};
const scope=Scope.create({learnerId:'Aldo',skill:'which.use.determiner',language:'en',originExperienceId:'shopping-for-dinner'});
const profile={id:'Aldo',observations:[]};
const trail={state:'UNOBSERVED',counts:{footprints:0,greenPassClosures:0},footprints:[]};
const root={
  document:doc,Object,Promise,AdaptiveAssessmentScope:Scope,
  SIYAYOVerbExplorerLearnerIdentitySource:{getId:()=> 'Aldo'},
  SIYAYOVerbExplorerAdaptiveEvidenceProfileSource:{getProfile:()=>profile},
  SIYAYOVerbExplorerCanonicalSkillSource:{
    getSkill:()=> 'which.use.determiner',
    getDefinition:()=>({id:'which.use.determiner',realizations:{en:{form:'which',family:'question-word',grammarRole:'interrogative-determiner'}}})
  },
  AdaptiveLearnerTrailLabel:{project(){return {skill:'which.use.determiner',form:'WHICH',family:'question-word',grammarRole:'interrogative-determiner'}}},
  AdaptiveLearnerTrailView:{project(_p,skill,filter){
    assert.equal(filter.language,'en','Trail history must project the assessment language, not the display language');
    return {...trail,skill};
  }},
  AdaptiveLearnerTrailSequence:{project(){return {segments:[{experienceId:'shopping-for-dinner',state:'UNOBSERVED',marker:'EMPTY_DOT'}]}}},
  AdaptiveLearnerTrailPosition:{resolve(){return {segmentIndex:0,visited:true,currentExperienceId:'shopping-for-dinner'}}},
  AdaptiveLearnerProgressMarker:{resolve(){return {state:'UNOBSERVED',marker:'EMPTY_DOT',confirmedExperiences:0}}},
  SIYAYOVerbExplorerAdaptiveStateBridge:{getState(){return {currentExperienceId:'shopping-for-dinner',experienceLanguage:'es'}}},
  SIYAYOVerbExplorerAdaptiveCoordinator:{snapshot(){return {session:{decision:{skill:'which.use.determiner',experienceId:'shopping-for-dinner',assessmentScope:scope}},context:{passContract:{requires:[]},evidencePackets:[]}}}},
  AdaptivePassContractProgressView:{project(){return {completed:0,total:3,satisfied:[false,false,false]}}},
  GreenPassProfile:{},
  SIYAYOVerbExplorerExperienceRuntime:{
    activeLanguage:()=> 'es',
    activeQuestionWord:()=> 'what',
    activeExperienceId:()=> 'shopping-for-dinner'
  },
  SIYAYOVerbExplorerDependencyHeadProbeLive:{getPracticeTrace:()=>[]},
  SIYAYOVerbExplorerThinkingMindAssessmentSelection:{getRetainedProgress:()=>[]}
};
root.globalThis=root;vm.runInNewContext(code,root);
assert.equal(root.SIYAYOVerbExplorerLearnerTrailSurface.refresh({document:doc,language:'es'}),true);
assert.match(surface.innerHTML,/EXPLORANDO WHAT · EVALUACIÓN WHICH/);
assert.match(surface.innerHTML,/PANTALLA ES · EVALUACIÓN EN/);
assert.match(surface.innerHTML,/WHICH/);
assert.doesNotMatch(surface.innerHTML,/EVALUACIÓN ES/);
console.log('PASS — Trail shows visual QWord/display language separately from canonical assessment QWord/language.');
