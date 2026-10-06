// WHERE presentation/observation only. Specification/Result and the canonical
// Coordinator/Cycle retain assessment authority; this panel never starts a Session.
(function(root){
  'use strict';
  var skillId='where.use.location-question',grounding=null,loading=null,generation=0;
  var audioTokens=new WeakMap(),sessionSupport=new WeakMap(),sessionFeedback=new WeakMap();
  var copy={
    en:{heading:'WHERE · LOCATION PRACTICE',function:'1 · What does this question ask for?',
      local:'2 · Choose the location in Shopping',transfer:'3 · Apply WHERE in Preparing',
      location:'A location',destination:'A destination',hear:'Listen',progress:'CONTRACT EVIDENCE',
      recorded:'Response recorded · assessment in progress',retry:'Try another answer',
      assisted:'Response recorded with audio support · independent location evidence still required',
      support:'Audio support observed in this Session',green:'GREEN PASS · WHERE confirmed'},
    es:{heading:'DÓNDE · PRÁCTICA DE UBICACIÓN',function:'1 · ¿Qué pide esta pregunta?',
      local:'2 · Elige la ubicación en Shopping',transfer:'3 · Aplica DÓNDE en Preparing',
      location:'Una ubicación',destination:'Un destino',hear:'Escuchar',progress:'EVIDENCIA DEL CONTRATO',
      recorded:'Respuesta registrada · evaluación en curso',retry:'Prueba otra respuesta',
      assisted:'Respuesta registrada con apoyo de audio · aún se requiere evidencia independiente de ubicación',
      support:'Apoyo de audio observado en esta Session',green:'GREEN PASS · DÓNDE confirmado'},
    pt:{heading:'ONDE · PRÁTICA DE LOCALIZAÇÃO',function:'1 · O que esta pergunta solicita?',
      local:'2 · Escolha a localização em Shopping',transfer:'3 · Aplique ONDE em Preparing',
      location:'Uma localização',destination:'Um destino',hear:'Ouvir',progress:'EVIDÊNCIA DO CONTRATO',
      recorded:'Resposta registrada · avaliação em andamento',retry:'Tente outra resposta',
      assisted:'Resposta registrada com apoio de áudio · ainda é necessária evidência independente de localização',
      support:'Apoio de áudio observado nesta Session',green:'GREEN PASS · ONDE confirmado'}
  };
  function text(v){return typeof v==='string'?v.trim():'';}
  function loadGrounding(){
    if(grounding)return Promise.resolve(true);
    if(loading)return loading;
    if(typeof root.fetch!=='function')return Promise.resolve(false);
    loading=Promise.resolve().then(function(){return root.fetch('data/learning/where-spatial-answer-grounding.json');})
      .then(function(response){if(!response||!response.ok)throw new Error('WHERE grounding unavailable');return response.json();})
      .then(function(data){
        if(!data||data.id!=='where-spatial-answer-grounding'||data.assessmentAuthority!==false||
          !Array.isArray(data.records))return false;
        grounding=data;return true;
      }).catch(function(){return false;}).then(function(ok){loading=null;return ok;});
    return loading;
  }
  function binding(experienceId,language){
    var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
    var catalog=root.SIYAYOVerbExplorerExperienceNavigation;
    var skills=root.SIYAYOVerbExplorerCanonicalSkillSource;
    var identity=root.SIYAYOVerbExplorerLearnerIdentitySource;
    var scopeApi=root.AdaptiveAssessmentScope;
    var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
    var source=root.AdaptiveWhereLocationProbeSpecificationSource;
    if(!grounding||!coordinator||typeof coordinator.snapshot!=='function'||!catalog||
      typeof catalog.getExperience!=='function'||!skills||typeof skills.getDefinition!=='function'||
      !identity||typeof identity.getId!=='function'||!scopeApi||!stateBridge||!source)return null;
    var active=coordinator.snapshot(),session=active&&active.session,decision=session&&session.decision;
    var scope=decision&&decision.assessmentScope,definition=skills.getDefinition(),state=stateBridge.getState();
    if(!scopeApi.valid(scope)||!scopeApi.ownsContext(scope,active.context)||
      scope.skill!==skillId||decision.skill!==skillId||scope.originExperienceId!=='shopping-for-dinner'||
      decision.experienceId!==scope.originExperienceId||scope.language!==language||
      identity.getId()!==scope.learnerId||!active.profile||active.profile.id!==scope.learnerId||
      !definition||definition.id!==skillId||!state||state.currentExperienceId!==experienceId||
      state.experienceLanguage!==language)return null;
    var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
    if(runtime&&typeof runtime.activeQuestionWord==='function'&&runtime.activeQuestionWord()!=='where')return null;
    var origin=catalog.getExperience(scope.originExperienceId),destination=catalog.getExperience('preparing-dinner');
    if(experienceId!==scope.originExperienceId&&experienceId!=='preparing-dinner')return null;
    var specs=source.resolve(definition,origin,destination,grounding,language);
    if(!specs)return null;
    var experience=experienceId===scope.originExperienceId?origin:destination;
    return {coordinator:coordinator,session:session,scope:scope,definition:definition,
      experience:experience,language:language,specs:specs,
      available:experience===origin?[specs.functionProbe,specs.localProbe]:[specs.transferProbe]};
  }
  function stillOwns(bound){
    var current=binding(bound.experience.id,bound.language);
    return !!current&&current.session===bound.session&&current.definition===bound.definition&&
      current.scope.key===bound.scope.key;
  }
  function supportFor(bound){
    var entries=sessionSupport.get(bound.session);
    return entries&&entries[bound.experience.id]===true?'audio':'none';
  }
  function canonicalAudioTexts(bound){
    var values=[],language=bound.language;
    function add(v){if(text(v))values.push(text(v));}
    var question=bound.experience.thinkingMind.find(function(q){return q.questionWord==='where';});
    add(question.question&&question.question[language]);add(question.responses&&question.responses[language]);
    Object.keys(question.dialogueForms||{}).forEach(function(tense){
      Object.keys(question.dialogueForms[tense]||{}).forEach(function(form){
        var pair=question.dialogueForms[tense][form];
        add(pair.question&&pair.question[language]);add(pair.response&&pair.response[language]);
      });
    });
    bound.available.forEach(function(spec){
      add(spec.question);spec.alternatives.forEach(function(alternative){add(alternative.label);});
    });
    return values;
  }
  // Capturing a request does not claim listening. Only native speech onstart calls observeAudio.
  function captureAudio(spoken,language){
    var state=root.SIYAYOVerbExplorerAdaptiveStateBridge;
    state=state&&state.getState&&state.getState();
    var bound=state&&binding(state.currentExperienceId,language);
    if(!bound||!canonicalAudioTexts(bound).includes(text(spoken)))return null;
    var token=Object.freeze({});audioTokens.set(token,bound);return token;
  }
  function observeAudio(token){
    var bound=token&&audioTokens.get(token);
    if(!bound)return false;
    audioTokens.delete(token);
    if(!stillOwns(bound))return false;
    var entries=sessionSupport.get(bound.session);
    if(!entries){entries=Object.create(null);sessionSupport.set(bound.session,entries);}
    // Sticky per Session/Experience: remount, repeated clicks and retained-scope
    // restoration cannot silently turn an assisted response into independent evidence.
    entries[bound.experience.id]=true;
    var doc=root.document,el=doc&&doc.getElementById&&doc.getElementById('whereAssessmentPanel');
    var note=el&&el.querySelector('.where-probe-support');
    if(note){note.textContent=copy[bound.language].support;note.hidden=false;}
    return true;
  }
  function panel(doc){
    if(!doc||typeof doc.getElementById!=='function')return null;
    var view=doc.getElementById('experienceView');if(!view)return null;
    var el=doc.getElementById('whereAssessmentPanel');
    if(!el){
      el=doc.createElement('section');el.id='whereAssessmentPanel';el.className='where-canonical-panel';
      el.hidden=true;el.setAttribute('aria-label','WHERE location practice');
      var living=view.querySelector('.living-window');
      if(living)living.appendChild(el);else view.insertBefore(el,view.querySelector('.experience-grid')||null);
    }
    return el;
  }
  function hide(doc){generation+=1;var el=panel(doc||root.document);if(!el)return false;el.hidden=true;el.innerHTML='';return true;}
  function mount(input){
    input=input||{};
    var doc=input.document||root.document,el=panel(doc);if(!el)return false;
    hide(doc);
    var bound=binding(text(input.experience&&input.experience.id),text(input.language));
    var resultApi=root.AdaptiveWhereLocationProbeResult,evidenceApi=root.AdaptiveWhereLocationProbeEvidenceBridge;
    var attemptApi=root.AdaptiveWhereLocationProbeAttemptBoundary,events=root.SIYAYOVerbExplorerLearnerEvent;
    if(!bound||!resultApi||!evidenceApi||!attemptApi||!events||
      typeof events.fromWhereLocationProbeSelect!=='function'||
      typeof bound.coordinator.submitObservedAttempt!=='function')return false;
    var mountedGeneration=generation,labels=copy[bound.language];
    el.dataset.scopeKey=bound.scope.key;el.dataset.experienceId=bound.experience.id;
    el.setAttribute('aria-label',labels.heading);
    var heading=doc.createElement('h3');heading.textContent=labels.heading;el.appendChild(heading);
    var progress=doc.createElement('p');progress.className='where-contract-progress';progress.setAttribute('aria-live','polite');
    function refreshProgress(){
      var active=bound.coordinator.snapshot(),view=root.AdaptivePassContractProgressView;
      var projected=view&&view.project(active.context.passContract,active.context.evidencePackets,root.GreenPassProfile);
      var live=el.dataset.scopeKey===bound.scope.key&&el.dataset.experienceId===bound.experience.id&&
        el.querySelector('.where-contract-progress');
      (live||progress).textContent=projected?labels.progress+' · '+projected.completed+'/'+projected.total:'';
    }
    refreshProgress();el.appendChild(progress);
    var probes=doc.createElement('div');probes.className='where-probe-grid';
    var feedback=doc.createElement('p');feedback.className='where-probe-feedback';feedback.setAttribute('aria-live','polite');feedback.hidden=true;
    function valid(){return mountedGeneration===generation&&!el.hidden&&stillOwns(bound);}
    function speaker(spoken){
      var button=doc.createElement('button');button.type='button';button.className='where-probe-audio';
      button.textContent='♪';button.setAttribute('aria-label',labels.hear+': '+spoken);
      button.addEventListener('click',function(){
        if(!valid())return;
        var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
        if(runtime&&typeof runtime.speak==='function')runtime.speak(spoken,bound.language);
      });return button;
    }
    bound.available.forEach(function(spec){
      var section=doc.createElement('div');section.className='where-location-probe';
      section.dataset.dimension=spec.dimension;section.dataset.mode=spec.mode;
      var title=doc.createElement('h4');title.textContent=spec.mode==='transfer'?labels.transfer:
        spec.dimension==='spatial-function'?labels.function:labels.local;section.appendChild(title);
      var question=doc.createElement('p');question.className='where-probe-question';
      question.appendChild(speaker(spec.question));
      var sentence=doc.createElement('span');sentence.textContent=spec.question;question.appendChild(sentence);section.appendChild(question);
      var choices=doc.createElement('div');choices.className='where-probe-options';
      spec.alternatives.forEach(function(alternative){
        var row=doc.createElement('div');row.className='where-probe-choice';
        if(spec.dimension==='location-answer')row.appendChild(speaker(alternative.label));
        var button=doc.createElement('button');button.type='button';button.className='where-probe-option';
        button.dataset.alternativeId=alternative.id;button.setAttribute('aria-pressed','false');
        button.textContent=spec.dimension==='spatial-function'?labels[alternative.id]:alternative.label;
        button.addEventListener('click',function(){
          if(!valid())return;
          var event=events.fromWhereLocationProbeSelect(alternative.id,{skill:spec.skill,dimension:spec.dimension,
            mode:spec.mode,language:spec.language,fromExperienceId:spec.fromExperienceId,currentExperienceId:spec.experienceId});
          var result=resultApi.evaluate(spec,event),support=supportFor(bound);
          var evidence=evidenceApi.fromResult({result:result,learnerEvent:event,supportSensor:{support:function(){return support;}}});
          var attempt=attemptApi.assemble({learnerEvent:event,evidence});if(!attempt)return;
          var submitted=bound.coordinator.submitObservedAttempt(attempt,event,button);if(!submitted)return;
          Array.from(choices.querySelectorAll('.where-probe-option')).forEach(function(option){option.setAttribute('aria-pressed',option===button?'true':'false');});
          var closure=submitted.cycleResult&&submitted.cycleResult.contractEvaluation;
          feedback.textContent=closure&&closure.status==='GREEN_PASS'&&closure.satisfied===true?labels.green:
            result.result==='fail'?labels.retry:support!=='none'?labels.assisted:labels.recorded;
          var saved=sessionFeedback.get(bound.session);
          if(!saved){saved=Object.create(null);sessionFeedback.set(bound.session,saved);}
          saved[bound.experience.id]=feedback.textContent;
          feedback.hidden=false;refreshProgress();
          // Resume dispatch may synchronously remount presentation. Update only
          // the still-owned visible scope, never its detached predecessor or another learner.
          if(stillOwns(bound)&&el.dataset.scopeKey===bound.scope.key&&el.dataset.experienceId===bound.experience.id){
            var liveFeedback=el.querySelector('.where-probe-feedback');
            if(liveFeedback){liveFeedback.textContent=feedback.textContent;liveFeedback.hidden=false;}
          }
          var trail=root.SIYAYOVerbExplorerLearnerTrailSurface;
          if(trail&&typeof trail.refresh==='function')trail.refresh({document:doc,language:bound.language});
          var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
          if(runtime&&typeof runtime.refreshAssessmentHighlight==='function')runtime.refreshAssessmentHighlight();
        });row.appendChild(button);choices.appendChild(row);
      });section.appendChild(choices);probes.appendChild(section);
    });el.appendChild(probes);
    var note=doc.createElement('p');note.className='where-probe-support';note.setAttribute('aria-live','polite');
    note.textContent=labels.support;note.hidden=supportFor(bound)==='none';el.appendChild(note);el.appendChild(feedback);
    var saved=sessionFeedback.get(bound.session);
    if(saved&&saved[bound.experience.id]){feedback.textContent=saved[bound.experience.id];feedback.hidden=false;}
    el.hidden=false;return true;
  }
  root.SIYAYOVerbExplorerWhereAssessmentLive=Object.freeze({mount:mount,hide:hide,
    loadGrounding:loadGrounding,captureAudio:captureAudio,observeAudio:observeAudio});
})(typeof globalThis!=='undefined'?globalThis:this);
