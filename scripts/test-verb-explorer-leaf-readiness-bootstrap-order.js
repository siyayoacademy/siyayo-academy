#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('js/verb-explorer-adaptive-bootstrap.js','utf8');

function position(fragment){
  const index=source.indexOf(fragment);
  assert.notEqual(index,-1,`bootstrap must contain ${fragment}`);
  return index;
}

const targetAuthority=position("ensureGlobal('SIYAYOLeafAssessmentTargetAuthority'");
const liveStart=position("ensureGlobal('SIYAYOVerbExplorerAdaptiveLiveStart'");
const readinessTrigger=position("ensureGlobal('SIYAYOVerbExplorerAdaptiveReadinessTrigger'");
const leafReadiness=position("ensureGlobal('SIYAYOLeafAssessmentTargetReadiness'");
const initialAttempt=position("var liveStart=root.SIYAYOVerbExplorerAdaptiveLiveStart");

assert.ok(targetAuthority < liveStart,'Target authority must exist before live Session startup');
assert.ok(liveStart < readinessTrigger,'LiveStart must exist before the readiness trigger delegates to it');
assert.ok(readinessTrigger < leafReadiness,'Leaf readiness boundary must load only after ReadinessTrigger exists');
assert.ok(leafReadiness < initialAttempt,'Leaf readiness boundary must be available before the initial fail-closed LiveStart attempt');

assert.equal(source.includes('SIYAYOLeafAssessmentTargetReadiness.adopt('),false,
  'bootstrap must load the Leaf readiness boundary without inventing or adopting a Target');
assert.equal(source.includes('SIYAYOLeafAssessmentTargetAuthority.adopt('),false,
  'bootstrap must not choose a Leaf Target');

console.log('Leaf readiness bootstrap order: PASS — Chapolin is loaded after its readiness dependency and before initial LiveStart, without choosing a Target.');
