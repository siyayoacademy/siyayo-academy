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

const labExperienceRuntimePath =
  labRoot + "/lab-experience-runtime.js";

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

assert.ok(
  fs.existsSync(labExperienceRuntimePath),
  "human lab must own an explicit lab-only Experience runtime fixture"
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
  "../../js/green-pass-profile.js",
  "../../js/verb-explorer-adaptive-profile-source.js",
  "../../js/adaptive-evidence-profile.js",
  "../../js/verb-explorer-adaptive-evidence-profile-source.js",
  "../../js/adaptive-learning-router.js",
  "../../js/adaptive-pedagogical-orchestrator.js",
  "../../js/adaptive-attempt-loop.js",
  "../../js/verb-explorer-adaptive-session-source.js",
  "lab-experience-runtime.js",
  "../../js/verb-explorer-adaptive-state-bridge.js",
  "../../js/verb-explorer-adaptive-coordinator.js",
  "../../js/verb-explorer-adaptive-coordinator-config.js",
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

const greenPassProfileIndex =
  html.indexOf(
    'src="../../js/green-pass-profile.js"'
  );

const adaptiveProfileSourceIndex =
  html.indexOf(
    'src="../../js/verb-explorer-adaptive-profile-source.js"'
  );

const adaptiveEvidenceProfileIndex =
  html.indexOf(
    'src="../../js/adaptive-evidence-profile.js"'
  );

const adaptiveEvidenceProfileSourceIndex =
  html.indexOf(
    'src="../../js/verb-explorer-adaptive-evidence-profile-source.js"'
  );

const adaptiveLearningRouterIndex =
  html.indexOf(
    'src="../../js/adaptive-learning-router.js"'
  );

const adaptivePedagogicalOrchestratorIndex =
  html.indexOf(
    'src="../../js/adaptive-pedagogical-orchestrator.js"'
  );

const adaptiveAttemptLoopIndex =
  html.indexOf(
    'src="../../js/adaptive-attempt-loop.js"'
  );

const adaptiveSessionSourceIndex =
  html.indexOf(
    'src="../../js/verb-explorer-adaptive-session-source.js"'
  );

const labExperienceRuntimeIndex =
  html.indexOf(
    'src="lab-experience-runtime.js"'
  );

const adaptiveStateBridgeIndex =
  html.indexOf(
    'src="../../js/verb-explorer-adaptive-state-bridge.js"'
  );

const adaptiveCoordinatorIndex =
  html.indexOf(
    'src="../../js/verb-explorer-adaptive-coordinator.js"'
  );

const adaptiveCoordinatorConfigIndex =
  html.indexOf(
    'src="../../js/verb-explorer-adaptive-coordinator-config.js"'
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
  greenPassProfileIndex >= 0,
  "human lab must load canonical Green Pass Profile API"
);

assert.ok(
  adaptiveProfileSourceIndex >= 0,
  "human lab must load Adaptive Profile Source"
);

assert.ok(
  adaptiveEvidenceProfileIndex >= 0,
  "human lab must load canonical Adaptive Evidence Profile API"
);

assert.ok(
  adaptiveEvidenceProfileSourceIndex >= 0,
  "human lab must load Adaptive Evidence Profile Source"
);

assert.ok(
  adaptiveLearningRouterIndex >= 0,
  "human lab must load canonical Adaptive Learning Router"
);

assert.ok(
  adaptivePedagogicalOrchestratorIndex >= 0,
  "human lab must load canonical Adaptive Pedagogical Orchestrator"
);

assert.ok(
  adaptiveAttemptLoopIndex >= 0,
  "human lab must load canonical Adaptive Attempt Loop API"
);

assert.ok(
  adaptiveSessionSourceIndex >= 0,
  "human lab must load Adaptive Session Source"
);

assert.ok(
  labExperienceRuntimeIndex >= 0,
  "human lab must load its explicit lab-only Experience runtime fixture"
);

assert.ok(
  adaptiveStateBridgeIndex >= 0,
  "human lab must load Adaptive State Bridge"
);

assert.ok(
  adaptiveCoordinatorIndex >= 0,
  "human lab must load Adaptive Coordinator"
);

assert.ok(
  adaptiveCoordinatorConfigIndex >= 0,
  "human lab must load Adaptive Coordinator Config"
);

assert.ok(
  adaptiveComposerIndex >= 0,
  "human lab must load Adaptive Composer"
);

assert.ok(
  adaptiveProfileSourceIndex > greenPassProfileIndex,
  "Adaptive Profile Source must load after canonical Green Pass Profile API"
);

assert.ok(
  adaptiveComposerIndex > adaptiveProfileSourceIndex,
  "Adaptive Composer must load after Adaptive Profile Source"
);

assert.ok(
  adaptiveEvidenceProfileSourceIndex > adaptiveEvidenceProfileIndex,
  "Adaptive Evidence Profile Source must load after canonical Adaptive Evidence Profile API"
);

assert.ok(
  adaptiveComposerIndex > adaptiveEvidenceProfileSourceIndex,
  "Adaptive Composer must load after Adaptive Evidence Profile Source"
);

assert.ok(
  adaptivePedagogicalOrchestratorIndex > adaptiveLearningRouterIndex,
  "Adaptive Pedagogical Orchestrator must load after canonical Adaptive Learning Router"
);

assert.ok(
  adaptiveAttemptLoopIndex > adaptivePedagogicalOrchestratorIndex,
  "Adaptive Attempt Loop must load after canonical Adaptive Pedagogical Orchestrator"
);

assert.ok(
  adaptiveSessionSourceIndex > adaptiveAttemptLoopIndex,
  "Adaptive Session Source must load after canonical Adaptive Attempt Loop API"
);

assert.ok(
  adaptiveComposerIndex > adaptiveSessionSourceIndex,
  "Adaptive Composer must load after Adaptive Session Source"
);

assert.ok(
  adaptiveStateBridgeIndex > labExperienceRuntimeIndex,
  "Adaptive State Bridge must load after the lab-only Experience runtime fixture"
);

assert.ok(
  adaptiveComposerIndex > adaptiveStateBridgeIndex,
  "Adaptive Composer must load after Adaptive State Bridge"
);

assert.ok(
  adaptiveComposerIndex > adaptiveCoordinatorIndex,
  "Adaptive Composer must load after Adaptive Coordinator"
);

assert.ok(
  adaptiveComposerIndex > adaptiveCoordinatorConfigIndex,
  "Adaptive Composer must load after Adaptive Coordinator Config"
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
  greenPassProfileIndex,
  adaptiveProfileSourceIndex,
  adaptiveEvidenceProfileIndex,
  adaptiveEvidenceProfileSourceIndex,
  adaptiveLearningRouterIndex,
  adaptivePedagogicalOrchestratorIndex,
  adaptiveAttemptLoopIndex,
  adaptiveSessionSourceIndex,
  labExperienceRuntimeIndex,
  adaptiveStateBridgeIndex,
  adaptiveCoordinatorIndex,
  adaptiveCoordinatorConfigIndex,
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

const labExperienceRuntime =
  fs.readFileSync(
    labExperienceRuntimePath,
    "utf8"
  );

assert.ok(
  labExperienceRuntime.includes(
    "SIYAYOVerbExplorerResumeRuntime"
  ),
  "lab Experience runtime fixture must satisfy only the existing ResumeRuntime boundary"
);

assert.ok(
  labExperienceRuntime.includes(
    "captureContext"
  ),
  "lab Experience runtime fixture must expose captureContext for the Adaptive State Bridge"
);

assert.ok(
  labExperienceRuntime.includes(
    "currentExperienceId"
  ) &&
  labExperienceRuntime.includes(
    "shopping-for-dinner"
  ),
  "lab Experience runtime fixture must explicitly declare the controlled shopping-for-dinner state"
);

assert.equal(
  /StoryAssessmentLeaf|assessmentLeaf|assessmentTarget|SemanticSurface|surfaceId|targetWords|fetch\s*\(|chapter\.json/.test(
    labExperienceRuntime
  ),
  false,
  "lab Experience runtime fixture must not infer Experience from Story, Leaf, Surface, target words, or chapter data"
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
