#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/story-semantic-surface.js','utf8');

function load(){
  const sandbox=vm.createContext({Object});
  sandbox.globalThis=sandbox;
  vm.runInContext(code,sandbox,{filename:'js/story-semantic-surface.js'});
  return sandbox.SIYAYOStorySemanticSurface;
}

{
  const boundary=load();
  assert(boundary&&typeof boundary.read==='function','Story semantic surface boundary must expose read()');

  const scene={
    targetWords:{en:'Which',es:'Cuál',pt:'Qual'},
    surfaces:[{
      id:'question-choice',
      realizations:{en:'Which',es:'Cuál',pt:'Qual'}
    }]
  };

  const surface=boundary.read(scene,'question-choice');
  assert(surface,'explicit Story semantic surface must be readable');
  assert.equal(surface.id,'question-choice');
  assert.equal(surface.realizations.en,'Which');
  assert.equal(surface.realizations.es,'Cuál');
  assert.equal(surface.realizations.pt,'Qual');
}

for(const scene of [
  null,
  {},
  {targetWords:{en:'Which',es:'Cuál',pt:'Qual'}},
  {surfaces:[]},
  {surfaces:[{realizations:{en:'Which'}}]},
  {surfaces:[{id:'question-choice'}]},
  {surfaces:[{id:'',realizations:{en:'Which'}}]}
]){
  const boundary=load();
  assert.equal(boundary.read(scene,'question-choice'),null,
    'targetWords, ordinary content, or incomplete declarations must not create a semantic Surface');
}

{
  const boundary=load();
  const scene={
    surfaces:[
      {id:'question-choice',realizations:{en:'Which'}},
      {id:'decision-agent',realizations:{en:'we'}}
    ]
  };
  const surface=boundary.read(scene,'decision-agent');
  assert(surface,'surface identity must distinguish multiple explicit surfaces in one scene');
  assert.equal(surface.id,'decision-agent');
  assert.equal(surface.realizations.en,'we');
}

{
  const boundary=load();
  const scene={surfaces:[{id:'question-choice',realizations:{en:'Which'}}]};
  assert.equal(boundary.read(scene,'missing-surface'),null,
    'an undeclared surface id must not be inferred from text');
}

console.log('Story Semantic Surface: PASS — only an explicitly declared surface id is readable; targetWords and matching text alone never create semantic Surface identity.');
