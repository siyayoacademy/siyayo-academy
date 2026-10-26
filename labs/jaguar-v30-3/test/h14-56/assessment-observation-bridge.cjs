'use strict';
// JAGUAR H14.56: observation -> declared opportunity -> authorized outcome display.
// READ-ONLY LABORATORY, NOT automatic assessment or a login implementation.
// Reuses existing SIYAYO QuestionWordAssessmentContract,
// AdaptiveAssessmentScope and AdaptivePassContractProgressView.
const LANGS=Object.freeze(['en','es','pt']);
const t=x=>typeof x==='string'?x.trim():'';
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
const safeArray=x=>Array.isArray(x)?x:[];
function createAssessmentObservationBridge({scopeApi,contractApi,progressView,evaluator,resolveVisualIdentity,listCanonicalContexts}={}){
 if(!scopeApi||typeof scopeApi.create!=='function'||typeof scopeApi.valid!=='function'||
    typeof scopeApi.ownsPacket!=='function'||typeof contractApi?.inspect!=='function'||
    typeof progressView?.project!=='function'||typeof evaluator?.evidenceMatchesRequirement!=='function'||
    typeof evaluator?.evaluateContract!=='function'||typeof resolveVisualIdentity!=='function'||
    typeof listCanonicalContexts!=='function')throw new TypeError('missing_explicit_contract_services');
 // No state and no side effects. All accessors are supplied by a TEST-ONLY
 // fixture: never derive authority from NICK, PATITA, localStorage or caller flags.
 function project({nick,corpus,patitaObservations,visibleExperience,visibleLanguage,visibleQw}={}){
  const activeNick=t(nick);
  const identity=activeNick?resolveVisualIdentity(activeNick):null;
  const learnerId=t(identity?.learnerId);
  const identityLinked=!!(activeNick&&identity?.linkStatus==='LAB_LINKED_IDENTITY'&&identity?.displayNick===activeNick&&learnerId);
  const observations=safeArray(patitaObservations).filter(x=>obj(x)&&
     ['patita-interaction','patita-observed-result'].includes(x.kind)&&x.evidenceProduced===false&&
     (!x.learnerId||x.learnerId===activeNick));
  const opportunities=[];
  for(const exp of safeArray(corpus?.items)){
   if(!t(exp?.id))continue;
   for(const question of safeArray(exp.thinkingMind)){
    if(!t(question?.questionWord))continue;
    // A QW capability is NOT an Assessment Target. Inspect ONLY declared
    // assessmentTarget and assessmentResumeTarget in the authored corpus.
    const cap=contractApi.inspect(question);
    if(!cap)continue;
    for(const language of LANGS){
     if(!t(question.question?.[language]))continue;
     const status=cap.assessmentDeclared?'DECLARED_TARGET_REQUIRES_AUTHORITY':
       cap.resumeOnly?'RESUME_DECLARED_REQUIRES_ORIGIN_CHECK':'OPPORTUNITY_ONLY';
     opportunities.push(Object.freeze({
       experienceId:exp.id,questionWord:cap.questionWord,language,
       status,skill:cap.assessmentSkill||null,
       isVisible:exp.id===visibleExperience&&language===visibleLanguage&&cap.questionWord===t(visibleQw).toLowerCase(),
       canCreateAttempt:false,canGrantGreen:false
     }));
    }
   }
  }
  const output={nickActive:!!activeNick,identityLinked,identityKind:identityLinked?'LAB_ONLY':'NONE',
    visibleContext:Object.freeze({experienceId:t(visibleExperience),language:t(visibleLanguage),questionWord:t(visibleQw).toLowerCase()}),
    opportunities:Object.freeze(opportunities),observationCount:observations.length,
    observationAuthority:'NONE',contractCandidates:Object.freeze([]),progress:Object.freeze([]),
    canCreateAttempt:false,canIssueEvidence:false,canGrantGreenPass:false,hasRealAuthentication:false};
  if(!identityLinked)return Object.freeze(output);
  // Contexts must be read from a *separately injected* canonical projection service,
  // not supplied in a PATITA event or a UI answer.
  let contexts;
  try{contexts=listCanonicalContexts(learnerId);}catch{return Object.freeze(output);}
  const owned=[];
  const seen=new Set();
  for(const ctx of safeArray(contexts)){
   const scope=ctx?.scope;
   if(!scopeApi.valid(scope)||scope.learnerId!==learnerId||seen.has(scope.key)||
      !obj(ctx?.passContract)||!Array.isArray(ctx.passContract.requires)||!ctx.passContract.requires.length)
      continue;
   seen.add(scope.key);
   // Filter packets by canonical scope; NEVER equate observations or 85C pending
   // with accepted evidence.
   const packets=safeArray(ctx.evidencePackets).filter(p=>scopeApi.ownsPacket(scope,p)&&p.result==='pass');
   const progress=progressView.project(ctx.passContract,packets,evaluator);
   if(!progress||!Array.isArray(progress.satisfied)||progress.satisfied.length!==ctx.passContract.requires.length)
    continue;
   const witnesses=ctx.passContract.requires.map((req,i)=>progress.satisfied[i]===true&&packets.some(p=>{
    try{return evaluator.evidenceMatchesRequirement(p,req)===true;}catch{return false;}
   }));
   const completed=witnesses.filter(Boolean).length;
   owned.push(Object.freeze({scopeKey:scope.key,learnerId,skill:scope.skill,
    language:scope.language,originExperienceId:scope.originExperienceId,
    completed,total:witnesses.length,requirements:Object.freeze(witnesses),
    projectedOnly:true,assessmentStatus:'CANONICAL_SCOPE_READ_ONLY',
    currentVisibleContext:scope.language===visibleLanguage&&scope.originExperienceId===visibleExperience,
    greenPassIssued:false}));
  }
  // Never merge different languages, origins or skills into one count;
  // the Word Path/Trail existing projectors decide how to show each row.
  const result={...output,
    contractCandidates:Object.freeze(owned.map(p=>Object.freeze({scopeKey:p.scopeKey,skill:p.skill,language:p.language,originExperienceId:p.originExperienceId}))),
    progress:Object.freeze(owned)};
  return Object.freeze(result);
 }
 return Object.freeze({project});
}
module.exports=Object.freeze({createAssessmentObservationBridge});
