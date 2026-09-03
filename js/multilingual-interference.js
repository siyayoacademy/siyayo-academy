(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MultilingualInterference = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const falseFriends = [
    {
      forms: { pt: 'esquisito', es: 'exquisito', en: 'weird' },
      meanings: { pt: 'strange or odd', es: 'excellent, refined or delicious', en: 'strange or odd' },
      relation: 'false-friend'
    }
  ];

  const normalize = value => String(value || '').trim().toLowerCase();

  function levenshtein(a, b) {
    const left = normalize(a);
    const right = normalize(b);
    const row = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let i = 1; i <= left.length; i += 1) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= right.length; j += 1) {
        const saved = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1));
        previous = saved;
      }
    }
    return row[right.length];
  }

  function inspect(value, language) {
    const token = normalize(value);
    const lang = normalize(language);
    for (const entry of falseFriends) {
      for (const [candidateLanguage, form] of Object.entries(entry.forms)) {
        if (candidateLanguage === 'en') continue;
        if (token === normalize(form)) {
          return {
            status: candidateLanguage === lang ? 'canonical' : 'cross-language-transfer',
            token,
            language: lang || null,
            matchedLanguage: candidateLanguage,
            relation: entry.relation,
            forms: entry.forms,
            meanings: entry.meanings
          };
        }
      }
      const pt = entry.forms.pt;
      const es = entry.forms.es;
      if (token !== normalize(pt) && token !== normalize(es) && levenshtein(token, pt) <= 2 && levenshtein(token, es) <= 2) {
        return {
          status: 'possible-hybrid-interference',
          token,
          language: lang || null,
          relation: entry.relation,
          candidates: { pt, es },
          distances: { pt: levenshtein(token, pt), es: levenshtein(token, es) },
          confidence: 'review-required'
        };
      }
    }
    return { status: 'no-known-interference', token, language: lang || null };
  }

  return { inspect, levenshtein, falseFriends };
});
