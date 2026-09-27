// Thinking Mind runtime decision layer.
// Observes information gaps declared by the active Experience.
// Manual learner choice remains authoritative.
(function(root){
'use strict';
function validIndex(value){return Number.isInteger(value)&&value>=0?value:null;}
function create(options){
  options=options||{};
  var resolver=options.resolver||root.SIYAYOThinkingMindInformationGapResolver;
  var capabilities=options.capabilities||null;
  if(!resolver||typeof resolver.resolveExperience!=='function')return null;
  function inspect(experience,selectedIndex){
    var opportunities=resolver.resolveExperience(experience,capabilities);
    var selected=validIndex(selectedIndex);
    var active=selected===null?null:opportunities.find(function(item){return item.index===selected;})||null;
    return Object.freeze({
      experienceId:typeof (experience&&experience.id)==='string'?experience.id:null,
      opportunities:Object.freeze(opportunities.slice()),
      selectedIndex:selected,
      active:active,
      selectionAuthority:'learner',
      autoSelection:false,
      evidenceProduced:false
    });
  }
  function choose(experience,index){
    var decision=inspect(experience,index);
    if(!decision.active)return null;
    return Object.freeze({
      index:decision.active.index,
      resolution:decision.active.resolution,
      selectedBy:'learner',
      evidenceProduced:false
    });
  }
  return Object.freeze({inspect:inspect,choose:choose});
}
root.SIYAYOThinkingMindRuntimeDecision=Object.freeze({create:create});
})(typeof globalThis!=='undefined'?globalThis:this);
