// Visible WHAT probes. Only the currently adopted WHAT Session may submit Attempts.
// The canonical Cycle alone evaluates the Pass Contract and Green Pass.
(function(root){
'use strict';
function text(v){return typeof v==='string'?v.trim():'';}
function panel(doc){
  if(!doc||typeof doc.getElementById!=='function')return null;
  var view=doc.getElementById('experienceView');
  if(!view)return null;
  var el=doc.getElementById('whatAssessmentPanel');
  if(!el){
    el=doc.createElement('section');el.id='whatAssessmentPanel';
    el.className='dependency-head-probe-panel';el.hidden=true;
    el.setAttribute('aria-label','WHAT contextual practice');
    var grid=view.querySelector('.experience-grid');view.insertBefore(el,grid||null);
  }
  return el;
}
function hide(doc){var el=panel(doc);if(!el)return false;el.hidden=true;el.innerHTML='';return true;}
function mount(input){
  input=input||{};
  var doc=input.document||root.document,el=panel(doc);
  if(!el)return false;
  hide(doc);
  var experience=input.experience,language=text(input.language);
  var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
  var catalog=root.SIYAYOVerbExplorerExperienceNavigation;
  var skills=root.SIYAYOVerbExplorerCanonicalSkillSource;
  var source=root.AdaptiveWhatObjectQuestionProbeSpecificationSource;
  var results=root.AdaptiveWhatObjectQuestionProbeResult;
  var evidenceBridge=root.AdaptiveWhatObjectQuestionProbeEvidenceBridge;
  var boundary=root.AdaptiveWhatObjectQuestionProbeAttemptBoundary;
  var events=root.SIYAYOVerbExplorerLearnerEvent;
  if(!experience||!['en','es','pt'].includes(language)||!coordinator||!catalog||!skills||
    !source||!results||!evidenceBridge||!boundary||!events)return false;
  if(typeof coordinator.snapshot!=='function'||typeof coordinator.submitObservedAttempt!=='function'||
    typeof catalog.getExperience!=='function'||typeof source.resolve!=='function')return false;
  var active=coordinator.snapshot(),decision=active&&active.session&&active.session.decision;
  var definition=skills.getDefinition&&skills.getDefinition();
  if(!decision||text(decision.skill)!=='what.use.object-question'||
    text(definition&&definition.id)!==text(decision.skill))return false;
  var origin=catalog.getExperience(text(decision.experienceId));
  if(!origin)return false;
  var to=text(experience.id),from=text(origin.id),transfer=to!==from;
  if(transfer&&text(origin.toroidalNext&&origin.toroidalNext.nextExperience)!==to)return false;
  var next=transfer?experience:catalog.getExperience(text(origin.toroidalNext&&origin.toroidalNext.nextExperience));
  var specs=source.resolve(definition,origin,next,catalog.getNouns&&catalog.getNouns(),language);
  if(!specs)return false;
  var available=transfer?[specs.transferProbe]:[specs.functionProbe,specs.localProbe];
  var copy={en:{heading:'WHAT · CONTEXTUAL PRACTICE',registered:'Response recorded · assessment in progress',retry:'Try another answer',green:'GREEN PASS · WHAT confirmed'},
    es:{heading:'QUÉ · PRÁCTICA CONTEXTUAL',registered:'Respuesta registrada · evaluación en curso',retry:'Prueba otra respuesta',green:'GREEN PASS · QUÉ confirmado'},
    pt:{heading:'O QUE · PRÁTICA CONTEXTUAL',registered:'Resposta registrada · avaliação em andamento',retry:'Tente outra resposta',green:'GREEN PASS · O QUE confirmado'}}[language];
  var title=doc.createElement('h3');title.textContent=copy.heading;el.appendChild(title);
  var feedback=doc.createElement('p');feedback.setAttribute('aria-live','polite');feedback.hidden=true;
  var sensor=Object.freeze({support:function(){return 'none';}});
  available.forEach(function(spec){
    var section=doc.createElement('div');section.className='what-object-question-probe';
    var question=doc.createElement('p');question.textContent=spec.question;section.appendChild(question);
    spec.alternatives.forEach(function(alternative){
      var button=doc.createElement('button');button.type='button';button.textContent=alternative.label;
      button.addEventListener('click',function(){
        var current=coordinator.snapshot();
        if(!current||current.session!==active.session)return;
        var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
        var state=stateBridge&&stateBridge.getState&&stateBridge.getState();
        if(!state||text(state.currentExperienceId)!==spec.experienceId||
          text(state.experienceLanguage)!==spec.language)return;
        var event=events.fromWhatObjectQuestionProbeSelect(alternative.id,{
          skill:spec.skill,dimension:spec.dimension,mode:spec.mode,language:spec.language,
          fromExperienceId:spec.fromExperienceId,currentExperienceId:spec.experienceId
        });
        var evaluated=results.evaluate(spec,event);
        var evidence=evidenceBridge.fromResult({result:evaluated,learnerEvent:event,supportSensor:sensor});
        var attempt=boundary.assemble({learnerEvent:event,evidence:evidence});
        if(!attempt)return;
        var submitted=coordinator.submitObservedAttempt(attempt,event,button);
        if(!submitted)return;
        var closure=submitted.cycleResult&&submitted.cycleResult.contractEvaluation;
        feedback.textContent=closure&&closure.status==='GREEN_PASS'&&closure.satisfied===true
          ?copy.green:evaluated.result==='pass'?copy.registered:copy.retry;
        feedback.hidden=false;
        var trail=root.SIYAYOVerbExplorerLearnerTrailSurface;
        if(trail&&typeof trail.refresh==='function')trail.refresh({document:doc,language:language});
      });
      section.appendChild(button);
    });
    el.appendChild(section);
  });
  el.appendChild(feedback);el.hidden=false;
  return true;
}
root.SIYAYOVerbExplorerWhatAssessmentLive=Object.freeze({mount:mount,hide:hide});
})(typeof globalThis!=='undefined'?globalThis:this);
