const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const html=fs.readFileSync(path.join(__dirname,'..','verb-explorer.html'),'utf8');

const choicePanel=html.indexOf('id="choiceResolverPanel"');
const choiceOptions=html.indexOf('id="choiceOptions"');
const contrastPanel=html.indexOf('id="contrastProbePanel"');
const contrastOptions=html.indexOf('id="contrastProbeOptions"');

assert.ok(choicePanel>=0,'existing contextual Choice panel must remain present');
assert.ok(choiceOptions>choicePanel,'existing contextual Choice options must remain inside their panel');
assert.ok(contrastPanel>=0,'contrast probe panel must exist in the Living Window');
assert.ok(contrastOptions>contrastPanel,'contrast probe options must exist inside the contrast panel');

const contrastTag=html.slice(html.lastIndexOf('<section',contrastPanel),html.indexOf('>',contrastPanel)+1);
assert.match(contrastTag,/\shidden(?:\s|>)/,'contrast probe surface must be inert/hidden at browser load');
assert.match(contrastTag,/aria-live="polite"/,'contrast probe surface should preserve polite live-region semantics');
assert.notEqual(choiceOptions,contrastOptions,'contrast probe must not reuse contextual Choice options');

const presenter=html.indexOf('<script src="js/adaptive-contrast-probe-presenter.js"></script>');
const wire=html.indexOf('<script src="js/adaptive-contrast-probe-browser-wire.js"></script>');
const explorer=html.indexOf('<script src="js/verb-explorer.js"></script>');
assert.ok(presenter>=0,'contrast probe Presenter must be loaded by the browser entry point');
assert.ok(wire>presenter,'BrowserWire must load after Presenter');
assert.ok(explorer>wire,'Verb Explorer must load after the inert contrast presentation dependencies');

assert.doesNotMatch(html,/data-contrast-probe-select=/,'entry HTML must not fabricate probe alternatives before authorization');

console.log('Verb Explorer contrast probe surface: PASS — Living Window keeps Choice and contrast surfaces separate, inert, and dependency-ordered.');
