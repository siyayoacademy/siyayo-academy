(function exposeResolver(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SIYAYOChoiceResolver = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createResolver() {
  'use strict';

  const LABELS = Object.freeze({
    en: Object.freeze({
      canonicalForm: 'Canonical Form',
      contextualResponse: 'Contextual Response',
      valid: 'Valid canonical candidate',
      invalid: 'Not found among canonical candidates',
      preferred: 'Best contextual fit',
      possible: 'Contextually possible'
    }),
    es: Object.freeze({
      canonicalForm: 'Forma canónica',
      contextualResponse: 'Respuesta contextual',
      valid: 'Candidato canónico válido',
      invalid: 'No encontrado entre los candidatos canónicos',
      preferred: 'Mejor adecuación contextual',
      possible: 'Contextualmente posible'
    }),
    pt: Object.freeze({
      canonicalForm: 'Forma canônica',
      contextualResponse: 'Resposta contextual',
      valid: 'Candidato canônico válido',
      invalid: 'Não encontrado entre os candidatos canônicos',
      preferred: 'Melhor adequação contextual',
      possible: 'Contextualmente possível'
    })
  });

  function labelsFor(language) {
    return LABELS[language] || LABELS.en;
  }

  function uniqueStrings(values) {
    return [...new Set(Array.isArray(values) ? values.filter(value => typeof value === 'string') : [])];
  }

  function rankCandidates(choiceContext) {
    const preferredTraits = uniqueStrings(choiceContext?.preferredTraits);
    const candidates = Array.isArray(choiceContext?.canonicalCandidates)
      ? choiceContext.canonicalCandidates
      : [];

    return candidates
      .map((candidate, order) => {
        const contextTraits = uniqueStrings(candidate?.contextTraits);
        const matchedTraits = preferredTraits.filter(trait => contextTraits.includes(trait));
        return {
          id: candidate?.id,
          response: candidate?.response,
          contextTraits,
          matchedTraits,
          score: matchedTraits.length,
          possibleScore: preferredTraits.length,
          order
        };
      })
      .sort((left, right) => right.score - left.score || left.order - right.order)
      .map(({ order, ...candidate }) => candidate);
  }

  function resolveChoice(choiceContext, candidateId, language = 'en') {
    const labels = labelsFor(language);
    const ranking = rankCandidates(choiceContext);
    const selected = ranking.find(candidate => candidate.id === candidateId);
    const bestScore = ranking.length ? ranking[0].score : 0;
    const isCanonicalCandidate = Boolean(
      selected &&
      selected.response &&
      ['en', 'es', 'pt'].every(lang => typeof selected.response[lang] === 'string' && selected.response[lang].trim())
    );

    return {
      candidateId,
      language: LABELS[language] ? language : 'en',
      canonicalForm: {
        label: labels.canonicalForm,
        valid: isCanonicalCandidate,
        status: isCanonicalCandidate ? labels.valid : labels.invalid,
        response: isCanonicalCandidate ? selected.response[language] || selected.response.en : null
      },
      contextualResponse: {
        label: labels.contextualResponse,
        available: Boolean(selected),
        status: selected
          ? (selected.score === bestScore ? labels.preferred : labels.possible)
          : labels.invalid,
        score: selected?.score ?? 0,
        possibleScore: selected?.possibleScore ?? uniqueStrings(choiceContext?.preferredTraits).length,
        matchedTraits: selected?.matchedTraits ?? []
      },
      ranking: ranking.map(candidate => ({
        id: candidate.id,
        score: candidate.score,
        possibleScore: candidate.possibleScore,
        matchedTraits: candidate.matchedTraits
      }))
    };
  }

  return Object.freeze({
    LABELS,
    labelsFor,
    rankCandidates,
    resolveChoice
  });
}));
