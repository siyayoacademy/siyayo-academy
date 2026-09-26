const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const code = fs.readFileSync(
  "js/story-semantic-surface-action-choice-dom-materialization.js",
  "utf8"
);

const sandbox = {};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox, {
  filename:
    "js/story-semantic-surface-action-choice-dom-materialization.js"
});

const api =
  sandbox
    .SIYAYOStorySemanticSurfaceActionChoiceDOMMaterialization;

assert.ok(
  api,
  "Action Choice DOM Materialization API must exist"
);
assert.strictEqual(
  typeof api.describe,
  "function"
);

const descriptor = api.describe({
  surfaceId: "question-choice",
  actions: ["explore", "select"]
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(descriptor)),
  {
    surfaceId: "question-choice",
    actions: [
      {
        action: "explore",
        type: "button"
      },
      {
        action: "select",
        type: "button"
      }
    ]
  },
  "explicit Action Choice must materialize neutral button descriptors"
);

assert.strictEqual(
  api.describe({
    surfaceId: "",
    actions: ["explore", "select"]
  }),
  null,
  "missing Surface identity must WAIT"
);

assert.strictEqual(
  api.describe({
    surfaceId: "question-choice",
    actions: []
  }),
  null,
  "missing explicit actions must WAIT"
);

assert.strictEqual(
  /InteractionIntent|StoryAssessmentLeafSelection|LeafAssessmentTargetProvider|ReadinessTrigger|LiveStart|addEventListener|onclick/.test(
    code
  ),
  false,
  "DOM descriptor must not create handlers, intent, Assessment, or readiness"
);

console.log(
  "Story Surface Action Choice DOM materialization: OK"
);
