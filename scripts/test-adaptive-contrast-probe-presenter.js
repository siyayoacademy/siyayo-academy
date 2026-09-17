const assert=require('node:assert/strict');
const Presenter=require('../js/adaptive-contrast-probe-presenter.js');
const ProbeDefinition=require('../js/adaptive-contrast-probe-definition.js');
const Source=require('../js/adaptive-contrast-probe-specification-source.js');
const catalog=require('../data/learning/contrast-probe-specifications.json');

const pattern=Object.freeze({key:'pt:exquisito:cross-language-transfer:es',occurrences:2});
const probeContext=Object.freeze({pattern,experienceId:'shopping-for-dinner'});
const specification=Source.resolve(pattern,catalog);
const definition=ProbeDefinition.create(probeContext,specification);
const view=Presenter.present(definition);

assert.ok(view);
assert.deepEqual(view.pattern,pattern);
assert.equal(view.experienceId,'shopping-for-dinner');
assert.equal(view.expectedLanguage,'pt');
assert.equal(view.targetMeaning,'strange-or-odd');
assert.deepEqual(view.alternatives.map(item=>item.id),['pt-esquisito','es-exquisito','es-raro']);
assert.ok(Object.isFrozen(view));
assert.ok(Object.isFrozen(view.pattern));
assert.ok(Object.isFrozen(view.alternatives));
assert.ok(view.alternatives.every(Object.isFrozen));
assert.notStrictEqual(view.alternatives,definition.alternatives,'presenter must expose its own immutable presentation projection');

// Presentation carries alternatives but does not expose the expected answer as UI authority.
assert.equal(Object.prototype.hasOwnProperty.call(view,'expectedAlternativeId'),false);

assert.equal(Presenter.present(null),null);
assert.equal(Presenter.present({}),null);
assert.equal(Presenter.present({...definition,alternatives:[definition.alternatives[0]]}),null);
assert.equal(Presenter.present({...definition,expectedAlternativeId:'missing'}),null);
assert.equal(Presenter.present({...definition,alternatives:[definition.alternatives[0],{...definition.alternatives[1],id:definition.alternatives[0].id}]}),null);

console.log('Adaptive contrast probe presenter: PASS — authorized ProbeDefinition projects immutable alternatives without exposing correctness or inventing pedagogical authority.');
