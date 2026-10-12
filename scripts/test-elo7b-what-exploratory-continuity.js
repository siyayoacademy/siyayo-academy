#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync(__dirname+'/../js/verb-explorer-what-assessment-live.js','utf8');

function el(tag='div'){
  const e={tag,children:[],hidden:false,dataset:{},handlers:{},attrs:{},className:'',textContent:'',_html:'',
    set innerHTML(v){this._html=v;this.children=[];},get innerHTML(){return this._html;},
    appendChild(c){this.children.push(c);return c;},insertBefore(c){this.children.push(c);return c;},
    querySelector(){return null;},setAttribute(k,v){this.attrs[k]=String(v);},
    addEventListener(k,fn){this.handlers[k]=fn;},click(){if(this.handlers.click)this.handlers.click({target:this});}
  };return e;
}
const S1={id:'shopping-for-dinner',toroidalNext:{nextExperience:'preparing-dinner'},thinkingMind:[{questionWord:'what',assessmentTarget:{skill:'what.use.object-question'},question:{en:'What shall we cook?',es:'¿Qué vamos a cocinar?',pt:'O que vamos cozinhar?'}}]};
const S2={id:'preparing-dinner',toroidalNext:{nextExperience:'having-dinner'},thinkingMind:[{questionWord:'what',assessmentTarget:{skill:'what.use.object-question'},question:{en:'What are we preparing?',es:'¿Qué estamos preparando?',pt:'O que estamos preparando?'}}]};
const S3={id:'having-dinner',toroidalNext:{nextExperience:'after-dinner-conversation'},thinkingMind:[{questionWord:'what',question:{en:'What are we eating?',es:'¿Qué comemos?',pt:'O que comemos?'}}]};
const S4={id:'after-dinner-conversation',toroidalNext:{nextExperience:'shopping-for-dinner'},thinkingMind:[{questionWord:'what',question:{en:'What shall we discuss?',es:'¿De qué hablamos?',pt:'Sobre o que conversamos?'}}]};
const experiences=[S1,S2,S3,S4];
const definition={id:'what.use.object-question',passContract:{requires:[{dimension:'question-function'},{dimension:'object-answer',mode:'local'},{dimension:'object-answer',mode:'transfer'}]}};
function make(options={}){
  const ids={},view=el('div');view.id='experienceView';ids.experienceView=view;
  const doc={getElementById(id){return ids[id]||null;},createElement(tag){const n=el(tag);Object.defineProperty(n,'id',{set(id){this._id=id;ids[id]=this;},get(){return this._id;}});return n;}};
  let language=options.language||'en',experience=options.experience||S1,word='what',active=options.active||null;
  let evidence=0,attempts=0,submitted=0,projected=0,feedbackRefresh=0,fetches=0;
  let resolveFetch=()=>{};
  const calls=[];
  const root={document:doc,Promise,Object,Array,Set,
    SIYAYOVerbExplorerExperienceRuntime:{activeQuestionWord:()=>word,activeLanguage:()=>language,activeExperienceId:()=>experience.id,refreshAssessmentHighlight(){feedbackRefresh++;}},
    SIYAYOVerbExplorerAdaptiveStateBridge:{getState:()=>({currentExperienceId:experience.id,experienceLanguage:language})},
    SIYAYOVerbExplorerAdaptiveCoordinator:{snapshot:()=>active,submitObservedAttempt(){submitted++;return {cycleResult:{contractEvaluation:{status:'IN_PROGRESS',satisfied:false}}};}},
    SIYAYOVerbExplorerExperienceNavigation:{getExperience:id=>experiences.find(x=>x.id===id),getExperiences:()=>experiences.slice(),getNouns:()=>({items:[]})},
    SIYAYOVerbExplorerCanonicalSkillSource:{getDefinition:()=>active?.definition||null},
    AdaptiveWhatObjectQuestionProbeSpecificationSource:{resolve(skill,origin,next,nouns,lang){
      assert.equal(skill.id,definition.id);assert.equal(next.id,origin.toroidalNext.nextExperience);calls.push({from:origin.id,to:next.id,lang});
      function build(dimension,mode,where){return {skill:definition.id,dimension,mode,language:lang,experienceId:where,fromExperienceId:mode==='transfer'?origin.id:null,
        question:origin.thinkingMind[0].question[lang],expectedAlternativeIds:['yes'],alternatives:[{id:'yes',label:'good'},{id:'no',label:'wrong'},{id:'maybe',label:'third'}]};}
      return {functionProbe:build('question-function','local',origin.id),localProbe:build('object-answer','local',origin.id),transferProbe:build('object-answer','transfer',next.id)};
    }},
    AdaptiveWhatObjectQuestionProbeResult:{evaluate(spec,event){return {result:event.choice==='yes'?'pass':'fail'};}},
    AdaptiveWhatObjectQuestionProbeEvidenceBridge:{fromResult(){evidence++;return {result:'pass'};}},
    AdaptiveWhatObjectQuestionProbeAttemptBoundary:{assemble(){attempts++;return {skill:definition.id};}},
    SIYAYOVerbExplorerLearnerEvent:{fromWhatObjectQuestionProbeSelect(choice,context){return {choice,occurrenceId:choice+context.language,observed:true,actor:'learner',...context};}},
    AdaptivePassContractProgressView:{project(){projected++;return {status:'IN_PROGRESS'};}},
    SIYAYOVerbExplorerLearnerTrailSurface:{refresh(){feedbackRefresh++;}},
    fetch(){fetches++;return options.deferred?new Promise(resolve=>{resolveFetch=resolve;}):Promise.resolve({ok:true,json:()=>Promise.resolve(definition)});}
  };
  root.globalThis=root;
  vm.runInNewContext(code,root,{filename:'verb-explorer-what-assessment-live.js'});
  const live=root.SIYAYOVerbExplorerWhatAssessmentLive;
  const flush=async()=>{for(let i=0;i<25;i++)await Promise.resolve();};
  const mount=(x=experience,l=language)=>live.mount({document:doc,experience:x,language:l});
  function getOptions(){const panel=ids.whatAssessmentPanel;return panel.children.filter(v=>v.className==='what-object-question-probe').at(-1)?.children.find(v=>v.className?.includes('what-probe-options'))?.children||[];}
  return {live,root,ids,mount,flush,getOptions,calls,definition,
    move(x,l){experience=x;language=l;},setActive(v){active=v;},setWord(v){word=v;},resolveFetch(v){resolveFetch(v);},
    counts(){return {evidence,attempts,submitted,projected,feedbackRefresh,fetches};}};
}
function owned(lang='en',origin=S1){return {definition,session:{decision:{skill:definition.id,experienceId:origin.id,assessmentScope:{language:lang,key:'nick|'+lang+'|'+origin.id}}},context:{passContract:definition.passContract,evidencePackets:[]}};}
async function run(){
  let cases=0;
  for(const lang of ['en','es','pt']){
    const t=make({language:lang});
    assert.equal(t.mount(),true);
    assert.equal(t.ids.whatAssessmentPanel.hidden,false);
    assert.equal(t.ids.whatAssessmentPanel.dataset.assessmentState,'exploratory');
    await t.flush();
    assert.equal(t.ids.whatAssessmentPanel.dataset.assessmentState,'exploratory');
    assert.equal(t.getOptions().length,3);
    t.getOptions()[0].click();t.getOptions()[1].click();
    assert.match(t.ids.whatAssessmentPanel.children.at(-1).textContent,/free practice|práctica libre|prática livre/);
    assert.deepEqual(t.counts().evidence,0);assert.deepEqual(t.counts().attempts,0);assert.deepEqual(t.counts().submitted,0);
    assert.equal(t.calls.length,1);cases++;
  }
  {
    const t=make({language:'es',active:owned('en')});
    assert.equal(t.mount(),true);await t.flush();
    assert.equal(t.ids.whatAssessmentPanel.dataset.assessmentState,'exploratory');
    t.getOptions()[0].click();assert.equal(t.counts().submitted,0);
    assert.equal(t.counts().projected,0,'foreign-language EN assessment is not projected into ES practice');cases++;
    t.move(S3,'es');assert.equal(t.mount(),true);await t.flush();
    assert.equal(t.calls.at(-1).from,S2.id);assert.equal(t.calls.at(-1).to,S3.id);
    assert.equal(t.getOptions().length,3);
    t.getOptions()[0].click();assert.equal(t.counts().submitted,0);cases++;
    t.move(S4,'es');assert.equal(t.mount(),false,'unsupported After-Dinner WHAT has no invented local assessment');cases++;
  }
  {
    const t=make({language:'pt',active:owned('pt')});
    assert.equal(t.mount(),true);assert.equal(t.ids.whatAssessmentPanel.dataset.assessmentState,'authorized');
    assert.equal(t.counts().fetches,0);
    t.getOptions()[0].click();assert.equal(t.counts().evidence,1);assert.equal(t.counts().attempts,1);assert.equal(t.counts().submitted,1);cases++;
  }
  {
    const t=make({deferred:true,language:'en'});
    assert.equal(t.mount(),true);await t.flush();
    t.move(S1,'es');assert.equal(t.mount(),true);await t.flush();
    assert.equal(t.counts().fetches,1,'read-only definition fetch is deduplicated');
    t.resolveFetch({ok:true,json:()=>Promise.resolve(definition)});await t.flush();
    assert.equal(t.ids.whatAssessmentPanel.dataset.assessmentState,'exploratory');
    assert.equal(t.calls.length,1);assert.equal(t.calls[0].lang,'es');cases++;
  }
  {
    const t=make({language:'en'});
    t.mount();await t.flush();
    const options=t.getOptions();
    t.move(S2,'en');t.mount();await t.flush();
    options[0].click();assert.equal(t.counts().evidence,0);assert.equal(t.counts().submitted,0);cases++;
  }
  console.log(`PASS: ${cases} ELO7B scenarios · EN/ES/PT free WHAT, identified foreign language, S3 free transfer, no invented S4, authorized original, async race, stale clicks; no exploratory Evidence/Attempt/Green.`);
}
run().catch(e=>{console.error(e);process.exitCode=1;});
