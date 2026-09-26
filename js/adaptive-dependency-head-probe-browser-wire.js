// Browser-only interaction boundary for one already-presented Dependency Head Probe.
// It renders the prompt and authorized alternatives, then delegates one physical
// learner click to the canonical learner-event boundary. It does not evaluate
// correctness, expose canonical dependency relation, create Evidence/Attempt,
// grant Green Pass, authorize NEXT, or reuse exploratory Dependency Focus state.
(function(root,factory){
  var api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOAdaptiveDependencyHeadProbeBrowserWire=api;
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
      !text(view.experienceId)||
      !text(view.structureId)||
      !text(view.language)||
      text(view.dimension)!=='head-identification'||
      !view.targetToken||
      !text(view.targetToken.id)||
      !text(view.targetToken.form)||
      !text(view.targetToken.wordClass)||
      !text(view.prompt)||
      !Array.isArray(view.alternatives)||
      view.alternatives.length<2
    )return false;

    var seen=Object.create(null);
    return view.alternatives.every(function(item){
      var id=text(item&&item.id);
      var form=text(item&&item.form);
      var wordClass=text(item&&item.wordClass);
      if(!id||!form||!wordClass||id===view.targetToken.id||seen[id])return false;
      seen[id]=true;
      return true;
    });
  }

  function render(view,options){
    options=options||{};
    var container=options.container;
    if(!validPresentation(view)||!container)return false;

    container.innerHTML=[
      '<section class="dependency-head-probe" aria-label="Dependency head check">',
      '<p class="dependency-head-probe-prompt">',escapeHtml(view.prompt),'</p>',
      '<div class="dependency-head-probe-options">',
      view.alternatives.map(function(item){
        return [
          '<button type="button" data-dependency-head-probe-select="',
          escapeHtml(item.id),
          '">',
          escapeHtml(item.form),
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
    var choice=text(target.dataset.dependencyHeadProbeSelect);
    if(!choice)return null;
    return view.alternatives.some(function(item){return item.id===choice;})?choice:null;
  }

  function install(view,options){
    options=options||{};
    var container=options.container;
    var learnerEvents=options.learnerEvents||root.SIYAYOVerbExplorerLearnerEvent;
    var onEvent=options.onEvent;

    if(!validPresentation(view))return false;
    if(!container||typeof container.addEventListener!=='function')return false;
    if(!learnerEvents||typeof learnerEvents.fromDependencyHeadProbeSelect!=='function')return false;
    if(typeof onEvent!=='function')return false;
    if(!render(view,{container:container}))return false;

    container.__siyayoDependencyHeadProbeBinding={
      view:view,
      learnerEvents:learnerEvents,
      onEvent:onEvent
    };

    if(container.__siyayoDependencyHeadProbeClickInstalled!==true){
      container.addEventListener('click',function(event){
        var binding=container.__siyayoDependencyHeadProbeBinding;
        if(!binding)return;

        var target=event&&event.target&&typeof event.target.closest==='function'
          ? event.target.closest('[data-dependency-head-probe-select]')
          : null;
        if(!target)return;

        var choice=selectedChoice(target,binding.view);
        if(!choice)return;

        var observed=binding.learnerEvents.fromDependencyHeadProbeSelect(choice,{
          currentExperienceId:binding.view.experienceId,
          structureId:binding.view.structureId,
          language:binding.view.language,
          dimension:binding.view.dimension,
          targetTokenId:binding.view.targetToken.id
        });

        if(observed)binding.onEvent(observed,target);
      });
      container.__siyayoDependencyHeadProbeClickInstalled=true;
    }

    return true;
  }

  return Object.freeze({render:render,install:install});
});
