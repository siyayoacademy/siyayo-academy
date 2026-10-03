// Story semantic Surface language realization. Exposes only an explicitly
// declared realization for a known semantic Surface and requested language.
// Matching presentation text never creates semantic identity.
(function(root){
'use strict';

function normalize(value){
  if(typeof value!=='string')return null;
  var normalized=value.trim();
  return normalized||null;
}

function read(surface,language){
  if(!surface||typeof surface!=='object')return null;

  var surfaceId=normalize(surface.id);
  var languageCode=normalize(language);
  if(!surfaceId||!languageCode)return null;

  var realizations=surface.realizations;
  if(!realizations||typeof realizations!=='object'||Array.isArray(realizations))return null;

  var text=normalize(realizations[languageCode]);
  if(!text)return null;

  return Object.freeze({
    surfaceId:surfaceId,
    language:languageCode,
    text:text
  });
}

root.SIYAYOStorySemanticSurfaceRealization=Object.freeze({read:read});
})(typeof globalThis!=='undefined'?globalThis:this);
