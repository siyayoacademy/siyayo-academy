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

    var lastFocusId=null;

    function tokenFromEvent(event){
      return event&&event.target&&typeof event.target.closest==='function'
        ? event.target.closest('[data-dependency-token]')
        : null;
    }

    function activate(target){
      if(!target)return false;
      var focusId=target.dataset&&target.dataset.dependencyToken;
      if(typeof focusId!=='string'||!focusId.trim())return false;
      focusId=focusId.trim();
      if(focusId===lastFocusId)return true;
      var rendered=surface.render({
        document:doc,
        structure:structure,
        focusId:focusId
      });
      if(rendered===true)lastFocusId=focusId;
      return rendered===true;
    }

    doc.addEventListener('pointerover',function(event){
      if(event&&event.pointerType==='touch')return;
      activate(tokenFromEvent(event));
    });

    doc.addEventListener('pointerup',function(event){
      activate(tokenFromEvent(event));
    });

    doc.addEventListener('focusin',function(event){
      activate(tokenFromEvent(event));
    });

    doc.addEventListener('keydown',function(event){
      if(!event||!(event.key==='Enter'||event.key===' '))return;
      var target=tokenFromEvent(event);
      if(!target)return;
      if(typeof event.preventDefault==='function')event.preventDefault();
      activate(target);
    });

    installed=true;
    return true;
  }

  root.SIYAYOVerbExplorerDependencyFocusInteraction=Object.freeze({
    install:install
  });
})(typeof globalThis!=='undefined'?globalThis:this);
