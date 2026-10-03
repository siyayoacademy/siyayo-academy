#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/story-assessment-leaf-surface.js','utf8');

function load(){
  const sandbox=vm.createContext({Object});
  sandbox.globalThis=sandbox;
  vm.runInContext(code,sandbox,{filename:'js/story-assessment-leaf-surface.js'});
  return sandbox.SIYAYOStoryAssessmentLeafSurface;
}

{
  const boundary=load();
  assert(boundary&&typeof boundary.read==='function',
    'Story Assessment Leaf surface boundary must expose read()');

  const scene={
    surfaces:[
      {id:'question-choice',realizations:{en:'Which'}},
      {id:'decision-agent',realizations:{en:'we'}}
    ],
    assessmentLeaf:{
      anchorSurfaceId:'question-choice',
      assessmentTarget:{
        skill:'which.use.determiner',
        definitionPath:'data/learning/skills/which.json'
      }
    }
  };

  const binding=boundary.read(scene);
  assert(binding,'explicit Assessment Leaf surface binding must be readable');
  assert.equal(binding.surfaceId,'question-choice');
  assert.equal(binding.leaf,scene.assessmentLeaf);
}

for(const scene of [
  null,
  {},
  {targetWords:{en:'Which'}},
  {surfaces:[{id:'question-choice',realizations:{en:'Which'}}]},
  {assessmentLeaf:{anchorSurfaceId:'question-choice'}},
  {
    surfaces:[{id:'question-choice',realizations:{en:'Which'}}],
    assessmentLeaf:{
      assessmentTarget:{
        skill:'which.use.determiner',
        definitionPath:'data/learning/skills/which.json'
      }
    }
  },
  {
    surfaces:[{id:'question-choice',realizations:{en:'Which'}}],
    assessmentLeaf:{
      anchorSurfaceId:'missing-surface',
      assessmentTarget:{
        skill:'which.use.determiner',
        definitionPath:'data/learning/skills/which.json'
      }
    }
  }
]){
  const boundary=load();
  assert.equal(boundary.read(scene),null,
    'missing, incomplete, or unresolvable Leaf-to-Surface declarations must WAIT');
}

{
  const boundary=load();
  const scene={
    surfaces:[
      {id:'question-choice',realizations:{en:'Which'}},
      {id:'decision-agent',realizations:{en:'we'}}
    ],
    assessmentLeaf:{
      anchorSurfaceId:'decision-agent',
      assessmentTarget:{
        skill:'pronoun.subject.first-person-plural',
        definitionPath:'data/learning/skills/pronouns.json'
      }
    }
  };
  const binding=boundary.read(scene);
  assert(binding,'explicit anchor must select the declared semantic Surface');
  assert.equal(binding.surfaceId,'decision-agent');
}

console.log('Story Assessment Leaf Surface: PASS — an Assessment Leaf binds only to its explicitly declared semantic surface id; text, targetWords, and unmatched surfaces never create the association.');
