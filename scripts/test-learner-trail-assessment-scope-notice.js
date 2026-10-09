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
  SIYAYOVerbExplorerExperienceNavigation:{getExperience:id=>require('../data/learning/experience-seeds.json').items.find(item=>item.id===id)},
  SIYAYOVerbExplorerDependencyHeadProbeLive:{getPracticeTrace:()=>[]},
  SIYAYOVerbExplorerThinkingMindAssessmentSelection:{getRetainedProgress:()=>[]}
};
root.globalThis=root;vm.runInNewContext(code,root);
assert.equal(root.SIYAYOVerbExplorerLearnerTrailSurface.refresh({document:doc,language:'es'}),true);
assert.match(surface.innerHTML,/EXPLORANDO WHAT · EVALUACIÓN WHICH/);
assert.match(surface.innerHTML,/PANTALLA ES · EVALUACIÓN EN/);
assert.match(surface.innerHTML,/data-state="saved"><b[^>]*>○<\/b><strong>WHICH<\/strong><small>0\/3 · progreso guardado<\/small>/,
  'Changing display language keeps the existing assessment progress identified as saved while another QWord is explored');
assert.match(surface.innerHTML,/<strong class="learner-trail-current-word">QUÉ<\/strong>/);
assert.match(surface.innerHTML,/data-assessment-qword="which"/);
assert.match(surface.innerHTML,/WHICH/);
assert.doesNotMatch(surface.innerHTML,/EVALUACIÓN ES/);

// The language gear changes presentation, while an existing assessment keeps
// its own language, QWord and progress. Exercise the read-only surface across
// all language pairs, free QWord exploration and three existing progress states.
root.AdaptiveLearnerTrailLabel=require('../js/adaptive-learner-trail-label.js');
root.AdaptiveLearnerTrailView=require('../js/adaptive-learner-trail-view.js');
const definition={id:'which.use.determiner',realizations:{
  en:{form:'which',family:'question-word',grammarRole:'interrogative-determiner'},
  es:{form:'cuál',family:'palabra-interrogativa',grammarRole:'determinante-interrogativo'},
  pt:{form:'qual',family:'palavra-interrogativa',grammarRole:'determinante-interrogativo'}
}};
root.SIYAYOVerbExplorerCanonicalSkillSource.getDefinition=()=>definition;
let active,displayLanguage,visualQWord,completed;
root.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot=()=>active;
root.SIYAYOVerbExplorerExperienceRuntime.activeLanguage=()=>displayLanguage;
root.SIYAYOVerbExplorerExperienceRuntime.activeQuestionWord=()=>visualQWord;
root.AdaptivePassContractProgressView.project=(contract,packets)=>{
  assert.strictEqual(contract,active.context.passContract);
  assert.strictEqual(packets,active.context.evidencePackets);
  return {completed,total:3,satisfied:[0,1,2].map(index=>index<completed)};
};
let cases=0;
for(const assessmentLanguage of ['en','es','pt']){
  const ownedScope=Scope.create({learnerId:'Aldo',skill:definition.id,language:assessmentLanguage,originExperienceId:'shopping-for-dinner'});
  active={session:{decision:{skill:definition.id,experienceId:'shopping-for-dinner',assessmentScope:ownedScope}},
    context:{passContract:{requires:[{dimension:'choice-function'},{mode:'local'},{mode:'transfer'}]},evidencePackets:[]}};
  const unchanged=JSON.stringify(active);
  for(completed=0;completed<3;completed++){
    for(displayLanguage of ['en','es','pt']){
      for(visualQWord of ['which','what','where']){
        assert.equal(root.SIYAYOVerbExplorerLearnerTrailSurface.refresh({document:doc}),true);
        const card=surface.innerHTML.match(/<span class="learner-journey-word" data-state="([^\"]+)">[^]*?<strong>WHICH<\/strong><small>([^<]+)<\/small><\/span>/);
        assert.ok(card);
        assert.equal(card[1],visualQWord==='which'?'active':'saved',`${assessmentLanguage} assessment keeps its own progress on ${displayLanguage} display`);
        assert.ok(card[2].startsWith(completed+'/3'));
        assert.equal((surface.innerHTML.match(/data-state="active"/g)||[]).length,visualQWord==='which'?1:0);
        const currentQuestion=root.SIYAYOVerbExplorerExperienceNavigation.getExperience('shopping-for-dinner').thinkingMind.find(item=>item.questionWord===visualQWord);
        assert.ok(surface.innerHTML.includes('<strong class="learner-trail-current-word">'+currentQuestion.questionWordLabel[displayLanguage]+'</strong>'));
        assert.equal(surface.dataset.currentQword,visualQWord);
        assert.equal(surface.dataset.assessmentLanguage,assessmentLanguage);
        if(visualQWord!=='which'){
          assert.equal(surface.dataset.state,'EXPLORING');
          assert.match(surface.innerHTML,/data-assessment-qword="which"/);
        }
        if(displayLanguage!==assessmentLanguage){
          assert.match(surface.innerHTML,new RegExp('(?:DISPLAY|PANTALLA|TELA) '+displayLanguage.toUpperCase()+' · (?:ASSESSMENT|EVALUACIÓN|AVALIAÇÃO) '+assessmentLanguage.toUpperCase()));
        }
        assert.equal(JSON.stringify(active),unchanged,'Presentation must not mutate the assessment snapshot');
        cases++;
      }
    }
  }
}
console.log(`PASS — Trail preserves canonical assessment scope and active progress across ${cases} language/QWord/display cases.`);
