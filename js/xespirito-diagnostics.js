(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.XespiritoDiagnostics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const normalize = value => String(value ?? '').trim();
  const cleanToken = value => String(value || '').toLowerCase().replace(/^[^a-z']+|[^a-z']+$/g, '');

  function buildRuleIndex(grid) {
    if (!grid || !Array.isArray(grid.rules)) {
      throw new TypeError('A valid Verb Grid with a rules array is required.');
    }
    return new Map(grid.rules.map(rule => [normalize(rule.example?.input), rule]));
  }

  function rulesById(grid) {
    return new Map((grid.rules || []).map(rule => [rule.id, rule]));
  }

  function functionForms(grid) {
    const forms = new Map();
    for (const fn of grid.functions || []) {
      for (const example of fn.examples || []) forms.set(cleanToken(example), fn.id);
    }
    return forms;
  }

  function inferResponsiblePiece(rule) {
    const id = rule.id;
    if (id.includes('single-core-modal') || id.includes('modal-blocks') || id.includes('modal-requires')) return 'modal-core';
    if (id.includes('perfect') || id.includes('future-carrier')) return 'auxiliary-have';
    if (id.includes('progressive') || id.includes('be-blocks')) return 'auxiliary-be';
    if (id.includes('finite-carrier')) return 'finite-carrier';
    if (id.includes('chain-order')) return 'auxiliary-chain';
    return 'verb-function';
  }

  function resultFromRule(input, rule, overrides = {}) {
    return {
      matched: true,
      input,
      status: 'functional-conflict',
      archetype: rule.archetype,
      ruleId: rule.id,
      responsiblePiece: overrides.responsiblePiece || inferResponsiblePiece(rule),
      reason: rule.diagnosis,
      correction: overrides.correction || rule.example.output,
      pattern: rule.pattern,
      matchMode: overrides.matchMode || 'canonical-example',
      conflicts: overrides.conflicts || [rule.id]
    };
  }

  function replaceToken(rawTokens, index, replacement) {
    const output = [...rawTokens];
    const original = output[index];
    const trailing = (original.match(/[^a-zA-Z']+$/) || [''])[0];
    output[index] = replacement + trailing;
    return output.join(' ');
  }

  function compositionalDiagnose(input, grid) {
    const rawTokens = input.split(/\s+/);
    const tokens = rawTokens.map(cleanToken);
    const forms = functionForms(grid);
    const byId = rulesById(grid);
    const modalForms = new Set((grid.functions || []).find(fn => fn.id === 'modal-core')?.examples?.map(cleanToken) || []);

    // Highest structural priority: two core modals compete for the same slot.
    for (let i = 0; i < tokens.length - 1; i += 1) {
      if (modalForms.has(tokens[i]) && modalForms.has(tokens[i + 1])) {
        const rule = byId.get('single-core-modal');
        if (!rule) break;
        const conflicts = ['single-core-modal'];
        if (tokens.slice(i + 2).includes('do')) conflicts.push('modal-blocks-do-support');
        return resultFromRule(input, rule, {
          matchMode: 'functional-pattern',
          responsiblePiece: 'modal-core',
          correction: rule.example.output,
          conflicts
        });
      }
    }

    // WILL is the finite carrier; the immediately following auxiliary must be base form.
    for (let i = 0; i < tokens.length - 1; i += 1) {
      if (tokens[i] !== 'will') continue;
      const next = tokens[i + 1];
      const nextFunction = forms.get(next);
      const baseByFunction = {
        'auxiliary-have': 'have',
        'auxiliary-be': 'be',
        'auxiliary-do': 'do'
      };
      if (nextFunction && baseByFunction[nextFunction] && next !== baseByFunction[nextFunction]) {
        const rule = byId.get('future-carrier-requires-base-next');
        if (!rule) break;
        return resultFromRule(input, rule, {
          matchMode: 'functional-pattern',
          responsiblePiece: nextFunction,
          correction: replaceToken(rawTokens, i + 1, baseByFunction[nextFunction])
        });
      }
    }

    // DO support is blocked when a core modal is already carrying auxiliary function.
    for (let i = 0; i < tokens.length; i += 1) {
      if (!['do', 'does', 'did'].includes(tokens[i])) continue;
      const modalIndex = tokens.findIndex((token, index) => index > i && modalForms.has(token));
      if (modalIndex > i) {
        const rule = byId.get('modal-blocks-do-support');
        if (!rule) break;
        return resultFromRule(input, rule, {
          matchMode: 'functional-pattern',
          responsiblePiece: 'modal-core'
        });
      }
    }

    return null;
  }

  function diagnose(sentence, grid) {
    const input = normalize(sentence);
    if (!input) {
      return { matched: false, input, status: 'empty-input', archetype: 'xespirito' };
    }

    const exactRule = buildRuleIndex(grid).get(input);
    if (exactRule) return resultFromRule(input, exactRule);

    const compositional = compositionalDiagnose(input, grid);
    if (compositional) return compositional;

    return {
      matched: false,
      input,
      status: 'no-canonical-diagnostic',
      archetype: 'xespirito'
    };
  }

  return { diagnose, buildRuleIndex, compositionalDiagnose, functionForms };
});
