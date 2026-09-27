#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('verb-explorer.html','utf8');
const bootstrap=fs.readFileSync('js/verb-explorer-adaptive-bootstrap.js','utf8');

const htmlScripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
const browserIndex=htmlScripts.indexOf('js/adaptive-browser-runtime.js');
const bootstrapIndex=htmlScripts.indexOf('js/verb-explorer-adaptive-bootstrap.js');
const explorerIndex=htmlScripts.indexOf('js/verb-explorer.js');

assert.ok(browserIndex>=0,'adaptive browser runtime must be loaded');
assert.ok(bootstrapIndex>browserIndex,'adaptive bootstrap must load after its browser runtime');
assert.ok(bootstrapIndex<explorerIndex,'adaptive bootstrap must start before Verb Explorer interaction attaches');

for(const required of [
  'SIYAYOVerbExplorerLearnerIdentitySource',
  'SIYAYOLeafAssessmentTargetAuthority',
  'SIYAYOVerbExplorerCanonicalSkillSource',
  'SIYAYOVerbExplorerCanonicalSkillLoader',
  'SIYAYOLeafCanonicalSkillBridge',
  'SIYAYOVerbExplorerAdaptiveProfileSource',
  'SIYAYOVerbExplorerAdaptiveEvidenceProfileSource',
  'SIYAYOVerbExplorerAdaptiveSessionSource',
  'SIYAYOVerbExplorerAdaptiveContextSource',
  'SIYAYOVerbExplorerChoiceAttemptProvider',
  'SIYAYOVerbExplorerAdaptiveCoordinatorConfig',
  'SIYAYOVerbExplorerAdaptiveComposer',
  'SIYAYOVerbExplorerAdaptiveLiveStart',
  'SIYAYOVerbExplorerAdaptiveReadinessTrigger',
  'SIYAYOLeafAssessmentTargetReadiness',
  'SIYAYOLeafAssessmentTargetProvider',
  'SIYAYOVerbExplorerThinkingMindAssessmentSelection'
]){
  assert.ok(bootstrap.includes(required),required+' must belong to the canonical bootstrap dependency closure');
}

const liveStart=fs.readFileSync('js/verb-explorer-adaptive-live-start.js','utf8');
assert.ok(liveStart.includes("typeof learnerId!=='string'||!learnerId.trim()"),'missing identity must fail closed');
assert.ok(liveStart.includes("!target||typeof target!=='object'"),'missing assessment Target must fail closed');

const composer=fs.readFileSync('js/verb-explorer-adaptive-composer.js','utf8');
assert.ok(composer.includes('if(active&&active.session)return false'),'active Session must not be silently replaced');
assert.ok(composer.includes("state.currentExperienceId"),'grounded Session must require the current Experience');
assert.ok(composer.includes('evidencePackets:Object.freeze([])'),'Session must begin without fabricated learner Evidence');

console.log('Verb Explorer adaptive live wire: PASS — canonical dependency closure is loaded; Identity/Target/Experience remain fail-closed and Session starts without fabricated Evidence.');
