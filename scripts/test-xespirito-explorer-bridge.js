const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'verb-explorer.html'), 'utf8');
const engineSource = fs.readFileSync(path.join(ROOT, 'js/xespirito-diagnostics.js'), 'utf8');
const bridgeSource = fs.readFileSync(path.join(ROOT, 'js/xespirito-explorer-bridge.js'), 'utf8');
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/grammar/verb-grid.json'), 'utf8'));

for (const script of [
  'js/contextual-choice-resolver.js',
  'js/xespirito-diagnostics.js',
  'js/xespirito-explorer-bridge.js',
  'js/verb-explorer.js'
]) {
  assert.ok(html.includes(`<script src="${script}"></script>`), `Verb Explorer must load ${script}`);
}

const order = [
  'js/contextual-choice-resolver.js',
  'js/xespirito-diagnostics.js',
  'js/xespirito-explorer-bridge.js',
  'js/verb-explorer.js'
].map(script => html.indexOf(`<script src="${script}"></script>`));
assert.deepEqual([...order].sort((a, b) => a - b), order, 'Xespirito scripts must load before verb-explorer.js');

const context = {
  console,
  fetch: async url => ({
    ok: url === 'data/grammar/verb-grid.json',
    json: async () => grid
  })
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(engineSource, context);
vm.runInContext(bridgeSource, context);

assert.equal(context.SIYAYOXespiritoBridge.source, 'data/grammar/verb-grid.json');
assert.equal(context.SIYAYOXespiritoBridge.archetype, 'xespirito');

(async () => {
  const result = await context.SIYAYOXespiritoBridge.diagnose('She will has studied.');
  assert.equal(result.matched, true);
  assert.equal(result.ruleId, 'future-carrier-requires-base-next');
  assert.equal(result.responsiblePiece, 'auxiliary-have');
  assert.equal(result.correction, 'She will have studied.');

  const unknown = await context.SIYAYOXespiritoBridge.diagnose('She studies every day.');
  assert.equal(unknown.matched, false);
  assert.equal(unknown.status, 'no-canonical-diagnostic');

  console.log('Xespirito Verb Explorer bridge tests passed.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
