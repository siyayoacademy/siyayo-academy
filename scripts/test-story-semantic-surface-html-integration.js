#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const appCode=fs.readFileSync('js/app.js','utf8');

function load(){
  const sandbox=vm.createContext({
    console:{log(){},warn(){},error(){}},
    fetch:async()=>({ok:true,json:async()=>({chapter:{sections:[]}})}),
    speechSynthesis:{cancel(){},speak(){}},
    SpeechSynthesisUtterance:function(){},
    document:{
      addEventListener(){},
      querySelector(){return null;},
      querySelectorAll(){return[];},
      getElementById(){return null;}
    },
    window:{addEventListener(){}}
  });
  sandbox.globalThis=sandbox;
  vm.runInContext(appCode,sandbox,{filename:'js/app.js'});
  return sandbox;
}

{
  const app=load();
  assert.equal(typeof app.renderLanguageLines,'function',
    'app.js must expose renderLanguageLines in its script realm');

  const lines=[{
    language:'en',
    label:'IN ENGLISH',
    text:'Which cheese should we choose?',
    target:'Which'
  }];
  const surfaces=[{
    id:'question-choice',
    realizations:{en:'Which',es:'Cuál',pt:'Qual'}
  }];

  const html=app.renderLanguageLines(lines,surfaces);

  assert.match(html,/data-surface-id="question-choice"/,
    'explicit semantic Surface id must reach rendered HTML');
  assert.match(html,/data-surface-language="en"/,
    'the rendered Surface must preserve the line language');
  assert.match(html,/>\s*Which\s*</,
    'the explicit language realization must remain visible text');

  assert.doesNotMatch(html,/data-assessment|data-skill|assessmentLeaf/i,
    'DOM materialization must not grant Assessment or Skill authority');
}

{
  const app=load();
  const lines=[{
    language:'en',
    label:'IN ENGLISH',
    text:'Which cheese should we choose?',
    target:'Which'
  }];

  const html=app.renderLanguageLines(lines,[]);
  assert.doesNotMatch(html,/data-surface-id=/,
    'presentation targetWords alone must never create semantic Surface identity');
}

console.log('Story Semantic Surface HTML Integration: PASS — explicit surfaces reach rendered HTML with language identity; presentation highlighting alone creates no semantic identity or Assessment authority.');
