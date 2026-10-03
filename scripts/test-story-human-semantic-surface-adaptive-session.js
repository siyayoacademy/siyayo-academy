#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const htmlPath = 'labs/human-semantic-surface/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const chapter = JSON.parse(
  fs.readFileSync('labs/human-semantic-surface/data/chapter.json', 'utf8')
);
const skillDefinition = JSON.parse(
  fs.readFileSync('data/learning/skills/which.json', 'utf8')
);

const item = chapter.chapter.sections[0].items[0];
const fetchCalls = [];

const context = {
  console,
  Promise,
  Object,
  Array,
  Map,
  Set,
  document: Object.freeze({ id: 'human-semantic-surface-lab-document' }),
  fetch(url) {
    fetchCalls.push(url);
    if (url === '/data/learning/skills/which.json') {
      return Promise.resolve({
        ok: true,
        json() {
          return Promise.resolve(
            JSON.parse(JSON.stringify(skillDefinition))
          );
        }
      });
    }
    return Promise.reject(new Error('unexpected fetch ' + url));
  }
};

context.globalThis = context;
const sandbox = vm.createContext(context);

function load(src, file) {
  assert.ok(
    html.includes('src="' + src + '"'),
    'human lab must load runtime module ' + src
  );
  vm.runInContext(
    fs.readFileSync(file, 'utf8'),
    sandbox,
    { filename: file }
  );
}

[
  ['../../js/story-assessment-leaf.js', 'js/story-assessment-leaf.js'],
  ['../../js/green-pass-authority-policy.js', 'js/green-pass-authority-policy.js'],
  ['../../js/leaf-assessment-target-authority.js', 'js/leaf-assessment-target-authority.js'],
  ['../../js/verb-explorer-learner-identity-source.js', 'js/verb-explorer-learner-identity-source.js'],
  ['../../js/verb-explorer-learner-identity-provider.js', 'js/verb-explorer-learner-identity-provider.js'],
  ['lab-learner-identity.js', 'labs/human-semantic-surface/lab-learner-identity.js'],
  ['../../js/verb-explorer-canonical-skill-source.js', 'js/verb-explorer-canonical-skill-source.js'],
  ['../../js/verb-explorer-canonical-skill-loader.js', 'js/verb-explorer-canonical-skill-loader.js'],
  ['../../js/leaf-canonical-skill-bridge.js', 'js/leaf-canonical-skill-bridge.js'],
  ['../../js/green-pass-profile.js', 'js/green-pass-profile.js'],
  ['../../js/verb-explorer-adaptive-profile-source.js', 'js/verb-explorer-adaptive-profile-source.js'],
  ['../../js/adaptive-evidence-profile.js', 'js/adaptive-evidence-profile.js'],
  ['../../js/verb-explorer-adaptive-evidence-profile-source.js', 'js/verb-explorer-adaptive-evidence-profile-source.js'],
  ['../../js/adaptive-learning-router.js', 'js/adaptive-learning-router.js'],
  ['../../js/adaptive-pedagogical-orchestrator.js', 'js/adaptive-pedagogical-orchestrator.js'],
  ['../../js/adaptive-attempt-loop.js', 'js/adaptive-attempt-loop.js'],
  ['../../js/verb-explorer-adaptive-session-source.js', 'js/verb-explorer-adaptive-session-source.js'],
  ['lab-experience-runtime.js', 'labs/human-semantic-surface/lab-experience-runtime.js'],
  ['../../js/verb-explorer-adaptive-state-bridge.js', 'js/verb-explorer-adaptive-state-bridge.js'],
  ['../../js/verb-explorer-adaptive-coordinator.js', 'js/verb-explorer-adaptive-coordinator.js'],
  ['../../js/verb-explorer-choice-attempt-provider.js', 'js/verb-explorer-choice-attempt-provider.js'],
  ['../../js/verb-explorer-adaptive-context-source.js', 'js/verb-explorer-adaptive-context-source.js'],
  ['../../js/verb-explorer-session-state-boundary.js', 'js/verb-explorer-session-state-boundary.js'],
  ['../../js/verb-explorer-adaptive-coordinator-config.js', 'js/verb-explorer-adaptive-coordinator-config.js'],
  ['../../js/verb-explorer-adaptive-composer.js', 'js/verb-explorer-adaptive-composer.js'],
  ['../../js/verb-explorer-adaptive-live-start.js', 'js/verb-explorer-adaptive-live-start.js'],
  ['../../js/verb-explorer-adaptive-readiness-trigger.js', 'js/verb-explorer-adaptive-readiness-trigger.js'],
  ['../../js/leaf-assessment-target-readiness.js', 'js/leaf-assessment-target-readiness.js'],
  ['../../js/leaf-assessment-target-provider.js', 'js/leaf-assessment-target-provider.js'],
  ['../../js/story-assessment-leaf-selection.js', 'js/story-assessment-leaf-selection.js']
].forEach(([src, file]) => load(src, file));

(async function () {
  const coordinator = sandbox.SIYAYOVerbExplorerAdaptiveCoordinator;
  const identitySource = sandbox.SIYAYOVerbExplorerLearnerIdentitySource;
  const selection = sandbox.SIYAYOStoryAssessmentLeafSelection;

  assert.ok(coordinator && typeof coordinator.snapshot === 'function');
  assert.ok(selection && typeof selection.select === 'function');
  assert.equal(
    identitySource.getId(),
    'human-lab-learner-01',
    'Human Lab must use only its explicit controlled learner identity'
  );
  assert.equal(
    coordinator.snapshot(),
    null,
    'before explicit Select the Human Lab must have no active Session'
  );

  const selected = await selection.select(item);
  assert.equal(
    selected,
    true,
    'explicit Assessment Leaf Select must ground one adaptive Session'
  );

  assert.deepStrictEqual(
    fetchCalls,
    ['/data/learning/skills/which.json'],
    'Human Lab must load only the explicitly declared canonical Skill definition'
  );

  const active = coordinator.snapshot();
  assert.ok(active && active.session, 'Coordinator must hold the active Session');
  assert.equal(active.profile.id, 'human-lab-learner-01');
  assert.equal(active.profile.attempts, 0, 'Session start must not fabricate an Attempt');
  assert.equal(active.session.decision.skill, 'which.use.determiner');
  assert.equal(active.session.decision.experienceId, 'shopping-for-dinner');
  assert.equal(active.session.decision.action, 'continue-assessment');
  assert.equal(active.context.skill, 'which.use.determiner');
  assert.equal(active.context.currentExperience, 'shopping-for-dinner');
  assert.deepStrictEqual(
    Array.from(active.context.evidencePackets),
    [],
    'Session start must begin with no fabricated evidence packets'
  );
  assert.equal(
    active.session.trace.filter(entry => entry.event === 'learner-attempt').length,
    0,
    'Human Lab must WAIT for a real learner response before creating Attempt A'
  );
  assert.equal(
    'attempt' in active,
    false,
    'Coordinator snapshot must contain grounded P/S/C only; A remains event-time'
  );

  const firstSession = active.session;
  const secondSelect = await selection.select(item);
  assert.equal(
    secondSelect,
    false,
    're-selecting the same Leaf must not silently replace an active Session'
  );
  assert.strictEqual(
    coordinator.snapshot().session,
    firstSession,
    'active Session identity must remain stable while Human Lab is waiting for learner interaction'
  );

  console.log(
    'Human Semantic Surface adaptive Session runtime: PASS — explicit Select grounds one P/S/C Session, then WAIT preserves zero Attempt/evidence/NEXT until a real learner response.'
  );
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
