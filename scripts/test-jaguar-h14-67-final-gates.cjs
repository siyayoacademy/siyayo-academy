'use strict';
// JAGUAR H14.67: strict read-only evidence/handoff guard. Run at repository root.
// This verifies snapshot consistency only, never production auth or browser QA.
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const handoff=load('data/learning/references/jaguar-h14-67-final-why-experimental-handoff-v0.1.json');
const seeds=load('data/learning/experience-seeds.json');
const skill=load('data/learning/skills/why.json');
const draft=load('data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
const plan=load('data/learning/references/jaguar-h14-63-why-six-plan-contract-v0.1.json');
const review=load('data/learning/references/jaguar-h14-64-human-homologation-prep-v0.1.json');
const gates=load('data/learning/references/jaguar-h14-54-explorer-integration-inventory-v0.1.json').gates;
const hist=load('docs/jaguar-h14-57-historical-debt.json');
const historic=load('data/learning/references/jaguar-h14-62-why-closure-v0.1.json');
const sha=(bytes)=>crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
assert.equal(handoff.id,'SIYAYO-JAGUAR-H14.67-WHY-FINAL-EXPERIMENTAL-HANDOFF');
assert.equal(handoff.status,'CI_PENDING_LAB_GO_CANDIDATE__LIVE_NO_GO');
assert.equal(handoff.timeline.length,6);
for(let i=62;i<=67;i++)assert.equal(handoff.timeline.filter(x=>x.elo==='H14.'+i).length,1);
assert.deepEqual(handoff.timeline.slice(0,5).map(x=>x.status),['LAB_GREEN','LAB_GREEN','INSTRUMENT_GREEN_HUMAN_PENDING','LAB_GREEN_AUTHORITY_DENIED','LAB_GREEN']);
assert.equal(handoff.comparison_at_2026_10_26.main.relationship,'diverged');
assert.equal(handoff.comparison_at_2026_10_26.main.ahead_by,1801);
assert.equal(handoff.comparison_at_2026_10_26.main.behind_by,1);
assert.equal(handoff.comparison_at_2026_10_26.pr3.ahead_by,289);
assert.equal(handoff.comparison_at_2026_10_26.pr3.behind_by,0);
assert.equal(handoff.protected_files.length,25);
for(const {path:rel,git_blob_sha:expected} of handoff.protected_files){
 const data=fs.readFileSync(path.join(root,rel));
 assert.equal(sha(data),expected,'critical code drift: '+rel);
}
const html=fs.readFileSync(path.join(root,'verb-explorer.html'),'utf8');
for(let i=57;i<=60;i++){
 assert.match(html,new RegExp('js/verb-explorer-h14-'+i+'-[\\w-]+\\.js'),'H14.'+i+' read-only helper still loaded');
}
for(const id of ['h1457OpportunityReview','h1458AuthorityReview','h1459ScopeReview','h1460ReferralReview','h14SpecializedPreview']){
 assert.match(html,new RegExp('id="'+id+'"[^>]*hidden'),'hidden-by-default '+id);
}
assert.equal(handoff.runtime_apply_allowlist.length,0);
assert.equal(handoff.may_mint_evidence,false);
assert.equal(handoff.may_grant_green,false);
assert.equal(handoff.production_approved,false);
assert.equal(handoff.real_teacher_reviews_collected,false);
assert.equal(handoff.real_identity_verified,false);
assert.equal(handoff.real_d1_remote_verified,false);
assert.equal(handoff.decisions.why_s1_to_s2_contract,'NO_GO_PEDAGOGICAL_AUTHORITY');
assert.equal(handoff.decisions.why_s2_to_s1_contract,'NO_GO_PEDAGOGICAL_AUTHORITY');
assert.equal(handoff.decisions.integrate_into_main_or_pr3,'NO_GO');
assert.equal(handoff.decisions.laboratory_package,'CONDITIONAL_GO_AFTER_GREEN_H1467_CI');
assert.equal(handoff.counts.hg_open,15);
assert.equal(handoff.counts.dg_open,7);
assert.equal(handoff.counts.s1s2_plans,6);
assert.equal(handoff.counts.s1s2_review_dimensions,18);
assert.equal(gates.length,7);
assert.ok(gates.every(g=>g.closed===false));
assert.equal(review.openHgGates,15);
assert.equal(review.realTeacherReviews,0);
assert.equal(review.realReviewerIdentityVerified,false);
assert.equal(review.humanApproval,false);
assert.equal(plan.plans.length,6);
assert.ok(plan.plans.every(p=>p.contractAuthorized===false&&p.humanApproval===null));
assert.equal(draft.status,'SPECIFIED_NOT_AUTHORIZED');
assert.equal(draft.contractRegistry.filter(x=>x.status==='DRAFT_NOT_AUTHORIZED').length,2);
assert.equal(draft.contractRegistry.find(x=>x.id==='WHY-S3-S4-CANONICAL').status,'EXISTING_CANONICAL_UNCHANGED');
assert.equal(hist.id,'HIST-01');
assert.match(historic.gates.find(g=>g.id==='HIST-01').status,/PARTIALLY/);
assert.equal(skill.id,'why.use.contextual-reason');
assert.equal(seeds.items.length,4);
assert.equal(seeds.items.flatMap(e=>e.thinkingMind).length,21);
for(const id of ['shopping-for-dinner','preparing-dinner']){
 const q=seeds.items.find(e=>e.id===id).thinkingMind.find(q=>q.questionWord==='why');
 assert.ok(q?.presentationGrounding);
 assert.equal(q.assessmentTarget,undefined);
 assert.equal(q.assessmentResumeTarget,undefined);
}
assert.equal(seeds.items.find(e=>e.id==='having-dinner').thinkingMind.find(q=>q.questionWord==='why').assessmentTarget.skill,skill.id);
assert.ok(handoff.qa.some(x=>x.kind==='NOT_EXECUTED'&&/Chromium/.test(x.name)));
assert.ok(handoff.qa.some(x=>x.kind==='NOT_EXECUTED'&&/audio/.test(x.name)));
assert.ok(handoff.portões.find(x=>x.id==='DG-06').condition==='OPEN');
assert.equal(handoff.architecture.preserve_s3s4,true);
console.log('H14.67 PASS — 6 ELO checkpoints, '+handoff.protected_files.length+' pinned Git blobs; 15 HG + 7 DG OPEN; 2 WHY drafts blocked; S3→S4 intact; CI lab only, product NO-GO.');
