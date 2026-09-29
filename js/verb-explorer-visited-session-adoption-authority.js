// Authorization for adopting assessment in an already visited Experience.
// Only a canonical Green Pass closed by an observed cross-Experience transfer
// and an explicit learner gesture may become a transition authorization.
// Uses the existing selector and SessionTransitionBoundary; never navigates.
(function(root){
'use strict';
function id(value){return typeof value==='string'?value.trim():'';}
function inspect(){
  var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
  var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
  var catalog=root.SIYAYOVerbExplorerExperienceNavigation;
  var profiles=root.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource;
  var evaluator=root.GreenPassProfile;
  var selector=root.AdaptiveAdvanceSelector;
  if(!coordinator||!stateBridge||!catalog||!profiles||!evaluator||!selector)return null;
  if(typeof coordinator.snapshot!=='function'||typeof stateBridge.getState!=='function'||typeof catalog.getExperiences!=='function')return null;
  if(typeof profiles.getProfile!=='function'||typeof evaluator.evaluateContract!=='function'||typeof selector.select!=='function')return null;
  var current=coordinator.snapshot(),state=stateBridge.getState();
  var session=current&&current.session,decision=session&&session.decision;
  var context=current&&current.context,profile=profiles.getProfile();
  var from=id(decision&&decision.experienceId),to=id(state&&state.currentExperienceId);
  var skill=id(decision&&decision.skill),packets=context&&context.evidencePackets;
  var which=from==='shopping-for-dinner'&&to==='preparing-dinner'&&skill==='which.use.determiner';
  var what=from==='preparing-dinner'&&to==='having-dinner'&&skill==='what.use.object-question';
  if(!which&&!what)return null;
  if(!context||!context.passContract||!Array.isArray(packets)||!profile||!Array.isArray(profile.observations))return null;
  var transfer=packets.some(function(packet){
    var details=packet&&packet.context||{};
    return packet.skill===skill&&packet.dimension===(which?'determiner-use':'object-answer')&&
      packet.mode==='transfer'&&packet.result==='pass'&&packet.support==='none'&&
      id(details.fromExperienceId)===from&&id(details.experienceId)===to&&id(details.occurrenceId);
  });
  if(!transfer)return null;
  var closed=profile.observations.some(function(entry){
    var details=entry&&entry.context||{};
    return entry.source==='green-pass-contract'&&entry.status==='transfer-confirmed'&&
      details.confirmed===true&&details.contractStatus==='GREEN_PASS'&&
      id(details.skill)===skill&&id(details.experienceId)===from;
  });
  if(!closed)return null;
  var result=evaluator.evaluateContract(context.passContract,packets);
  if(!result||result.status!=='GREEN_PASS'||result.satisfied!==true)return null;
  var selection=selector.select({action:'advance'},{
    experiences:catalog.getExperiences(),currentExperience:from
  });
  if(!selection||selection.status!=='selected'||id(selection.fromExperience)!==from||id(selection.experienceId)!==to)return null;
  return Object.freeze({session:session,selection:selection,skill:skill,toExperience:to});
}
function authorize(learnerEvent){
  if(!learnerEvent||learnerEvent.observed!==true||learnerEvent.actor!=='learner')return null;
  if(learnerEvent.intent!=='continue-assessment'||learnerEvent.source!=='pedagogical-session-adopt')return null;
  if(!id(learnerEvent.occurrenceId))return null;
  var ready=inspect();
  if(!ready||id(learnerEvent.experienceId)!==ready.toExperience)return null;
  var boundary=root.AdaptiveSessionTransitionBoundary;
  if(!boundary||typeof boundary.authorize!=='function')return null;
  return boundary.authorize({
    currentSession:ready.session,
    advanceSelection:ready.selection,
    nextDecision:Object.freeze({
      action:'advance',experienceId:ready.toExperience,
      skill:ready.skill,focus:'assessment'
    })
  });
}
root.SIYAYOVerbExplorerVisitedSessionAdoptionAuthority=Object.freeze({inspect:inspect,authorize:authorize});
})(typeof globalThis!=='undefined'?globalThis:this);
