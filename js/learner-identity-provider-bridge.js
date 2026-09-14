// Bridges an already-established canonical learner identity to the Verb Explorer provider.
// Missing identity is WAIT. A conflicting retained Source identity also fails closed.
// This bridge does not authenticate, derive, invent, persist, or switch identity.
(function(root){
'use strict';

function provideEstablished(){
  var authority=root.SIYAYOLearnerIdentityAuthority;
  var provider=root.SIYAYOVerbExplorerLearnerIdentityProvider;
  var source=root.SIYAYOVerbExplorerLearnerIdentitySource;
  if(!authority||typeof authority.getLearnerId!=='function')return false;
  if(!provider||typeof provider.provide!=='function')return false;
  if(!source||typeof source.getId!=='function')return false;

  var learnerId=authority.getLearnerId();
  if(typeof learnerId!=='string'||!learnerId.trim())return false;
  learnerId=learnerId.trim();

  var retained=source.getId();
  if(retained!==null&&retained!==undefined){
    if(typeof retained!=='string'||!retained.trim())return false;
    if(retained.trim()!==learnerId)return false;
  }

  return provider.provide(learnerId)===true;
}

root.SIYAYOLearnerIdentityProviderBridge=Object.freeze({provideEstablished:provideEstablished});
})(typeof globalThis!=='undefined'?globalThis:this);
