#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('js/verb-explorer-dependency-focus-surface.js','utf8');
const css=fs.readFileSync('css/verb-explorer.css','utf8');
let checks=0;
const verify=(predicate,message)=>{assert.ok(predicate,message);checks++};
for(const [lang,label,sentence] of [
 ['en','Canonical reference example:','Which cheese should we choose?'],
 ['es','Ejemplo canónico de referencia:','¿Cuál queso deberíamos elegir?'],
 ['pt','Exemplo canônico de referência:','Qual queijo deveríamos escolher?']
]){
 const node={hidden:true,innerHTML:'',dataset:{},querySelector(){return null}};
 const word={id:'cheese',form:'queso',wordClass:'NOUN',pedagogy:{wordType:{en:'NOUN',es:'SUSTANTIVO',pt:'SUBSTANTIVO'}}};
 const structure={id:'fixture',sentence,tokens:[word],relations:[]};
 const sandbox={Object,document:{getElementById:id=>id==='dependencyFocusSurface'?node:null},
 AdaptiveDependencyFocusView:{resolve:(s,id)=>id==='cheese'?{status:'DEPENDENCY_FOCUS_READY',focus:word,head:null,dependents:[],relations:[]}:null},
 AdaptiveDependencyConnectorView:{draw:()=>true}};
 sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(source,sandbox);
 verify(sandbox.SIYAYOVerbExplorerDependencyFocusSurface.render({language:lang,structure,focusId:'cheese'})===true,'render '+lang);
 verify(node.innerHTML.includes('<span class="dependency-focus-reference-label">'+label+'</span>'),'label '+lang);
 verify(node.innerHTML.includes('<span class="dependency-focus-reference-sentence">'+sentence+'</span>'),'sentence '+lang);
 verify(node.innerHTML.indexOf(label)<node.innerHTML.indexOf(sentence),'label precedes sentence '+lang);
 verify(node.dataset.language===lang,'language '+lang);
 verify(node.innerHTML.includes('data-token-id="cheese"'),'token unchanged '+lang);
 verify(!/<button|green.pass|mastery|score|onclick/i.test(node.innerHTML),'no assessment mutation '+lang);
}
const marker='/* JAGUAR ELO 7D.3.1';
verify(css.split(marker).length===2,'single css presentation block');
const rule=css.slice(css.indexOf(marker));
verify((rule.match(/@container\s+siyayo-explorer/g)||[]).length===1,'one scoped portrait query');
verify((rule.match(/\{/g)||[]).length===(rule.match(/\}/g)||[]).length,'braces balanced');
verify(rule.includes('max-width:480px'),'portrait only');
verify(rule.includes(':has(> button:nth-child(3):last-child)'),'exactly three options');
verify(rule.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),'three columns');
verify(rule.includes('min-height:44px'),'touch height');
verify(!/word-path|mastery|assessmentState|submitObservedAttempt/i.test(rule),'presentation only');
console.log('PASS ELO 7D.3.1: '+checks+' directed tests, EN/ES/PT and scoped Portrait CSS');
