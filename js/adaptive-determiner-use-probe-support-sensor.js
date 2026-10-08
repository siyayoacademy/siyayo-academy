// Occurrence-scoped support authority for determiner-use microprobes.
// Absence of a grounded support observation means no observed support for that occurrence.
// It does not evaluate correctness, create Evidence/Attempt, claim transfer,
// mutate Session state, grant Green Pass, or authorize progression.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDeterminerUseProbeSupportSensor=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function create(){
    var byOccurrence=Object.create(null);

    return Object.freeze({
      observe:function(event){
        if(!event||event.type!=='determiner-use-probe-support')return null;
        var occurrenceId=text(event.occurrenceId);
        var support=text(event.support);
        if(!occurrenceId||!support)return null;
        byOccurrence[occurrenceId]=support;
        return support;
      },

      support:function(learnerEvent){
        var occurrenceId=text(learnerEvent&&learnerEvent.occurrenceId);
        if(!occurrenceId)return 'none';
        return byOccurrence[occurrenceId]||'none';
      },

      reset:function(){
        byOccurrence=Object.create(null);
        return true;
      }
    });
  }

  return Object.freeze({create:create});
});
