#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const seed=require('../data/learning/experience-seeds.json').items;
const skill=require('../data/learning/skills/why.json');
const previous=require('../data/learning/skills/what.json');
const specification=require('../js/adaptive-why-contextual-reason-probe-specification-source.js');
const result=require('../js/adaptive-why-contextual-reason-probe-result.js');
const bridge=require('../js/adaptive-why-contextual-reason-probe-evidence-bridge.js');
const boundary=require('../js/adaptive-why-contextual-reason-probe-attempt-boundary.js');
const Profile=require('../js/green-pass-profile.js');
const policy=require('../data/learning/green-pass-authority.json');
const runtime={Object,Array,Set,AdaptivePedagogicalOrchestrator:{},GreenPassProfile:Profile,
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
  const specs=specification.resolve(skill,seed[2],seed[3],language);
  const profile=Profile.createProfile('learner-'+language);
  const oldKey=language+':question-words:'+previous.id;
  profile.bySkill[oldKey]={attempts:3,correct:3,accuracy:1,confidence:1,status:'ready'};
  profile.greenPass=true;
  const session={decision:{skill:skill.id,experienceId:seed[2].id,language},trace:[]};
  let context={skill:skill.id,currentExperience:seed[2].id,passContract:skill.passContract,evidencePackets:[]};
  let greenProfile=profile;
  assert.equal(Profile.evaluateContract(context.passContract,context.evidencePackets).status,'WAITING_FOR_EVIDENCE');
  const sequence=[[specs.functionProbe,'why'],[specs.localProbe,'prepared-together'],[specs.transferProbe,'talking-together']];
  sequence.forEach(([spec,choice],index)=>{
    const event=runtime.SIYAYOVerbExplorerLearnerEvent.fromWhyContextualReasonProbeSelect(choice,{
      skill:skill.id,dimension:spec.dimension,mode:spec.mode,language,
      currentExperienceId:spec.experienceId,fromExperienceId:spec.fromExperienceId
    });
    const evaluated=result.evaluate(spec,event);
    const evidence=bridge.fromResult({result:evaluated,learnerEvent:event,supportSensor:{support:()=> 'none'}});
    const attempt=boundary.assemble({learnerEvent:event,evidence});
    const cycle=runtime.AdaptiveLearningCycle.submit(greenProfile,session,attempt,{...context,learnerEvent:event});
    assert.equal(cycle.operationalAuthority,'contract');
    assert.equal(cycle.contractEligible,index===2);
    assert.equal(cycle.contractEvaluation.status,index===2?'GREEN_PASS':'WAITING_FOR_EVIDENCE');
    assert.equal(cycle.evidencePacket.mode,index===2?'transfer':'local');
    assert.equal(cycle.advanceSelection,null,'NEXT remains learner-owned');
    assert.ok(cycle.greenProfile.bySkill[oldKey], 'S2 confirmed skill must remain in history');
    greenProfile=cycle.greenProfile;
    context=cycle.nextContext;
  });
  assert.equal(context.evidencePackets.length,3);
  assert.equal(session.decision.experienceId,seed[2].id);
}
console.log('PASS — canonical WHY Cycle closes only after S3 function/reason and S4 transfer in EN/ES/PT.');
