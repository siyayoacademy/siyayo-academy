#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/story-assessment-leaf-selection.js','utf8');

function load(options={}){
  const calls={read:[],select:[]};
  const sandbox=vm.createContext({Object,Promise});
  sandbox.globalThis=sandbox;

  if(options.reader!==false){
    sandbox.SIYAYOStoryAssessmentLeaf={
      read(scene){
        calls.read.push(scene);
        return options.leaf===undefined ? scene&&scene.assessmentLeaf||null : options.leaf;
      }
    };
  }

  if(options.provider!==false){
    sandbox.SIYAYOLeafAssessmentTargetProvider={
      select(leaf){
        calls.select.push(leaf);
        return Promise.resolve(options.selectResult===true);
      }
    };
  }

  vm.runInContext(code,sandbox,{filename:'js/story-assessment-leaf-selection.js'});
  return {selection:sandbox.SIYAYOStoryAssessmentLeafSelection,calls};
}

(async()=>{
  const explicitLeaf={
    assessmentTarget:{
      skill:'which.use.determiner',
      definitionPath:'data/learning/skills/which.json'
    }
  };
  const slide={
    type:'example',
    targetWords:{en:'which'},
    assessmentLeaf:explicitLeaf
  };

  {
    const {selection,calls}=load({selectResult:false});
    assert(selection&&typeof selection.select==='function','human Story Leaf selection boundary must expose select()');
    assert.equal(await selection.select(slide),false,'human selection must preserve downstream WAIT');
    assert.equal(calls.read.length,1,'explicit selection must inspect the selected slide exactly once');
    assert.equal(calls.select.length,1,'explicit Assessment Leaf selection must call the Target provider exactly once');
    assert.equal(calls.select[0],explicitLeaf,'reader result must be forwarded to the Target provider');
  }

  for(const ordinary of [
    null,
    {},
    {type:'example',targetWords:{en:'which'}},
    {type:'conversation',targetWords:{en:'hotel'}}
  ]){
    const {selection,calls}=load();
    assert.equal(await selection.select(ordinary),false,'ordinary or missing slide content must WAIT');
    assert.equal(calls.select.length,0,'ordinary targetWords must never select a pedagogical Target');
  }

  {
    const {selection,calls}=load({reader:false});
    assert.equal(await selection.select(slide),false,'missing Story Assessment Leaf reader must WAIT');
    assert.equal(calls.select.length,0);
  }

  {
    const {selection,calls}=load({provider:false});
    assert.equal(await selection.select(slide),false,'missing Target provider must WAIT');
    assert.equal(calls.read.length,1);
    assert.equal(calls.select.length,0);
  }

  console.log('Human Story Assessment Leaf Selection: PASS — only an explicit learner selection of a slide carrying an Assessment Leaf may forward that Leaf to the Target provider; ordinary targetWords remain presentation only.');
})().catch(error=>{console.error(error);process.exit(1);});
