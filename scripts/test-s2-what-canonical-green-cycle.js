#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const seed=require('../data/learning/experience-seeds.json').items;
const nouns=require('../data/lexicon/nouns/nouns.json');
const skill=require('../data/learning/skills/what.json');
const which=require('../data/learning/skills/which.json');
const specification=require('../js/adaptive-what-object-question-probe-specification-source.js');
const result=require('../js/adaptive-what-object-question-probe-result.js');
const bridge=require('../js/adaptive-what-object-question-probe-evidence-bridge.js');
const boundary=require('../js/adaptive-what-object-question-probe-attempt-boundary.js');
const Scope=require('../js/adaptive-assessment-scope.js');
const Profile=require('../js/green-pass-profile.js');
const policy=require('../data/learning/green-pass-authority.json');
const runtime={Object,Array,Set,AdaptiveAssessmentScope:Scope,AdaptivePedagogicalOrchestrator:{},GreenPassProfile:Profile,
  AdaptiveAdvanceSelector:{select(){throw Error('Green does not navigate');}},
  GreenPassAuthorityPolicy:policy,
  AdaptiveLearningRouter:{route:()=>({action:'continue-assessment',focus:'assessment'})},
  AdaptiveWaitClassifier:{classifyWait:()=>null}};
runtime.globalThis=runtime;
vm.runInNewContext(fs.readFileSync('js/adaptive-attempt-loop.js','utf8'),runtime);
vm.runInNewContext(fs.readFileSync('js/adaptive-learning-cycle.js','utf8'),runtime);
vm.runInNewContext(fs.readFileSync('js/verb-explorer-learner-event.js','utf8'),runtime);
assert.ok(policy.contractAuthoritySkills.includes(skill.id));
for (const language of ['en','es','pt']) {
  const specs=specification.resolve(skill,seed[1],seed[2],nouns,language);
  const profile=Profile.createProfile('learner-'+language);
  const oldKey=language+':question-words:'+which.id;
  profile.bySkill[oldKey]={attempts:3,correct:3,accuracy:1,confidence:1,status:'ready'};
  profile.greenPass=true;
  const scope=Scope.create({learnerId:profile.id,skill:skill.id,language,originExperienceId:seed[1].id});
  const session={decision:{skill:skill.id,experienceId:seed[1].id,language,assessmentScope:scope},trace:[]};
  let context={assessmentScope:scope,language,skill:skill.id,currentExperience:seed[1].id,passContract:skill.passContract,evidencePackets:[]};
  let greenProfile=profile;
  assert.equal(Profile.evaluateContract(context.passContract,context.evidencePackets).status,'WAITING_FOR_EVIDENCE');
  const sequence=[[specs.functionProbe,'what'],[specs.localProbe,'tomatoes'],[specs.transferProbe,'salmon']];
  sequence.forEach(([spec,choice],index)=>{
    const event=runtime.SIYAYOVerbExplorerLearnerEvent.fromWhatObjectQuestionProbeSelect(choice,{
      skill:skill.id,dimension:spec.dimension,mode:spec.mode,language,
      currentExperienceId:spec.experienceId,fromExperienceId:spec.fromExperienceId
    });
    const evaluated=result.evaluate(spec,event);
    const evidence=bridge.fromResult({result:evaluated,learnerEvent:event,supportSensor:{support:()=> 'none'}});
    const rawAttempt=boundary.assemble({learnerEvent:event,evidence});
    const attempt=Scope.bindAttempt({scope,attempt:rawAttempt,learnerEvent:event,state:{experienceLanguage:language},learnerId:profile.id});
    assert.ok(attempt,'real Event/Result/Evidence/Attempt must carry the assessment language');
    const cycle=runtime.AdaptiveLearningCycle.submit(greenProfile,session,attempt,{...context,learnerEvent:event});
    assert.equal(cycle.operationalAuthority,'contract');
    assert.equal(cycle.contractEligible,index===2);
    assert.equal(cycle.contractEvaluation.status,index===2?'GREEN_PASS':'WAITING_FOR_EVIDENCE');
    assert.equal(cycle.evidencePacket.mode,index===2?'transfer':'local');
    assert.equal(cycle.advanceSelection,null,'NEXT remains learner-owned');
    assert.ok(cycle.greenProfile.bySkill[oldKey], 'S1 confirmed skill must remain in history');
    greenProfile=cycle.greenProfile;
    context=cycle.nextContext;
  });
  assert.equal(context.evidencePackets.length,3);
  assert.equal(session.decision.experienceId,seed[1].id);
}
console.log('PASS — canonical WHAT Cycle closes only after S2 function/use and S3 transfer in EN/ES/PT.');
