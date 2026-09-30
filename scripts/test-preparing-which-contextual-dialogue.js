#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Source=require('../js/verb-explorer-dependency-structure-source.js');
const Focus=require('../js/adaptive-dependency-focus-view.js');
const seeds=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const exp=seeds.find(x=>x.id==='preparing-dinner'),q=exp.thinkingMind.find(q=>q.questionWord==='which');
const runtime=fs.readFileSync('js/verb-explorer.js','utf8');
assert.equal(q.assessmentTarget,undefined,'exploration does not invent a new S2 WHICH contract');
assert.deepEqual(q.question,{en:'Which carrots should we cook first?',es:'¿Qué zanahorias deberíamos cocinar primero?',pt:'Quais cenouras devemos cozinhar primeiro?'},'canonical S1 transfer question stays unchanged');
const root={activeThinkingQuestion:()=>q,canonicalExperienceLine(){throw Error('unrelated entry-verb fallback');}};
const ctx=vm.createContext(root);
vm.runInContext('let experienceWordType="verb",experiencePerspective=null,experienceLanguage="en",experienceTense="present",experienceForm="affirmative";'+runtime.slice(runtime.indexOf('function experienceLines('),runtime.indexOf('function choicePrompt(')),ctx);
root.exp=exp;
for(const lang of ['en','es','pt']){
 for(const tense of ['present','past','future'])for(const form of ['affirmative','negative','interrogative']){
  vm.runInContext('experienceLanguage='+JSON.stringify(lang)+';experienceTense='+JSON.stringify(tense)+';experienceForm='+JSON.stringify(form),ctx);
  const lines=vm.runInContext('experienceLines(exp)',ctx);
  assert.equal(lines.length,2);
  assert.equal(lines[0].text,q.dialogueForms[tense][form].question[lang]);
  assert.equal(lines[1].text,q.dialogueForms[tense][form].response[lang]);
  assert.match(lines[1].text,lang==='en'?/carrots/:lang==='es'?/zanahorias/:/cenouras/);
 }
 const structure=JSON.parse(fs.readFileSync('data/learning/dependencies/'+q.dependencyFocus.structureIds[lang]+'.json','utf8'));
 const selected=Source.resolve(q.dependencyFocus,lang,new Map([[structure.id,structure]]));
 assert.ok(selected);
 assert.equal(selected.sentence,q.question[lang]);
 assert.ok(Focus.resolve(selected,'carrots').relations.some(r=>r.dependent==='which'&&r.relation==='det'));
 for(const token of selected.tokens)assert.ok(Focus.resolve(selected,token.id));
 assert.equal(selected.tokens.some(t=>t.id==='we'),lang==='en','omitted ES/PT subjects are not invented');
 assert.equal(Source.resolve(q.dependencyFocus,lang,new Map()),null);
}
console.log('PASS — Preparing WHICH contextual dialogue in 27 language/tense/mode combinations, independent dependency structures, original transfer preserved, no new assessment authority.');
