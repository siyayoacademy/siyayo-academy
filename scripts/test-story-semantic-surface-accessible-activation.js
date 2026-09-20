const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const appCode = fs.readFileSync("js/app.js", "utf8");

const sandbox = {
  console: { log() {}, warn() {}, error() {} },
  fetch: async () => ({ ok: false }),
  document: {
    addEventListener() {},
    getElementById() { return null; },
    querySelectorAll() { return []; },
    querySelector() { return null; }
  },
  navigator: {},
  window: {
    addEventListener() {},
    speechSynthesis: { cancel() {}, speak() {} }
  },
  SpeechSynthesisUtterance: function () {},
  setTimeout,
  clearTimeout
};

sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(appCode, sandbox, { filename: "js/app.js" });

const lines = [{
  language: "en",
  label: "IN ENGLISH",
  text: "Which cheese should we choose?",
  target: "Which"
}];

const surfaces = [{
  id: "question-choice",
  realizations: { en: "Which", es: "Cuál", pt: "Qual" }
}];

sandbox.SIYAYOStorySemanticSurfaceRealization = {
  read(surface, language) {
    const text = surface?.realizations?.[language];
    return text ? { surfaceId: surface.id, language, text } : null;
  }
};

sandbox.SIYAYOStorySemanticSurfaceDOMMaterialization = {
  describe(realization) {
    return {
      surfaceId: realization.surfaceId,
      language: realization.language,
      text: realization.text
    };
  }
};

const html = sandbox.renderLanguageLines(lines, surfaces);

assert.ok(
  /class="[^"]*language-line[^"]*"/.test(html),
  "language line must remain the speech container"
);

assert.ok(
  !/class="[^"]*language-line[^"]*"[^>]*role="button"/s.test(html),
  "language line must not remain an interactive button when it contains a semantic Surface"
);

assert.ok(
  !/class="[^"]*language-line[^"]*"[^>]*tabindex="0"/s.test(html),
  "language line must not own keyboard focus when it contains a semantic Surface"
);

assert.ok(
  /data-surface-id="question-choice"/.test(html),
  "explicit semantic Surface must remain materialized"
);

assert.ok(
  /data-surface-id="question-choice"[^>]*role="button"/s.test(html),
  "semantic Surface must expose one accessible activation control"
);

assert.ok(
  /data-surface-id="question-choice"[^>]*tabindex="0"/s.test(html),
  "semantic Surface must be directly keyboard focusable"
);

assert.ok(
  !/StoryAssessmentLeafSelection\.select\s*\(/.test(appCode),
  "accessible Surface activation must not directly select an Assessment Leaf"
);

assert.ok(
  !/LeafAssessmentTargetProvider\.select\s*\(/.test(appCode),
  "accessible Surface activation must not directly call Assessment Target provider"
);

console.log("Story semantic Surface accessible activation contract: OK");
