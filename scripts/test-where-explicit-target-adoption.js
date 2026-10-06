#!/usr/bin/env node
// Controlled startup/Specification checks; VM execution is not live UI homologation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'js', name + '.js'), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const Spec = require('../js/adaptive-where-location-probe-specification-source.js');
const Scope = require('../js/adaptive-assessment-scope.js');
const Profile = require('../js/adaptive-evidence-profile.js');
const GreenPass = require('../js/green-pass-profile.js');
const Loop = require('../js/adaptive-attempt-loop.js');
const corpus = require('../data/learning/experience-seeds.json');
const college = require('../data/learning/college-experience-seeds.json');
const where = require('../data/learning/skills/where.json');
const grounding = require('../data/learning/where-spatial-answer-grounding.json');
const local = corpus.items.find(item => item.id === 'shopping-for-dinner');
const destination = corpus.items.find(item => item.id === 'preparing-dinner');
const question = experience => experience.thinkingMind.find(item => item.questionWord === 'where');
const target = {skill: where.id, definitionPath: 'data/learning/skills/where.json'};

function browser(language = 'en', experienceId = local.id) {
  let state = {currentExperienceId: experienceId, experienceLanguage: language};
  const fetches = [];
  const box = vm.createContext({
    AdaptiveAssessmentScope: Scope, AdaptiveEvidenceProfile: Profile,
    GreenPassProfile: GreenPass, AdaptiveAttemptLoop: Loop
  });
  box.SIYAYOVerbExplorerResumeRuntime = {captureContext: () => state};
  box.SIYAYOVerbExplorerExperienceNavigation = {
    getExperiences: () => corpus.items,
    getExperience: id => corpus.items.find(item => item.id === id)
  };
  // Only the observed lexical location/selection and JSON transport are fixtures.
  box.SIYAYOVerbExplorerExperienceRuntime = {
    activeQuestionWord: () => 'where', activeExperienceId: () => state.currentExperienceId,
    activeLanguage: () => state.experienceLanguage
  };
  box.fetch = async requested => {
    fetches.push(requested);
    assert.equal(requested, target.definitionPath);
    return {ok: true, json: async () => where};
  };
  for (const name of [
    'green-pass-authority-policy', 'question-word-assessment-contract',
    'leaf-assessment-target-authority', 'verb-explorer-canonical-skill-source',
    'verb-explorer-canonical-skill-loader', 'leaf-canonical-skill-bridge',
    'verb-explorer-learner-identity-source', 'verb-explorer-adaptive-profile-source',
    'verb-explorer-adaptive-evidence-profile-source', 'verb-explorer-adaptive-session-source',
    'verb-explorer-adaptive-state-bridge', 'verb-explorer-session-state-boundary',
    'verb-explorer-adaptive-context-source', 'verb-explorer-choice-attempt-provider',
    'verb-explorer-adaptive-coordinator', 'verb-explorer-adaptive-coordinator-config',
    'verb-explorer-adaptive-composer', 'verb-explorer-adaptive-live-start',
    'verb-explorer-adaptive-readiness-trigger', 'leaf-assessment-target-readiness',
    'leaf-assessment-target-provider', 'verb-explorer-thinking-mind-assessment-selection',
    'adaptive-where-location-probe-specification-source'
  ]) vm.runInContext(read(name), box, {filename: name + '.js'});
  return {box, fetches, move: next => {state = {...state, ...next};},
    selection: box.SIYAYOVerbExplorerThinkingMindAssessmentSelection,
    identity: box.SIYAYOVerbExplorerLearnerIdentitySource,
    coordinator: box.SIYAYOVerbExplorerAdaptiveCoordinator,
    evidence: box.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource};
}

function assertSession(env, learnerId, language) {
  const snapshot = env.coordinator.snapshot();
  assert.ok(snapshot);
  const scope = snapshot.session.decision.assessmentScope;
  assert.equal(Scope.valid(scope), true);
  assert.equal(scope.learnerId, learnerId);
  assert.equal(scope.skill, where.id);
  assert.equal(scope.language, language);
  assert.equal(scope.originExperienceId, local.id);
  assert.equal(snapshot.session.decision.experienceId, local.id);
  assert.equal(snapshot.session.decision.skill, where.id);
  assert.equal(Scope.ownsContext(scope, snapshot.context), true);
  assert.equal(snapshot.profile.id, learnerId);
  assert.deepEqual(plain(snapshot.context.evidencePackets), [], 'selection produces no evidence');
  assert.deepEqual(env.evidence.getProfile().observations, [], 'selection produces no footprint');
  assert.equal(snapshot.session.trace.length, 1, 'only canonical Session birth is traced');
  assert.equal(snapshot.session.trace[0].event, 'experience-selected');
  const contract = GreenPass.evaluateContract(snapshot.context.passContract, snapshot.context.evidencePackets);
  assert.equal(contract.status, 'WAITING_FOR_EVIDENCE');
  assert.equal(contract.requirements.filter(item => item.satisfied).length, 0);
  return snapshot;
}

async function main() {
  const declarations = [...corpus.items, ...college.items].flatMap(experience =>
    experience.thinkingMind.filter(item => item.questionWord === 'where' && item.assessmentTarget)
      .map(item => ({experienceId: experience.id, target: item.assessmentTarget})));
  assert.deepEqual(declarations, [{experienceId: local.id, target}]);
  assert.equal(question(destination).assessmentTarget, undefined);
  assert.deepEqual(question(destination).assessmentResumeTarget, target);
  assert.equal(where.status, 'isolated-candidate');
  assert.equal(grounding.assessmentAuthority, false, 'content mapping is not an evaluator');

  const env = browser();
  assert.equal(env.coordinator.snapshot(), null, 'module loading creates no Session');
  assert.equal(env.fetches.length, 0);
  assert.equal(await env.selection.select(question(local)), false, 'anonymous selection waits for identity');
  assert.deepEqual(plain(env.box.SIYAYOLeafAssessmentTargetAuthority.getTarget()), target);
  assert.equal(env.coordinator.snapshot(), null);
  assert.equal(env.fetches.length, 0, 'anonymous selection loads no skill definition');
  assert.equal(env.identity.adopt('where-target-learner'), true);
  assert.equal(await env.selection.resumeForIdentity(), true, 'the same explicit pending selection resumes after nick');
  const sessions = new Map();
  let rejectedSpecifications = 0;
  for (const language of ['en', 'es', 'pt']) {
    env.move({currentExperienceId: local.id, experienceLanguage: language});
    assert.equal(await env.selection.select(question(local)), true);
    const snapshot = assertSession(env, 'where-target-learner', language);
    sessions.set(language, snapshot.session);
    assert.strictEqual(env.box.SIYAYOVerbExplorerCanonicalSkillSource.getDefinition(), where);
    assert.deepEqual(plain(env.box.SIYAYOLeafAssessmentTargetAuthority.getTarget()), target);
    const fetchCount = env.fetches.length;
    assert.equal(await env.selection.select(question(local)), true);
    assert.strictEqual(env.coordinator.snapshot().session, snapshot.session);
    assert.equal(env.fetches.length, fetchCount, 'same Session is reused without another load');

    for (const api of [Spec, env.box.AdaptiveWhereLocationProbeSpecificationSource]) {
      const input = JSON.stringify([where, local, destination, grounding]);
      const specs = api.resolve(where, local, destination, grounding, language);
      assert.ok(specs);
      assert.equal(specs.functionProbe.language, language);
      assert.equal(specs.functionProbe.alternatives[0].label, where.realizations[language].locationForm);
      assert.equal(specs.localProbe.question, question(local).question[language]);
      assert.equal(specs.localProbe.alternatives[0].label, grounding.records[0].answer[language]);
      assert.equal(specs.transferProbe.question, question(destination).question[language]);
      assert.equal(specs.transferProbe.alternatives[0].label, grounding.records[1].answer[language]);
      assert.equal(specs.transferProbe.fromExperienceId, scopeOrigin(snapshot));
      assert.equal(specs.transferProbe.experienceId, destination.id);
      assert.equal(Object.isFrozen(specs), true);
      assert.equal(JSON.stringify([where, local, destination, grounding]), input, 'Specification is read-only');
      const cases = [
        ['missing declaration', ({origin}) => {delete question(origin).assessmentTarget;}],
        ['foreign skill', ({origin}) => {question(origin).assessmentTarget.skill = 'where.identify.place';}],
        ['foreign path', ({origin}) => {question(origin).assessmentTarget.definitionPath = 'data/learning/skills/what.json';}],
        ['origin resume-only', ({origin}) => {question(origin).assessmentResumeTarget = target; delete question(origin).assessmentTarget;}],
        ['origin also resume', ({origin}) => {question(origin).assessmentResumeTarget = target;}],
        ['destination starts assessment', ({later}) => {question(later).assessmentTarget = target;}],
        ['missing destination recovery', ({later}) => {delete question(later).assessmentResumeTarget;}],
        ['foreign recovery skill', ({later}) => {question(later).assessmentResumeTarget.skill = 'what.use.object-question';}],
        ['foreign recovery path', ({later}) => {question(later).assessmentResumeTarget.definitionPath = 'other.json';}],
        ['foreign origin', ({origin}) => {origin.id = 'having-dinner';}],
        ['foreign destination', ({origin, later}) => {later.id = 'having-dinner'; origin.toroidalNext.nextExperience = later.id;}],
        ['wrong canonical hop', ({origin}) => {origin.toroidalNext.nextExperience = 'having-dinner';}],
        ['foreign skill origin', ({definition}) => {definition.grounding.localOrigin = destination.id;}],
        ['foreign skill destination', ({definition}) => {definition.grounding.transferDestination = 'having-dinner';}],
        ['foreign grounding map', ({definition}) => {definition.grounding.answerMap = 'other.json';}],
        ['destination-use semantics', ({origin}) => {question(origin).intention = 'destination';}],
        ['duplicate WHERE', ({origin}) => {origin.thinkingMind.push(plain(question(origin)));}],
        ['missing realization', ({definition}) => {delete definition.realizations[language];}]
      ];
      for (const [label, mutate] of cases) {
        const input = {definition: plain(where), origin: plain(local), later: plain(destination)};
        mutate(input);
        assert.equal(api.resolve(input.definition, input.origin, input.later, grounding, language), null, label);
        rejectedSpecifications += 1;
      }
      assert.equal(api.resolve(where, local, destination, grounding, 'fr'), null);
    }
    env.move({currentExperienceId: destination.id});
    assert.equal(await env.selection.select(question(destination)), true, 'Preparing resumes only the retained Shopping Session');
    assert.strictEqual(env.coordinator.snapshot().session, snapshot.session);
    assert.equal(scopeOrigin(env.coordinator.snapshot()), local.id, 'a visit retains the origin Session');
  }
  assert.equal(new Set(sessions.values()).size, 3, 'languages own distinct Sessions');
  env.move({currentExperienceId: local.id, experienceLanguage: 'en'});
  assert.equal(await env.selection.select(question(local)), true);
  assert.strictEqual(env.coordinator.snapshot().session, sessions.get('en'), 'returning to EN restores its retained circuit');
  assertSession(env, 'where-target-learner', 'en');

  const freshDestination = browser('en', destination.id);
  freshDestination.identity.adopt('new-visitor');
  assert.equal(await freshDestination.selection.select(question(destination)), false);
  assert.equal(freshDestination.coordinator.snapshot(), null);
  assert.equal(freshDestination.fetches.length, 0);
  for (const language of ['fr', null]) {
    const invalid = browser(language);
    invalid.identity.adopt('invalid-language');
    assert.equal(await invalid.selection.select(question(local)), false);
    assert.equal(invalid.coordinator.snapshot(), null);
    assert.equal(invalid.fetches.length, 0);
  }

  const mismatched = browser();
  mismatched.identity.adopt('mismatched-definition');
  mismatched.box.fetch = async () => ({ok: true, json: async () => require('../data/learning/skills/which.json')});
  assert.equal(await mismatched.selection.select(question(local)), false, 'loaded skill must equal the declared target');
  assert.equal(mismatched.coordinator.snapshot(), null);

  for (const change of [
    env => env.move({experienceLanguage: 'es'}),
    env => env.move({currentExperienceId: destination.id}),
    env => env.identity.adopt('other-learner')
  ]) {
    const pending = browser();
    pending.identity.adopt('pending-learner');
    let release, entered;
    const gate = new Promise(resolve => {release = resolve;});
    const started = new Promise(resolve => {entered = resolve;});
    pending.box.fetch = async () => {entered(); await gate; return {ok: true, json: async () => where};};
    const selection = pending.selection.select(question(local));
    await started;
    change(pending); release();
    assert.equal(await selection, false, 'identity/language/origin drift during load must WAIT');
    assert.equal(pending.coordinator.snapshot(), null);
    assert.equal(pending.evidence.getProfile(), null, 'a rejected load creates no evidence profile');
  }
  assert.equal(rejectedSpecifications, 108);
  console.log('PASS — Shopping is the sole explicit WHERE target; real selection/Leaf/loader/Composer/Coordinator startup creates three language-owned origin Sessions at 0/3 WAIT.');
  console.log('PASS — six Node/browser-VM Specification circuits use canonical location examples and reject 108 missing/foreign declarations or grounding/semantic mismatches.');
  console.log('PASS — anonymous startup, definition mismatch and identity/language/origin drift remain WAIT; Preparing visit preserves Shopping, with no evidence, NEXT or live UI claim.');
}
function scopeOrigin(snapshot) {return snapshot.session.decision.assessmentScope.originExperienceId;}
main().catch(error => {console.error(error); process.exitCode = 1;});
