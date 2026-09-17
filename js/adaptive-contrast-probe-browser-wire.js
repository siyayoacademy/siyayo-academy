// Browser-only interaction boundary for an already-presented contrast probe.
// It renders no correctness signal and creates no pedagogical authority.
(function(root,factory){
  var api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.SIYAYOAdaptiveContrastProbeBrowserWire=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  var occurrenceSequence=0;

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
      return '<button type="button" data-contrast-probe-select="'+escapeHtml(item.id)+'" data-contrast-probe-language="'+escapeHtml(item.language)+'">'+escapeHtml(item.form)+'</button>';
    }).join('');
    return true;
  }

  function eventFromTarget(target,view){
    if(!target||!target.dataset||!validPresentation(view))return null;
    var choice=text(target.dataset.contrastProbeSelect);
    var alternative=view.alternatives.find(function(item){return item.id===choice;});
    if(!alternative)return null;
    occurrenceSequence+=1;
    return Object.freeze({
      observed:true,
      actor:'learner',
      relevantToWait:true,
      intent:'continue',
      type:'learner-response',
      source:'contrast-probe-select',
      occurrenceId:'contrast-probe-select:'+occurrenceSequence,
      choice:alternative.id,
      selectedLanguage:alternative.language,
      experienceId:view.experienceId||null
    });
  }

  function install(view,options){
    options=options||{};
    var container=options.container;
    var onEvent=options.onEvent;
    if(!container||typeof container.addEventListener!=='function'||typeof onEvent!=='function')return false;
    if(!render(view,{container:container}))return false;
    container.addEventListener('click',function(event){
      var target=event.target&&typeof event.target.closest==='function'?event.target.closest('[data-contrast-probe-select]'):null;
      if(!target)return;
      var observed=eventFromTarget(target,view);
      if(observed)onEvent(observed,target);
    });
    return true;
  }

  return Object.freeze({render:render,eventFromTarget:eventFromTarget,install:install});
});
