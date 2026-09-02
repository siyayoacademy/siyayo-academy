#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lexicon/adjectives/adjectives.json'), 'utf8'));

function rejected(mutator, expectedMessage) {
  const copy = structuredClone(source);
  mutator(copy);
  const temporary = path.join(os.tmpdir(), `siyayo-adjectives-${process.pid}-${Math.random()}.json`);
  fs.writeFileSync(temporary, JSON.stringify(copy));
  const result = spawnSync(process.execPath, ['scripts/validate-corpus.js'], {
    cwd: ROOT,
    env: { ...process.env, SIYAYO_ADJECTIVE_PATH: temporary },
    encoding: 'utf8'
  });
  fs.unlinkSync(temporary);
  assert.notEqual(result.status, 0, 'invalid adjective corpus must be rejected');
  assert.ok(`${result.stdout}\n${result.stderr}`.includes(expectedMessage), `missing rejection: ${expectedMessage}`);
}

rejected(data => data.items.splice(data.items.findIndex(item => item.id === 'fresh'), 1), "Positive adjective 'fresh' does not resolve to the adjective corpus");
rejected(data => { data.items[1].id = data.items[0].id; }, 'Duplicate adjective id');
rejected(data => { delete data.items[0].translations.pt; }, 'Missing/non-string pt');
rejected(data => { data.items[0].polarity = 'neutral'; }, "Linked positive adjective 'fresh' must have positive polarity");

console.log('PASS — 5.1 rejects orphan, duplicate, incomplete and non-positive adjective data.');
