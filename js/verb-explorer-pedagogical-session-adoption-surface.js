// Explicit learner gesture to adopt assessment in an already visited Experience.
(function(root){
'use strict';
function text(v){return typeof v==='string'&&v.trim()?v.trim():null;}
function install(options){
  options=options||{};
  var doc=options.document||root.document;
  if(!doc||typeof doc.getElementById!=='function')return false;
  var view=doc.getElementById('experienceView');
  if(!view)return false;
  var button=doc.getElementById('continueAssessmentHere');
  if(!button){
    button=doc.createElement('button');
    button.id='continueAssessmentHere';
    button.type='button';
    button.className='continue-assessment-here';
    button.textContent='CONTINUE ASSESSMENT HERE';
    button.hidden=true;
    var heading=doc.querySelector('.experience-heading');
    view.insertBefore(button,heading?heading.nextSibling:view.firstChild);
  }
  function eligible(){
    var pendingSource=root.SIYAYOVerbExplorerPendingTransitionAuthority;
    var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
    var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
    var skillSource=root.SIYAYOVerbExplorerCanonicalSkillSource;
    if(!pendingSource||!stateBridge||!coordinator||!skillSource)return null;
    var pending=pendingSource.get&&pendingSource.get();
    var state=stateBridge.getState&&stateBridge.getState();
    var current=coordinator.snapshot&&coordinator.snapshot();
    var skill=skillSource.getSkill&&skillSource.getSkill();
    var contract=skillSource.getPassContract&&skillSource.getPassContract();
    if(!state||!current||!current.session||!current.session.decision||!contract||!skill)return null;
    if(pending&&pending.status==='S2_ACTIVATION_PENDING'&&pending.activationAuthorized===false&&
      text(state.currentExperienceId)===pending.toExperience&&
      text(current.session.decision.experienceId)===pending.fromExperience&&
      skill===text(pending.authorization.nextDecision&&pending.authorization.nextDecision.skill)){
      return {pending:pending,toExperience:pending.toExperience,session:current.session,contract:contract,language:state.experienceLanguage};
    }
    var visited=root.SIYAYOVerbExplorerVisitedSessionAdoptionAuthority;
    var readiness=visited&&typeof visited.inspect==='function'?visited.inspect():null;
    if(!readiness||readiness.session!==current.session||skill!==readiness.skill)return null;
    return {pending:null,toExperience:readiness.toExperience,session:current.session,contract:contract,language:state.experienceLanguage};
  }
  function refresh(){button.hidden=!eligible();return !button.hidden;}
  if(button.__siyayoAssessmentAdoptionInstalled!==true){
    button.addEventListener('click',function(){
      var ready=eligible();
      if(!ready){refresh();return;}
      var adoption=root.SIYAYOVerbExplorerPedagogicalSessionAdoption;
      if(!adoption||typeof adoption.activate!=='function')return;
      var learnerEvent=Object.freeze({
        observed:true,actor:'learner',intent:'continue-assessment',
        source:'pedagogical-session-adopt',experienceId:ready.toExperience,
        occurrenceId:ready.pending?ready.pending.occurrenceId:'pedagogical-session-adopt:'+Date.now()
      });
      var authority=root.SIYAYOVerbExplorerVisitedSessionAdoptionAuthority;
      var authorization=ready.pending?ready.pending.authorization:
        authority&&typeof authority.authorize==='function'?authority.authorize(learnerEvent):null;
      if(!authorization)return;
      var result=adoption.activate({
        transitionAuthorization:authorization,
        previousSession:ready.session,
        passContract:ready.contract,
        language:ready.language,
        document:doc,
        learnerEvent:learnerEvent
      });
      if(result&&result.status==='S2_ACTIVE'&&ready.pending){
        root.SIYAYOVerbExplorerPendingTransitionAuthority.clear(ready.pending.occurrenceId);
      }
      refresh();
    });
    button.__siyayoAssessmentAdoptionInstalled=true;
  }
  refresh();
  return true;
}
root.SIYAYOVerbExplorerPedagogicalSessionAdoptionSurface=Object.freeze({install:install});
})(typeof globalThis!=='undefined'?globalThis:this);
