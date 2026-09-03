(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./adaptive-learning-router.js') : root.AdaptiveLearningRouter
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptivePedagogicalOrchestrator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (AdaptiveLearningRouter) {
  function decide(profileApi, profile, context = {}) {
    if (!profileApi || typeof profileApi.recommend !== 'function') {
      throw new TypeError('Adaptive evidence profile API is required.');
    }
    if (!AdaptiveLearningRouter || typeof AdaptiveLearningRouter.route !== 'function') {
      throw new TypeError('Adaptive learning router is required.');
    }

    const recommendation = profileApi.recommend(profile);

    if (recommendation.action === 'reinforce') {
      const latest = profile.confirmedReinforcements[profile.confirmedReinforcements.length - 1] || {};
      const evidenceContext = latest.context || {};
      const skill = evidenceContext.skill || context.skill || 'verb-function';
      const language = evidenceContext.language || context.language || 'en';
      const chapter = evidenceContext.chapter || context.chapter || 'verbs';

      return AdaptiveLearningRouter.route({
        action: 'reinforce',
        skill: `${language}:${chapter}:${skill}`
      }, context);
    }

    if (recommendation.action === 'review-pattern') {
      return {
        action: 'continue-assessment',
        experienceId: context.currentExperience || 'shopping-for-dinner',
        focus: 'contrast-review',
        reason: recommendation.reason
      };
    }

    return {
      action: 'continue-assessment',
      experienceId: context.currentExperience || 'shopping-for-dinner',
      focus: 'assessment',
      reason: recommendation.reason
    };
  }

  return { decide };
});
