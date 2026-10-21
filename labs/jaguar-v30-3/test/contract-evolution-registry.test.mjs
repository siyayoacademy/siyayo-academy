import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const record=JSON.parse(readFileSync('governance/contract-evolution-registry.json','utf8'));
test('versioned canonical extension explicitly unmerged and pinned',()=>{
 assert.equal(record.status,'versioned-proposal-in-isolated-lab');
 assert.equal(record.canonicalSource.integrationStatus,'not-yet-merged-into-explorer-canonical-map');
 assert.equal(record.canonicalSource.commit,'c7e83709cacf8479847df0f3cee4ed8a563aaae6');
});
test('preserve current V30.3.88 focus and parked 7D.3.10',()=>{
 assert.match(record.continuity.primaryTrack,/V30.3.88/);
 assert.match(record.continuity.parkedTrack,/7D.3.10/);
 assert.equal(record.continuity.status,'architecture-study-no-module-implementation');
});
test('eight integration boundaries are classified rather than authorized',()=>{
 assert.equal(record.integrationContracts.length,8);
 assert.equal(new Set(record.integrationContracts.map(c=>c.id)).size,8);
 assert.ok(record.integrationContracts.every(c=>c.status.length>0));
});
test('contract changes distinguish reuse, revision and new authority',()=>{
 assert.deepEqual(record.governance.changeKinds,['reuse','compatible-revision','new-contract','breaking-change-with-explicit-migration']);
});
test('mandatory governance fields include dependencies, authority, evidence and tests',()=>{
 for(const item of ['dependencies','authority','evidencePolicy','tests','homologation','version'])
  assert.ok(record.governance.requiredFields.includes(item));
});
test('candidate has stable id, proposal source, open decisions and dependencies',()=>{
 const c=record.candidates[0];assert.equal(c.id,'JAGUAR-7D.3.10-CONTEXTUAL-THINKING-MIND');
 assert.equal(c.status,'candidate-not-implemented');
 assert.ok(c.dependencies.includes('PED-ASSESSMENT'));
 assert.ok(c.dependencies.includes('UI-HOW-TO-SHOW'));
 assert.ok(c.decisionsPending.length>2);
});
test('no fabricated GREEN PASS, Transfer authority or score equivalence',()=>{
 const c=record.candidates[0];assert.equal(c.authority.exploratoryCardsGrantGreenPass,false);
 assert.equal(c.authority.revealCriteriaCreatesEvidence,false);
 assert.equal(c.authority.transferRequiresAuthorizedAssessmentTarget,true);
 assert.match(c.authority.currentContextScore,/0\/4 to 4\/4/);
 assert.match(c.authority.assessmentScore,/0\/3 to 3\/3/);
});
test('REVIEW speaker and position preserved; new visual not authorized',()=>{
 const c=record.candidates[0];assert.equal(c.authority.reviewSpeakerAndPositionUnchanged,true);
 assert.equal(c.capabilities.newVisualModuleAuthorized,false);
});
test('registry can grow without declaring all 14 QWs pedagogically scored',()=>{
 const c=record.candidates[0];assert.equal(c.capabilities.criterionCount,4);
 assert.ok(c.tests.some(s=>s.includes('do not imply all 14 QWs')));
});
test('NICK identity and pending evidence separation remain boundaries',()=>{
 assert.equal(record.governance.constraints.nicknameIsNotServerAuthentication,true);
 assert.equal(record.governance.constraints.retainedProgressCannotBeFabricatedFromPendingStorage,true);
 assert.equal(record.governance.constraints.exploratoryEventsCannotCreateAcceptedEvidence,true);
});
test('critical release controls are not relaxed',()=>{
 assert.ok(record.governance.principles.includes('human-homologation-before-canonical-promotion'));
 assert.ok(record.governance.principles.includes('compatibility-and-rollback'));
 assert.match(record.integrationContracts.find(c=>c.id==='OPS-RELEASE').status,/blocked/);
});
