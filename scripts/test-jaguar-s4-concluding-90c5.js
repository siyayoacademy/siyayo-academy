#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const s4=corpus.find(x=>x.id==='after-dinner-conversation');
const c=s4.perspectives.concluding;
assert.equal(c.exampleTense,'past');assert.equal(c.assessmentAuthority,false);
assert.equal(c.examples.en[0],'Wonderful. It was a pleasant evening together.');
assert.equal(c.examples.es[0],'Maravilloso. Fue una velada agradable juntos.');
assert.equal(c.examples.pt[0],'Maravilhoso. Foi uma noite agradável juntos.');
const js=fs.readFileSync('js/verb-explorer.js','utf8');
assert.ok(js.includes('living-line-narrative-scope'));
assert.ok(js.includes('exampleTense||null'));
assert.ok(js.includes('if(line)speakText(line.text,experienceLanguage)'));
console.log('PASS 90C.5 S4 narrative tense metadata; no new evaluator/credit');
