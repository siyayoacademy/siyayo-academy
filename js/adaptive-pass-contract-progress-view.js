// Read-only projection of canonical Pass Contract requirements from accepted Cycle packets.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptivePassContractProgressView=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function project(contract,packets,evaluator){
    if(!contract||!Array.isArray(contract.requires)||!contract.requires.length)return null;
    if(!Array.isArray(packets)||!evaluator||typeof evaluator.evaluateContract!=='function')return null;
    var result;
    try{result=evaluator.evaluateContract(contract,packets);}
    catch(error){return null;}
    if(!result||!Array.isArray(result.requirements)||result.requirements.length!==contract.requires.length)return null;
    var satisfied=result.requirements.map(function(entry){return entry.satisfied===true;});
    return Object.freeze({
      completed:satisfied.filter(Boolean).length,
      total:satisfied.length,
      satisfied:Object.freeze(satisfied),
      status:result.status
    });
  }
  return Object.freeze({project:project});
});
