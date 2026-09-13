// Verb Explorer adaptive Evidence Profile source. Creates and retains only the
// canonical AdaptiveEvidenceProfile consumed by Evidence recording and Session creation.
// It owns no Green Pass Profile, Session, Attempt, Context, learner identity, or decision.
(function(root){
  var current=null;

  function isProfile(profile){
    return !!profile&&
      typeof profile==='object'&&
      Array.isArray(profile.observations)&&
      Array.isArray(profile.patterns)&&
      Array.isArray(profile.reinforcementCandidates)&&
      Array.isArray(profile.confirmedReinforcements);
  }

  function begin(id){
    var api=root.AdaptiveEvidenceProfile;
    if(!api||typeof api.createProfile!=='function')return null;
    if(typeof id!=='string'||!id.trim())return null;
    var profile=api.createProfile(id.trim());
    if(!isProfile(profile))return null;
    current=profile;
    return current;
  }

  function adopt(profile){
    if(!isProfile(profile))return false;
    current=profile;
    return true;
  }

  function getProfile(){return current;}
  function clear(){current=null;}

  root.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource=Object.freeze({
    begin:begin,
    adopt:adopt,
    getProfile:getProfile,
    clear:clear
  });
})(typeof globalThis!=='undefined'?globalThis:this);
