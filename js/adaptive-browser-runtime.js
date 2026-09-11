// Browser loader for the adaptive Cycle dependency chain.
(function(root){
  const scripts = Object.freeze([
    'js/pedagogical-resonance.js',
    'js/adaptive-learning-router.js',
    'js/adaptive-pedagogical-orchestrator.js',
    'js/adaptive-attempt-loop.js',
    'js/green-pass-profile.js',
    'js/adaptive-advance-selector.js',
    'js/green-pass-authority-policy.js',
    'js/adaptive-wait-classifier.js',
    'js/adaptive-learner-agency.js',
    'js/adaptive-wait-release.js',
    'js/adaptive-agency-release.js',
    'js/adaptive-resume-eligibility.js',
    'js/adaptive-resume-context.js',
    'js/adaptive-agency-resume.js',
    'js/adaptive-agency-resume-context.js',
    'js/adaptive-learning-cycle.js'
  ]);

  function loadSequentially(index) {
    if (index >= scripts.length) return Promise.resolve(root.AdaptiveLearningCycle || null);
    return new Promise(function(resolve, reject) {
      const script = document.createElement('script');
      script.src = scripts[index];
      script.async = false;
      script.onload = function(){ resolve(loadSequentially(index + 1)); };
      script.onerror = function(){ reject(new Error('Adaptive browser dependency failed: ' + scripts[index])); };
      document.head.appendChild(script);
    });
  }

  let ready = null;
  function load() {
    if (!ready) ready = loadSequentially(0);
    return ready;
  }

  root.SIYAYOAdaptiveBrowserRuntime = Object.freeze({ scripts, load });
})(typeof globalThis !== 'undefined' ? globalThis : this);
