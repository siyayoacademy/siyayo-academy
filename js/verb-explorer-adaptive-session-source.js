// Verb Explorer adaptive Session source. Creates S only through the canonical AdaptiveAttemptLoop.begin API.
// It creates no Profile, Attempt, Context, learner identity, confirmation verdict, or manual decision override.
(function(root){
  function begin(profile,context){
    var loop=root.AdaptiveAttemptLoop;
    var profileApi=root.AdaptiveEvidenceProfile;
    if(!loop||typeof loop.begin!=='function')return null;
    if(!profileApi||typeof profileApi.recommend!=='function')return null;
    if(!profile||!Array.isArray(profile.observations))return null;
    if(!context||typeof context!=='object')return null;
    return loop.begin(profileApi,profile,context);
  }

  root.SIYAYOVerbExplorerAdaptiveSessionSource=Object.freeze({begin:begin});
})(typeof globalThis!=='undefined'?globalThis:this);
