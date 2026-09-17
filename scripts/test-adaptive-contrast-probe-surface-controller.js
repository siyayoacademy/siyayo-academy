const assert=require('node:assert/strict');
const Controller=require('../js/adaptive-contrast-probe-surface-controller.js');

function panel(){return {hidden:true};}
function container(){return {innerHTML:'stale'};}

const learnerEvents={fromContrastProbeSelect(){return Object.freeze({observed:true});}};
let installedOptions=null;
const wire={install(presentation,options){installedOptions={presentation,options};options.container.innerHTML='<button>probe</button>';return true;}};
const presentation=Object.freeze({pattern:Object.freeze({key:'pt:exquisito:cross-language-transfer:es'}),alternatives:Object.freeze([{id:'a'},{id:'b'}])});

const p=panel(),c=container();
assert.equal(Controller.mount(presentation,{panel:p,container:c,wire,learnerEvents,onEvent(){}}),true);
assert.equal(p.hidden,false,'surface becomes visible only after BrowserWire installation succeeds');
assert.equal(c.innerHTML,'<button>probe</button>');
assert.equal(installedOptions.presentation,presentation);
assert.equal(installedOptions.options.learnerEvents,learnerEvents);
assert.equal(typeof installedOptions.options.onEvent,'function');

const missingPresentationPanel=panel(),missingPresentationContainer=container();
assert.equal(Controller.mount(null,{panel:missingPresentationPanel,container:missingPresentationContainer,wire,learnerEvents,onEvent(){}}),false);
assert.equal(missingPresentationPanel.hidden,true);
assert.equal(missingPresentationContainer.innerHTML,'');

const rejectedPanel=panel(),rejectedContainer=container();
const rejectingWire={install(){return false;}};
assert.equal(Controller.mount(presentation,{panel:rejectedPanel,container:rejectedContainer,wire:rejectingWire,learnerEvents,onEvent(){}}),false);
assert.equal(rejectedPanel.hidden,true,'failed BrowserWire installation must preserve WAIT/hidden state');
assert.equal(rejectedContainer.innerHTML,'');

const noEventsPanel=panel(),noEventsContainer=container();
assert.equal(Controller.mount(presentation,{panel:noEventsPanel,container:noEventsContainer,wire,onEvent(){}}),false);
assert.equal(noEventsPanel.hidden,true);
assert.equal(noEventsContainer.innerHTML,'');

const noCallbackPanel=panel(),noCallbackContainer=container();
assert.equal(Controller.mount(presentation,{panel:noCallbackPanel,container:noCallbackContainer,wire,learnerEvents}),false);
assert.equal(noCallbackPanel.hidden,true);
assert.equal(noCallbackContainer.innerHTML,'');

const hidePanel={hidden:false},hideContainer={innerHTML:'probe'};
assert.equal(Controller.hide(hidePanel,{container:hideContainer}),true);
assert.equal(hidePanel.hidden,true);
assert.equal(hideContainer.innerHTML,'');
assert.equal(Controller.hide(null),false);

assert.equal(Controller.mount(presentation,{container:container(),wire,learnerEvents,onEvent(){}}),false,'missing panel fails closed');
assert.equal(Controller.mount(presentation,{panel:panel(),wire,learnerEvents,onEvent(){}}),false,'missing container fails closed');

console.log('Adaptive contrast probe surface controller: PASS — only a complete authorized presentation mount opens the panel; every missing dependency preserves hidden WAIT.');
