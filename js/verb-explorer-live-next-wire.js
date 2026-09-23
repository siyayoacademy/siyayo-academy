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

      // Navigation is intentionally independent from Identity, Session,
      // convergence, Pass Contract and Green Pass.
      navigate(toExperienceId);

      return Object.freeze({
        status:'NAVIGATED',
        toExperienceId:toExperienceId
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
