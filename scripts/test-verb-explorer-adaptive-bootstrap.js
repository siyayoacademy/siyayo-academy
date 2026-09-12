const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const appended = [];
const clickListeners = [];
const context = {
  console,
  Promise,
  setTimeout,
  clearTimeout,
  document: {
    head: {
      appendChild(script) {
        appended.push(script.src);
        const code = fs.readFileSync(script.src, 'utf8');
        vm.runInContext(code, sandbox, { filename: script.src });
        if (typeof script.onload === 'function') script.onload();
      }
    },
    createElement(tag) {
      assert.strictEqual(tag, 'script');
      return { src: '', async: true, onload: null, onerror: null };
    },
    addEventListener(type, handler) {
      if (type === 'click') clickListeners.push(handler);
    }
  }
};
context.globalThis = context;
const sandbox = vm.createContext(context);

function load(path) {
  vm.runInContext(fs.readFileSync(path, 'utf8'), sandbox, { filename: path });
}

load('js/adaptive-resume-runtime-dispatch.js');
load('js/verb-explorer-cycle-resume-dispatch.js');

Promise.resolve(sandbox.SIYAYOVerbExplorerCycleResumeDispatch.bootstrap())
  .then(function(cycle) {
    assert(cycle, 'adaptive Cycle should resolve');
    assert.strictEqual(typeof cycle.submit, 'function', 'AdaptiveLearningCycle.submit should be available');
    assert.strictEqual(sandbox.AdaptiveLearningCycle, cycle, 'resolved Cycle should be browser global');
    assert(appended.includes('js/adaptive-browser-runtime.js'), 'browser runtime should be bootstrapped');
    assert(appended.includes('js/adaptive-learning-cycle.js'), 'Cycle dependency should be loaded');
    assert.strictEqual(sandbox.GreenPassAuthorityPolicy.defaultAuthority, 'legacy');
    assert(sandbox.GreenPassAuthorityPolicy.contractAuthoritySkills.includes('which.use.determiner'));

    const liveOrder = [
      'js/verb-explorer-learner-event.js',
      'js/verb-explorer-adaptive-controller.js',
      'js/verb-explorer-adaptive-input-provider.js',
      'js/verb-explorer-adaptive-state-bridge.js',
      'js/verb-explorer-adaptive-coordinator.js',
      'js/verb-explorer-choice-adaptive-wire.js'
    ];
    for (const src of liveOrder) assert(appended.includes(src), src + ' should be loaded by adaptive bootstrap');
    const positions = liveOrder.map(src => appended.indexOf(src));
    assert(positions.every((value, index) => index === 0 || value > positions[index - 1]), 'live choice bridge modules must load in dependency order');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerLearnerEvent.fromChoiceSelect, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveController.submitChoice, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveInputProvider, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveInputProvider.configure, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveInputProvider.clear, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveStateBridge.getState, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveStateBridge.getResumeState, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveCoordinator.submitChoice, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerChoiceAdaptiveWire.install, 'function');
    assert.strictEqual(clickListeners.length, 1, 'bootstrap should install adaptive choice wire exactly once');

    // Exercise the sentence-built observer on this already-executed CI route without
    // claiming that production bootstrap installs it yet.
    load('js/verb-explorer-sentence-built-observer.js');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerSentenceBuiltObserver.install, 'function');
    let observed = null;
    const groundedState = Object.freeze({
      currentExperienceId: 'shopping-for-dinner',
      experienceLanguage: 'en',
      experienceQuestion: 2,
      experienceChoiceCandidate: 'fresh-mild-cheese',
      experienceWordType: 'sentence'
    });
    const installed = sandbox.SIYAYOVerbExplorerSentenceBuiltObserver.install({
      events: sandbox.SIYAYOVerbExplorerLearnerEvent,
      stateBridge: { capture: function(){ return groundedState; } },
      onObserved: function(value){ observed = value; }
    });
    assert.strictEqual(installed, true, 'sentence observer should install on the executed bootstrap test route');
    assert.strictEqual(clickListeners.length, 2, 'sentence observer should add exactly one isolated listener');
    clickListeners[1]({target:{closest:function(selector){return selector==='#buildSentence'?{}:null;}}});
    assert.strictEqual(observed, null, 'sentence observer must wait for the existing BUILD SENTENCE handler');

    return Promise.resolve().then(function(){
      assert(observed, 'grounded BUILD SENTENCE should create an observation');
      assert.strictEqual(observed.type, 'sentence-built');
      assert.strictEqual(observed.currentExperienceId, 'shopping-for-dinner');
      assert.strictEqual(observed.experienceLanguage, 'en');
      assert.strictEqual(observed.experienceQuestion, 2);
      assert.strictEqual(observed.experienceChoiceCandidate, 'fresh-mild-cheese');
      assert.strictEqual(Object.isFrozen(observed), true);

      return sandbox.SIYAYOVerbExplorerCycleResumeDispatch.bootstrap().then(function(secondCycle){
        assert.strictEqual(secondCycle, cycle, 'second bootstrap should reuse the same Cycle');
        assert.strictEqual(clickListeners.length, 2, 'second bootstrap must not duplicate either already-installed listener');
        console.log('Verb Explorer adaptive browser bootstrap: PASS — Cycle available, live choice bridge loaded once, and grounded sentence observer exercised on the executed CI route without production bootstrap installation.');
      });
    });
  })
  .catch(function(error) {
    console.error(error);
    process.exitCode = 1;
  });
