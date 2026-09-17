const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const Presenter=require('../js/adaptive-contrast-probe-presenter.js');
const ProbeDefinition=require('../js/adaptive-contrast-probe-definition.js');
const Source=require('../js/adaptive-contrast-probe-specification-source.js');
const Wire=require('../js/adaptive-contrast-probe-browser-wire.js');
const catalog=require('../data/learning/contrast-probe-specifications.json');

const learnerSandbox=vm.createContext({});
learnerSandbox.globalThis=learnerSandbox;
vm.runInContext(fs.readFileSync('js/verb-explorer-learner-event.js','utf8'),learnerSandbox,{filename:'js/verb-explorer-learner-event.js'});
const LearnerEvents=learnerSandbox.SIYAYOVerbExplorerLearnerEvent;

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
assert.doesNotMatch(container.innerHTML,/data-contrast-probe-language=/,'selected language belongs to ProbeResult authority, not DOM event metadata');
assert.equal(Wire.eventFromTarget,undefined,'BrowserWire must not expose a programmable observed-event minting function');

let delivered=null;
const installContainer={innerHTML:'',listener:null,addEventListener(type,fn){if(type==='click')this.listener=fn;}};
assert.equal(Wire.install(view,{container:installContainer,learnerEvents:LearnerEvents,onEvent:event=>{delivered=event;}}),true);
const clickable={dataset:{contrastProbeSelect:'es-exquisito'},closest(selector){return selector==='[data-contrast-probe-select]'?this:null;}};
installContainer.listener({target:clickable});
assert.ok(delivered);
assert.equal(delivered.observed,true);
assert.equal(delivered.actor,'learner');
assert.equal(delivered.source,'contrast-probe-select');
assert.equal(delivered.choice,'es-exquisito');
assert.equal(delivered.experienceId,'shopping-for-dinner');
assert.match(delivered.occurrenceId,/^contrast-probe-select:\d+$/);
assert.equal(delivered.selectedLanguage,undefined,'LearnerEvent must not duplicate selectedLanguage derived later by ProbeResult');
assert.ok(Object.isFrozen(delivered));

const before=delivered;
const missing={dataset:{contrastProbeSelect:'missing'},closest(selector){return selector==='[data-contrast-probe-select]'?this:null;}};
installContainer.listener({target:missing});
assert.equal(delivered,before,'unknown alternatives must not create learner events');

assert.equal(Wire.render(null,{container}),false);
assert.equal(Wire.install(view,{container:installContainer,onEvent(){}}),false,'BrowserWire must fail closed without learner-event authority');
assert.equal(Wire.install(view,{container:installContainer,learnerEvents:LearnerEvents}),false);

console.log('Adaptive contrast probe browser wire: PASS — surface renders authorized alternatives and delegates observed event identity to LearnerEvent only at click time.');
