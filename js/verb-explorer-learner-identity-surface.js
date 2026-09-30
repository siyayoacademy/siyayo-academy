// Explicit learner-owned identity surface for the Verb Explorer.
// It forwards only a human-entered name/nickname to the canonical provider.
// It does not persist, authenticate, derive, randomize, or silently invent identity.
(function(root){
'use strict';

function text(value){return typeof value==='string'?value.trim():'';}

function install(options){
  options=options||{};
  var doc=options.document||root.document;
  var provider=options.provider||root.SIYAYOVerbExplorerLearnerIdentityProvider;
  var source=options.source||root.SIYAYOVerbExplorerLearnerIdentitySource;
  var readiness=options.readiness||root.SIYAYOVerbExplorerAdaptiveReadinessTrigger;
  if(!doc||typeof doc.getElementById!=='function')return false;

  var panel=doc.getElementById('learnerIdentityPanel');
  var input=doc.getElementById('learnerIdentityInput');
  var confirm=doc.getElementById('learnerIdentityConfirm');
  var status=doc.getElementById('learnerIdentityStatus');
  if(!panel||!input||!confirm||!status)return false;
  if(!provider||typeof provider.provide!=='function')return false;
  if(!source||typeof source.getId!=='function')return false;

  function reflect(){
    var current=text(source.getId());
    panel.dataset.identityState=current?'ready':'waiting';
    input.disabled=false;
    confirm.disabled=false;
    if(current){
      status.textContent='LEARNER READY · '+current;
    }
  }

  function submit(){
    var previous=text(source.getId());
    if(previous&&previous===text(input.value))return Promise.resolve(false);
    var id=text(input.value);
    if(!id){
      if(previous&&typeof provider.clear==='function'&&provider.clear()===true){
        reflect();
        status.textContent='FREE EXPLORATION · no learner selected';
        var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
        if(runtime&&typeof runtime.render==='function')runtime.render();
        return Promise.resolve(true);
      }
      status.textContent='Enter a name or nickname to begin the adaptive Session.';
      return Promise.resolve(false);
    }
    if(provider.provide(id)!==true){
      status.textContent='Identity could not be accepted.';
      return Promise.resolve(false);
    }
    reflect();
    var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
    if(runtime&&typeof runtime.render==='function')runtime.render();
    if(readiness&&typeof readiness.signal==='function'){
      try{return Promise.resolve(readiness.signal()).then(function(){return true;},function(){return true;});}
      catch(error){return Promise.resolve(true);}
    }
    return Promise.resolve(true);
  }

  if(panel.__siyayoLearnerIdentityInstalled!==true){
    confirm.addEventListener('click',function(){submit();});
    input.addEventListener('keydown',function(event){
      if(event&&event.key==='Enter'){
        if(typeof event.preventDefault==='function')event.preventDefault();
        submit();
      }
    });
    panel.__siyayoLearnerIdentityInstalled=true;
  }

  reflect();
  return true;
}

root.SIYAYOVerbExplorerLearnerIdentitySurface=Object.freeze({install:install});
})(typeof globalThis!=='undefined'?globalThis:this);
