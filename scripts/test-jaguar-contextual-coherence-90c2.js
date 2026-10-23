#!/usr/bin/env node
// 90C.2: permanent contextual-authority verifier. No grading or remote effects.
const fs=require('node:fs'),assert=require('node:assert/strict');
const resolver=require('../js/verb-explorer-contextual-coherence.js');
const data=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const issues=resolver.auditExperiences(data.items);assert.deepEqual(issues,[],'All authored WHY contexts must be grounded EN ES PT');
const expected={
 'having-dinner':{
   en:['Why is this dinner special?','Because we prepared it together.'],
   es:['¿Por qué esta cena es especial?','Porque la preparamos juntos.'],
   pt:['Por que este jantar é especial?','Porque preparamos o jantar juntos.']},
 'after-dinner-conversation':{
   en:['Why do you enjoy this conversation?','Because we enjoy talking together.'],
   es:['¿Por qué disfrutas esta conversación?','Porque disfrutamos conversar juntos.'],
   pt:['Por que você gosta desta conversa?','Porque gostamos de conversar juntos.']}
};
let count=0;
for(const [id,langs] of Object.entries(expected)){
 const experience=data.items.find(x=>x.id===id);
 assert.ok(experience,id+' authored');
 const question=experience.thinkingMind.find(x=>x.questionWord==='why');
 for(const [language,[q,a]] of Object.entries(langs)){
  const p=resolver.resolve({question,language,tense:'present',form:'affirmative'});
  assert.equal(p.status,'grounded');assert.equal(p.question,q);assert.equal(p.response,a);
  assert.equal(p.assessmentEvidence,false);assert.equal(p.greenPass,false);
  for(const tense of ['past','future'])for(const form of ['affirmative','negative','interrogative']){
   const f=resolver.resolve({question,language,tense,form});
   assert.equal(f.status,'not-authored','never display generic conjugation as a WHY answer');
   assert.equal(f.response,undefined);
  }
  for(const form of ['negative','interrogative']){
   assert.equal(resolver.resolve({question,language,tense:'present',form}).status,'not-authored');
  }
  count++;
 }
}
const bad=data.items.find(x=>x.id==='having-dinner').thinkingMind.find(x=>x.questionWord==='why');
const ambiguous={...bad,reasonGrounding:{...bad.reasonGrounding,alternatives:[...bad.reasonGrounding.alternatives,bad.reasonGrounding.alternatives[0]]}};
assert.equal(resolver.resolve({question:ambiguous,language:'en',tense:'present',form:'affirmative'}).status,'corpus-gap');
assert.equal(resolver.resolve({question:bad,language:'fr',tense:'present',form:'affirmative'}),null);
const html=fs.readFileSync('verb-explorer.html','utf8'),ui=fs.readFileSync('js/verb-explorer.js','utf8');
assert.ok(html.indexOf('js/verb-explorer-contextual-coherence.js')<html.indexOf('js/verb-explorer.js'));
assert.ok(ui.includes('SIYAYOVerbExplorerContextualCoherence')&&ui.includes('noSpeech:true'));
assert.ok(!data.items.find(x=>x.id==='having-dinner').thinkingMind.find(x=>x.questionWord==='why').reasonGrounding.alternatives.some(x=>x.response.pt==='Porque a preparamos juntos.'));
const word=fs.readFileSync('js/verb-explorer-polyglot-word-path-view.js','utf8');
assert.ok(word.includes('columnOrder.map')&&word.includes('focusLanguage=currentValid?currentScope.language:language'));
const staging=JSON.parse(fs.readFileSync('labs/jaguar-v30-3/security/prestaging-readiness.json','utf8'));
assert.equal(staging.releaseAuthorized,false);assert.equal(staging.records.filter(x=>x.kind==='external'&&x.status==='blocked').length,12);
console.log('PASS JAGUAR 90C.2 COHERENCE '+count+'/6 grounded EN/ES/PT, all unauthored tense/modes fail closed; source order+scope+security correct.');
