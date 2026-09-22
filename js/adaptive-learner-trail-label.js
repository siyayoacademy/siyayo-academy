(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveLearnerTrailLabel=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function display(value){
    value=text(value);
    return value?value.replaceAll('-',' ').replaceAll('_',' ').toUpperCase():null;
  }

  function project(definition){
    if(!definition||typeof definition!=='object')return null;
    var skill=text(definition.id);
    var form=display(definition.form);
    if(!skill||!form)return null;

    return Object.freeze({
      status:'TRAIL_LABEL_READY',
      skill:skill,
      form:form,
      family:display(definition.family),
      grammarRole:display(definition.grammarRole)
    });
  }

  return Object.freeze({project:project});
});
