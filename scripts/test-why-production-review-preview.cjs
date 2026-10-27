'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('js/verb-explorer-why-production-review-preview.js','utf8');
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const queue=JSON.parse(fs.readFileSync('data/learning/references/siyayo-why-s1-s2-human-review-queue-v0.1.json','utf8'));
const env={location:{search:'?why_production_review=preview'}};env.globalThis=env;
vm.runInNewContext(source,env);
const api=env.SIYAYOWHYProductionReviewPreview;
const rows=api.inspect({experiences:corpus});
assert.equal(rows.length,6);
assert.equal(queue.tasks.length,18);
assert.equal(queue.hgGates.length,15);
assert.equal(queue.dgGates.length,7);
for(const origin of ['shopping-for-dinner','preparing-dinner'])for(const lang of ['en','es','pt']){
 const match=rows.filter(r=>r.originExperienceId===origin&&r.language===lang);
 assert.equal(match.length,1);const p=match[0];
 assert.deepEqual(Array.from(p.draftPrompts.map(x=>x.dimension)),['question-function','reason-answer(local)','reason-answer(transfer)']);
 assert.equal(p.draftPrompts[0].text,null);
 assert.ok(p.draftPrompts[1].text&&p.draftPrompts[2].text);
 assert.equal(p.contractAuthorized,false);
 assert.equal(p.canIssueEvidence,false);
 assert.equal(p.canGrantGreenPass,false);
}
for(const x of queue.tasks){assert.equal(x.contractAuthorized,false);assert.equal(x.pedagogicalApproval,null);}
const html=fs.readFileSync('why-production-review-preview.html','utf8');
assert.match(html,/id="whyProductionReviewPreview"[^>]*hidden/);
assert.match(html,/noindex,nofollow/);
assert.match(html,/why-production-review-preview\.js/);
assert.doesNotMatch(html,/learnerId|assessment\.select\(|issueGreenPass/);
const bad=structuredClone(corpus);
bad[0].thinkingMind.find(q=>q.questionWord==='why').assessmentTarget={skill:'why.use.contextual-reason'};
assert.equal(api.inspect({experiences:bad}).length,0);
assert.equal(api.inspect({experiences:corpus.slice(0,1)}).length,0);
assert.equal(queue.realTeacherReviews,0);
assert.equal(queue.productionDeployAuthorized,false);
console.log('WHY production review PREVIEW PASS: 6 plans, 18 review tasks, 15 HG+7 DG OPEN, source-only read-only, no assessment.');
