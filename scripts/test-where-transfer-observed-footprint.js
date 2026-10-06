#!/usr/bin/env node
// Production authorities in isolated Sessions; browser-mode checks use a VM, not live UI.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, 'js', file + '.js'), 'utf8');
const Scope = require('../js/adaptive-assessment-scope.js');
const Profile = require('../js/adaptive-evidence-profile.js');
const Green = require('../js/green-pass-profile.js');
const Loop = require('../js/adaptive-attempt-loop.js');
const Cycle = require('../js/adaptive-learning-cycle.js');
const Transfer = require('../js/verb-explorer-transfer-attempt-authority.js');
const Observed = require('../js/adaptive-observed-attempt-evidence-source.js');
const Closure = require('../js/adaptive-contract-closure-evidence-source.js');
const Spec = require('../js/adaptive-where-location-probe-specification-source.js');
const Result = require('../js/adaptive-where-location-probe-result.js');
const Evidence = require('../js/adaptive-where-location-probe-evidence-bridge.js');
const Attempt = require('../js/adaptive-where-location-probe-attempt-boundary.js');
const where = require('../data/learning/skills/where.json');
const corpus = require('../data/learning/experience-seeds.json');
const grounding = require('../data/learning/where-spatial-answer-grounding.json');
const local = corpus.items.find(item => item.id === 'shopping-for-dinner');
const destination = corpus.items.find(item => item.id === 'preparing-dinner');
const catalog = {getExperience: id => corpus.items.find(item => item.id === id)};
const clone = value => JSON.parse(JSON.stringify(value));

function environment(mode, history) {
  let state, identity = history.id, dispatches = 0;
  const box = vm.createContext({
    AdaptiveAssessmentScope: Scope, AdaptiveEvidenceProfile: Profile, GreenPassProfile: Green,
    AdaptiveAttemptLoop: Loop, AdaptiveLearningCycle: Cycle,
    AdaptiveObservedAttemptEvidenceSource: Observed, AdaptiveContractClosureEvidenceSource: Closure,
    SIYAYOVerbExplorerTransferAttemptAuthority: Transfer,
    SIYAYOVerbExplorerExperienceNavigation: catalog,
    SIYAYOVerbExplorerLearnerIdentitySource: {getId: () => identity},
    SIYAYOVerbExplorerAdaptiveEvidenceProfileSource: {getProfile: () => history},
    SIYAYOVerbExplorerAdaptiveProfileSource: {adopt: () => true},
    SIYAYOVerbExplorerCycleResumeDispatch: {run() {dispatches += 1; return null;}}
  });
  if (mode === 'browser VM') {
    Object.assign(box, {
      AdaptiveAdvanceSelector: require('../js/adaptive-advance-selector.js'),
      AdaptiveLearningRouter: require('../js/adaptive-learning-router.js'),
      AdaptiveWaitClassifier: require('../js/adaptive-wait-classifier.js'),
      AdaptiveAgencyResumeContext: require('../js/adaptive-agency-resume-context.js')
    });
    for (const file of ['green-pass-authority-policy', 'adaptive-learning-cycle',
      'verb-explorer-transfer-attempt-authority', 'adaptive-observed-attempt-evidence-source'])
      vm.runInContext(read(file), box, {filename: file + '.js'});
  }
  vm.runInContext(read('verb-explorer-adaptive-coordinator'), box);
  return {box, coordinator: box.SIYAYOVerbExplorerAdaptiveCoordinator,
    transfer: box.SIYAYOVerbExplorerTransferAttemptAuthority,
    observed: box.AdaptiveObservedAttemptEvidenceSource,
    setState: value => {state = value;}, getState: () => state,
    setIdentity: value => {identity = value;}, dispatches: () => dispatches};
}

function make(spec, scope, occurrenceId, support = 'none', choice = spec.expectedAlternativeId) {
  const event = Object.freeze({observed: true, actor: 'learner', intent: 'answer',
    source: 'where-location-probe-select', occurrenceId, skill: spec.skill,
    dimension: spec.dimension, mode: spec.mode, language: spec.language,
    experienceId: spec.experienceId, fromExperienceId: spec.fromExperienceId, choice});
  const result = Result.evaluate(spec, event);
  assert.ok(result);
  const evidence = Evidence.fromResult({result, learnerEvent: event, supportSensor: {support: () => support}});
  const raw = Attempt.assemble({learnerEvent: event, evidence});
  const attempt = Scope.bindAttempt({scope, attempt: raw, learnerEvent: event,
    state: {experienceLanguage: scope.language}, learnerId: scope.learnerId});
  assert.ok(attempt);
  return {attempt, event};
}

let rejectedTransfers = 0, rejectedRecords = 0;
for (const mode of ['Node', 'browser VM']) {
  const learnerId = 'where-footprint-' + mode;
  const history = Profile.createProfile(learnerId);
  const env = environment(mode, history);
  for (const language of ['en', 'es', 'pt']) {
    const scope = Scope.create({learnerId, skill: where.id, language, originExperienceId: local.id});
    const context = {assessmentScope: scope, language, skill: where.id, currentExperience: local.id,
      passContract: where.passContract, evidencePackets: [], experiences: corpus.items};
    const session = Loop.begin(Profile, history, context);
    const decision = session.decision;
    assert.equal(decision.priorEvidence.length, 0, 'another language cannot lend its previous closure');
    env.coordinator.clear();
    env.setState({currentExperienceId: local.id, experienceLanguage: language});
    assert.equal(env.coordinator.configure({profile: Green.createProfile(learnerId), session, context,
      getState: env.getState, getResumeState: env.getState}), true);
    const specs = Spec.resolve(where, local, destination, grounding, language);
    assert.ok(specs);
    const ownRecords = () => history.observations.filter(entry => entry.context.assessmentScope.key === scope.key);
    const closures = () => ownRecords().filter(entry => entry.source === 'green-pass-contract');
    function submit(observed, expectedCompleted) {
      const response = env.coordinator.submitObservedAttempt(observed.attempt, observed.event);
      assert.ok(response, mode + ' ' + language + ' must retain an accepted occurrence');
      const result = response.cycleResult;
      assert.equal(result.operationalAuthority, 'contract');
      assert.equal(result.contractEvaluation.requirements.filter(item => item.satisfied).length, expectedCompleted);
      assert.equal(result.contractEligible, expectedCompleted === 3);
      assert.equal(result.contractEvaluation.status, expectedCompleted === 3 ? 'GREEN_PASS' : 'WAITING_FOR_EVIDENCE');
      assert.equal(result.advanceSelection, null);
      assert.equal(result.recommendation.action, 'continue-assessment');
      assert.strictEqual(env.coordinator.snapshot().session, session);
      assert.strictEqual(session.decision, decision);
      assert.equal(decision.experienceId, local.id);
      assert.equal(env.coordinator.snapshot().context.currentExperience, local.id);
      return response;
    }
    // Deliberately reuse these occurrence IDs across languages: deduplication belongs to the scope.
    submit(make(specs.functionProbe, scope, 'where-function'), 1);
    submit(make(specs.localProbe, scope, 'where-local'), 2);
    assert.equal(ownRecords().length, 2);
    assert.equal(closures().length, 0);
    env.setState({currentExperienceId: destination.id, experienceLanguage: language});
    const transfer = make(specs.transferProbe, scope, 'where-transfer');
    const base = {session, attempt: transfer.attempt, learnerEvent: transfer.event,
      state: env.getState(), catalog};
    assert.equal(env.transfer.accepts(base), true);
    const otherLanguage = language === 'en' ? 'es' : 'en';
    const cases = [
      ['unobserved', {learnerEvent: {...transfer.event, observed: false}}],
      ['actor', {learnerEvent: {...transfer.event, actor: 'system'}}],
      ['source', {learnerEvent: {...transfer.event, source: 'choice-select'}}],
      ['intent', {learnerEvent: {...transfer.event, intent: 'continue'}}],
      ['event skill', {learnerEvent: {...transfer.event, skill: 'where.identify.place'}}],
      ['attempt skill', {attempt: {...transfer.attempt, skill: 'what.use.object-question'}}],
      ['dimension', {learnerEvent: {...transfer.event, dimension: 'spatial-function'}}],
      ['event mode', {learnerEvent: {...transfer.event, mode: 'local'}}],
      ['attempt mode', {attempt: {...transfer.attempt, mode: 'local'}}],
      ['language', {learnerEvent: {...transfer.event, language: otherLanguage}}],
      ['attempt language', {attempt: {...transfer.attempt, language: otherLanguage}}],
      ['display language', {state: {...base.state, experienceLanguage: otherLanguage}}],
      ['origin', {learnerEvent: {...transfer.event, fromExperienceId: destination.id}}],
      ['destination', {learnerEvent: {...transfer.event, experienceId: local.id}}],
      ['blank occurrence', {learnerEvent: {...transfer.event, occurrenceId: ''}}],
      ['occurrence', {attempt: {...transfer.attempt, occurrenceId: 'foreign-occurrence'}}],
      ['context occurrence', {attempt: {...transfer.attempt, context: {...transfer.attempt.context, occurrenceId: 'foreign-occurrence'}}}],
      ['choice', {learnerEvent: {...transfer.event, choice: 'foreign-location'}}],
      ['candidate', {attempt: {...transfer.attempt, context: {...transfer.attempt.context, selectedAlternativeId: 'non-location'}}}],
      ['foreign learner scope', {attempt: {...transfer.attempt, context: {...transfer.attempt.context,
        assessmentScope: Scope.create({...scope, learnerId: 'other-learner'})}}}],
      ['foreign origin scope', {attempt: {...transfer.attempt, context: {...transfer.attempt.context,
        assessmentScope: Scope.create({...scope, originExperienceId: destination.id})}}}],
      ['missing scope', {session: {decision: {...decision, assessmentScope: null}}}],
      ['invalid scope', {session: {decision: {...decision, assessmentScope: {...scope, key: 'foreign-key'}}}}]
    ];
    for (const [name, alter] of [
      ['wrong hop', item => {item.toroidalNext.nextExperience = 'having-dinner';}],
      ['missing WHERE', item => {item.thinkingMind = item.thinkingMind.filter(q => q.questionWord !== 'where');}],
      ['duplicate WHERE', item => {item.thinkingMind.push(item.thinkingMind.find(q => q.questionWord === 'where'));}],
      ['destination semantics', item => {item.thinkingMind.find(q => q.questionWord === 'where').intention = 'destination';}],
      ['foreign declared target', item => {item.thinkingMind.find(q => q.questionWord === 'where').assessmentTarget =
        {skill: 'what.use.object-question', definitionPath: 'data/learning/skills/what.json'};}]
    ]) {
      const wrongOrigin = clone(local); alter(wrongOrigin);
      cases.push([name, {catalog: {getExperience: id => id === local.id ? wrongOrigin : catalog.getExperience(id)}}]);
    }
    for (const [name, overrides] of cases) {
      const input = {...base, ...overrides};
      assert.equal(env.transfer.accepts(input), false, name + ' must fail at the transfer boundary');
      rejectedTransfers += 1;
      if (input.session !== session) continue;
      const before = [session.trace.length, ownRecords().length, env.coordinator.snapshot().context.evidencePackets.length];
      env.setState(input.state); env.box.SIYAYOVerbExplorerExperienceNavigation = input.catalog;
      assert.equal(env.coordinator.submitObservedAttempt(input.attempt, input.learnerEvent), null, name);
      assert.deepEqual([session.trace.length, ownRecords().length,
        env.coordinator.snapshot().context.evidencePackets.length], before, 'rejection must precede mutation');
      env.setState(base.state); env.box.SIYAYOVerbExplorerExperienceNavigation = catalog;
    }
    env.setIdentity('other-learner');
    const beforeIdentity = session.trace.length;
    assert.equal(env.coordinator.submitObservedAttempt(transfer.attempt, transfer.event), null);
    assert.equal(session.trace.length, beforeIdentity);
    env.setIdentity(learnerId);
    const beforeDispatch = env.dispatches();
    submit(make(specs.transferProbe, scope, 'where-failed', 'none', 'non-location'), 2);
    submit(make(specs.transferProbe, scope, 'where-assisted', 'audio'), 2);
    assert.equal(closures().length, 0, 'failed or supported transfer cannot close the contract');
    const response = submit(transfer, 3);
    assert.equal(env.dispatches(), beforeDispatch, 'transfer must not resume or navigate to the origin');
    assert.equal(env.getState().currentExperienceId, destination.id);
    assert.equal(ownRecords().filter(entry => entry.source === 'learner-attempt').length, 5);
    assert.equal(closures().length, 1);
    const footprint = ownRecords().find(entry => entry.context.occurrenceId === transfer.event.occurrenceId);
    assert.equal(footprint.context.experienceId, destination.id);
    assert.equal(footprint.context.fromExperienceId, local.id);
    assert.equal(footprint.context.confirmed, false, 'the observed footprint is separate from the confirmed closure');
    const snapshot = env.coordinator.snapshot();
    const beforeDuplicate = [session.trace.length, ownRecords().length, snapshot.context.evidencePackets.length];
    assert.equal(env.coordinator.submitObservedAttempt(transfer.attempt, transfer.event), null);
    assert.deepEqual([session.trace.length, ownRecords().length, snapshot.context.evidencePackets.length], beforeDuplicate);
    const recordInput = {session, attempt: transfer.attempt, learnerEvent: transfer.event,
      cycleResult: response.cycleResult, context: snapshot.context};
    assert.strictEqual(env.observed.record(Profile, history, recordInput), history);
    assert.strictEqual(Closure.record(Profile, history, recordInput), history);
    assert.equal(ownRecords().length, beforeDuplicate[1], 'both recorders must be idempotent');
    for (const mutate of [
      item => {item.learnerEvent.source = 'choice-select';},
      item => {item.learnerEvent.mode = 'local';},
      item => {item.learnerEvent.language = otherLanguage;},
      item => {item.session.decision.experienceId = destination.id;},
      item => {item.attempt.context.occurrenceId = 'foreign-occurrence';},
      item => {item.cycleResult.evidencePacket.context.selectedAlternativeId = 'non-location';},
      item => {item.cycleResult.evidencePacket.context.language = otherLanguage;},
      item => {item.cycleResult.evidencePacket.context.fromExperienceId = destination.id;},
      item => {item.cycleResult.evidencePacket.mode = 'local';},
      item => {item.cycleResult.evidencePacket.result = 'fail';},
      item => {item.cycleResult.evidencePacket.support = 'audio';},
      item => {item.attempt.context.assessmentScope = Scope.create({...scope, learnerId: 'other-learner'});}
    ]) {
      const invalid = clone(recordInput); mutate(invalid);
      assert.equal(env.observed.record(Profile, history, invalid), null, 'invalid provenance cannot be treated as a duplicate');
      assert.equal(ownRecords().length, beforeDuplicate[1]);
      rejectedRecords += 1;
    }
    assert.equal(env.observed.record(Profile, Profile.createProfile('other-learner'), recordInput), null);
    submit(make(specs.transferProbe, scope, 'where-transfer-again'), 3);
    assert.equal(ownRecords().filter(entry => entry.source === 'learner-attempt').length, 6);
    assert.equal(closures().length, 1, 'a new occurrence cannot duplicate the same scope closure');
    assert.equal(session.trace.some(entry => entry.event === 'adaptive-next-selected'), false);
    const laterSession = Loop.begin(Profile, history, context);
    assert.equal(laterSession.decision.priorEvidence.filter(entry => entry.source === 'green-pass-contract').length, 1,
      'a later canonical Decision can recover this scope closure');
    assert.deepEqual(local.thinkingMind.find(q => q.questionWord === 'where').assessmentTarget,
      {skill: where.id, definitionPath: 'data/learning/skills/where.json'});
    assert.equal(destination.thinkingMind.find(q => q.questionWord === 'where').assessmentResumeTarget, undefined);
  }
  assert.equal(history.observations.length, 21, 'EN/ES/PT each retain six observed Attempts and one scope-owned closure');
}
const missingScope = vm.createContext({});
for (const file of ['verb-explorer-transfer-attempt-authority', 'adaptive-observed-attempt-evidence-source'])
  vm.runInContext(read(file), missingScope);
const scope = Scope.create({learnerId: 'missing-scope', skill: where.id, language: 'en', originExperienceId: local.id});
const observed = make(Spec.resolve(where, local, destination, grounding, 'en').transferProbe, scope, 'missing-scope-transfer');
const session = {decision: {skill: where.id, experienceId: local.id, assessmentScope: scope}};
assert.equal(missingScope.SIYAYOVerbExplorerTransferAttemptAuthority.accepts({session, attempt: observed.attempt,
  learnerEvent: observed.event, state: {currentExperienceId: destination.id, experienceLanguage: 'en'}, catalog}), false);
assert.equal(missingScope.AdaptiveObservedAttemptEvidenceSource.record(Profile, Profile.createProfile(scope.learnerId),
  {session, attempt: observed.attempt, learnerEvent: observed.event, cycleResult: {evidencePacket: observed.attempt}}), null);
console.log('PASS — six EN/ES/PT Node/browser-VM WHERE circuits traverse the real Coordinator and retain scoped transfer footprints once.');
console.log('PASS — ' + rejectedTransfers + ' invalid transfers and ' + rejectedRecords + ' malformed records are rejected; failed/audio transfer stays WAIT.');
console.log('PASS — language-owned deduplication and one closure survive later Decisions; Preparing visit keeps Shopping Session, with no automatic NEXT or live UI claim.');
