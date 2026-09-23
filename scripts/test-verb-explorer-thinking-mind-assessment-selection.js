#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/verb-explorer-thinking-mind-assessment-selection.js','utf8');

function load(options={}){
  const calls=[];
  const sandbox=vm.createContext({Object,Promise});
  sandbox.globalThis=sandbox;
  if(options.provider!==false){
    sandbox.SIYAYOLeafAssessmentTargetProvider={
      select(leaf){
        calls.push(leaf);
        return Promise.resolve(options.result===true);
      }
    };
  }
  vm.runInContext(code,sandbox,{filename:'js/verb-explorer-thinking-mind-assessment-selection.js'});
  return {api:sandbox.SIYAYOVerbExplorerThinkingMindAssessmentSelection,calls};
}

(async()=>{
  const which={
    questionWord:'which',
    assessmentTarget:{
      skill:'which.use.determiner',
      definitionPath:'data/learning/skills/which.json'
    }
  };

  {
    const t=load({result:true});
    assert.equal(await t.api.select(which),true);
    assert.equal(t.calls.length,1);
    assert.equal(t.calls[0].assessmentTarget.skill,'which.use.determiner');
    assert.equal(t.calls[0].assessmentTarget.definitionPath,'data/learning/skills/which.json');
  }

  for(const ordinary of [
    null,
    {},
    {questionWord:'which'},
    {questionWord:'which',choiceContext:{}},
    {questionWord:'what',assessmentTarget:null}
  ]){
    const t=load({result:true});
    assert.equal(await t.api.select(ordinary),false);
    assert.equal(t.calls.length,0,'questionWord/choiceContext must never infer assessment Target');
  }

  {
    const t=load({provider:false});
    assert.equal(await t.api.select(which),false);
  }

  console.log('Thinking Mind assessment selection: PASS — only an explicitly declared assessmentTarget is forwarded; questionWord, choiceContext, and Experience semantics never infer Skill.');
})().catch(error=>{console.error(error);process.exit(1);});
