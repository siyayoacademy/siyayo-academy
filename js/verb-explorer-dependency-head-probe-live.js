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
    if(text(meta.structureId)!==text(structure.id))return false;
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

    // Presentation and assessment authority are intentionally separate.
    // The canonical task remains visible and centered while adaptive Session
    // authority is still WAIT. No listener/event/evidence path is installed.
    function presentWaiting(){
      if(wire.render(presentation,{container:el.container})!==true)return false;
      if(typeof el.container.querySelectorAll==='function'){
        Array.prototype.forEach.call(
          el.container.querySelectorAll('[data-dependency-head-probe-select]'),
          function(button){
            button.disabled=true;
            button.setAttribute('aria-disabled','true');
          }
        );
      }
      el.panel.dataset.assessmentState='waiting';
      el.panel.hidden=false;
      return true;
    }

    if(!coordinator||typeof coordinator.snapshot!=='function'||typeof coordinator.submitObservedAttempt!=='function'){
      return presentWaiting();
    }

    var active=coordinator.snapshot();
    var session=active&&active.session;
    var decision=session&&session.decision;
    if(!decision||!text(decision.skill)||text(decision.experienceId)!==text(experience.id)){
      return presentWaiting();
    }

    if(!resultApi||typeof resultApi.evaluate!=='function')return presentWaiting();
    if(!evidenceBridge||typeof evidenceBridge.fromResult!=='function')return presentWaiting();
    if(!attemptBoundary||typeof attemptBoundary.assemble!=='function')return presentWaiting();
    if(!learnerEvents||typeof learnerEvents.fromDependencyHeadProbeSelect!=='function')return presentWaiting();
    if(!attemptLoop||typeof attemptLoop.toEvidencePacket!=='function')return presentWaiting();
    if(!supportSensor||typeof supportSensor.support!=='function')return presentWaiting();

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
