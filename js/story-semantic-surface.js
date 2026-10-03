// Story semantic surface reader: recognizes only explicitly declared surfaces.
// Presentation text and targetWords never create semantic surface identity.
(function(root){
'use strict';

function normalize(value){
  if(typeof value!=='string')return null;
  var normalized=value.trim();
  return normalized||null;
}

function read(scene,surfaceId){
  if(!scene||typeof scene!=='object')return null;

  var id=normalize(surfaceId);
  if(!id||!Array.isArray(scene.surfaces))return null;

  var declared=null;
  for(var i=0;i<scene.surfaces.length;i+=1){
    var candidate=scene.surfaces[i];
    if(candidate&&typeof candidate==='object'&&normalize(candidate.id)===id){
      declared=candidate;
      break;
    }
  }

  if(!declared||!declared.realizations||typeof declared.realizations!=='object')return null;

  var realizations={};
  Object.keys(declared.realizations).forEach(function(language){
    var value=normalize(declared.realizations[language]);
    if(value)realizations[language]=value;
  });

  if(Object.keys(realizations).length===0)return null;

  return Object.freeze({
    id:id,
    realizations:Object.freeze(realizations)
  });
}

root.SIYAYOStorySemanticSurface=Object.freeze({read:read});
})(typeof globalThis!=='undefined'?globalThis:this);
