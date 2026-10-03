#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('js/app.js','utf8');

const start=source.indexOf('function buildSlides(chapterData)');
const end=source.indexOf('/* ========================================\n   RENDER LANGUAGE LINES',start);
assert.notEqual(start,-1,'Smart Slides must expose buildSlides()');
assert.notEqual(end,-1,'test must isolate buildSlides() before render helpers');

const code=source.slice(start,end);
const sandbox=vm.createContext({console});
sandbox.globalThis=sandbox;
sandbox.createLanguageLines=(content,targetWords)=>({content,targetWords});
vm.runInContext(code+'\n;globalThis.__buildSlides=buildSlides;',sandbox,{filename:'js/app.js#buildSlides'});

const explicitLeaf={
  assessmentTarget:{
    skill:'which.use.determiner',
    definitionPath:'data/learning/skills/which.json'
  }
};

const chapterData={
  chapter:{
    sections:[
      {
        id:'choice-example',
        type:'examples',
        title:'Choice',
        items:[{
          classification:{en:'Choice'},
          sentences:{en:'Which cheese should I choose?'},
          targetWords:{en:'which'},
          assessmentLeaf:explicitLeaf
        }]
      },
      {
        id:'ordinary-conversation',
        type:'conversation',
        title:'Conversation',
        items:[{
          en:'Where is the hotel?',
          targetWords:{en:'hotel'}
        }]
      }
    ]
  }
};

const slides=sandbox.__buildSlides(chapterData);
assert.equal(slides.length,2);

assert(slides[0].assessmentLeaf,'explicit Story assessment Leaf must survive Smart Slide construction');
assert.equal(slides[0].assessmentLeaf.assessmentTarget.skill,'which.use.determiner');
assert.equal(slides[0].assessmentLeaf.assessmentTarget.definitionPath,'data/learning/skills/which.json');

assert.equal(slides[1].assessmentLeaf,undefined,
  'ordinary Story content must not gain an Assessment Leaf during slide construction');

assert.equal(source.includes('SIYAYOLeafAssessmentTargetProvider.select('),false,
  'building Smart Slides must not select a Leaf or trigger readiness');

console.log('Story Assessment Leaf Smart Slide propagation: PASS — an explicitly declared assessmentLeaf survives Story item → slide construction; ordinary content gains none and construction has no selection side effect.');
