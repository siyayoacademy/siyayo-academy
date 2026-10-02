(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./adaptive-learning-router.js') : root.AdaptiveLearningRouter,
    typeof module === 'object' && module.exports ? require('./adaptive-evidence-view.js') : root.AdaptiveEvidenceView,
    typeof module === 'object' && module.exports ? require('./adaptive-assessment-scope.js') : root.AdaptiveAssessmentScope
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptivePedagogicalOrchestrator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (AdaptiveLearningRouter, AdaptiveEvidenceView, AdaptiveAssessmentScope) {
  function preserveContextSkill(decision, context = {}) {
    if (typeof context.skill === 'string' && context.skill.trim()) {
      decision.skill = context.skill.trim();
    }
    if (context.assessmentScope) {
      if (!AdaptiveAssessmentScope || !AdaptiveAssessmentScope.valid(context.assessmentScope)) throw new TypeError('Valid assessment scope required.');
      decision.assessmentScope = context.assessmentScope;
      decision.language = context.assessmentScope.language;
      decision.learnerId = context.assessmentScope.learnerId;
    }
    return decision;
  }

  function priorEvidenceSnapshot(profile, context = {}) {
    if (!AdaptiveEvidenceView || typeof AdaptiveEvidenceView.bySkill !== 'function') return Object.freeze([]);
    if (typeof context.skill !== 'string' || !context.skill.trim()) return Object.freeze([]);
    return AdaptiveEvidenceView.bySkill(profile, context.skill.trim(), context.assessmentScope);
  }

  function withPriorEvidence(decision, priorEvidence) {
    decision.priorEvidence = priorEvidence;
    return decision;
  }

  function decide(profileApi, profile, context = {}) {
    if (!profileApi || typeof profileApi.recommend !== 'function') {
      throw new TypeError('Adaptive evidence profile API is required.');
    }
    if (!AdaptiveLearningRouter || typeof AdaptiveLearningRouter.route !== 'function') {
      throw new TypeError('Adaptive learning router is required.');
    }

    // Snapshot only evidence already present when this Decision is created.
    // It is informational: it does not choose action, Experience, Skill, or progression.
    if (context.assessmentScope) {
      if (!AdaptiveAssessmentScope) throw new TypeError('Assessment scope authority required.');
      profile = AdaptiveAssessmentScope.profileView(profile, context.assessmentScope);
      if (!profile) throw new TypeError('Learner-owned assessment profile required.');
    }
    const priorEvidence = priorEvidenceSnapshot(profile, context);
    const recommendation = profileApi.recommend(profile);

    if (recommendation.action === 'reinforce') {
      const latest = profile.confirmedReinforcements[profile.confirmedReinforcements.length - 1] || {};
      const evidenceContext = latest.context || {};
      const skill = evidenceContext.skill || context.skill || 'verb-function';
      const language = evidenceContext.language || context.language || 'en';
      const chapter = evidenceContext.chapter || context.chapter || 'verbs';

      return withPriorEvidence(preserveContextSkill(AdaptiveLearningRouter.route({
        action: 'reinforce',
        skill: `${language}:${chapter}:${skill}`
      }, context), context), priorEvidence);
    }

    if (recommendation.action === 'review-pattern') {
      return withPriorEvidence(preserveContextSkill({
        action: 'continue-assessment',
        experienceId: context.currentExperience || 'shopping-for-dinner',
        focus: 'contrast-review',
        reason: recommendation.reason
      }, context), priorEvidence);
    }

    return withPriorEvidence(preserveContextSkill({
      action: 'continue-assessment',
      experienceId: context.currentExperience || 'shopping-for-dinner',
      focus: 'assessment',
      reason: recommendation.reason
    }, context), priorEvidence);
  }

  return { decide };
});
