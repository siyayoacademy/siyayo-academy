(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InterferenceContrastVerifier = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function patternReference(pattern = {}) {
    const key = String(pattern.key || '').trim();
    const occurrences = Number(pattern.occurrences || 0);
    if (!key) return null;
    return Object.freeze({ key, occurrences });
  }

  function verify(pattern = {}, probe = {}) {
    const expectedLanguage = normalize(probe.expectedLanguage);
    const selectedLanguage = normalize(probe.selectedLanguage);
    const meaningCorrect = probe.meaningCorrect === true;
    const formCorrect = probe.formCorrect === true;
    const repeatedPattern = Number(pattern.occurrences || 0) >= 2;
    const repeated = patternReference(pattern);

    if (!repeatedPattern) {
      return result('insufficient-pattern-evidence', false, false, repeated);
    }

    if (!expectedLanguage || !selectedLanguage) {
      return result('probe-incomplete', false, false, repeated);
    }

    if (meaningCorrect && formCorrect && selectedLanguage === expectedLanguage) {
      return result('contrast-cleared', true, false, repeated);
    }

    if (meaningCorrect && selectedLanguage !== expectedLanguage) {
      return result('transfer-confirmed', true, true, repeated);
    }

    if (!meaningCorrect && !formCorrect) {
      return result('contrast-unresolved', true, false, repeated);
    }

    return result('review-required', true, false, repeated);
  }

  function result(status, probeCompleted, reinforcementConfirmed, repeated) {
    return {
      archetype: 'xespirito',
      source: 'multilingual-contrast-verifier',
      status,
      probeCompleted,
      reinforcementConfirmed,
      requiresReinforcement: reinforcementConfirmed,
      conflict: false,
      repeated: repeated ? [repeated] : []
    };
  }

  return { verify };
});
