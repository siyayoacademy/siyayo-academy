#!/usr/bin/env node
const assert = require('node:assert/strict');
const authority = require('../js/verb-explorer-transfer-attempt-authority.js');
const seed = require('../data/learning/experience-seeds.json').items;
const skill = require('../data/learning/skills/why.json');
const source = require('../js/adaptive-why-contextual-reason-probe-specification-source.js');
const result = require('../js/adaptive-why-contextual-reason-probe-result.js');
const bridge = require('../js/adaptive-why-contextual-reason-probe-evidence-bridge.js');
const boundary = require('../js/adaptive-why-contextual-reason-probe-attempt-boundary.js');
const vm = require('node:vm');
const fs = require('node:fs');
const sandbox = {};
vm.runInNewContext(fs.readFileSync('js/verb-explorer-learner-event.js','utf8'),sandbox);
const events = sandbox.SIYAYOVerbExplorerLearnerEvent;
const catalog = {getExperience: id => seed.find(item => item.id === id)};
for (const language of ['en','es','pt']) {
  const spec=source.resolve(skill,seed[2],seed[3],language).transferProbe;
  const event=events.fromWhyContextualReasonProbeSelect('talking-together',{
    skill:skill.id,dimension:spec.dimension,mode:'transfer',language,
    fromExperienceId:seed[2].id,currentExperienceId:seed[3].id
  });
  const outcome=result.evaluate(spec,event);
  const evidence=bridge.fromResult({result:outcome,learnerEvent:event,supportSensor:{support:()=> 'none'}});
  const attempt=boundary.assemble({learnerEvent:event,evidence});
  const valid={session:{decision:{skill:skill.id,experienceId:seed[2].id}},attempt,learnerEvent:event,
    state:{currentExperienceId:seed[3].id},catalog};
  assert.equal(authority.accepts(valid),true);
  assert.equal(authority.accepts({...valid,session:{decision:{skill:'what.use.object-question',experienceId:seed[2].id}}}),false);
  assert.equal(authority.accepts({...valid,state:{currentExperienceId:seed[2].id}}),false);
  assert.equal(authority.accepts({...valid,learnerEvent:{...event,fromExperienceId:seed[1].id}}),false);
  assert.equal(authority.accepts({...valid,attempt:{...attempt,context:{...attempt.context,language:'xx'}}}),false);
  assert.equal(authority.accepts({...valid,attempt:{...attempt,dimension:'question-function'}}),false);
  assert.equal(authority.accepts({...valid,session:{decision:{skill:skill.id,experienceId:seed[0].id}},
    state:{currentExperienceId:seed[2].id},learnerEvent:{...event,fromExperienceId:seed[0].id,experienceId:seed[2].id},
    attempt:{...attempt,context:{...attempt.context,fromExperienceId:seed[0].id,experienceId:seed[2].id}}}),false);
}
console.log('PASS — WHY S3→S4 transfer is accepted only for its Session and destination.');
