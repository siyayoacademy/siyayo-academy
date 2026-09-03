(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InterferenceContrastVerifier = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function verify(pattern = {}, probe = {}) {
    const expectedLanguage = normalize(probe.expectedLanguage);
    const selectedLanguage = normalize(probe.selectedLanguage);
    const meaningCorrect = probe.meaningCorrect === true;
    const formCorrect = probe.formCorrect === true;
    const repeatedPattern = Number(pattern.occurrences || 0) >= 2;

    if (!repeatedPattern) {
      return result('insufficient-pattern-evidence', false, false);
    }

    if (!expectedLanguage || !selectedLanguage) {
      return result('probe-incomplete', false, false);
    }

    if (meaningCorrect && formCorrect && selectedLanguage === expectedLanguage) {
      return result('contrast-cleared', true, false);
    }

    if (meaningCorrect && selectedLanguage !== expectedLanguage) {
      return result('transfer-confirmed', true, true);
    }

    if (!meaningCorrect && !formCorrect) {
      return result('contrast-unresolved', true, false);
    }

    return result('review-required', true, false);
  }

  function result(status, probeCompleted, reinforcementConfirmed) {
    return {
      archetype: 'xespirito',
      source: 'multilingual-contrast-verifier',
      status,
      probeCompleted,
      reinforcementConfirmed,
      requiresReinforcement: reinforcementConfirmed,
      conflict: false
    };
  }

  return { verify };
});
