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
context.globalThis = context; vm.createContext(context); vm.runInContext(engineSource, context); vm.runInContext(bridgeSource, context);
const bridge = context.SIYAYOXespiritoBridge;
assert.equal(bridge.source, 'data/grammar/verb-grid.json');
assert.equal(bridge.archetype, 'xespirito');
assert.equal(typeof bridge.applyRepairAndDiagnose, 'function');
assert.equal(typeof bridge.recordEvidence, 'function');
assert.equal(typeof bridge.getRepairTrace, 'function');

(async () => {
  const result = await bridge.diagnose('She will has studied.');
  assert.equal(result.ruleId, 'future-carrier-requires-base-next');

  const multi = await bridge.diagnose('She will can do go?');
  assert.deepEqual(Array.from(multi.conflicts), ['single-core-modal', 'modal-blocks-do-support']);
  assert.match(bridge.renderConflictSignals(multi), /CONFLICT SIGNALS · 2/);

  const target = { className: '', innerHTML: '' };
  bridge.clearRepairTrace();
  bridge.recordEvidence(result, true);
  bridge.renderResult(result, target);
  assert.match(target.innerHTML, /REPAIR TRACE · EVIDENCE/);
  assert.match(target.innerHTML, /future-carrier-requires-base-next/);

  const repaired = await bridge.diagnose(result.correction);
  bridge.recordEvidence(repaired);
  const trace = bridge.getRepairTrace();
  assert.equal(trace.length, 2);
  assert.equal(trace[0].input, 'She will has studied.');
  assert.equal(trace[0].status, 'conflict');
  assert.equal(trace[0].responsiblePiece, 'auxiliary-have');
  assert.equal(trace[1].input, 'She will have studied.');
  assert.equal(trace[1].status, 'clear');
  bridge.renderResult(repaired, target);
  assert.match(target.innerHTML, /FUNCTIONAL PATH CLEAR/);
  assert.match(target.innerHTML, /She will has studied\./);
  assert.match(target.innerHTML, /She will have studied\./);
  assert.match(target.innerHTML, />CLEAR</);

  const copy = bridge.getRepairTrace();
  copy[0].conflicts.push('tamper');
  assert.doesNotMatch(JSON.stringify(bridge.getRepairTrace()), /tamper/, 'Trace getter must protect internal evidence from external mutation.');

  console.log('Xespirito bridge tests passed, including repair-trace evidence.');
})().catch(error => { console.error(error); process.exit(1); });
