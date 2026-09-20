const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const appCode = fs.readFileSync(
  "js/app.js",
  "utf8"
);

const intents = [];
const selections = [];
let delegatedClickHandler = null;

const slide = {
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
};

function makeMenu(surfaceId) {
  return {
    dataset: {
      actionChoiceFor: surfaceId
    }
  };
}

function makeButton(action, menu) {
  return {
    dataset: {
      surfaceAction: action
    },
    closest(selector) {
      if (selector === "[data-surface-action]") {
        return this;
      }
      if (selector === "[data-action-choice-for]") {
        return menu;
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
    addEventListener(type, handler) {
      if (type === "click") {
        delegatedClickHandler = handler;
      }
    },
    querySelectorAll() {
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

sandbox.SIYAYOStorySemanticSurfaceInteractionIntent = {
  create(input) {
    intents.push(input);
    return Object.freeze({
      surfaceId: input.surfaceId,
      action: input.action
    });
  }
};

sandbox.SIYAYOStoryAssessmentLeafSurface = {
  read(scene) {
    if (!scene || !scene.assessmentLeaf) {
      return null;
    }
    return Object.freeze({
      surfaceId:
        scene.assessmentLeaf.anchorSurfaceId,
      leaf:
        scene.assessmentLeaf
    });
  }
};

sandbox.SIYAYOStoryAssessmentLeafSelection = {
  select(scene) {
    selections.push(scene);
    return Promise.resolve(true);
  }
};

vm.createContext(sandbox);
vm.runInContext(appCode, sandbox);

vm.runInContext(
  `
    currentSlides = [{"type":"example","surfaces":[{"id":"question-choice","realizations":{"en":"Which"}},{"id":"decision-agent","realizations":{"en":"we"}}],"assessmentLeaf":{"anchorSurfaceId":"question-choice","assessmentTarget":{"skill":"which.use.determiner","definitionPath":"data/learning/skills/which.json"}}}];
    currentSlideIndex = 0;
  `,
  sandbox
);

sandbox.initializeSemanticSurfaceActionChoiceEvents();

assert.strictEqual(
  typeof delegatedClickHandler,
  "function",
  "Select Intent bridge must use the stable delegated action boundary"
);

const leafMenu =
  makeMenu("question-choice");

delegatedClickHandler({
  target:
    makeButton(
      "select",
      leafMenu
    )
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(intents)),
  [
    {
      surfaceId: "question-choice",
      action: "select"
    }
  ],
  "explicit Select button must first create Select Intent"
);

assert.strictEqual(
  selections.length,
  1,
  "Leaf-bound Select Intent must invoke Assessment Leaf Selection exactly once"
);

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(selections[0])),
  JSON.parse(JSON.stringify(slide)),
  "Assessment Leaf Selection must receive the current explicit slide"
);

intents.length = 0;
selections.length = 0;

const ordinaryMenu =
  makeMenu("decision-agent");

delegatedClickHandler({
  target:
    makeButton(
      "select",
      ordinaryMenu
    )
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(intents)),
  [
    {
      surfaceId: "decision-agent",
      action: "select"
    }
  ],
  "explicit Select gesture may create Select Intent before Leaf validation"
);

assert.strictEqual(
  selections.length,
  0,
  "Select Intent on a non-Leaf Surface must WAIT rather than select another Leaf"
);

intents.length = 0;

delegatedClickHandler({
  target:
    makeButton(
      "explore",
      leafMenu
    )
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(intents)),
  [
    {
      surfaceId: "question-choice",
      action: "explore"
    }
  ],
  "Explore must remain a distinct explicit intent"
);

assert.strictEqual(
  selections.length,
  0,
  "Explore Intent must never invoke Assessment Leaf Selection"
);

const functionStart =
  appCode.indexOf(
    "function initializeSemanticSurfaceActionChoiceEvents"
  );

const functionEnd =
  appCode.indexOf(
    "/* ========================================",
    functionStart + 1
  );

const functionCode =
  appCode.slice(
    functionStart,
    functionEnd
  );

assert.strictEqual(
  /LeafAssessmentTargetProvider|ReadinessTrigger|LiveStart/.test(
    functionCode
  ),
  false,
  "Select Intent bridge must delegate to Leaf Selection without owning Target or readiness"
);

console.log(
  "Story Select Intent to Assessment Leaf Selection bridge: OK"
);
