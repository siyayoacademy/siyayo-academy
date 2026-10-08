#!/usr/bin/env node
const assert = require('node:assert/strict');
const authority = require('../js/verb-explorer-transfer-attempt-authority.js');
const seed = require('../data/learning/experience-seeds.json').items;
const nouns = require('../data/lexicon/nouns/nouns.json');
const skill = require('../data/learning/skills/what.json');
const source = require('../js/adaptive-what-object-question-probe-specification-source.js');
const result = require('../js/adaptive-what-object-question-probe-result.js');
const bridge = require('../js/adaptive-what-object-question-probe-evidence-bridge.js');
const boundary = require('../js/adaptive-what-object-question-probe-attempt-boundary.js');
const vm = require('node:vm');
const fs = require('node:fs');
const sandbox = {};
vm.runInNewContext(fs.readFileSync('js/verb-explorer-learner-event.js','utf8'),sandbox);
const events = sandbox.SIYAYOVerbExplorerLearnerEvent;
const catalog = {getExperience: id => seed.find(item => item.id === id)};
for (const language of ['en','es','pt']) {
  const spec=source.resolve(skill,seed[1],seed[2],nouns,language).transferProbe;
  const event=events.fromWhatObjectQuestionProbeSelect('salmon',{
    skill:skill.id,dimension:spec.dimension,mode:'transfer',language,
    fromExperienceId:seed[1].id,currentExperienceId:seed[2].id
  });
  const outcome=result.evaluate(spec,event);
  const evidence=bridge.fromResult({result:outcome,learnerEvent:event,supportSensor:{support:()=> 'none'}});
  const attempt=boundary.assemble({learnerEvent:event,evidence});
  const valid={session:{decision:{skill:skill.id,experienceId:seed[1].id}},attempt,learnerEvent:event,
    state:{currentExperienceId:seed[2].id},catalog};
  assert.equal(authority.accepts(valid),true);
  assert.equal(authority.accepts({...valid,session:{decision:{skill:'which.use.determiner',experienceId:seed[1].id}}}),false);
  assert.equal(authority.accepts({...valid,state:{currentExperienceId:seed[1].id}}),false);
  assert.equal(authority.accepts({...valid,learnerEvent:{...event,fromExperienceId:seed[0].id}}),false);
  assert.equal(authority.accepts({...valid,attempt:{...attempt,context:{...attempt.context,language:'xx'}}}),false);
  assert.equal(authority.accepts({...valid,attempt:{...attempt,dimension:'question-function'}}),false);
  assert.equal(authority.accepts({...valid,session:{decision:{skill:skill.id,experienceId:seed[0].id}},
    state:{currentExperienceId:seed[1].id},learnerEvent:{...event,fromExperienceId:seed[0].id,experienceId:seed[1].id},
    attempt:{...attempt,context:{...attempt.context,fromExperienceId:seed[0].id,experienceId:seed[1].id}}}),false);
}
const whichEvent={observed:true,actor:'learner',source:'determiner-use-transfer-probe-select',
  mode:'transfer',dimension:'determiner-use',targetForm:'which',targetNoun:'carrots',
  occurrenceId:'existing-which:1',choice:'carrots',fromExperienceId:seed[0].id,experienceId:seed[1].id};
const whichAttempt={skill:'which.use.determiner',dimension:'determiner-use',mode:'transfer',
  occurrenceId:whichEvent.occurrenceId,context:{...whichEvent,selectedAlternativeId:'carrots'}};
assert.equal(authority.accepts({session:{decision:{skill:'which.use.determiner',experienceId:seed[0].id}},
  attempt:whichAttempt,learnerEvent:whichEvent,state:{currentExperienceId:seed[1].id},catalog}),true);
console.log('PASS — WHAT S2→S3 transfer is accepted only for its Session; WHICH S1→S2 stays valid.');
