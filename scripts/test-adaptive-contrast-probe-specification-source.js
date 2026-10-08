const assert=require('node:assert/strict');
const Source=require('../js/adaptive-contrast-probe-specification-source.js');
const ProbeDefinition=require('../js/adaptive-contrast-probe-definition.js');
const catalog=require('../data/learning/contrast-probe-specifications.json');

const key='pt:exquisito:cross-language-transfer:es';
const pattern=Object.freeze({key,occurrences:2});
const before=JSON.stringify(catalog);
const specification=Source.resolve(pattern,catalog);

assert.ok(specification);
assert.equal(specification.expectedLanguage,'pt');
assert.equal(specification.targetMeaning,'strange-or-odd');
assert.deepEqual(specification.alternatives.map(item=>item.id),[
  'pt-esquisito','es-exquisito','es-raro'
]);
assert.ok(Object.isFrozen(specification));
assert.ok(Object.isFrozen(specification.alternatives));
assert.ok(specification.alternatives.every(Object.isFrozen));
assert.equal(JSON.stringify(catalog),before,'resolution must not mutate the canonical catalog');

const definition=ProbeDefinition.create(
  Object.freeze({pattern,experienceId:'shopping-for-dinner'}),
  specification
);
assert.ok(definition);
assert.equal(definition.expectedAlternativeId,'pt-esquisito');

assert.equal(Source.resolve('',catalog),null);
assert.equal(Source.resolve({key:'pt:unknown:cross-language-transfer:es'},catalog),null);
assert.equal(Source.resolve(pattern,null),null);
assert.equal(Source.resolve(pattern,{items:[]}),null);
assert.equal(Source.resolve(pattern,{items:[catalog.items[0],catalog.items[0]]}),null,
  'ambiguous exact matches must preserve WAIT');

const malformed={...catalog.items[0],alternatives:[catalog.items[0].alternatives[0]]};
assert.equal(Source.resolve(pattern,{items:[malformed]}),null);
const duplicateId={...catalog.items[0],alternatives:[
  catalog.items[0].alternatives[0],
  {...catalog.items[0].alternatives[1],id:'pt-esquisito'}
]};
assert.equal(Source.resolve(pattern,{items:[duplicateId]}),null);
const ambiguousExpected={...catalog.items[0],alternatives:[
  ...catalog.items[0].alternatives,
  {id:'pt-estranho',language:'pt',form:'estranho',meaning:'strange-or-odd'}
]};
assert.equal(Source.resolve(pattern,{items:[ambiguousExpected]}),null);

// K is an exact identity, not a string from which the source may infer a challenge.
assert.equal(Source.resolve('pt:esquisito:cross-language-transfer:es',catalog),null);

console.log('Contrast probe specification source: PASS — exact K resolves one immutable canonical challenge; unknown, malformed, duplicate or ambiguous authority preserves WAIT.');
