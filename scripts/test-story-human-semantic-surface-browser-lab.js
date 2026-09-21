const fs = require("fs");
const assert = require("assert");

const labRoot =
  "labs/human-semantic-surface";

const htmlPath =
  labRoot + "/index.html";

const academyPath =
  labRoot + "/data/academy.json";

const chapterPath =
  labRoot + "/data/chapter.json";

const labStylePath =
  labRoot + "/lab.css";

const labIdentityPath =
  labRoot + "/lab-learner-identity.js";

assert.ok(
  fs.existsSync(htmlPath),
  "human Semantic Surface lab route must exist"
);

assert.ok(
  fs.existsSync(academyPath),
  "human lab must own an isolated academy manifest"
);

assert.ok(
  fs.existsSync(chapterPath),
  "human lab must own isolated controlled scene data"
);

assert.ok(
  fs.existsSync(labStylePath),
  "human lab must own scoped visual refinements"
);

assert.ok(
  fs.existsSync(labIdentityPath),
  "human lab must own an explicit lab-only learner identity fixture"
);

const html =
  fs.readFileSync(
    htmlPath,
    "utf8"
  );

for (const src of [
  "../../js/story-semantic-surface-realization.js",
  "../../js/story-semantic-surface-dom-materialization.js",
  "../../js/story-semantic-surface-attention.js",
  "../../js/story-semantic-surface-interaction-intent.js",
  "../../js/story-semantic-surface-action-choice.js",
  "../../js/story-semantic-surface-action-choice-dom-materialization.js",
  "../../js/story-assessment-leaf-surface.js",
  "../../js/story-assessment-leaf.js",
  "../../js/green-pass-authority-policy.js",
  "../../js/leaf-assessment-target-authority.js",
  "../../js/verb-explorer-learner-identity-source.js",
  "../../js/verb-explorer-learner-identity-provider.js",
  "../../js/verb-explorer-canonical-skill-source.js",
  "../../js/verb-explorer-canonical-skill-loader.js",
  "../../js/leaf-canonical-skill-bridge.js",
  "../../js/verb-explorer-adaptive-profile-source.js",
  "../../js/verb-explorer-adaptive-evidence-profile-source.js",
  "../../js/verb-explorer-adaptive-session-source.js",
  "../../js/verb-explorer-adaptive-composer.js",
  "../../js/verb-explorer-adaptive-live-start.js",
  "../../js/verb-explorer-adaptive-readiness-trigger.js",
  "../../js/leaf-assessment-target-readiness.js",
  "../../js/leaf-assessment-target-provider.js",
  "../../js/story-assessment-leaf-selection.js",
  "../../js/app.js"
]) {
  assert.ok(
    html.includes(
      'src="' + src + '"'
    ),
    "human lab must load shared production module " + src
  );
}

assert.ok(
  html.includes(
    'href="../../css/style.css"'
  ),
  "human lab must reuse production styling"
);

assert.ok(
  html.includes(
    'href="lab.css"'
  ),
  "human lab must load its scoped visual refinements after production styling"
);


const leafSurfaceIndex =
  html.indexOf(
    'src="../../js/story-assessment-leaf-surface.js"'
  );

const leafReaderIndex =
  html.indexOf(
    'src="../../js/story-assessment-leaf.js"'
  );

const greenPassAuthorityPolicyIndex =
  html.indexOf(
    'src="../../js/green-pass-authority-policy.js"'
  );

const targetAuthorityIndex =
  html.indexOf(
    'src="../../js/leaf-assessment-target-authority.js"'
  );

const learnerIdentitySourceIndex =
  html.indexOf(
    'src="../../js/verb-explorer-learner-identity-source.js"'
  );

const learnerIdentityProviderIndex =
  html.indexOf(
    'src="../../js/verb-explorer-learner-identity-provider.js"'
  );

const labLearnerIdentityIndex =
  html.indexOf(
    'src="lab-learner-identity.js"'
  );

const canonicalSkillSourceIndex =
  html.indexOf(
    'src="../../js/verb-explorer-canonical-skill-source.js"'
  );

const canonicalSkillLoaderIndex =
  html.indexOf(
    'src="../../js/verb-explorer-canonical-skill-loader.js"'
  );

const leafCanonicalSkillBridgeIndex =
  html.indexOf(
    'src="../../js/leaf-canonical-skill-bridge.js"'
  );

const adaptiveProfileSourceIndex =
  html.indexOf(
    'src="../../js/verb-explorer-adaptive-profile-source.js"'
  );

const adaptiveEvidenceProfileSourceIndex =
  html.indexOf(
    'src="../../js/verb-explorer-adaptive-evidence-profile-source.js"'
  );

const adaptiveSessionSourceIndex =
  html.indexOf(
    'src="../../js/verb-explorer-adaptive-session-source.js"'
  );

const adaptiveComposerIndex =
  html.indexOf(
    'src="../../js/verb-explorer-adaptive-composer.js"'
  );

const adaptiveLiveStartIndex =
  html.indexOf(
    'src="../../js/verb-explorer-adaptive-live-start.js"'
  );

const readinessTriggerIndex =
  html.indexOf(
    'src="../../js/verb-explorer-adaptive-readiness-trigger.js"'
  );

const targetReadinessIndex =
  html.indexOf(
    'src="../../js/leaf-assessment-target-readiness.js"'
  );

const targetProviderIndex =
  html.indexOf(
    'src="../../js/leaf-assessment-target-provider.js"'
  );

const leafSelectionIndex =
  html.indexOf(
    'src="../../js/story-assessment-leaf-selection.js"'
  );

const appIndex =
  html.indexOf(
    'src="../../js/app.js"'
  );

assert.ok(
  leafSurfaceIndex >= 0,
  "human lab must load Story Assessment Leaf Surface"
);

assert.ok(
  leafReaderIndex >= 0,
  "human lab must load Story Assessment Leaf reader"
);

assert.ok(
  greenPassAuthorityPolicyIndex >= 0,
  "human lab must load Green Pass Authority Policy"
);

assert.ok(
  targetAuthorityIndex >= 0,
  "human lab must load Leaf Assessment Target Authority"
);

assert.ok(
  targetAuthorityIndex > greenPassAuthorityPolicyIndex,
  "Leaf Assessment Target Authority must load after Green Pass Authority Policy"
);

assert.ok(
  learnerIdentitySourceIndex >= 0,
  "human lab must load Verb Explorer Learner Identity Source"
);

assert.ok(
  learnerIdentityProviderIndex >= 0,
  "human lab must load Verb Explorer Learner Identity Provider"
);

assert.ok(
  learnerIdentityProviderIndex > learnerIdentitySourceIndex,
  "Learner Identity Provider must load after Learner Identity Source"
);

assert.ok(
  labLearnerIdentityIndex >= 0,
  "human lab must load its explicit lab-only learner identity fixture"
);

assert.ok(
  labLearnerIdentityIndex > learnerIdentityProviderIndex,
  "lab-only learner identity fixture must load after Learner Identity Provider"
);

assert.ok(
  canonicalSkillSourceIndex >= 0,
  "human lab must load Canonical Skill Source"
);

assert.ok(
  canonicalSkillLoaderIndex >= 0,
  "human lab must load Canonical Skill Loader"
);

assert.ok(
  canonicalSkillLoaderIndex > canonicalSkillSourceIndex,
  "Canonical Skill Loader must load after Canonical Skill Source"
);

assert.ok(
  leafCanonicalSkillBridgeIndex >= 0,
  "human lab must load Leaf Canonical Skill Bridge"
);

assert.ok(
  leafCanonicalSkillBridgeIndex > canonicalSkillLoaderIndex,
  "Leaf Canonical Skill Bridge must load after Canonical Skill Loader"
);

assert.ok(
  adaptiveProfileSourceIndex >= 0,
  "human lab must load Adaptive Profile Source"
);

assert.ok(
  adaptiveEvidenceProfileSourceIndex >= 0,
  "human lab must load Adaptive Evidence Profile Source"
);

assert.ok(
  adaptiveSessionSourceIndex >= 0,
  "human lab must load Adaptive Session Source"
);

assert.ok(
  adaptiveComposerIndex >= 0,
  "human lab must load Adaptive Composer"
);

assert.ok(
  adaptiveComposerIndex > adaptiveProfileSourceIndex,
  "Adaptive Composer must load after Adaptive Profile Source"
);

assert.ok(
  adaptiveComposerIndex > adaptiveEvidenceProfileSourceIndex,
  "Adaptive Composer must load after Adaptive Evidence Profile Source"
);

assert.ok(
  adaptiveComposerIndex > adaptiveSessionSourceIndex,
  "Adaptive Composer must load after Adaptive Session Source"
);

assert.ok(
  adaptiveLiveStartIndex >= 0,
  "human lab must load adaptive LiveStart"
);

assert.ok(
  adaptiveLiveStartIndex > adaptiveComposerIndex,
  "Adaptive LiveStart must load after Adaptive Composer"
);

assert.ok(
  adaptiveLiveStartIndex > learnerIdentitySourceIndex,
  "Adaptive LiveStart must load after Learner Identity Source"
);

assert.ok(
  adaptiveLiveStartIndex > labLearnerIdentityIndex,
  "Adaptive LiveStart must load after the lab-only learner identity fixture"
);

assert.ok(
  adaptiveLiveStartIndex > leafCanonicalSkillBridgeIndex,
  "Adaptive LiveStart must load after Leaf Canonical Skill Bridge"
);

assert.ok(
  readinessTriggerIndex >= 0,
  "human lab must load adaptive Readiness Trigger"
);

assert.ok(
  readinessTriggerIndex > adaptiveLiveStartIndex,
  "adaptive Readiness Trigger must load after adaptive LiveStart"
);

assert.ok(
  targetReadinessIndex >= 0,
  "human lab must load Leaf Assessment Target Readiness"
);

assert.ok(
  targetProviderIndex >= 0,
  "human lab must load Leaf Assessment Target Provider"
);

assert.ok(
  targetReadinessIndex > targetAuthorityIndex,
  "Leaf Assessment Target Readiness must load after Target Authority"
);

assert.ok(
  targetReadinessIndex > readinessTriggerIndex,
  "Leaf Assessment Target Readiness must load after adaptive Readiness Trigger"
);

assert.ok(
  targetProviderIndex > targetReadinessIndex,
  "Leaf Assessment Target Provider must load after Target Readiness"
);

assert.ok(
  leafSelectionIndex >= 0,
  "human lab must load Story Assessment Leaf Selection"
);

assert.ok(
  leafSelectionIndex > leafReaderIndex,
  "Story Assessment Leaf Selection must load after the Leaf reader"
);

assert.ok(
  leafSelectionIndex > targetProviderIndex,
  "Story Assessment Leaf Selection must load after the Target provider"
);

for (const specialistIndex of [
  leafSurfaceIndex,
  leafReaderIndex,
  greenPassAuthorityPolicyIndex,
  targetAuthorityIndex,
  learnerIdentitySourceIndex,
  learnerIdentityProviderIndex,
  labLearnerIdentityIndex,
  canonicalSkillSourceIndex,
  canonicalSkillLoaderIndex,
  leafCanonicalSkillBridgeIndex,
  adaptiveProfileSourceIndex,
  adaptiveEvidenceProfileSourceIndex,
  adaptiveSessionSourceIndex,
  adaptiveComposerIndex,
  adaptiveLiveStartIndex,
  readinessTriggerIndex,
  targetReadinessIndex,
  targetProviderIndex,
  leafSelectionIndex
]) {
  assert.ok(
    appIndex > specialistIndex,
    "Assessment Leaf browser specialists must load before app.js in the human lab"
  );
}


const labIdentity =
  fs.readFileSync(
    labIdentityPath,
    "utf8"
  );

assert.ok(
  labIdentity.includes(
    'SIYAYOVerbExplorerLearnerIdentityProvider'
  ),
  "lab identity fixture must use the canonical Learner Identity Provider"
);

assert.ok(
  labIdentity.includes(
    'human-lab-learner-01'
  ),
  "lab identity fixture must declare an explicit controlled learner id"
);

assert.equal(
  /localStorage|sessionStorage|document\.cookie|URLSearchParams/.test(
    labIdentity
  ),
  false,
  "lab identity fixture must not become persistence, login, cookie, or URL identity authority"
);

const labStyle =
  fs.readFileSync(
    labStylePath,
    "utf8"
  );

assert.ok(
  /\.human-semantic-surface-lab\s+\.chapter-title/.test(
    labStyle
  ),
  "human lab title refinement must remain scoped to the lab"
);

assert.ok(
  /\.human-semantic-surface-lab\s+\.section-title/.test(
    labStyle
  ),
  "human lab subtitle refinement must remain scoped to the lab"
);

const academy =
  JSON.parse(
    fs.readFileSync(
      academyPath,
      "utf8"
    )
  );

assert.strictEqual(
  academy.chapters.length,
  1,
  "human lab manifest must expose only the controlled lab chapter"
);

assert.strictEqual(
  academy.chapters[0].status,
  "active",
  "controlled lab chapter must be the active lab entry"
);

assert.strictEqual(
  academy.chapters[0].path,
  "data/chapter.json",
  "lab must resolve its own isolated chapter without touching canonical chapter data"
);

const chapter =
  JSON.parse(
    fs.readFileSync(
      chapterPath,
      "utf8"
    )
  );

const item =
  chapter.chapter.sections[0].items[0];

assert.strictEqual(
  item.sentences.en,
  "Which cheese should we choose?",
  "human lab must expose the controlled P0 sentence"
);

assert.deepStrictEqual(
  item.surfaces.map(
    surface => surface.id
  ),
  [
    "question-choice",
    "decision-agent"
  ],
  "human lab must expose the two explicit Semantic Surfaces"
);

assert.strictEqual(
  item.assessmentLeaf.anchorSurfaceId,
  "question-choice",
  "human lab Assessment Leaf must remain anchored only to question-choice"
);

assert.strictEqual(
  item.assessmentLeaf.assessmentTarget.definitionPath,
  "/data/learning/skills/which.json",
  "human lab Assessment Leaf must use a root-absolute canonical Skill definition path so nested lab routes fetch the one production definition"
);

console.log(
  "Human Semantic Surface browser lab route: OK"
);
