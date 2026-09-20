const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const attentionCode = fs.readFileSync(
  "js/story-semantic-surface-attention.js",
  "utf8"
);
const appCode = fs.readFileSync("js/app.js", "utf8");

const focused = [];
const surface = {
  dataset: { surfaceId: "question-choice" },
  closest(selector) {
    return selector === "[data-surface-id]" ? this : null;
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
        return [{
          dataset: { language: "en" },
          addEventListener(type, handler) {
            if (type === "click") {
              this.clickHandler = handler;
            }
            if (type === "keydown") {
              this.keyHandler = handler;
            }
          }
        }];
      }
      return [];
    },
    getElementById() { return null; },
    querySelector() { return null; }
  }
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(attentionCode, sandbox);
sandbox.SIYAYOStorySemanticSurfaceAttention = {
  focus(input) {
    focused.push(input);
    return { surfaceId: input.surfaceId };
  }
};
vm.runInContext(appCode, sandbox);

sandbox.attachSliderEvents();
const line = sandbox.document.querySelectorAll(".language-line")[0];

line.clickHandler({ target: surface });
assert.deepStrictEqual(
  focused,
  [{ surfaceId: "question-choice" }],
  "Surface click must focus the explicit semantic Surface"
);

focused.length = 0;
let prevented = false;
line.keyHandler({
  key: "Enter",
  target: surface,
  preventDefault() { prevented = true; }
});
assert.deepStrictEqual(
  focused,
  [{ surfaceId: "question-choice" }],
  "Surface Enter must focus the same explicit semantic Surface"
);
assert.strictEqual(
  prevented,
  true,
  "handled Surface keyboard activation must prevent default"
);

assert.strictEqual(
  /InteractionIntent\.create|StoryAssessmentLeafSelection|LeafAssessmentTargetProvider|ReadinessTrigger|LiveStart/.test(
    appCode.slice(appCode.indexOf("function attachSliderEvents"))
  ),
  false,
  "Surface activation must not choose intent, Assessment, or readiness"
);

console.log("Story semantic Surface attention activation: OK");
