// Browser presentation hinge for an already-authorized contrast probe presentation.
// It owns only surface visibility/mounting. It does not infer K, create a Decision,
// evaluate correctness, create learner events, mutate evidence/session state,
// grant Green Pass, authorize NEXT, or start a new Session.
(function(root,factory){
  var api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.SIYAYOAdaptiveContrastProbeSurfaceController=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  function hide(panel,options){
    options=options||{};
    if(!panel)return false;
    panel.hidden=true;
    var container=options.container;
    if(container&&options.clear!==false)container.innerHTML='';
    return true;
  }

  function mount(presentation,options){
    options=options||{};
    var panel=options.panel;
    var container=options.container;
    var wire=options.wire||root.SIYAYOAdaptiveContrastProbeBrowserWire;
    var learnerEvents=options.learnerEvents||root.SIYAYOVerbExplorerLearnerEvent;
    var onEvent=options.onEvent;

    if(!panel||!container){
      if(panel)hide(panel,{container:container});
      return false;
    }

    // Fail closed before asking the BrowserWire to render or install anything.
    panel.hidden=true;
    if(!presentation||!wire||typeof wire.install!=='function'||!learnerEvents||typeof learnerEvents.fromContrastProbeSelect!=='function'||typeof onEvent!=='function'){
      hide(panel,{container:container});
      return false;
    }

    var installed=wire.install(presentation,{
      container:container,
      learnerEvents:learnerEvents,
      onEvent:onEvent
    });
    if(installed!==true){
      hide(panel,{container:container});
      return false;
    }

    panel.hidden=false;
    return true;
  }

  return Object.freeze({mount:mount,hide:hide});
});
