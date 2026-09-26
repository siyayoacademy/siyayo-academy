#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const s1 = Object.freeze({
  decision: Object.freeze({
    action: 'continue-assessment',
    experienceId: 'shopping-for-dinner',
    skill: 'which.use.determiner'
  }),
  trace: Object.freeze([{ event: 'experience-selected', experienceId: 'shopping-for-dinner' }])
});

const s2 = Object.freeze({
  decision: Object.freeze({
    action: 'continue-assessment',
    experienceId: 'preparing-dinner',
    skill: 'which.use.determiner',
    focus: 'assessment',
    priorEvidence: Object.freeze([
      Object.freeze({
        source: 'green-pass-contract',
        status: 'transfer-confirmed',
        context: Object.freeze({
          skill: 'which.use.determiner',
          confirmed: true
        })
      })
    ])
  }),
  trace: Object.freeze([{ event: 'experience-selected', experienceId: 'preparing-dinner' }])
});

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

const passContract = Object.freeze({
  requires: Object.freeze([
    Object.freeze({ dimension: 'choice-function', result: 'pass' }),
    Object.freeze({ dimension: 'determiner-use', result: 'pass', support: 'none' }),
    Object.freeze({ dimension: 'determiner-use', result: 'pass', mode: 'transfer', support: 'none' })
  ])
});

const greenProfile = Object.freeze({
  id: 'learner-s2',
  greenPass: true
});

let liveState = Object.freeze({ currentExperienceId: 'shopping-for-dinner' });
let transitionCalls = 0;
let nextSessionCalls = 0;
let configureCalls = 0;
let configured = null;

const sandbox = vm.createContext({ Object, Array });
sandbox.globalThis = sandbox;

sandbox.SIYAYOVerbExplorerTransitionRuntime = Object.freeze({
  execute(input) {
    transitionCalls += 1;
    assert.strictEqual(input, authorization);
    liveState = Object.freeze({
      currentExperienceId: 'preparing-dinner',
      experienceQuestion: 0,
      experiencePerspective: null,
      experienceChoiceCandidate: null,
      experienceWordType: 'verb',
      lineOffset: 0
    });
    return Object.freeze({
      status: 'TRANSITION_EXECUTED',
      fromExperience: 'shopping-for-dinner',
      toExperience: 'preparing-dinner',
      state: liveState
    });
  }
});

sandbox.SIYAYOVerbExplorerNextSessionSource = Object.freeze({
  begin(input) {
    nextSessionCalls += 1;
    assert.strictEqual(input.transitionAuthorization, authorization);
    assert.strictEqual(input.previousSession, s1);
    return s2;
  }
});

sandbox.SIYAYOVerbExplorerAdaptiveProfileSource = Object.freeze({
  getProfile() { return greenProfile; }
});

sandbox.SIYAYOVerbExplorerAdaptiveStateBridge = Object.freeze({
  getState() { return liveState; },
  getResumeState() { return liveState; }
});

sandbox.SIYAYOVerbExplorerAdaptiveCoordinatorConfig = Object.freeze({
  configure(input) {
    configureCalls += 1;
    configured = input;
    assert.strictEqual(input.profile, greenProfile);
    assert.strictEqual(input.session, s2);
    assert.equal(input.context.skill, 'which.use.determiner');
    assert.equal(input.context.currentExperience, 'preparing-dinner');
    assert.strictEqual(input.context.passContract, passContract);
    assert.deepEqual(Array.from(input.context.evidencePackets), []);
    assert.equal(input.getState().currentExperienceId, 'preparing-dinner');
    return true;
  }
});

vm.runInContext(
  fs.readFileSync('js/verb-explorer-next-session-activation.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-next-session-activation.js' }
);

const Activation = sandbox.SIYAYOVerbExplorerNextSessionActivation;
assert.ok(Activation);
assert.equal(typeof Activation.activate, 'function');

const result = Activation.activate({
  transitionAuthorization: authorization,
  previousSession: s1,
  passContract,
  language: 'en',
  chapter: 'question-words',
  document: Object.freeze({ id: 'verb-explorer-document' })
});

assert.ok(result);
assert.equal(result.status, 'S2_ACTIVE');
assert.strictEqual(result.session, s2);
assert.equal(result.experienceId, 'preparing-dinner');
assert.equal(result.skill, 'which.use.determiner');
assert.equal(result.state.currentExperienceId, 'preparing-dinner');
assert.deepEqual(Array.from(result.context.evidencePackets), []);
assert.equal(result.context.currentExperience, 'preparing-dinner');
assert.equal(result.context.skill, 'which.use.determiner');

assert.equal(nextSessionCalls, 1);
assert.equal(transitionCalls, 1);
assert.equal(configureCalls, 1);
assert.ok(configured);

assert.equal(s1.decision.experienceId, 'shopping-for-dinner');
assert.equal(s1.trace.length, 1);
assert.equal(s2.decision.priorEvidence.length, 1);

assert.equal(
  Activation.activate({
    transitionAuthorization: { ...authorization, status: 'candidate-supported' },
    previousSession: s1,
    passContract
  }),
  null,
  'unauthorized transition must not create or activate S2'
);

const missingProfileSandbox = vm.createContext({ Object, Array });
missingProfileSandbox.globalThis = missingProfileSandbox;
missingProfileSandbox.SIYAYOVerbExplorerTransitionRuntime = sandbox.SIYAYOVerbExplorerTransitionRuntime;
missingProfileSandbox.SIYAYOVerbExplorerNextSessionSource = sandbox.SIYAYOVerbExplorerNextSessionSource;
missingProfileSandbox.SIYAYOVerbExplorerAdaptiveProfileSource = Object.freeze({ getProfile: () => null });
missingProfileSandbox.SIYAYOVerbExplorerAdaptiveStateBridge = sandbox.SIYAYOVerbExplorerAdaptiveStateBridge;
missingProfileSandbox.SIYAYOVerbExplorerAdaptiveCoordinatorConfig = sandbox.SIYAYOVerbExplorerAdaptiveCoordinatorConfig;
vm.runInContext(
  fs.readFileSync('js/verb-explorer-next-session-activation.js', 'utf8'),
  missingProfileSandbox
);
assert.equal(
  missingProfileSandbox.SIYAYOVerbExplorerNextSessionActivation.activate({
    transitionAuthorization: authorization,
    previousSession: s1,
    passContract
  }),
  null,
  'missing retained Green Profile must fail closed before activation'
);

console.log(
  'Verb Explorer next Session activation: PASS — S2 is born from transition authority, live state moves to the new Experience, Coordinator receives a fresh contract context, priorEvidence stays informational, and S1 operational packets do not leak.'
);
