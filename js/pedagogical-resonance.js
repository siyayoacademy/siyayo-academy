(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PedagogicalResonance = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const weights = Object.freeze({ linkedVerb: 3, languagePattern: 2, questionWord: 2, perspective: 1 });
  const skillSignals = {
    'modal-core': { verbs: ['should', 'can', 'would'], perspectives: ['debating'], questionWords: ['which', 'when', 'who'] },
    'auxiliary-have': { verbs: ['have'], perspectives: ['narrating'], questionWords: ['what'] },
    'auxiliary-be': { verbs: ['be'], perspectives: ['describing'], questionWords: ['what', 'how'] },
    'finite-carrier': { verbs: ['do', 'be', 'have'], perspectives: ['debating'], questionWords: ['when', 'why', 'which'] },
    'auxiliary-chain': { verbs: ['be', 'have'], perspectives: ['narrating'], questionWords: ['how', 'what'] },
    'verb-function': { verbs: [], perspectives: ['describing', 'narrating'], questionWords: ['what', 'how'] }
  };

  const normalize = value => String(value || '').trim().toLowerCase();
  const unique = values => [...new Set(values.filter(Boolean))];

  function lexicalTokens(experience = {}) {
    const values = [];
    const visit = value => {
      if (typeof value === 'string') values.push(...normalize(value).split(/[^a-záéíóúüñçãõâêô'-]+/i));
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') Object.values(value).forEach(visit);
    };
    visit(experience);
    return new Set(values.filter(Boolean));
  }

  function scoreExperience(experience, skill) {
    const requestedSkill = normalize(skill) || 'verb-function';
    const signals = skillSignals[requestedSkill] || skillSignals['verb-function'];
    const linkedVerbs = (experience?.links?.verbs || []).map(normalize);
    const questionWords = (experience?.thinkingMind || []).map(item => normalize(item.questionWord));
    const perspectives = Object.keys(experience?.perspectives || {}).map(normalize);
    const tokens = lexicalTokens(experience);
    const matched = {
      linkedVerbs: unique(signals.verbs.filter(verb => linkedVerbs.includes(normalize(verb)))),
      languagePatterns: unique(signals.verbs.filter(verb => tokens.has(normalize(verb)))),
      questionWords: unique(signals.questionWords.filter(word => questionWords.includes(normalize(word)))),
      perspectives: unique(signals.perspectives.filter(perspective => perspectives.includes(normalize(perspective))))
    };
    const contributions = {
      linkedVerb: matched.linkedVerbs.length ? weights.linkedVerb : 0,
      languagePattern: matched.languagePatterns.length ? weights.languagePattern : 0,
      questionWord: matched.questionWords.length ? weights.questionWord : 0,
      perspective: matched.perspectives.length ? weights.perspective : 0
    };
    const score = Object.values(contributions).reduce((sum, value) => sum + value, 0);
    return {
      experienceId: experience?.id || null,
      skill: requestedSkill,
      score,
      matched,
      contributions,
      evidenceStrength: score >= 6 ? 'strong' : score >= 3 ? 'moderate' : score > 0 ? 'weak' : 'none'
    };
  }

  function rank(experiences = [], skill = 'verb-function') {
    return experiences
      .map(experience => scoreExperience(experience, skill))
      .filter(result => result.experienceId)
      .sort((a, b) => b.score - a.score || a.experienceId.localeCompare(b.experienceId));
  }

  function select(experiences = [], skill = 'verb-function', options = {}) {
    const minimumScore = Number.isFinite(options.minimumScore) ? options.minimumScore : 1;
    const ranked = rank(experiences, skill);
    const selected = ranked.find(result => result.score >= minimumScore) || null;
    return selected ? { ...selected, status: 'matched' } : {
      status: 'no-resonance',
      skill: normalize(skill) || 'verb-function',
      minimumScore,
      bestCandidate: ranked[0] || null
    };
  }

  return { select, rank, scoreExperience, lexicalTokens, skillSignals, weights };
});
