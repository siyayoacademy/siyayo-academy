#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const runtime=fs.readFileSync('js/verb-explorer.js','utf8');
for(const experience of corpus.items){
  for(const q of experience.thinkingMind||[]){
    assert.ok(q.questionWord,'technical questionWord identity is required');
    assert.ok(q.questionWordLabel,'human question-word label is required');
    for(const language of ['en','es','pt']){
      assert.equal(typeof q.questionWordLabel[language],'string');
      assert.ok(q.questionWordLabel[language].trim(),experience.id+' '+q.questionWord+' '+language+' label must exist');
      assert.ok(q.question?.[language],experience.id+' '+q.questionWord+' '+language+' question must exist');
    }
  }
}
const shopping=corpus.items.find(x=>x.id==='shopping-for-dinner');
const which=shopping.thinkingMind.find(q=>q.questionWord==='which');
assert.deepEqual(which.questionWordLabel,{en:'WHICH',es:'CUÁL',pt:'QUAL'});
const preparing=corpus.items.find(x=>x.id==='preparing-dinner');
const preparingWhich=preparing.thinkingMind.find(q=>q.questionWord==='which');
assert.deepEqual(preparingWhich.questionWordLabel,{en:'WHICH',es:'CUÁLES',pt:'QUAIS'});
assert.match(runtime,/q\.questionWordLabel\?\.\[experienceLanguage\]/);

// Real Experience render + delegated click handlers, with controlled DOM and
// assessment transport. The live WHERE integration separately tests real Sessions.
function element(dataset={}) {
  const classes=new Set(), attributes={}, children=[];
  let copy='';
  return {
    dataset, attributes, hidden:false,
    classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);},
      remove(name){classes.delete(name);}, contains(name){return classes.has(name);}},
    get className(){return [...classes].join(' ');},
    set className(value){classes.clear();value.split(/\s+/).filter(Boolean).forEach(name=>classes.add(name));},
    get textContent(){return copy+children.map(child=>child.textContent).join('');},
    set textContent(value){copy=String(value);},
    appendChild(child){children.push(child);child.remove=()=>children.splice(children.indexOf(child),1);},
    querySelector(selector){return selector==='.session-target-label'?children.find(child=>child.className==='session-target-label')||null:null;},
    closest(selector){return selector==='[data-question-index]'&&dataset.questionIndex!==undefined?this:null;},
    setAttribute(name,value){attributes[name]=String(value);}, removeAttribute(name){delete attributes[name];}
  };
}
function functionSource(name){
  const start=runtime.indexOf('function '+name+'(');
  const end=runtime.indexOf('\nfunction ',start+1);
  assert.ok(start>=0&&end>start,name+' must remain a production function');
  return runtime.slice(start,end);
}
async function verifyButtons(){
  const nodes=new Map(), listeners={}, languageButtons=['en','es','pt'].map(language=>element({experienceLanguage:language}));
  let buttons=[], session=null, selectionCount=0, assessmentContext=null, evidenceProfile=null;
  const definitions=Object.fromEntries(['which','what','why','where'].map(word=>{
    const definition=require('../data/learning/skills/'+word+'.json');return [definition.id,definition];
  }));
  const viewport={dataset:{}}, toolbar={querySelectorAll(){return [];}};
  const gear=element();
  Object.defineProperty(gear,'innerHTML',{set(markup){
    buttons=[...markup.matchAll(/<button class="([^"]+)" data-question-index="(\d+)"[^>]*>([^<]*)<\/button>/g)].map(match=>{
      const button=element({questionIndex:match[2]});button.className=match[1];button.textContent=match[3];return button;
    });
  }});
  nodes.set('questionGear',gear);
  const nextCard=element();
  const document={
    getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},
    querySelectorAll(selector){return selector==='#questionGear [data-question-index]'?buttons:
      selector==='[data-experience-language]'?languageButtons:[];},
    querySelector(selector){return selector==='[data-siyayo-responsive-viewport]'?viewport:
      selector==='[data-siyayo-responsive-toolbar]'?toolbar:null;},
    createElement(){return element();},
    addEventListener(type,handler){(listeners[type]||=[]).push(handler);}
  };
  document.getElementById('nextExperience').closest=()=>nextCard;
  const state={document, corpus,
    CustomEvent:class {constructor(type,input){this.type=type;this.detail=input.detail;}},
    dispatchEvent(event){for(const listener of listeners[event.type]||[])listener(event);},
    localStorage:{getItem(){return null;},setItem(){}},
    SIYAYOVerbExplorerCanonicalSkillSource:{getSkill:()=>session?.decision.skill},
    SIYAYOVerbExplorerAdaptiveCoordinator:{snapshot:()=>({session,context:assessmentContext})},
    SIYAYOVerbExplorerAdaptiveEvidenceProfileSource:{getProfile:()=>evidenceProfile},
    AdaptivePassContractProgressView:require('../js/adaptive-pass-contract-progress-view.js'),
    GreenPassProfile:require('../js/green-pass-profile.js'),
    SIYAYOQuestionWordAssessmentContract:require('../js/question-word-assessment-contract.js'),
    AdaptiveLearnerTrailView:require('../js/adaptive-learner-trail-view.js'),
    AdaptiveLearnerProgressMarker:require('../js/adaptive-learner-progress-marker.js'),
    AdaptiveAssessmentScope:{},
    SIYAYOVerbExplorerThinkingMindAssessmentSelection:{invalidatePending(){},select(question){
      selectionCount+=1;
      const skill=question.assessmentTarget?.skill;
      if(skill){
        session={decision:{skill,assessmentScope:{language:vm.runInContext('experienceLanguage',context)}}};
        assessmentContext={passContract:definitions[skill].passContract,evidencePackets:[]};
        evidenceProfile={id:'selector',observations:[]};
      }
      return Promise.resolve(Boolean(skill));
    }}
  };
  const context=vm.createContext(state);state.window=state;
  vm.runInContext(fs.readFileSync('js/siyayo-responsive-preview.js','utf8'),context);
  for(const name of ['thinking-mind-information-gap-resolver','thinking-mind-runtime-decision']){
    vm.runInContext(fs.readFileSync('js/'+name+'.js','utf8'),context);
  }
  state.capabilities=JSON.parse(fs.readFileSync('data/learning/question-word-capabilities.json','utf8'));
  vm.runInContext('let experiences=corpus.items,currentExperienceId=experiences[0].id,experienceLanguage="en",experienceQuestion=0,experiencePerspective=null,experienceChoiceCandidate=null,lineOffset=0,experienceWordType="verb",experienceTense="present",experienceForm="affirmative"; const thinkingMindDecision=SIYAYOThinkingMindRuntimeDecision.create({capabilities});',context);
  for(const name of ['renderPreviousExperience','renderNounGear','renderCompositionGear','setExperienceGrammarLock',
    'renderDependencyFocus','renderDependencyHeadProbe','renderLivingLines','renderChoiceResolver','visitPreviousExperience'])state[name]=()=>{};
  vm.runInContext(runtime.split('\n').find(line=>line.startsWith('function cap(')),context);
  for(const name of ['activeExperience','activeThinkingQuestion','chooseThinkingQuestion',
    'refreshThinkingMindAssessmentHighlight','renderExperience','renderAssessmentEntryNotice','selectThinkingMindAssessment']){
    vm.runInContext(functionSource(name),context,{filename:'verb-explorer.js:'+name});
  }
  vm.runInContext(runtime.split('\n').find(line=>line.startsWith('function attachEvents(')),context);
  // Preserve real bubbling after innerHTML has replaced the clicked button.
  for(const line of runtime.split('\n').filter(line=>line.startsWith('document.addEventListener("click",'))){vm.runInContext(line,context);}
  vm.runInContext('attachEvents()',context);
  let cases=0;
  for(const experience of corpus.items){
    state.targetId=experience.id;vm.runInContext('currentExperienceId=targetId',context);
    for(const language of ['en','es','pt']){
      state.targetLanguage=language;vm.runInContext('experienceLanguage=targetLanguage;renderExperience()',context);
      for(let index=0;index<experience.thinkingMind.length;index+=1){
        const question=experience.thinkingMind[index];
        const clicked=buttons[index], event={target:clicked};
        gear.onclick(event);
        for(const listener of listeners.click||[])listener(event);
        await Promise.resolve();await Promise.resolve();
        assert.equal(vm.runInContext('activeThinkingQuestion(activeExperience()).questionWord',context),question.questionWord);
        assert.deepEqual(buttons.filter(button=>button.classList.contains('active')).map(button=>Number(button.dataset.questionIndex)),[index],
          experience.id+' '+language+' '+question.questionWord+' must highlight only the clicked QWord');
        assert.ok(buttons[index].textContent.startsWith(question.questionWordLabel[language]));
        for(const button of buttons){
          const q=experience.thinkingMind[Number(button.dataset.questionIndex)];
          const expected=q.assessmentTarget?.skill===session?.decision.skill&&session?.decision.assessmentScope.language===language;
          if(q.assessmentTarget)assert.equal(button.classList.contains('question-word-practicing'),expected,
            experience.id+' '+language+' '+question.questionWord+' / '+q.questionWord+' / '+session?.decision.skill+
              ': assessment badge must follow the canonical contract rather than the explored label');
          if(expected)assert.equal(button.querySelector('.session-target-label')?.textContent,'○',
            'a selected 0/3 assessment must not display a half-filled progress badge');
        }
        const selected=session, count=selectionCount;
        const selectedButton=buttons[index];
        for(const mode of ['auto','portrait','landscape']){
          state.SIYAYOResponsivePreview.setMode(mode);
          assert.equal(state.SIYAYOResponsivePreview.getMode(),mode);
          assert.equal(session,selected);
          assert.equal(selectionCount,count,'preview format must not select an assessment');
          assert.equal(buttons[index],selectedButton,'preview must not replace the QWord controls');
          assert.equal(selectedButton.classList.contains('active'),true);
        }
        for(const displayLanguage of ['en','es','pt']){
          document.getElementById('experienceLanguageGear').onclick({target:{closest:()=>({dataset:{experienceLanguage:displayLanguage}})}});
          assert.equal(session,selected,'LANGUAGE alone cannot select another assessment');
          assert.equal(selectionCount,count);
          assert.equal(buttons[index].classList.contains('active'),true);
          assert.ok(buttons[index].textContent.startsWith(question.questionWordLabel[displayLanguage]));
        }
        state.targetLanguage=language;vm.runInContext('experienceLanguage=targetLanguage;renderExperience()',context);
        cases+=1;
      }
    }
  }
  // Project canonical contract/closure inputs through the production views.
  // These fixtures do not produce Attempts or claim human learner evidence.
  const Scope=require('../js/adaptive-assessment-scope.js');
  const Profile=require('../js/adaptive-evidence-profile.js');
  let markerCases=0;
  for(const word of ['which','what','why','where'])for(const language of ['en','es','pt']){
    const definition=Object.values(definitions).find(item=>item.form===word);
    const experience=corpus.items.find(item=>item.thinkingMind.some(q=>q.assessmentTarget?.skill===definition.id));
    const index=experience.thinkingMind.findIndex(q=>q.assessmentTarget?.skill===definition.id);
    const scope=Scope.create({learnerId:'new-marker-nick-'+language,skill:definition.id,language,originExperienceId:experience.id});
    const requires=definition.passContract.requires;
    for(const scenario of [
      {name:'new nick',packets:[],glyph:'○',state:'ready'},
      {name:'failed answer',packets:[{...requires[0],result:'fail'}],glyph:'○',state:'ready'},
      {name:'head practice only',packets:[],observed:true,glyph:'○',state:'ready'},
      {name:'audio-assisted use only',packets:[{...requires[1],support:'audio'}],glyph:'○',state:'ready'},
      {name:'one accepted requirement',packets:[requires[0]],glyph:'◐',state:'practicing'},
      {name:'two accepted requirements',packets:requires.slice(0,2),glyph:'◐',state:'practicing'},
      {name:'three requirements before closure',packets:requires,glyph:'◐',state:'practicing'},
      {name:'canonical closure',packets:requires,closed:true,glyph:'★',state:'confirmed'}
    ]){
      session={decision:{skill:definition.id,assessmentScope:scope}};
      assessmentContext={assessmentScope:scope,passContract:definition.passContract,
        evidencePackets:scenario.packets.map(packet=>({...packet,skill:definition.id,context:{assessmentScope:scope}}))};
      evidenceProfile=Profile.createProfile(scope.learnerId);
      if(scenario.observed||scenario.closed)Profile.record(evidenceProfile,{
        source:scenario.closed?'green-pass-contract':'dependency-head-probe',
        status:scenario.closed?'transfer-confirmed':'observed',repeated:[],requiresReview:false,conflict:false,requiresReinforcement:false
      },{skill:definition.id,language,experienceId:experience.id,assessmentScope:scope,
        confirmed:scenario.closed===true,contractStatus:scenario.closed?'GREEN_PASS':null});
      const before=JSON.stringify({session,assessmentContext,evidenceProfile});
      state.caseExperience=experience.id;state.caseIndex=index;
      vm.runInContext('currentExperienceId=caseExperience;experienceQuestion=caseIndex',context);
      for(const display of ['en','es','pt']){
        state.targetLanguage=display;vm.runInContext('experienceLanguage=targetLanguage;renderExperience();refreshThinkingMindAssessmentHighlight()',context);
        const button=buttons[index],badge=button.querySelector('.session-target-label');
        assert.equal(badge?.textContent,display===language?scenario.glyph:undefined,
          word+' '+language+'/'+display+' '+scenario.name+' badge');
        assert.equal(button.dataset.learningState,display===language?scenario.state:'exploring');
        assert.equal(button.classList.contains('active'),true,'badge refresh cannot change the explored QWord');
        assert.equal(JSON.stringify({session,assessmentContext,evidenceProfile}),before,'badge projection must remain read-only');
        markerCases+=1;
      }
    }
  }
  console.log('PASS — '+markerCases+' canonical badge cases: new nick/0 evidence, failed/practice/assisted-only answers, accepted evidence, real closure and display-language ownership, without state mutation.');
  console.log('PASS — '+cases+' QWord/EN/ES/PT delegated selections × 3 preview formats ('+(cases*3)+' cases) and display-language returns; one active button, translated label and separate assessment badge. Controlled DOM, not native click delivery.');
}
verifyButtons().then(()=>console.log('Thinking Mind tri-language labels: PASS — technical identity stays stable while EN/ES/PT human forms follow each canonical Experience question.'))
  .catch(error=>{console.error(error);process.exitCode=1;});
