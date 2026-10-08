#!/usr/bin/env node
// Policy admission only: browser execution uses a VM, not a live learner/UI.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const Policy = require('../data/learning/green-pass-authority.json');
const Scope = require('../js/adaptive-assessment-scope.js');
const Profile = require('../js/adaptive-evidence-profile.js');
const GreenPass = require('../js/green-pass-profile.js');
const Loop = require('../js/adaptive-attempt-loop.js');
const Cycle = require('../js/adaptive-learning-cycle.js');
const Transfer = require('../js/verb-explorer-transfer-attempt-authority.js');
const Spec = require('../js/adaptive-where-location-probe-specification-source.js');
const Result = require('../js/adaptive-where-location-probe-result.js');
const Evidence = require('../js/adaptive-where-location-probe-evidence-bridge.js');
const Attempt = require('../js/adaptive-where-location-probe-attempt-boundary.js');
const where = require('../data/learning/skills/where.json');
const grounding = require('../data/learning/where-spatial-answer-grounding.json');
const corpus = require('../data/learning/experience-seeds.json');
const local = corpus.items.find(item => item.id === 'shopping-for-dinner');
const destination = corpus.items.find(item => item.id === 'preparing-dinner');
const target = {skill: where.id, definitionPath: 'data/learning/skills/where.json'};
const catalog = {getExperience: id => corpus.items.find(item => item.id === id)};

function browser(loadPolicy = true) {
  const box = vm.createContext({
    AdaptiveAttemptLoop: Loop, GreenPassProfile: GreenPass, AdaptiveAssessmentScope: Scope,
    AdaptiveAdvanceSelector: require('../js/adaptive-advance-selector.js'),
    AdaptiveLearningRouter: require('../js/adaptive-learning-router.js'),
    AdaptiveWaitClassifier: require('../js/adaptive-wait-classifier.js'),
    AdaptiveAgencyResumeContext: require('../js/adaptive-agency-resume-context.js')
  });
  if (loadPolicy) vm.runInContext(read('js/green-pass-authority-policy.js'), box);
  for (const file of [
    'leaf-assessment-target-authority', 'verb-explorer-canonical-skill-source',
    'verb-explorer-canonical-skill-loader', 'leaf-canonical-skill-bridge',
    'question-word-assessment-contract', 'verb-explorer-thinking-mind-assessment-selection',
    'adaptive-learning-cycle'
  ]) vm.runInContext(read('js/' + file + '.js'), box, {filename: file + '.js'});
  return box;
}

function makeAttempt(spec, scope, occurrenceId) {
  const event = {
    observed: true, actor: 'learner', intent: 'answer', source: 'where-location-probe-select',
    occurrenceId, skill: spec.skill, dimension: spec.dimension, mode: spec.mode,
    language: spec.language, experienceId: spec.experienceId,
    fromExperienceId: spec.fromExperienceId, choice: spec.expectedAlternativeId
  };
  const result = Result.evaluate(spec, event);
  assert.ok(result);
  const evidence = Evidence.fromResult({result, learnerEvent: event, supportSensor: {support: () => 'none'}});
  const attempt = Attempt.assemble({learnerEvent: event, evidence});
  const bound = Scope.bindAttempt({scope, attempt, learnerEvent: event,
    state: {experienceLanguage: scope.language}, learnerId: scope.learnerId});
  assert.ok(bound);
  return {attempt: bound, event};
}

async function main() {
  const box = browser();
  const leaf = box.SIYAYOLeafAssessmentTargetAuthority;
  const source = box.SIYAYOVerbExplorerCanonicalSkillSource;
  const bridge = box.SIYAYOLeafCanonicalSkillBridge;
  assert.deepEqual(Array.from(box.GreenPassAuthorityPolicy.contractAuthoritySkills), Policy.contractAuthoritySkills,
    'Node and browser must admit the same skills');
  assert.deepEqual(Policy.contractAuthoritySkills, [
    'which.use.determiner', 'what.use.object-question', 'why.use.contextual-reason', where.id
  ], 'this stage adds only WHERE to the existing authority list');
  assert.equal(box.GreenPassAuthorityPolicy.defaultAuthority, Policy.defaultAuthority);
  assert.equal(box.GreenPassAuthorityPolicy.fallbackAuthority, Policy.policy.fallbackAuthority);
  assert.equal(Object.isFrozen(box.GreenPassAuthorityPolicy.contractAuthoritySkills), true);

  for (const cycle of [Cycle, box.AdaptiveLearningCycle]) {
    for (const skill of Policy.contractAuthoritySkills) {
      assert.equal(cycle.resolveAuthority({passContract: where.passContract}, skill), 'contract');
      assert.equal(cycle.resolveAuthority({}, skill), 'legacy', 'admission still requires an explicit contract');
    }
    for (const skill of ['where.identify.place', 'how-much.use.uncountable', 'unknown'])
      assert.equal(cycle.resolveAuthority({passContract: where.passContract}, skill), 'legacy');
    assert.equal(cycle.resolveAuthority({passContract: where.passContract,
      greenPassAuthorityPolicy: {contractAuthoritySkills: []}}, where.id), 'legacy');
  }

  assert.equal(leaf.getTarget(), null, 'loading policy creates no target');
  assert.equal(source.getDefinition(), null, 'loading policy creates no skill');
  assert.equal(await bridge.loadTarget(), false, 'no explicit target remains WAIT');
  let fetches = 0;
  box.fetch = async requested => {
    fetches += 1;
    assert.equal(requested, target.definitionPath);
    return {ok: true, json: async () => where};
  };
  assert.equal(leaf.adopt(target), true);
  assert.equal(await bridge.loadTarget(), true, 'an explicit WHERE target can load the admitted definition');
  assert.equal(fetches, 1);
  assert.strictEqual(source.getDefinition(), where);
  assert.equal(source.adopt({...where, id: 'where.identify.place'}), false);
  assert.equal(source.adopt({id: where.id}), false, 'missing Pass Contract is rejected');
  assert.equal(leaf.adopt({...target, skill: 'where.identify.place'}), false);
  assert.strictEqual(source.getDefinition(), where, 'invalid adoption preserves the current definition');
  source.clear(); leaf.clear();
  assert.equal(await bridge.loadTarget(), false);

  const missing = browser(false);
  assert.equal(missing.SIYAYOLeafAssessmentTargetAuthority.adopt(target), false);
  assert.equal(missing.SIYAYOVerbExplorerCanonicalSkillSource.adopt(where), false);
  assert.equal(missing.AdaptiveLearningCycle.resolveAuthority({passContract: where.passContract}, where.id), 'legacy');
  assert.equal(where.status, 'isolated-candidate');
  assert.equal(grounding.assessmentAuthority, false);
  let selections = 0;
  box.SIYAYOVerbExplorerAdaptiveStateBridge = {getState: () =>
    ({currentExperienceId: local.id, experienceLanguage: 'en'})};
  for (const experience of [local, destination]) {
    const question = experience.thinkingMind.find(item => item.questionWord === 'where');
    const declared = experience === local;
    if (declared) assert.deepEqual(question.assessmentTarget, target);
    else assert.equal(question.assessmentTarget, undefined);
    if (declared) assert.equal(question.assessmentResumeTarget, undefined);
    else assert.deepEqual(question.assessmentResumeTarget, target);
    assert.equal(box.SIYAYOQuestionWordAssessmentContract.inspect(question).status,
      declared ? 'ASSESSMENT_DECLARED' : 'ASSESSMENT_RESUME_ONLY');
    assert.equal(await box.SIYAYOVerbExplorerThinkingMindAssessmentSelection.select(question,
      {provider: {select() {selections += 1; return true;}}}), declared);
  }
  assert.equal(selections, 1, 'only the explicit Shopping target can request an assessment');
  assert.equal(leaf.getTarget(), null);
  assert.equal(source.getDefinition(), null);

  for (const [runtime, cycle] of [['Node', Cycle], ['browser VM', box.AdaptiveLearningCycle]]) {
    for (const language of ['en', 'es', 'pt']) {
      const learnerId = 'where-admission-' + runtime + '-' + language;
      const scope = Scope.create({learnerId, skill: where.id, language, originExperienceId: local.id});
      let profile = GreenPass.createProfile(learnerId);
      let context = {assessmentScope: scope, skill: where.id, language, currentExperience: local.id,
        passContract: where.passContract, evidencePackets: [], experiences: corpus.items};
      const session = Loop.begin(Profile, Profile.createProfile(learnerId), context);
      const decision = session.decision;
      const specs = Spec.resolve(where, local, destination, grounding, language);
      assert.ok(specs);
      const functionAttempt = makeAttempt(specs.functionProbe, scope, learnerId + '-function');
      const localAttempt = makeAttempt(specs.localProbe, scope, learnerId + '-local');
      const transferAttempt = makeAttempt(specs.transferProbe, scope, learnerId + '-transfer');

      for (const [invalidProfile, invalidAttempt, invalidContext] of [
        [{...profile, id: 'other-learner'}, functionAttempt.attempt, context],
        [profile, {...functionAttempt.attempt, skill: 'what.use.object-question'}, context],
        [profile, {...functionAttempt.attempt, context: {...functionAttempt.attempt.context,
          language: language === 'en' ? 'es' : 'en'}}, context],
        [profile, functionAttempt.attempt, {...context, assessmentScope:
          Scope.create({...scope, originExperienceId: destination.id})}],
        [profile, functionAttempt.attempt, {...context, evidencePackets: [
          {...localAttempt.attempt, context: {...localAttempt.attempt.context,
            assessmentScope: Scope.create({...scope, learnerId: 'other-learner'})}}
        ]}]
      ]) {
        const before = session.trace.length;
        assert.throws(() => cycle.submit(invalidProfile, session, invalidAttempt, invalidContext),
          /declared learner, language and circuit/);
        assert.equal(session.trace.length, before, 'foreign scope is rejected before recording');
        assert.equal(context.evidencePackets.length, 0);
      }

      let completed = 0;
      for (const observed of [functionAttempt, localAttempt, transferAttempt]) {
        assert.equal(Object.hasOwn(context, 'greenPassAuthority'), false);
        assert.equal(Object.hasOwn(context, 'greenPassAuthorityPolicy'), false);
        const result = cycle.submit(profile, session, observed.attempt, context);
        completed += 1;
        assert.equal(result.operationalAuthority, 'contract', runtime + ' must use its default policy');
        assert.equal(result.contractEvaluation.requirements.filter(item => item.satisfied).length, completed);
        assert.equal(result.contractEvaluation.status, completed === 3 ? 'GREEN_PASS' : 'WAITING_FOR_EVIDENCE');
        assert.equal(result.contractEligible, completed === 3);
        assert.equal(result.recommendation.action, 'continue-assessment');
        assert.equal(result.advanceSelection, null, 'contract eligibility never executes NEXT');
        assert.strictEqual(session.decision, decision);
        assert.equal(decision.experienceId, local.id);
        assert.equal(result.nextContext.currentExperience, local.id);
        assert.equal(result.evidencePacket.context.assessmentScope.key, scope.key);
        profile = result.greenProfile; context = result.nextContext;
        if (completed === 2) {
          const repeatedLocal = GreenPass.evaluateContract(where.passContract,
            context.evidencePackets.concat(localAttempt.attempt));
          assert.equal(repeatedLocal.status, 'WAITING_FOR_EVIDENCE', 'local repetition cannot replace transfer');
          assert.equal(repeatedLocal.missing.length, 1);
          assert.equal(repeatedLocal.missing[0].mode, 'transfer');
        }
      }
      assert.equal(session.trace.some(entry => entry.event === 'adaptive-next-selected'), false);
      assert.equal(Transfer.accepts({session, attempt: transferAttempt.attempt,
        learnerEvent: transferAttempt.event, state: {currentExperienceId: destination.id, experienceLanguage: language},
        catalog}), true, 'explicit scoped WHERE transfer uses the admitted pilot boundary');
    }
  }
  console.log('PASS — WHERE policy admission matches Node/browser, preserves WHICH/WHAT/WHY and requires explicit target/Skill.');
  console.log('PASS — six scoped EN/ES/PT Node/browser-VM circuits retain WAIT at 1/3 and 2/3; 3/3 is eligible without NEXT.');
  console.log('PASS — foreign scope is rejected; only Shopping explicitly selects WHERE, while Preparing stays transfer-only. No live UI evidence is claimed.');
}
main().catch(error => {console.error(error); process.exitCode = 1;});
