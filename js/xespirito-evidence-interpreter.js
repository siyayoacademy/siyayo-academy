(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.XespiritoEvidenceInterpreter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function interpret(trace = []) {
    const conflicts = trace.filter(item => item && item.status === 'conflict' && item.responsiblePiece);
    const counts = new Map();
    for (const item of conflicts) counts.set(item.responsiblePiece, (counts.get(item.responsiblePiece) || 0) + 1);

    const signals = [...counts.entries()].map(([piece, occurrences]) => ({
      piece,
      occurrences,
      status: occurrences >= 2 ? 'requires-reinforcement' : 'observed-conflict'
    }));

    return {
      evidenceCount: trace.length,
      conflictEvidenceCount: conflicts.length,
      clearEvidenceCount: trace.filter(item => item && item.status === 'clear').length,
      signals,
      hasReinforcementSignal: signals.some(signal => signal.status === 'requires-reinforcement')
    };
  }

  return { interpret };
});
