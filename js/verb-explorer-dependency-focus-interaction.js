(function(root){
  'use strict';

  var installed=false;
  var activeStructure=null;
  var activeSurface=null;
  var activeDocument=null;

  function updateStructure(structure){
    if(!structure||!Array.isArray(structure.tokens)||!Array.isArray(structure.relations))return false;
    activeStructure=structure;
    return true;
  }

  function install(options){
    options=options||{};
    var doc=options.document||root.document;
    if(installed||!doc||typeof doc.addEventListener!=='function')return false;

    var structure=options.structure;
    var surface=options.surface||root.SIYAYOVerbExplorerDependencyFocusSurface;
    if(!structure||!surface||typeof surface.render!=='function')return false;
    if(updateStructure(structure)!==true)return false;
    activeSurface=surface;
    activeDocument=doc;

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
      if(!activeStructure||!activeSurface||!activeDocument)return false;
      var rendered=activeSurface.render({
        document:activeDocument,
        structure:activeStructure,
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
    install:install,
    updateStructure:updateStructure
  });
})(typeof globalThis!=='undefined'?globalThis:this);
