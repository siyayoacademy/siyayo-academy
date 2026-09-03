(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PedagogicalResonance = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const skillSignals = {
    'modal-core': { verbs: ['should', 'can', 'would'], perspectives: ['debating'], questionWords: ['which', 'when', 'who'] },
    'auxiliary-have': { verbs: ['have'], perspectives: ['narrating'], questionWords: ['what'] },
    'auxiliary-be': { verbs: ['be'], perspectives: ['describing'], questionWords: ['what', 'how'] },
    'finite-carrier': { verbs: ['do', 'be', 'have'], perspectives: ['debating'], questionWords: ['when', 'why', 'which'] },
    'auxiliary-chain': { verbs: ['be', 'have'], perspectives: ['narrating'], questionWords: ['how', 'what'] },
    'verb-function': { verbs: [], perspectives: ['describing', 'narrating'], questionWords: ['what', 'how'] }
  };

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function containsAny(text, terms) {
    const source = normalize(text);
    return terms.some(term => source.includes(normalize(term)));
  }

  function scoreExperience(experience, skill) {
    const signals = skillSignals[skill] || skillSignals['verb-function'];
    let score = 0;
    const reasons = [];
    const serialized = JSON.stringify(experience || {});
    const linkedVerbs = experience?.links?.verbs || [];
    const questionWords = (experience?.thinkingMind || []).map(item => item.questionWord);
    const perspectives = Object.keys(experience?.perspectives || {});

    if (signals.verbs.some(verb => linkedVerbs.includes(verb))) {
      score += 3;
      reasons.push('linked-verb');
    }
    if (signals.verbs.length && containsAny(serialized, signals.verbs)) {
      score += 2;
      reasons.push('language-pattern');
    }
    if (signals.questionWords.some(word => questionWords.includes(word))) {
      score += 2;
      reasons.push('question-word');
    }
    if (signals.perspectives.some(perspective => perspectives.includes(perspective))) {
      score += 1;
      reasons.push('perspective');
    }

    return { experienceId: experience?.id || null, score, reasons };
  }

  function rank(experiences = [], skill = 'verb-function') {
    return experiences
      .map(experience => scoreExperience(experience, skill))
      .filter(result => result.experienceId)
      .sort((a, b) => b.score - a.score || a.experienceId.localeCompare(b.experienceId));
  }

  function select(experiences = [], skill = 'verb-function') {
    const ranked = rank(experiences, skill);
    return ranked[0] || null;
  }

  return { select, rank, scoreExperience, skillSignals };
});
