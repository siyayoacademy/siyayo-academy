#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/story-semantic-surface-dom-materialization.js','utf8');

function load(){
  const sandbox=vm.createContext({Object});
  sandbox.globalThis=sandbox;
  vm.runInContext(code,sandbox,{filename:'js/story-semantic-surface-dom-materialization.js'});
  return sandbox.SIYAYOStorySemanticSurfaceDOMMaterialization;
}

{
  const boundary=load();
  assert(boundary&&typeof boundary.describe==='function',
    'Story semantic surface DOM materialization boundary must expose describe()');

  const descriptor=boundary.describe({
    surfaceId:'question-choice',
    language:'en',
    text:'Which'
  });

  assert(descriptor,'explicit semantic realization must produce a DOM descriptor');
  assert.equal(descriptor.surfaceId,'question-choice');
  assert.equal(descriptor.language,'en');
  assert.equal(descriptor.text,'Which');
  assert.equal(descriptor.attributes['data-surface-id'],'question-choice');
  assert.equal(descriptor.attributes['data-surface-language'],'en');

  assert.equal(Object.prototype.hasOwnProperty.call(descriptor.attributes,'role'),false,
    'materialization must not grant interactive role');
  assert.equal(Object.prototype.hasOwnProperty.call(descriptor.attributes,'tabindex'),false,
    'materialization must not grant keyboard authority');
  assert.equal(Object.prototype.hasOwnProperty.call(descriptor,'assessmentLeaf'),false,
    'materialization must not attach Assessment authority');
}

for(const realization of [
  null,
  {},
  {surfaceId:'question-choice',language:'en'},
  {surfaceId:'question-choice',text:'Which'},
  {language:'en',text:'Which'},
  {surfaceId:'   ',language:'en',text:'Which'},
  {surfaceId:'question-choice',language:'   ',text:'Which'},
  {surfaceId:'question-choice',language:'en',text:'   '}
]){
  const boundary=load();
  assert.equal(boundary.describe(realization),null,
    'incomplete semantic realization must WAIT rather than invent DOM identity');
}

console.log('Story Semantic Surface DOM Materialization: PASS — explicit surface identity can be described for DOM without granting interaction or Assessment authority.');
