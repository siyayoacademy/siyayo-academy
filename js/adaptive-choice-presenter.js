(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveChoicePresenter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function cloneQuestion(question) {
    if (!question || typeof question !== 'object') return null;
    const copy = {};
    ['en', 'es', 'pt'].forEach(language => {
      const value = text(question[language]);
      if (value) copy[language] = value;
    });
    return Object.keys(copy).length ? Object.freeze(copy) : null;
  }

  function cloneResponse(response) {
    if (!response || typeof response !== 'object') return null;
    const copy = {};
    ['en', 'es', 'pt'].forEach(language => {
      const value = text(response[language]);
      if (value) copy[language] = value;
    });
    return Object.keys(copy).length ? Object.freeze(copy) : null;
  }

  function present(resolved) {
    if (!resolved || typeof resolved !== 'object') return null;

    const skill = text(resolved.skill);
    const experienceId = text(resolved.experienceId);
    const questionWord = text(resolved.questionWord);
    const intention = text(resolved.intention);
    const question = cloneQuestion(resolved.question);
    const context = resolved.choiceContext;
    const source = context && Array.isArray(context.canonicalCandidates)
      ? context.canonicalCandidates
      : null;

    if (!skill || !experienceId || !questionWord || !intention || !question || !source || !source.length) {
      return null;
    }

    const seen = Object.create(null);
    const alternatives = [];

    for (const candidate of source) {
      const id = text(candidate && candidate.id);
      const response = cloneResponse(candidate && candidate.response);
      if (!id || !response || seen[id]) return null;
      seen[id] = true;
      alternatives.push(Object.freeze({ id, response }));
    }

    return Object.freeze({
      skill,
      experienceId,
      questionWord,
      intention,
      question,
      alternatives: Object.freeze(alternatives)
    });
  }

  return Object.freeze({ present });
});
