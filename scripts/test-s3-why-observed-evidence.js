#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=require('../js/adaptive-why-contextual-reason-probe-specification-source.js');
const result=require('../js/adaptive-why-contextual-reason-probe-result.js');
const bridge=require('../js/adaptive-why-contextual-reason-probe-evidence-bridge.js');
const boundary=require('../js/adaptive-why-contextual-reason-probe-attempt-boundary.js');
const items=require('../data/learning/experience-seeds.json').items;
const skill=require('../data/learning/skills/why.json');
const sandbox={};vm.runInNewContext(fs.readFileSync('js/verb-explorer-learner-event.js','utf8'),sandbox);
const events=sandbox.SIYAYOVerbExplorerLearnerEvent;
const none={support:()=> 'none'};
for(const language of ['en','es','pt']){
  const specs=source.resolve(skill,items[2],items[3],language);
  const occurrences=new Set();
  for(const spec of [specs.functionProbe,specs.localProbe,specs.transferProbe]){
    const event=events.fromWhyContextualReasonProbeSelect(spec.expectedAlternativeId,{
      skill:spec.skill,dimension:spec.dimension,mode:spec.mode,language:spec.language,
      currentExperienceId:spec.experienceId,fromExperienceId:spec.fromExperienceId
    });
    assert.ok(event&&event.observed&&event.actor==='learner');
    assert.equal(occurrences.has(event.occurrenceId),false);
    occurrences.add(event.occurrenceId);
    const outcome=result.evaluate(spec,event);
    assert.equal(outcome.result,'pass');
    const evidence=bridge.fromResult({result:outcome,learnerEvent:event,supportSensor:none});
    assert.equal(evidence.result,'pass');
    const attempt=boundary.assemble({learnerEvent:event,evidence});
    assert.equal(attempt.skill,skill.id);
    assert.equal(attempt.context.experienceId,spec.experienceId);
    assert.equal(attempt.mode,spec.mode);
    assert.equal(attempt.support,'none');
    assert.equal(result.evaluate(spec,{...event,observed:false}),null);
    assert.equal(result.evaluate(spec,{...event,experienceId:'preparing-dinner'}),null);
    assert.equal(result.evaluate(spec,{...event,language:language==='en'?'es':'en'}),null);
    assert.equal(bridge.fromResult({result:outcome,learnerEvent:{...event,occurrenceId:'other'},supportSensor:none}),null);
    assert.equal(bridge.fromResult({result:outcome,learnerEvent:event,supportSensor:null}),null);
    assert.equal(boundary.assemble({learnerEvent:event,evidence:{...evidence,support:''}}),null);
    if(spec.mode==='transfer'){
      assert.equal(result.evaluate(spec,{...event,fromExperienceId:'preparing-dinner'}),null);
      assert.equal(boundary.assemble({learnerEvent:event,evidence:{...evidence,
        context:{...evidence.context,fromExperienceId:'preparing-dinner'}}}),null);
    }
  }
  const local=specs.localProbe;
  const wrong=events.fromWhyContextualReasonProbeSelect('shopping-now',{
    skill:skill.id,dimension:local.dimension,mode:local.mode,language,
    currentExperienceId:local.experienceId
  });
  assert.equal(result.evaluate(local,wrong).result,'fail');
  const assisted=bridge.fromResult({result:result.evaluate(local,wrong),learnerEvent:wrong,
    supportSensor:{support:()=> 'repeat-question'}});
  assert.equal(boundary.assemble({learnerEvent:wrong,evidence:assisted}).support,'repeat-question');
  assert.equal(events.fromWhyContextualReasonProbeSelect('why',{
    skill:skill.id,dimension:'question-function',mode:'transfer',language,
    currentExperienceId:items[3].id,fromExperienceId:items[2].id}),null);
}
assert.equal(result.evaluate(source.resolve(skill,items[2],items[3],'en').transferProbe,
  events.fromWhyContextualReasonProbeSelect('salmon',{
    skill:skill.id,dimension:'reason-answer',mode:'transfer',language:'en',
    currentExperienceId:items[2].id,fromExperienceId:items[1].id})),null,
  'S2 WHAT transfer cannot be replayed into a WHY result');
console.log('PASS — WHY events produce bounded Result, Evidence and Attempt in EN/ES/PT without granting Green.');
