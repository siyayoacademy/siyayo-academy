const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const code = fs.readFileSync(
  "js/story-semantic-surface-action-choice.js",
  "utf8"
);

const sandbox = {};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox, {
  filename: "js/story-semantic-surface-action-choice.js"
});

const api =
  sandbox.SIYAYOStorySemanticSurfaceActionChoice;

assert.ok(api, "Semantic Surface Action Choice API must exist");
assert.strictEqual(typeof api.describe, "function");

const choice = api.describe({
  surfaceId: "question-choice"
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(choice)),
  {
    surfaceId: "question-choice",
    actions: ["explore", "select"]
  },
  "focused Surface must expose explicit Explore and Select choices"
);

assert.strictEqual(
  api.describe({}),
  null,
  "missing Surface identity must WAIT"
);

assert.strictEqual(
  api.describe({ surfaceId: "   " }),
  null,
  "blank Surface identity must WAIT"
);

assert.strictEqual(
  /InteractionIntent|StoryAssessmentLeafSelection|LeafAssessmentTargetProvider|ReadinessTrigger|LiveStart/.test(code),
  false,
  "Action Choice must describe choices without creating intent, Assessment, or readiness"
);

console.log(
  "Story semantic Surface Action Choice contract: OK"
);
