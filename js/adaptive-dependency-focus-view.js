(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDependencyFocusView=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function freezeToken(token){
    if(!token||typeof token!=='object')return null;
    var id=text(token.id);
    var form=text(token.form);
    var wordClass=text(token.wordClass);
    var index=Number(token.index);
    if(!id||!form||!wordClass||!Number.isFinite(index))return null;
    return Object.freeze({
      id:id,
      index:index,
      form:form,
      wordClass:wordClass
    });
  }

  function freezeRelation(relation){
    if(!relation||typeof relation!=='object')return null;
    var head=text(relation.head);
    var dependent=text(relation.dependent);
    var type=text(relation.relation);
    if(!head||!dependent||!type)return null;
    return Object.freeze({
      head:head,
      dependent:dependent,
      relation:type
    });
  }

  function resolve(structure,focusId){
    if(!structure||!Array.isArray(structure.tokens)||!Array.isArray(structure.relations))return null;

    var requested=text(focusId);
    if(!requested)return null;

    var tokens=[];
    var byId=Object.create(null);

    for(var i=0;i<structure.tokens.length;i+=1){
      var token=freezeToken(structure.tokens[i]);
      if(!token||byId[token.id])return null;
      tokens.push(token);
      byId[token.id]=token;
    }

    var focus=byId[requested]||null;
    if(!focus)return null;

    var relevant=[];
    var dependents=[];
    var head=null;

    for(var j=0;j<structure.relations.length;j+=1){
      var relation=freezeRelation(structure.relations[j]);
      if(!relation)return null;
      if(!byId[relation.head]||!byId[relation.dependent])return null;

      if(relation.head===requested){
        relevant.push(relation);
        dependents.push(byId[relation.dependent]);
      }else if(relation.dependent===requested){
        relevant.push(relation);
        if(head&&head.id!==relation.head)return null;
        head=byId[relation.head];
      }
    }

    return Object.freeze({
      status:'DEPENDENCY_FOCUS_READY',
      focus:focus,
      head:head,
      dependents:Object.freeze(dependents),
      relations:Object.freeze(relevant)
    });
  }

  return Object.freeze({resolve:resolve});
});
