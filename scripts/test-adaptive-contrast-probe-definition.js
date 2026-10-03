const assert = require('assert');
const Probe = require('../js/adaptive-contrast-probe-definition');

const pattern = Object.freeze({key:'pt:esquisito:cross-language-transfer:es',occurrences:2});
const probeContext = Object.freeze({pattern,experienceId:'shopping-for-dinner'});
const spec = {
  expectedLanguage:'pt',
  targetMeaning:'strange',
  alternatives:[
    {id:'pt-esquisito',language:'pt',form:'esquisito',meaning:'strange'},
    {id:'es-exquisito',language:'es',form:'exquisito',meaning:'delicious'}
  ]
};

const definition = Probe.create(probeContext,spec);
assert.ok(definition);
assert.strictEqual(definition.pattern,pattern);
assert.strictEqual(definition.experienceId,'shopping-for-dinner');
assert.strictEqual(definition.expectedLanguage,'pt');
assert.strictEqual(definition.targetMeaning,'strange');
assert.strictEqual(definition.expectedAlternativeId,'pt-esquisito');
assert.ok(Object.isFrozen(definition));
assert.ok(Object.isFrozen(definition.alternatives));
assert.ok(definition.alternatives.every(Object.isFrozen));

assert.strictEqual(Probe.create(null,spec),null);
assert.strictEqual(Probe.create({pattern:{key:'',occurrences:2}},spec),null);
assert.strictEqual(Probe.create({pattern:{key:'k',occurrences:1}},spec),null);
assert.strictEqual(Probe.create(probeContext,{...spec,targetMeaning:''}),null);
assert.strictEqual(Probe.create(probeContext,{...spec,expectedLanguage:''}),null);
assert.strictEqual(Probe.create(probeContext,{...spec,alternatives:[spec.alternatives[0]]}),null);
assert.strictEqual(Probe.create(probeContext,{...spec,alternatives:[spec.alternatives[0],{...spec.alternatives[1],id:'pt-esquisito'}]}),null);

// The definition fails closed if no single alternative establishes the expected
// language + target-meaning pair before learner interaction.
assert.strictEqual(Probe.create(probeContext,{
  ...spec,
  expectedLanguage:'en'
}),null);
assert.strictEqual(Probe.create(probeContext,{
  ...spec,
  alternatives:[...spec.alternatives,{id:'pt-esquisito-2',language:'pt',form:'estranho',meaning:'strange'}]
}),null);

console.log('Adaptive contrast probe definition: PASS');
