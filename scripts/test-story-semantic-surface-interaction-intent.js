const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const code = fs.readFileSync(
  "js/story-semantic-surface-interaction-intent.js",
  "utf8"
);

const sandbox = {};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox, {
  filename: "js/story-semantic-surface-interaction-intent.js"
});

const api =
  sandbox.SIYAYOStorySemanticSurfaceInteractionIntent;

assert.ok(api, "Interaction Intent API must exist");
assert.strictEqual(typeof api.create, "function");

const explore = api.create({
  surfaceId: "question-choice",
  action: "explore"
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(explore)),
  {
    surfaceId: "question-choice",
    action: "explore"
  },
  "explicit explore intent must preserve Surface identity"
);

const select = api.create({
  surfaceId: "question-choice",
  action: "select"
});

assert.deepStrictEqual(
  JSON.parse(JSON.stringify(select)),
  {
    surfaceId: "question-choice",
    action: "select"
  },
  "explicit select intent must remain distinct from explore"
);

assert.strictEqual(
  api.create({
    surfaceId: "question-choice"
  }),
  null,
  "missing action must WAIT rather than infer an intent"
);

assert.strictEqual(
  api.create({
    surfaceId: "question-choice",
    action: "assessment"
  }),
  null,
  "Assessment is not an Interaction Intent action"
);

assert.strictEqual(
  api.create({
    action: "explore"
  }),
  null,
  "missing Surface identity must fail closed"
);

assert.strictEqual(
  /StoryAssessmentLeafSelection|LeafAssessmentTargetProvider|ReadinessTrigger|LiveStart/.test(code),
  false,
  "Interaction Intent must not own Assessment or runtime readiness"
);

console.log(
  "Story semantic Surface Interaction Intent contract: OK"
);
