#!/usr/bin/env node
const assert=require('node:assert/strict');
const Spec=require('../js/adaptive-where-location-probe-specification-source.js');
const Result=require('../js/adaptive-where-location-probe-result.js');
const Evidence=require('../js/adaptive-where-location-probe-evidence-bridge.js');
const Attempt=require('../js/adaptive-where-location-probe-attempt-boundary.js');
const GreenPass=require('../js/green-pass-profile.js');
const skill=require('../data/learning/skills/where.json');
const grounding=require('../data/learning/where-spatial-answer-grounding.json');
const seeds=require('../data/learning/experience-seeds.json').items;
const local=seeds.find(x=>x.id==='shopping-for-dinner');
const transfer=seeds.find(x=>x.id==='preparing-dinner');
const supportNone={support(){return 'none';}};

function event(spec,choice,occurrence='where-1'){
  return {
    observed:true,actor:'learner',intent:'answer',source:'where-location-probe-select',
    occurrenceId:occurrence,skill:spec.skill,dimension:spec.dimension,mode:spec.mode,
    language:spec.language,experienceId:spec.experienceId,
    fromExperienceId:spec.fromExperienceId||null,choice
  };
}
for(const language of ['en','es','pt']){
  const specs=Spec.resolve(skill,local,transfer,grounding,language);
  assert.ok(specs,language+' specs');
  assert.equal(specs.functionProbe.dimension,'spatial-function');
  assert.equal(specs.localProbe.mode,'local');
  assert.equal(specs.transferProbe.mode,'transfer');
  assert.equal(specs.transferProbe.fromExperienceId,'shopping-for-dinner');

  const packets=[];
  for(const [name,spec] of Object.entries(specs)){
    const e=event(spec,spec.expectedAlternativeId,language+'-'+name);
    const result=Result.evaluate(spec,e);
    assert.equal(result.result,'pass');
    const evidence=Evidence.fromResult({result,learnerEvent:e,supportSensor:supportNone});
    assert.ok(evidence);
    const attempt=Attempt.assemble({learnerEvent:e,evidence});
    assert.ok(attempt);
    packets.push(evidence);
  }
  const green=GreenPass.evaluateContract(skill.passContract,packets);
  assert.equal(green.status,'GREEN_PASS');

  const wrongLang=event(specs.localProbe,specs.localProbe.expectedAlternativeId,'wrong-lang');
  wrongLang.language=language==='en'?'es':'en';
  assert.equal(Result.evaluate(specs.localProbe,wrongLang),null);

  const wrongOrigin=event(specs.transferProbe,specs.transferProbe.expectedAlternativeId,'wrong-origin');
  wrongOrigin.fromExperienceId='having-dinner';
  assert.equal(Result.evaluate(specs.transferProbe,wrongOrigin),null);

  const localWithOrigin=event(specs.localProbe,specs.localProbe.expectedAlternativeId,'local-origin');
  localWithOrigin.fromExperienceId='shopping-for-dinner';
  assert.equal(Result.evaluate(specs.localProbe,localWithOrigin),null);

  const failEvent=event(specs.functionProbe,'destination','wrong-semantic');
  const failResult=Result.evaluate(specs.functionProbe,failEvent);
  assert.equal(failResult.result,'fail');
  const failEvidence=Evidence.fromResult({result:failResult,learnerEvent:failEvent,supportSensor:supportNone});
  assert.equal(failEvidence.result,'fail');
  const failed=GreenPass.evaluateContract(skill.passContract,[failEvidence]);
  assert.equal(failed.status,'WAITING_FOR_EVIDENCE');
}
assert.equal(Spec.resolve({...skill,status:'active'},local,transfer,grounding,'en'),null,'only isolated candidate is accepted during this stage');
console.log('PASS — isolated WHERE Specification→Result→Evidence→Attempt is language/origin/mode strict and can satisfy the candidate contract only with matching local+transfer evidence.');
