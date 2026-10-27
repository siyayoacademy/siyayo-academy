// SIYAYO WHY production review PREVIEW — read-only, no teacher model or evaluator.
// Draft prompts are for human review, NOT for a learner to submit or earn credit.
(function(root,factory){
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SIYAYOWHYProductionReviewPreview=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
const LANGS=Object.freeze(['en','es','pt']);
const ORIGINS=Object.freeze(['shopping-for-dinner','preparing-dinner']);
const DIMENSIONS=Object.freeze(['question-function','reason-answer(local)','reason-answer(transfer)']);
const TEXT={
 en:{title:'WHY · HUMAN REVIEW PREVIEW',notice:'Not yet an assessment. Human approval and trusted identity are required before any learner credit.',pending:'Independent causal-function prompt needs teacher authoring',local:'Local contextual reason · draft',transfer:'Other Experience · draft transfer',source:'Source',target:'Transfer',blocked:'DRAFT · ASSESSMENT DISABLED',status:'No Evidence or Green Pass from this review.',missing:'Source unavailable — no review displayed',origin:'Origin'},
 es:{title:'WHY · VISTA DE REVISIÓN PEDAGÓGICA',notice:'Todavía no es evaluación. Requiere homologación humana e identidad confiable.',pending:'La pregunta independiente de función causal requiere redacción docente',local:'Razón contextual local · borrador',transfer:'Otra Experience · transferencia en borrador',source:'Origen',target:'Transferencia',blocked:'BORRADOR · EVALUACIÓN DESACTIVADA',status:'Sin Evidence ni Green Pass por esta revisión.',missing:'Fuente no disponible — no se muestra revisión',origin:'Origen'},
 pt:{title:'WHY · PRÉVIA DE HOMOLOGAÇÃO PEDAGÓGICA',notice:'Ainda não é avaliação. Exige homologação humana e identidade confiável antes de qualquer crédito.',pending:'Enunciado independente da função causal exige autoria docente',local:'Justificativa contextual local · rascunho',transfer:'Outra Experience · transferência em rascunho',source:'Origem',target:'Transferência',blocked:'RASCUNHO · AVALIAÇÃO DESATIVADA',status:'Esta prévia não concede Evidence ou Green Pass.',missing:'Fonte indisponível — revisão não exibida',origin:'Origem'}
};
const txt=x=>typeof x==='string'?x.trim():'';
function inspect({experiences}={}){
 if(!Array.isArray(experiences))return Object.freeze([]);
 const byId=new Map(experiences.filter(x=>txt(x?.id)).map(x=>[x.id,x]));
 const packets=[];
 for(const origin of ORIGINS){
   const transfer=ORIGINS.find(x=>x!==origin);
   const src=byId.get(origin),dest=byId.get(transfer);
   const qs=src?.thinkingMind?.find(q=>q.questionWord==='why');
   const qt=dest?.thinkingMind?.find(q=>q.questionWord==='why');
   if(!qs||!qt||!qs.presentationGrounding||!qt.presentationGrounding||
      qs.assessmentTarget||qs.assessmentResumeTarget||
      qt.assessmentTarget||qt.assessmentResumeTarget)return Object.freeze([]);
   for(const language of LANGS){
     const local=txt(qs.question?.[language]),trans=txt(qt.question?.[language]);
     if(!local||!trans)return Object.freeze([]);
     packets.push(Object.freeze({
       id:'WHY-REVIEW-'+origin+'-'+language,originExperienceId:origin,
       transferExperienceId:transfer,language,questionWord:'why',
       proposedContract:origin==='shopping-for-dinner'?'WHY-S1-S2-DRAFT':'WHY-S2-S1-DRAFT',
       draftPrompts:Object.freeze([
         Object.freeze({dimension:DIMENSIONS[0],text:null,authoringRequired:true,experienceId:origin}),
         Object.freeze({dimension:DIMENSIONS[1],text:local,authoringRequired:false,experienceId:origin}),
         Object.freeze({dimension:DIMENSIONS[2],text:trans,authoringRequired:false,experienceId:transfer})
       ]),
       contractAuthorized:false,humanHomologated:false,
       canSubmitAttempt:false,canGrantGreenPass:false,canIssueEvidence:false
     }));
   }
 }
 return Object.freeze(packets);
}
function refresh({document:doc,experiences,language,activeExperienceId}={}){
 doc=doc||root.document;
 const panel=doc?.getElementById?.('whyProductionReviewPreview');
 if(!panel)return null;
 const search=root.location?.search||'';
 if(!/(?:^|[?&])why_production_review=preview(?:&|$)/.test(search)){
  panel.hidden=true;return null;
 }
 const lang=LANGS.includes(language)?language:'en',copy=TEXT[lang];
 const all=inspect({experiences});
 const rows=all.filter(x=>x.language===lang);
 // textContent + createElement prevents injecting corpus HTML into review stage.
 panel.replaceChildren();
 const make=(tag,value)=>{const item=doc.createElement(tag);if(value!==undefined)item.textContent=String(value);return item;};
 panel.appendChild(make('h4',copy.title));
 panel.appendChild(make('p',copy.notice));
 if(rows.length!==2){panel.appendChild(make('p',copy.missing));panel.dataset.authority='none';panel.hidden=false;return [];}
 const list=make('div');list.className='why-production-review-grid';
 rows.forEach(p=>{
   const card=make('article');
   card.className='why-production-review-card';
   card.dataset.reviewPlan=p.id;
   card.dataset.homologated='false';
   const h=make('h5',copy.origin+': '+p.originExperienceId+' · '+lang.toUpperCase());
   card.appendChild(h);
   p.draftPrompts.forEach((slot,i)=>{
     const section=make('div');section.className='why-production-review-dimension';
     section.appendChild(make('strong',i===0?copy.pending:i===1?copy.local:copy.transfer));
     if(slot.text)section.appendChild(make('p',slot.text));
     else section.appendChild(make('p','—'));
     card.appendChild(section);
   });
   card.appendChild(make('small',copy.blocked));
   if(activeExperienceId===p.originExperienceId)card.dataset.currentOrigin='true';
   list.appendChild(card);
 });
 panel.appendChild(list);
 panel.appendChild(make('small',copy.status));
 panel.dataset.authority='human-review-only';
 panel.dataset.evidenceProduced='false';
 panel.dataset.contractAuthorized='false';
 panel.hidden=false;
 return rows;
}
return Object.freeze({inspect,refresh});
});
