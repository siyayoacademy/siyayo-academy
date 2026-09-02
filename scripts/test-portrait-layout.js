#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const css = fs.readFileSync(path.resolve(__dirname, '../css/verb-explorer.css'), 'utf8');

for (const guard of [
  'html,body{max-width:100%;overflow-x:clip}',
  '.experience-grid,.gear-stack,.living-window,.living-lines,.choice-resolver-panel,.choice-options,.choice-feedback{min-width:0;max-width:100%}',
  '.gear-options,.perspective-options{display:flex;max-width:100%',
  '.line-controls span{min-width:0',
  '@media(max-width:480px)',
  '.experience-grid{grid-template-columns:minmax(0,1fr)}'
]) {
  assert.ok(css.includes(guard), `missing portrait containment guard: ${guard}`);
}

assert.ok(css.includes('overflow-x:auto'), 'internal horizontal controls must remain scrollable');
assert.ok(css.includes('overflow-wrap:anywhere'), 'long mobile copy must wrap inside its card');

console.log('PASS — portrait layout contains the document without disabling internal carousels.');
console.log('PASS — narrow grid tracks, cards and long labels can shrink and wrap safely.');
