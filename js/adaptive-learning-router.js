(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./pedagogical-resonance.js') : root.PedagogicalResonance
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveLearningRouter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (PedagogicalResonance) {
  const routes = {
    'modal-core': { experienceId: 'shopping-for-dinner', focus: 'debating', questionWord: 'which' },
    'auxiliary-have': { experienceId: 'after-dinner-conversation', focus: 'narrating', questionWord: 'what' },
    'auxiliary-be': { experienceId: 'preparing-dinner', focus: 'describing', questionWord: 'what' },
    'finite-carrier': { experienceId: 'preparing-dinner', focus: 'debating', questionWord: 'when' },
    'auxiliary-chain': { experienceId: 'preparing-dinner', focus: 'narrating', questionWord: 'how' },
    'verb-function': { experienceId: 'having-dinner', focus: 'describing', questionWord: 'how' }
  };

  function parseSkill(value = '') {
    const parts = String(value).split(':').filter(Boolean);
    return {
      language: parts.length >= 3 ? parts[0] : null,
      chapter: parts.length >= 3 ? parts[1] : null,
      skill: parts.length >= 3 ? parts.slice(2).join(':') : (parts[0] || 'verb-function')
    };
  }

  function route(recommendation = {}, context = {}) {
    if (recommendation.action === 'advance') {
      return { action: 'advance', experienceId: context.nextExperience || null, focus: null };
    }
    if (recommendation.action !== 'reinforce') {
      return { action: 'continue-assessment', experienceId: context.currentExperience || 'shopping-for-dinner', focus: 'assessment' };
    }

    const parsed = parseSkill(recommendation.skill);
    const fallback = routes[parsed.skill] || routes['verb-function'];
    const resonance = Array.isArray(context.experiences) && PedagogicalResonance
      ? PedagogicalResonance.select(context.experiences, parsed.skill)
      : null;

    return {
      action: 'reinforce',
      skill: parsed.skill,
      language: parsed.language || context.language || 'en',
      chapter: parsed.chapter || context.chapter || 'verbs',
      ...fallback,
      experienceId: resonance?.experienceId || fallback.experienceId,
      resonance: resonance ? { score: resonance.score, reasons: resonance.reasons } : null
    };
  }

  return { route, parseSkill, routes };
});
