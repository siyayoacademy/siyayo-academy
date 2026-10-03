// Live browser binding for one canonical Dependency Head Probe.
// Mounting requires grounded Experience metadata and canonical dependency structure.
// Identified assessment requires an active adaptive Session. One explicit learner
// selection flows Definition -> Result -> Evidence -> Attempt -> Coordinator/Cycle.
// Free diagnostic observations remain available with or without identity, independently of assessment.
(function(root,factory){
  var api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOVerbExplorerDependencyHeadProbeLive=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  var practiceTrace=[];

  function text(value){return typeof value==='string'?value.trim():'';}

  function elements(doc){
    if(!doc||typeof doc.getElementById!=='function')return null;
    var panel=doc.getElementById('dependencyHeadProbePanel');
    var container=doc.getElementById('dependencyHeadProbeOptions');
    var feedback=doc.getElementById('dependencyHeadProbeFeedback');
    return panel&&container&&feedback?{panel:panel,container:container,feedback:feedback}:null;
  }

  function hide(doc){
    var el=elements(doc||root.document);
    if(!el)return false;
    el.panel.hidden=true;
    el.container.innerHTML='';
    delete el.container.__siyayoDependencyHeadProbeBinding;
    delete el.container.__siyayoAnonymousHeadToken;
    el.feedback.hidden=true;
    el.feedback.textContent='';
    delete el.feedback.dataset.result;
    delete el.panel.dataset.cycleStatus;
    delete el.panel.dataset.assessmentState;
    return true;
  }

  function feedbackText(result,language){
    if(result==='pass'){
      return {en:'✓ HEAD IDENTIFIED · correct answer observed (separate from the 0/3 contract)',es:'✓ NÚCLEO IDENTIFICADO · respuesta correcta observada (fuera del contrato 0/3)',pt:'✓ NÚCLEO IDENTIFICADO · resposta correta observada (fora do contrato 0/3)'}[language]||'✓ HEAD IDENTIFIED · correct answer observed (separate from the 0/3 contract)';
    }
    return {en:'TRY ANOTHER WORD',es:'PRUEBA OTRA PALABRA',pt:'TENTE OUTRA PALAVRA'}[language]||'TRY ANOTHER WORD';
  }

  function mount(options){
    options=options||{};
    var doc=options.document||root.document;
    var el=elements(doc);
    if(!el)return false;
    hide(doc);

    var experience=options.experience;
    var structure=options.structure;
    var language=text(options.language)||'en';
    var meta=options.metadata||(experience&&experience.dependencyHeadProbe);
    var coordinator=options.coordinator||root.SIYAYOVerbExplorerAdaptiveCoordinator;
    var definitionApi=options.definitionApi||root.AdaptiveDependencyHeadProbeDefinition;
    var presenter=options.presenter||root.AdaptiveDependencyHeadProbePresenter;
    var wire=options.wire||root.SIYAYOAdaptiveDependencyHeadProbeBrowserWire;
    var resultApi=options.resultApi||root.AdaptiveDependencyHeadProbeResult;
    var evidenceBridge=options.evidenceBridge||root.AdaptiveDependencyHeadProbeEvidenceBridge;
    var attemptBoundary=options.attemptBoundary||root.AdaptiveDependencyHeadProbeAttemptBoundary;
    var learnerEvents=options.learnerEvents||root.SIYAYOVerbExplorerLearnerEvent;
    var attemptLoop=options.attemptLoop||root.AdaptiveAttemptLoop;
    var supportSensor=options.supportSensor||root.SIYAYODependencyHeadProbeSupportSensor;

    if(!experience||!text(experience.id)||!meta||!structure)return false;
    var structureIds=meta.structureIds;
    if(!structureIds||text(structureIds[language])!==text(structure.id)||text(structure.language)!==language)return false;
    if(!definitionApi||typeof definitionApi.create!=='function')return false;
    if(!presenter||typeof presenter.present!=='function')return false;
    if(!wire||typeof wire.render!=='function'||typeof wire.install!=='function')return false;

    var prompt=meta.prompt&&text(meta.prompt[language]||meta.prompt.en);
    var definition=definitionApi.create(structure,{
      experienceId:text(experience.id),
      targetTokenId:text(meta.targetTokenId),
      prompt:prompt,
      alternativeTokenIds:Array.isArray(meta.alternativeTokenIds)?meta.alternativeTokenIds:[]
    });
    if(!definition)return false;

    var presentation=presenter.present(definition);
    if(!presentation)return false;


    var identity=options.identitySource||root.SIYAYOVerbExplorerLearnerIdentitySource;
    var runtime=options.runtime||root.SIYAYOVerbExplorerExperienceRuntime;
    var questionWord=text(options.questionWord);
    var learnerId=identity&&typeof identity.getId==='function'?text(identity.getId()):'';
    function snapshot(){
      return coordinator&&typeof coordinator.snapshot==='function'?coordinator.snapshot():null;
    }
    function locationCurrent(){
      return runtime&&typeof runtime.activeExperienceId==='function'&&runtime.activeExperienceId()===experience.id&&
        typeof runtime.activeLanguage==='function'&&runtime.activeLanguage()===language&&
        typeof runtime.activeQuestionWord==='function'&&runtime.activeQuestionWord()===questionWord;
    }
    function compatibleAssessment(current){
      var decision=current&&current.session&&current.session.decision;
      if(!decision||!text(decision.skill)||(options.expectedSkill&&text(decision.skill)!==text(options.expectedSkill))||
        text(decision.experienceId)!==text(experience.id))return false;
      var scope=decision.assessmentScope,scopeApi=root.AdaptiveAssessmentScope;
      if(scope){
        if(!scopeApi||!scopeApi.valid(scope)||scope.language!==language||scope.skill!==decision.skill||
          scope.originExperienceId!==experience.id||scope.learnerId!==learnerId)return false;
      }else if(scopeApi||decision.language&&text(decision.language)!==language)return false;
      return !!coordinator&&typeof coordinator.submitObservedAttempt==='function';
    }
    var active=snapshot(),session=active&&active.session,decision=session&&session.decision;
    var assessed=compatibleAssessment(active);
    var observationAllowed=options.allowObservationalPractice===true||
      (options.allowAnonymousPractice===true&&identity&&typeof identity.getId==='function'&&!learnerId&&!session);
    function observationCurrent(){
      var current=snapshot();
      var currentLearner=identity&&typeof identity.getId==='function'?text(identity.getId()):'';
      return currentLearner===learnerId&&(current&&current.session||null)===(session||null)&&
        !compatibleAssessment(current)&&locationCurrent();
    }
    // Separate observation path: no Evidence, Attempt, contract mutation or Session creation.
    if(!assessed&&observationAllowed&&questionWord&&observationCurrent()){
      if(!resultApi||typeof resultApi.evaluate!=='function'||!learnerEvents)return false;
      var token={};
      el.container.__siyayoAnonymousHeadToken=token;
      var observationInstalled=wire.install(presentation,{
        container:el.container,learnerEvents:learnerEvents,
        onEvent:function(event){
          if(el.container.__siyayoAnonymousHeadToken!==token||!observationCurrent())return null;
          var result=resultApi.evaluate(definition,event);
          if(!result)return null;
          var record=Object.freeze({questionWord:questionWord,
            questionWordLabel:text(options.questionWordLabel)||questionWord.toUpperCase(),
            ...(learnerId?{learnerId:learnerId}:{}),occurrenceId:result.occurrenceId,
            experienceId:result.experienceId,structureId:result.structureId,language:language,
            selectedAlternativeId:result.selectedAlternativeId,result:result.result,
            evidenceProduced:false,greenPass:false});
          practiceTrace.push(record);
          el.feedback.textContent=result.result==='pass'
            ?({en:'✓ HEAD IDENTIFIED · correct answer observed · free practice',es:'✓ NÚCLEO IDENTIFICADO · respuesta correcta observada · práctica libre',pt:'✓ NÚCLEO IDENTIFICADO · resposta correta observada · prática livre'}[language])
            :feedbackText(result.result,language);
          el.feedback.dataset.result=result.result;el.feedback.hidden=false;
          el.panel.dataset.cycleStatus='observed';
          var trailSurface=root.SIYAYOVerbExplorerLearnerTrailSurface;
          if(trailSurface&&typeof trailSurface.refresh==='function')trailSurface.refresh({document:doc,language:language});
          return record;
        }
      });
      if(observationInstalled!==true){hide(doc);return false;}
      el.panel.dataset.assessmentState=learnerId?'identified-observation':'anonymous-practice';
      el.panel.hidden=false;return true;
    }

    if(!assessed){hide(doc);return false;}

    if(!resultApi||typeof resultApi.evaluate!=='function')return false;
    if(!evidenceBridge||typeof evidenceBridge.fromResult!=='function')return false;
    if(!attemptBoundary||typeof attemptBoundary.assemble!=='function')return false;
    if(!learnerEvents||typeof learnerEvents.fromDependencyHeadProbeSelect!=='function')return false;
    if(!attemptLoop||typeof attemptLoop.toEvidencePacket!=='function')return false;
    if(!supportSensor||typeof supportSensor.support!=='function')return false;

    var installed=wire.install(presentation,{
      container:el.container,
      learnerEvents:learnerEvents,
      onEvent:function(event,target){
        var current=coordinator.snapshot();
        if(!current||current.session!==session||!compatibleAssessment(current))return null;
        if(runtime&&questionWord&&!locationCurrent())return null;
        if(text(current.session.decision.skill)!==text(decision.skill))return null;
        if(text(current.session.decision.experienceId)!==text(experience.id))return null;

        var result=resultApi.evaluate(definition,event);
        if(!result)return null;

        var evidence=evidenceBridge.fromResult({
          result:result,
          learnerEvent:event,
          session:current.session,
          supportSensor:supportSensor,
          attemptLoop:attemptLoop
        });
        if(!evidence)return null;

        var attempt=attemptBoundary.assemble({learnerEvent:event,evidence:evidence});
        if(!attempt)return null;

        var coordinated=coordinator.submitObservedAttempt(attempt,event,target);
        if(!coordinated)return null;

        el.feedback.textContent=feedbackText(result.result,language);
        el.feedback.dataset.result=result.result;
        el.feedback.hidden=false;
        el.panel.dataset.cycleStatus='observed';
        return coordinated;
      }
    });

    if(installed!==true){
      hide(doc);
      return false;
    }

    el.panel.dataset.assessmentState='active';
    el.panel.hidden=false;
    return true;
  }

  return Object.freeze({mount:mount,hide:hide,getPracticeTrace:function(){return Object.freeze(practiceTrace.slice());}});
});
