'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const corpus=require('../data/learning/gear-study-corpus.json');
const definition=require('../js/adaptive-dependency-head-probe-definition.js');
assert.equal(corpus.wordTypes.length,10);assert.equal(corpus.functions.length,5);
for(const k of ['assessmentAuthority','assessmentEvidence','greenPass'])assert.equal(corpus[k],false);
let forms=0,graphs=0;
for(const entry of corpus.items){assert.equal(entry.sceneFact,false);for(const [kind,numbers] of Object.entries(entry.forms))for(const [number,tenses] of Object.entries(numbers))for(const [tense,modes] of Object.entries(tenses))for(const [mode,languages] of Object.entries(modes))for(const [lang,cell] of Object.entries(languages)){
 forms++;assert.ok(cell.text.length>15);assert.ok(!/undefined|null/.test(cell.text));assert.equal(cell.text.endsWith('?'),mode==='interrogative');
 for(const words of Object.values(cell.targets))for(const word of words)assert.ok(cell.text.toLowerCase().includes(word.toLowerCase()),`Missing target ${word}: ${cell.text}`);
 const g=cell.dependency;assert.equal(g.sentence,cell.text);assert.equal(g.language,lang);assert.equal(new Set(g.tokens.map(t=>t.id)).size,g.tokens.length);
 assert.ok(g.tokens.some(t=>t.id===g.defaultFocus));
 assert.equal(new Set(g.relations.map(r=>r.dependent)).size,g.relations.length,'Each analysed dependent has one head');
 for(const r of g.relations){assert.notEqual(r.head,r.dependent);assert.ok(g.tokens.some(t=>t.id===r.head));assert.ok(g.tokens.some(t=>t.id===r.dependent));}
 for(const token of g.tokens){let id=token.id,seen=new Set();while(id){assert.ok(!seen.has(id),'Dependency cycle');seen.add(id);id=g.relations.find(r=>r.dependent===id)?.head;}}
 const rel=g.relations.find(r=>['nsubj','obj'].includes(r.relation));assert.ok(rel);
 const probe=definition.create(g,{experienceId:entry.experienceId,targetTokenId:rel.dependent,prompt:'Which is the head?',alternativeTokenIds:[rel.head,...g.tokens.filter(t=>t.id!==rel.head&&t.id!==rel.dependent).slice(0,2).map(t=>t.id)]});assert.ok(probe,`Invalid head probe ${g.id}`);graphs++;
 if(kind==='existence'&&lang==='en'&&tense==='present'&&mode==='affirmative')assert.ok(cell.text.startsWith(number==='plural'?'There are ':'There is '));
 if(kind==='existence'&&lang==='pt'&&tense==='past')assert.ok(/havia/i.test(cell.text)&&!/haviam/i.test(cell.text));
}}
assert.equal(forms,648);assert.equal(graphs,648);
const sandbox={Object,Number};sandbox.globalThis=sandbox;vm.runInNewContext(fs.readFileSync('js/verb-explorer-experience-presentation-memory.js','utf8'),sandbox);
const memory=sandbox.SIYAYOVerbExplorerExperiencePresentationMemory;const state={gearStudy:{functionId:'existence',number:'plural',target:'are'},wordType:'verb',session:{secret:true}};memory.remember('s1',state);state.gearStudy.number='singular';assert.equal(memory.recall('s1').gearStudy.number,'plural');assert.equal(memory.recall('s1').session,undefined);assert.equal(memory.recall('s2'),null);
console.log(`PASS ${forms} trilingual study forms and ${graphs} authored partial graphs; number, mode, target, probe, memory and authority checks`);
