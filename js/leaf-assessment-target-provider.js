// Canonical Leaf Target producer: presents an explicitly declared assessment Target
// to the readiness boundary. It does not infer Skill from targetWords, story,
// Experience, Resonance, Green Pass, or any other surrounding content.
(function(root){
'use strict';

function normalize(value){
  if(typeof value!=='string')return null;
  var normalized=value.trim();
  return normalized||null;
}

function select(leaf,options){
  options=options||{};
  var readiness=options.readiness||root.SIYAYOLeafAssessmentTargetReadiness;
  if(!leaf||typeof leaf!=='object')return Promise.resolve(false);

  var declared=leaf.assessmentTarget;
  if(!declared||typeof declared!=='object')return Promise.resolve(false);

  var skill=normalize(declared.skill);
  var definitionPath=normalize(declared.definitionPath);
  if(!skill||!definitionPath)return Promise.resolve(false);
  if(!readiness||typeof readiness.adopt!=='function')return Promise.resolve(false);

  var target={skill:skill,definitionPath:definitionPath};

  try{
    return Promise.resolve(readiness.adopt(target)).then(function(result){
      return result===true;
    },function(){
      return false;
    });
  }catch(error){
    return Promise.resolve(false);
  }
}

root.SIYAYOLeafAssessmentTargetProvider=Object.freeze({select:select});
})(typeof globalThis!=='undefined'?globalThis:this);
