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
    el.className='what-canonical-panel';el.hidden=true;
    el.setAttribute('aria-label','WHAT contextual practice');
    var window=view.querySelector('.living-window');
    if(window)window.insertBefore(el,doc.getElementById('choiceResolverPanel'));
    else {var grid=view.querySelector('.experience-grid');view.insertBefore(el,grid||null);}
  }
  return el;
}
function hide(doc){var el=panel(doc);if(!el)return false;el.hidden=true;el.innerHTML='';delete el.dataset.canonicalQuestion;return true;}
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
  var guidance={
    en:{function:'1 · Choose the question word',local:'2 · Choose what we are preparing',transfer:'3 · Apply WHAT at the dinner table'},
    es:{function:'1 · Elige la palabra interrogativa',local:'2 · Elige qué estamos preparando',transfer:'3 · Aplica QUÉ en la mesa'},
    pt:{function:'1 · Escolha a palavra interrogativa',local:'2 · Escolha o que estamos preparando',transfer:'3 · Aplique O QUE à mesa'}
  }[language];
  if(from==='shopping-for-dinner'){
    guidance={
      en:{function:'1 · Choose the question word',local:'2 · Choose what we are going to cook',transfer:'3 · Apply WHAT in the kitchen'},
      es:{function:'1 · Elige la palabra interrogativa',local:'2 · Elige qué vamos a cocinar',transfer:'3 · Aplica QUÉ en la cocina'},
      pt:{function:'1 · Escolha a palavra interrogativa',local:'2 · Escolha o que vamos cozinhar',transfer:'3 · Aplique O QUE na cozinha'}
    }[language];
  }
  var title=doc.createElement('h3');title.textContent=copy.heading;el.appendChild(title);
  var feedback=doc.createElement('p');feedback.setAttribute('aria-live','polite');feedback.hidden=true;
  var sensor=Object.freeze({support:function(){return 'none';}});
  available.forEach(function(spec){
    var section=doc.createElement('div');section.className='what-object-question-probe';section.dataset.dimension=spec.dimension;
    var label=doc.createElement('h4');label.className='what-probe-step';
    label.textContent=transfer?guidance.transfer:spec.dimension==='question-function'?guidance.function:guidance.local;
    section.appendChild(label);
    var question=doc.createElement('p');question.className='what-probe-question';question.textContent=spec.question;section.appendChild(question);
    var options=doc.createElement('div');options.className='what-probe-options';
    if(spec.dimension==='object-answer')options.className+=' what-canonical-options';
    var buttons=[];
    spec.alternatives.forEach(function(alternative){
      var button=doc.createElement('button');button.type='button';button.className='what-probe-option';button.textContent=alternative.response||alternative.label;
      if(alternative.response)button.setAttribute('aria-label',alternative.response);
      buttons.push(button);
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
        buttons.forEach(function(option){option.setAttribute('aria-pressed',String(option===button));});
        var closure=submitted.cycleResult&&submitted.cycleResult.contractEvaluation;
        feedback.textContent=closure&&closure.status==='GREEN_PASS'&&closure.satisfied===true
          ?copy.green:evaluated.result==='pass'?copy.registered:copy.retry;
        feedback.hidden=false;
        var trail=root.SIYAYOVerbExplorerLearnerTrailSurface;
        if(trail&&typeof trail.refresh==='function')trail.refresh({document:doc,language:language});
        // A transfer may complete the origin Session after arrival in S3.
        // Recheck the learner-owned adoption invitation after the canonical Cycle returns.
        var adoption=root.SIYAYOVerbExplorerPedagogicalSessionAdoptionSurface;
        if(adoption&&typeof adoption.install==='function')adoption.install({document:doc});
      });
      options.appendChild(button);
    });
    section.appendChild(options);
    // Presentation pages keep every canonical candidate available; turning a page is not an Attempt.
    if(spec.dimension==='object-answer'&&buttons.length>2){
      var page=0,size=2,total=Math.ceil(buttons.length/size);
      var controls=doc.createElement('div');controls.className='what-answer-pages';
      var previous=doc.createElement('button'),nextPage=doc.createElement('button'),count=doc.createElement('span');
      previous.type=nextPage.type='button';previous.textContent='‹';nextPage.textContent='›';
      var labels={en:['Previous responses','Next responses'],es:['Respuestas anteriores','Siguientes respuestas'],pt:['Respostas anteriores','Próximas respostas']}[language];
      previous.setAttribute('aria-label',labels[0]);nextPage.setAttribute('aria-label',labels[1]);
      count.setAttribute('aria-live','polite');
      function showPage(){
        buttons.forEach(function(button,index){button.hidden=Math.floor(index/size)!==page;});
        count.textContent=(page*size+1)+'–'+Math.min((page+1)*size,buttons.length)+' / '+buttons.length;
        previous.disabled=page===0;nextPage.disabled=page===total-1;
      }
      previous.addEventListener('click',function(){if(page>0){page--;showPage();}});
      nextPage.addEventListener('click',function(){if(page<total-1){page++;showPage();}});
      controls.appendChild(previous);controls.appendChild(count);controls.appendChild(nextPage);
      section.appendChild(controls);showPage();
    }
    el.appendChild(section);
  });
  el.dataset.canonicalQuestion=(available.find(function(spec){return spec.dimension==='object-answer';})||{}).question||'';
  el.appendChild(feedback);el.hidden=false;
  return true;
}
root.SIYAYOVerbExplorerWhatAssessmentLive=Object.freeze({mount:mount,hide:hide});
})(typeof globalThis!=='undefined'?globalThis:this);

