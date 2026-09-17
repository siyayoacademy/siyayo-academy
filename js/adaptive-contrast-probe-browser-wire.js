// Browser-only interaction boundary for an already-presented contrast probe.
// It renders no correctness signal and delegates observed learner-event identity
// to the Verb Explorer learner-event boundary at actual click time.
(function(root,factory){
  var api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.SIYAYOAdaptiveContrastProbeBrowserWire=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  function text(value){return typeof value==='string'?value.trim():'';}
  function escapeHtml(value){return String(value).replace(/[&<>"']/g,function(ch){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];});}

  function validPresentation(view){
    if(!view||typeof view!=='object'||!view.pattern||!text(view.pattern.key)||!Array.isArray(view.alternatives)||view.alternatives.length<2)return false;
    var seen=Object.create(null);
    return view.alternatives.every(function(item){
      var id=text(item&&item.id),language=text(item&&item.language),form=text(item&&item.form),meaning=text(item&&item.meaning);
      if(!id||!language||!form||!meaning||seen[id])return false;
      seen[id]=true;
      return true;
    });
  }

  function render(view,options){
    options=options||{};
    var container=options.container;
    if(!validPresentation(view)||!container)return false;
    container.innerHTML=view.alternatives.map(function(item){
      return '<button type="button" data-contrast-probe-select="'+escapeHtml(item.id)+'">'+escapeHtml(item.form)+'</button>';
    }).join('');
    return true;
  }

  function selectedChoice(target,view){
    if(!target||!target.dataset||!validPresentation(view))return null;
    var choice=text(target.dataset.contrastProbeSelect);
    return view.alternatives.some(function(item){return item.id===choice;})?choice:null;
  }

  function install(view,options){
    options=options||{};
    var container=options.container;
    var onEvent=options.onEvent;
    var learnerEvents=options.learnerEvents||root.SIYAYOVerbExplorerLearnerEvent;
    if(!container||typeof container.addEventListener!=='function'||typeof onEvent!=='function')return false;
    if(!learnerEvents||typeof learnerEvents.fromContrastProbeSelect!=='function')return false;
    if(!render(view,{container:container}))return false;
    container.addEventListener('click',function(event){
      var target=event.target&&typeof event.target.closest==='function'?event.target.closest('[data-contrast-probe-select]'):null;
      if(!target)return;
      var choice=selectedChoice(target,view);
      if(!choice)return;
      var observed=learnerEvents.fromContrastProbeSelect(choice,{currentExperienceId:view.experienceId||null});
      if(observed)onEvent(observed,target);
    });
    return true;
  }

  return Object.freeze({render:render,install:install});
});
