(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.XespiritoInterferenceEvidenceGate = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const normalize = value => String(value || '').trim().toLowerCase();

  function evidenceKey(item = {}) {
    return [
      normalize(item.language),
      normalize(item.token),
      normalize(item.evidenceType),
      normalize(item.matchedLanguage)
    ].join(':');
  }

  function evaluate(evidence = [], options = {}) {
    const threshold = Number.isInteger(options.threshold) && options.threshold >= 2
      ? options.threshold
      : 2;

    const observations = evidence.filter(item =>
      item && (item.status === 'review-required' || item.status === 'observed-transfer')
    );

    const counts = new Map();
    for (const item of observations) {
      const key = evidenceKey(item);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const repeated = [...counts.entries()]
      .filter(([, occurrences]) => occurrences >= threshold)
      .map(([key, occurrences]) => ({ key, occurrences }));

    return {
      archetype: 'xespirito',
      source: 'multilingual-interference-evidence-gate',
      threshold,
      observationCount: observations.length,
      repeated,
      status: repeated.length ? 'pattern-observed' : 'insufficient-evidence',
      requiresReview: repeated.length > 0,
      conflict: false,
      requiresReinforcement: false
    };
  }

  return { evidenceKey, evaluate };
});
