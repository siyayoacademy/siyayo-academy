// JAGUAR H14.57 - opt-in READ-ONLY integration into actual Explorer render cycle.
// PATITA observations are discovery hints, never Attempt/Evidence/Green or an
// authorization to select/activate an assessment.
(function(root,factory){
  var api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOH1457OpportunityBridge=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
var LANGS=['en','es','pt'];
var labels={
 en:{head:'PATITA · CONTEXTUAL OPPORTUNITY REVIEW',intro:'Observation only. A declared contract still requires separate assessment authorization.',none:'No observed QW interaction linked to the current NICK.',open:'OPPORTUNITY · NO ASSESSMENT',declared:'DECLARED TARGET · ASSESSMENT GATE REQUIRED',resume:'RESUME TARGET · ORIGIN CHECK REQUIRED',footer:'Accepted achievements remain exclusively in Learning Trail / Word Path.'},
 es:{head:'PATITA · REVISIÓN DE OPORTUNIDADES CONTEXTUALES',intro:'Solo observación. Un contrato declarado requiere autorización evaluativa independiente.',none:'No hay interacciones QW observadas para el NICK activo.',open:'OPORTUNIDAD · SIN EVALUACIÓN',declared:'DESTINO DECLARADO · REQUIERE AUTORIZACIÓN',resume:'RETOMADA DECLARADA · VERIFICAR ORIGEN',footer:'Los logros aceptados se muestran exclusivamente en Learning Trail / Word Path.'},
 pt:{head:'PATITA · REVISÃO DE OPORTUNIDADES CONTEXTUAIS',intro:'Somente observação. Contrato declarado ainda exige autorização avaliativa independente.',none:'Nenhuma interação QW observada para o NICK ativo.',open:'OPORTUNIDADE · SEM AVALIAÇÃO',declared:'ALVO DECLARADO · EXIGE AUTORIZAÇÃO',resume:'RETOMADA DECLARADA · VERIFICAR ORIGEM',footer:'Conquistas aceitas aparecem exclusivamente no Learning Trail / Word Path.'}
};
function text(v){return typeof v==='string'?v.trim():'';}
function getContext(r){
 if(!r||r.evidenceProduced!==false||!['patita-interaction','patita-observed-result'].includes(r.kind))return null;
 var a=r.after||{},b=r.before||{};
 var language=text(r.language||a.language||b.language).toLowerCase();
 var experienceId=text(r.experienceId||a.experienceId||b.experienceId);
 var questionWord=text(r.questionWord||a.questionWord||b.questionWord).toLowerCase();
 if(!experienceId||!questionWord||!LANGS.includes(language))return null;
 return {experienceId:experienceId,language:language,questionWord:questionWord};
}
function inspect(input){
 input=input||{};
 var nick=text(input.nick),records=Array.isArray(input.observations)?input.observations:[],
     corpus=Array.isArray(input.experiences)?input.experiences:[],
     api=input.contractApi;
 if(!nick||!api||typeof api.inspect!=='function')return Object.freeze([]);
 var byKey=new Map(),expById=new Map(corpus.filter(x=>x&&text(x.id)).map(x=>[x.id,x]));
 records.forEach(function(record){
  if(!record||text(record.learnerId)!==nick)return;
  var ctx=getContext(record);if(!ctx)return;
  var experience=expById.get(ctx.experienceId);
  var q=experience&&Array.isArray(experience.thinkingMind)&&experience.thinkingMind.find(x=>x&&text(x.questionWord).toLowerCase()===ctx.questionWord);
  if(!q||!text(q.question?.[ctx.language]))return;
  var contract=api.inspect(q,null);
  if(!contract)return;
  var status=contract.assessmentDeclared?'DECLARED_TARGET_REQUIRES_AUTHORITY':contract.resumeOnly?'RESUME_DECLARED_REQUIRES_ORIGIN':'OPPORTUNITY_ONLY';
  var key=JSON.stringify([nick,ctx.experienceId,ctx.questionWord,ctx.language]);
  var prior=byKey.get(key);
  if(prior){prior.observations+=1;return;}
  byKey.set(key,{experienceId:ctx.experienceId,questionWord:ctx.questionWord,language:ctx.language,
    status:status,skill:status==='OPPORTUNITY_ONLY'?null:contract.assessmentSkill,observations:1});
 });
 return Object.freeze(Array.from(byKey.values()).sort((a,b)=>a.experienceId.localeCompare(b.experienceId)||a.questionWord.localeCompare(b.questionWord)||a.language.localeCompare(b.language)).map(x=>Object.freeze({
   experienceId:x.experienceId,questionWord:x.questionWord,language:x.language,
   status:x.status,skill:x.skill,observations:x.observations,
   canSubmitAttempt:false,canIssueEvidence:false,canGrantGreenPass:false,selectionRequested:false
 })));
}
function refresh(input){
 input=input||{};
 var doc=input.document||((typeof document!=='undefined')?document:null);
 var panel=doc&&doc.getElementById('h1457OpportunityReview');
 if(!panel)return null;
 var search=root.location&&root.location.search||'';
 if(!/(?:^|[?&])h14_57=inspect(?:&|$)/.test(search)){panel.hidden=true;return null;}
 var nick=root.SIYAYOVerbExplorerLearnerIdentitySource?.getId?.()||'';
 var rows=root.SIYAYOPatitaInteractionTrail?.getVisibleRecords?.()||[];
 var lang=input.language||root.SIYAYOVerbExplorerExperienceRuntime?.activeLanguage?.()||'en';
 if(!LANGS.includes(lang))lang='en';
 var copy=labels[lang],mapped=inspect({nick,observations:rows,experiences:input.experiences,contractApi:root.SIYAYOQuestionWordAssessmentContract});
 panel.replaceChildren();
 var docCreate=(tag,value)=>{var node=doc.createElement(tag);if(value!=null)node.textContent=String(value);return node};
 panel.appendChild(docCreate('h4',copy.head));
 panel.appendChild(docCreate('p',copy.intro));
 if(!mapped.length)panel.appendChild(docCreate('p',copy.none));
 else{
  var list=docCreate('ul');
  mapped.forEach(row=>{
   var label=row.status==='DECLARED_TARGET_REQUIRES_AUTHORITY'?copy.declared:row.status==='RESUME_DECLARED_REQUIRES_ORIGIN'?copy.resume:copy.open;
   var item=docCreate('li',row.experienceId+' · '+row.questionWord.toUpperCase()+' · '+row.language.toUpperCase()+' · '+label+' · '+row.observations);
   item.dataset.authority='none';
   item.dataset.assessmentStatus=row.status;
   list.appendChild(item);
  });panel.appendChild(list);
 }
 panel.appendChild(docCreate('small',copy.footer));
 panel.dataset.authority='observation-only';
 panel.dataset.evidenceProduced='false';
 panel.hidden=false;
 return mapped;
}
// Deliberately no event listener, no timer, no auto select or assessment API call.
// Invoked read-only after the existing Explorer render; no mutation of product state.
return Object.freeze({inspect:inspect,refresh:refresh});
});
