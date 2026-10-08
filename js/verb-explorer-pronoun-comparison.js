// Separate corpus-owned observational probe. Never submits determiner Evidence.
(function(root,factory){
 var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SIYAYOPronounComparison=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';var trace=[];
 function evaluate(spec,choice){
  if(!spec||spec.language!=='es'||spec.grammarRole!=='pronombre-interrogativo'||!Array.isArray(spec.alternatives))return null;
  if(!spec.alternatives.some(function(a){return a.id===choice;}))return null;
  return Object.freeze({result:choice===spec.expectedAlternativeId?'pass':'fail',grammarRole:spec.grammarRole,evidenceProduced:false,greenPass:false});
 }
 function mount(input){
  var doc=input.document,old=doc.getElementById('pronounComparisonPanel');if(old)old.remove();
  var q=input.question,spec=q&&q.pronounComparison;if(input.language!=='es'||!spec)return false;
  var lines=doc.getElementById('livingLines');if(!lines)return false;
  var panel=doc.createElement('section');panel.id='pronounComparisonPanel';panel.className='dependency-head-probe-panel';
  var title=doc.createElement('h3');title.textContent='CUÁL · COMPARACIÓN PRONOMINAL';panel.appendChild(title);
  var prompt=doc.createElement('p');prompt.textContent=spec.prompt;panel.appendChild(prompt);
  var audio=doc.createElement('button');audio.type='button';audio.className='choice-audio';audio.setAttribute('aria-label','Escuchar comparación');
  audio.innerHTML='<span class="siyayo-speaker" aria-hidden="true"></span>';audio.onclick=function(){input.speak(spec.prompt,'es');};panel.appendChild(audio);
  var feedback=doc.createElement('p');feedback.setAttribute('aria-live','polite');
  spec.alternatives.forEach(function(a){var b=doc.createElement('button');b.type='button';b.className='gear-option';b.textContent=a.label;
   b.onclick=function(){var result=evaluate(spec,a.id);if(!result)return;
    trace.push(Object.freeze({learnerId:input.learnerId||null,experienceId:input.experienceId,language:'es',choice:a.id,result:result.result,evidenceProduced:false,greenPass:false}));
    feedback.textContent=result.result==='pass'?'✓ CUÁL sustituye a queso · respuesta observada · prueba separada del contrato determinante':'Prueba otra forma: elegimos un queso.';
   };panel.appendChild(b);});panel.appendChild(feedback);lines.parentNode.insertBefore(panel,lines.nextSibling);return true;
 }
 return Object.freeze({evaluate:evaluate,mount:mount,getTrace:function(){return Object.freeze(trace.slice());}});
});
