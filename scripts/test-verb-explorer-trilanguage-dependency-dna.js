#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Source=require('../js/verb-explorer-dependency-structure-source.js');
const experience=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items.find(x=>x.id==='shopping-for-dinner');
const paths=[
  'data/learning/dependencies/all-these-three-books.json',
  'data/learning/dependencies/todos-estos-tres-libros.json',
  'data/learning/dependencies/todos-estes-tres-livros.json'
];
const corpora=paths.map(path=>JSON.parse(fs.readFileSync(path,'utf8')));
const byId=new Map(corpora.map(item=>[item.id,item]));
const expected={
  en:{sentence:'All these three books.',target:'three',head:'books'},
  es:{sentence:'Todos estos tres libros.',target:'tres',head:'libros'},
  pt:{sentence:'Todos estes três livros.',target:'três',head:'livros'}
};
for(const language of ['en','es','pt']){
  const structure=Source.resolve(experience.dependencyFocus,language,byId);
  assert.ok(structure,language+' must resolve its own canonical dependency DNA');
  assert.equal(structure.language,language);
  assert.equal(structure.sentence,expected[language].sentence);
  assert.equal(structure.tokens.find(t=>t.id==='three').form,expected[language].target);
  assert.equal(structure.tokens.find(t=>t.id==='books').form,expected[language].head);
  assert.equal(experience.dependencyHeadProbe.structureIds[language],structure.id);
  assert.match(experience.dependencyHeadProbe.prompt[language],new RegExp(expected[language].target,'i'));
}
const missing=new Map([['all-these-three-books',byId.get('all-these-three-books')]]);
assert.equal(Source.resolve(experience.dependencyFocus,'es',missing),null,'missing Spanish DNA must fail closed, never fall back to English');
assert.equal(Source.resolve(experience.dependencyFocus,'pt',missing),null,'missing Portuguese DNA must fail closed, never fall back to English');
console.log('Tri-language Dependency DNA: PASS — EN/ES/PT resolve independent canonical structures and missing language DNA never falls back to English.');
