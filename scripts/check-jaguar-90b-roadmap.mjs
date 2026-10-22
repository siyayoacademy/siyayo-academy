// SIYAYO 90B mandatory future-coverage record — immutable gates for CI.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const r=read('data/canonical/siyayo-integration-roadmap-90b.json');
const archive=read('data/canonical/siyayo-integration-continuity-90a.json');
const catalog=read('data/canonical/siyayo-development-map.json');
assert.equal(r.orderedGates.length,6);
assert.deepEqual(r.orderedGates.map(g=>g.id),['90B','90B.1','90C','90C.1','90D','90E']);
assert.deepEqual(r.futureAssessmentCoverage.map(x=>x.dimension),[
 'WHICH / WHAT / WHERE / WHY','OTHER QUESTION WORDS (14 QW canonical family)',
 'PRESENT','PAST','FUTURE','AFFIRMATIVE / NEGATIVE / INTERROGATIVE']);
assert.equal(archive.source.recoveryLabTree,'5ee77257551593b8e4960dd6971cc7ed069fcd56');
assert.equal(archive.successorRoadmap.path,'data/canonical/siyayo-integration-roadmap-90b.json');
assert.equal(catalog.integrationRoadmap90B.releaseAuthorized,false);
assert.equal(r.orderedGates.find(g=>g.id==='90D').status,'blocked-external');
assert.ok(r.nonNegotiable.some(x=>x.includes('No Cloudflare/Worker/D1 activation')));
assert.ok(fs.readFileSync('docs/SIYAYO-WORK-MAP.md','utf8').includes('JAGUAR 90B→90E'));
console.log('PASS JAGUAR 90B roadmap recorded: 90B, 90B.1, 90C, 90C.1, 90D, 90E; 14 QWs and all tenses/modes remain explicit.');
