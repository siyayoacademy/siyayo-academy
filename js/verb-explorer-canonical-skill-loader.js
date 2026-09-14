// Trusted JSON loader for an explicitly selected canonical Skill definition.
// It loads no Experience mapping and makes no pedagogical Skill inference.
(function(root){
'use strict';
var pendingByPath=Object.create(null);

function normalizePath(path){
  if(typeof path!=='string')return null;
  var value=path.trim();
  return value||null;
}

function load(path){
  var canonicalPath=normalizePath(path);
  if(!canonicalPath)return Promise.resolve(false);
  var source=root.SIYAYOVerbExplorerCanonicalSkillSource;
  if(!source||typeof source.adopt!=='function')return Promise.resolve(false);
  if(typeof root.fetch!=='function')return Promise.resolve(false);

  if(!pendingByPath[canonicalPath]){
    pendingByPath[canonicalPath]=root.fetch(canonicalPath)
      .then(function(response){
        if(!response||!response.ok||typeof response.json!=='function')return null;
        return response.json();
      })
      .catch(function(){return null;});
  }

  return pendingByPath[canonicalPath].then(function(definition){
    if(!definition)return false;
    return source.adopt(definition)===true;
  });
}

root.SIYAYOVerbExplorerCanonicalSkillLoader=Object.freeze({load:load});
})(typeof globalThis!=='undefined'?globalThis:this);
