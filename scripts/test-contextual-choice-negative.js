#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(ROOT, 'data/learning/experience-seeds.json');
const SCHEMA_PATH = path.join(ROOT, 'data/schemas/experience-seed.schema.json');
const VALIDATOR_PATH = path.join(ROOT, 'scripts/validate-corpus.js');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'siyayo-3a3-'));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function writeFixture(name, data) {
  const fixturePath = path.join(tempDir, name);
  fs.writeFileSync(fixturePath, JSON.stringify(data, null, 2) + '\n');
  return fixturePath;
}

function expectRejected(label, result, expectedText) {
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  if (result.status === 0) {
    throw new Error(`${label}: invalid fixture was accepted`);
  }
  if (expectedText && !output.includes(expectedText)) {
    throw new Error(`${label}: rejected for an unexpected reason\n${output}`);
  }
  console.log(`PASS — ${label} rejected as expected.`);
}

try {
  const source = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));

  const forbiddenProperty = clone(source);
  forbiddenProperty.unexpectedMetadata = true;
  const forbiddenPath = writeFixture('forbidden-property.json', forbiddenProperty);
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const schemaResult = spawnSync(npx, [
    '--yes',
    'ajv-cli@5',
    'validate',
    '--spec=draft2020',
    '--strict=true',
    '-s',
    SCHEMA_PATH,
    '-d',
    forbiddenPath
  ], { cwd: ROOT, encoding: 'utf8' });
  expectRejected('Schema guard (unexpected property)', schemaResult, 'must NOT have additional properties');

  const brokenReference = clone(source);
  const shopping = brokenReference.items.find(item => item.id === 'shopping-for-dinner');
  const which = shopping?.thinkingMind?.find(question => question.questionWord === 'which');
  if (!which?.choiceContext) throw new Error('3A.1 contextual choice seed not found');
  which.choiceContext.focusVocabulary = 'unlinked-cheese';
  const brokenReferencePath = writeFixture('broken-reference.json', brokenReference);
  const referenceResult = spawnSync(process.execPath, [VALIDATOR_PATH], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, SIYAYO_EXPERIENCE_PATH: brokenReferencePath }
  });
  expectRejected('Reference guard (unlinked focusVocabulary)', referenceResult, "is not linked by the experience");

  console.log('PASS — 3A.3 negative controls rejected both invalid metadata mutations.');
} catch (error) {
  console.error(`FIX — 3A.3 negative control failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
