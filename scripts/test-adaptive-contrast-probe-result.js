const assert = require('assert');
const ProbeDefinition = require('../js/adaptive-contrast-probe-definition');
const ProbeResult = require('../js/adaptive-contrast-probe-result');

const pattern = Object.freeze({key:'pt:esquisito:cross-language-transfer:es',occurrences:2});
const definition = ProbeDefinition.create(
  Object.freeze({pattern,experienceId:'shopping-for-dinner'}),
  {
    expectedLanguage:'pt',
    targetMeaning:'strange',
    alternatives:[
      {id:'pt-esquisito',language:'pt',form:'esquisito',meaning:'strange'},
      {id:'es-exquisito',language:'es',form:'exquisito',meaning:'delicious'},
      {id:'es-raro',language:'es',form:'raro',meaning:'strange'}
    ]
  }
);
assert.ok(definition);

function event(choice,overrides={}){
  return {
    observed:true,
    actor:'learner',
    type:'learner-response',
    source:'choice-select',
    occurrenceId:'choice-select:shopping-for-dinner:which:1',
    experienceId:'shopping-for-dinner',
    choice,
    ...overrides
  };
}

const correct = ProbeResult.evaluate(definition,event('pt-esquisito'));
assert.deepStrictEqual(correct,{
  occurrenceId:'choice-select:shopping-for-dinner:which:1',
  expectedLanguage:'pt',
  selectedLanguage:'pt',
  meaningCorrect:true,
  formCorrect:true,
  selectedAlternativeId:'pt-esquisito'
});
assert.ok(Object.isFrozen(correct));

// Same meaning in the wrong language: meaning is correct, expected form is not.
const transfer = ProbeResult.evaluate(definition,event('es-raro'));
assert.strictEqual(transfer.selectedLanguage,'es');
assert.strictEqual(transfer.meaningCorrect,true);
assert.strictEqual(transfer.formCorrect,false);

// Wrong meaning and wrong language remain independently observable.
const wrong = ProbeResult.evaluate(definition,event('es-exquisito'));
assert.strictEqual(wrong.selectedLanguage,'es');
assert.strictEqual(wrong.meaningCorrect,false);
assert.strictEqual(wrong.formCorrect,false);

assert.strictEqual(ProbeResult.evaluate(definition,event('missing')),null);
assert.strictEqual(ProbeResult.evaluate(definition,event('pt-esquisito',{observed:false})),null);
assert.strictEqual(ProbeResult.evaluate(definition,event('pt-esquisito',{actor:'system'})),null);
assert.strictEqual(ProbeResult.evaluate(definition,event('pt-esquisito',{occurrenceId:''})),null);
assert.strictEqual(ProbeResult.evaluate(definition,event('pt-esquisito',{experienceId:'preparing-dinner'})),null);

console.log('Adaptive contrast probe result: PASS');
