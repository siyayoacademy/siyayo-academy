const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const appended = [];
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
    console.log('Verb Explorer adaptive browser bootstrap: PASS — AdaptiveLearningCycle.submit available; no learner event wired.');
  })
  .catch(function(error) {
    console.error(error);
    process.exitCode = 1;
  });
