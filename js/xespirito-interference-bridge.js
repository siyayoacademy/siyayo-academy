(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.XespiritoInterferenceBridge = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function toEvidence(interference = {}) {
    const base = {
      archetype: 'xespirito',
      source: 'multilingual-interference',
      token: interference.token || null,
      language: interference.language || null,
      relation: interference.relation || null
    };

    if (interference.status === 'possible-hybrid-interference') {
      return {
        ...base,
        status: 'review-required',
        evidenceType: 'interference-hypothesis',
        conflict: false,
        requiresReinforcement: false,
        candidates: interference.candidates || null,
        distances: interference.distances || null
      };
    }

    if (interference.status === 'cross-language-transfer') {
      return {
        ...base,
        status: 'observed-transfer',
        evidenceType: 'cross-language-transfer',
        conflict: false,
        requiresReinforcement: false,
        matchedLanguage: interference.matchedLanguage || null,
        meanings: interference.meanings || null
      };
    }

    if (interference.status === 'canonical') {
      return {
        ...base,
        status: 'clear-evidence',
        evidenceType: 'canonical-language-use',
        conflict: false,
        requiresReinforcement: false,
        matchedLanguage: interference.matchedLanguage || null
      };
    }

    return {
      ...base,
      status: 'no-diagnostic-evidence',
      evidenceType: null,
      conflict: false,
      requiresReinforcement: false
    };
  }

  function interpret(interferenceResults = []) {
    const evidence = interferenceResults.map(toEvidence);
    return {
      archetype: 'xespirito',
      source: 'multilingual-interference',
      evidence,
      reviewRequired: evidence.some(item => item.status === 'review-required'),
      observedTransfer: evidence.some(item => item.status === 'observed-transfer'),
      hasConflict: evidence.some(item => item.conflict === true),
      requiresReinforcement: evidence.some(item => item.requiresReinforcement === true)
    };
  }

  return { toEvidence, interpret };
});
