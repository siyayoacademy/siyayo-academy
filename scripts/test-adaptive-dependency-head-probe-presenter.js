#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const HeadProbe = require('../js/adaptive-dependency-head-probe-definition.js');
const Presenter = require('../js/adaptive-dependency-head-probe-presenter.js');

const structure = JSON.parse(
  fs.readFileSync('data/learning/dependencies/all-these-three-books.json','utf8')
);

const definition = HeadProbe.create(structure,{
  experienceId:'shopping-for-dinner',
  targetTokenId:'three',
  prompt:'Which word is the head of “three”?',
  alternativeTokenIds:['all','these','books']
});
assert.ok(definition);

const view = Presenter.present(definition);
assert.ok(view,'authorized Dependency Head Probe definition must project one learner-facing view');
assert.equal(view.experienceId,'shopping-for-dinner');
assert.equal(view.structureId,'all-these-three-books');
assert.equal(view.language,'en');
assert.equal(view.dimension,'head-identification');
assert.deepEqual(view.targetToken,{id:'three',form:'three',wordClass:'NUM'});
assert.equal(view.prompt,'Which word is the head of “three”?');
assert.deepEqual(
  view.alternatives,
  [
    {id:'all',form:'All',wordClass:'DET'},
    {id:'these',form:'these',wordClass:'DET'},
    {id:'books',form:'books',wordClass:'NOUN'}
  ]
);

assert.equal(Object.isFrozen(view),true);
assert.equal(Object.isFrozen(view.targetToken),true);
assert.equal(Object.isFrozen(view.alternatives),true);
assert.ok(view.alternatives.every(Object.isFrozen));
assert.notStrictEqual(view.targetToken,definition.targetToken);
assert.notStrictEqual(view.alternatives,definition.alternatives);

for (const hidden of [
  'expectedHeadTokenId',
  'relation',
  'learnerEvent',
  'selectedAlternativeId',
  'result',
  'evidence',
  'attempt',
  'score',
  'mastery',
  'greenPass',
  'progression'
]) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(view,hidden),
    false,
    'learner-facing presenter must not expose '+hidden
  );
}

assert.equal(Presenter.present(null),null);
assert.equal(Presenter.present({}),null);
assert.equal(
  Presenter.present({...definition,status:'DEPENDENCY_HEAD_PROBE_UNKNOWN'}),
  null,
  'presenter must accept only the canonical ready definition'
);
assert.equal(
  Presenter.present({...definition,dimension:'dependency-focus'}),
  null,
  'exploratory dependency-focus state must not be accepted as an assessed probe'
);
assert.equal(
  Presenter.present({...definition,expectedHeadTokenId:'missing'}),
  null,
  'correctness authority must validate internally before being hidden'
);
assert.equal(
  Presenter.present({...definition,alternatives:[definition.alternatives[0]]}),
  null,
  'probe presentation requires multiple authorized learner alternatives'
);
assert.equal(
  Presenter.present({
    ...definition,
    alternatives:[
      definition.alternatives[0],
      {...definition.alternatives[1],id:definition.alternatives[0].id},
      definition.alternatives[2]
    ]
  }),
  null,
  'duplicate alternative ids must fail closed'
);

console.log(
  'Adaptive Dependency Head Probe Presenter: PASS — canonical head-identification definition projects immutable learner-facing alternatives while expected head and relation stay hidden, and exploratory focus remains non-assessment.'
);
