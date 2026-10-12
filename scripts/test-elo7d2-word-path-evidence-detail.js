#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const what='what.use.object-question',nick='POLYGLOT',origin='shopping-for-dinner';
const scope=(lang,owner=nick)=>Object.freeze({learnerId:owner,skill:what,language:lang,originExperienceId:origin,key:JSON.stringify([owner,what,lang,origin])});
const scopeApi={valid:s=>!!s&&s.key===JSON.stringify([s.learnerId,s.skill,s.language,s.originExperienceId])&&['en','es','pt'].includes(s.language),same:(a,b)=>!!a&&!!b&&a.key===b.key,ownsPacket:(s,p)=>!!p&&p.skill===s.skill&&!!p.context&&p.context.language===s.language&&scopeApi.same(s,p.context.assessmentScope)};
const evaluator={evidenceMatchesRequirement:(p,r)=>Object.entries(r).every(([key,val])=>p[key]===val),evaluateContract:(c,packets)=>({requirements:c.requires.map(r=>({satisfied:packets.some(p=>evaluator.evidenceMatchesRequirement(p,r))}))})};
const progressView={project(c,p,e){let arr=e.evaluateContract(c,p).requirements.map(r=>r.satisfied);return {satisfied:arr,completed:arr.filter(Boolean).length,total:arr.length};}};
const contract={requires:[{dimension:'question-function',result:'pass'},{dimension:'object-answer',result:'pass',support:'none',mode:'local'},{dimension:'object-answer',result:'pass',mode:'transfer',support:'none'}]};
const packet=(s,id,dimension='object-answer',mode='local',result='pass')=>({skill:what,dimension,mode,result,support:'none',context:{assessmentScope:s,language:s.language,experienceId:origin,selectedAlternativeId:id}});
const contexts={};for(const lang of ['en','es','pt']){const s=scope(lang);contexts[lang]={assessmentScope:s,passContract:contract,evidencePackets:[packet(s,'what','question-function'),packet(s,'salmon')]};}
let learner=nick;const stored={};for(const lang of ['en','es']){const s=scope(lang);stored[s.key]={snapshot:{session:{decision:{assessmentScope:s,skill:what}},context:contexts[lang]}};}
const sandbox={Object,Array,Map,Set,Number,JSON,Promise,SIYAYOVerbExplorerLearnerIdentitySource:{getId:()=>learner},AdaptiveAssessmentScope:scopeApi,AdaptivePassContractProgressView:progressView,GreenPassProfile:evaluator};
sandbox.globalThis=sandbox;
// The published view embeds the witness projector; do not depend on local-only files.
vm.runInNewContext(read('js/verb-explorer-polyglot-word-path-view.js'),sandbox);
const Detail=sandbox.SIYAYOVerbExplorerWordPathWitnessView;
// Test the real selection module and its read-only public getter.
vm.runInNewContext(read('js/verb-explorer-thinking-mind-assessment-selection.js'),sandbox);
const selection=sandbox.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
for(const entry of Object.values(stored)){
 assert.equal(selection.remember(entry.snapshot,{id:what}),true,'real selection retains the owned Session');
}
const getRetainedEvidence=(skill,language)=>selection.getRetainedEvidence(skill,language);
const catalog={getExperience(id){return id===origin?{title:{en:'Shopping for a Nice Dinner',es:'Compras para una linda cena',pt:'Compras para um belo jantar'},links:{vocabulary:['salmon']},thinkingMind:[{questionWord:'what',questionWordLabel:{en:'what',es:'qué',pt:'o que'},answerGrounding:{canonicalResponses:[{id:'salmon',response:{en:'We will cook salmon.',es:'Vamos a cocinar salmón.',pt:'Vamos cozinhar salmão.'}}]}}]}:null;},getNouns(){return {items:[{id:'salmon',translations:{en:'salmon',es:'salmón',pt:'salmão'}}]};}};
const input={language:'pt',profile:{id:nick},identity:{getId:()=>learner},selection,snapshot:{session:{decision:{assessmentScope:scope('pt')}},context:contexts.pt},catalog,evaluator,progressView,scopeApi};
let checked=0;function check(v,m){assert.ok(v,m);checked++;}
for(const lang of ['en','es','pt']){
 const p=Detail.project({scope:scope(lang),context:contexts[lang],scopeApi,evaluator,progressView});
 check(p.completed===2&&p.total===3,`${lang} confirmed count`);
 check(p.items[0].selectedAlternativeId==='what'&&p.items[1].selectedAlternativeId==='salmon',`${lang} witnessed choices`);
 check(p.items[2].accepted===false&&p.items[2].selectedAlternativeId==='',`${lang} pending transfer`);
 check(Object.isFrozen(p)&&Object.isFrozen(p.items)&&Object.isFrozen(p.items[0]),`${lang} immutable projection`);
}
check(getRetainedEvidence(what,'en').length===1,'EN saved record available');
check(getRetainedEvidence(what,'es').length===1,'ES saved record available');
check(getRetainedEvidence(what,'pt').length===0,'live PT is not falsely saved');
check(Object.isFrozen(getRetainedEvidence(what,'en')),'retained list immutable');
let view=Detail.render(input);
check((view.match(/class="wp-evidence-card"/g)||[]).length===3,'three languages represented');
check((view.match(/wp-evidence-answer/g)||[]).length===6,'two accepted witnesses per language');
check(view.includes('salmão')&&view.includes('Vamos cozinhar salmão.'),'PT answer grounded in noun + canonical sentence');
check(view.includes('salmón')&&view.includes('salmon'),'own-language words rendered');
check(!view.includes('POLYGLOT')&&!view.includes('data-scope'),'no nickname or scope key embedded in evidence DOM');
check(view.includes('TRANSFERÊNCIA')&&view.includes('Ainda não aceita'),'transfer not invented');
check(!view.includes('GREEN PASS'),'no visual Green Pass forged');
const raw=read('js/verb-explorer-polyglot-word-path-view.js');
const fakeRoot={Object,Array,Map,Set,JSON,Number,SIYAYOVerbExplorerWordPathWitnessView:Detail};fakeRoot.globalThis=fakeRoot;vm.runInNewContext(raw,fakeRoot);
const matrixInput={...input,trailView:{project(_p,skill,f){return {skill,language:f.language};}},markerAuthority:{resolve(){return {state:'UNOBSERVED',marker:'EMPTY_DOT'};}}};
matrixInput.selection={...selection,getRetainedProgress(skill,language){return skill===what&&contexts[language]?[{scopeKey:scope(language).key,language,originExperienceId:origin,progress:{completed:2,total:3}}]:[];}};
view=fakeRoot.SIYAYOVerbExplorerPolyglotWordPathView.render(matrixInput);
check((view.match(/data-skill="what.use.object-question"/g)||[]).length===3,'7D.1 matrix retained');
check(view.includes('wp-evidence-detail')&&view.includes('wp-poly-table'),'7D.2 appended to 7D.1');
const forged={...contexts.pt,evidencePackets:[packet(scope('en'),'salmon'),packet(scope('en'),'what','question-function')]};
const suspect=Detail.project({scope:scope('pt'),context:forged,scopeApi,evaluator,progressView});
check(suspect.items.every(v=>v.accepted===false),'foreign-language evidence cannot be laundered');
const failed={...contexts.pt,evidencePackets:[packet(scope('pt'),'salmon','object-answer','local','fail')]};
check(Detail.project({scope:scope('pt'),context:failed,scopeApi,evaluator,progressView}).completed===0,'wrong answer not accepted');
check(Detail.project({scope:scope('es'),context:contexts.pt,scopeApi,evaluator,progressView})===null,'foreign-scope context rejected');
learner='OTHER';check(getRetainedEvidence(what,'es').length===0,'retained blocked for foreign NICK');check(Detail.render(input)==='','render blocked for foreign NICK');learner=nick;
const xss='<img src=x onerror=alert(1)>';
const badScope=scope('pt'),badContext={...contexts.pt,evidencePackets:[packet(badScope,xss,'question-function'),packet(badScope,xss)]};
view=Detail.render({...input,snapshot:{session:{decision:{assessmentScope:badScope}},context:badContext}});
check(!view.includes('<img')&&view.includes('&lt;img'),'untrusted choice identifier escaped');
check(!Object.keys(sandbox).some(k=>/submitObservedAttempt|grantGreen|adoptSession/i.test(k)),'projection does not install assessment writes');
console.log('PASS ELO 7D.2 — '+checked+' checks: real scope witnesses, three languages, read-only rendering, current/saved isolation, missing transfer, XSS/foreign learner guards.');
