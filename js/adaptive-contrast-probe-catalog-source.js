// Browser source for the canonical contrast-probe specification catalog.
// It loads explicit pedagogical authority only; it does not infer K, select a
// specification, create a ProbeDefinition, evaluate a learner, or authorize NEXT.
(function(root){
'use strict';

var DEFAULT_URL='data/learning/contrast-probe-specifications.json';
var current=null;
var loading=null;

function normalize(value){return typeof value==='string'?value.trim():'';}

function validAlternative(item){
  return !!item&&
    !!normalize(item.id)&&
    !!normalize(item.language)&&
    !!normalize(item.form)&&
    !!normalize(item.meaning);
}

function validSpecification(item){
  if(!item||!normalize(item.patternKey)||!normalize(item.expectedLanguage)||!normalize(item.targetMeaning))return false;
  if(!Array.isArray(item.alternatives)||item.alternatives.length<2)return false;
  var ids=new Set();
  for(var i=0;i<item.alternatives.length;i++){
    var alternative=item.alternatives[i];
    if(!validAlternative(alternative))return false;
    var id=normalize(alternative.id);
    if(ids.has(id))return false;
    ids.add(id);
  }
  return true;
}

function validate(catalog){
  if(!catalog||!normalize(catalog.version)||!Array.isArray(catalog.items)||!catalog.items.length)return null;
  var keys=new Set();
  for(var i=0;i<catalog.items.length;i++){
    var item=catalog.items[i];
    if(!validSpecification(item))return null;
    var key=normalize(item.patternKey);
    if(keys.has(key))return null;
    keys.add(key);
  }
  return catalog;
}

function load(input){
  input=input||{};
  if(current)return Promise.resolve(current);
  if(loading)return loading;
  var fetchFn=input.fetch||root.fetch;
  var url=normalize(input.url)||DEFAULT_URL;
  if(typeof fetchFn!=='function')return Promise.resolve(null);

  loading=Promise.resolve()
    .then(function(){return fetchFn(url);})
    .then(function(response){
      if(!response||response.ok!==true||typeof response.json!=='function')return null;
      return response.json();
    })
    .then(function(catalog){
      var accepted=validate(catalog);
      if(accepted)current=accepted;
      return current;
    })
    .catch(function(){return null;})
    .then(function(result){loading=null;return result;},function(){loading=null;return null;});
  return loading;
}

function getCatalog(){return current;}
function clear(){current=null;loading=null;}

root.AdaptiveContrastProbeCatalogSource=Object.freeze({
  DEFAULT_URL:DEFAULT_URL,
  validate:validate,
  load:load,
  getCatalog:getCatalog,
  clear:clear
});
})(typeof globalThis!=='undefined'?globalThis:this);
