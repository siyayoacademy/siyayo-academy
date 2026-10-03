// Live learner-owned NEXT navigation boundary for Verb Explorer.
// Canonical content navigation is learner-owned and must never be gated by
// pedagogical progression, Green Pass, identity, Session, or Coordinator state.
// Adaptive authorities may observe/evaluate learning separately; they do not own access.
(function(root){
  'use strict';

  var installed=false;

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function install(options){
    options=options||{};
    if(installed)return false;

    var doc=options.document||root.document;
    if(!doc||typeof doc.getElementById!=='function')return false;

    var nextElement=doc.getElementById('nextExperience');
    if(!nextElement)return false;
    var nextCard=typeof nextElement.closest==='function'
      ? nextElement.closest('.toroidal-next')
      : null;
    var interactiveTarget=nextCard||nextElement;

    function activate(){
      var toExperienceId=text(nextElement&&nextElement.dataset?nextElement.dataset.nextExperience:null);
      if(!toExperienceId)return null;

      var navigation=options.navigation||root.SIYAYOVerbExplorerExperienceNavigation;
      var navigate=options.goToExperience||(navigation&&navigation.goToExperience);
      if(typeof navigate!=='function')return null;

      // Observation is parallel and advisory. It must never gate learner-owned navigation.
      var fromExperienceId=null;
      var resumeRuntime=root.SIYAYOVerbExplorerResumeRuntime;
      if(resumeRuntime&&typeof resumeRuntime.captureContext==='function'){
        var before=resumeRuntime.captureContext();
        fromExperienceId=text(before&&before.currentExperienceId);
      }
      var learnerEvent=Object.freeze({
        observed:true,
        actor:'learner',
        relevantToProgression:true,
        intent:'advance',
        source:'toroidal-next-select',
        occurrenceId:'toroidal-next-select:'+Date.now(),
        fromExperienceId:fromExperienceId||null,
        toExperienceId:toExperienceId
      });
      var observe=options.onObserved||root.SIYAYOVerbExplorerToroidalNextObserver;
      if(typeof observe==='function'){
        try{observe(learnerEvent);}catch(_error){}
      }

      // Navigation remains intentionally independent from adaptive authorities.
      navigate(toExperienceId);
      var adoptionSurface=root.SIYAYOVerbExplorerPedagogicalSessionAdoptionSurface;
      if(adoptionSurface&&typeof adoptionSurface.install==='function'){
        try{adoptionSurface.install({document:doc});}catch(_error){}
      }

      return Object.freeze({
        status:'NAVIGATED',
        toExperienceId:toExperienceId,
        learnerEvent:learnerEvent
      });
    }

    interactiveTarget.onclick=activate;
    interactiveTarget.onkeydown=function(event){
      if(!event||!(event.key==='Enter'||event.key===' '))return;
      if(typeof event.preventDefault==='function')event.preventDefault();
      activate();
    };

    if(nextCard){
      nextCard.tabIndex=0;
      nextCard.setAttribute('role','button');
      nextCard.setAttribute('aria-label','Continue to the next Experience');
      nextCard.dataset.nextState='available';
      nextCard.classList.remove('next-gated');
    }

    installed=true;
    return true;
  }

  root.SIYAYOVerbExplorerLiveNextWire=Object.freeze({install:install});
})(typeof globalThis!=='undefined'?globalThis:this);
