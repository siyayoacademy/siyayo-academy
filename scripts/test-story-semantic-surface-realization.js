#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/story-semantic-surface-realization.js','utf8');

function load(){
  const sandbox=vm.createContext({Object});
  sandbox.globalThis=sandbox;
  vm.runInContext(code,sandbox,{filename:'js/story-semantic-surface-realization.js'});
  return sandbox.SIYAYOStorySemanticSurfaceRealization;
}

{
  const boundary=load();
  assert(boundary&&typeof boundary.read==='function',
    'Story semantic surface realization boundary must expose read()');

  const surface={
    id:'question-choice',
    realizations:{en:'Which',es:'Cuál',pt:'Qual'}
  };

  const realization=boundary.read(surface,'en');
  assert(realization,'explicit language realization must be readable');
  assert.equal(realization.surfaceId,'question-choice');
  assert.equal(realization.language,'en');
  assert.equal(realization.text,'Which');
}

for(const [surface,language] of [
  [null,'en'],
  [{id:'question-choice'},'en'],
  [{realizations:{en:'Which'}},'en'],
  [{id:'question-choice',realizations:{en:'Which'}},''],
  [{id:'question-choice',realizations:{en:'Which'}},'pt'],
  [{id:'question-choice',realizations:{en:'   '}},'en']
]){
  const boundary=load();
  assert.equal(boundary.read(surface,language),null,
    'missing identity, language, or explicit realization must WAIT');
}

{
  const boundary=load();
  const surface={
    id:'decision-agent',
    realizations:{en:'we',es:'nosotros',pt:'nós'}
  };
  const realization=boundary.read(surface,'pt');
  assert.equal(realization.surfaceId,'decision-agent');
  assert.equal(realization.language,'pt');
  assert.equal(realization.text,'nós');
}

console.log('Story Semantic Surface Realization: PASS — only an explicitly declared language realization is exposed with its stable surface id; text matching never creates identity.');
