const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const appCode = fs.readFileSync(
  "js/app.js",
  "utf8"
);

const intents = [];

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

const actionChoiceMenu = {
  dataset: {
    actionChoiceFor: "question-choice"
  },
  addEventListener(type, handler) {
    if (type === "click") {
      this.clickHandler = handler;
    }
    if (type === "keydown") {
      this.keyHandler = handler;
    }
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
    addEventListener() {},
    querySelectorAll(selector) {
      if (selector === ".language-line") {
        return [];
      }
      if (
        selector ===
        ".semantic-surface-action-choice"
      ) {
        return [actionChoiceMenu];
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

sandbox.attachSliderEvents();

actionChoiceMenu.clickHandler({
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

assert.strictEqual(
  /StoryAssessmentLeafSelection|LeafAssessmentTargetProvider|ReadinessTrigger|LiveStart/.test(
    appCode.slice(
      appCode.indexOf(
        "function attachSliderEvents"
      )
    )
  ),
  false,
  "Action button activation must not yet own Assessment or readiness"
);

console.log(
  "Story Surface explicit action activation: OK"
);
