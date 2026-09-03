(function (root) {
  const VERB_GRID_URL = 'data/grammar/verb-grid.json';
  let gridPromise = null;

  async function loadGrid() {
    if (!gridPromise) {
      gridPromise = fetch(VERB_GRID_URL).then(response => {
        if (!response.ok) throw new Error('Could not load SIYAYO Verb Grid.');
        return response.json();
      });
    }
    return gridPromise;
  }

  async function diagnose(sentence) {
    const engine = root.XespiritoDiagnostics;
    if (!engine || typeof engine.diagnose !== 'function') {
      throw new Error('Xespirito diagnostic engine is unavailable.');
    }
    const grid = await loadGrid();
    return engine.diagnose(sentence, grid);
  }

  root.SIYAYOXespiritoBridge = {
    diagnose,
    loadGrid,
    source: VERB_GRID_URL,
    archetype: 'xespirito'
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
