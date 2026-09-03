(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.XespiritoDiagnostics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const normalize = value => String(value ?? '').trim();
  const cleanToken = value => String(value || '').toLowerCase().replace(/^[^a-z']+|[^a-z']+$/g, '');

  function buildRuleIndex(grid) {
    if (!grid || !Array.isArray(grid.rules)) throw new TypeError('A valid Verb Grid with a rules array is required.');
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

  function lexicalBases(grid) {
    return new Set((grid.functions || []).find(fn => fn.id === 'lexical-verb')?.examples?.map(cleanToken) || []);
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

  function toIng(base) {
    if (base.endsWith('ie')) return `${base.slice(0, -2)}ying`;
    if (base.endsWith('e') && !base.endsWith('ee')) return `${base.slice(0, -1)}ing`;
    return `${base}ing`;
  }

  function toPastParticiple(base) {
    const irregular = { go: 'gone', choose: 'chosen' };
    if (irregular[base]) return irregular[base];
    if (/[^aeiou]y$/.test(base)) return `${base.slice(0, -1)}ied`;
    if (base.endsWith('e')) return `${base}d`;
    return `${base}ed`;
  }

  function reorderModalBeforeAuxiliary(rawTokens, tokens, modalIndex, auxiliaryIndex) {
    const output = [...rawTokens];
    const modal = cleanToken(output[modalIndex]);
    const auxiliary = cleanToken(output[auxiliaryIndex]);
    output.splice(modalIndex, 1);
    output.splice(auxiliaryIndex, 0, modal);
    const movedAuxIndex = auxiliaryIndex + 1;
    if (['has', 'had'].includes(auxiliary)) output[movedAuxIndex] = 'have';
    else if (['am', 'is', 'are', 'was', 'were', 'been', 'being'].includes(auxiliary)) output[movedAuxIndex] = 'be';
    return output.join(' ');
  }

  function compositionalDiagnose(input, grid) {
    const rawTokens = input.split(/\s+/);
    const tokens = rawTokens.map(cleanToken);
    const forms = functionForms(grid);
    const lexical = lexicalBases(grid);
    const byId = rulesById(grid);
    const modalForms = new Set((grid.functions || []).find(fn => fn.id === 'modal-core')?.examples?.map(cleanToken) || []);
    const haveForms = new Set((grid.functions || []).find(fn => fn.id === 'auxiliary-have')?.examples?.map(cleanToken) || []);
    const beForms = new Set((grid.functions || []).find(fn => fn.id === 'auxiliary-be')?.examples?.map(cleanToken) || []);

    // Highest structural priority: two core modals compete for the same slot.
    for (let i = 0; i < tokens.length - 1; i += 1) {
      if (modalForms.has(tokens[i]) && modalForms.has(tokens[i + 1])) {
        const rule = byId.get('single-core-modal');
        if (!rule) break;
        const conflicts = ['single-core-modal'];
        if (tokens.slice(i + 2).some(token => ['do', 'does', 'did'].includes(token))) conflicts.push('modal-blocks-do-support');
        return resultFromRule(input, rule, { matchMode: 'functional-pattern', responsiblePiece: 'modal-core', correction: rule.example.output, conflicts });
      }
    }

    // A modal belongs before HAVE/BE in the auxiliary chain.
    const modalIndex = tokens.findIndex(token => modalForms.has(token));
    const auxiliaryIndex = tokens.findIndex((token, index) => index < modalIndex && (haveForms.has(token) || beForms.has(token)));
    if (modalIndex > 0 && auxiliaryIndex >= 0) {
      const rule = byId.get('auxiliary-chain-order');
      if (rule) {
        return resultFromRule(input, rule, {
          matchMode: 'functional-pattern',
          responsiblePiece: 'auxiliary-chain',
          correction: reorderModalBeforeAuxiliary(rawTokens, tokens, modalIndex, auxiliaryIndex)
        });
      }
    }

    // WILL is the finite carrier; the immediately following auxiliary must be base form.
    for (let i = 0; i < tokens.length - 1; i += 1) {
      if (tokens[i] !== 'will') continue;
      const next = tokens[i + 1];
      const nextFunction = forms.get(next);
      const baseByFunction = { 'auxiliary-have': 'have', 'auxiliary-be': 'be', 'auxiliary-do': 'do' };
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

    // Perfect HAVE requires BEEN before an -ing lexical form when BE is present.
    for (let i = 0; i < tokens.length - 2; i += 1) {
      if (!haveForms.has(tokens[i]) || !['be', 'being'].includes(tokens[i + 1]) || !tokens[i + 2].endsWith('ing')) continue;
      const rule = byId.get('perfect-progressive-requires-been');
      if (rule) return resultFromRule(input, rule, { matchMode: 'functional-pattern', responsiblePiece: 'auxiliary-have', correction: replaceToken(rawTokens, i + 1, 'been') });
    }

    // Perfect HAVE selects a past participle when the following token is a known lexical base.
    for (let i = 0; i < tokens.length - 1; i += 1) {
      if (!haveForms.has(tokens[i]) || !lexical.has(tokens[i + 1])) continue;
      const rule = byId.get('perfect-requires-past-participle');
      if (rule) return resultFromRule(input, rule, { matchMode: 'functional-pattern', responsiblePiece: 'auxiliary-have', correction: replaceToken(rawTokens, i + 1, toPastParticiple(tokens[i + 1])) });
    }

    // Progressive BE selects an -ing form when the following token is a known lexical base.
    for (let i = 0; i < tokens.length - 1; i += 1) {
      if (!beForms.has(tokens[i]) || !lexical.has(tokens[i + 1])) continue;
      const rule = byId.get('progressive-requires-ing');
      if (rule) return resultFromRule(input, rule, { matchMode: 'functional-pattern', responsiblePiece: 'auxiliary-be', correction: replaceToken(rawTokens, i + 1, toIng(tokens[i + 1])) });
    }

    // DO support is blocked when a core modal is already carrying auxiliary function.
    for (let i = 0; i < tokens.length; i += 1) {
      if (!['do', 'does', 'did'].includes(tokens[i])) continue;
      const laterModal = tokens.findIndex((token, index) => index > i && modalForms.has(token));
      if (laterModal > i) {
        const rule = byId.get('modal-blocks-do-support');
        if (rule) return resultFromRule(input, rule, { matchMode: 'functional-pattern', responsiblePiece: 'modal-core' });
      }
    }

    return null;
  }

  function diagnose(sentence, grid) {
    const input = normalize(sentence);
    if (!input) return { matched: false, input, status: 'empty-input', archetype: 'xespirito' };

    const exactRule = buildRuleIndex(grid).get(input);
    if (exactRule) return resultFromRule(input, exactRule);

    const compositional = compositionalDiagnose(input, grid);
    if (compositional) return compositional;

    return { matched: false, input, status: 'no-canonical-diagnostic', archetype: 'xespirito' };
  }

  return { diagnose, buildRuleIndex, compositionalDiagnose, functionForms, lexicalBases };
});
