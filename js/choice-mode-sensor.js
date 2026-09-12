(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SIYAYOChoiceModeSensor = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function hasGroundedContext(context) {
    if (!context) return false;
    if (!context.currentExperienceId) return false;
    if (!context.experienceLanguage) return false;
    if (context.experienceQuestion == null) return false;
    if (!context.experienceChoiceCandidate) return false;
    return true;
  }

  function observe(event) {
    if (!event || event.type !== 'sentence-built') return null;
    if (event.canonicalCandidate !== true) return null;
    if (event.systemStructure !== true) return null;
    if (!hasGroundedContext(event.context)) return null;
    return 'controlled-production';
  }

  return Object.freeze({ observe: observe });
}));
