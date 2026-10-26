// JAGUAR H14.59 - READ-ONLY assessment scope/origin applicability review.
// PATITA H14.57 -> declared policy H14.58 -> retained browser scope check.
// Not a trust issuer, admission ticket, evaluator, Evidence or Green Pass.
(function(root,factory){
 var api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SIYAYOH1459ScopedApplicability=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
var LANGS=['en','es','pt'];
var COPY={
en:{title:'EVAL-08 · ORIGIN / LANGUAGE SCOPE REVIEW',
 lead:'Read-only browser continuity. NICK is not authenticated identity; an observed retained scope does not authorize assessment.',
 empty:'No recorded candidate for the current NICK.',
 open:'CONTEXT ONLY · NO CONTRACT',unlisted:'SKILL NOT POLICY-LISTED',
 declared:'DECLARED START · AUTHORITY PENDING',
 existing:'DECLARED START · SAVED SCOPE OBSERVED',
 missing:'RESUME DECLARED · NO MATCHING RETAINED ORIGIN',
 found:'RESUME DECLARED · ONE RETAINED ORIGIN OBSERVED',
 ambiguous:'RESUME DECLARED · MULTIPLE ORIGINS · REVIEW',
 end:'PATITA cannot select or score. Accepted Evidence appears only through Learning Trail / Word Path.'},
es:{title:'EVAL-08 · REVISIÓN DE ORIGEN E IDIOMA',
 lead:'Continuidad del navegador solamente. NICK no es autenticación; un ámbito guardado no autoriza evaluar.',
 empty:'Sin candidatos del NICK actual.',
 open:'CONTEXTO · SIN CONTRATO',unlisted:'HABILIDAD FUERA DE POLÍTICA',
 declared:'INICIO DECLARADO · AUTORIDAD PENDIENTE',
 existing:'INICIO DECLARADO · ÁMBITO GUARDADO',
 missing:'RETOMADA · SIN ORIGEN GUARDADO',
 found:'RETOMADA · UN ORIGEN GUARDADO',
 ambiguous:'RETOMADA · ORÍGENES MÚLTIPLES',
 end:'PATITA no puntúa. Solo Evidence canónica aceptada aparece en Learning Trail / Word Path.'},
pt:{title:'EVAL-08 · REVISÃO DE ORIGEM E IDIOMA',
 lead:'Continuidade do navegador somente. NICK não é autenticação; escopo salvo não autoriza avaliar.',
 empty:'Nenhum candidato registrado para o NICK atual.',
 open:'SÓ CONTEXTO · SEM CONTRATO',unlisted:'HABILIDADE FORA DA POLÍTICA',
 declared:'INÍCIO DECLARADO · AUTORIDADE PENDENTE',
 existing:'INÍCIO DECLARADO · ESCOPO SALVO OBSERVADO',
 missing:'RETOMADA · SEM ORIGEM SALVA',
 found:'RETOMADA · UMA ORIGEM SALVA',
 ambiguous:'RETOMADA · MÚLTIPLAS ORIGENS · REVISAR',
 end:'PATITA não avalia. Somente Evidence aceita aparece no Learning Trail / Word Path.'}
};
function t(x){return typeof x==='string'?x.trim():'';}
function exactKey(scope,scopeApi,nick,skill,language){
 if(!scope||!scopeApi||typeof scopeApi.valid!=='function'||!scopeApi.valid(scope))return false;
 return scope.learnerId===nick&&scope.skill===skill&&scope.language===language;
}
function parseRetained(item,scopeApi,nick,skill,language){
 if(!item||item.language!==language||typeof item.scopeKey!=='string'||!t(item.originExperienceId))return null;
 var parts;
 try{parts=JSON.parse(item.scopeKey);}catch(_){return null;}
 if(!Array.isArray(parts)||parts.length!==4||parts[0]!==nick||parts[1]!==skill||parts[2]!==language||
     parts[3]!==item.originExperienceId)return null;
 var scope=scopeApi.create({learnerId:nick,skill,language,originExperienceId:parts[3]});
 return exactKey(scope,scopeApi,nick,skill,language)&&scope.key===item.scopeKey?scope:null;
}
function inspect(input){
 input=input||{};
 var nick=t(input.nick),rows=Array.isArray(input.authorityRows)?input.authorityRows:[],
     corpus=Array.isArray(input.experiences)?input.experiences:[],
     contractApi=input.contractApi,policy=input.authorityPolicy,scopeApi=input.scopeApi,
     listRetained=input.listRetained;
 if(!nick||typeof contractApi?.inspect!=='function'||typeof scopeApi?.create!=='function'||
     typeof scopeApi?.valid!=='function')return Object.freeze([]);
 var allowed=Array.isArray(policy?.contractAuthoritySkills)?policy.contractAuthoritySkills:[],
     experiences=new Map(corpus.filter(x=>x&&t(x.id)).map(x=>[x.id,x])),out=[],seen=new Set();
 for(const hint of rows){
  // No authority from H14.58 flags. Revalidate against authored QW and policy.
  if(!hint||hint.authorityGranted!==false||hint.verifiedIdentity!==false||
     hint.canCreateAttempt!==false||hint.canIssueEvidence!==false||hint.canGrantGreenPass!==false||
     hint.selectionRequested!==false||hint.realSessionAuthorized!==false||hint.contractLoaded!==false)continue;
  var id=t(hint.experienceId),qw=t(hint.questionWord).toLowerCase(),lang=t(hint.language).toLowerCase(),
      unique=JSON.stringify([id,qw,lang]),exp=experiences.get(id);
  if(!exp||!LANGS.includes(lang)||seen.has(unique))continue;
  var question=Array.isArray(exp.thinkingMind)?exp.thinkingMind.find(x=>x&&t(x.questionWord).toLowerCase()===qw):null;
  if(!question||!t(question.question?.[lang]))continue;
  var c=contractApi.inspect(question,null);
  if(!c||c.questionWord!==qw||t(hint.skill)!==(c.assessmentSkill||''))continue;
  var declared=!!(c.assessmentDeclared||c.resumeOnly),listed=declared&&allowed.includes(c.assessmentSkill),
      expected=!declared?'NO_DECLARED_CONTRACT':!listed?'POLICY_NOT_LISTED':
        c.resumeOnly?'RESUME_ORIGIN_UNVERIFIED':'DECLARED_POLICY_LISTED_NOT_AUTHORIZED';
  if(hint.status!==expected)continue;
  seen.add(unique);
  var retained=[];
  if(listed&&typeof listRetained==='function'){
   try{
    var options=listRetained(c.assessmentSkill,lang);
    retained=(Array.isArray(options)?options:[]).map(x=>parseRetained(x,scopeApi,nick,c.assessmentSkill,lang))
       .filter(Boolean);
   }catch(_e){retained=[];}
  }
  // Deduplicate only exact owned scope; never combine EN, ES, PT or origins.
  var byOrigin=new Map(retained.map(s=>[s.originExperienceId,s]));
  var validOrigins=[];
  if(listed&&c.resumeOnly){
   for(const originId of byOrigin.keys()){
    var origin=experiences.get(originId);
    var start=origin&&Array.isArray(origin.thinkingMind)&&origin.thinkingMind.find(q=>
      q&&t(q.questionWord).toLowerCase()===qw&&q.assessmentTarget?.skill===c.assessmentSkill&&
      q.assessmentTarget?.definitionPath===c.definitionPath);
    // Current authorized code limits *retained transfer* to the explicitly
    // connected one-hop next Experience. Navigation freedom remains unrestricted.
    if(start&&t(origin.toroidalNext?.nextExperience)===id)validOrigins.push(originId);
   }
  }
  var current=byOrigin.has(id),status=!declared?'NO_DECLARED_CONTRACT':
    !listed?'POLICY_NOT_LISTED':
    c.resumeOnly?(validOrigins.length>1?'MULTIPLE_RETAINED_ORIGINS':
      validOrigins.length===1?'ONE_RETAINED_ORIGIN':'NO_RETAINED_ORIGIN'):
    current?'DECLARED_START_RETAINED_SCOPE':'DECLARED_START_NOT_AUTHORIZED';
  out.push(Object.freeze({
   experienceId:id,questionWord:qw,language:lang,skill:declared?c.assessmentSkill:null,
   status:status,requiresOriginCheck:!!c.resumeOnly,
   retainedOriginCount:c.resumeOnly?validOrigins.length:(current?1:0),
   // These are browser continuity candidates, not verified authenticated scopes.
   observedOrigins:Object.freeze(c.resumeOnly?validOrigins.slice():(current?[id]:[])),
   policyListed:!!listed,linkedNicknameOnly:true,
   scopeAuthorization:'NOT_VERIFIED',serverIdentityVerified:false,contractExecutionAuthorized:false,
   canSubmitAttempt:false,canIssueEvidence:false,canGrantGreenPass:false,
   automaticallySelect:false,automaticallyResume:false
  }));
 }
 return Object.freeze(out.sort((a,b)=>a.experienceId.localeCompare(b.experienceId)||
  a.questionWord.localeCompare(b.questionWord)||LANGS.indexOf(a.language)-LANGS.indexOf(b.language)));
}
function refresh(input){
 input=input||{};
 var doc=input.document||root.document,panel=doc?.getElementById?.('h1459ScopeReview');
 if(!panel)return null;
 var search=root.location?.search||'';
 if(!/(?:^|[?&])h14_59=inspect(?:&|$)/.test(search)){panel.hidden=true;return null;}
 var nick=root.SIYAYOVerbExplorerLearnerIdentitySource?.getId?.()||'',
     records=root.SIYAYOPatitaInteractionTrail?.getVisibleRecords?.()||[],
     experiences=input.experiences||[],contractApi=root.SIYAYOQuestionWordAssessmentContract,
     policy=root.GreenPassAuthorityPolicy;
 var observed=root.SIYAYOH1457OpportunityBridge?.inspect?.({
    nick,observations:records,experiences,contractApi
 })||[];
 var authority=root.SIYAYOH1458AuthorityReview?.inspect?.({
    nick,observedOpportunities:observed,experiences,contractApi,authorityPolicy:policy
 })||[];
 var selection=root.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
 var results=inspect({
   nick,authorityRows:authority,experiences,contractApi,authorityPolicy:policy,
   scopeApi:root.AdaptiveAssessmentScope,
   listRetained:(skill,lang)=>selection?.getRetainedProgress?.(skill,lang)||[]
 });
 var lang=LANGS.includes(input.language)?input.language:'en',copy=COPY[lang];
 panel.replaceChildren();
 var node=(tag,s)=>{var e=doc.createElement(tag);e.textContent=String(s||'');return e;};
 panel.appendChild(node('h4',copy.title));panel.appendChild(node('p',copy.lead));
 if(!results.length)panel.appendChild(node('p',copy.empty));
 else{
  var list=node('ul');
  results.forEach(row=>{
    var k=row.status,txt=k==='NO_DECLARED_CONTRACT'?copy.open:k==='POLICY_NOT_LISTED'?copy.unlisted:
      k==='DECLARED_START_RETAINED_SCOPE'?copy.existing:
      k==='DECLARED_START_NOT_AUTHORIZED'?copy.declared:
      k==='ONE_RETAINED_ORIGIN'?copy.found:k==='MULTIPLE_RETAINED_ORIGINS'?copy.ambiguous:copy.missing;
    var li=node('li',row.experienceId+' · '+row.questionWord.toUpperCase()+' · '+row.language.toUpperCase()+
      ' · '+txt+(row.observedOrigins.length?' · '+row.observedOrigins.join(', '):''));
    li.dataset.authority='none';li.dataset.status=k;
    list.appendChild(li);
  });panel.appendChild(list);
 }
 panel.appendChild(node('small',copy.end));
 panel.dataset.authority='read-only-scope-review';panel.dataset.evidenceProduced='false';panel.hidden=false;
 return results;
}
return Object.freeze({inspect,refresh});
});
