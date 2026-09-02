#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lexicon/nouns/nouns.json'), 'utf8'));

function rejected(mutator, expectedMessage) {
  const copy = structuredClone(source);
  mutator(copy);
  const temporary = path.join(os.tmpdir(), `siyayo-nouns-${process.pid}-${Math.random()}.json`);
  fs.writeFileSync(temporary, JSON.stringify(copy));
  const result = spawnSync(process.execPath, ['scripts/validate-corpus.js'], {
    cwd: ROOT,
    env: { ...process.env, SIYAYO_NOUN_PATH: temporary },
    encoding: 'utf8'
  });
  fs.unlinkSync(temporary);
  assert.notEqual(result.status, 0, 'invalid noun corpus must be rejected');
  assert.ok(`${result.stdout}\n${result.stderr}`.includes(expectedMessage), `missing rejection: ${expectedMessage}`);
}

rejected(data => data.items.splice(data.items.findIndex(noun => noun.id === 'cheese'), 1), "Vocabulary 'cheese' does not resolve to the noun corpus");
rejected(data => { data.items[1].id = data.items[0].id; }, 'Duplicate noun id');
rejected(data => { delete data.items[0].translations.es; }, 'Missing/non-string es');

console.log('PASS — 4.1 rejects orphan vocabulary, duplicate nouns and incomplete translations.');
