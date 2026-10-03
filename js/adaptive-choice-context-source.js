(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveChoiceContextSource = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function normalize(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized || null;
  }

  function resolve(session, skillDefinition, experiences) {
    if (!session || !session.decision) return null;
    if (!skillDefinition || typeof skillDefinition !== 'object') return null;
    if (!Array.isArray(experiences)) return null;

    const sessionSkill = normalize(session.decision.skill);
    const experienceId = normalize(session.decision.experienceId);
    const definitionSkill = normalize(skillDefinition.id);
    const questionWord = normalize(skillDefinition.form);
    const intention = normalize(
      skillDefinition.function &&
      skillDefinition.function.communicativeIntention
    );

    if (!sessionSkill || !experienceId || !definitionSkill || !questionWord || !intention) {
      return null;
    }
    if (sessionSkill !== definitionSkill) return null;

    const experienceMatches = experiences.filter(experience =>
      experience &&
      experience.id === experienceId &&
      Array.isArray(experience.thinkingMind)
    );
    if (experienceMatches.length !== 1) return null;

    const candidates = experienceMatches[0].thinkingMind.filter(entry =>
      entry &&
      normalize(entry.questionWord) === questionWord &&
      normalize(entry.intention) === intention &&
      entry.question &&
      typeof entry.question === 'object' &&
      entry.choiceContext &&
      typeof entry.choiceContext === 'object' &&
      Array.isArray(entry.choiceContext.canonicalCandidates) &&
      entry.choiceContext.canonicalCandidates.length > 0
    );

    if (candidates.length !== 1) return null;

    const entry = candidates[0];

    return Object.freeze({
      skill: sessionSkill,
      experienceId,
      questionWord,
      intention,
      question: entry.question,
      choiceContext: entry.choiceContext
    });
  }

  return Object.freeze({ resolve });
});
