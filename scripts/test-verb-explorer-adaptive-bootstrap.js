const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const appended = [];
const clickListeners = [];
const eventListeners = Object.create(null);
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
      (eventListeners[type] || (eventListeners[type] = [])).push(handler);
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
      'js/verb-explorer-choice-adaptive-wire.js',
      'js/choice-support-sensor.js',
      'js/verb-explorer-choice-support-observer.js',
      'js/choice-mode-sensor.js',
      'js/verb-explorer-choice-mode-bridge.js',
      'js/verb-explorer-sentence-built-observer.js'
    ];
    for (const src of liveOrder) assert(appended.includes(src), src + ' should be loaded by adaptive bootstrap');
    const positions = liveOrder.map(src => appended.indexOf(src));
    assert(positions.every((value, index) => index === 0 || value > positions[index - 1]), 'live adaptive modules must load in dependency order');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerLearnerEvent.fromChoiceSelect, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerLearnerEvent.fromSentenceBuilt, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveController.submitChoice, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveInputProvider, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveInputProvider.configure, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveInputProvider.clear, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveStateBridge.getState, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveStateBridge.getResumeState, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerAdaptiveCoordinator.submitChoice, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerChoiceAdaptiveWire.install, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerChoiceSupportObserver.install, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOChoiceSupportSensor.observe, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerSentenceBuiltObserver.install, 'function');
    assert(appended.includes('js/adaptive-learner-trail-view.js'), 'learner Trail projection should be loaded by adaptive bootstrap');
    assert(appended.includes('js/adaptive-learner-trail-sequence.js'), 'chronological learner Trail sequence should be loaded by adaptive bootstrap');
    assert(appended.includes('js/adaptive-learner-trail-position.js'), 'learner Trail current-position projection should be loaded by adaptive bootstrap');
    assert(appended.includes('js/adaptive-learner-trail-label.js'), 'learner-facing Trail word label should be loaded by adaptive bootstrap');
    assert(appended.includes('js/adaptive-learner-progress-marker.js'), 'learner progress marker semantics should be loaded by adaptive bootstrap');
    assert(appended.includes('js/adaptive-dependency-connector-view.js'), 'SVG Dependency Connector View should be loaded by adaptive bootstrap');
    assert(appended.includes('js/verb-explorer-learner-trail-surface.js'), 'learner Trail surface should be loaded by adaptive bootstrap');
    assert.strictEqual(typeof sandbox.AdaptiveLearnerTrailView.project, 'function');
    assert.strictEqual(typeof sandbox.AdaptiveLearnerTrailSequence.project, 'function');
    assert.strictEqual(typeof sandbox.AdaptiveLearnerTrailPosition.resolve, 'function');
    assert.strictEqual(typeof sandbox.AdaptiveLearnerTrailLabel.project, 'function');
    assert.strictEqual(typeof sandbox.AdaptiveLearnerProgressMarker.resolve, 'function');
    assert.strictEqual(typeof sandbox.AdaptiveDependencyConnectorView.plan, 'function');
    assert.strictEqual(typeof sandbox.AdaptiveDependencyConnectorView.draw, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerLearnerTrailSurface.install, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerDependencyFocusInteraction.install, 'function');
    assert.strictEqual(typeof sandbox.SIYAYOVerbExplorerDependencyFocusInteraction.updateStructure, 'function');
    for (const type of ['pointerover','pointerup','focusin','keydown']) {
      assert.strictEqual(
        (eventListeners[type] || []).length,
        1,
        'dependency focus pointer/focus/key listeners must install once: '+type
      );
    }
    assert.strictEqual(clickListeners.length, 4, 'bootstrap click listeners should remain choice, support-audio, sentence-built, and read-only Trail refresh only');

    // Exercise the grounded Attempt Source on this CI-routed test without wiring it live yet.
    load('js/choice-attempt-source.js');
    const attemptSource=sandbox.SIYAYOChoiceAttemptSource;
    assert(attemptSource&&typeof attemptSource.assemble==='function','Choice Attempt Source should expose assemble');
    const grounded=Object.freeze({currentExperienceId:'shopping-for-dinner',experienceLanguage:'en',experienceQuestion:'Which cheese should we choose?',experienceChoiceCandidate:'fresh-mild-cheese'});
    const learnerEvent=Object.freeze({occurrenceId:'choice-select:21'});
    const evidence=Object.freeze({dimension:'choice-function',result:'pass',context:grounded});
    const support=Object.freeze({value:'none',context:grounded});
    const mode=Object.freeze({value:'controlled-production',context:grounded});
    const attempt=attemptSource.assemble({learnerEvent:learnerEvent,evidence:evidence,support:support,mode:mode,context:grounded});
    assert(attempt,'matching grounded signals should assemble an Attempt');
    assert.strictEqual(attempt.occurrenceId,'choice-select:21');
    assert.strictEqual(attempt.dimension,'choice-function');
    assert.strictEqual(attempt.result,'pass');
    assert.strictEqual(attempt.support,'none');
    assert.strictEqual(attempt.mode,'controlled-production','Attempt Source must preserve observed mode rather than invent transfer');
    assert.strictEqual(Object.isFrozen(attempt),true);
    assert.strictEqual(Object.isFrozen(attempt.context),true);
    const changedLanguage=Object.freeze({currentExperienceId:'shopping-for-dinner',experienceLanguage:'es',experienceQuestion:'Which cheese should we choose?',experienceChoiceCandidate:'fresh-mild-cheese'});
    assert.strictEqual(attemptSource.assemble({learnerEvent:learnerEvent,evidence:evidence,support:Object.freeze({value:'none',context:changedLanguage}),mode:mode,context:grounded}),null,'mixed contextual signals must fail closed');

    return sandbox.SIYAYOVerbExplorerCycleResumeDispatch.bootstrap().then(function(secondCycle){
      assert.strictEqual(secondCycle, cycle, 'second bootstrap should reuse the same Cycle');
      assert.strictEqual(clickListeners.length, 4, 'second bootstrap must not duplicate adaptive click listeners');
      for (const type of ['pointerover','pointerup','focusin','keydown']) {
        assert.strictEqual((eventListeners[type] || []).length, 1, 'second bootstrap must not duplicate '+type+' listener');
      }
      console.log('Verb Explorer adaptive browser bootstrap: PASS — Choice, grounded support-audio, sentence-built, and read-only learner Trail bridges remain ordered and idempotent.');
    });
  })
  .catch(function(error) {
    console.error(error);
    process.exitCode = 1;
  });
