// Real Verb Explorer choice-select boundary. Preserves the existing UI handler and submits only when adaptive inputs are available.
(function(root){
  var installed=false;

  function install(options){
    options=options||{};
    if(installed||typeof document==='undefined')return false;
    installed=true;

    document.addEventListener('click',function(event){
      var target=event.target&&typeof event.target.closest==='function'
        ? event.target.closest('[data-choice-select]')
        : null;
      if(!target)return;

      // Run after the existing Verb Explorer click handler has recorded the choice.
      Promise.resolve().then(function(){
        var controller=root.SIYAYOVerbExplorerAdaptiveController;
        var provider=options.getInput||root.SIYAYOVerbExplorerAdaptiveInputProvider;
        if(!controller||typeof controller.submitChoice!=='function'||typeof provider!=='function')return;
        var input=provider(target.dataset.choiceSelect,target);
        if(!input)return;
        controller.submitChoice(Object.assign({},input,{choice:target.dataset.choiceSelect}));
      });
    });
    return true;
  }

  root.SIYAYOVerbExplorerChoiceAdaptiveWire=Object.freeze({install:install});
})(typeof globalThis!=='undefined'?globalThis:this);
