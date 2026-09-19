// Story semantic Surface DOM materialization descriptor. Carries an already
// explicit semantic realization toward the DOM without granting interaction,
// Assessment, Skill, or other pedagogical authority.
(function(root){
'use strict';

function normalize(value){
  if(typeof value!=='string')return null;
  var normalized=value.trim();
  return normalized||null;
}

function describe(realization){
  if(!realization||typeof realization!=='object')return null;

  var surfaceId=normalize(realization.surfaceId);
  var language=normalize(realization.language);
  var text=normalize(realization.text);

  if(!surfaceId||!language||!text)return null;

  return Object.freeze({
    surfaceId:surfaceId,
    language:language,
    text:text,
    attributes:Object.freeze({
      'data-surface-id':surfaceId,
      'data-surface-language':language
    })
  });
}

root.SIYAYOStorySemanticSurfaceDOMMaterialization=Object.freeze({
  describe:describe
});
})(typeof globalThis!=='undefined'?globalThis:this);
