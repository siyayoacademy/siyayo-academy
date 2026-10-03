#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

let currentExperienceId = 'shopping-for-dinner';
let goCalls = 0;

const sandbox = vm.createContext({
  Object,
  currentExperienceId,
  SIYAYOVerbExplorerResumeRuntime: Object.freeze({
    captureContext() {
      return Object.freeze({
        currentExperienceId,
        experienceQuestion: currentExperienceId === 'shopping-for-dinner' ? 4 : 0,
        experiencePerspective: currentExperienceId === 'shopping-for-dinner' ? 'debating' : null,
        experienceChoiceCandidate: currentExperienceId === 'shopping-for-dinner' ? 'fresh-mild-cheese' : null,
        experienceWordType: 'verb',
        lineOffset: currentExperienceId === 'shopping-for-dinner' ? 6 : 0
      });
    }
  }),
  goToExperience(id) {
    goCalls += 1;
    if (!['shopping-for-dinner', 'preparing-dinner'].includes(id)) return false;
    currentExperienceId = id;
    sandbox.currentExperienceId = id;
    return true;
  }
});
sandbox.globalThis = sandbox;

vm.runInContext(
  fs.readFileSync('js/verb-explorer-transition-runtime.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-transition-runtime.js' }
);

const runtime = sandbox.SIYAYOVerbExplorerTransitionRuntime;
assert.ok(runtime);
assert.equal(typeof runtime.execute, 'function');

const authorization = Object.freeze({
  status: 'transition-authorized',
  fromExperience: 'shopping-for-dinner',
  toExperience: 'preparing-dinner',
  advanceSelection: Object.freeze({
    action: 'advance',
    status: 'selected',
    fromExperience: 'shopping-for-dinner',
    experienceId: 'preparing-dinner'
  }),
  nextDecision: Object.freeze({
    action: 'advance',
    experienceId: 'preparing-dinner',
    skill: 'which.use.determiner'
  })
});

const execution = runtime.execute(authorization);
assert.ok(execution);
assert.equal(execution.status, 'TRANSITION_EXECUTED');
assert.equal(execution.fromExperience, 'shopping-for-dinner');
assert.equal(execution.toExperience, 'preparing-dinner');
assert.equal(goCalls, 1);

assert.equal(execution.state.currentExperienceId, 'preparing-dinner');
assert.equal(execution.state.experienceQuestion, 0);
assert.equal(execution.state.experiencePerspective, null);
assert.equal(execution.state.experienceChoiceCandidate, null);
assert.equal(execution.state.experienceWordType, 'verb');
assert.equal(execution.state.lineOffset, 0);
assert.ok(Object.isFrozen(execution));
assert.ok(Object.isFrozen(execution.state));

assert.equal(
  runtime.execute(authorization),
  null,
  'same transition cannot execute once runtime already left S1 Experience'
);
assert.equal(goCalls, 1);

currentExperienceId = 'shopping-for-dinner';
sandbox.currentExperienceId = 'shopping-for-dinner';

assert.equal(
  runtime.execute({ ...authorization, status: 'candidate-supported' }),
  null,
  'only transition-authorized may move live runtime'
);
assert.equal(goCalls, 1);

assert.equal(
  runtime.execute({
    ...authorization,
    fromExperience: 'having-dinner'
  }),
  null,
  'authorization origin must equal live runtime Experience'
);
assert.equal(goCalls, 1);

assert.equal(
  runtime.execute({
    ...authorization,
    nextDecision: {
      ...authorization.nextDecision,
      experienceId: 'having-dinner'
    }
  }),
  null,
  'nextDecision destination must agree with transition target'
);
assert.equal(goCalls, 1);

const noNavigationSandbox = vm.createContext({
  Object,
  currentExperienceId: 'shopping-for-dinner',
  SIYAYOVerbExplorerResumeRuntime: sandbox.SIYAYOVerbExplorerResumeRuntime
});
noNavigationSandbox.globalThis = noNavigationSandbox;
vm.runInContext(
  fs.readFileSync('js/verb-explorer-transition-runtime.js', 'utf8'),
  noNavigationSandbox
);
assert.equal(
  noNavigationSandbox.SIYAYOVerbExplorerTransitionRuntime.execute(authorization),
  null,
  'missing canonical Experience navigation authority must fail closed'
);

console.log(
  'Verb Explorer transition runtime: PASS — transition-authorized moves live runtime exactly once through canonical goToExperience and exposes the reset S2 state without reusing Resume.'
);
