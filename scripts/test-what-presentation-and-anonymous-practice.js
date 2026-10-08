const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const seeds=require('../data/learning/experience-seeds.json').items;
const Source=require('../js/adaptive-what-object-question-probe-specification-source');
const Result=require('../js/adaptive-what-object-question-probe-result');
const skill=require('../data/learning/skills/what.json'),nouns=require('../data/lexicon/nouns/nouns.json');
// Preparing is transfer for S1 and local for S2; distractors differ by contract mode.
for(const language of ['en','es','pt']){
 for(const origin of [0,1]){
  const specs=Source.resolve(skill,seeds[origin],seeds[origin+1],nouns,language);assert.ok(specs);
  const spec=origin===0?specs.transferProbe:specs.localProbe;
  for(const a of spec.alternatives){
   assert.ok(a.response,'complete Preparing response '+a.id+' '+language);
   const event={observed:true,actor:'learner',relevantToWait:true,intent:'answer',type:'learner-response',source:'what-object-question-probe-select',occurrenceId:'preparing:'+origin+language+a.id,skill:skill.id,dimension:spec.dimension,mode:spec.mode,language,choice:a.id,fromExperienceId:spec.fromExperienceId,experienceId:spec.experienceId};
   const result=Result.evaluate(spec,event);assert.ok(result);
   assert.equal(result.result,spec.expectedAlternativeIds.includes(a.id)?'pass':'fail');
   assert.equal(result.greenPass,undefined);
  }
 }
 const broken=JSON.parse(JSON.stringify(seeds[1]));broken.thinkingMind.find(q=>q.questionWord==='what').answerGrounding.canonicalResponses.find(a=>a.id==='tomatoes').response[language]='';
 assert.equal(Source.resolve(skill,seeds[0],broken,nouns,language),null);
 assert.equal(Source.resolve(skill,broken,seeds[2],nouns,language),null);
}
// Execute production LINES functions, including Tense/Mode and actual invitation action.
const runtime=fs.readFileSync('js/verb-explorer.js','utf8');
const linesSource=runtime.slice(runtime.indexOf('function whatCanonicalPracticeLine'),runtime.indexOf('function choicePrompt'));
for(const language of ['en','es','pt']){
 let scrolls=0,focuses=0;
 const panel={hidden:false,dataset:{canonicalQuestion:'canonical reference'},scrollIntoView(){scrolls++;},querySelector(){return {focus(){focuses++;}};}};
 const ctx={experienceLanguage:language,experienceWordType:'verb',experiencePerspective:null,experienceTense:'present',experienceForm:'affirmative',document:{getElementById(){return panel;}},activeThinkingQuestion(x){return x.thinkingMind.find(q=>q.questionWord==='what');}};
 vm.createContext(ctx);vm.runInContext(linesSource,ctx);
 for(const tense of ['present','past','future'])for(const mode of ['affirmative','negative','interrogative']){
  ctx.experienceTense=tense;ctx.experienceForm=mode;
  const lines=ctx.experienceLines(seeds[0]);const turn=seeds[0].thinkingMind.find(q=>q.questionWord==='what').dialogueForms[tense][mode];
  assert.equal(lines[0].text,turn.question[language]);assert.equal(lines[1].text,turn.response[language]);assert.equal(lines[2].action,'what-practice');
 }
 const s2=ctx.experienceLines(seeds[1]);assert.equal(s2[1].text,seeds[1].thinkingMind.find(q=>q.questionWord==='what').answerGrounding.context[language]);assert.equal(s2[2].action,'what-practice');
 assert.equal(ctx.openWhatCanonicalPractice(),true);assert.equal(scrolls,0);assert.equal(focuses,1);
 panel.hidden=true;assert.equal(ctx.openWhatCanonicalPractice(),false);assert.equal(ctx.experienceLines(seeds[1]).length,2);
 assert.equal(ctx.whatCanonicalPracticeLine({questionWord:'which'}).length,0);
}
// Real canonical definition/result/wire, but anonymous observations cannot enter adaptive authorities.
const Definition=require('../js/adaptive-dependency-head-probe-definition'),Presenter=require('../js/adaptive-dependency-head-probe-presenter'),HeadResult=require('../js/adaptive-dependency-head-probe-result'),Wire=require('../js/adaptive-dependency-head-probe-browser-wire');
const eventContext={};vm.createContext(eventContext);vm.runInContext(fs.readFileSync('js/verb-explorer-learner-event.js','utf8'),eventContext);
for(const language of ['en','es','pt'])for(const word of ['what','which']){
 let learnerId=null,currentWord=word,currentLanguage=language,session=null,adaptiveCalls=0;
 const panel={hidden:true,dataset:{}},feedback={hidden:true,dataset:{}},container={innerHTML:'',addEventListener(type,fn){this.click=fn;}};
 const document={getElementById(id){return {dependencyHeadProbePanel:panel,dependencyHeadProbeFeedback:feedback,dependencyHeadProbeOptions:container}[id];}};
 const sandbox={document,AdaptiveDependencyHeadProbeDefinition:Definition,AdaptiveDependencyHeadProbePresenter:Presenter,AdaptiveDependencyHeadProbeResult:HeadResult,SIYAYOAdaptiveDependencyHeadProbeBrowserWire:Wire,SIYAYOVerbExplorerLearnerEvent:eventContext.SIYAYOVerbExplorerLearnerEvent};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync('js/verb-explorer-dependency-head-probe-live.js','utf8'),sandbox);
 const live=sandbox.SIYAYOVerbExplorerDependencyHeadProbeLive;
 const q=seeds[0].thinkingMind.find(q=>q.questionWord===word),meta=q.dependencyHeadProbe||seeds[0].dependencyHeadProbe;
 const structure=require('../data/learning/dependencies/'+meta.structureIds[language]+'.json');
 const options={document,experience:seeds[0],structure,language,questionWord:word,metadata:{...meta,alternativeTokenIds:meta.alternativeTokenIdsByLanguage?.[language]||meta.alternativeTokenIds},identitySource:{getId(){return learnerId;}},runtime:{activeExperienceId(){return seeds[0].id;},activeLanguage(){return currentLanguage;},activeQuestionWord(){return currentWord;}},coordinator:{snapshot(){return {session};},submitObservedAttempt(){adaptiveCalls++;}},evidenceBridge:{fromResult(){adaptiveCalls++;}},allowAnonymousPractice:true};
 assert.equal(live.mount({...options,allowAnonymousPractice:false}),false);
 assert.equal(live.mount(options),true);assert.equal(panel.dataset.assessmentState,'anonymous-practice');
 const click=id=>container.click({target:{closest(){return {dataset:{dependencyHeadProbeSelect:id}};}}});
 const correct=word==='what'?'cook':language==='es'?'cheese':'books';click(correct);click(correct);click((meta.alternativeTokenIdsByLanguage?.[language]||meta.alternativeTokenIds).find(id=>id!==correct));
 assert.equal(feedback.dataset.result,'fail');let trace=live.getPracticeTrace();assert.equal(trace.length,3);assert.equal(trace[0].result,'pass');assert.notEqual(trace[0].occurrenceId,trace[1].occurrenceId);assert.ok(Object.isFrozen(trace));
 assert.ok(trace.every(r=>r.evidenceProduced===false&&r.greenPass===false&&!('learnerId' in r)));
 currentWord='where';click(correct);currentWord=word;currentLanguage='xx';click(correct);currentLanguage=language;
 learnerId='new nick';click(correct);assert.equal(live.getPracticeTrace().length,3);assert.equal(adaptiveCalls,0);
 learnerId=null;session={decision:{skill:'what.use.object-question',experienceId:seeds[0].id}};click(correct);assert.equal(live.getPracticeTrace().length,3);session=null;
 const old=container.__siyayoDependencyHeadProbeBinding;live.hide(document);assert.equal(container.__siyayoDependencyHeadProbeBinding,undefined);old.onEvent(trace[0]);assert.equal(live.getPracticeTrace().length,3);
}
console.log('PASS: WHAT LINES + Preparing canonical responses EN/ES/PT; anonymous Shopping WHAT/WHICH observations isolated from Evidence/Green and stale identity/context.');

