#!/usr/bin/env node
// Controlled DOM/speech fixtures around production startup, panel and Cycle.
// This is integration evidence, not human UI homologation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'js', name + '.js'), 'utf8');
const corpus = require('../data/learning/experience-seeds.json').items;
const where = require('../data/learning/skills/where.json');
const grounding = require('../data/learning/where-spatial-answer-grounding.json');
const local = corpus.find(item => item.id === 'shopping-for-dinner');
const destination = corpus.find(item => item.id === 'preparing-dinner');
const question = experience => experience.thinkingMind.find(item => item.questionWord === 'where');
const clone = value => JSON.parse(JSON.stringify(value));

function dom() {
  const ids = {};
  function node(tag) {
    return {tag, children: [], dataset: {}, attributes: {}, handlers: {}, hidden: false,
      set id(value) {this._id = value; ids[value] = this;}, get id() {return this._id;},
      set innerHTML(value) {this.children = []; this._html = value;}, get innerHTML() {return this._html || '';},
      setAttribute(key, value) {this.attributes[key] = value;},
      appendChild(child) {this.children.push(child); return child;},
      insertBefore(child) {return this.appendChild(child);},
      addEventListener(type, handler) {(this.handlers[type] ||= []).push(handler);},
      click() {(this.handlers.click || []).forEach(handler => handler({target: this}));},
      querySelectorAll(selector) {
        return this.children.flatMap(child => [
          ...(selector[0] === '.' && (child.className || '').split(' ').includes(selector.slice(1)) ? [child] : []),
          ...child.querySelectorAll(selector)
        ]);
      }, querySelector(selector) {return this.querySelectorAll(selector)[0] || null;}
    };
  }
  const view = node('div'); view.id = 'experienceView';
  const living = node('div'); living.className = 'living-window'; view.appendChild(living);
  return {getElementById: id => ids[id] || null, createElement: node};
}

async function environment(mode, language, learnerId, data = grounding) {
  let state = {currentExperienceId: local.id, experienceLanguage: language, questionWord: 'where'};
  const doc = dom(), utterances = [], fetches = [];
  const box = vm.createContext({document: doc,
    AdaptiveAssessmentScope: require('../js/adaptive-assessment-scope.js'),
    AdaptiveEvidenceProfile: require('../js/adaptive-evidence-profile.js'),
    GreenPassProfile: require('../js/green-pass-profile.js'),
    AdaptiveAttemptLoop: require('../js/adaptive-attempt-loop.js'),
    AdaptiveLearningCycle: require('../js/adaptive-learning-cycle.js'),
    AdaptiveObservedAttemptEvidenceSource: require('../js/adaptive-observed-attempt-evidence-source.js'),
    AdaptiveContractClosureEvidenceSource: require('../js/adaptive-contract-closure-evidence-source.js'),
    SIYAYOVerbExplorerTransferAttemptAuthority: require('../js/verb-explorer-transfer-attempt-authority.js'),
    AdaptivePassContractProgressView: require('../js/adaptive-pass-contract-progress-view.js'),
    clearChoiceAudioHighlight() {}, speechLocales: {en: 'en-US', es: 'es-ES', pt: 'pt-BR'},
    SpeechSynthesisUtterance: function(text) {this.text = text;},
    speechSynthesis: {cancel() {}, speak(utterance) {utterances.push(utterance);}}
  });
  box.window = box;
  box.SIYAYOVerbExplorerResumeRuntime = {captureContext: () => state};
  box.SIYAYOVerbExplorerExperienceNavigation = {getExperience: id => corpus.find(item => item.id === id), getExperiences: () => corpus};
  box.SIYAYOVerbExplorerExperienceRuntime = {
    activeQuestionWord: () => state.questionWord, activeExperienceId: () => state.currentExperienceId,
    activeLanguage: () => state.experienceLanguage, speak: (...args) => box.speakText(...args)
  };
  box.fetch = async requested => {
    fetches.push(requested);
    if (requested === 'data/learning/where-spatial-answer-grounding.json') return {ok: true, json: async () => data};
    if (requested === 'data/learning/skills/where.json') return {ok: true, json: async () => where};
    if (requested === 'data/learning/skills/what.json') return {ok: true, json: async () => require('../data/learning/skills/what.json')};
    if (requested === 'data/learning/skills/which.json') return {ok: true, json: async () => require('../data/learning/skills/which.json')};
    throw new Error('Unexpected request: ' + requested);
  };
  if (mode === 'browser VM') {
    Object.assign(box, {
      AdaptiveAdvanceSelector: require('../js/adaptive-advance-selector.js'),
      AdaptiveLearningRouter: require('../js/adaptive-learning-router.js'),
      AdaptiveWaitClassifier: require('../js/adaptive-wait-classifier.js'),
      AdaptiveAgencyResumeContext: require('../js/adaptive-agency-resume-context.js')
    });
    for (const name of ['green-pass-authority-policy', 'adaptive-learning-cycle', 'adaptive-observed-attempt-evidence-source',
      'verb-explorer-transfer-attempt-authority']) vm.runInContext(read(name), box, {filename: name + '.js'});
  }
  for (const name of [
    'green-pass-authority-policy', 'question-word-assessment-contract', 'leaf-assessment-target-authority',
    'verb-explorer-canonical-skill-source', 'verb-explorer-canonical-skill-loader', 'leaf-canonical-skill-bridge',
    'verb-explorer-learner-identity-source', 'verb-explorer-adaptive-profile-source',
    'verb-explorer-adaptive-evidence-profile-source', 'verb-explorer-adaptive-session-source',
    'verb-explorer-adaptive-state-bridge', 'verb-explorer-session-state-boundary',
    'verb-explorer-adaptive-context-source', 'verb-explorer-choice-attempt-provider',
    'verb-explorer-adaptive-coordinator', 'verb-explorer-adaptive-coordinator-config',
    'verb-explorer-adaptive-composer', 'verb-explorer-adaptive-live-start', 'verb-explorer-adaptive-readiness-trigger',
    'leaf-assessment-target-readiness', 'leaf-assessment-target-provider', 'verb-explorer-thinking-mind-assessment-selection',
    'adaptive-where-location-probe-specification-source', 'adaptive-where-location-probe-result',
    'adaptive-where-location-probe-evidence-bridge', 'adaptive-where-location-probe-attempt-boundary',
    'verb-explorer-learner-event', 'verb-explorer-where-assessment-live'
  ]) vm.runInContext(read(name), box, {filename: name + '.js'});
  // Execute the actual production speech function with native TTS transport controlled.
  const speech = read('verb-explorer').split('\n').find(line => line.startsWith('function speakText('));
  assert.ok(speech); vm.runInContext(speech, box);
  const live = box.SIYAYOVerbExplorerWhereAssessmentLive;
  assert.equal(await live.loadGrounding(), true); assert.equal(await live.loadGrounding(), true);
  assert.equal(fetches.filter(url => url.includes('where-spatial')).length, 1, 'one cached grounding transport');
  box.SIYAYOVerbExplorerLearnerIdentitySource.adopt(learnerId);
  return {box, live, doc, utterances, move: next => {state = {...state, ...next};},
    select: q => box.SIYAYOVerbExplorerThinkingMindAssessmentSelection.select(q),
    snapshot: () => box.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot(),
    records: () => box.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource.getProfile()?.observations || [],
    mount(experience = corpus.find(item => item.id === state.currentExperienceId)) {
      return live.mount({document: doc, experience, language: state.experienceLanguage});
    },
    button(dimension, alternativeId) {
      const group = doc.getElementById('whereAssessmentPanel').querySelectorAll('.where-location-probe')
        .find(item => item.dataset.dimension === dimension);
      return group.querySelectorAll('.where-probe-option').find(item => item.dataset.alternativeId === alternativeId);
    }
  };
}

function assertProgress(env, completed) {
  const snapshot = env.snapshot();
  const result = env.box.GreenPassProfile.evaluateContract(snapshot.context.passContract, snapshot.context.evidencePackets);
  assert.equal(result.requirements.filter(item => item.satisfied).length, completed);
  assert.equal(result.status, completed === 3 ? 'GREEN_PASS' : 'WAITING_FOR_EVIDENCE');
  assert.equal(snapshot.session.decision.experienceId, local.id);
  assert.match(env.doc.getElementById('whereAssessmentPanel').querySelector('.where-contract-progress').textContent,
    new RegExp(completed + '/3'));
  assert.equal(env.records().filter(item => item.source === 'green-pass-contract').length, completed === 3 ? 1 : 0);
}

async function main() {
  for (const mode of ['Node', 'browser VM']) for (const language of ['en', 'es', 'pt']) {
    const learnerId = 'where-live-' + mode + '-' + language;
    const env = await environment(mode, language, learnerId);
    assert.equal(env.mount(), false, 'grounding/identity alone does not create a Session');
    assert.equal(await env.select(question(local)), true);
    const session = env.snapshot().session;
    const eventFactory = env.box.SIYAYOVerbExplorerLearnerEvent.fromWhereLocationProbeSelect;
    const validEventState = {skill: where.id, dimension: 'location-answer', mode: 'local', language,
      currentExperienceId: local.id};
    for (const wrong of [{skill:'what.use.object-question'}, {dimension:'question-function'},
      {mode:'borrowed'}, {language:'fr'}, {currentExperienceId:''}, {fromExperienceId:destination.id},
      {mode:'transfer', fromExperienceId:local.id},
      {mode:'transfer', dimension:'spatial-function', currentExperienceId:destination.id, fromExperienceId:local.id}]) {
      assert.equal(eventFactory('grounded-location', {...validEventState, ...wrong}), null, 'malformed WHERE event fails closed');
    }
    assert.equal(eventFactory('', validEventState), null);
    assert.equal(env.mount(), true); assertProgress(env, 0);
    const stale = env.button('spatial-function', 'location');
    assert.equal(env.mount(), true); stale.click();
    assert.equal(env.records().length, 0, 'detached old listener cannot submit after remount');
    const source = env.box.SIYAYOVerbExplorerCanonicalSkillSource;
    assert.equal(source.adopt(require('../data/learning/skills/what.json')), true);
    env.button('spatial-function', 'location').click();
    assert.equal(env.records().length, 0, 'foreign definition cannot own WHERE presentation');
    assert.equal(source.adopt(where), true);
    const beforeTrace = session.trace.length;
    for (const change of [
      {experienceLanguage: language === 'en' ? 'es' : 'en'},
      {currentExperienceId: destination.id}, {questionWord: 'what'}
    ]) {
      env.move(change); env.button('spatial-function', 'location').click();
      env.move({currentExperienceId: local.id, experienceLanguage: language, questionWord: 'where'});
      assert.equal(session.trace.length, beforeTrace, 'state drift rejected before Trace');
      assert.equal(env.records().length, 0);
    }
    env.box.SIYAYOVerbExplorerLearnerIdentitySource.adopt('other-learner');
    env.button('spatial-function', 'location').click();
    assert.equal(session.trace.length, beforeTrace, 'foreign identity rejected before Trace');
    env.box.SIYAYOVerbExplorerLearnerIdentitySource.adopt(learnerId);
    env.button('spatial-function', 'destination').click(); assertProgress(env, 0);
    env.button('spatial-function', 'location').click(); assertProgress(env, 1);
    // A request/error before actual onstart is not observed audio support.
    env.doc.getElementById('whereAssessmentPanel').querySelector('.where-probe-audio').click();
    assert.equal(env.utterances.length, 1);
    assert.equal(env.utterances[0].lang, {en:'en-US', es:'es-ES', pt:'pt-BR'}[language]);
    assert.equal(env.records().length, 2, 'speaker click is not an Attempt'); env.utterances[0].onerror();
    env.button('location-answer', 'grounded-location').click(); assertProgress(env, 2);
    assert.equal(env.records().at(-1).context.support, 'none');
    env.move({currentExperienceId: destination.id});
    assert.equal(await env.select(question(destination)), true); assert.strictEqual(env.snapshot().session, session);
    assert.equal(env.mount(), true);
    assert.equal(env.doc.getElementById('whereAssessmentPanel').querySelectorAll('.where-location-probe').length, 1);
    env.button('location-answer', 'non-location').click(); assertProgress(env, 2);
    env.button('location-answer', 'grounded-location').click(); assertProgress(env, 3);
    assert.strictEqual(env.snapshot().session, session);
    const records = env.records().filter(item => item.source === 'learner-attempt');
    assert.equal(records.length, 5);
    assert.equal(new Set(records.map(item => item.context.occurrenceId)).size, 5, 'one footprint per click occurrence');
    assert.equal(records.at(-1).context.experienceId, destination.id);
    assert.equal(records.at(-1).context.fromExperienceId, local.id);
    assert.ok(records.every(item => item.context.assessmentScope.language === language &&
      item.context.assessmentScope.originExperienceId === local.id));
    assert.equal(env.snapshot().context.currentExperience, local.id, 'no destination Session or automatic NEXT');
    env.button('location-answer', 'grounded-location').click(); assertProgress(env, 3);
    assert.equal(env.records().filter(item => item.source === 'green-pass-contract').length, 1, 'closure remains unique');
    // Another explicit Skill, then Preparing restores the retained Shopping circuit.
    env.move({currentExperienceId: local.id, questionWord: 'which'});
    assert.equal(await env.select(local.thinkingMind.find(item => item.questionWord === 'which')), true);
    assert.notStrictEqual(env.snapshot().session, session); assert.equal(env.mount(), false);
    env.move({currentExperienceId: destination.id, questionWord: 'where'});
    assert.equal(await env.select(question(destination)), true);
    assert.strictEqual(env.snapshot().session, session); assert.equal(env.mount(), true); assertProgress(env, 3);
    assert.match(env.doc.getElementById('whereAssessmentPanel').querySelector('.where-probe-feedback').textContent, /GREEN PASS/,
      'retained recovery restores presentation feedback without replaying an Attempt');

    const assisted = await environment(mode, language, 'where-audio-' + mode + '-' + language);
    assert.equal(await assisted.select(question(local)), true); assert.equal(assisted.mount(), true);
    assisted.button('spatial-function', 'location').click();
    assisted.button('location-answer', 'grounded-location').click(); assertProgress(assisted, 2);
    assisted.move({currentExperienceId: destination.id}); assert.equal(assisted.mount(), true);
    const answer = grounding.records[1].answer[language];
    assert.equal(assisted.live.captureAudio('unrelated sentence', language), null);
    assert.equal(assisted.live.observeAudio({}), false, 'forged onstart rejected');
    const delayed = assisted.live.captureAudio(answer, language);
    assisted.move({currentExperienceId: local.id}); assert.equal(assisted.live.observeAudio(delayed), false);
    assisted.move({currentExperienceId: destination.id});
    assisted.doc.getElementById('whereAssessmentPanel').querySelectorAll('.where-probe-audio')[1].click();
    assert.equal(assisted.records().length, 2); assisted.utterances.at(-1).onstart();
    assert.equal(assisted.records().length, 2, 'observed audio still creates no Attempt');
    assisted.button('location-answer', 'grounded-location').click(); assertProgress(assisted, 2);
    assert.equal(assisted.records().at(-1).context.support, 'audio');
    assert.equal(assisted.mount(), true);
    assisted.button('location-answer', 'grounded-location').click(); assertProgress(assisted, 2);
    assert.equal(assisted.records().at(-1).context.support, 'audio', 'remount/reclick cannot erase support');
    const oldAudio = assisted.live.captureAudio(answer, language);
    assisted.box.SIYAYOVerbExplorerLearnerIdentitySource.adopt('foreign-audio');
    assert.equal(assisted.live.observeAudio(oldAudio), false, 'late audio cannot cross identities');

    // Audio from the existing Living Lines uses the same native observation hook.
    const localAudio = await environment(mode, language, 'where-local-audio-' + mode + '-' + language);
    assert.equal(await localAudio.select(question(local)), true); assert.equal(localAudio.mount(), true);
    const spoken = question(local).dialogueForms.present.affirmative.response[language];
    localAudio.box.speakText(spoken, language); localAudio.utterances.at(-1).onstart();
    assert.equal(localAudio.records().length, 0);
    localAudio.button('spatial-function', 'location').click(); assertProgress(localAudio, 1);
    localAudio.button('location-answer', 'grounded-location').click(); assertProgress(localAudio, 1);
    assert.equal(localAudio.records().at(-1).context.support, 'audio');
    localAudio.move({currentExperienceId: destination.id}); assert.equal(localAudio.mount(), true);
    localAudio.button('location-answer', 'grounded-location').click(); assertProgress(localAudio, 2);
    assert.equal(localAudio.records().at(-1).context.support, 'none', 'local audio is not fabricated as transfer listening');
    const anotherLanguage = language === 'en' ? 'es' : 'en';
    localAudio.move({currentExperienceId: local.id, experienceLanguage: anotherLanguage});
    assert.equal(await localAudio.select(question(local)), true); assert.equal(localAudio.mount(), true); assertProgress(localAudio, 0);
    localAudio.button('spatial-function', 'location').click();
    localAudio.button('location-answer', 'grounded-location').click(); assertProgress(localAudio, 2);
    assert.equal(localAudio.records().at(-1).context.support, 'none', 'another language owns its new Session, without borrowed support/evidence');
  }
  const fresh = await environment('Node', 'en', 'fresh-destination');
  fresh.move({currentExperienceId: destination.id});
  assert.equal(await fresh.select(question(destination)), false);
  assert.equal(fresh.snapshot(), null); assert.equal(fresh.mount(), false); assert.equal(fresh.records().length, 0);
  const bad = clone(grounding); delete bad.records[0].nonLocationAnswer.en;
  const malformed = await environment('Node', 'en', 'malformed-grounding', bad);
  assert.equal(await malformed.select(question(local)), true); assert.equal(malformed.mount(), false);
  assert.equal(malformed.records().length, 0, 'missing alternative fails closed before presentation');
  console.log('PASS — six EN/ES/PT Node/browser-VM live-panel circuits use production startup and click -> Result -> Evidence -> Attempt -> Coordinator/Cycle; 0/3, 1/3 and 2/3 WAIT, independent transfer 3/3.');
  console.log('PASS — failed answers, stale buttons, identity/language/location drift and fresh destination startup do not fabricate competence; one footprint per occurrence and one closure per scope, with retained Shopping recovery.');
  console.log('PASS — native speech onstart, not request/error, observes audio; assistance remains WAIT across remount/reclick and cannot cross identity. No automatic NEXT or human learner claim.');
}
main().catch(error => {console.error(error); process.exitCode = 1;});
