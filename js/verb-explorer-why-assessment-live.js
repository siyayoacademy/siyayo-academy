// Visible WHY probes. Only the currently adopted WHY Session may submit Attempts.
// The canonical Cycle alone evaluates the Pass Contract and Green Pass.
(function(root){
'use strict';
var feedbackMemory=Object.create(null),generation=0;
function text(v){return typeof v==='string'?v.trim():'';}
function isExploringWhy(){
  var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
  return !runtime||typeof runtime.activeQuestionWord!=='function'||runtime.activeQuestionWord()==='why';
}
function panel(doc){
  if(!doc||typeof doc.getElementById!=='function')return null;
  var view=doc.getElementById('experienceView');
  if(!view)return null;
  var el=doc.getElementById('whyAssessmentPanel');
  if(!el){
    el=doc.createElement('section');el.id='whyAssessmentPanel';
    el.className='dependency-head-probe-panel';el.hidden=true;
    el.setAttribute('aria-label','WHY contextual practice');
    var living=view.querySelector('.living-window');
    if(living)living.insertBefore(el,doc.getElementById('choiceResolverPanel'));
    else {var grid=view.querySelector('.experience-grid');view.insertBefore(el,grid||null);}
  }
  return el;
}
function hide(doc){generation+=1;var el=panel(doc);if(!el)return false;el.hidden=true;el.innerHTML='';return true;}
// HOW TO SHOW 89U: speech is presentation-only. It cannot submit an Attempt.
function speakOnly(spec,language,doc,ownerGeneration,host){
  if(ownerGeneration!==generation||host.hidden||!isExploringWhy())return false;
  var state=root.SIYAYOVerbExplorerAdaptiveStateBridge?.getState?.();
  if(!state||text(state.currentExperienceId)!==text(spec.experienceId)||
    text(state.experienceLanguage)!==language)return false;
  var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
  if(!runtime||typeof runtime.speak!=='function')return false;
  return runtime;
}
function mount(input){
  input=input||{};
  var doc=input.document||root.document,el=panel(doc);
  if(!el)return false;
  hide(doc);
  if(!isExploringWhy())return false;
  var mountedGeneration=generation;
  var experience=input.experience,language=text(input.language);
  var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
  var catalog=root.SIYAYOVerbExplorerExperienceNavigation;
  var skills=root.SIYAYOVerbExplorerCanonicalSkillSource;
  var source=root.AdaptiveWhyContextualReasonProbeSpecificationSource;
  var results=root.AdaptiveWhyContextualReasonProbeResult;
  var evidenceBridge=root.AdaptiveWhyContextualReasonProbeEvidenceBridge;
  var boundary=root.AdaptiveWhyContextualReasonProbeAttemptBoundary;
  var events=root.SIYAYOVerbExplorerLearnerEvent;
  if(!experience||!['en','es','pt'].includes(language)||!coordinator||!catalog||!skills||
    !source||!results||!evidenceBridge||!boundary||!events)return false;
  if(typeof coordinator.snapshot!=='function'||typeof coordinator.submitObservedAttempt!=='function'||
    typeof catalog.getExperience!=='function'||typeof source.resolve!=='function')return false;
  var active=coordinator.snapshot(),decision=active&&active.session&&active.session.decision;
  var feedbackKey=decision&&decision.assessmentScope?decision.assessmentScope.key+'|'+text(experience.id):'';
  var definition=skills.getDefinition&&skills.getDefinition();
  if(!decision||text(decision.skill)!=='why.use.contextual-reason'||
    text(definition&&definition.id)!==text(decision.skill))return false;
  if(decision.assessmentScope&&decision.assessmentScope.language!==language)return false;
  var origin=catalog.getExperience(text(decision.experienceId));
  if(!origin)return false;
  var to=text(experience.id),from=text(origin.id),transfer=to!==from;
  if(transfer&&text(origin.toroidalNext&&origin.toroidalNext.nextExperience)!==to)return false;
  var next=transfer?experience:catalog.getExperience(text(origin.toroidalNext&&origin.toroidalNext.nextExperience));
  var specs=source.resolve(definition,origin,next,language);
  if(!specs)return false;
  var available=transfer?[specs.transferProbe]:[specs.functionProbe,specs.localProbe];
  var copy={en:{heading:'WHY · CONTEXTUAL PRACTICE',registered:'Response recorded · assessment in progress',retry:'Try another answer',green:'GREEN PASS · WHY confirmed'},
    es:{heading:'POR QUÉ · PRÁCTICA CONTEXTUAL',registered:'Respuesta registrada · evaluación en curso',retry:'Prueba otra respuesta',green:'GREEN PASS · POR QUÉ confirmado'},
    pt:{heading:'POR QUÊ · PRÁTICA CONTEXTUAL',registered:'Resposta registrada · avaliação em andamento',retry:'Tente outra resposta',green:'GREEN PASS · POR QUÊ confirmado'}}[language];
  var guidance={
    en:{function:'1 · Choose the question word',local:'2 · Choose why we are preparing',transfer:'3 · Apply WHY after dinner'},
    es:{function:'1 · Elige la palabra interrogativa',local:'2 · Elige por qué preparamos la cena',transfer:'3 · Aplica POR QUÉ después de cenar'},
    pt:{function:'1 · Escolha a palavra interrogativa',local:'2 · Escolha por que preparamos o jantar',transfer:'3 · Aplique POR QUÊ após o jantar'}
  }[language];
  var title=doc.createElement('h3');title.textContent=copy.heading;el.appendChild(title);
  var feedback=doc.createElement('p');feedback.setAttribute('aria-live','polite');feedback.hidden=true;
  var sensor=Object.freeze({support:function(){return 'none';}});
  // Read-only canonical projection, shared with Learning Trail / Word Path.
  var progressCopy={
    en:['FUNCTION','LOCAL ANSWER','TRANSFER'],
    es:['FUNCIÓN','RESPUESTA LOCAL','TRANSFERENCIA'],
    pt:['FUNÇÃO','RESPOSTA LOCAL','TRANSFERÊNCIA']
  }[language];
  var progressLine=doc.createElement('p');
  progressLine.className='why-contract-progress';
  progressLine.setAttribute('aria-live','polite');
  function showCanonicalProgress(){
    var latest=coordinator.snapshot();
    var view=root.AdaptivePassContractProgressView;
    var context=latest&&latest.session===active.session?latest.context:null;
    var projection=context&&view?.project?.(context.passContract,context.evidencePackets,root.GreenPassProfile);
    if(!projection||projection.total!==3||!Array.isArray(projection.satisfied)){
      progressLine.hidden=true;return;
    }
    progressLine.hidden=false;
    progressLine.replaceChildren();
    var steps=doc.createElement('span');steps.className='why-contract-progress-steps';
    progressCopy.forEach(function(label,i){
      var chip=doc.createElement('span');chip.className='why-contract-progress-step';
      chip.textContent=label+' '+(projection.satisfied[i]?'●':'○');
      steps.appendChild(chip);
    });
    var count=doc.createElement('strong');count.className='why-contract-progress-count';
    count.textContent=projection.completed+'/'+projection.total;
    progressLine.appendChild(steps);progressLine.appendChild(count);
  }
  available.forEach(function(spec){
    var section=doc.createElement('div');section.className='why-contextual-reason-probe';
    var label=doc.createElement('h4');label.className='why-probe-step';
    label.textContent=transfer?guidance.transfer:spec.dimension==='question-function'?guidance.function:guidance.local;
    section.appendChild(label);
    var question=doc.createElement('button');question.type='button';
    question.className='why-probe-question why-probe-question-card';
    var questionSpeaker=doc.createElement('span');questionSpeaker.className='siyayo-speaker';
    questionSpeaker.setAttribute('aria-hidden','true');
    var questionText=doc.createElement('span');questionText.className='why-probe-question-text';
    questionText.textContent=spec.question;
    question.appendChild(questionSpeaker);question.appendChild(questionText);
    question.setAttribute('aria-label',({
      en:'Listen to question: ',es:'Escuchar pregunta: ',pt:'Ouvir pergunta: '
    }[language])+spec.question);
    question.addEventListener('click',function(){
      var runtime=speakOnly(spec,language,doc,mountedGeneration,el);
      if(runtime)runtime.speak(spec.question,language);
    });
    var targetQuestion=(experience.thinkingMind||[]).find(function(item){return item.questionWord==='why';});
    var targetPresentation=root.SIYAYOStudyTargetPresentation;
    if(spec.dimension==='reason-answer'&&targetPresentation)questionText.innerHTML=targetPresentation.highlight(spec.question,targetQuestion&&targetQuestion.questionWordLabel&&targetQuestion.questionWordLabel[language]);
    section.appendChild(question);
    var options=doc.createElement('div');options.className='why-probe-options';
    spec.alternatives.forEach(function(alternative,alternativeIndex){
      var button=doc.createElement('button');button.type='button';button.className='why-probe-option';
      button.textContent=alternative.label;button.dataset.whySlot=String(alternativeIndex+1);
      button.setAttribute('aria-pressed','false');
      button.addEventListener('click',function(){
        if(mountedGeneration!==generation||el.hidden||!isExploringWhy())return;
        var current=coordinator.snapshot();
        if(!current||current.session!==active.session)return;
        var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
        var state=stateBridge&&stateBridge.getState&&stateBridge.getState();
        if(!state||text(state.currentExperienceId)!==spec.experienceId||
          text(state.experienceLanguage)!==spec.language)return;
        var event=events.fromWhyContextualReasonProbeSelect(alternative.id,{
          skill:spec.skill,dimension:spec.dimension,mode:spec.mode,language:spec.language,
          fromExperienceId:spec.fromExperienceId,currentExperienceId:spec.experienceId
        });
        var evaluated=results.evaluate(spec,event);
        var evidence=evidenceBridge.fromResult({result:evaluated,learnerEvent:event,supportSensor:sensor});
        var attempt=boundary.assemble({learnerEvent:event,evidence:evidence});
        if(!attempt)return;
        var submitted=coordinator.submitObservedAttempt(attempt,event,button);
        if(!submitted)return;
        root.SIYAYOPatitaInteractionTrail?.recordOutcome?.({source:'canonical-probe',phase:'assessment-attempt',selected:alternative.id,experienceId:spec.experienceId,language:spec.language,questionWord:'why',resultCode:evaluated.result,dimension:spec.dimension,mode:spec.mode,skill:spec.skill});
        if(typeof options.querySelectorAll==='function'){
          Array.prototype.forEach.call(options.querySelectorAll('.why-probe-option'),function(item){
            item.setAttribute('aria-pressed',String(item===button&&evaluated.result==='pass'));
          });
        }
        showCanonicalProgress();
        var closure=submitted.cycleResult&&submitted.cycleResult.contractEvaluation;
        feedback.textContent=closure&&closure.status==='GREEN_PASS'&&closure.satisfied===true
          ?copy.green:evaluated.result==='pass'?copy.registered:copy.retry;
        feedback.hidden=false;
        if(feedbackKey)feedbackMemory[feedbackKey]=Object.freeze({text:feedback.textContent});
        var trail=root.SIYAYOVerbExplorerLearnerTrailSurface;
        if(trail&&typeof trail.refresh==='function')trail.refresh({document:doc,language:language});
        var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
        if(runtime&&typeof runtime.refreshAssessmentHighlight==='function')runtime.refreshAssessmentHighlight();
      });
      // A single speaker/response card per answer; audio remains observational.
      var audio=doc.createElement('button');audio.type='button';
      audio.className='why-probe-audio';audio.dataset.whySlot=String(alternativeIndex+1);
      audio.setAttribute('aria-label',({
        en:'Listen to response: ',es:'Escuchar respuesta: ',pt:'Ouvir resposta: '
      }[language])+alternative.label);
      var icon=doc.createElement('span');icon.className='siyayo-speaker';
      icon.setAttribute('aria-hidden','true');audio.appendChild(icon);
      audio.addEventListener('click',function(){
        var runtime=speakOnly(spec,language,doc,mountedGeneration,el);
        if(runtime)runtime.speak(alternative.label,language);
      });
      var answerRow=doc.createElement('div');answerRow.className='why-probe-response-row';
      answerRow.appendChild(audio);answerRow.appendChild(button);
      options.appendChild(answerRow);
    });
    section.appendChild(options);
    el.appendChild(section);
  });
  el.appendChild(progressLine);
  el.appendChild(feedback);
  showCanonicalProgress();
  var savedFeedback=feedbackKey&&feedbackMemory[feedbackKey];
  var progressView=root.AdaptivePassContractProgressView;
  var progress=active.context&&progressView&&progressView.project(active.context.passContract,active.context.evidencePackets,root.GreenPassProfile);
  if(progress&&progress.status==='GREEN_PASS'){feedback.textContent=copy.green;feedback.hidden=false;}
  else if(savedFeedback){feedback.textContent=savedFeedback.text;feedback.hidden=false;}
  el.hidden=false;
  return true;
}
root.SIYAYOVerbExplorerWhyAssessmentLive=Object.freeze({mount:mount,hide:hide});
})(typeof globalThis!=='undefined'?globalThis:this);

