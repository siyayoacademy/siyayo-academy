#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

for (const path of [
  'js/verb-explorer-dependency-head-probe-live.js',
  'js/adaptive-dependency-head-probe-definition.js',
  'js/adaptive-dependency-head-probe-presenter.js',
  'js/adaptive-dependency-head-probe-browser-wire.js',
  'js/adaptive-dependency-head-probe-result.js',
  'js/adaptive-dependency-head-probe-support-sensor.js',
  'js/adaptive-dependency-head-probe-evidence-bridge.js',
  'js/adaptive-dependency-head-probe-attempt-boundary.js'
]) {
  assert.equal(fs.existsSync(path),true,path+' must exist for live Dependency Head Probe');
}

const corpus = JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const schema = JSON.parse(fs.readFileSync('data/schemas/experience-seed.schema.json','utf8'));
const structure = JSON.parse(fs.readFileSync('data/learning/dependencies/all-these-three-books.json','utf8'));
const html = fs.readFileSync('verb-explorer.html','utf8');
const runtime = fs.readFileSync('js/verb-explorer.js','utf8');
const bootstrap = fs.readFileSync('js/verb-explorer-adaptive-bootstrap.js','utf8');

const shopping = corpus.items.find(item=>item.id==='shopping-for-dinner');
assert.ok(shopping);
assert.deepEqual(shopping.dependencyHeadProbe,{
  structureId:'all-these-three-books',
  targetTokenId:'three',
  prompt:{
    en:'Which word is the head of “three”?',
    es:'¿Qué palabra es el núcleo de “three”?',
    pt:'Qual palavra é o núcleo de “three”?'
  },
  alternativeTokenIds:['all','these','books']
});

const props=schema.$defs?.experienceSeed?.properties||{};
assert.ok(props.dependencyHeadProbe,'Experience schema must authorize dependencyHeadProbe metadata');

assert.match(html,/id="dependencyHeadProbePanel"/);
assert.match(html,/id="dependencyHeadProbeOptions"/);
assert.match(html,/id="dependencyHeadProbeFeedback"/);
assert.match(html,/dependency-head-probe-panel[^>]*hidden/);
assert.doesNotMatch(html,/data-dependency-head-probe-select=/,'entry HTML must not fabricate assessed alternatives');

for(const hook of [
  'renderDependencyHeadProbe',
  'dependencyHeadProbe',
  'SIYAYOVerbExplorerDependencyHeadProbeLive',
  'SIYAYOVerbExplorerDependencyHeadProbeRuntime'
]){
  assert.ok(runtime.includes(hook),'missing live runtime hook: '+hook);
}

for(const modulePath of [
  'js/adaptive-dependency-head-probe-definition.js',
  'js/adaptive-dependency-head-probe-presenter.js',
  'js/adaptive-dependency-head-probe-browser-wire.js',
  'js/adaptive-dependency-head-probe-result.js',
  'js/adaptive-dependency-head-probe-support-sensor.js',
  'js/adaptive-dependency-head-probe-evidence-bridge.js',
  'js/adaptive-dependency-head-probe-attempt-boundary.js',
  'js/verb-explorer-dependency-head-probe-live.js'
]){
  assert.ok(bootstrap.includes(modulePath),modulePath+' must be loaded by adaptive bootstrap');
}

const HeadProbe=require('../js/adaptive-dependency-head-probe-definition.js');
const Presenter=require('../js/adaptive-dependency-head-probe-presenter.js');
const Result=require('../js/adaptive-dependency-head-probe-result.js');
const Sensor=require('../js/adaptive-dependency-head-probe-support-sensor.js');
const Bridge=require('../js/adaptive-dependency-head-probe-evidence-bridge.js');
const Boundary=require('../js/adaptive-dependency-head-probe-attempt-boundary.js');
const Loop=require('../js/adaptive-attempt-loop.js');

const learnerSandbox=vm.createContext({});
learnerSandbox.globalThis=learnerSandbox;
vm.runInContext(fs.readFileSync('js/verb-explorer-learner-event.js','utf8'),learnerSandbox);
const LearnerEvents=learnerSandbox.SIYAYOVerbExplorerLearnerEvent;

const panel={hidden:true,dataset:{}};
const container={innerHTML:'',listeners:[],addEventListener(type,fn){if(type==='click')this.listeners.push(fn);}};
const feedback={hidden:true,textContent:'',dataset:{}};
const documentRef={
  getElementById(id){
    if(id==='dependencyHeadProbePanel')return panel;
    if(id==='dependencyHeadProbeOptions')return container;
    if(id==='dependencyHeadProbeFeedback')return feedback;
    return null;
  }
};

const session={decision:{skill:'which.use.determiner',experienceId:'shopping-for-dinner'},trace:[]};
const profile={id:'live-head-probe'};
const context={currentExperience:'shopping-for-dinner',evidencePackets:[]};
let submitted=null;
const coordinator={
  snapshot(){return {profile,session,context};},
  submitObservedAttempt(attempt,event){
    submitted={attempt,event};
    return {
      cycleResult:{
        contractEligible:false,
        advanceSelection:null,
        nextContext:{currentExperience:'shopping-for-dinner'}
      }
    };
  }
};

const wire={
  render(view){
    delete container.binding;
    container.innerHTML=view.alternatives.map(item=>
      '<button data-dependency-head-probe-select="'+item.id+'">'+item.form+'</button>'
    ).join('');
    return true;
  },
  install(view,options){
    this.render(view);
    container.__siyayoDependencyHeadProbeBinding=options;
    return true;
  }
};

const sandbox=vm.createContext({
  Object,
  AdaptiveDependencyHeadProbeDefinition:HeadProbe,
  AdaptiveDependencyHeadProbePresenter:Presenter,
  SIYAYOAdaptiveDependencyHeadProbeBrowserWire:wire,
  AdaptiveDependencyHeadProbeResult:Result,
  AdaptiveDependencyHeadProbeEvidenceBridge:Bridge,
  AdaptiveDependencyHeadProbeAttemptBoundary:Boundary,
  AdaptiveAttemptLoop:Loop,
  SIYAYOVerbExplorerLearnerEvent:LearnerEvents,
  SIYAYOVerbExplorerAdaptiveCoordinator:coordinator,
  AdaptiveDependencyHeadProbeSupportSensor:Sensor,
  SIYAYODependencyHeadProbeSupportSensor:Sensor.create(),
  document:documentRef
});
sandbox.globalThis=sandbox;
vm.runInContext(fs.readFileSync('js/verb-explorer-dependency-head-probe-live.js','utf8'),sandbox);

const Live=sandbox.SIYAYOVerbExplorerDependencyHeadProbeLive;
assert.ok(Live);
assert.equal(Live.mount({
  document:documentRef,
  experience:shopping,
  structure,
  language:'en'
}),true);
assert.equal(panel.hidden,false);
assert.match(container.innerHTML,/books/);
assert.equal(feedback.hidden,true);

const event=LearnerEvents.fromDependencyHeadProbeSelect('books',{
  currentExperienceId:'shopping-for-dinner',
  structureId:'all-these-three-books',
  language:'en',
  dimension:'head-identification',
  targetTokenId:'three'
});
container.__siyayoDependencyHeadProbeBinding.onEvent(event,{dataset:{dependencyHeadProbeSelect:'books'}});

assert.ok(submitted);
assert.equal(submitted.event,event);
assert.equal(submitted.attempt.dimension,'head-identification');
assert.equal(submitted.attempt.result,'pass');
assert.equal(submitted.attempt.skill,'which.use.determiner');
assert.equal(submitted.attempt.context.selectedAlternativeId,'books');
assert.equal(feedback.hidden,false);
assert.equal(feedback.dataset.result,'pass');
assert.match(feedback.textContent,/HEAD IDENTIFIED/);
assert.equal(panel.dataset.cycleStatus,'observed');

const failEvent=LearnerEvents.fromDependencyHeadProbeSelect('these',{
  currentExperienceId:'shopping-for-dinner',
  structureId:'all-these-three-books',
  language:'en',
  dimension:'head-identification',
  targetTokenId:'three'
});
container.__siyayoDependencyHeadProbeBinding.onEvent(failEvent,{dataset:{dependencyHeadProbeSelect:'these'}});
assert.equal(submitted.attempt.result,'fail');
assert.equal(submitted.attempt.context.selectedAlternativeId,'these');
assert.equal(feedback.hidden,false);
assert.equal(feedback.dataset.result,'fail');
assert.match(feedback.textContent,/TRY ANOTHER WORD/);

const noSkillCoordinator={
  snapshot(){return {profile,session:{decision:{experienceId:'shopping-for-dinner'}},context};}
};
assert.equal(Live.mount({
  document:documentRef,
  experience:shopping,
  structure,
  language:'en',
  coordinator:noSkillCoordinator
}),false);
assert.equal(panel.hidden,true,'missing canonical Session authority must keep assessed Head Probe hidden');
assert.equal(container.__siyayoDependencyHeadProbeBinding,undefined,'WAIT must not retain assessed learner-event binding');

console.log(
  'Verb Explorer live Dependency Head Probe: PASS — canonical probe stays hidden through Session WAIT, activates only with grounded Session authority, and BOOKS selection flows Event → Result → Evidence → Attempt → Coordinator without automatic Green Pass or NEXT.'
);
