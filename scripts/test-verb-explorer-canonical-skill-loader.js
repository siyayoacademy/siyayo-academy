#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const loaderCode=fs.readFileSync('js/verb-explorer-canonical-skill-loader.js','utf8');
const definition=Object.freeze({id:'which.use.determiner',passContract:Object.freeze({requires:Object.freeze([])})});

function build(options={}){
  let fetchCalls=0;
  let adoptCalls=0;
  const paths=[];
  const sandbox=vm.createContext({Object,Promise});
  sandbox.globalThis=sandbox;

  if(options.withSource!==false){
    sandbox.SIYAYOVerbExplorerCanonicalSkillSource=Object.freeze({
      adopt(value){
        adoptCalls+=1;
        return options.adoptResult===false?false:value===definition;
      }
    });
  }

  if(options.withFetch!==false){
    sandbox.fetch=function(path){
      fetchCalls+=1;
      paths.push(path);
      if(options.rejectFetch)return Promise.reject(new Error('network unavailable'));
      return Promise.resolve({
        ok:options.ok!==false,
        json:options.noJson?undefined:function(){
          if(options.rejectJson)return Promise.reject(new Error('invalid json'));
          return Promise.resolve(definition);
        }
      });
    };
  }

  vm.runInContext(loaderCode,sandbox,{filename:'js/verb-explorer-canonical-skill-loader.js'});
  return {sandbox,paths,getFetchCalls:()=>fetchCalls,getAdoptCalls:()=>adoptCalls};
}

(async function(){
  {
    const t=build();
    const loader=t.sandbox.SIYAYOVerbExplorerCanonicalSkillLoader;
    assert.equal(await loader.load('data/learning/skills/which.json'),true);
    assert.deepEqual(t.paths,['data/learning/skills/which.json']);
    assert.equal(t.getAdoptCalls(),1);
    assert.equal(await loader.load('data/learning/skills/which.json'),true);
    assert.equal(t.getFetchCalls(),1,'same canonical path must reuse the pending/resolved JSON Promise');
    assert.equal(t.getAdoptCalls(),2,'cached definition still passes through Source authority on each load request');
    assert.equal(await loader.load(' data/learning/skills/other.json '),true);
    assert.equal(t.getFetchCalls(),2,'a distinct explicit path must have its own fetch');
    assert.equal(t.paths[1],'data/learning/skills/other.json','path must be trimmed but not inferred or remapped');
  }

  {
    const t=build();
    assert.equal(await t.sandbox.SIYAYOVerbExplorerCanonicalSkillLoader.load('   '),false,'blank path must WAIT');
    assert.equal(t.getFetchCalls(),0);
    assert.equal(t.getAdoptCalls(),0);
  }

  {
    const t=build({withSource:false});
    assert.equal(await t.sandbox.SIYAYOVerbExplorerCanonicalSkillLoader.load('data/learning/skills/which.json'),false,'missing canonical Source must WAIT');
    assert.equal(t.getFetchCalls(),0);
  }

  {
    const t=build({withFetch:false});
    assert.equal(await t.sandbox.SIYAYOVerbExplorerCanonicalSkillLoader.load('data/learning/skills/which.json'),false,'missing fetch must WAIT');
  }

  for(const options of [{ok:false},{noJson:true},{rejectFetch:true},{rejectJson:true}]){
    const t=build(options);
    assert.equal(await t.sandbox.SIYAYOVerbExplorerCanonicalSkillLoader.load('data/learning/skills/which.json'),false,'transport/HTTP/JSON failure must WAIT');
    assert.equal(t.getAdoptCalls(),0,'unavailable definition must never reach Source authority');
  }

  {
    const t=build({adoptResult:false});
    assert.equal(await t.sandbox.SIYAYOVerbExplorerCanonicalSkillLoader.load('data/learning/skills/which.json'),false,'Source rejection must remain WAIT');
    assert.equal(t.getFetchCalls(),1);
    assert.equal(t.getAdoptCalls(),1);
  }

  console.log('Canonical Skill Loader: PASS — explicit paths load once, definitions remain Source-authorized, and unavailable/rejected inputs WAIT fail-closed.');
})().catch(function(error){
  console.error(error);
  process.exitCode=1;
});
