// Explicit Thinking Mind assessment selection boundary.
// A learner's click may forward only an assessmentTarget already declared by the
// selected question. It never infers Skill from questionWord, Experience,
// choiceContext, target words, or Dependency Focus.
(function(root){
'use strict';

function text(value){
  return typeof value==='string'?value.trim():'';
}

function select(question,options){
  options=options||{};
  var provider=options.provider||root.SIYAYOLeafAssessmentTargetProvider;
  if(!question||typeof question!=='object')return Promise.resolve(false);

  var declared=question.assessmentTarget;
  if(!declared||typeof declared!=='object')return Promise.resolve(false);

  var skill=text(declared.skill);
  var definitionPath=text(declared.definitionPath);
  if(!skill||!definitionPath)return Promise.resolve(false);
  if(!provider||typeof provider.select!=='function')return Promise.resolve(false);

  var leaf=Object.freeze({
    assessmentTarget:Object.freeze({
      skill:skill,
      definitionPath:definitionPath
    })
  });

  try{
    return Promise.resolve(provider.select(leaf)).then(function(result){
      return result===true;
    },function(){return false;});
  }catch(error){
    return Promise.resolve(false);
  }
}

root.SIYAYOVerbExplorerThinkingMindAssessmentSelection=Object.freeze({select:select});
})(typeof globalThis!=='undefined'?globalThis:this);
