// Read-only bridge: rendered Choice resolution -> grounded choice-function evidence.
// It delegates observation to the Resolution Reader and interpretation to the canonical evaluator.
(function(root){
  'use strict';

  function read(state,doc){
    var reader=root.SIYAYOVerbExplorerChoiceResolutionReader;
    var evaluator=root.SIYAYOChoiceEvidenceEvaluator;
    if(!reader||typeof reader.read!=='function'||!evaluator||typeof evaluator.evaluate!=='function')return null;

    var result=reader.read(state,doc);
    if(!result)return null;

    var evidence=evaluator.evaluate(result,state);
    if(!evidence)return null;

    return Object.freeze({
      dimension:evidence.dimension,
      result:evidence.result,
      context:evidence.context
    });
  }

  root.SIYAYOVerbExplorerChoiceEvidenceBridge=Object.freeze({read:read});
})(typeof globalThis!=='undefined'?globalThis:this);
