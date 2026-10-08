// Verb Explorer adaptive Evidence source. Records only interpreted Xespirito evidence into an existing Evidence Profile.
// It creates no Profile, Session, Attempt, Context, learner identity, or confirmation verdict.
(function(root){
  function record(profile,context){
    var source=root.SIYAYOVerbExplorerXespiritoEvidenceBridge;
    var api=root.AdaptiveEvidenceProfile;
    if(!profile||!source||typeof source.interpret!=='function')return null;
    if(!api||typeof api.record!=='function')return null;
    var interpreted=source.interpret();
    if(!interpreted||!Array.isArray(interpreted.signals)||!interpreted.signals.length)return null;
    var repeated=interpreted.signals.filter(function(signal){return signal&&signal.occurrences>=2;});
    var gateResult={
      source:'xespirito-repair-trace',
      status:repeated.length?'pattern-observed':'observed-conflict',
      repeated:repeated,
      requiresReview:interpreted.signals.length>0,
      conflict:interpreted.conflictEvidenceCount>0,
      requiresReinforcement:interpreted.hasReinforcementSignal===true
    };
    return api.record(profile,gateResult,context||{});
  }
  root.SIYAYOVerbExplorerAdaptiveEvidenceSource=Object.freeze({record:record});
})(typeof globalThis!=='undefined'?globalThis:this);
