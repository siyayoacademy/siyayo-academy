#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const corpus=require('../data/learning/experience-seeds.json').items;
const js=fs.readFileSync('js/verb-explorer.js','utf8');
const langs=['en','es','pt'],entries=[];
for(const exp of corpus)for(const q of exp.thinkingMind){
 const modes=[];
 if(q.choiceContext)modes.push('contextual-choice');
 if(q.presentationGrounding)modes.push('exploratory-grounded');
 if(q.dialogueForms)modes.push('dialogue-forms');
 if(q.answerGrounding?.context)modes.push('answer-grounding');
 if(q.reasonGrounding)modes.push('reason-grounding');
 if(!modes.length)modes.push('missing-contextual-answer');
 for(const lang of langs){
  assert.ok(typeof q.question?.[lang]==='string'&&q.question[lang].trim(),'missing question '+exp.id+' '+q.questionWord+' '+lang);
  entries.push({experience:exp.id,questionWord:q.questionWord,language:lang,contextModes:modes});
 }
}
assert.ok(entries.some(e=>e.contextModes.includes('missing-contextual-answer')));
assert.match(js,/CONTEXTUAL RESPONSE · AUTHORING PENDING/);
assert.match(js,/dataset\.corpusStatus=lines\.some/);
assert.doesNotMatch(js,/role:"CORPUS RESPONSE",text:canonical/);
const out={version:'90C.7H.9',referenceModel:'WHICH',source:'data/learning/experience-seeds.json',totalSlots:entries.length,slots:entries,assessmentAuthority:false,greenPass:false,notes:'Coverage inventory only. Modes denote source presence, not verified answer correctness.'};
fs.mkdirSync('visual-audit-90c7h9',{recursive:true});
fs.writeFileSync('visual-audit-90c7h9/coverage.json',JSON.stringify(out,null,2));
console.log('PASS HOW TO SHOW corpus gap guard; '+entries.length+' language slots; '+entries.filter(e=>e.contextModes.includes('missing-contextual-answer')).length+' explicit contextual-answer gaps');
