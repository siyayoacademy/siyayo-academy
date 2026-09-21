// Human Semantic Surface Lab fixture only.
// After an explicit Assessment Leaf Select has grounded one adaptive Session,
// project that Session into canonical Choice alternatives for human response.
// This wrapper projects the authorized Choice, grounds the observed learner event,
// renders semantic resolution, and hands that same event to the configured Coordinator.
// It does not call the Cycle/Green Pass directly, authorize progression, or infer Skill/Experience.
(function(root){
'use strict';

var original=root.SIYAYOStoryAssessmentLeafSelection;
var catalogPromise=null;
var lastObservedEvent=null;
var lastCycleResult=null;

function text(value){
  return typeof value==='string'?value.trim():'';
}

function escapeHtml(value){
  return String(value==null?'':value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function catalog(){
  if(catalogPromise)return catalogPromise;
  if(typeof root.fetch!=='function')return Promise.resolve(null);
  catalogPromise=root.fetch('/data/learning/experience-seeds.json')
    .then(function(response){
      if(!response||response.ok!==true||typeof response.json!=='function')return null;
      return response.json();
    })
    .then(function(data){
      return data&&Array.isArray(data.items)?data.items:null;
    })
    .catch(function(){return null;});
  return catalogPromise;
}

function renderAlternative(alternative){
  if(!alternative||!text(alternative.id)||!alternative.response)return '';
  return [
    '<button class="human-lab-adaptive-choice" type="button" data-choice-select="',
    escapeHtml(alternative.id),
    '">',
    '<span class="human-lab-choice-line human-lab-choice-line-en">',
    '<span class="human-lab-choice-lang-code">EN</span>',
    '<span class="human-lab-choice-copy">',escapeHtml(alternative.response.en||''),'</span>',
    '</span>',
    '<span class="human-lab-choice-line human-lab-choice-line-es">',
    '<span class="human-lab-choice-lang-code">ES</span>',
    '<span class="human-lab-choice-copy">',escapeHtml(alternative.response.es||''),'</span>',
    '</span>',
    '<span class="human-lab-choice-line human-lab-choice-line-pt">',
    '<span class="human-lab-choice-lang-code">PT</span>',
    '<span class="human-lab-choice-copy">',escapeHtml(alternative.response.pt||''),'</span>',
    '</span>',
    '</button>'
  ].join('');
}

function mount(slide){
  var leaf=slide&&slide.assessmentLeaf;
  var anchorSurfaceId=text(leaf&&leaf.anchorSurfaceId);
  if(!anchorSurfaceId||!root.document||typeof root.document.querySelector!=='function')return Promise.resolve(false);

  var existing=root.document.querySelector(
    '[data-human-lab-adaptive-choice-for="'+anchorSurfaceId.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"]'
  );
  if(existing)return Promise.resolve(true);

  var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
  var skillSource=root.SIYAYOVerbExplorerCanonicalSkillSource;
  var contextSource=root.AdaptiveChoiceContextSource;
  var presenter=root.AdaptiveChoicePresenter;

  if(!coordinator||typeof coordinator.snapshot!=='function')return Promise.resolve(false);
  if(!skillSource||typeof skillSource.getDefinition!=='function')return Promise.resolve(false);
  if(!contextSource||typeof contextSource.resolve!=='function')return Promise.resolve(false);
  if(!presenter||typeof presenter.present!=='function')return Promise.resolve(false);

  var active=coordinator.snapshot();
  var definition=skillSource.getDefinition();
  if(!active||!active.session||!definition)return Promise.resolve(false);

  return catalog().then(function(experiences){
    if(!experiences)return false;
    var resolved=contextSource.resolve(active.session,definition,experiences);
    var presentation=presenter.present(resolved);
    if(!presentation||!Array.isArray(presentation.alternatives)||!presentation.alternatives.length)return false;

    var actionChoice=root.document.querySelector(
      '[data-action-choice-for="'+anchorSurfaceId.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"]'
    );
    if(!actionChoice||typeof actionChoice.insertAdjacentHTML!=='function')return false;

    var alternatives=presentation.alternatives.map(renderAlternative).join('');
    if(!alternatives)return false;

    var browserWire=root.SIYAYOAdaptiveChoiceBrowserWire;
    var learnerEvents=root.SIYAYOVerbExplorerLearnerEvent;
    if(!browserWire||typeof browserWire.install!=='function')return false;
    if(!learnerEvents||typeof learnerEvents.fromChoiceSelect!=='function')return false;

    actionChoice.insertAdjacentHTML('afterend',[
      '<section class="human-lab-adaptive-choice-surface" ',
      'data-human-lab-adaptive-choice-for="',escapeHtml(anchorSurfaceId),'" ',
      'aria-label="Adaptive choice">',
      '<div class="human-lab-adaptive-choice-options">',
      alternatives,
      '</div>',
      '<div id="choiceFeedback" class="choice-feedback" aria-live="polite"></div>',
      '</section>'
    ].join(''));

    var installed=browserWire.install(presentation,{
      document:root.document,
      learnerEvents:learnerEvents,
      onEvent:function(event,target){
        var runtime=root.SIYAYOVerbExplorerResumeRuntime;
        if(!runtime||typeof runtime.observeChoice!=='function')return;
        if(runtime.observeChoice(event)!==true)return;

        var resolutionPresenter=root.AdaptiveChoiceResolutionPresenter;
        var resolver=root.SIYAYOChoiceResolver;
        var feedback=root.document&&typeof root.document.getElementById==='function'
          ? root.document.getElementById('choiceFeedback')
          : null;

        if(!resolutionPresenter||typeof resolutionPresenter.present!=='function')return;
        if(!resolver||typeof resolver.resolveChoice!=='function')return;
        if(!feedback)return;

        var resolution=resolutionPresenter.present(
          resolved.choiceContext,
          event.choice,
          'en',
          resolver
        );
        if(!resolution)return;

        var score=Number(resolution.contextualResponse.score);
        var possibleScore=Number(resolution.contextualResponse.possibleScore);
        var ratio=possibleScore>0?Math.max(0,Math.min(1,score/possibleScore)):0;
        var scoreAngle=Math.round(ratio*360);

        feedback.innerHTML=[
          '<section class="semantic-feedback-shell" aria-label="Semantic feedback">',
          '<div class="semantic-feedback-heading">Semantic Feedback</div>',
          '<div class="semantic-feedback-grid">',
          '<article class="choice-feedback-card choice-feedback-card--canonical ',resolution.canonicalForm.valid?'is-valid':'is-invalid','">',
          '<span class="choice-feedback-kicker">Canonical Form</span>',
          '<strong class="choice-feedback-status"><span class="choice-feedback-status-mark" aria-hidden="true">✓</span>',escapeHtml(resolution.canonicalForm.status||''),'</strong>',
          '<p class="choice-feedback-copy">',escapeHtml(resolution.canonicalForm.response||''),'</p>',
          '</article>',
          '<article class="choice-feedback-card choice-feedback-card--contextual is-contextual">',
          '<span class="choice-feedback-kicker">Contextual Response</span>',
          '<strong class="choice-feedback-status"><span class="choice-feedback-status-mark" aria-hidden="true">◎</span>',escapeHtml(resolution.contextualResponse.status||''),'</strong>',
          '<div class="choice-feedback-score-ring" style="--score-angle:',escapeHtml(scoreAngle),'deg" aria-label="Context score ',escapeHtml(score),' of ',escapeHtml(possibleScore),'">',
          '<p class="choice-feedback-score-value">',escapeHtml(score),' / ',escapeHtml(possibleScore),'</p>',
          '</div>',
          '</article>',
          '</div>',
          '</section>'
        ].join('');

        if(typeof feedback.scrollIntoView==='function'){
          feedback.scrollIntoView({
            behavior:'smooth',
            block:'start',
            inline:'nearest'
          });
        }

        lastObservedEvent=event;

        if(!coordinator||typeof coordinator.submitChoice!=='function')return;
        var coordinated=coordinator.submitChoice(event.choice,target,event);
        if(!coordinated)return;
        lastCycleResult=coordinated;
      }
    });

    return installed===true;
  }).catch(function(){return false;});
}

if(!original||typeof original.select!=='function')return;

function select(slide,options){
  var result;
  try{
    result=original.select(slide,options);
  }catch(error){
    return Promise.resolve(false);
  }

  return Promise.resolve(result).then(function(selected){
    if(selected!==true)return false;
    return mount(slide).then(function(){
      // Preserve the Selection contract: success means the canonical Session was grounded.
      // Choice-surface mounting is presentation-only and cannot revoke that success.
      return true;
    });
  },function(){
    return false;
  });
}

root.SIYAYOHumanLabAdaptiveChoiceSurface=Object.freeze({
  getLastObservedEvent:function(){
    return lastObservedEvent;
  },
  getLastCycleResult:function(){
    return lastCycleResult;
  }
});

root.SIYAYOStoryAssessmentLeafSelection=Object.freeze({select:select});
})(typeof globalThis!=='undefined'?globalThis:this);
