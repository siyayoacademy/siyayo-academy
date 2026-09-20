const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const appCode = fs.readFileSync(
  "js/app.js",
  "utf8"
);

const materializedChoices = [];
const rendered = [];

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
  insertAdjacentHTML(position, html) {
    rendered.push({ position, html });
  }
};

const surface = {
  dataset: { surfaceId: "question-choice" },
  closest(selector) {
    if (selector === "[data-surface-id]") {
      return this;
    }
    if (selector === ".language-line") {
      return languageLine;
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
    addEventListener() {},
    querySelectorAll(selector) {
      if (selector === ".language-line") {
        return [languageLine];
      }
      return [];
    },
    getElementById() { return null; },
    querySelector() { return null; }
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

sandbox.SIYAYOStorySemanticSurfaceActionChoice = {
  describe(input) {
    return {
      surfaceId: input.surfaceId,
      actions: ["explore", "select"]
    };
  }
};

sandbox
  .SIYAYOStorySemanticSurfaceActionChoiceDOMMaterialization = {
    describe(choice) {
      materializedChoices.push(choice);
      return {
        surfaceId: choice.surfaceId,
        actions: [
          { action: "explore", type: "button" },
          { action: "select", type: "button" }
        ]
      };
    }
  };

vm.createContext(sandbox);
vm.runInContext(appCode, sandbox);

sandbox.attachSliderEvents();

languageLine.clickHandler({
  target: surface
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(materializedChoices)),
  [
    {
      surfaceId: "question-choice",
      actions: ["explore", "select"]
    }
  ],
  "focused Action Choice must request its DOM descriptor"
);

assert.strictEqual(
  rendered.length,
  1,
  "Action Choice must render exactly one visible menu"
);

assert.strictEqual(
  rendered[0].position,
  "afterend",
  "Action Choice menu must be a sibling after the language line"
);

const html = rendered[0].html
  .replace(/\s+/g, " ")
  .trim();

assert.ok(
  html.includes(
    'data-action-choice-for="question-choice"'
  ),
  "rendered menu must preserve explicit Surface identity"
);

assert.ok(
  html.includes(
    'data-surface-action="explore"'
  ),
  "rendered menu must expose Explore explicitly"
);

assert.ok(
  html.includes(
    'data-surface-action="select"'
  ),
  "rendered menu must expose Select explicitly"
);

assert.strictEqual(
  (html.match(/type="button"/g) || []).length,
  2,
  "Explore and Select must be real buttons"
);

assert.strictEqual(
  html.includes("data-surface-id="),
  false,
  "Action controls must not masquerade as Semantic Surfaces"
);

assert.strictEqual(
  /onclick\s*=/.test(html),
  false,
  "rendered Action Choice must remain inert"
);

assert.strictEqual(
  /SIYAYOStorySemanticSurfaceInteractionIntent|StoryAssessmentLeafSelection|LeafAssessmentTargetProvider|ReadinessTrigger|LiveStart/.test(
    appCode
  ),
  false,
  "visual Action Choice must not yet create intent, Assessment, or readiness"
);

console.log(
  "Story Surface Action Choice visual DOM rendering: OK"
);
