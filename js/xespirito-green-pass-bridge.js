(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./green-pass-profile.js') : root.GreenPassProfile
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.XespiritoGreenPassBridge = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (GreenPassProfile) {
  if (!GreenPassProfile) throw new Error('GreenPassProfile is required.');

  function confidenceFromSignal(signal) {
    if (!signal) return 0.4;
    if (signal.status === 'requires-reinforcement') return 0.25;
    if (signal.status === 'observed-conflict') return 0.45;
    return 0.7;
  }

  function attemptFromSignal(signal, context = {}) {
    return {
      language: context.language || 'en',
      chapter: context.chapter || 'verbs',
      skill: signal.piece || 'verb-function',
      correct: false,
      confidence: confidenceFromSignal(signal),
      source: 'xespirito-evidence',
      occurrences: Number(signal.occurrences) || 1
    };
  }

  function applyEvidence(profile, interpretation, context = {}) {
    if (!profile || typeof profile !== 'object') throw new TypeError('A learner profile is required.');
    if (!interpretation || typeof interpretation !== 'object') throw new TypeError('An Xespirito evidence interpretation is required.');

    let next = profile;
    for (const signal of interpretation.signals || []) {
      const attempt = attemptFromSignal(signal, context);
      const repetitions = Math.max(1, attempt.occurrences);
      for (let index = 0; index < repetitions; index += 1) {
        next = GreenPassProfile.recordAttempt(next, attempt);
      }
    }

    return {
      profile: next,
      recommendation: GreenPassProfile.recommendNext(next),
      appliedSignals: (interpretation.signals || []).length,
      sourceEvidenceCount: Number(interpretation.evidenceCount) || 0
    };
  }

  return { applyEvidence, attemptFromSignal, confidenceFromSignal };
});
