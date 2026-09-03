(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./adaptive-pedagogical-orchestrator.js') : root.AdaptivePedagogicalOrchestrator
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveAttemptLoop = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (AdaptivePedagogicalOrchestrator) {
  function begin(profileApi, profile, context = {}) {
    const decision = AdaptivePedagogicalOrchestrator.decide(profileApi, profile, context);
    return {
      decision,
      trace: [{
        archetype: 'patita',
        event: 'experience-selected',
        experienceId: decision.experienceId || null,
        focus: decision.focus || null,
        skill: decision.skill || context.skill || null
      }]
    };
  }

  function recordAttempt(session = {}, attempt = {}) {
    if (!session || !Array.isArray(session.trace) || !session.decision) {
      throw new TypeError('A valid adaptive attempt session is required.');
    }

    const entry = {
      archetype: 'patita',
      event: 'learner-attempt',
      experienceId: session.decision.experienceId || null,
      skill: attempt.skill || session.decision.skill || null,
      language: attempt.language || session.decision.language || null,
      correct: attempt.correct === true,
      confidence: Number.isFinite(attempt.confidence) ? attempt.confidence : null
    };

    session.trace.push(entry);
    return entry;
  }

  function toGreenPassAttempt(session = {}, attempt = {}) {
    if (!session.decision) throw new TypeError('Adaptive attempt decision is required.');
    return {
      language: attempt.language || session.decision.language || 'en',
      chapter: attempt.chapter || session.decision.chapter || 'verbs',
      skill: attempt.skill || session.decision.skill || 'verb-function',
      correct: attempt.correct === true,
      confidence: Number.isFinite(attempt.confidence) ? attempt.confidence : 0.5,
      source: 'adaptive-experience-attempt',
      experienceId: session.decision.experienceId || null
    };
  }

  return { begin, recordAttempt, toGreenPassAttempt };
});
