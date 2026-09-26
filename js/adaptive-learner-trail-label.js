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

  function project(definition,language){
    if(!definition||typeof definition!=='object')return null;
    var skill=text(definition.id);
    language=text(language)||text(definition.language)||'en';
    var realization=definition.realizations&&definition.realizations[language];
    var form=display(realization&&realization.form||definition.form);
    if(!skill||!form)return null;

    return Object.freeze({
      status:'TRAIL_LABEL_READY',
      skill:skill,
      form:form,
      language:language,
      family:display(realization&&realization.family||definition.family),
      grammarRole:display(realization&&realization.grammarRole||definition.grammarRole)
    });
  }

  return Object.freeze({project:project});
});
