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
      'js/verb-explorer-adaptive-coordinator.js',
      'js/verb-explorer-choice-adaptive-wire.js'
    ];
    for (const src of liveOrder) assert(appended.includes(src), src + ' should be loaded by adaptive bootstrap');
    const positions = liveOrder.map(src => appended.indexOf(src));
    assert(positions.every((value, index) => index === 0 || value > positions[index - 1]), 'live choice bridge modules must load in dependency order');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerLearnerEvent.fromChoiceSelect, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveController.submitChoice, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveInputProvider.configure, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveInputProvider.provide, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveCoordinator.submitChoice, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerChoiceAdaptiveWire.install, 'function');
    assert.strictEqual(clickListeners.length, 1, 'bootstrap should install adaptive choice wire exactly once');

    return sandbox.SIYAYOVerbExplorerCycleResumeDispatch.bootstrap().then(function(secondCycle){
      assert.strictEqual(secondCycle, cycle, 'second bootstrap should reuse the same Cycle');
      assert.strictEqual(clickListeners.length, 1, 'second bootstrap must not duplicate the choice wire listener');
      console.log('Verb Explorer adaptive browser bootstrap: PASS — Cycle available, live learner-event/controller/input-provider/coordinator/wire loaded in order, wire installed once, and repeated bootstrap is idempotent.');
    });
  })
  .catch(function(error) {
    console.error(error);
    process.exitCode = 1;
  });
