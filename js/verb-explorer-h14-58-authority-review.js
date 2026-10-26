// JAGUAR H14.58 — PATITA H14.57 observation -> EVAL-08 authority CANDIDATE.
// READ-ONLY, browser optional preview. Never adopts a target or starts assessment.
// In particular, policy-listing and NICK are NOT contract authorization/authentication.
(function(root,factory){
 var api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SIYAYOH1458AuthorityReview=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
var LANGS=Object.freeze(['en','es','pt']);
var COPY={
en:{title:'EVAL-08 · CONTRACT APPLICABILITY REVIEW',intro:'PATITA identifies a context; only an authorized assessment contract may decide or grant progress.',empty:'No observed candidate for the current NICK.',none:'NO DECLARED CONTRACT',candidate:'DECLARED · POLICY-LISTED · NOT AUTHORIZED',resume:'RESUME DECLARED · ORIGIN / SESSION CHECK REQUIRED',denied:'NOT LISTED IN ASSESSMENT POLICY',end:'Read-only review. Learning Trail / Word Path display accepted canonical evidence only.'},
es:{title:'EVAL-08 · REVISIÓN DE APLICABILIDAD',intro:'PATITA identifica el contexto; solo el contrato autorizado puede evaluar y acreditar progreso.',empty:'No hay candidatos observados para el NICK actual.',none:'SIN CONTRATO DECLARADO',candidate:'DECLARADO · EN POLÍTICA · NO AUTORIZADO',resume:'RETOMADA · VERIFICAR ORIGEN / SESIÓN',denied:'NO INCLUIDO EN POLÍTICA EVALUATIVA',end:'Revisión de solo lectura. Learning Trail / Word Path muestran únicamente evidencia canónica aceptada.'},
pt:{title:'EVAL-08 · REVISÃO DE CONTRATOS APLICÁVEIS',intro:'PATITA identifica o contexto; somente o contrato autorizado pode avaliar e reconhecer conquistas.',empty:'Nenhum candidato observado para o NICK atual.',none:'SEM CONTRATO DECLARADO',candidate:'DECLARADO · NA POLÍTICA · NÃO AUTORIZADO',resume:'RETOMADA · VERIFICAR ORIGEM / SESSÃO',denied:'FORA DA POLÍTICA AVALIATIVA',end:'Inspeção somente de leitura. Learning Trail e Word Path exibem apenas evidências canônicas aceitas.'}
};
function t(x){return typeof x==='string'?x.trim():'';}
function inspect(input){
 input=input||{};
 var corpus=Array.isArray(input.experiences)?input.experiences:[],
     observed=Array.isArray(input.observedOpportunities)?input.observedOpportunities:[],
     contractApi=input.contractApi,policy=input.authorityPolicy,
     nick=t(input.nick),out=[];
 if(!nick||!contractApi||typeof contractApi.inspect!=='function')return Object.freeze([]);
 var allowed=policy&&Array.isArray(policy.contractAuthoritySkills)?policy.contractAuthoritySkills:[];
 var experiences=new Map(corpus.filter(e=>e&&t(e.id)).map(e=>[e.id,e]));
 var seen=new Set();
 observed.forEach(function(row){
   // All H14.57 rows are hints; verify them anew against the authored source.
   if(!row||row.canSubmitAttempt!==false||row.canIssueEvidence!==false||
      row.canGrantGreenPass!==false||row.selectionRequested!==false)return;
   var experienceId=t(row.experienceId),word=t(row.questionWord).toLowerCase(),
       lang=t(row.language).toLowerCase(),key=JSON.stringify([experienceId,word,lang]);
   if(!experienceId||!word||!LANGS.includes(lang)||seen.has(key))return;
   var experience=experiences.get(experienceId);
   var question=experience&&Array.isArray(experience.thinkingMind)?
     experience.thinkingMind.find(q=>q&&t(q.questionWord).toLowerCase()===word):null;
   if(!question||!t(question.question?.[lang]))return;
   var c=contractApi.inspect(question,null);
   if(!c||c.questionWord!==word)return;
   var expected=c.assessmentDeclared?'DECLARED_TARGET_REQUIRES_AUTHORITY':
     c.resumeOnly?'RESUME_DECLARED_REQUIRES_ORIGIN':'OPPORTUNITY_ONLY';
   if(row.status!==expected||t(row.skill)!==(c.assessmentSkill||''))return;
   seen.add(key);
   var eligibleDeclaration=!!(c.assessmentDeclared||c.resumeOnly);
   // Policy allowlist does not prove an authorized Session or transfer route.
   var listed=eligibleDeclaration&&allowed.includes(c.assessmentSkill);
   var state=!eligibleDeclaration?'NO_DECLARED_CONTRACT':
     !listed?'POLICY_NOT_LISTED':
     c.resumeOnly?'RESUME_ORIGIN_UNVERIFIED':'DECLARED_POLICY_LISTED_NOT_AUTHORIZED';
   out.push(Object.freeze({
     experienceId,questionWord:word,language:lang,skill:eligibleDeclaration?c.assessmentSkill:null,
     status:state,requiresOriginCheck:!!c.resumeOnly,policyListed:!!listed,
     declared:eligibleDeclaration,authorityGranted:false,verifiedIdentity:false,
     realSessionAuthorized:false,contractLoaded:false,
     canCreateAttempt:false,canIssueEvidence:false,canGrantGreenPass:false,
     selectionRequested:false
   }));
 });
 return Object.freeze(out.sort((a,b)=>a.experienceId.localeCompare(b.experienceId)||
     a.questionWord.localeCompare(b.questionWord)||LANGS.indexOf(a.language)-LANGS.indexOf(b.language)));
}
function refresh(input){
 input=input||{};
 var doc=input.document||root.document,panel=doc&&doc.getElementById('h1458AuthorityReview');
 if(!panel)return null;
 var search=root.location&&root.location.search||'';
 if(!/(?:^|[?&])h14_58=inspect(?:&|$)/.test(search)){panel.hidden=true;return null;}
 var nick=root.SIYAYOVerbExplorerLearnerIdentitySource?.getId?.()||'',
     records=root.SIYAYOPatitaInteractionTrail?.getVisibleRecords?.()||[];
 // Recompute from H14.57, never trust PATITA directly as a target.
 var rows=root.SIYAYOH1457OpportunityBridge?.inspect?.({
   nick,observations:records,experiences:input.experiences,
   contractApi:root.SIYAYOQuestionWordAssessmentContract
 })||[];
 var mapped=inspect({nick,observedOpportunities:rows,experiences:input.experiences,
   contractApi:root.SIYAYOQuestionWordAssessmentContract,
   authorityPolicy:root.GreenPassAuthorityPolicy});
 var lang=LANGS.includes(input.language)?input.language:'en',copy=COPY[lang];
 panel.replaceChildren();
 var elem=(tag,value)=>{var n=doc.createElement(tag);n.textContent=String(value||'');return n;};
 panel.appendChild(elem('h4',copy.title));panel.appendChild(elem('p',copy.intro));
 if(!mapped.length)panel.appendChild(elem('p',copy.empty));
 else{
  var list=elem('ul');
  mapped.forEach(x=>{
    var label=x.status==='DECLARED_POLICY_LISTED_NOT_AUTHORIZED'?copy.candidate:
      x.status==='RESUME_ORIGIN_UNVERIFIED'?copy.resume:
      x.status==='POLICY_NOT_LISTED'?copy.denied:copy.none;
    var line=elem('li',x.experienceId+' · '+x.questionWord.toUpperCase()+' · '+x.language.toUpperCase()+' · '+label);
    line.dataset.authority='none';line.dataset.status=x.status;
    list.appendChild(line);
  });panel.appendChild(list);
 }
 panel.appendChild(elem('small',copy.end));
 panel.dataset.authority='inspection-only';panel.dataset.evidenceProduced='false';panel.hidden=false;
 return mapped;
}
return Object.freeze({inspect,refresh});
});
