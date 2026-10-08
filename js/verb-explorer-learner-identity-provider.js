// Explicit authority injection seam for Verb Explorer learner identity.
// The provider does not authenticate, persist, derive, or invent identity;
// it only forwards an explicitly supplied learner id to the canonical Identity Source.
(function(root){
'use strict';

function reset(){
  // Explicit identity changes invalidate every learner-owned runtime authority.
  var names=[
    'SIYAYOVerbExplorerAdaptiveReadinessTrigger','SIYAYOVerbExplorerAdaptiveLiveStart',
    'SIYAYOVerbExplorerCanonicalSkillLoader','SIYAYOVerbExplorerThinkingMindAssessmentSelection',
    'SIYAYOVerbExplorerAdaptiveCoordinator','SIYAYOVerbExplorerAdaptiveProfileSource',
    'SIYAYOVerbExplorerAdaptiveEvidenceProfileSource','SIYAYOVerbExplorerCanonicalSkillSource',
    'SIYAYOLeafAssessmentTargetAuthority','SIYAYOVerbExplorerPendingTransitionAuthority'
  ];
  var required=names.slice(4);
  if(required.some(function(name){return !root[name]||typeof root[name].clear!=='function';}))return false;
  names.forEach(function(name){var api=root[name];if(api&&typeof api.clear==='function')api.clear();});
  return true;
}
function clear(){
  var source=root.SIYAYOVerbExplorerLearnerIdentitySource;
  if(!source||typeof source.clear!=='function'||!reset())return false;
  source.clear();return true;
}
function provide(id){
  var source=root.SIYAYOVerbExplorerLearnerIdentitySource;
  if(!source||typeof source.adopt!=='function')return false;
  if(typeof id!=='string'||!id.trim())return false;
  var current=typeof source.getId==='function'?source.getId():null;
  if(current&&current===id.trim())return true;
  if(current&&!reset())return false;
  return source.adopt(id)===true;
}

root.SIYAYOVerbExplorerLearnerIdentityProvider=Object.freeze({provide:provide,clear:clear});
})(typeof globalThis!=='undefined'?globalThis:this);
