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
    if(!pending||pending.status!=='S2_ACTIVATION_PENDING'||pending.activationAuthorized!==false)return null;
    if(!state||text(state.currentExperienceId)!==pending.toExperience)return null;
    if(!current||!current.session||!current.session.decision||text(current.session.decision.experienceId)!==pending.fromExperience)return null;
    if(!contract||!skill||skill!==text(pending.authorization.nextDecision&&pending.authorization.nextDecision.skill))return null;
    return {pending:pending,session:current.session,contract:contract,language:state.experienceLanguage};
  }
  function refresh(){button.hidden=!eligible();return !button.hidden;}
  if(button.__siyayoAssessmentAdoptionInstalled!==true){
    button.addEventListener('click',function(){
      var ready=eligible();
      if(!ready){refresh();return;}
      var adoption=root.SIYAYOVerbExplorerPedagogicalSessionAdoption;
      if(!adoption||typeof adoption.activate!=='function')return;
      var result=adoption.activate({
        transitionAuthorization:ready.pending.authorization,
        previousSession:ready.session,
        passContract:ready.contract,
        language:ready.language,
        document:doc,
        learnerEvent:Object.freeze({
          observed:true,actor:'learner',intent:'continue-assessment',
          source:'pedagogical-session-adopt',
          experienceId:ready.pending.toExperience,
          occurrenceId:ready.pending.occurrenceId
        })
      });
      if(result&&result.status==='S2_ACTIVE'){
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
