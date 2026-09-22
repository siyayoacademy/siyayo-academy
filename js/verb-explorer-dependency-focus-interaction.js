(function(root){
  'use strict';

  var installed=false;

  function install(options){
    options=options||{};
    var doc=options.document||root.document;
    if(installed||!doc||typeof doc.addEventListener!=='function')return false;

    var structure=options.structure;
    var surface=options.surface||root.SIYAYOVerbExplorerDependencyFocusSurface;
    if(!structure||!surface||typeof surface.render!=='function')return false;

    doc.addEventListener('click',function(event){
      var target=event&&event.target&&typeof event.target.closest==='function'
        ? event.target.closest('[data-dependency-token]')
        : null;
      if(!target)return;

      var focusId=target.dataset&&target.dataset.dependencyToken;
      if(typeof focusId!=='string'||!focusId.trim())return;

      surface.render({
        document:doc,
        structure:structure,
        focusId:focusId.trim()
      });
    });

    installed=true;
    return true;
  }

  root.SIYAYOVerbExplorerDependencyFocusInteraction=Object.freeze({
    install:install
  });
})(typeof globalThis!=='undefined'?globalThis:this);
