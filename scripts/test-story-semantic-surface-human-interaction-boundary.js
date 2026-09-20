const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const appCode = fs.readFileSync("js/app.js", "utf8");

function createTarget({ surface = false, targetWord = false } = {}) {
  return {
    closest(selector) {
      if (surface && selector === "[data-surface-id]") {
        return this;
      }
      if (targetWord && selector === ".target-word") {
        return this;
      }
      return null;
    }
  };
}

function createHarness() {
  const listeners = {};
  const speechCalls = [];

  const line = {
    dataset: { language: "en" },
    addEventListener(type, handler) {
      listeners[type] = handler;
    }
  };

  const document = {
    addEventListener() {},
    getElementById() { return null; },
    querySelectorAll(selector) {
      return selector === ".language-line" ? [line] : [];
    },
    querySelector() { return null; }
  };

  const sandbox = {
    console: { log() {}, warn() {}, error() {} },
    fetch: async () => ({ ok: false }),
    document,
    navigator: {},
    window: {
      addEventListener() {},
      speechSynthesis: {
        cancel() {},
        speak() {}
      }
    },
    SpeechSynthesisUtterance: function () {},
    setTimeout,
    clearTimeout
  };

  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(appCode, sandbox, { filename: "js/app.js" });

  sandbox.speakLanguageLine = language => {
    speechCalls.push(language);
  };

  sandbox.attachSliderEvents();

  return { listeners, speechCalls };
}

{
  const { listeners, speechCalls } = createHarness();

  listeners.click({
    target: createTarget({ surface: true })
  });

  assert.deepStrictEqual(
    speechCalls,
    [],
    "click originating on an explicit semantic Surface must not trigger language-line speech"
  );
}

for (const key of ["Enter", " "]) {
  const { listeners, speechCalls } = createHarness();
  let prevented = false;

  listeners.keydown({
    key,
    target: createTarget({ surface: true }),
    preventDefault() { prevented = true; }
  });

  assert.deepStrictEqual(
    speechCalls,
    [],
    key + " originating on an explicit semantic Surface must not trigger language-line speech"
  );

  assert.strictEqual(
    prevented,
    false,
    "Surface boundary must not consume " + key + " before an interaction intent owns it"
  );
}

{
  const { listeners, speechCalls } = createHarness();

  listeners.click({
    target: createTarget()
  });

  assert.deepStrictEqual(
    speechCalls,
    ["en"],
    "ordinary language-line click must retain speech behavior"
  );
}

assert.ok(
  !/StoryAssessmentLeafSelection\.select\s*\(/.test(appCode),
  "Surface event boundary must not directly select an Assessment Leaf"
);

assert.ok(
  !/LeafAssessmentTargetProvider\.select\s*\(/.test(appCode),
  "Surface event boundary must not directly call the Assessment Target provider"
);

console.log(
  "Story semantic Surface human interaction boundary contract: OK"
);
