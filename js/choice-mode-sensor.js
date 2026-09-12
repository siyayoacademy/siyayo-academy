(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SIYAYOChoiceModeSensor = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function observe(event) {
    if (!event || event.type !== 'sentence-built') return null;
    if (event.canonicalCandidate !== true) return null;
    if (event.systemStructure !== true) return null;
    return 'controlled-production';
  }

  return Object.freeze({ observe: observe });
}));
