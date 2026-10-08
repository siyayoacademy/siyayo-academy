// Verb Explorer adaptive Profile source. Creates the P note only through the canonical GreenPassProfile API.
// It owns no Session, Attempt, Context, learner identity, or pedagogical decision.
(function(root){
  var current=null;

  function begin(id){
    var api=root.GreenPassProfile;
    if(!api||typeof api.createProfile!=='function')return null;
    if(typeof id!=='string'||!id.trim())return null;
    current=api.createProfile(id.trim());
    return current;
  }

  function adopt(profile){
    if(!profile||typeof profile!=='object')return false;
    current=profile;
    return true;
  }

  function getProfile(){return current;}
  function clear(){current=null;}

  root.SIYAYOVerbExplorerAdaptiveProfileSource=Object.freeze({
    begin:begin,
    adopt:adopt,
    getProfile:getProfile,
    clear:clear
  });
})(typeof globalThis!=='undefined'?globalThis:this);
