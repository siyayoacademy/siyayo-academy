// Story Assessment Leaf semantic-surface binding. Recognizes only an
// explicitly declared Leaf anchor that resolves to an explicitly declared
// semantic Surface. It never infers association from text or targetWords.
(function(root){
'use strict';

function normalize(value){
  if(typeof value!=='string')return null;
  var normalized=value.trim();
  return normalized||null;
}

function read(scene){
  if(!scene||typeof scene!=='object')return null;

  var leaf=scene.assessmentLeaf;
  if(!leaf||typeof leaf!=='object')return null;

  var surfaceId=normalize(leaf.anchorSurfaceId);
  if(!surfaceId||!Array.isArray(scene.surfaces))return null;

  var target=leaf.assessmentTarget;
  if(!target||typeof target!=='object')return null;
  if(!normalize(target.skill)||!normalize(target.definitionPath))return null;

  var found=false;
  for(var i=0;i<scene.surfaces.length;i+=1){
    var surface=scene.surfaces[i];
    if(!surface||typeof surface!=='object')continue;
    if(normalize(surface.id)!==surfaceId)continue;

    var realizations=surface.realizations;
    if(!realizations||typeof realizations!=='object'||Array.isArray(realizations))return null;

    var hasRealization=Object.keys(realizations).some(function(language){
      return normalize(realizations[language])!==null;
    });
    if(!hasRealization)return null;

    found=true;
    break;
  }

  if(!found)return null;

  return Object.freeze({
    surfaceId:surfaceId,
    leaf:leaf
  });
}

root.SIYAYOStoryAssessmentLeafSurface=Object.freeze({read:read});
})(typeof globalThis!=='undefined'?globalThis:this);
