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
    var scope=current.session.decision.assessmentScope;
    if(scope&&scope.language!==state.experienceLanguage)return null;
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
  var note=doc.getElementById('assessmentAdoptionStatus');
  if(!note){
    note=doc.createElement('p');
    note.id='assessmentAdoptionStatus';
    note.className='assessment-adoption-status';
    note.setAttribute('aria-live','polite');
    note.hidden=true;
    view.insertBefore(note,button);
  }
  function refresh(){
    var ready=eligible();
    var bridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
    var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
    var state=bridge&&bridge.getState&&bridge.getState();
    var snapshot=coordinator&&coordinator.snapshot&&coordinator.snapshot();
    var origin=text(snapshot&&snapshot.session&&snapshot.session.decision&&snapshot.session.decision.experienceId);
    var destination=text(state&&state.currentExperienceId);
    var level=origin==='shopping-for-dinner'&&destination==='preparing-dinner'?'S1':
      origin==='preparing-dinner'&&destination==='having-dinner'?'S2':null;
    var visited=!!level;
    var language=text(state&&state.experienceLanguage)||'en';
    var labels={
      en:{button:'START MY PROGRESS HERE',ready:'S1 ● completed → S2 ○ free exploration. Choose when to start a new assessment here.',visiting:'S2 ○ free exploration. Visiting does not start a new assessment.'},
      es:{button:'COMENZAR MI PROGRESO AQUÍ',ready:'S1 ● completada → S2 ○ exploración libre. Tú eliges cuándo iniciar una nueva evaluación aquí.',visiting:'S2 ○ exploración libre. Visitar no inicia una nueva evaluación.'},
      pt:{button:'COMEÇAR MEU PROGRESSO AQUI',ready:'S1 ● concluída → S2 ○ exploração livre. Você escolhe quando iniciar uma nova avaliação aqui.',visiting:'S2 ○ exploração livre. A visita não inicia uma nova avaliação.'}
    }[language]||{button:'START MY PROGRESS HERE',ready:'S1 ● completed → S2 ○ free exploration. Choose when to start a new assessment here.',visiting:'S2 ○ free exploration. Visiting does not start a new assessment.'};
    if(level==='S2'){
      labels.ready=labels.ready.replace('S1','S2').replace('S2 ○','S3 ○');
      labels.visiting=labels.visiting.replace('S2 ○','S3 ○');
    }
    button.textContent=labels.button;
    var preceding=level==="S1"?doc.getElementById("determinerUseAssessmentPanel"):
      level==="S2"?doc.getElementById("whatAssessmentPanel"):null;
    if(preceding&&preceding.parentNode===view){
      view.insertBefore(note,preceding.nextSibling);
      view.insertBefore(button,note.nextSibling);
    }
    button.hidden=!ready;
    note.hidden=!visited;
    note.textContent=visited?(ready?labels.ready:labels.visiting):'';
    return !button.hidden;
  }
  if(button.__siyayoAssessmentAdoptionInstalled!==true){
    button.addEventListener('click',function(){
      if(button.__siyayoAssessmentAdoptionBusy===true)return;
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
      var target=root.SIYAYOVerbExplorerNextAssessmentTarget;
      if(!target||typeof target.prepare!=='function')return;
      button.__siyayoAssessmentAdoptionBusy=true;
      var preparedTarget=null;
      Promise.resolve().then(function(){return target.prepare({authorization:authorization,previousSession:ready.session,
        language:ready.language,learnerEvent:learnerEvent});}).then(function(prepared){
        if(!prepared)return;
        preparedTarget=prepared;
        var state=root.SIYAYOVerbExplorerAdaptiveStateBridge.getState();
        var current=root.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot();
        if(!current||current.session!==ready.session||
          text(state&&state.currentExperienceId)!==ready.toExperience||
          (root.AdaptiveAssessmentScope&&text(state&&state.experienceLanguage)!==ready.language)){
          root.SIYAYOVerbExplorerCanonicalSkillSource.adopt(prepared.previousDefinition);
          return;
        }
        var result=adoption.activate({
          transitionAuthorization:prepared.authorization,
          previousSession:ready.session,
          previousDefinition:prepared.previousDefinition,
          passContract:prepared.passContract,
          language:ready.language,document:doc,learnerEvent:learnerEvent
        });
        var skills=root.SIYAYOVerbExplorerCanonicalSkillSource;
        if(!result||result.status!==(ready.toExperience==='having-dinner'?'S3_ACTIVE':'S2_ACTIVE')||result.skill!==prepared.target.skill){
          if(skills&&typeof skills.adopt==='function')skills.adopt(prepared.previousDefinition);
          return;
        }
        if(ready.pending)root.SIYAYOVerbExplorerPendingTransitionAuthority.clear(ready.pending.occurrenceId);
        var transferPanel=root.SIYAYOVerbExplorerDeterminerUseAssessmentLive;
        if(transferPanel&&typeof transferPanel.hide==='function')transferPanel.hide(doc);
        var catalog=root.SIYAYOVerbExplorerExperienceNavigation;
        var what=root.SIYAYOVerbExplorerWhatAssessmentLive;
        var why=root.SIYAYOVerbExplorerWhyAssessmentLive;
        var experience=catalog&&catalog.getExperience&&catalog.getExperience(result.experienceId);
        if(result.skill==='why.use.contextual-reason'&&what&&typeof what.hide==='function')what.hide(doc);
        var live=result.skill==='why.use.contextual-reason'?why:what;
        if(live&&experience&&typeof live.mount==='function')live.mount({document:doc,experience:experience,language:ready.language});
        var trail=root.SIYAYOVerbExplorerLearnerTrailSurface;
        if(trail&&typeof trail.refresh==='function')trail.refresh({document:doc,language:ready.language});
        var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
        if(runtime&&typeof runtime.refreshAssessmentHighlight==='function')runtime.refreshAssessmentHighlight();
      }).catch(function(){
        var skills=root.SIYAYOVerbExplorerCanonicalSkillSource;
        if(preparedTarget&&skills&&typeof skills.adopt==='function')skills.adopt(preparedTarget.previousDefinition);
      }).finally(function(){button.__siyayoAssessmentAdoptionBusy=false;refresh();});
    });
    button.__siyayoAssessmentAdoptionInstalled=true;
  }
  refresh();
  return true;
}
root.SIYAYOVerbExplorerPedagogicalSessionAdoptionSurface=Object.freeze({install:install});
})(typeof globalThis!=='undefined'?globalThis:this);
