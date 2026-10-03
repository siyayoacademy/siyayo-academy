// Human-selection semantic boundary for Story Assessment Leaves. This module is
// called only after the UI has established an explicit learner selection. It
// does not detect gestures, infer a Target, or select ordinary presentation text.
(function(root){
'use strict';

function select(slide,options){
  options=options||{};
  var reader=options.reader||root.SIYAYOStoryAssessmentLeaf;
  var provider=options.provider||root.SIYAYOLeafAssessmentTargetProvider;

  if(!reader||typeof reader.read!=='function')return Promise.resolve(false);

  var leaf;
  try{
    leaf=reader.read(slide);
  }catch(error){
    return Promise.resolve(false);
  }

  if(!leaf)return Promise.resolve(false);
  if(!provider||typeof provider.select!=='function')return Promise.resolve(false);

  try{
    return Promise.resolve(provider.select(leaf)).then(function(result){
      return result===true;
    },function(){
      return false;
    });
  }catch(error){
    return Promise.resolve(false);
  }
}

root.SIYAYOStoryAssessmentLeafSelection=Object.freeze({select:select});
})(typeof globalThis!=='undefined'?globalThis:this);
