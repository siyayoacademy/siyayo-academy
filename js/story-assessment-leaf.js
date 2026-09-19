// Story-owned Assessment Leaf reader: recognizes only an explicitly declared
// Assessment Leaf with a complete canonical Target. Presentation content such as
// targetWords or sentences never creates an Assessment Leaf implicitly.
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

  var declared=leaf.assessmentTarget;
  if(!declared||typeof declared!=='object')return null;

  var skill=normalize(declared.skill);
  var definitionPath=normalize(declared.definitionPath);
  if(!skill||!definitionPath)return null;

  return Object.freeze({
    assessmentTarget:Object.freeze({
      skill:skill,
      definitionPath:definitionPath
    })
  });
}

root.SIYAYOStoryAssessmentLeaf=Object.freeze({read:read});
})(typeof globalThis!=='undefined'?globalThis:this);
