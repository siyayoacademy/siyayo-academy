// JAGUAR 89Z: two authentic contexts for CUÁL/CUÁLES and QUAL/QUAIS.
// Complementary observational practice; never an assessment target or Evidence.
(function(root,factory){
 var api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SIYAYOPronounComparison=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 var trace=[];
 function copy(spec,key,fallback){return typeof spec?.[key]==='string'?spec[key]:fallback;}
 function config(q,language){
  if(language==='es'&&q?.pronounComparison?.language==='es')return q.pronounComparison;
  if(language==='pt'&&q?.pronounComparison?.counterparts?.pt?.language==='pt')return q.pronounComparison.counterparts.pt;
  return null;
 }
 function caseFor(spec,caseId){
  if(Array.isArray(spec.cases)){
   return spec.cases.find(function(c){return c.id===caseId;})||null;
  }
  return caseId===undefined||caseId===null?spec:null;
 }
 function evaluate(spec,choice,caseId){
  if(!spec||!['es','pt'].includes(spec.language)||
     !['pronombre-interrogativo','pronome-interrogativo'].includes(spec.grammarRole)||
     !Array.isArray(spec.alternatives)||!spec.alternatives.some(function(a){return a.id===choice;}))return null;
  var situation=caseFor(spec,caseId);
  if(!situation||!spec.alternatives.some(function(a){return a.id===situation.expectedAlternativeId;}))return null;
  return Object.freeze({result:choice===situation.expectedAlternativeId?'pass':'fail',
   grammarRole:spec.grammarRole,caseId:situation.id||'legacy',
   evidenceProduced:false,greenPass:false});
 }
 function append(doc,parent,tag,cls,value){
  var el=doc.createElement(tag);if(cls)el.className=cls;
  if(value!==undefined)el.textContent=value;
  parent.appendChild(el);return el;
 }
 function mount(input){
  input=input||{};
  var doc=input.document,old=doc&&doc.getElementById&&doc.getElementById('pronounComparisonPanel');
  if(old)old.remove();
  var spec=config(input.question,input.language);
  if(!doc||!spec)return false;
  var anchor=doc.getElementById('choiceResolverPanel');
  if(!anchor||!anchor.parentNode||anchor.hidden)return false;
  var lang=spec.language;
  var panel=doc.createElement('section');
  panel.id='pronounComparisonPanel';
  panel.className='dependency-head-probe-panel pronoun-comparison-extension';
  panel.setAttribute('aria-label',lang==='es'?'Exploración gramatical complementaria':'Exploração gramatical complementar');
  append(doc,panel,'p','pronoun-comparison-extension-label',
   lang==='es'?'EXPLORACIÓN GRAMATICAL COMPLEMENTARIA · PRÁCTICA LIBRE':
     'EXPLORAÇÃO GRAMATICAL COMPLEMENTAR · PRÁTICA LIVRE');
  append(doc,panel,'h3','pronoun-comparison-title',copy(spec,'title',
   lang==='es'?'CUÁL / CUÁLES · SINGULAR Y PLURAL':'QUAL / QUAIS · SINGULAR E PLURAL'));
  append(doc,panel,'p','pronoun-comparison-intro',copy(spec,'intro',
   lang==='es'?'¿Buscamos uno o varios quesos?':'Vamos escolher um queijo ou vários?'));
  (Array.isArray(spec.cases)?spec.cases:[spec]).forEach(function(situation,i){
   var card=append(doc,panel,'section','pronoun-comparison-case');
   card.setAttribute('data-pronoun-case',situation.id||'legacy');
   append(doc,card,'p','pronoun-comparison-step',
    copy(situation,'title',String(i+1)+' · '+(lang==='es'?'Elige la forma':'Escolha a forma')));
   var question=append(doc,card,'button','pronoun-comparison-question-card');
   question.type='button';
   question.setAttribute('aria-label',(lang==='es'?'Escuchar contexto: ':'Ouvir contexto: ')+
    copy(situation,'context',situation.prompt));
   var speaker=append(doc,question,'span','siyayo-speaker');
   speaker.setAttribute('aria-hidden','true');
   var questionBody=append(doc,question,'span','pronoun-comparison-question-body');
   append(doc,questionBody,'span','pronoun-comparison-context',copy(situation,'context',situation.prompt));
   append(doc,questionBody,'strong','pronoun-comparison-gap',copy(situation,'gapPrompt',situation.prompt));
   question.onclick=function(){
    if(typeof input.speak==='function')input.speak(copy(situation,'audioSetup',copy(situation,'context',situation.prompt)),lang);
   };
   var options=append(doc,card,'div','pronoun-comparison-response-list');
   var feedback=append(doc,card,'p','pronoun-comparison-feedback');
   feedback.setAttribute('aria-live','polite');
   var selected=null;
   spec.alternatives.forEach(function(a){
    var row=append(doc,options,'div','pronoun-comparison-response-row');
    var listen=append(doc,row,'button','pronoun-comparison-audio');
    listen.type='button';listen.setAttribute('data-pronoun-speak',a.id);
    listen.setAttribute('aria-label',(lang==='es'?'Escuchar opción: ':'Ouvir opção: ')+a.label);
    var icon=append(doc,listen,'span','siyayo-speaker');icon.setAttribute('aria-hidden','true');
    listen.onclick=function(){
     if(typeof input.speak==='function')input.speak(a.label,lang);
    };
    var button=append(doc,row,'button','pronoun-comparison-option',a.label);
    button.type='button';button.setAttribute('data-pronoun-choice',a.id);
    button.setAttribute('aria-pressed','false');
    button.onclick=function(){
     var result=evaluate(spec,a.id,situation.id);if(!result)return;
     selected=a.id;
     // Gold means a correct FREE comparison; never canonical accepted evidence/Green.
     var buttons=options.querySelectorAll?.('.pronoun-comparison-option')||[];
     Array.prototype.forEach.call(buttons,function(x){
      x.setAttribute('aria-pressed',String(x===button));
      x.setAttribute('data-pronoun-free-correct',String(x===button&&result.result==='pass'));
     });
     trace.push(Object.freeze({learnerId:input.learnerId||null,experienceId:input.experienceId,
      language:lang,caseId:situation.id||'legacy',choice:a.id,result:result.result,
      evidenceProduced:false,greenPass:false}));
     feedback.replaceChildren?.();
     if(result.result==='pass'){
      feedback.textContent=copy(situation,'correctFeedback',lang==='es'?'¡Correcto!':'Correto!');
      var complete=append(doc,feedback,'span','pronoun-comparison-complete',
       copy(situation,'completedQuestion',''));
      if(!complete.textContent)complete.remove?.();
     }else feedback.textContent=copy(situation,'retryFeedback',
       lang==='es'?'Observa si elegimos uno o varios quesos.':'Observe se escolhemos um queijo ou vários.');
    };
   });
  });
  // Corpus-owned complementary section always follows canonical alternatives.
  anchor.parentNode.insertBefore(panel,anchor.nextSibling);
  return true;
 }
 return Object.freeze({evaluate:evaluate,mount:mount,getTrace:function(){return Object.freeze(trace.slice());}});
});
