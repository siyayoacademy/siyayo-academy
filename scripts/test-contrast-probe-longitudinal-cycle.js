const assert = require('assert');
const Profile = require('../js/adaptive-evidence-profile');
const ProbeDefinition = require('../js/adaptive-contrast-probe-definition');
const ProbeResult = require('../js/adaptive-contrast-probe-result');
const Verifier = require('../js/interference-contrast-verifier');
const Bridge = require('../js/interference-adaptive-bridge');

const K = 'pt:esquisito:cross-language-transfer:es';
const pattern = Object.freeze({key:K,occurrences:2});
const profile = Profile.createProfile('learner-contrast-cycle');

// A(K): longitudinal history already contains a review-required repeated pattern.
Profile.record(profile,{
  source:'xespirito-interference-evidence-gate',
  status:'pattern-observed',
  repeated:[pattern],
  requiresReview:true,
  conflict:false,
  requiresReinforcement:false,
  context:{confirmed:false}
});
assert.strictEqual(Profile.recommend(profile).action,'review-pattern');

// The challenge authority exists before the learner event.
const definition = ProbeDefinition.create(
  Object.freeze({pattern,experienceId:'shopping-for-dinner'}),
  {
    expectedLanguage:'pt',
    targetMeaning:'strange',
    alternatives:[
      {id:'pt-esquisito',language:'pt',form:'esquisito',meaning:'strange'},
      {id:'es-exquisito',language:'es',form:'exquisito',meaning:'delicious'},
      {id:'es-raro',language:'es',form:'raro',meaning:'strange'}
    ]
  }
);
assert.ok(definition);

const learnerEvent = Object.freeze({
  observed:true,
  actor:'learner',
  type:'learner-response',
  source:'choice-select',
  occurrenceId:'choice-select:contrast:1',
  experienceId:'shopping-for-dinner',
  choice:'pt-esquisito'
});

const probe = ProbeResult.evaluate(definition,learnerEvent);
assert.ok(probe);
assert.strictEqual(probe.meaningCorrect,true);
assert.strictEqual(probe.formCorrect,true);

const verification = Verifier.verify(pattern,probe);
assert.strictEqual(verification.status,'contrast-cleared');
assert.strictEqual(verification.probeCompleted,true);
assert.strictEqual(verification.reinforcementConfirmed,false);
assert.deepStrictEqual(verification.repeated,[{key:K,occurrences:2}]);

Bridge.apply(Profile,profile,verification,{
  occurrenceId:probe.occurrenceId,
  experienceId:'shopping-for-dinner'
});

// History remains; pending review for K is cleared by the later grounded B(K).
assert.strictEqual(profile.reinforcementCandidates.length,1);
assert.strictEqual(profile.observations.length,2);
assert.strictEqual(Profile.recommend(profile).action,'observe');
assert.strictEqual(profile.observations[1].repeated[0].key,K);
assert.strictEqual(profile.observations[1].context.occurrenceId,probe.occurrenceId);

console.log('Grounded contrast probe longitudinal cycle: PASS');
