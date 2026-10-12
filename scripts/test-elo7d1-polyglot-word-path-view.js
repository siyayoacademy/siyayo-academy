#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync('js/verb-explorer-polyglot-word-path-view.js','utf8');
const scopeOf=(skill,language,origin='shopping-for-dinner',nick='ONE-NICK')=>Object.freeze({learnerId:nick,skill,language,originExperienceId:origin,key:JSON.stringify([nick,skill,language,origin])});
const wrap=(scope,completed,total=3)=>Object.freeze({scopeKey:scope.key,language:scope.language,originExperienceId:scope.originExperienceId,progress:{completed,total}});
const what='what.use.object-question',which='which.use.determiner';
const en=scopeOf(what,'en'),es=scopeOf(what,'es'),pt=scopeOf(what,'pt');
const retained=new Map([[what+'|en',[wrap(en,2)]],[what+'|es',[wrap(es,2)]],[what+'|pt',[wrap(pt,2)]]]);
const calls=[];
const root={Object,Array,Map,Set,JSON,Number,
 SIYAYOVerbExplorerPolyglotWordPathView:null};
root.globalThis=root;vm.runInNewContext(code,root,{filename:'js/verb-explorer-polyglot-word-path-view.js'});
const renderer=root.SIYAYOVerbExplorerPolyglotWordPathView;
const input={language:'pt',profile:{id:'ONE-NICK'},identity:{getId:()=> 'ONE-NICK'},
 selection:{getRetainedProgress(skill,l){calls.push([skill,l]);return retained.get(skill+'|'+l)||[];}},
 trailView:{project(profile,skill,filter){assert.equal(profile.id,'ONE-NICK');return {skill,language:filter.language};}},
 markerAuthority:{resolve(){return {state:'UNOBSERVED',marker:'EMPTY_DOT'};}},
 snapshot:{session:{decision:{skill:what,assessmentScope:pt}},context:{assessmentScope:pt,passContract:{requires:[{}, {}, {}]},evidencePackets:[]}},
 progressView:{project(){return {completed:2,total:3,satisfied:[true,true,false]};}},evaluator:{},
 scopeApi:{valid:s=>s&&s.key===JSON.stringify([s.learnerId,s.skill,s.language,s.originExperienceId]),same:(a,b)=>a.key===b.key},
 catalog:{getExperience(id){return id==='shopping-for-dinner'?{title:{en:'Shopping for a Nice Dinner',es:'Compras para una linda cena',pt:'Compras para um belo jantar'}}:null;}}
};
let checked=0;
function check(pred,message){assert.ok(pred,message);checked++;}
let html=renderer.render(input);
check((html.match(/<tr>/g)||[]).length===5,'4 QW rows plus header');
check((html.match(/data-skill="what.use.object-question"/g)||[]).length===3,'three distinct WHAT cells');
for(const lang of ['en','es','pt']){check(new RegExp('data-skill="what.use.object-question" data-language="'+lang+'"[^>]*>[\\s\\S]*?<strong class="wp-poly-value">2/3').test(html),lang+' 2/3 visible');}
check((html.match(/>2\/3</g)||[]).length===3,'no double counting an active and retained scope');
check((html.match(/>—</g)||[]).length===9,'no fictitious 0/3 for nine unevaluated skill/languages');
check(!html.includes('salmon')&&!html.includes('salmão'),'no invented detailed answer evidence');
check(html.includes('Compras para um belo jantar'),'localized origin');
check(calls.length===12,'all four QWs scanned in all three languages');
check(!html.includes('WHO</strong>'),'no fabricated 14-QW assessments');
const savedOriginal=retained.get(what+'|en');
retained.set(what+'|en',[wrap(en,2),wrap(scopeOf(what,'en','preparing-dinner'),1)]);
html=renderer.render(input);check(/2\s*<\/strong><span class="wp-poly-status">circuitos/.test(html),'parallel origins not merged into a false count');
check(html.includes('2/3')&&html.includes('1/3'),'both origin progress values remain distinct');
retained.set(what+'|en',savedOriginal);
html=renderer.render({...input,profile:{id:'OTHER-NICK'}});check(html==='','never show another nickname’s history');
html=renderer.render({...input,identity:{getId:()=>null}});check(html==='','anonymous must not receive identified summary');
retained.set(which+'|en',[wrap(scopeOf(which,'en','shopping-for-dinner','OTHER-NICK'),3)]);
html=renderer.render(input);check(!html.includes('3/3'),'discard retained scope belonging to a different learner');
retained.delete(which+'|en');
html=renderer.render({...input,markerAuthority:{resolve(trail){return {state:trail.skill===which&&trail.language==='es'?'CONFIRMED':'UNOBSERVED',marker:'FILLED_DOT'};}}});
check(/data-skill="which.use.determiner" data-language="es" data-state="confirmed"/.test(html),'confirmed history without fake numeric score');
check(!html.includes('3/3'),'confirmed record does not invent a current 3/3');
const untrusted='<img src=x onerror=alert(1)>';
retained.set(what+'|en',[wrap(scopeOf(what,'en',untrusted),1)]);
html=renderer.render(input);check(!html.includes('<img')&&html.includes('&lt;img'),'escape untrusted origin fallback');
retained.delete(what+'|en');
check(!Object.keys(root).some(k=>/Evidence|GreenPass|submit|adopt/.test(k)),'renderer does not create write authorities');
console.log('PASS ELO 7D.1 — '+checked+' assertions: isolated QW × EN/ES/PT history, nickname, origin, retained + active dedup, localization, no invented credit and no writes.');
