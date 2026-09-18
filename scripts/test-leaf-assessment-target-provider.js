#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/leaf-assessment-target-provider.js','utf8');

function load(options={}){
  const calls=[];
  const sandbox=vm.createContext({Object,Promise});
  sandbox.globalThis=sandbox;
  if(options.readiness!==false){
    sandbox.SIYAYOLeafAssessmentTargetReadiness={
      adopt(target){
        calls.push(target);
        return Promise.resolve(options.adoptResult===true);
      }
    };
  }
  vm.runInContext(code,sandbox,{filename:'js/leaf-assessment-target-provider.js'});
  return {provider:sandbox.SIYAYOLeafAssessmentTargetProvider,calls};
}

(async()=>{
  {
    const {provider,calls}=load({adoptResult:false});
    assert(provider&&typeof provider.select==='function','canonical Leaf producer must expose select()');
    const leaf={
      assessmentTarget:{
        skill:'which.use.determiner',
        definitionPath:'data/learning/skills/which.json'
      },
      targetWords:{en:'which',es:'cuál',pt:'qual'},
      story:{role:'guide'}
    };
    assert.equal(await provider.select(leaf),false,'producer must preserve downstream WAIT');
    assert.deepEqual(calls,[{
      skill:'which.use.determiner',
      definitionPath:'data/learning/skills/which.json'
    }],'explicit Leaf Target must be forwarded unchanged to readiness');
  }

  for(const leaf of [
    null,
    {},
    {targetWords:{en:'which'}},
    {assessmentTarget:{skill:'which.use.determiner'}},
    {assessmentTarget:{definitionPath:'data/learning/skills/which.json'}}
  ]){
    const {provider,calls}=load();
    assert.equal(await provider.select(leaf),false,'incomplete or ordinary content must WAIT');
    assert.equal(calls.length,0,'producer must not infer an assessment Target');
  }

  {
    const {provider,calls}=load({readiness:false});
    assert.equal(await provider.select({assessmentTarget:{
      skill:'which.use.determiner',
      definitionPath:'data/learning/skills/which.json'
    }}),false,'missing readiness boundary must WAIT');
    assert.equal(calls.length,0);
  }

  console.log('Leaf Assessment Target Provider: PASS — the storyteller may present and supervise an explicitly declared Leaf Target, but never invents it from targetWords, story, Experience, Resonance, or Green Pass.');
})().catch(error=>{console.error(error);process.exit(1);});
