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

    let evidencePacket = null;
    let contractEvaluation = null;
    let greenPassComparison = null;
    if (context.passContract) {
      if (!AdaptiveAttemptLoop || typeof AdaptiveAttemptLoop.toEvidencePacket !== 'function') {
        throw new TypeError('Adaptive evidence packet bridge is required for Pass Contract evaluation.');
      }
      if (!GreenPassProfile || typeof GreenPassProfile.evaluateContract !== 'function') {
        throw new TypeError('Green Pass contract evaluator API is required.');
      }

      evidencePacket = AdaptiveAttemptLoop.toEvidencePacket(session, attempt);
      const evidencePackets = Array.isArray(context.evidencePackets)
        ? context.evidencePackets.concat(evidencePacket)
        : [evidencePacket];
      contractEvaluation = GreenPassProfile.evaluateContract(context.passContract, evidencePackets);
      const legacyGreenPass = nextGreenProfile.greenPass === true;
      const contractGreenPass = contractEvaluation.status === 'GREEN_PASS';
      greenPassComparison = {
        legacyGreenPass,
        contractGreenPass,
        agreement: legacyGreenPass === contractGreenPass,
        operationalAuthority: 'legacy'
      };

      session.trace.push({
        archetype: 'patita',
        event: 'green-pass-contract-evaluated',
        experienceId: currentExperience,
        skill: evidencePacket.skill,
        status: contractEvaluation.status,
        satisfied: contractEvaluation.satisfied
      });

      session.trace.push({
        archetype: 'patita',
        event: 'green-pass-comparison',
        experienceId: currentExperience,
        skill: evidencePacket.skill,
        legacyGreenPass,
        contractGreenPass,
        agreement: greenPassComparison.agreement,
        operationalAuthority: greenPassComparison.operationalAuthority
      });
    }

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
      evidencePacket,
      contractEvaluation,
      greenPassComparison,
      nextContext: {
        ...context,
        evidencePackets: evidencePacket
          ? (Array.isArray(context.evidencePackets) ? context.evidencePackets.concat(evidencePacket) : [evidencePacket])
          : context.evidencePackets,
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
