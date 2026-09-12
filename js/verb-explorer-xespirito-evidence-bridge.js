// Verb Explorer Xespirito evidence bridge. Interprets only grounded repair trace; creates no profile/session/attempt/context.
(function(root){
  function interpret(){
    var bridge=root.SIYAYOXespiritoBridge;
    var interpreter=root.XespiritoEvidenceInterpreter;
    if(!bridge||typeof bridge.getRepairTrace!=='function')return null;
    if(!interpreter||typeof interpreter.interpret!=='function')return null;
    var trace=bridge.getRepairTrace();
    if(!Array.isArray(trace)||!trace.length)return null;
    return interpreter.interpret(trace);
  }

  root.SIYAYOVerbExplorerXespiritoEvidenceBridge=Object.freeze({interpret:interpret});
})(typeof globalThis!=='undefined'?globalThis:this);
