(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./adaptive-attempt-loop.js') : root.AdaptiveAttemptLoop,
    typeof module === 'object' && module.exports ? require('./green-pass-profile.js') : root.GreenPassProfile
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveLearningCycle = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (AdaptiveAttemptLoop, GreenPassProfile) {
  function submit(greenProfile, session, attempt = {}, context = {}) {
    if (!GreenPassProfile || typeof GreenPassProfile.recordAttempt !== 'function') {
      throw new TypeError('Green Pass profile API is required.');
    }

    const traceEntry = AdaptiveAttemptLoop.recordAttempt(session, attempt);
    const greenAttempt = AdaptiveAttemptLoop.toGreenPassAttempt(session, attempt);
    const nextGreenProfile = GreenPassProfile.recordAttempt(greenProfile, greenAttempt);
    const recommendation = GreenPassProfile.recommendNext(nextGreenProfile);

    session.trace.push({
      archetype: 'patita',
      event: 'green-pass-evaluated',
      experienceId: session.decision.experienceId || null,
      skill: greenAttempt.skill,
      status: nextGreenProfile.bySkill[GreenPassProfile.skillKey(greenAttempt)]?.status || 'observing',
      greenPass: nextGreenProfile.greenPass,
      nextAction: recommendation.action
    });

    return {
      greenProfile: nextGreenProfile,
      attempt: greenAttempt,
      traceEntry,
      recommendation,
      nextContext: {
        ...context,
        language: greenAttempt.language,
        chapter: greenAttempt.chapter,
        skill: greenAttempt.skill,
        currentExperience: session.decision.experienceId || context.currentExperience || null
      }
    };
  }

  return { submit };
});
