(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.XespiritoDiagnostics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const normalize = value => String(value ?? '').trim();

  function buildRuleIndex(grid) {
    if (!grid || !Array.isArray(grid.rules)) {
      throw new TypeError('A valid Verb Grid with a rules array is required.');
    }
    return new Map(grid.rules.map(rule => [normalize(rule.example?.input), rule]));
  }

  function inferResponsiblePiece(rule) {
    const id = rule.id;
    if (id.includes('modal')) return 'modal-core';
    if (id.includes('perfect') || id.includes('future-carrier')) return 'auxiliary-have';
    if (id.includes('progressive') || id.includes('be-blocks')) return 'auxiliary-be';
    if (id.includes('finite-carrier')) return 'finite-carrier';
    if (id.includes('chain-order')) return 'auxiliary-chain';
    return 'verb-function';
  }

  function diagnose(sentence, grid) {
    const input = normalize(sentence);
    if (!input) {
      return {
        matched: false,
        input,
        status: 'empty-input',
        archetype: 'xespirito'
      };
    }

    const rule = buildRuleIndex(grid).get(input);
    if (!rule) {
      return {
        matched: false,
        input,
        status: 'no-canonical-diagnostic',
        archetype: 'xespirito'
      };
    }

    return {
      matched: true,
      input,
      status: 'functional-conflict',
      archetype: rule.archetype,
      ruleId: rule.id,
      responsiblePiece: inferResponsiblePiece(rule),
      reason: rule.diagnosis,
      correction: rule.example.output,
      pattern: rule.pattern
    };
  }

  return { diagnose, buildRuleIndex };
});
