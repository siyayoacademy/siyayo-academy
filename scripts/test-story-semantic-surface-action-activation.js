const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const appCode = fs.readFileSync(
  "js/app.js",
  "utf8"
);

const intents = [];
let delegatedClickHandler = null;

const actionChoiceMenu = {
  dataset: {
    actionChoiceFor: "question-choice"
  }
};

const exploreButton = {
  dataset: {
    surfaceAction: "explore"
  },
  closest(selector) {
    if (selector === "[data-surface-action]") {
      return this;
    }

    if (selector === "[data-action-choice-for]") {
      return actionChoiceMenu;
    }

    return null;
  }
};

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

sandbox
  .SIYAYOStorySemanticSurfaceInteractionIntent = {
    create(input) {
      intents.push(input);

      return Object.freeze({
        surfaceId: input.surfaceId,
        action: input.action
      });
    }
  };

vm.createContext(sandbox);
vm.runInContext(appCode, sandbox);

assert.strictEqual(
  typeof sandbox.initializeSemanticSurfaceActionChoiceEvents,
  "function",
  "explicit Action Choice activation must use a stable delegated event boundary"
);

sandbox.initializeSemanticSurfaceActionChoiceEvents();

assert.strictEqual(
  typeof delegatedClickHandler,
  "function",
  "Action Choice event boundary must listen for delegated button activation"
);

delegatedClickHandler({
  target: exploreButton
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(intents)),
  [
    {
      surfaceId: "question-choice",
      action: "explore"
    }
  ],
  "explicit Explore button activation must create Explore intent for the owning Surface"
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
  "Action button activation may delegate explicit Select to Leaf Selection but must not own Target or readiness"
);

console.log(
  "Story Surface explicit action activation: OK"
);
