// JAGUAR H14.60 - proposal-only handoff from H14.59 scoped candidates.
// No selection, readiness, attempt, evaluator, canonical evidence or Green Pass.
// A visible NICK and saved browser progress are not an authenticated identity.
(function(root,factory){
 var api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SIYAYOH1460ContractReferralProposal=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 var LANGS=['en','es','pt'];
 var TEXT={
  en:{title:'EVAL-08 · REFERRAL PROPOSALS',lead:'Read-only candidates. An authorized server identity, contract and direct action are still required.',empty:'No contextual candidate for this NICK.',start:'START PROPOSAL · UNVERIFIED',resume:'RESUME PROPOSAL · UNVERIFIED',missing:'ORIGIN NOT CONFIRMED',none:'NO CONTRACT',denied:'NOT POLICY-LISTED',foot:'PATITA cannot start or score assessments. Learning Trail / Word Path show accepted canonical evidence only.'},
  es:{title:'EVAL-08 · PROPUESTAS DE DERIVACIÓN',lead:'Candidatos solo de lectura. La identidad, el contrato y la acción directa deben verificarse.',empty:'Ningún candidato contextual para este NICK.',start:'PROPUESTA DE INICIO · NO VERIFICADA',resume:'PROPUESTA DE RETOMADA · NO VERIFICADA',missing:'ORIGEN NO CONFIRMADO',none:'SIN CONTRATO',denied:'FUERA DE POLÍTICA',foot:'PATITA no inicia ni puntúa. Learning Trail / Word Path muestran solo evidencias canónicas aceptadas.'},
  pt:{title:'EVAL-08 · PROPOSTAS DE ENCAMINHAMENTO',lead:'Candidatos somente de leitura. Identidade, contrato e ação direta precisam ser verificados.',empty:'Nenhum candidato contextual para este NICK.',start:'PROPOSTA DE INÍCIO · NÃO VERIFICADA',resume:'PROPOSTA DE RETOMADA · NÃO VERIFICADA',missing:'ORIGEM NÃO CONFIRMADA',none:'SEM CONTRATO',denied:'FORA DA POLÍTICA',foot:'PATITA não inicia nem pontua. Learning Trail e Word Path mostram apenas evidências canônicas aceitas.'}
 };
 function t(s){return typeof s==='string'?s.trim():'';}
 function inspect({nick,scopedRows,experiences,contractApi,authorityPolicy}={}){
  if(!t(nick)||typeof contractApi?.inspect!=='function')return Object.freeze([]);
  var byId=new Map((Array.isArray(experiences)?experiences:[]).filter(e=>t(e?.id)).map(e=>[e.id,e]));
  var listed=Array.isArray(authorityPolicy?.contractAuthoritySkills)?authorityPolicy.contractAuthoritySkills:[];
  var output=[],seen=new Set();
  for(const row of Array.isArray(scopedRows)?scopedRows:[]){
   if(!row||row.scopeAuthorization!=='NOT_VERIFIED'||row.serverIdentityVerified!==false||
     row.contractExecutionAuthorized!==false||row.canSubmitAttempt!==false||
     row.canIssueEvidence!==false||row.canGrantGreenPass!==false||
     row.automaticallySelect!==false||row.automaticallyResume!==false||row.linkedNicknameOnly!==true)continue;
   var id=t(row.experienceId),lang=t(row.language).toLowerCase(),qw=t(row.questionWord).toLowerCase();
   var k=JSON.stringify([id,qw,lang]),ex=byId.get(id);
   if(seen.has(k)||!ex||!LANGS.includes(lang))continue;
   var question=Array.isArray(ex.thinkingMind)?ex.thinkingMind.find(q=>t(q?.questionWord).toLowerCase()===qw):null;
   if(!question||!t(question.question?.[lang]))continue;
   var c=contractApi.inspect(question,null);
   if(!c||c.questionWord!==qw||t(c.assessmentSkill)!==t(row.skill))continue;
   var hasTarget=!!(c.assessmentDeclared||c.resumeOnly);
   var allowlisted=hasTarget&&listed.includes(c.assessmentSkill);
   if(row.policyListed!==!!allowlisted)continue;
   var origin=null,state;
   if(!hasTarget&&row.status==='NO_DECLARED_CONTRACT')state='NO_CONTRACT';
   else if(hasTarget&&!allowlisted&&row.status==='POLICY_NOT_LISTED')state='POLICY_NOT_LISTED';
   else if(allowlisted&&c.assessmentDeclared&&
     ['DECLARED_START_NOT_AUTHORIZED','DECLARED_START_RETAINED_SCOPE'].includes(row.status)){
       state='START_PROPOSAL_UNVERIFIED';origin=id;
     }
   else if(allowlisted&&c.resumeOnly&&row.status==='ONE_RETAINED_ORIGIN'&&
       row.retainedOriginCount===1&&Array.isArray(row.observedOrigins)&&row.observedOrigins.length===1){
       var candidateOrigin=t(row.observedOrigins[0]),originEx=byId.get(candidateOrigin);
       var originQuestion=originEx&&Array.isArray(originEx.thinkingMind)?
         originEx.thinkingMind.find(q=>t(q?.questionWord).toLowerCase()===qw):null;
       if(originQuestion?.assessmentTarget?.skill===c.assessmentSkill&&
         originQuestion.assessmentTarget.definitionPath===c.definitionPath&&
         originEx.toroidalNext?.nextExperience===id){
           state='RESUME_PROPOSAL_UNVERIFIED';origin=candidateOrigin;
       }else state='ORIGIN_NOT_VERIFIED';
     }
   else if(allowlisted&&c.resumeOnly&&
     ['NO_RETAINED_ORIGIN','MULTIPLE_RETAINED_ORIGINS','ONE_RETAINED_ORIGIN'].includes(row.status))
       state='ORIGIN_NOT_VERIFIED';
   else continue;
   seen.add(k);
   output.push(Object.freeze({
    experienceId:id,questionWord:qw,language:lang,
    skill:hasTarget?c.assessmentSkill:null,
    definitionPath:hasTarget?c.definitionPath:null,
    proposedOriginExperienceId:origin,proposalKind:state,
    // The proposal contains no proof, event occurrence, token or authority.
    authorized:false,serverVerified:false,actionVerified:false,
    maySubmitAttempt:false,mayStartSession:false,mayIssueEvidence:false,
    mayGrantGreenPass:false,automaticForward:false
   }));
  }
  return Object.freeze(output.sort((a,b)=>a.experienceId.localeCompare(b.experienceId)||
    a.questionWord.localeCompare(b.questionWord)||LANGS.indexOf(a.language)-LANGS.indexOf(b.language)));
 }
 function refresh(input){
  input=input||{};
  var doc=input.document||root.document,panel=doc?.getElementById?.('h1460ReferralReview');
  if(!panel)return null;
  var search=root.location?.search||'';
  if(!/(?:^|[?&])h14_60=inspect(?:&|$)/.test(search)){panel.hidden=true;return null;}
  var nick=root.SIYAYOVerbExplorerLearnerIdentitySource?.getId?.()||'';
  var records=root.SIYAYOPatitaInteractionTrail?.getVisibleRecords?.()||[];
  var experiences=input.experiences||[],contractApi=root.SIYAYOQuestionWordAssessmentContract,
    policy=root.GreenPassAuthorityPolicy;
  var observed=root.SIYAYOH1457OpportunityBridge?.inspect?.({nick,observations:records,experiences,contractApi})||[];
  var authority=root.SIYAYOH1458AuthorityReview?.inspect?.({nick,observedOpportunities:observed,
    experiences,contractApi,authorityPolicy:policy})||[];
  var selection=root.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
  var scoped=root.SIYAYOH1459ScopedApplicability?.inspect?.({nick,authorityRows:authority,
    experiences,contractApi,authorityPolicy:policy,scopeApi:root.AdaptiveAssessmentScope,
    listRetained:(skill,lang)=>selection?.getRetainedProgress?.(skill,lang)||[]})||[];
  var result=inspect({nick,scopedRows:scoped,experiences,contractApi,authorityPolicy:policy});
  var language=LANGS.includes(input.language)?input.language:'en',copy=TEXT[language];
  panel.replaceChildren();
  var add=(tag,value)=>{var elem=doc.createElement(tag);elem.textContent=String(value||'');return elem;};
  panel.appendChild(add('h4',copy.title));panel.appendChild(add('p',copy.lead));
  if(!result.length)panel.appendChild(add('p',copy.empty));
  else{
   var list=add('ul');
   result.forEach(p=>{
    var label=p.proposalKind==='START_PROPOSAL_UNVERIFIED'?copy.start:
      p.proposalKind==='RESUME_PROPOSAL_UNVERIFIED'?copy.resume:
      p.proposalKind==='ORIGIN_NOT_VERIFIED'?copy.missing:
      p.proposalKind==='POLICY_NOT_LISTED'?copy.denied:copy.none;
    var node=add('li',p.experienceId+' · '+p.questionWord.toUpperCase()+' · '+p.language.toUpperCase()+
      ' · '+label+(p.proposedOriginExperienceId?' · '+p.proposedOriginExperienceId:''));
    node.dataset.authority='none';node.dataset.status=p.proposalKind;list.appendChild(node);
   });panel.appendChild(list);
  }
  panel.appendChild(add('small',copy.foot));
  panel.dataset.authority='proposal-only';panel.dataset.evidenceProduced='false';panel.hidden=false;
  return result;
 }
 return Object.freeze({inspect,refresh});
});
