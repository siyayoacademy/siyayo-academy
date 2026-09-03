const fs = require('fs');
const path = require('path');

const gridPath = path.join(__dirname, '..', 'data', 'grammar', 'verb-grid.json');
const grid = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
const errors = [];
const fail = message => errors.push(message);

const functionIds = new Set(grid.functions.map(item => item.id));
for (const section of ['functions', 'chains', 'timeAspect', 'rules']) {
  const ids = grid[section].map(item => item.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) {
    fail(`Duplicate IDs inside ${section}: ${[...new Set(duplicates)].join(', ')}`);
  }
}

for (const chain of grid.chains) {
  for (const ref of chain.sequence) {
    if (!functionIds.has(ref)) fail(`Chain ${chain.id} references unknown function ${ref}.`);
  }
}

for (const entry of grid.timeAspect) {
  const carrierBase = entry.finiteCarrier.split(':')[0];
  if (!functionIds.has(carrierBase)) fail(`timeAspect ${entry.id} has unknown finiteCarrier ${entry.finiteCarrier}.`);

  if (entry.time === 'future' && entry.finiteCarrier !== 'modal-core:will') {
    fail(`Future entry ${entry.id} must use modal-core:will as finiteCarrier.`);
  }
  if (entry.time === 'modal' && carrierBase !== 'modal-core') {
    fail(`Modal entry ${entry.id} must use modal-core as finiteCarrier.`);
  }
  if (entry.aspect === 'progressive' && !/\bBE\b|\bbe\b|\bis\b|\bwas\b|\bare\b|\bwere\b/.test(entry.pattern)) {
    fail(`Progressive entry ${entry.id} must expose BE in its pattern.`);
  }
  if ((entry.aspect === 'perfect' || entry.aspect === 'perfect-progressive') && !/\bHAVE\b|\bhave\b|\bhas\b|\bhad\b/.test(entry.pattern)) {
    fail(`Perfect entry ${entry.id} must expose HAVE in its pattern.`);
  }
  if (entry.aspect === 'perfect-progressive' && !/\bbeen\b/i.test(entry.pattern)) {
    fail(`Perfect-progressive entry ${entry.id} must expose BEEN in its pattern.`);
  }
}

const requiredRules = [
  ['modal-blocks-do-support', 'Where do you can go?', 'Where can you go?'],
  ['be-blocks-do-support', 'Do you are ready?', 'Are you ready?'],
  ['modal-requires-base-form', 'She can goes.', 'She can go.'],
  ['perfect-requires-past-participle', 'She has study.', 'She has studied.'],
  ['progressive-requires-ing', 'She is study.', 'She is studying.'],
  ['perfect-progressive-requires-been', 'She has be studying.', 'She has been studying.'],
  ['auxiliary-chain-order', 'She has might been studying.', 'She might have been studying.'],
  ['finite-carrier-controls-time', 'Yesterday she is studying.', 'Yesterday she was studying.'],
  ['future-carrier-requires-base-next', 'She will has studied.', 'She will have studied.']
];

const rulesById = new Map(grid.rules.map(rule => [rule.id, rule]));
for (const [id, input, output] of requiredRules) {
  const rule = rulesById.get(id);
  if (!rule) {
    fail(`Missing diagnostic rule ${id}.`);
    continue;
  }
  if (rule.archetype !== 'xespirito') fail(`Rule ${id} must be assigned to xespirito.`);
  if (!rule.example || rule.example.input !== input || rule.example.output !== output) {
    fail(`Rule ${id} diagnostic example changed unexpectedly.`);
  }
}

const requiredTimeAspect = new Map([
  ['present-simple', ['present', 'simple', 'lexical-verb']],
  ['past-simple', ['past', 'simple', 'lexical-verb']],
  ['present-progressive', ['present', 'progressive', 'auxiliary-be']],
  ['past-progressive', ['past', 'progressive', 'auxiliary-be']],
  ['present-perfect', ['present', 'perfect', 'auxiliary-have']],
  ['past-perfect', ['past', 'perfect', 'auxiliary-have']],
  ['present-perfect-progressive', ['present', 'perfect-progressive', 'auxiliary-have']],
  ['past-perfect-progressive', ['past', 'perfect-progressive', 'auxiliary-have']],
  ['future-simple', ['future', 'simple', 'modal-core:will']],
  ['future-progressive', ['future', 'progressive', 'modal-core:will']],
  ['future-perfect', ['future', 'perfect', 'modal-core:will']],
  ['future-perfect-progressive', ['future', 'perfect-progressive', 'modal-core:will']],
  ['modal-perfect-progressive', ['modal', 'perfect-progressive', 'modal-core']]
]);

const timeAspectById = new Map(grid.timeAspect.map(item => [item.id, item]));
for (const [id, expected] of requiredTimeAspect) {
  const item = timeAspectById.get(id);
  if (!item) {
    fail(`Missing timeAspect entry ${id}.`);
    continue;
  }
  const actual = [item.time, item.aspect, item.finiteCarrier];
  if (actual.some((value, index) => value !== expected[index])) {
    fail(`timeAspect ${id} expected ${expected.join(' / ')} but found ${actual.join(' / ')}.`);
  }
}

if (errors.length) {
  console.error('Verb Grid semantic integrity failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Verb Grid semantic integrity passed: ${grid.functions.length} functions, ${grid.chains.length} chains, ${grid.timeAspect.length} time/aspect entries, ${grid.rules.length} diagnostic rules.`);
