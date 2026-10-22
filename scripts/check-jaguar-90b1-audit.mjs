// 90B.1: machine-enforced map / provenance / safety & QW contract boundary
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=read('data/canonical/siyayo-integration-audit-90b1.json');
const roadmap=read('data/canonical/siyayo-integration-roadmap-90b.json');
const continuity=read('data/canonical/siyayo-integration-continuity-90a.json');
const policy=read('labs/jaguar-v30-3/security/prestaging-readiness.json');
const skills=['which','what','where','why'].map(x=>read('data/learning/skills/'+x+'.json'));
assert.deepEqual(manifest.contractSkillIds,skills.map(x=>x.id));
assert.equal(manifest.sourceTree,'5ee77257551593b8e4960dd6971cc7ed069fcd56');
assert.equal(continuity.source.recoveryLabTree,manifest.sourceTree);
assert.equal(manifest.whereCandidate,true);
assert.equal(skills.find(x=>x.id==='where.use.location-question').status,'isolated-candidate');
for(const s of skills){
 assert.equal(s.passContract.requires.length,3, 'explicit 3-step proof required for '+s.id);
 assert.ok(s.passContract.doesNotClaim.includes('pronunciation'),'Listening cannot claim pronunciation: '+s.id);
 for(const key of ['en','es','pt'])assert.ok(s.realizations[key].form,'Missing '+key+' skill label for '+s.id);
}
const why=skills.find(x=>x.id==='why.use.contextual-reason');
assert.equal(why.passContract.requires[2].mode,'transfer');
assert.equal(why.passContract.requires[2].dimension,'reason-answer');
const what=skills.find(x=>x.id==='what.use.object-question');
assert.equal(what.passContract.requires[2].dimension,'object-answer');
const where=skills.find(x=>x.id==='where.use.location-question');
assert.equal(where.passContract.requires[1].support,'none');
assert.equal(where.passContract.requires[2].support,'none');
assert.equal(policy.releaseAuthorized,false);
assert.equal(policy.deploymentPermitted,false);
assert.equal(policy.records.filter(x=>x.kind==='external'&&x.status==='blocked').length,12);
assert.equal(manifest.categories.length,11);
assert.ok(manifest.categories.every(x=>x.paths.every(path=>fs.existsSync(path))), 'Mapped test/doc paths must really exist');
assert.deepEqual(roadmap.orderedGates.map(x=>x.id),['90B','90B.1','90C','90C.1','90D','90E']);
assert.deepEqual(roadmap.futureAssessmentCoverage.map(x=>x.dimension),[
 'WHICH / WHAT / WHERE / WHY','OTHER QUESTION WORDS (14 QW canonical family)',
 'PRESENT','PAST','FUTURE','AFFIRMATIVE / NEGATIVE / INTERROGATIVE']);
assert.equal(manifest.workerD1Active,false);
assert.equal(manifest.acceptedRealAudio,false);
console.log('PASS 90B.1 — 11 traceable audit areas, 4 QW contracts, 12 staging gates still BLOCKED, future curriculum retained.');
