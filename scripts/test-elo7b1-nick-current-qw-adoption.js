#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync('js/verb-explorer-learner-identity-surface.js','utf8');

function scenario({language='pt',question='what',resume=false,delayed=false,assessmentTarget=true,resumeOnly=false,alreadyActive=false,alternateLearner=false}={}){
  let nick=null,active=alreadyActive?{session:{decision:{skill:'previous.skill'}}}:null;
  let word=question,experience='shopping-for-dinner',lang=language,selectCalls=[],readinessCalls=0,renders=0,resumeCalls=0;
  let resumeResolve;
  const target=assessmentTarget?{skill:question+'.use.'+(question==='what'?'object-question':'determiner'),definitionPath:'data/learning/skills/'+question+'.json'}:undefined;
  const declared={questionWord:question,assessmentTarget:target};
  const selected=()=>({ ...declared, questionWord:word });
  const docNodes={};
  for(const id of ['learnerIdentityPanel','learnerIdentityInput','learnerIdentityConfirm','learnerIdentityStatus']){
    docNodes[id]={dataset:{},value:'',textContent:'',listeners:{},addEventListener(type,listener){this.listeners[type]=listener;}};
  }
  const doc={getElementById(id){return docNodes[id]||null;}};
  const root={Object,Promise,document:doc,
    SIYAYOVerbExplorerLearnerIdentitySource:{getId:()=>nick},
    SIYAYOVerbExplorerLearnerIdentityProvider:{provide(v){nick=v;if(alternateLearner)active=null;return true;}},
    SIYAYOVerbExplorerExperienceRuntime:{activeQuestionWord:()=>word,activeExperienceId:()=>experience,activeLanguage:()=>lang,render(){renders++;}},
    SIYAYOVerbExplorerExperienceNavigation:{getExperience(id){return id==='shopping-for-dinner'?{id,thinkingMind:[selected()]}:null;}},
    SIYAYOQuestionWordAssessmentContract:{targetForSelection(q){return q.assessmentTarget?{...q.assessmentTarget,resumeOnly}:null;}},
    SIYAYOVerbExplorerAdaptiveCoordinator:{snapshot:()=>active},
    SIYAYOVerbExplorerThinkingMindAssessmentSelection:{
      resumeForIdentity(){resumeCalls++;if(delayed)return new Promise(resolve=>{resumeResolve=resolve;});return Promise.resolve(resume);},
      select(q){selectCalls.push({word:q.questionWord,language:lang,experience});active={session:{decision:{skill:q.assessmentTarget.skill,language:lang,experienceId:experience}},context:{accepted:0}};return Promise.resolve(true);}
    },
    SIYAYOVerbExplorerAdaptiveReadinessTrigger:{signal(){readinessCalls++;return Promise.resolve(false);}}
  };
  root.globalThis=root;vm.runInNewContext(code,root);
  const surface=root.SIYAYOVerbExplorerLearnerIdentitySurface;
  assert.equal(surface.install(),true);
  docNodes.learnerIdentityInput.value='Polyglot';
  const click=()=>docNodes.learnerIdentityConfirm.listeners.click();
  const tick=async()=>{for(let i=0;i<15;i++)await Promise.resolve();};
  return {click,tick,root,selectCalls,docNodes,getActive:()=>active,getNick:()=>nick,getCalls:()=>({readinessCalls,renders,resumeCalls}),setWord:x=>{word=x;},setLang:x=>{lang=x;},setExperience:x=>{experience=x;},resolveResume:x=>resumeResolve(x)};
}
async function run(){
 let count=0;
 for(const language of ['en','es','pt']){
   // No QW click before entering NICK: the selected WHAT or WHICH target is adopted.
   for(const word of ['what','which']){
     const t=scenario({language,question:word});t.click();await t.tick();
     assert.equal(t.getNick(),'Polyglot');
     assert.equal(t.selectCalls.length,1,word+' '+language+' must start exactly once after NICK');
     assert.equal(t.selectCalls[0].language,language);
     assert.equal(t.getActive().session.decision.experienceId,'shopping-for-dinner');
     assert.equal(t.getCalls().readinessCalls,0,'no double-start readiness when select succeeds');
     // These are simulated authorized contract observations, not exploration-only feedback.
     t.getActive().context.accepted++;
     t.getActive().context.accepted++;
     assert.equal(t.getActive().context.accepted,2,'live Session now receives two authorized responses');
     t.click();await t.tick();assert.equal(t.selectCalls.length,1,'same NICK must not start duplicate circuit');
     count++;
   }
   // No target or resume-only QW never starts a new assessment by NICK alone.
   for(const c of [{assessmentTarget:false},{resumeOnly:true}]){
     const t=scenario({language,...c});t.click();await t.tick();
     assert.equal(t.selectCalls.length,0);assert.equal(t.getActive(),null);count++;
   }
   // A prior explicit pending selection still wins: no duplicate adoption.
   const existing=scenario({language,resume:true});existing.click();await existing.tick();
   assert.equal(existing.selectCalls.length,0);assert.equal(existing.getCalls().readinessCalls,0);count++;
   // A valid existing active session is not overwritten by initial selected Question Word.
   const active=scenario({language,alreadyActive:true});active.click();await active.tick();
   assert.equal(active.selectCalls.length,0);assert.equal(active.getActive().session.decision.skill,'previous.skill');count++;
   // If user navigates while asynchronous resume is pending, no stale QW adoption.
   const changed=scenario({language,delayed:true});changed.click();changed.setWord('where');changed.resolveResume(false);await changed.tick();
   assert.equal(changed.selectCalls.length,0);count++;
   const changedLang=scenario({language,delayed:true});changedLang.click();changedLang.setLang('other');changedLang.resolveResume(false);await changedLang.tick();
   assert.equal(changedLang.selectCalls.length,0);count++;
 }
 console.log('PASS ELO 7B.1 — '+count+' scenarios: nick adopts visible start QW in EN/ES/PT, preserves pending/current Session, excludes undeclared/resume-only and stale focus; no duplicate start.');
}
run().catch(err=>{console.error(err);process.exit(1);});
