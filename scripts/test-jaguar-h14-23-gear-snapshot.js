#!/usr/bin/env node
'use strict';const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const adapter=require('../js/verb-explorer-h14-23-gear-snapshot-adapter.js');
const original=fs.readFileSync('js/verb-explorer.js','utf8'),html=fs.readFileSync('verb-explorer.html','utf8');
for(const id of ['experienceLanguageGear','experienceTenseGear','experienceModeGear','perspectiveGear','wordTypeGear'])assert.ok(html.includes('id="'+id+'"'));
const refs={experienceId:'shopping-for-dinner',lang:'en',qw:'what'};
const buttons=(attribute,chosen,disabled=false)=>['en','es','pt'].map(x=>({classList:{contains:c=>c==='active'&&x===chosen},getAttribute:k=>k===attribute?x:null,disabled}));
function gear(attr,options,selected,lock=false){return{querySelectorAll:selector=>options.filter(x=>!selector.includes('.active')||x===selected).map(x=>({classList:{contains:c=>c==='active'&&x===selected},getAttribute:k=>k===attr?x:null,dataset:{perspective:x},disabled:lock}))};}
const nodes={
 experienceLanguageGear:gear('data-experience-language',['en','es','pt'],'en'),
 experienceTenseGear:gear('data-experience-tense',['present','past','future'],'present'),
 experienceModeGear:gear('data-experience-form',['affirmative','negative','interrogative'],'affirmative'),
 wordTypeGear:gear('data-word-type',['verb','noun','adjective'],'verb'),
 perspectiveGear:gear('data-perspective',['describing','narrating','debating','concluding'],'describing')
};
const doc={getElementById:id=>nodes[id]||null};
const runtime={activeExperienceId:()=>refs.experienceId,activeLanguage:()=>refs.lang,activeQuestionWord:()=>refs.qw};
const nav={getExperience:id=>({id,thinkingMind:[{questionWord:'what'},{questionWord:'where'}]})};
const snap=()=>adapter.read({document:doc,runtime,navigation:nav});
let a=snap();assert.ok(a);assert.equal(a.experienceId,refs.experienceId);assert.equal(a.perspective,'describing');assert.equal(a.period,null);assert.equal(a.assessmentAuthority,false);assert.equal(a.grammarLocked,false);
nodes.experienceModeGear=gear('data-experience-form',['affirmative','negative','interrogative'],'negative');
assert.equal(snap().mode,'negative');
nodes.experienceTenseGear=gear('data-experience-tense',['present','past','future'],'past',true);
assert.equal(snap().grammarLocked,true);
refs.lang='pt';assert.equal(snap(),null,'runtime/DOM must agree');
nodes.experienceLanguageGear=gear('data-experience-language',['en','es','pt'],'pt');
assert.equal(snap().language,'pt');
nodes.perspectiveGear=gear('data-perspective',['describing','narrating','debating','concluding'],null);
assert.equal(snap().perspective,null);
refs.qw='how-far';assert.equal(snap(),null,'reject unknown Experience QW');
refs.qw='where';assert.equal(snap().questionWord,'where');
const source=fs.readFileSync('js/verb-explorer-h14-23-gear-snapshot-adapter.js','utf8');
for(const bad of ['localStorage','sessionStorage','recordOutcome(','createEvidence(','click()','dispatchEvent(','innerHTML='])assert.equal(source.includes(bad),false,bad);
new vm.Script(source);
console.log('PASS H14.23 read-only real Gear Stack adapter; DOM/runtime coherence, QW, locks, null PERIOD, no evidence');
