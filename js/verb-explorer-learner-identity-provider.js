// Explicit authority injection seam for Verb Explorer learner identity.
// The provider does not authenticate, persist, derive, or invent identity;
// it only forwards an explicitly supplied learner id to the canonical Identity Source.
(function(root){
'use strict';

function provide(id){
  var source=root.SIYAYOVerbExplorerLearnerIdentitySource;
  if(!source||typeof source.adopt!=='function')return false;
  if(typeof id!=='string'||!id.trim())return false;
  return source.adopt(id)===true;
}

root.SIYAYOVerbExplorerLearnerIdentityProvider=Object.freeze({provide:provide});
})(typeof globalThis!=='undefined'?globalThis:this);
