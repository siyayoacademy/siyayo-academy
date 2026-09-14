// Bridges an already-established canonical learner identity to the Verb Explorer provider.
// Missing identity is WAIT. This bridge does not authenticate, derive, invent, or persist identity.
(function(root){
'use strict';

function provideEstablished(){
  var authority=root.SIYAYOLearnerIdentityAuthority;
  var provider=root.SIYAYOVerbExplorerLearnerIdentityProvider;
  if(!authority||typeof authority.getLearnerId!=='function')return false;
  if(!provider||typeof provider.provide!=='function')return false;

  var learnerId=authority.getLearnerId();
  if(typeof learnerId!=='string'||!learnerId.trim())return false;
  return provider.provide(learnerId)===true;
}

root.SIYAYOLearnerIdentityProviderBridge=Object.freeze({provideEstablished:provideEstablished});
})(typeof globalThis!=='undefined'?globalThis:this);
