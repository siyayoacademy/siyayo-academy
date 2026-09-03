(function (root) {
  const VERB_GRID_URL = 'data/grammar/verb-grid.json';
  let gridPromise = null;
  let repairTrace = [];

  async function loadGrid() {
    if (!gridPromise) gridPromise = fetch(VERB_GRID_URL).then(response => { if (!response.ok) throw new Error('Could not load SIYAYO Verb Grid.'); return response.json(); });
    return gridPromise;
  }

  async function diagnose(sentence) {
    const engine = root.XespiritoDiagnostics;
    if (!engine || typeof engine.diagnose !== 'function') throw new Error('Xespirito diagnostic engine is unavailable.');
    return engine.diagnose(sentence, await loadGrid());
  }

  function escapeHtml(value = '') { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }

  function evidenceFrom(result) {
    return Object.freeze({
      input: result.input,
      status: result.matched ? 'conflict' : 'clear',
      ruleId: result.ruleId || null,
      responsiblePiece: result.responsiblePiece || null,
      conflicts: Array.isArray(result.conflicts) ? [...new Set(result.conflicts)] : [],
      correction: result.correction || null
    });
  }

  function recordEvidence(result, reset = false) {
    if (reset) repairTrace = [];
    const evidence = evidenceFrom(result);
    const previous = repairTrace[repairTrace.length - 1];
    if (!previous || JSON.stringify(previous) !== JSON.stringify(evidence)) repairTrace.push(evidence);
    return getRepairTrace();
  }

  function getRepairTrace() { return repairTrace.map(item => ({ ...item, conflicts: [...item.conflicts] })); }
  function clearRepairTrace() { repairTrace = []; }

  function renderTrace() {
    if (!repairTrace.length) return '';
    return `<div class="xespirito-trace"><strong>REPAIR TRACE · EVIDENCE</strong>${repairTrace.map((item, index) => `<div><span>${index + 1}</span><p>${escapeHtml(item.input)}</p><small>${item.status === 'clear' ? 'CLEAR' : escapeHtml(item.ruleId)}</small></div>`).join('')}</div>`;
  }

  function renderConflictSignals(result) {
    const conflicts = Array.isArray(result.conflicts) ? [...new Set(result.conflicts)] : [];
    if (conflicts.length <= 1) return '';
    return `<div class="xespirito-signals"><dt>CONFLICT SIGNALS · ${conflicts.length}</dt><dd>${conflicts.map((id, index) => `<span>${index + 1}. ${escapeHtml(id)}</span>`).join('')}</dd><small>Xespirito shows the highest-priority conflict first; additional signals may require another repair pass.</small></div>`;
  }

  function renderResult(result, target) {
    if (!target) return;
    if (!result.matched) {
      target.className = 'xespirito-result is-neutral';
      target.innerHTML = `<span>FUNCTIONAL PATH CLEAR</span><p>${escapeHtml(result.input || '—')}</p><small>No conflict recognized by the current canonical Verb Grid.</small>${renderTrace()}`;
      return;
    }
    target.className = 'xespirito-result is-conflict';
    target.innerHTML = `<span>FUNCTIONAL CONFLICT · ${escapeHtml(result.ruleId)}</span><p class="xespirito-input">${escapeHtml(result.input)}</p><dl><div><dt>PIECE</dt><dd>${escapeHtml(result.responsiblePiece)}</dd></div><div><dt>WHY?</dt><dd>${escapeHtml(result.reason)}</dd></div>${renderConflictSignals(result)}<div class="xespirito-correction"><dt>✓ FIRST REPAIR</dt><dd>${escapeHtml(result.correction)}</dd></div></dl><button class="xespirito-apply-repair" type="button" data-repair="${escapeHtml(result.correction)}">APPLY REPAIR → DIAGNOSE AGAIN</button>${renderTrace()}`;
  }

  async function diagnoseFromPanel(options = {}) {
    const input = document.getElementById('xespiritoInput');
    const result = document.getElementById('xespiritoResult');
    const button = document.getElementById('xespiritoDiagnose');
    if (!input || !result || !button) return;
    button.disabled = true; result.className = 'xespirito-result is-loading'; result.innerHTML = '<span>LISTENING TO THE FUNCTION…</span>';
    try { const diagnosis = await diagnose(input.value); recordEvidence(diagnosis, options.resetTrace === true); renderResult(diagnosis, result); }
    catch (error) { result.className = 'xespirito-result is-error'; result.innerHTML = `<span>DIAGNOSTIC UNAVAILABLE</span><p>${escapeHtml(error.message)}</p>`; }
    finally { button.disabled = false; }
  }

  async function applyRepairAndDiagnose(button) {
    const input = document.getElementById('xespiritoInput');
    if (!input || !button?.dataset?.repair) return;
    input.value = button.dataset.repair; input.focus(); await diagnoseFromPanel();
  }

  function attachPanel() {
    const button = document.getElementById('xespiritoDiagnose'); const input = document.getElementById('xespiritoInput'); const result = document.getElementById('xespiritoResult');
    if (!button || !input || !result) return;
    button.addEventListener('click', () => diagnoseFromPanel({ resetTrace: true }));
    input.addEventListener('keydown', event => { if (event.key === 'Enter') diagnoseFromPanel({ resetTrace: true }); });
    result.addEventListener('click', event => { const repairButton = event.target.closest?.('.xespirito-apply-repair'); if (repairButton) applyRepairAndDiagnose(repairButton); });
  }

  root.SIYAYOXespiritoBridge = { diagnose, loadGrid, renderResult, renderConflictSignals, renderTrace, recordEvidence, getRepairTrace, clearRepairTrace, applyRepairAndDiagnose, source: VERB_GRID_URL, archetype: 'xespirito' };
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachPanel); else attachPanel(); }
})(typeof globalThis !== 'undefined' ? globalThis : window);
