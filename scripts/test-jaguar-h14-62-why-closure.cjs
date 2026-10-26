'use strict';
// Read-only provenance and WHY closure guard — no Explorer or D1 writes.
const a=require('node:assert/strict'),fs=require('node:fs'),p=require('node:path'),crypto=require('node:crypto');
const root=p.resolve(__dirname,'..');
const j=JSON.parse(fs.readFileSync(p.join(root,'data/learning/references/jaguar-h14-62-why-closure-v0.1.json')));
const seeds=JSON.parse(fs.readFileSync(p.join(root,'data/learning/experience-seeds.json')));
const draft=JSON.parse(fs.readFileSync(p.join(root,j.draft_contract)));
a.equal(j.elo_count,6);a.equal(j.closing_elo,'H14.67');a.equal(j.plan.length,6);
for(let n=62;n<=67;n++)a.equal(j.plan.filter(e=>e.elo==='H14.'+n).length,1);
a.equal(j.ancestry.length,11);
for(const x of j.ancestry){
 const v=fs.readFileSync(p.join(root,x.path));
 if(x.sha){const h=crypto.createHash('sha1').update(Buffer.from('blob '+v.length+'\0')).update(v).digest('hex');a.equal(h,x.sha,x.path);}
}
a.equal(seeds.items.length,4);a.equal(seeds.items.reduce((n,x)=>n+x.thinkingMind.length,0),21);
const all=seeds.items.flatMap(e=>e.thinkingMind);
a.equal(all.filter(q=>q.assessmentTarget).length,5);
a.equal(all.filter(q=>q.assessmentResumeTarget).length,2);
const why=id=>seeds.items.find(e=>e.id===id).thinkingMind.find(q=>q.questionWord==='why');
a.ok(why('shopping-for-dinner').presentationGrounding);
a.ok(why('preparing-dinner').presentationGrounding);
for(const id of ['shopping-for-dinner','preparing-dinner']){a.equal(why(id).assessmentTarget,undefined);a.equal(why(id).assessmentResumeTarget,undefined);}
a.equal(why('having-dinner').assessmentTarget.skill,'why.use.contextual-reason');
a.equal(why('after-dinner-conversation').assessmentTarget,undefined);
a.equal(draft.status,'SPECIFIED_NOT_AUTHORIZED');
a.equal(draft.contractRegistry.length,3);
for(const id of ['WHY-S1-S2-DRAFT','WHY-S2-S1-DRAFT']){const c=draft.contractRegistry.find(e=>e.id===id);a.equal(c.status,'DRAFT_NOT_AUTHORIZED');a.equal(c.canMintEvidence,false);}
a.equal(draft.contractRegistry.find(e=>e.id==='WHY-S3-S4-CANONICAL').status,'EXISTING_CANONICAL_UNCHANGED');
a.equal(j.gates.find(g=>g.id==='HIST-01').status,'PARTIALLY_RECONSTRUCTED_NOT_EXHAUSTIVE');
a.ok(j.gates.find(g=>g.id==='HG-01-10').status==='OPEN');
a.ok(Object.values(j.invariants).every(x=>x===false));
console.log('H14.62 PASS: 11 historical sources; 4 Experiences/21 QW slots; S1+S2 WHY context-only; two independent drafts; 6-ELO closure map; ALL gates open');
