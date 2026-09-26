#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/story-assessment-leaf.js','utf8');

function load(){
  const sandbox=vm.createContext({Object});
  sandbox.globalThis=sandbox;
  vm.runInContext(code,sandbox,{filename:'js/story-assessment-leaf.js'});
  return sandbox.SIYAYOStoryAssessmentLeaf;
}

{
  const boundary=load();
  assert(boundary&&typeof boundary.read==='function','Story assessment Leaf boundary must expose read()');

  const scene={
    sentences:{en:'Which cheese should I choose?',es:'¿Cuál queso debería elegir?',pt:'Qual queijo devo escolher?'},
    targetWords:{en:'which',es:'cuál',pt:'qual'},
    assessmentLeaf:{
      assessmentTarget:{
        skill:'which.use.determiner',
        definitionPath:'data/learning/skills/which.json'
      }
    }
  };

  const leaf=boundary.read(scene);
  assert(leaf,'explicit Story assessment Leaf must be readable');
  assert.equal(leaf.assessmentTarget.skill,'which.use.determiner');
  assert.equal(leaf.assessmentTarget.definitionPath,'data/learning/skills/which.json');
}

for(const scene of [
  null,
  {},
  {targetWords:{en:'which',es:'cuál',pt:'qual'}},
  {sentences:{en:'Which cheese should I choose?'}},
  {assessmentLeaf:{}},
  {assessmentLeaf:{assessmentTarget:{skill:'which.use.determiner'}}},
  {assessmentLeaf:{assessmentTarget:{definitionPath:'data/learning/skills/which.json'}}}
]){
  const boundary=load();
  assert.equal(boundary.read(scene),null,'ordinary or incomplete Story content must not become an Assessment Leaf');
}

console.log('Story Assessment Leaf: PASS — Story may explicitly declare an Assessment Leaf with a canonical Target; targetWords, sentences, and presentation content alone never create one.');
