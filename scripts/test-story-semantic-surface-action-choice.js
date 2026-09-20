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

const selectableChoice = api.describe({
  surfaceId: "question-choice",
  selectAvailable: true
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(selectableChoice)),
  {
    surfaceId: "question-choice",
    actions: ["explore", "select"]
  },
  "Leaf-bound Surface may expose explicit Explore and Select choices"
);

const exploreOnlyChoice = api.describe({
  surfaceId: "decision-agent",
  selectAvailable: false
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(exploreOnlyChoice)),
  {
    surfaceId: "decision-agent",
    actions: ["explore"]
  },
  "ordinary Surface must expose Explore without Select"
);

const missingSelectionAuthority = api.describe({
  surfaceId: "question-choice"
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(missingSelectionAuthority)),
  {
    surfaceId: "question-choice",
    actions: ["explore"]
  },
  "missing explicit selection availability must fail closed to Explore only"
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
  /InteractionIntent|StoryAssessmentLeafSurface|StoryAssessmentLeafSelection|LeafAssessmentTargetProvider|ReadinessTrigger|LiveStart/.test(code),
  false,
  "Action Choice must not inspect Leaves, create intent, Assessment, or readiness"
);

console.log(
  "Story semantic Surface Action Choice contract: OK"
);
