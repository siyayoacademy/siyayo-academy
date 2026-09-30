#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Source=require('../js/verb-explorer-dependency-structure-source.js');
const Focus=require('../js/adaptive-dependency-focus-view.js');
const seeds=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const runtime=fs.readFileSync('js/verb-explorer.js','utf8');
const corpora=new Map();
for(const path of [...runtime.match(/DEPENDENCY_FOCUS_URLS=\[([^\]]+)\]/)[1].matchAll(/"([^"]+)"/g)].map(m=>m[1])){
 const d=JSON.parse(fs.readFileSync(path,'utf8'));corpora.set(d.id,d);
}
let question,language='en',rendered=null;
const surface={hidden:true,innerHTML:''};
const root={window:{SIYAYOVerbExplorerDependencyStructureSource:Source,
 SIYAYOVerbExplorerDependencyFocusSurface:{render(input){rendered=input;surface.hidden=false;return true;}},
 SIYAYOVerbExplorerDependencyFocusInteraction:{updateStructure(){return true;}}},
 document:{getElementById:()=>surface},activeThinkingQuestion:()=>question,
 dependencyStructuresById:corpora};
const context=vm.createContext(root);
vm.runInContext('let experienceLanguage="en";'+runtime.slice(runtime.indexOf('function activeDependencyStructure('),runtime.indexOf('function renderDependencyHeadProbe(')),context);
for(const id of ['shopping-for-dinner','preparing-dinner']){
 const x=seeds.find(x=>x.id===id);question=x.thinkingMind.find(q=>q.questionWord==='what');
 for(const lang of ['en','es','pt']){
  vm.runInContext('experienceLanguage='+JSON.stringify(lang),context);
  root.x=x;vm.runInContext('renderDependencyFocus(x)',context);
  assert.equal(surface.hidden,false);
  assert.equal(rendered.structure.language,lang);
  assert.equal(rendered.structure.sentence,question.question[lang]);
  assert.ok(Focus.resolve(rendered.structure,rendered.focusId));
  for(const token of rendered.structure.tokens)assert.ok(Focus.resolve(rendered.structure,token.id));
  assert.ok(rendered.structure.relations.some(r=>r.dependent==='what'&&r.relation==='obj'));
 }
 question=x.thinkingMind.find(q=>q.questionWord==='where');
 vm.runInContext('renderDependencyFocus(x)',context);
 assert.equal(surface.hidden,true,'undeclared QWord cannot display unrelated books fixture');
}
const shopping=seeds.find(x=>x.id==='shopping-for-dinner');
question=shopping.thinkingMind.find(q=>q.questionWord==='which');
root.x=shopping;vm.runInContext('experienceLanguage="en";renderDependencyFocus(x)',context);
assert.equal(rendered.structure.id,'all-these-three-books','original WHICH fixture preserved');
let mounted=0,hidden=0;
root.window.SIYAYOVerbExplorerDependencyHeadProbeLive={mount(){mounted++;return true;},hide(){hidden++;}};
vm.runInContext(runtime.slice(runtime.indexOf('function renderDependencyHeadProbe('),runtime.indexOf('function refreshThinkingMindAssessmentHighlight(')),context);
question=shopping.thinkingMind.find(q=>q.questionWord==='what');
vm.runInContext('renderDependencyHeadProbe(x)',context);
assert.equal(mounted,1,'WHAT displays its own declared diagnostic');
assert.equal(hidden,0);
question=shopping.thinkingMind.find(q=>q.questionWord==='which');
vm.runInContext('renderDependencyHeadProbe(x)',context);
assert.equal(mounted,2,'WHICH retains its head diagnostic');
const html=fs.readFileSync('verb-explorer.html','utf8');
assert.ok(html.indexOf('🌐 LANGUAGE')<html.indexOf('🧠 THINKING MIND'));
console.log('PASS — anonymous QWord dependency switching, independent EN/ES/PT, no unrelated fallback, WHICH preserved, language-first order.');
