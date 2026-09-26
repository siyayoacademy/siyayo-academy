// Live browser binding for one canonical Dependency Head Probe.
// Mounting requires grounded Experience metadata, canonical dependency structure,
// and an active adaptive Session with a canonical skill. One explicit learner
// selection flows Definition -> Result -> Evidence -> Attempt -> Coordinator/Cycle.
// Exploratory Dependency Focus remains separate and produces no assessed event.
(function(root,factory){
  var api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOVerbExplorerDependencyHeadProbeLive=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

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
    el.feedback.hidden=true;
    el.feedback.textContent='';
    delete el.feedback.dataset.result;
    delete el.panel.dataset.cycleStatus;
    delete el.panel.dataset.assessmentState;
    return true;
  }

  function feedbackText(result,language){
    if(result==='pass'){
      return {en:'HEAD IDENTIFIED',es:'NÚCLEO IDENTIFICADO',pt:'NÚCLEO IDENTIFICADO'}[language]||'HEAD IDENTIFIED';
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
    var meta=experience&&experience.dependencyHeadProbe;
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

    // Assessment presentation is authority-gated. Before a grounded Session
    // exists, the Head Probe remains hidden: exploratory Dependency Focus may
    // still be used, but no assessed task is presented or bound.
    if(!coordinator||typeof coordinator.snapshot!=='function'||typeof coordinator.submitObservedAttempt!=='function'){
      hide(doc);
      return false;
    }

    var active=coordinator.snapshot();
    var session=active&&active.session;
    var decision=session&&session.decision;
    if(!decision||!text(decision.skill)||text(decision.experienceId)!==text(experience.id)){
      hide(doc);
      return false;
    }

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
        if(!current||!current.session||!current.session.decision)return null;
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

  return Object.freeze({mount:mount,hide:hide});
});
