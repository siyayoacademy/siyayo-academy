(function(root){
  'use strict';

  var installed=false;
  var activeStructure=null;
  var activeSurface=null;
  var activeDocument=null;
  var activeLanguage=null;
  var lastFocusId=null;
  var activating=false;

  function updateStructure(structure,language){
    if(!structure||!Array.isArray(structure.tokens)||!Array.isArray(structure.relations))return false;
    var nextLanguage=typeof language==='string'&&language.trim()?language.trim():structure.language;
    if(!/^(en|es|pt)$/.test(nextLanguage)||structure.language!==nextLanguage)return false;
    lastFocusId=null;
    activeStructure=structure;
    activeLanguage=nextLanguage;
    return true;
  }

  function install(options){
    options=options||{};
    var doc=options.document||root.document;
    if(installed||!doc||typeof doc.addEventListener!=='function')return false;

    var structure=options.structure;
    var surface=options.surface||root.SIYAYOVerbExplorerDependencyFocusSurface;
    if(!surface||typeof surface.render!=='function')return false;
    if(structure&&updateStructure(structure,options.language)!==true)return false;
    activeSurface=surface;
    activeDocument=doc;


    function tokenFromEvent(event){
      return event&&event.target&&typeof event.target.closest==='function'
        ? event.target.closest('[data-dependency-token]')
        : null;
    }

    function activate(target){
      if(!target||activating)return false;
      var focusId=target.dataset&&target.dataset.dependencyToken;
      if(typeof focusId!=='string'||!focusId.trim())return false;
      focusId=focusId.trim();
      if(focusId===lastFocusId)return true;
      if(!activeStructure||!activeSurface||!activeDocument)return false;
      // Restoring a keyboard-focused token fires focusin synchronously. Keep
      // that restoration inside this render instead of starting another one.
      activating=true;
      try{
        var rendered=activeSurface.render({
          document:activeDocument,
          structure:activeStructure,
          focusId:focusId,
          language:activeLanguage,
          preserveScroll:true
        });
        if(rendered===true)lastFocusId=focusId;
        return rendered===true;
      }finally{activating=false;}
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
