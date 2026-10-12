#!/usr/bin/env node
'use strict';
// ELO 7C.1: LANGUAGE changes select canonical scoped circuits without credit transfer.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('js/verb-explorer-polyglot-language-continuity.js','utf8');
const experiences=[
 {id:'shopping-for-dinner',thinkingMind:[{questionWord:'what',assessmentTarget:{skill:'what.use.object-question',definitionPath:'data/learning/skills/what.json'}},{questionWord:'who'}]},
 {id:'preparing-dinner',thinkingMind:[{questionWord:'which',assessmentResumeTarget:{skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'}}]}
];
function setup(){
 let lang='es',nick='Polyglot',word='what',experience='shopping-for-dinner',calls=0,renders=0,created=0,active=null,pending=null,delayNext=false;
 const registry=new Map(),capture=[],bubble=[];
 const root={Object,Promise,document:{addEventListener(type,fn,useCapture){assert.equal(type,'click');(useCapture?capture:bubble).push(fn);}},
  SIYAYOVerbExplorerLearnerIdentitySource:{getId:()=>nick},
  SIYAYOVerbExplorerExperienceRuntime:{activeLanguage:()=>lang,activeQuestionWord:()=>word,activeExperienceId:()=>experience,render(){renders++;}},
  SIYAYOVerbExplorerExperienceNavigation:{getExperience:id=>experiences.find(x=>x.id===id)},
  SIYAYOQuestionWordAssessmentContract:{targetForSelection:q=>q.assessmentTarget||q.assessmentResumeTarget&&{...q.assessmentResumeTarget,resumeOnly:true}||null},
  SIYAYOVerbExplorerThinkingMindAssessmentSelection:{select(q){
   calls++;const target=q.assessmentTarget||q.assessmentResumeTarget,key=JSON.stringify([nick,target.skill,lang,'shopping-for-dinner']);
   if(!registry.has(key)&&!q.assessmentTarget)return Promise.resolve(false);
   if(!registry.has(key)){registry.set(key,{progress:0});created++;}
   active=registry.get(key);
   if(delayNext){delayNext=false;return new Promise(resolve=>pending=resolve);}
   return Promise.resolve(true);
  }}
 };
 root.globalThis=root;vm.createContext(root);vm.runInContext(source,root);
 return {
  click(next){const button={dataset:{experienceLanguage:next}},event={target:{closest:()=>button}};capture.forEach(fn=>fn(event));lang=next;bubble.forEach(fn=>fn(event));},
  async tick(){for(let i=0;i<15;i++)await Promise.resolve();},
  changeWord:v=>word=v,changeNick:v=>nick=v,changeExperience:v=>experience=v,
  wait(){delayNext=true;},resolve(){const fn=pending;pending=null;fn(true);},
  calls:()=>calls,created:()=>created,active:()=>active,renders:()=>renders,installed:()=>root.SIYAYOVerbExplorerPolyglotLanguageContinuity.isInstalled
 };
}
(async()=>{
 let checked=0;const t=setup();
 t.click('en');await t.tick();assert.equal(t.calls(),1);t.active().progress=2;const en=t.active();checked++;
 t.click('pt');await t.tick();t.active().progress=1;const pt=t.active();assert.notEqual(pt,en);checked++;
 t.click('es');await t.tick();const es=t.active();assert.notEqual(es,pt);checked++;
 t.click('en');await t.tick();assert.equal(t.active(),en);assert.equal(t.active().progress,2);checked++;
 t.click('pt');await t.tick();assert.equal(t.active(),pt);checked++;
 assert.equal(t.created(),3);checked++;
 const before=t.calls();t.click('pt');await t.tick();assert.equal(t.calls(),before);checked++;
 const anonymous=setup();anonymous.changeNick(null);anonymous.click('en');await anonymous.tick();assert.equal(anonymous.calls(),0);checked++;
 const free=setup();free.changeWord('who');free.click('en');await free.tick();assert.equal(free.calls(),0);checked++;
 const resumed=setup();resumed.changeWord('which');resumed.changeExperience('preparing-dinner');resumed.click('en');await resumed.tick();assert.equal(resumed.created(),0);checked++;
 const race=setup();race.wait();race.click('en');await race.tick();race.click('pt');await race.tick();let count=race.renders();race.resolve();await race.tick();assert.equal(race.renders(),count);checked++;
 for(const axis of ['word','nick','experience']){
   const x=setup();x.wait();x.click('en');await x.tick();
   if(axis==='word')x.changeWord('who');if(axis==='nick')x.changeNick('Else');if(axis==='experience')x.changeExperience('preparing-dinner');
   count=x.renders();x.resolve();await x.tick();assert.equal(x.renders(),count);checked++;
 }
 assert.equal(t.installed(),true);
 console.log('PASS ELO 7C.1 — '+checked+' scenarios; independent EN/ES/PT, free/resume-only guards and stale UI protections.');
})().catch(error=>{console.error(error);process.exitCode=1;});
