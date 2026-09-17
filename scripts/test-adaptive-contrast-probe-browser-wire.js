const assert=require('node:assert/strict');
const Presenter=require('../js/adaptive-contrast-probe-presenter.js');
const ProbeDefinition=require('../js/adaptive-contrast-probe-definition.js');
const Source=require('../js/adaptive-contrast-probe-specification-source.js');
const Wire=require('../js/adaptive-contrast-probe-browser-wire.js');
const catalog=require('../data/learning/contrast-probe-specifications.json');

const pattern=Object.freeze({key:'pt:exquisito:cross-language-transfer:es',occurrences:2});
const specification=Source.resolve(pattern,catalog);
const definition=ProbeDefinition.create(Object.freeze({pattern,experienceId:'shopping-for-dinner'}),specification);
const view=Presenter.present(definition);

const container={innerHTML:'',listeners:{},addEventListener(type,fn){this.listeners[type]=fn;}};
assert.equal(Wire.render(view,{container}),true);
assert.match(container.innerHTML,/data-contrast-probe-select="pt-esquisito"/);
assert.match(container.innerHTML,/>esquisito</);
assert.doesNotMatch(container.innerHTML,/expectedAlternativeId|strange-or-odd/,'browser surface must not expose correctness or target meaning');
assert.doesNotMatch(container.innerHTML,/data-choice-select=/,'contrast probe must not impersonate contextual Choice UI');

const target={dataset:{contrastProbeSelect:'pt-esquisito'}};
const observed=Wire.eventFromTarget(target,view);
assert.ok(observed);
assert.equal(observed.observed,true);
assert.equal(observed.actor,'learner');
assert.equal(observed.source,'contrast-probe-select');
assert.equal(observed.choice,'pt-esquisito');
assert.equal(observed.selectedLanguage,'pt');
assert.equal(observed.experienceId,'shopping-for-dinner');
assert.match(observed.occurrenceId,/^contrast-probe-select:\d+$/);
assert.ok(Object.isFrozen(observed));
assert.equal(Wire.eventFromTarget({dataset:{contrastProbeSelect:'missing'}},view),null);

let delivered=null;
const installContainer={innerHTML:'',listener:null,addEventListener(type,fn){if(type==='click')this.listener=fn;}};
assert.equal(Wire.install(view,{container:installContainer,onEvent:event=>{delivered=event;}}),true);
const clickable={dataset:{contrastProbeSelect:'es-exquisito'},closest(selector){return selector==='[data-contrast-probe-select]'?this:null;}};
installContainer.listener({target:clickable});
assert.ok(delivered);
assert.equal(delivered.choice,'es-exquisito');
assert.equal(delivered.selectedLanguage,'es','selectedLanguage must come from the authoritative selected alternative');

assert.equal(Wire.render(null,{container}),false);
assert.equal(Wire.install(view,{container:installContainer}),false);

console.log('Adaptive contrast probe browser wire: PASS — isolated surface renders authorized alternatives and emits only observed contrast-probe learner events.');
