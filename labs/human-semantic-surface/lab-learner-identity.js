// Human Semantic Surface Lab fixture only.
// Supplies one explicit controlled learner id through the canonical Provider.
// It is not login, account, persistence, authentication, or production identity authority.
(function(root){
'use strict';

var provider=root.SIYAYOVerbExplorerLearnerIdentityProvider;
if(!provider||typeof provider.provide!=='function')return;

provider.provide('human-lab-learner-01');
})(typeof globalThis!=='undefined'?globalThis:this);
