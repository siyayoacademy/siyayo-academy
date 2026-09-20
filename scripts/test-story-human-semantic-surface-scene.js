const fs = require("fs");
const assert = require("assert");
const vm = require("vm");

const scene = JSON.parse(
  fs.readFileSync(
    "scripts/fixtures/story-human-semantic-surface-scene.json",
    "utf8"
  )
);

const leafSurfaceCode = fs.readFileSync(
  "js/story-assessment-leaf-surface.js",
  "utf8"
);

const actionChoiceCode = fs.readFileSync(
  "js/story-semantic-surface-action-choice.js",
  "utf8"
);

const sandbox = { Object };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(leafSurfaceCode, sandbox);
vm.runInContext(actionChoiceCode, sandbox);

const item =
  scene.chapter.sections[0].items[0];

const binding =
  sandbox.SIYAYOStoryAssessmentLeafSurface.read(item);

assert.ok(
  binding,
  "controlled scene must expose one explicit Assessment Leaf binding"
);

assert.strictEqual(
  binding.surfaceId,
  "question-choice",
  "Assessment Leaf must bind only to question-choice"
);

const questionChoice =
  sandbox.SIYAYOStorySemanticSurfaceActionChoice.describe({
    surfaceId: "question-choice",
    selectAvailable:
      binding.surfaceId === "question-choice"
  });

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(questionChoice)),
  {
    surfaceId: "question-choice",
    actions: ["explore", "select"]
  },
  "Leaf-bound question-choice Surface must expose Explore + Select"
);

const decisionAgent =
  sandbox.SIYAYOStorySemanticSurfaceActionChoice.describe({
    surfaceId: "decision-agent",
    selectAvailable:
      binding.surfaceId === "decision-agent"
  });

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(decisionAgent)),
  {
    surfaceId: "decision-agent",
    actions: ["explore"]
  },
  "non-Leaf decision-agent Surface must expose Explore only"
);

console.log(
  "Controlled human semantic Surface scene: OK"
);
