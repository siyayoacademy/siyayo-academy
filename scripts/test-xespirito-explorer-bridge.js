const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'verb-explorer.html'), 'utf8');
const engineSource = fs.readFileSync(path.join(ROOT, 'js/xespirito-diagnostics.js'), 'utf8');
const bridgeSource = fs.readFileSync(path.join(ROOT, 'js/xespirito-explorer-bridge.js'), 'utf8');
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/grammar/verb-grid.json'), 'utf8'));

for (const script of ['js/contextual-choice-resolver.js', 'js/xespirito-diagnostics.js', 'js/xespirito-explorer-bridge.js', 'js/verb-explorer.js']) assert.ok(html.includes(`<script src="${script}"></script>`), `Verb Explorer must load ${script}`);
const order = ['js/contextual-choice-resolver.js', 'js/xespirito-diagnostics.js', 'js/xespirito-explorer-bridge.js', 'js/verb-explorer.js'].map(script => html.indexOf(`<script src="${script}"></script>`));
assert.deepEqual([...order].sort((a, b) => a - b), order, 'Xespirito scripts must load before verb-explorer.js');

const context = { console, fetch: async url => ({ ok: url === 'data/grammar/verb-grid.json', json: async () => grid }) };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(engineSource, context);
vm.runInContext(bridgeSource, context);

assert.equal(context.SIYAYOXespiritoBridge.source, 'data/grammar/verb-grid.json');
assert.equal(context.SIYAYOXespiritoBridge.archetype, 'xespirito');
assert.equal(typeof context.SIYAYOXespiritoBridge.applyRepairAndDiagnose, 'function');

(async () => {
  const result = await context.SIYAYOXespiritoBridge.diagnose('She will has studied.');
  assert.equal(result.matched, true);
  assert.equal(result.ruleId, 'future-carrier-requires-base-next');
  assert.equal(result.responsiblePiece, 'auxiliary-have');
  assert.equal(result.correction, 'She will have studied.');

  const multi = await context.SIYAYOXespiritoBridge.diagnose('She will can do go?');
  assert.equal(multi.matched, true);
  assert.deepEqual(Array.from(multi.conflicts), ['single-core-modal', 'modal-blocks-do-support']);
  const multiHtml = context.SIYAYOXespiritoBridge.renderConflictSignals(multi);
  assert.match(multiHtml, /CONFLICT SIGNALS · 2/);
  assert.match(multiHtml, /1\. single-core-modal/);
  assert.match(multiHtml, /2\. modal-blocks-do-support/);

  const target = { className: '', innerHTML: '' };
  context.SIYAYOXespiritoBridge.renderResult(multi, target);
  assert.match(target.innerHTML, /FIRST REPAIR/);
  assert.match(target.innerHTML, /APPLY REPAIR → DIAGNOSE AGAIN/);
  assert.match(target.innerHTML, /data-repair="She will be able to go\./);

  const clean = await context.SIYAYOXespiritoBridge.diagnose('She might have been studying.');
  assert.equal(clean.matched, false);
  context.SIYAYOXespiritoBridge.renderResult(clean, target);
  assert.match(target.innerHTML, /FUNCTIONAL PATH CLEAR/);
  assert.doesNotMatch(target.innerHTML, /APPLY REPAIR/);

  console.log('Xespirito bridge tests passed, including iterative repair-cycle controls.');
})().catch(error => { console.error(error); process.exit(1); });
