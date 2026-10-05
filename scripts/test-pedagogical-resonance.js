const assert = require('node:assert/strict');
const Resonance = require('../js/pedagogical-resonance.js');
const corpus = require('../data/learning/experience-seeds.json');

const experiences = corpus.items;
const modalRanking = Resonance.rank(experiences, 'modal-core');
assert.ok(modalRanking.length >= 4);
assert.ok(modalRanking[0].score > 0);
assert.equal(modalRanking[0].skill, 'modal-core');
assert.ok(Object.hasOwn(modalRanking[0], 'contributions'));
assert.ok(Object.hasOwn(modalRanking[0], 'matched'));
assert.ok(['weak', 'moderate', 'strong'].includes(modalRanking[0].evidenceStrength));

const modal = Resonance.select(experiences, 'modal-core');
assert.equal(modal.status, 'matched');
assert.ok(modal.experienceId);
assert.ok(modal.score >= 1);

const auxiliaryBe = Resonance.select(experiences, 'auxiliary-be');
assert.equal(auxiliaryBe.status, 'matched');
assert.ok(auxiliaryBe.score > 0);

const which = Resonance.select(experiences, 'which.use.determiner');
assert.equal(which.status, 'matched');
assert.equal(which.experienceId, 'shopping-for-dinner');
assert.equal(which.skill, 'which.use.determiner');
assert.deepEqual(which.matched.questionWords, ['which']);
assert.deepEqual(which.matched.languagePatterns, ['choose']);
assert.deepEqual(which.matched.perspectives, ['debating']);
assert.equal(which.matched.linkedVerbs.length, 0, 'choose may be present in the sentence bridge without being a linked verb');
assert.equal(which.score, 5);
assert.equal(which.evidenceStrength, 'moderate');

const noWhichOpportunity = Resonance.scoreExperience({
  id: 'no-which-opportunity',
  links: { verbs: ['buy'] },
  thinkingMind: [{ questionWord: 'what' }],
  perspectives: { describing: {} },
  note: 'We buy fresh cheese.'
}, 'which.use.determiner');
assert.equal(noWhichOpportunity.score, 0);
assert.deepEqual(noWhichOpportunity.matched.questionWords, []);
assert.deepEqual(noWhichOpportunity.matched.languagePatterns, []);
assert.deepEqual(noWhichOpportunity.matched.perspectives, []);

const unknown = Resonance.select(experiences, 'unknown-skill');
assert.equal(unknown.status, 'matched');
assert.equal(unknown.skill, 'unknown-skill');
assert.ok(unknown.matched.questionWords.length || unknown.matched.perspectives.length);

for (const [skill, questionWord] of [
  ['what.use.object-question','what'],
  ['why.use.contextual-reason','why']
]) {
  const signal = Resonance.skillSignals[skill];
  assert.ok(signal, skill+' must have an explicit assessment resonance signal');
  assert.deepEqual(signal.questionWords, [questionWord]);
  assert.deepEqual(signal.verbs, []);
  assert.deepEqual(signal.perspectives, []);
  const probe = Resonance.scoreExperience({
    id:'assessment-'+questionWord,
    links:{verbs:[]},
    thinkingMind:[{questionWord}],
    perspectives:{describing:{}}
  }, skill);
  assert.deepEqual(probe.matched.questionWords,[questionWord]);
  assert.deepEqual(probe.matched.perspectives,[],'assessment resonance must not inherit verb-function perspectives');
  assert.equal(probe.score,Resonance.weights.questionWord);
}
const whatNoFallback = Resonance.scoreExperience({
  id:'what-no-fallback',
  links:{verbs:[]},
  thinkingMind:[{questionWord:'how'}],
  perspectives:{describing:{},narrating:{}}
}, 'what.use.object-question');
assert.equal(whatNoFallback.score,0,'WHAT assessment must not fall through to verb-function HOW/describing resonance');
const whyNoFallback = Resonance.scoreExperience({
  id:'why-no-fallback',
  links:{verbs:[]},
  thinkingMind:[{questionWord:'what'}],
  perspectives:{describing:{},narrating:{}}
}, 'why.use.contextual-reason');
assert.equal(whyNoFallback.score,0,'WHY assessment must not inherit verb-function WHAT/describing resonance');

const impossible = Resonance.select(experiences, 'modal-core', { minimumScore: 99 });
assert.equal(impossible.status, 'no-resonance');
assert.equal(impossible.minimumScore, 99);
assert.ok(impossible.bestCandidate);

const empty = Resonance.select([], 'modal-core');
assert.equal(empty.status, 'no-resonance');
assert.equal(empty.bestCandidate, null);

const exactToken = Resonance.scoreExperience({ id: 'token-test', links: { verbs: [] }, thinkingMind: [], perspectives: {}, note: 'shoulder' }, 'modal-core');
assert.equal(exactToken.contributions.languagePattern, 0, 'should must not match shoulder');

const canonicalQuestionWordSkills = {
  'what.identify.information-gap': 'what',
  'where.identify.place': 'where',
  'when.identify.time': 'when',
  'who.identify.person': 'who',
  'why.identify.reason': 'why',
  'how.identify.manner': 'how',
  'how-much.identify.amount': 'how-much',
  'how-many.identify.count': 'how-many',
  'whose.identify.possession': 'whose',
  'whom.identify.object-person': 'whom',
  'how-long.identify.duration-length': 'how-long',
  'how-far.identify.distance': 'how-far',
  'how-often.identify.frequency': 'how-often',
  'how-old.identify.age': 'how-old' // explicitly declared practical extension
};
assert.deepEqual(Resonance.questionWordSkillSignals, canonicalQuestionWordSkills);
for (const [skill, questionWord] of Object.entries(canonicalQuestionWordSkills)) {
  const probe = Resonance.scoreExperience({
    id: `qw-${questionWord}-probe`,
    links: { verbs: [] },
    thinkingMind: [{ questionWord }],
    perspectives: {}
  }, skill);
  assert.deepEqual(probe.matched.questionWords, [questionWord]);
  assert.equal(probe.score, Resonance.weights.questionWord);
  assert.equal(probe.evidenceStrength, 'weak', 'question presence is only an opportunity signal, never learner evidence');
}

console.log('Pedagogical resonance explainability tests passed.');
console.log('WHICH opportunity resonance: PASS — Shopping for a Nice Dinner exposes which + choose + debating without fabricating learner evidence.');
