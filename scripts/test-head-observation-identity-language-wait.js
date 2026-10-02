const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const seeds=require('../data/learning/experience-seeds.json').items,Scope=require('../js/adaptive-assessment-scope');
const Definition=require('../js/adaptive-dependency-head-probe-definition'),Presenter=require('../js/adaptive-dependency-head-probe-presenter'),Result=require('../js/adaptive-dependency-head-probe-result'),Wire=require('../js/adaptive-dependency-head-probe-browser-wire');
for(const language of ['en','es','pt'])for(const word of ['what','which'])for(const foreign of [false,true]){
 let learnerId='learner A',currentLanguage=language,currentWord=word,session=foreign?{decision:{skill:word==='what'?'what.use.object-question':'which.use.determiner',experienceId:seeds[0].id,assessmentScope:Scope.create({learnerId:'learner A',skill:word==='what'?'what.use.object-question':'which.use.determiner',language:language==='en'?'es':'en',originExperienceId:seeds[0].id})}}:null,calls=0;
 const original=JSON.stringify(session),panel={hidden:true,dataset:{}},feedback={hidden:true,dataset:{}},surface={hidden:true,dataset:{}},container={innerHTML:'',addEventListener(type,fn){this.click=fn;}};
 const document={getElementById(id){return {dependencyHeadProbePanel:panel,dependencyHeadProbeFeedback:feedback,dependencyHeadProbeOptions:container,learnerTrailSurface:surface}[id];}};
 const runtime={activeExperienceId(){return seeds[0].id;},activeLanguage(){return currentLanguage;},activeQuestionWord(){return currentWord;}};
 const identity={getId(){return learnerId;}};
 const sandbox={document,AdaptiveAssessmentScope:Scope,AdaptiveDependencyHeadProbeDefinition:Definition,AdaptiveDependencyHeadProbePresenter:Presenter,AdaptiveDependencyHeadProbeResult:Result,SIYAYOAdaptiveDependencyHeadProbeBrowserWire:Wire,SIYAYOVerbExplorerLearnerIdentitySource:identity,SIYAYOVerbExplorerExperienceRuntime:runtime};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync('js/verb-explorer-learner-event.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('js/verb-explorer-dependency-head-probe-live.js','utf8'),sandbox);
 const live=sandbox.SIYAYOVerbExplorerDependencyHeadProbeLive,q=seeds[0].thinkingMind.find(q=>q.questionWord===word),meta=q.dependencyHeadProbe||seeds[0].dependencyHeadProbe,structure=require('../data/learning/dependencies/'+meta.structureIds[language]+'.json');
 const options={document,experience:seeds[0],structure,language,questionWord:word,questionWordLabel:q.questionWordLabel[language],metadata:{...meta,alternativeTokenIds:meta.alternativeTokenIdsByLanguage?.[language]||meta.alternativeTokenIds},identitySource:identity,runtime,coordinator:{snapshot(){return {session};},submitObservedAttempt(){calls++;}},evidenceBridge:{fromResult(){calls++;}},allowObservationalPractice:true};
 assert.equal(live.mount(options),true);assert.equal(panel.dataset.assessmentState,'identified-observation');
 const click=id=>container.click({target:{closest(){return {dataset:{dependencyHeadProbeSelect:id}};}}}),correct=word==='what'?'cook':'books';
 click(correct);assert.equal(feedback.dataset.result,'pass');click(correct);click(options.metadata.alternativeTokenIds[0]);assert.equal(feedback.dataset.result,'fail');
 const trace=live.getPracticeTrace();assert.equal(trace.length,3);assert.notEqual(trace[0].occurrenceId,trace[1].occurrenceId);assert.ok(trace.every(r=>r.learnerId===learnerId&&r.language===language&&r.questionWord===word&&r.evidenceProduced===false&&r.greenPass===false));assert.equal(calls,0);assert.equal(JSON.stringify(session),original);
 // Production observation-only trail projection retains empty canonical authority.
 vm.runInContext(fs.readFileSync('js/verb-explorer-learner-trail-surface.js','utf8'),sandbox);
 const empty={profileSource:{getProfile(){return null;}},skillSource:{getSkill(){return null;},getDefinition(){return null;}},labelView:{project(){return null;}},trailView:{project(){}},sequenceView:{project(){}},positionView:{resolve(){}},markerAuthority:{resolve(){}},stateBridge:{getState(){}},document,language};
 assert.equal(sandbox.SIYAYOVerbExplorerLearnerTrailSurface.refresh(empty),true);assert.equal(surface.dataset.state,'UNOBSERVED');assert.equal(surface.dataset.marker,'EMPTY_DOT');assert.equal(surface.dataset.observationState,'OBSERVED');assert.ok(surface.innerHTML.includes('free-diagnostic'));assert.ok(!surface.innerHTML.includes('3/3'));
 learnerId='learner B';click(correct);assert.equal(live.getPracticeTrace().length,3);assert.equal(sandbox.SIYAYOVerbExplorerLearnerTrailSurface.refresh(empty),false);
 learnerId='learner A';currentLanguage='xx';click(correct);currentLanguage=language;currentWord='where';click(correct);currentWord=word;session={decision:{}};click(correct);assert.equal(live.getPracticeTrace().length,3);assert.equal(calls,0);
 const old=container.__siyayoDependencyHeadProbeBinding;live.hide(document);old.onEvent(trace[0]);assert.equal(live.getPracticeTrace().length,3);
}
console.log('PASS: identified Session WAIT and foreign-language WHAT/WHICH diagnostics EN/ES/PT; repeated/stale actions, isolated free trace and empty canonical trail.');
