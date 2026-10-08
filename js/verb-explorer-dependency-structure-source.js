// Resolves one Experience dependency structure from the language that is ON.
// It never translates, guesses, or falls back to another language.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOVerbExplorerDependencyStructureSource=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function text(value){return typeof value==='string'?value.trim():'';}
  function resolve(meta,language,structuresById){
    var activeLanguage=text(language);
    if(!/^(en|es|pt)$/.test(activeLanguage)||!meta||!structuresById||typeof structuresById.get!=='function')return null;
    var structureIds=meta.structureIds;
    if(!structureIds||typeof structureIds!=='object')return null;
    var structureId=text(structureIds[activeLanguage]);
    if(!structureId)return null;
    var structure=structuresById.get(structureId);
    if(!structure||text(structure.id)!==structureId||text(structure.language)!==activeLanguage)return null;
    return structure;
  }
  return Object.freeze({resolve:resolve});
});
