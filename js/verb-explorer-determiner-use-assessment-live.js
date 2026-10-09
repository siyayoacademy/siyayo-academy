// Live presentation of the canonical WHICH local and transfer probes.
// Visiting another Experience never starts a Session; only a grounded S1
// Session plus an explicit learner response can submit to the canonical Cycle.
(function(root){
'use strict';
var feedbackMemory=Object.create(null),generation=0;
function id(value){return typeof value==='string'?value.trim():'';}
function isExploringWhich(){
  var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
  return !runtime||typeof runtime.activeQuestionWord!=='function'||runtime.activeQuestionWord()==='which';
}
function panel(doc){
  if(!doc||typeof doc.getElementById!=='function')return null;
  var view=doc.getElementById('experienceView');
  if(!view)return null;
  var el=doc.getElementById('determinerUseAssessmentPanel');
  if(!el){
    el=doc.createElement('section');
    el.id='determinerUseAssessmentPanel';
    el.className='dependency-head-probe-panel';
    el.setAttribute('aria-label','Which determiner practice');
    el.hidden=true;
    el.innerHTML='<h3>WHICH · DETERMINER USE</h3><div id="determinerUseAssessmentOptions"></div><p id="determinerUseAssessmentFeedback" aria-live="polite" hidden></p>';
    var grid=view.querySelector('.experience-grid');
    view.insertBefore(el,grid||null);
  }
  return el;
}
function hide(doc){
  generation+=1;
  var el=panel(doc);
  if(!el)return false;
  el.hidden=true;
  var options=doc.getElementById('determinerUseAssessmentOptions');
  if(options){options.innerHTML='';delete options.__siyayoDeterminerUseProbeBinding;delete options.__siyayoDeterminerUseTransferProbeBinding;}
  var feedback=doc.getElementById('determinerUseAssessmentFeedback');
  if(feedback){feedback.hidden=true;feedback.textContent='';}
  return true;
}
function mount(input){
  input=input||{};
  var doc=input.document||root.document;
  var el=panel(doc);
  if(!el)return false;
  hide(doc);
  if(!isExploringWhich())return false;
  var mountedGeneration=generation;
  var experience=input.experience,language=id(input.language);
  var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
  var skills=root.SIYAYOVerbExplorerCanonicalSkillSource;
  var catalog=root.SIYAYOVerbExplorerExperienceNavigation;
  var loop=root.AdaptiveAttemptLoop;
  if(!experience||!id(experience.id)||!['en','es','pt'].includes(language)||!coordinator||!skills||!catalog||!loop)return false;
  if(typeof coordinator.snapshot!=='function'||typeof coordinator.submitObservedAttempt!=='function')return false;
  if(typeof skills.getDefinition!=='function'||typeof catalog.getExperience!=='function')return false;
  var active=coordinator.snapshot(),decision=active&&active.session&&active.session.decision;
  var feedbackKey=decision&&decision.assessmentScope?decision.assessmentScope.key+'|'+id(experience.id):'';
  var definition=skills.getDefinition();
  if(!decision||id(decision.skill)!=='which.use.determiner'||id(definition&&definition.id)!==id(decision.skill))return false;
  if(decision.assessmentScope&&decision.assessmentScope.language!==language)return false;
  var origin=catalog.getExperience(id(decision.experienceId));
  if(!origin)return false;
  var transfer=id(experience.id)!==id(origin.id);
  if(transfer&&id(origin.toroidalNext&&origin.toroidalNext.nextExperience)!==id(experience.id))return false;
  var prefix=transfer?'AdaptiveDeterminerUseTransferProbe':'AdaptiveDeterminerUseProbe';
  var source=root[prefix+'SpecificationSource'];
  var presenter=root[prefix+'Presenter'];
  var resultApi=root[prefix+'Result'];
  var evidenceBridge=root[prefix+'EvidenceBridge'];
  var attemptBoundary=root[prefix+'AttemptBoundary'];
  var wire=root[transfer?'SIYAYOAdaptiveDeterminerUseTransferProbeBrowserWire':'SIYAYOAdaptiveDeterminerUseProbeBrowserWire'];
  var support=root[transfer?'SIYAYODeterminerUseTransferProbeSupportSensor':'SIYAYODeterminerUseProbeSupportSensor'];
  if(!source||!presenter||!resultApi||!evidenceBridge||!attemptBoundary||!wire||!support)return false;
  if(typeof source.resolve!=='function'||typeof presenter.present!=='function'||typeof loop.toEvidencePacket!=='function')return false;
  var specification=transfer
    ?source.resolve(definition,root.AdaptiveDeterminerUseProbeSpecificationSource.resolve(definition,origin,language,catalog.getNouns&&catalog.getNouns()),experience,catalog.getNouns&&catalog.getNouns(),language)
    :source.resolve(definition,experience,language,catalog.getNouns&&catalog.getNouns());
  var presentation=presenter.present(specification);
  if(!specification||!presentation)return false;
  var container=doc.getElementById('determinerUseAssessmentOptions');
  var feedback=doc.getElementById('determinerUseAssessmentFeedback');
  if(!container||!feedback)return false;
  var installed=wire.install(presentation,{
    container:container,
    onEvent:function(event,target){
      if(mountedGeneration!==generation||el.hidden||!isExploringWhich())return null;
      var now=coordinator.snapshot();
      if(!now||now.session!==active.session)return null;
      var state=root.SIYAYOVerbExplorerAdaptiveStateBridge;
      var observed=state&&state.getState&&state.getState();
      if(!observed||id(observed.currentExperienceId)!==id(experience.id)||
        (decision.assessmentScope&&id(observed.experienceLanguage)!==language))return null;
      var result=resultApi.evaluate(specification,event);
      if(!result)return null;
      var evidence=evidenceBridge.fromResult({
        result:result,learnerEvent:event,supportSensor:support,attemptLoop:loop
      });
      if(!evidence)return null;
      var attempt=attemptBoundary.assemble({learnerEvent:event,evidence:evidence});
      if(!attempt)return null;
      var coordinated=coordinator.submitObservedAttempt(attempt,event,target);
      if(!coordinated)return null;
      var closure=coordinated.cycleResult&&coordinated.cycleResult.contractEvaluation;
      feedback.textContent=closure&&closure.status==='GREEN_PASS'&&closure.satisfied===true
        ?(language==='es'?'GREEN PASS · CUÁL/CUÁLES confirmado':language==='pt'?'GREEN PASS · QUAL confirmado':'GREEN PASS · WHICH confirmed')
        :result.result==='pass'
          ?(language==='es'?'Respuesta registrada · evaluación en curso':language==='pt'?'Resposta registrada · avaliação em andamento':'Response recorded · assessment in progress')
          :(language==='es'?'Prueba otra palabra':language==='pt'?'Tente outra palavra':'Try another word');
      feedback.hidden=false;
      if(feedbackKey)feedbackMemory[feedbackKey]=Object.freeze({text:feedback.textContent});
      var trail=root.SIYAYOVerbExplorerLearnerTrailSurface;
      if(trail&&typeof trail.refresh==='function')trail.refresh({document:doc,language:language});
      var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
      if(runtime&&typeof runtime.refreshAssessmentHighlight==='function')runtime.refreshAssessmentHighlight();
      var adoption=root.SIYAYOVerbExplorerPedagogicalSessionAdoptionSurface;
      if(adoption&&typeof adoption.install==='function')adoption.install({document:doc});
      return coordinated;
    }
  });
  if(installed!==true)return false;
  // Highlight only this owned probe's corpus while WHICH is explored.
  var targetPresentation=root.SIYAYOStudyTargetPresentation;
  var targetQuestion=(experience.thinkingMind||[]).find(function(item){return item.questionWord==='which';});
  var promptNode=typeof container.querySelector==='function'?container.querySelector('.determiner-use-probe-prompt, .determiner-use-transfer-probe-prompt'):null;
  if(targetPresentation&&promptNode)promptNode.innerHTML=targetPresentation.highlight(promptNode.textContent,targetQuestion&&targetQuestion.questionWordLabel&&targetQuestion.questionWordLabel[language]);

  el.hidden=false;
  var title=typeof el.querySelector==='function'?el.querySelector('h3'):null;
  if(title)title.textContent=language==='es'?(transfer?'CUÁLES · USO DEL DETERMINANTE':'CUÁL · USO DEL DETERMINANTE'):language==='pt'?'QUAL · USO DO DETERMINANTE':'WHICH · DETERMINER USE';
  el.dataset.assessmentMode=transfer?'transfer':'local';
  var savedFeedback=feedbackKey&&feedbackMemory[feedbackKey];
  if(savedFeedback){feedback.textContent=savedFeedback.text;feedback.hidden=false;}
  return true;
}
root.SIYAYOVerbExplorerDeterminerUseAssessmentLive=Object.freeze({mount:mount,hide:hide});
})(typeof globalThis!=='undefined'?globalThis:this);

