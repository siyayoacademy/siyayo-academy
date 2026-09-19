// Explicit learner identity boundary for the Verb Explorer adaptive runtime.
// It does not invent, persist, authenticate, or derive learner identity.
(function(root){
'use strict';
var current=null;

function normalize(id){
  if(typeof id!=='string')return null;
  var value=id.trim();
  return value||null;
}

function adopt(id){
  var value=normalize(id);
  if(!value)return false;
  current=value;
  return true;
}

function getId(){return current;}
function clear(){current=null;}

root.SIYAYOVerbExplorerLearnerIdentitySource=Object.freeze({
  adopt:adopt,
  getId:getId,
  clear:clear
});
})(typeof globalThis!=='undefined'?globalThis:this);
