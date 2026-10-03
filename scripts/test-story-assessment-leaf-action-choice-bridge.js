const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const appCode = fs.readFileSync(
  "js/app.js",
  "utf8"
);

const choices = [];

const languageLine = {
  dataset: { language: "en" },
  addEventListener(type, handler) {
    if (type === "click") {
      this.clickHandler = handler;
    }
    if (type === "keydown") {
      this.keyHandler = handler;
    }
  },
  insertAdjacentHTML() {}
};

function makeSurface(surfaceId) {
  return {
    dataset: { surfaceId },
    closest(selector) {
      if (selector === "[data-surface-id]") {
        return this;
      }
      return null;
    }
  };
}

const sandbox = {
  console,
  speechSynthesis: {
    cancel() {},
    speak() {}
  },
  SpeechSynthesisUtterance: function() {},
  fetch: async () => ({ ok: false }),
  document: {
    addEventListener() {},
    querySelectorAll(selector) {
      if (selector === ".language-line") {
        return [languageLine];
      }
      return [];
    },
    getElementById() {
      return null;
    },
    querySelector() {
      return null;
    }
  }
};

sandbox.globalThis = sandbox;
sandbox.window = {
  addEventListener() {}
};

sandbox.SIYAYOStorySemanticSurfaceAttention = {
  focus(input) {
    return {
      surfaceId: input.surfaceId
    };
  }
};

sandbox.SIYAYOStoryAssessmentLeafSurface = {
  read(slide) {
    if (!slide || !slide.assessmentLeaf) {
      return null;
    }

    return {
      surfaceId:
        slide.assessmentLeaf.anchorSurfaceId,
      leaf:
        slide.assessmentLeaf
    };
  }
};

sandbox.SIYAYOStorySemanticSurfaceActionChoice = {
  describe(input) {
    choices.push(input);

    return {
      surfaceId: input.surfaceId,
      actions:
        input.selectAvailable === true
          ? ["explore", "select"]
          : ["explore"]
    };
  }
};

sandbox
  .SIYAYOStorySemanticSurfaceActionChoiceDOMMaterialization = {
    describe(choice) {
      return {
        surfaceId: choice.surfaceId,
        actions: choice.actions.map(
          action => ({
            action,
            type: "button"
          })
        )
      };
    }
  };

vm.createContext(sandbox);
vm.runInContext(appCode, sandbox);

vm.runInContext(
  `
    currentSlides = [{
      type: "example",
      surfaces: [
        {
          id: "question-choice",
          realizations: { en: "Which" }
        },
        {
          id: "decision-agent",
          realizations: { en: "we" }
        }
      ],
      assessmentLeaf: {
        anchorSurfaceId: "question-choice",
        assessmentTarget: {
          skill: "which.use.determiner",
          definitionPath:
            "data/learning/skills/which.json"
        }
      }
    }];
    currentSlideIndex = 0;
  `,
  sandbox
);

sandbox.attachSliderEvents();

languageLine.clickHandler({
  target:
    makeSurface(
      "question-choice"
    )
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(choices)),
  [
    {
      surfaceId: "question-choice",
      selectAvailable: true
    }
  ],
  "Leaf-bound Surface must request Action Choice with Select explicitly available"
);

choices.length = 0;

languageLine.clickHandler({
  target:
    makeSurface(
      "decision-agent"
    )
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(choices)),
  [
    {
      surfaceId: "decision-agent",
      selectAvailable: false
    }
  ],
  "non-Leaf Surface must request Explore-only Action Choice"
);

console.log(
  "Story Assessment Leaf binding gates Select availability: OK"
);
