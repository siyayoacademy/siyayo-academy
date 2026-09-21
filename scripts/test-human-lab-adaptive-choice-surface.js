#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const listeners = [];
const clickListeners = [];
const mounted = [];
const feedback = {
  innerHTML: '',
  querySelector(selector) {
    if (selector.includes('is-valid') || selector.includes('is-invalid')) {
      if (!/choice-feedback-card is-(?:valid|invalid)/.test(this.innerHTML)) return null;
      const valid = /choice-feedback-card is-valid/.test(this.innerHTML);
      return {
        classList: {
          contains(name) {
            return name === 'is-valid' ? valid : name === 'is-invalid' ? !valid : false;
          }
        },
        querySelector() {
          return null;
        }
      };
    }

    if (selector.includes('is-contextual')) {
      if (!/choice-feedback-card is-contextual/.test(this.innerHTML)) return null;
      const match = this.innerHTML.match(/<p>\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*<\/p>/);
      return {
        classList: {
          contains(name) {
            return name === 'is-contextual';
          }
        },
        querySelector(query) {
          return query === 'p' && match
            ? { textContent: match[1] + ' / ' + match[2] }
            : null;
        }
      };
    }

    return null;
  }
};
let submitCalls = 0;
let submitted = null;
const coordinatedResult = Object.freeze({
  cycleResult: Object.freeze({
    recommendation: Object.freeze({ action: 'continue-assessment' }),
    advanceSelection: null,
    nextContext: Object.freeze({ currentExperience: 'shopping-for-dinner' })
  }),
  convergenceResult: null,
  dispatchResult: null
});

const document = {
  addEventListener(type, handler) {
    if (type === 'click') clickListeners.push(handler);
  },
  getElementById(id) {
    return id === 'choiceFeedback' ? feedback : null;
  },
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

const choiceContext = Object.freeze({ id: 'choice-context' });
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
  submitChoice(choice, target, learnerEvent) {
    submitCalls += 1;
    submitted = { choice, target, learnerEvent };
    return coordinatedResult;
  }
});
let observedState = {
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceQuestion: null,
  experienceChoiceCandidate: null
};
sandbox.SIYAYOVerbExplorerResumeRuntime = Object.freeze({
  observeChoice(event) {
    if (!event || event.source !== 'choice-select') return false;
    observedState = {
      currentExperienceId: event.experienceId,
      experienceLanguage: 'en',
      experienceQuestion: event.question,
      experienceChoiceCandidate: event.choice
    };
    return true;
  },
  captureContext() {
    return { ...observedState };
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
    return Object.freeze({ resolved: true, choiceContext });
  }
});
sandbox.AdaptiveChoicePresenter = Object.freeze({
  present(resolved) {
    assert.equal(resolved.resolved, true);
    assert.strictEqual(resolved.choiceContext, choiceContext);
    return presentation;
  }
});
const resolver = Object.freeze({
  id: 'canonical-choice-resolver',
  resolveChoice() {
    throw new Error('stub resolver must be delegated through the Resolution Presenter');
  }
});
sandbox.SIYAYOChoiceResolver = resolver;
sandbox.AdaptiveChoiceResolutionPresenter = Object.freeze({
  present(receivedContext, candidateId, language, receivedResolver) {
    assert.strictEqual(receivedContext, choiceContext);
    assert.equal(candidateId, 'fresh-mild-cheese');
    assert.equal(language, 'en');
    assert.strictEqual(receivedResolver, resolver);
    return Object.freeze({
      candidateId,
      language,
      canonicalForm: Object.freeze({
        valid: true,
        status: 'Valid canonical candidate',
        response: 'We should choose the fresh, mild cheese.'
      }),
      contextualResponse: Object.freeze({
        status: 'Best contextual fit',
        score: 4,
        possibleScore: 4
      })
    });
  }
});

vm.runInContext(
  fs.readFileSync('js/verb-explorer-learner-event.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-learner-event.js' }
);
vm.runInContext(
  fs.readFileSync('js/adaptive-choice-browser-wire.js', 'utf8'),
  sandbox,
  { filename: 'js/adaptive-choice-browser-wire.js' }
);
for (const file of [
  'js/choice-evidence-evaluator.js',
  'js/verb-explorer-choice-resolution-reader.js',
  'js/verb-explorer-choice-evidence-bridge.js'
]) {
  vm.runInContext(
    fs.readFileSync(file, 'utf8'),
    sandbox,
    { filename: file }
  );
}

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
  assert.match(mounted[0].html, /human-lab-choice-line-en/);
  assert.match(mounted[0].html, /human-lab-choice-line-es/);
  assert.match(mounted[0].html, /human-lab-choice-line-pt/);
  assert.match(mounted[0].html, /human-lab-choice-lang-code[^>]*>EN</);
  assert.match(mounted[0].html, /human-lab-choice-lang-code[^>]*>ES</);
  assert.match(mounted[0].html, /human-lab-choice-lang-code[^>]*>PT</);
  assert.match(mounted[0].html, /id="choiceFeedback"/);
  assert.equal(submitCalls, 0, 'surface mounting must not submit before a learner click');
  assert.equal(
    /preferredTraits|contextTraits|correctAlternativeId/.test(mounted[0].html),
    false,
    'surface must not expose ranking or correctness authority'
  );

  assert.equal(clickListeners.length, 1, 'mounted Choice surface must install exactly one learner click boundary');

  const target = {
    dataset: { choiceSelect: 'fresh-mild-cheese' },
    closest(selector) {
      return selector === '[data-choice-select]' ? this : null;
    }
  };

  clickListeners[0]({ target });

  const observed = sandbox.SIYAYOHumanLabAdaptiveChoiceSurface.getLastObservedEvent();
  assert.ok(observed, 'authorized human click must become an observed LearnerEvent');
  assert.equal(observed.source, 'choice-select');
  assert.equal(observed.choice, 'fresh-mild-cheese');
  assert.equal(observed.experienceId, 'shopping-for-dinner');
  assert.equal(observed.question, 'Which cheese should we choose?');
  assert.match(observed.occurrenceId, /^choice-select:\d+$/);
  const groundedState = sandbox.SIYAYOVerbExplorerResumeRuntime.captureContext();
  assert.equal(groundedState.currentExperienceId, 'shopping-for-dinner');
  assert.equal(groundedState.experienceLanguage, 'en');
  assert.equal(groundedState.experienceQuestion, 'Which cheese should we choose?');
  assert.equal(groundedState.experienceChoiceCandidate, 'fresh-mild-cheese');
  assert.match(feedback.innerHTML, /choice-feedback-card is-valid/);
  assert.match(feedback.innerHTML, /choice-feedback-card is-contextual/);
  assert.match(feedback.innerHTML, /4 \/ 4/);
  assert.match(feedback.innerHTML, /Valid canonical candidate/);
  assert.match(feedback.innerHTML, /Best contextual fit/);
  assert.match(feedback.innerHTML, /semantic-feedback-shell/);
  assert.match(feedback.innerHTML, /semantic-feedback-grid/);
  assert.match(feedback.innerHTML, /choice-feedback-card--canonical/);
  assert.match(feedback.innerHTML, /choice-feedback-card--contextual/);
  assert.match(feedback.innerHTML, /choice-feedback-kicker[^>]*>Canonical Form</);
  assert.match(feedback.innerHTML, /choice-feedback-kicker[^>]*>Contextual Response</);
  assert.match(feedback.innerHTML, /choice-feedback-score-ring/);
  assert.match(feedback.innerHTML, /--score-angle:360deg/);

  const evidence = sandbox.SIYAYOVerbExplorerChoiceEvidenceBridge.read(
    groundedState,
    document
  );
  assert.ok(evidence, 'rendered semantic resolution must be readable as grounded Choice Evidence');
  assert.equal(evidence.dimension, 'choice-function');
  assert.equal(evidence.result, 'pass');
  assert.equal(evidence.context.currentExperienceId, 'shopping-for-dinner');
  assert.equal(evidence.context.experienceLanguage, 'en');
  assert.equal(evidence.context.experienceQuestion, 'Which cheese should we choose?');
  assert.equal(evidence.context.experienceChoiceCandidate, 'fresh-mild-cheese');
  assert.equal(
    Object.prototype.hasOwnProperty.call(evidence, 'attempt'),
    false,
    'Evidence must not contain or fabricate Attempt'
  );
  assert.equal(submitCalls, 1, 'one learner click must reach the configured Coordinator exactly once');
  assert.ok(submitted);
  assert.equal(submitted.choice, 'fresh-mild-cheese');
  assert.strictEqual(submitted.target, target);
  assert.strictEqual(submitted.learnerEvent, observed, 'the already-observed LearnerEvent must be reused');
  assert.strictEqual(
    sandbox.SIYAYOHumanLabAdaptiveChoiceSurface.getLastCycleResult(),
    coordinatedResult,
    'Human Lab must expose the Coordinator envelope for inspection'
  );
  assert.equal(coordinatedResult.cycleResult.recommendation.action, 'continue-assessment');
  assert.equal(coordinatedResult.cycleResult.advanceSelection, null);
  assert.equal(coordinatedResult.cycleResult.nextContext.currentExperience, 'shopping-for-dinner');

  const labCss = fs.readFileSync(
    'labs/human-semantic-surface/lab.css',
    'utf8'
  );
  assert.match(labCss, /\.human-lab-adaptive-choice-options\s*\{[\s\S]*display:\s*grid/);
  assert.match(labCss, /\.semantic-feedback-grid\s*\{[\s\S]*grid-template-columns/);
  assert.match(labCss, /backdrop-filter:/);
  assert.match(labCss, /conic-gradient\(/);
  assert.match(labCss, /:focus-visible/);
  assert.match(labCss, /@media\s*\(max-width:\s*720px\)/);
  assert.match(labCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(labCss, /@keyframes\s+semanticReveal/);

  console.log(
    'Human Lab adaptive Choice surface: PASS — one real click keeps the homologated adaptive path and renders trilingual Choice plates plus responsive dual semantic feedback with circular score and reduced-motion support.'
  );
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
