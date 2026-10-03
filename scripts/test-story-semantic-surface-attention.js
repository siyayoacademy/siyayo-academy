const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const code = fs.readFileSync(
  "js/story-semantic-surface-attention.js",
  "utf8"
);

const sandbox = {};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox, {
  filename: "js/story-semantic-surface-attention.js"
});

const api =
  sandbox.SIYAYOStorySemanticSurfaceAttention;

assert.ok(api, "Semantic Surface Attention API must exist");
assert.strictEqual(typeof api.focus, "function");

const attention = api.focus({
  surfaceId: "question-choice"
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(attention)),
  { surfaceId: "question-choice" },
  "Holofote must preserve only the explicit Surface identity"
);

assert.strictEqual(
  api.focus({}),
  null,
  "missing Surface identity must WAIT"
);

assert.strictEqual(
  api.focus({ surfaceId: "   " }),
  null,
  "blank Surface identity must WAIT"
);

assert.strictEqual(
  /InteractionIntent|StoryAssessmentLeafSelection|LeafAssessmentTargetProvider|ReadinessTrigger|LiveStart/.test(code),
  false,
  "Holofote must not choose intent, Assessment, or runtime readiness"
);

console.log(
  "Story semantic Surface attention / Holofote contract: OK"
);
