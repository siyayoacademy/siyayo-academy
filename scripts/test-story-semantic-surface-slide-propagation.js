#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/app.js','utf8');

function build(chapter){
  const sandbox=vm.createContext({
    console:{log(){},warn(){},error(){}},
    speechSynthesis:{cancel(){}},
    document:{addEventListener(){}}
  });
  sandbox.globalThis=sandbox;
  sandbox.window={addEventListener(){}};
  vm.runInContext(code,sandbox,{filename:'js/app.js'});
  return sandbox.buildSlides({chapter});
}

{
  const surfaces=[
    {id:'question-choice',realizations:{en:'Which',es:'Cuál',pt:'Qual'}},
    {id:'decision-agent',realizations:{en:'we',es:'nosotros',pt:'nós'}}
  ];
  const assessmentLeaf={
    anchorSurfaceId:'question-choice',
    assessmentTarget:{
      skill:'which.use.determiner',
      definitionPath:'data/learning/skills/which.json'
    }
  };
  const slides=build({
    sections:[{
      id:'surface-example',
      type:'examples',
      title:'Surface example',
      items:[{
        classification:{en:'Question choice'},
        sentences:{en:'Which cheese should we choose?',es:'¿Cuál queso debemos elegir?',pt:'Qual queijo devemos escolher?'},
        targetWords:{en:'Which',es:'Cuál',pt:'Qual'},
        surfaces,
        assessmentLeaf
      }]
    }]
  });

  assert.equal(slides.length,1);
  assert.deepEqual(slides[0].surfaces,surfaces,
    'explicit Story semantic surfaces must survive example item → Smart Slide construction');
  assert.equal(slides[0].assessmentLeaf,assessmentLeaf,
    'existing Assessment Leaf propagation must remain intact');
}

{
  const surfaces=[
    {id:'decision-agent',realizations:{en:'we',es:'nosotros',pt:'nós'}}
  ];
  const slides=build({
    sections:[{
      id:'surface-conversation',
      type:'conversation',
      title:'Conversation',
      items:[{
        en:'Which cheese should we choose?',
        es:'¿Cuál queso debemos elegir?',
        pt:'Qual queijo devemos escolher?',
        targetWords:{en:'Which',es:'Cuál',pt:'Qual'},
        surfaces
      }]
    }]
  });

  assert.equal(slides.length,1);
  assert.deepEqual(slides[0].surfaces,surfaces,
    'explicit Story semantic surfaces must survive conversation item → Smart Slide construction');
}

{
  const slides=build({
    sections:[{
      id:'ordinary-example',
      type:'examples',
      title:'Ordinary',
      items:[{
        sentences:{en:'The cat is here.',es:'El gato está aquí.',pt:'O gato está aqui.'},
        targetWords:{en:'cat',es:'gato',pt:'gato'}
      }]
    }]
  });

  assert.equal(slides.length,1);
  assert.equal(Object.prototype.hasOwnProperty.call(slides[0],'surfaces'),false,
    'ordinary Story content must not gain semantic surfaces during Smart Slide construction');
}

console.log('Story Semantic Surface Smart Slide propagation: PASS — explicitly declared surfaces survive Story item → slide construction; ordinary content gains none.');
