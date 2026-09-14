// Canonical learner identity authority boundary.
// It accepts only an identity explicitly established by an external account/authentication authority.
// It does not authenticate, persist, derive, invent, or enrich learner identity.
(function(root){
'use strict';
var current=null;

function normalize(value){
  if(typeof value!=='string')return null;
  var normalized=value.trim();
  return normalized||null;
}

function establish(identity){
  if(!identity||typeof identity!=='object')return false;
  var learnerId=normalize(identity.learnerId);
  if(!learnerId)return false;
  current=Object.freeze({learnerId:learnerId});
  return true;
}

function getIdentity(){return current;}
function getLearnerId(){return current&&current.learnerId||null;}
function clear(){current=null;}

root.SIYAYOLearnerIdentityAuthority=Object.freeze({
  establish:establish,
  getIdentity:getIdentity,
  getLearnerId:getLearnerId,
  clear:clear
});
})(typeof globalThis!=='undefined'?globalThis:this);
