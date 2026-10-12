// SIYAYO · JAGUAR ELO 7C.1
// A LANGUAGE change can request an already declared QW assessment for the
// identified learner. The canonical selector alone owns Session birth/resume.
// This module never creates Attempts, Evidence, or a Green Pass.
(function (root) {
  'use strict';
  var generation = 0;
  var capturedClick = null;
  function text(value) { return typeof value === 'string' ? value.trim() : ''; }
  function selectedButton(event) {
    var target = event && event.target;
    return target && typeof target.closest === 'function'
      ? target.closest('#experienceLanguageGear [data-experience-language]') : null;
  }
  function focusIsCurrent(focus) {
    var runtime = root.SIYAYOVerbExplorerExperienceRuntime;
    var identity = root.SIYAYOVerbExplorerLearnerIdentitySource;
    return !!runtime && !!identity && typeof identity.getId === 'function' &&
      text(identity.getId()) === focus.learnerId &&
      typeof runtime.activeLanguage === 'function' && runtime.activeLanguage() === focus.language &&
      typeof runtime.activeExperienceId === 'function' && runtime.activeExperienceId() === focus.experienceId &&
      typeof runtime.activeQuestionWord === 'function' && runtime.activeQuestionWord() === focus.questionWord;
  }
  function adoptForLanguageChange(language) {
    // Invalidate earlier *visual* completions, including a new free exploration.
    var ticket = ++generation;
    var identity = root.SIYAYOVerbExplorerLearnerIdentitySource;
    var runtime = root.SIYAYOVerbExplorerExperienceRuntime;
    var catalog = root.SIYAYOVerbExplorerExperienceNavigation;
    var selector = root.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
    var contracts = root.SIYAYOQuestionWordAssessmentContract;
    if (!identity || !runtime || !catalog || !selector || !contracts ||
        typeof identity.getId !== 'function' || typeof catalog.getExperience !== 'function' ||
        typeof selector.select !== 'function' || typeof contracts.targetForSelection !== 'function' ||
        typeof runtime.activeLanguage !== 'function' ||
        typeof runtime.activeExperienceId !== 'function' ||
        typeof runtime.activeQuestionWord !== 'function') return Promise.resolve(false);
    var learnerId = text(identity.getId());
    var focus = { learnerId: learnerId, language: text(language),
      experienceId: text(runtime.activeExperienceId()),
      questionWord: text(runtime.activeQuestionWord()) };
    if (!learnerId || !['en', 'es', 'pt'].includes(focus.language) ||
        !focusIsCurrent(focus)) return Promise.resolve(false);
    var experience = catalog.getExperience(focus.experienceId);
    var matches = (experience && experience.thinkingMind || []).filter(function (item) {
      return item && item.questionWord === focus.questionWord;
    });
    if (matches.length !== 1) return Promise.resolve(false);
    var target = contracts.targetForSelection(matches[0], null);
    if (!target || !text(target.skill) || !text(target.definitionPath))
      return Promise.resolve(false); // Exploration only; never invent a Target.
    // A declared resume-only target is delegated to the canonical selector;
    // that selector refuses to create a new Session when no origin exists.
    try {
      return Promise.resolve(selector.select(matches[0])).then(function (accepted) {
        if (ticket !== generation || !focusIsCurrent(focus)) return false;
        if (typeof runtime.render === 'function') runtime.render();
        return accepted === true;
      }, function () { return false; });
    } catch (_error) { return Promise.resolve(false); }
  }
  var doc = root.document;
  if (doc && typeof doc.addEventListener === 'function') {
    // Capture the previous language, then observe the original gear's onclick
    // after it changes the presentation. Do not replace the existing handler.
    doc.addEventListener('click', function (event) {
      var button = selectedButton(event);
      var runtime = root.SIYAYOVerbExplorerExperienceRuntime;
      capturedClick = button && runtime && typeof runtime.activeLanguage === 'function'
        ? { event: event, previous: runtime.activeLanguage() } : null;
    }, true);
    doc.addEventListener('click', function (event) {
      var button = selectedButton(event);
      var capture = capturedClick;
      if (capture && capture.event === event) capturedClick = null;
      if (!button || !capture || capture.event !== event) return;
      var next = text(button.dataset && button.dataset.experienceLanguage);
      var runtime = root.SIYAYOVerbExplorerExperienceRuntime;
      if (capture.previous === next || !runtime || runtime.activeLanguage() !== next) return;
      adoptForLanguageChange(next);
    }, false);
  }
  root.SIYAYOVerbExplorerPolyglotLanguageContinuity = Object.freeze({
    // No public method can grant evaluation credit; read-only diagnostics only.
    isInstalled: !!(doc && typeof doc.addEventListener === 'function')
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
