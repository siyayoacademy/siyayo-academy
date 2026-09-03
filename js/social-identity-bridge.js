(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SocialIdentityBridge = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const routes = Object.freeze({
    country: {
      questionWord: 'where',
      kindsOfWords: ['noun'],
      verbFunctions: ['state', 'existential'],
      verbs: ['be', 'come'],
      distinction: 'origin'
    },
    nationality: {
      questionWord: 'what',
      kindsOfWords: ['adjective', 'noun'],
      verbFunctions: ['state', 'quality'],
      verbs: ['be'],
      distinction: 'nationality'
    },
    profession: {
      questionWord: 'what',
      kindsOfWords: ['noun'],
      verbFunctions: ['state', 'routine'],
      verbs: ['be', 'work'],
      distinction: 'profession'
    },
    workplace: {
      questionWord: 'where',
      kindsOfWords: ['noun', 'preposition'],
      verbFunctions: ['routine', 'movement'],
      verbs: ['work'],
      distinction: 'workplace'
    }
  });

  const normalize = value => String(value || '').trim().toLowerCase();

  function resolve(prompt = {}) {
    const id = normalize(prompt.id);
    const route = routes[id];
    if (!route) return { status: 'unmapped-social-identity', id: id || null };

    return {
      status: 'mapped',
      id,
      questionWord: normalize(prompt.questionWord) || route.questionWord,
      expectedQuestionWord: route.questionWord,
      questionWordAligned: normalize(prompt.questionWord) === route.questionWord,
      kindsOfWords: [...route.kindsOfWords],
      verbFunctions: [...route.verbFunctions],
      verbs: [...route.verbs],
      distinction: route.distinction,
      source: 'nice-party:social-identity'
    };
  }

  function resolveCategory(category = {}) {
    if (normalize(category.id) !== 'social-identity') {
      return { status: 'not-social-identity', mappings: [] };
    }
    return {
      status: 'mapped',
      stage: category.stage || null,
      source: category.source || null,
      mappings: (category.prompts || []).map(resolve)
    };
  }

  return { resolve, resolveCategory, routes };
});
