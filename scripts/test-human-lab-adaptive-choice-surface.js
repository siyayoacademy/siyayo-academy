#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const listeners = [];
const mounted = [];
let submitCalls = 0;

const document = {
  querySelector(selector) {
    if (selector === '[data-action-choice-for="question-choice"]') {
      return {
        insertAdjacentHTML(position, html) {
          mounted.push({ position, html });
        }
      };
    }
    if (selector === '[data-human-lab-adaptive-choice-for="question-choice"]') {
      return null;
    }
    return null;
  }
};

const presentation = Object.freeze({
  skill: 'which.use.determiner',
  experienceId: 'shopping-for-dinner',
  questionWord: 'which',
  intention: 'choice',
  question: Object.freeze({
    en: 'Which cheese should we choose?',
    es: '¿Qué queso deberíamos elegir?',
    pt: 'Qual queijo devemos escolher?'
  }),
  alternatives: Object.freeze([
    Object.freeze({
      id: 'fresh-mild-cheese',
      response: Object.freeze({
        en: 'We should choose the fresh, mild cheese.',
        es: 'Deberíamos elegir el queso fresco y suave.',
        pt: 'Devemos escolher o queijo fresco e suave.'
      })
    }),
    Object.freeze({
      id: 'aged-strong-cheese',
      response: Object.freeze({
        en: 'We should choose the aged, strong cheese.',
        es: 'Deberíamos elegir el queso curado y fuerte.',
        pt: 'Devemos escolher o queijo maturado e forte.'
      })
    })
  ])
});

const session = Object.freeze({
  decision: Object.freeze({
    skill: 'which.use.determiner',
    experienceId: 'shopping-for-dinner'
  })
});

const definition = Object.freeze({
  id: 'which.use.determiner',
  form: 'which',
  function: Object.freeze({ communicativeIntention: 'choice' })
});

const experiences = Object.freeze([{ id: 'shopping-for-dinner' }]);

const originalSelection = Object.freeze({
  select(slide) {
    listeners.push(slide);
    return Promise.resolve(true);
  }
});

const sandbox = vm.createContext({
  console,
  Promise,
  Object,
  Array,
  document,
  fetch(url) {
    assert.equal(url, '/data/learning/experience-seeds.json');
    return Promise.resolve({
      ok: true,
      json() {
        return Promise.resolve({ items: experiences });
      }
    });
  }
});

sandbox.globalThis = sandbox;
sandbox.SIYAYOStoryAssessmentLeafSelection = originalSelection;
sandbox.SIYAYOVerbExplorerAdaptiveCoordinator = Object.freeze({
  snapshot() {
    return { session };
  },
  submitChoice() {
    submitCalls += 1;
  }
});
sandbox.SIYAYOVerbExplorerCanonicalSkillSource = Object.freeze({
  getDefinition() {
    return definition;
  }
});
sandbox.AdaptiveChoiceContextSource = Object.freeze({
  resolve(receivedSession, receivedDefinition, receivedExperiences) {
    assert.strictEqual(receivedSession, session);
    assert.strictEqual(receivedDefinition, definition);
    assert.strictEqual(receivedExperiences, experiences);
    return Object.freeze({ resolved: true });
  }
});
sandbox.AdaptiveChoicePresenter = Object.freeze({
  present(resolved) {
    assert.equal(resolved.resolved, true);
    return presentation;
  }
});

vm.runInContext(
  fs.readFileSync('labs/human-semantic-surface/lab-adaptive-choice-surface.js', 'utf8'),
  sandbox,
  { filename: 'labs/human-semantic-surface/lab-adaptive-choice-surface.js' }
);

const wrapped = sandbox.SIYAYOStoryAssessmentLeafSelection;
assert.notStrictEqual(wrapped, originalSelection, 'Human Lab wrapper must replace only the exposed selection facade');

const slide = Object.freeze({
  assessmentLeaf: Object.freeze({
    anchorSurfaceId: 'question-choice'
  })
});

wrapped.select(slide).then(result => {
  assert.equal(result, true);
  assert.equal(listeners.length, 1, 'original selection must execute exactly once');
  assert.equal(mounted.length, 1, 'successful Session start must mount exactly one Choice surface');
  assert.equal(mounted[0].position, 'afterend');
  assert.match(mounted[0].html, /data-human-lab-adaptive-choice-for="question-choice"/);
  assert.match(mounted[0].html, /data-choice-select="fresh-mild-cheese"/);
  assert.match(mounted[0].html, /data-choice-select="aged-strong-cheese"/);
  assert.match(mounted[0].html, /Which cheese should we choose\?/);
  assert.equal(submitCalls, 0, 'surface mounting must not submit to Coordinator or Cycle');
  assert.equal(
    /preferredTraits|contextTraits|correctAlternativeId/.test(mounted[0].html),
    false,
    'surface must not expose ranking or correctness authority'
  );

  console.log(
    'Human Lab adaptive Choice surface: PASS — only successful Session start mounts canonical data-choice-select alternatives; mounting creates no Attempt, submission, correctness, or NEXT.'
  );
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
