(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./adaptive-attempt-loop.js') : root.AdaptiveAttemptLoop,
    typeof module === 'object' && module.exports ? require('./green-pass-profile.js') : root.GreenPassProfile,
    typeof module === 'object' && module.exports ? require('./adaptive-advance-selector.js') : root.AdaptiveAdvanceSelector
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveLearningCycle = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (AdaptiveAttemptLoop, GreenPassProfile, AdaptiveAdvanceSelector) {
  function submit(greenProfile, session, attempt = {}, context = {}) {
    if (!GreenPassProfile || typeof GreenPassProfile.recordAttempt !== 'function') {
      throw new TypeError('Green Pass profile API is required.');
    }

    const traceEntry = AdaptiveAttemptLoop.recordAttempt(session, attempt);
    const greenAttempt = AdaptiveAttemptLoop.toGreenPassAttempt(session, attempt);
    const nextGreenProfile = GreenPassProfile.recordAttempt(greenProfile, greenAttempt);
    const recommendation = GreenPassProfile.recommendNext(nextGreenProfile);
    const currentExperience = session.decision.experienceId || context.currentExperience || null;

    session.trace.push({
      archetype: 'patita',
      event: 'green-pass-evaluated',
      experienceId: currentExperience,
      skill: greenAttempt.skill,
      status: nextGreenProfile.bySkill[GreenPassProfile.skillKey(greenAttempt)]?.status || 'observing',
      greenPass: nextGreenProfile.greenPass,
      nextAction: recommendation.action
    });

    let advanceSelection = null;
    if (recommendation.action === 'advance') {
      if (!AdaptiveAdvanceSelector || typeof AdaptiveAdvanceSelector.select !== 'function') {
        throw new TypeError('Adaptive advance selector API is required for Green Pass advance.');
      }

      advanceSelection = AdaptiveAdvanceSelector.select(recommendation, {
        ...context,
        currentExperience
      });

      session.trace.push({
        archetype: 'patita',
        event: 'adaptive-next-selected',
        fromExperience: currentExperience,
        experienceId: advanceSelection.experienceId,
        status: advanceSelection.status,
        entryVerb: advanceSelection.entryVerb || null
      });
    }

    return {
      greenProfile: nextGreenProfile,
      attempt: greenAttempt,
      traceEntry,
      recommendation,
      advanceSelection,
      nextContext: {
        ...context,
        language: greenAttempt.language,
        chapter: greenAttempt.chapter,
        skill: greenAttempt.skill,
        currentExperience: advanceSelection?.status === 'selected'
          ? advanceSelection.experienceId
          : currentExperience
      }
    };
  }

  return { submit };
});
