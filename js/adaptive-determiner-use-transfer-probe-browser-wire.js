// Browser-only interaction boundary for one already-presented determiner-use transfer probe.
// It renders no correctness signal and delegates one physical cross-Experience learner click
// to the canonical learner-event boundary. It does not evaluate correctness,
// create Evidence/Attempt, mutate Session state, grant Green Pass, or authorize NEXT.
(function(root,factory){
  var api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOAdaptiveDeterminerUseTransferProbeBrowserWire=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function escapeHtml(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
    });
  }

  function validPresentation(view){
    if(!view||typeof view!=='object')return false;
    if(
      text(view.skill)!=='which.use.determiner'||
      !text(view.fromExperienceId)||
      !text(view.experienceId)||
      text(view.fromExperienceId)===text(view.experienceId)||
      text(view.dimension)!=='determiner-use'||
      text(view.mode)!=='transfer'||
      text(view.targetForm)!=='which'||
      !text(view.targetNoun)||
      !text(view.prompt)||
      !Array.isArray(view.alternatives)||
      view.alternatives.length<2
    )return false;

    var seen=Object.create(null);
    return view.alternatives.every(function(item){
      var id=text(item&&item.id);
      var label=text(item&&item.label);
      if(!id||!label||seen[id])return false;
      seen[id]=true;
      return true;
    });
  }

  function render(view,options){
    options=options||{};
    var container=options.container;
    if(!validPresentation(view)||!container)return false;

    container.innerHTML=[
      '<section class="determiner-use-transfer-probe" aria-label="Determiner use transfer check">',
      '<p class="determiner-use-transfer-probe-prompt">',escapeHtml(view.prompt),'</p>',
      '<div class="determiner-use-transfer-probe-options">',
      view.alternatives.map(function(item){
        return [
          '<button type="button" data-determiner-use-transfer-probe-select="',
          escapeHtml(item.id),
          '">',
          escapeHtml(item.label),
          '</button>'
        ].join('');
      }).join(''),
      '</div>',
      '</section>'
    ].join('');

    return true;
  }

  function selectedChoice(target,view){
    if(!target||!target.dataset||!validPresentation(view))return null;
    var choice=text(target.dataset.determinerUseTransferProbeSelect);
    if(!choice)return null;
    return view.alternatives.some(function(item){
      return item.id===choice;
    })?choice:null;
  }

  function install(view,options){
    options=options||{};
    var container=options.container;
    var learnerEvents=options.learnerEvents||root.SIYAYOVerbExplorerLearnerEvent;
    var onEvent=options.onEvent;

    if(!validPresentation(view))return false;
    if(!container||typeof container.addEventListener!=='function')return false;
    if(!learnerEvents||typeof learnerEvents.fromDeterminerUseTransferProbeSelect!=='function')return false;
    if(typeof onEvent!=='function')return false;
    if(!render(view,{container:container}))return false;

    container.__siyayoDeterminerUseTransferProbeBinding={
      view:view,
      learnerEvents:learnerEvents,
      onEvent:onEvent
    };

    if(container.__siyayoDeterminerUseTransferProbeClickInstalled!==true){
      container.addEventListener('click',function(event){
        var binding=container.__siyayoDeterminerUseTransferProbeBinding;
        if(!binding)return;

        var target=event&&event.target&&typeof event.target.closest==='function'
          ? event.target.closest('[data-determiner-use-transfer-probe-select]')
          : null;
        if(!target)return;

        var choice=selectedChoice(target,binding.view);
        if(!choice)return;

        var observed=binding.learnerEvents.fromDeterminerUseTransferProbeSelect(choice,{
          fromExperienceId:binding.view.fromExperienceId,
          currentExperienceId:binding.view.experienceId,
          dimension:binding.view.dimension,
          mode:binding.view.mode,
          targetForm:binding.view.targetForm,
          targetNoun:binding.view.targetNoun
        });

        if(observed)binding.onEvent(observed,target);
      });

      container.__siyayoDeterminerUseTransferProbeClickInstalled=true;
    }

    return true;
  }

  return Object.freeze({
    render:render,
    install:install
  });
});
