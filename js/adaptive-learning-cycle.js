(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./adaptive-attempt-loop.js') : root.AdaptiveAttemptLoop,
    typeof module === 'object' && module.exports ? require('./green-pass-profile.js') : root.GreenPassProfile,
    typeof module === 'object' && module.exports ? require('./adaptive-advance-selector.js') : root.AdaptiveAdvanceSelector,
    typeof module === 'object' && module.exports ? require('../data/learning/green-pass-authority.json') : root.GreenPassAuthorityPolicy,
    typeof module === 'object' && module.exports ? require('./adaptive-learning-router.js') : root.AdaptiveLearningRouter,
    typeof module === 'object' && module.exports ? require('./adaptive-wait-classifier.js') : root.AdaptiveWaitClassifier,
    typeof module === 'object' && module.exports ? require('./adaptive-agency-resume-context.js') : root.AdaptiveAgencyResumeContext
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveLearningCycle = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (AdaptiveAttemptLoop, GreenPassProfile, AdaptiveAdvanceSelector, GreenPassAuthorityPolicy, AdaptiveLearningRouter, AdaptiveWaitClassifier, AdaptiveAgencyResumeContext) {
  function resolveAuthority(context = {}, skill = null) {
    if (!context.passContract) return 'legacy';
    if (context.greenPassAuthority === 'contract') return 'contract';
    const policy = context.greenPassAuthorityPolicy || GreenPassAuthorityPolicy;
    if (!policy || !Array.isArray(policy.contractAuthoritySkills)) return 'legacy';
    const skillId = skill || context.skill || null;
    return skillId && policy.contractAuthoritySkills.includes(skillId) ? 'contract' : (policy.fallbackAuthority || policy.defaultAuthority || 'legacy');
  }

  function submit(greenProfile, session, attempt = {}, context = {}) {
    if (!GreenPassProfile || typeof GreenPassProfile.recordAttempt !== 'function') throw new TypeError('Green Pass profile API is required.');
    const traceEntry = AdaptiveAttemptLoop.recordAttempt(session, attempt);
    const greenAttempt = AdaptiveAttemptLoop.toGreenPassAttempt(session, attempt);
    const nextGreenProfile = GreenPassProfile.recordAttempt(greenProfile, greenAttempt);
    const legacyRecommendation = GreenPassProfile.recommendNext(nextGreenProfile);
    const currentExperience = session.decision.experienceId || context.currentExperience || null;
    const operationalAuthority = resolveAuthority(context, greenAttempt.skill);

    let evidencePacket = null;
    let contractEvaluation = null;
    let greenPassComparison = null;
    if (context.passContract) {
      if (!AdaptiveAttemptLoop || typeof AdaptiveAttemptLoop.toEvidencePacket !== 'function') throw new TypeError('Adaptive evidence packet bridge is required for Pass Contract evaluation.');
      if (!GreenPassProfile || typeof GreenPassProfile.evaluateContract !== 'function') throw new TypeError('Green Pass contract evaluator API is required.');
      evidencePacket = AdaptiveAttemptLoop.toEvidencePacket(session, attempt);
      const evidencePackets = Array.isArray(context.evidencePackets) ? context.evidencePackets.concat(evidencePacket) : [evidencePacket];
      contractEvaluation = GreenPassProfile.evaluateContract(context.passContract, evidencePackets);
      const legacyGreenPass = nextGreenProfile.greenPass === true;
      const contractGreenPass = contractEvaluation.status === 'GREEN_PASS';
      greenPassComparison = { legacyGreenPass, contractGreenPass, agreement: legacyGreenPass === contractGreenPass, operationalAuthority };
      session.trace.push({ archetype: 'patita', event: 'green-pass-contract-evaluated', experienceId: currentExperience, skill: evidencePacket.skill, status: contractEvaluation.status, satisfied: contractEvaluation.satisfied });
      session.trace.push({ archetype: 'patita', event: 'green-pass-comparison', experienceId: currentExperience, skill: evidencePacket.skill, legacyGreenPass, contractGreenPass, agreement: greenPassComparison.agreement, operationalAuthority });
    }

    const contractEligible = operationalAuthority === 'contract' && contractEvaluation?.status === 'GREEN_PASS';
    let recommendation = legacyRecommendation;
    if (operationalAuthority === 'contract') {
      recommendation = contractEligible
        ? { ...legacyRecommendation, action: 'continue-assessment', authority: 'contract', reason: 'green-pass-eligible-awaiting-route', skill: greenAttempt.skill }
        : { ...legacyRecommendation, action: 'continue-assessment', authority: 'contract', reason: 'waiting-for-contract-evidence', skill: greenAttempt.skill };
    }

    session.trace.push({ archetype: 'patita', event: 'green-pass-evaluated', experienceId: currentExperience, skill: greenAttempt.skill, status: nextGreenProfile.bySkill[GreenPassProfile.skillKey(greenAttempt)]?.status || 'observing', greenPass: nextGreenProfile.greenPass, contractEligible, nextAction: recommendation.action, operationalAuthority });

    let routeInspection = null;
    let waitClassification = null;
    let resumeEvaluation = null;
    if (operationalAuthority === 'contract') {
      if (!AdaptiveLearningRouter || typeof AdaptiveLearningRouter.route !== 'function') throw new TypeError('Adaptive learning router API is required for contract route inspection.');
      routeInspection = AdaptiveLearningRouter.route(recommendation, {
        ...context,
        currentExperience,
        contractEligible,
        skill: greenAttempt.skill,
        language: greenAttempt.language,
        chapter: greenAttempt.chapter
      });
      session.trace.push({
        archetype: 'jaguar',
        event: 'adaptive-route-inspected',
        experienceId: currentExperience,
        skill: greenAttempt.skill,
        contractEligible,
        action: routeInspection.action,
        focus: routeInspection.focus || null,
        reason: routeInspection.reason || null,
        resonanceStatus: routeInspection.resonance?.status || null
      });

      if (AdaptiveWaitClassifier && typeof AdaptiveWaitClassifier.classifyWait === 'function') {
        waitClassification = AdaptiveWaitClassifier.classifyWait(routeInspection);
        if (waitClassification) {
          session.trace.push({
            archetype: 'patita',
            event: 'adaptive-wait-classified',
            experienceId: currentExperience,
            skill: greenAttempt.skill,
            state: waitClassification.state,
            cause: waitClassification.cause,
            contractEligible,
            routeAction: routeInspection.action,
            routeReason: routeInspection.reason || null,
            resonanceStatus: routeInspection.resonance?.status || null
          });
        }
      }

      if (waitClassification && context.learnerEvent && context.resumeState && AdaptiveAgencyResumeContext && typeof AdaptiveAgencyResumeContext.evaluateAgencyResumeContext === 'function') {
        resumeEvaluation = AdaptiveAgencyResumeContext.evaluateAgencyResumeContext(
          waitClassification,
          context.learnerEvent,
          { currentExperience },
          context.resumeState
        );
        session.trace.push({
          archetype: 'patita',
          event: 'adaptive-resume-evaluated',
          experienceId: currentExperience,
          skill: greenAttempt.skill,
          agencyStatus: resumeEvaluation?.agencyEvaluation?.status || null,
          releaseStatus: resumeEvaluation?.releaseEvaluation?.status || null,
          resumeStatus: resumeEvaluation?.resumeEligibility?.status || null,
          resumeContextStatus: resumeEvaluation?.resumeContext?.status || null
        });
      }
    }

    let advanceSelection = null;
    if (recommendation.action === 'advance') {
      if (!AdaptiveAdvanceSelector || typeof AdaptiveAdvanceSelector.select !== 'function') throw new TypeError('Adaptive advance selector API is required for Green Pass advance.');
      advanceSelection = AdaptiveAdvanceSelector.select(recommendation, { ...context, currentExperience });
      session.trace.push({ archetype: 'patita', event: 'adaptive-next-selected', fromExperience: currentExperience, experienceId: advanceSelection.experienceId, status: advanceSelection.status, entryVerb: advanceSelection.entryVerb || null });
    }

    return {
      greenProfile: nextGreenProfile,
      attempt: greenAttempt,
      traceEntry,
      recommendation,
      legacyRecommendation,
      operationalAuthority,
      contractEligible,
      routeInspection,
      waitClassification,
      resumeEvaluation,
      advanceSelection,
      evidencePacket,
      contractEvaluation,
      greenPassComparison,
      nextContext: {
        ...context,
        evidencePackets: evidencePacket ? (Array.isArray(context.evidencePackets) ? context.evidencePackets.concat(evidencePacket) : [evidencePacket]) : context.evidencePackets,
        language: greenAttempt.language,
        chapter: greenAttempt.chapter,
        skill: greenAttempt.skill,
        currentExperience: advanceSelection?.status === 'selected' ? advanceSelection.experienceId : currentExperience
      }
    };
  }

  return { submit, resolveAuthority };
});
