#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

assert.equal(
  fs.existsSync('js/verb-explorer-learner-trail-surface.js'),
  true,
  'read-only learner trail surface must exist before visual progress is shown live'
);

const container = {
  hidden: true,
  innerHTML: '',
  dataset: {}
};

const listeners = { click: [] };
const documentRef = {
  getElementById(id) {
    return id === 'learnerTrailSurface' ? container : null;
  },
  addEventListener(type, handler) {
    (listeners[type] || (listeners[type] = [])).push(handler);
  }
};

let marker = Object.freeze({
  status: 'PROGRESS_MARKER_READY',
  skill: 'which.use.determiner',
  state: 'UNOBSERVED',
  marker: 'EMPTY_DOT',
  confirmedExperiences: 0
});

const profile = Object.freeze({ id: 'learner-trail-surface' });
const sandbox = vm.createContext({
  Object,
  Promise,
  document: documentRef,
  SIYAYOVerbExplorerAdaptiveEvidenceProfileSource: Object.freeze({
    getProfile() { return profile; }
  }),
  SIYAYOVerbExplorerCanonicalSkillSource: Object.freeze({
    getSkill() { return 'which.use.determiner'; },
    getDefinition() {
      return Object.freeze({
        id: 'which.use.determiner',
        form: 'which',
        family: 'question-word',
        grammarRole: 'interrogative-determiner'
      });
    }
  }),
  AdaptiveLearnerTrailLabel: Object.freeze({
    project(definition) {
      assert.equal(definition.id, 'which.use.determiner');
      return Object.freeze({
        status: 'TRAIL_LABEL_READY',
        skill: 'which.use.determiner',
        form: 'WHICH',
        family: 'QUESTION WORD',
        grammarRole: 'INTERROGATIVE DETERMINER'
      });
    }
  }),
  AdaptiveLearnerTrailView: Object.freeze({
    project(receivedProfile, skill) {
      assert.strictEqual(receivedProfile, profile);
      assert.equal(skill, 'which.use.determiner');
      return Object.freeze({
        status: marker.state === 'UNOBSERVED' ? 'TRAIL_EMPTY' : 'TRAIL_AVAILABLE',
        skill,
        state: marker.state,
        counts: Object.freeze({
          footprints: marker.state === 'UNOBSERVED' ? 0 : 2,
          greenPassClosures: marker.confirmedExperiences
        }),
        footprints: Object.freeze([])
      });
    }
  }),
  AdaptiveLearnerTrailSequence: Object.freeze({
    project(trail) {
      assert.equal(trail.skill, 'which.use.determiner');
      if (marker.state === 'UNOBSERVED') {
        return Object.freeze({
          status: 'TRAIL_SEQUENCE_EMPTY',
          skill: trail.skill,
          segments: Object.freeze([])
        });
      }
      const segments = marker.state === 'CONSOLIDATED_EVIDENCE'
        ? [
            Object.freeze({
              experienceId: 'shopping-for-dinner',
              state: 'CONFIRMED',
              marker: 'FILLED_DOT',
              footprints: 1,
              greenPassClosures: 1
            }),
            Object.freeze({
              experienceId: 'preparing-dinner',
              state: 'CONFIRMED',
              marker: 'FILLED_DOT',
              footprints: 1,
              greenPassClosures: 1
            })
          ]
        : [
            Object.freeze({
              experienceId: 'shopping-for-dinner',
              state: marker.state === 'CONFIRMED' ? 'CONFIRMED' : 'IN_PROGRESS',
              marker: marker.state === 'CONFIRMED' ? 'FILLED_DOT' : 'PARTIAL_DOT',
              footprints: 1,
              greenPassClosures: marker.state === 'CONFIRMED' ? 1 : 0
            })
          ];
      return Object.freeze({
        status: 'TRAIL_SEQUENCE_AVAILABLE',
        skill: trail.skill,
        segments: Object.freeze(segments)
      });
    }
  }),
  AdaptiveLearnerTrailPosition: Object.freeze({
    resolve(sequence, currentExperienceId) {
      const index = sequence.segments.findIndex(item => item.experienceId === currentExperienceId);
      return Object.freeze({
        status: 'TRAIL_POSITION_READY',
        skill: sequence.skill,
        currentExperienceId,
        visited: index >= 0,
        segmentIndex: index
      });
    }
  }),
  SIYAYOVerbExplorerAdaptiveStateBridge: Object.freeze({
    getState() {
      return Object.freeze({
        currentExperienceId:
          marker.state === 'CONSOLIDATED_EVIDENCE'
            ? 'preparing-dinner'
            : 'shopping-for-dinner'
      });
    }
  }),
  AdaptiveLearnerProgressMarker: Object.freeze({
    resolve() { return marker; }
  })
});
sandbox.globalThis = sandbox;

vm.runInContext(
  fs.readFileSync('js/verb-explorer-learner-trail-surface.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-learner-trail-surface.js' }
);

const Surface = sandbox.SIYAYOVerbExplorerLearnerTrailSurface;
assert.ok(Surface);
assert.equal(typeof Surface.refresh, 'function');
assert.equal(typeof Surface.install, 'function');

assert.equal(Surface.refresh({ document: documentRef }), true);
assert.equal(container.hidden, false);
assert.equal(container.dataset.marker, 'EMPTY_DOT');
assert.equal(container.dataset.state, 'UNOBSERVED');
assert.match(container.innerHTML, /○/);
assert.match(container.innerHTML, /WHICH/);
assert.match(container.innerHTML, /QUESTION WORD/);
assert.match(container.innerHTML, /INTERROGATIVE DETERMINER/);
assert.doesNotMatch(container.innerHTML, /which\.use\.determiner/);
assert.doesNotMatch(container.innerHTML, /<button/i);
assert.doesNotMatch(container.innerHTML, /onclick=/i);
assert.doesNotMatch(container.innerHTML, /audio/i);
assert.doesNotMatch(container.innerHTML, /mastery/i);
assert.doesNotMatch(container.innerHTML, /score/i);

assert.equal(Surface.install({ document: documentRef }), true);
assert.equal(Surface.install({ document: documentRef }), false, 'surface wire installs once');
assert.equal(listeners.click.length, 1);

marker = Object.freeze({
  status: 'PROGRESS_MARKER_READY',
  skill: 'which.use.determiner',
  state: 'CONFIRMED',
  marker: 'FILLED_DOT',
  confirmedExperiences: 1
});

for (const handler of listeners.click) handler({ target: {} });

Promise.resolve().then(function(){
  assert.equal(container.dataset.marker, 'FILLED_DOT');
  assert.equal(container.dataset.state, 'CONFIRMED');
  assert.match(container.innerHTML, /●/);
  assert.match(container.innerHTML, /CONFIRMED/);

  marker = Object.freeze({
    status: 'PROGRESS_MARKER_READY',
    skill: 'which.use.determiner',
    state: 'CONSOLIDATED_EVIDENCE',
    marker: 'MILESTONE',
    confirmedExperiences: 2
  });
  for (const handler of listeners.click) handler({ target: {} });
  return Promise.resolve();
}).then(function(){
  assert.equal(container.dataset.marker, 'MILESTONE');
  assert.equal(container.dataset.state, 'CONSOLIDATED_EVIDENCE');
  assert.match(container.innerHTML, /★/);
  assert.match(container.innerHTML, /2 CONTEXTS/);
  assert.match(container.innerHTML, /shopping-for-dinner/);
  assert.match(container.innerHTML, /preparing-dinner/);
  assert.match(container.innerHTML, /aria-current="step"/);
  assert.match(container.innerHTML, /data-current="true"/);
  assert.doesNotMatch(container.innerHTML, /<button/i);

  console.log(
    'Verb Explorer learner trail surface: PASS — ○/◐/●/★ render as a read-only view of canonical Trail state and refresh after learner interaction without creating progression, score, mastery, or sound.'
  );
}).catch(function(error){
  console.error(error);
  process.exitCode = 1;
});
