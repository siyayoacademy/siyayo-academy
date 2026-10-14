#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Source=require('../js/verb-explorer-dependency-structure-source.js');
const Definition=require('../js/adaptive-dependency-head-probe-definition.js');
const Focus=require('../js/adaptive-dependency-focus-view.js');
const seeds=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const shopping=seeds.find(e=>e.id==='shopping-for-dinner');
const which=shopping.thinkingMind.find(q=>q.questionWord==='which');
const urls=fs.readFileSync('js/verb-explorer.js','utf8');
const paths=[
 'data/learning/dependencies/shopping-which-en.json',
 'data/learning/dependencies/shopping-cual-es.json',
 'data/learning/dependencies/shopping-qual-pt.json',
 'data/learning/dependencies/all-these-three-books.json',
 'data/learning/dependencies/todos-estes-tres-livros.json'
];
const structures=new Map(paths.map(path=>{
 const structure=JSON.parse(fs.readFileSync(path,'utf8'));
 return [structure.id,structure];
}));
let count=0;
function check(predicate,reason){assert.ok(predicate,reason);count++;}
for(const [language,reference,targetWord] of [
 ['en','Which cheese should we choose?','Which'],
 ['es','¿Cuál queso deberíamos elegir?','Cuál'],
 ['pt','Qual queijo devemos escolher?','Qual']
]){
 const structure=Source.resolve(which.dependencyFocus,language,structures);
 check(!!structure,language+' structure resolves');
 check(structure.sentence===reference,language+' sentence grounded');
 check(which.question[language]===reference,language+' question same as Focus');
 check(which.dependencyFocus.structureIds[language]===structure.id,language+' Focus ID');
 check(which.dependencyHeadProbe.structureIds[language]===structure.id,language+' Probe ID');
 check(which.dependencyFocus.defaultFocusByLanguage[language]==='cheese',language+' focus on cheese');
 check(structure.tokens.some(t=>t.id==='which'&&t.form===targetWord&&t.wordClass==='DET'),language+' interrogative determiner');
 check(structure.tokens.some(t=>t.id==='cheese'&&t.wordClass==='NOUN'),language+' noun head');
 check(structure.relations.some(r=>r.head==='cheese'&&r.dependent==='which'&&r.relation==='det'),language+' dependency relation');
 check(structure.tokens.every((t,i)=>t.index===i+1&&t.pedagogy?.wordType?.[language]),language+' tokens correctly typed');
 check(!!Focus.resolve(structure,'cheese'),language+' dependency focus can resolve');
 const meta=which.dependencyHeadProbe;
 const definition=Definition.create(structure,{
   experienceId:shopping.id,
   targetTokenId:meta.targetTokenIdsByLanguage[language],
   prompt:meta.prompt[language],
   alternativeTokenIds:meta.alternativeTokenIdsByLanguage[language]
 });
 check(!!definition,language+' valid probe definition');
 check(definition.expectedHeadTokenId==='cheese',language+' head is cheese');
 check(definition.targetToken.id==='which',language+' target determiner');
 check(definition.alternatives.length===3,language+' 3 candidate tokens');
 check(definition.alternatives.some(a=>a.id==='cheese'),language+' correct option visible');
 check(urls.includes('data/learning/dependencies/'+structure.id+'.json'),language+' loaded into runtime');
 check(structure.pedagogy.doesNotClaim.includes('green-pass'),language+' no claimed Green');
}
check(!structures.get('shopping-qual-pt').tokens.some(t=>t.id==='we'),'PT omits explicit subject');
check(structures.get('shopping-which-en').tokens.some(t=>t.id==='we'),'EN retains explicit subject');
check(shopping.dependencyFocus.structureIds.en==='all-these-three-books','original Experience-level EN fixture unchanged');
check(shopping.dependencyFocus.structureIds.pt==='todos-estes-tres-livros','original Experience-level PT fixture unchanged');
check(shopping.dependencyHeadProbe.targetTokenId==='three','original Experience-level Head Probe unchanged');
check(urls.includes('data/learning/dependencies/all-these-three-books.json'),'legacy books still loaded');
check(urls.includes('data/learning/dependencies/todos-estes-tres-livros.json'),'legacy livros still loaded');
check(!Source.resolve(which.dependencyFocus,'pt',new Map([['shopping-which-en',structures.get('shopping-which-en')]])),'no EN fallback for PT');
check(!Source.resolve(which.dependencyFocus,'en',new Map([['shopping-qual-pt',structures.get('shopping-qual-pt')]])),'no PT fallback for EN');
console.log('PASS: '+count+' targeted Shopping WHICH/QUAL contextual dependency checks');
