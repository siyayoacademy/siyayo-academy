// JAGUAR EVAL-08 · Verified Assessment Intake Candidate.
// SERVER-ONLY. This is NOT an HTTP route or installed Worker.
// Trusted adapters must be implemented and independently attested at deployment.
// The browser/NICK/PATITA never provides an assessment decision, subject,
// contract, scope, or Evidence. Failed answer = attempt only, never credit.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const scopeApi=require('../../js/adaptive-assessment-scope.js');
const green=require('../../js/green-pass-profile.js');
const qContract=require('../../js/question-word-assessment-contract.js');
const source=require('../../data/learning/experience-seeds.json');
const skillIds=new Set(['which.use.determiner','what.use.object-question','where.use.location-question','why.use.contextual-reason']);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const tok=/^[A-Za-z0-9_.:-]{1,128}$/;
const isTok=v=>typeof v==='string'&&tok.test(v);
const isRec=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const exact=(obj,keys)=>isRec(obj)&&Object.keys(obj).sort().join('|')===keys.slice().sort().join('|');
const fail=(reason)=>Object.freeze({ok:false,status:'REJECTED',reason,attemptRecorded:false,evidenceCreated:false,greenPassIssued:false});
const allowed=['en','es','pt'];
function authoritativeTarget(action){
 const current=source.items.find(e=>e.id===action.currentExperienceId);
 const origin=source.items.find(e=>e.id===action.originExperienceId);
 const question=origin?.thinkingMind?.find(q=>q.questionWord===action.questionWord);
 const currentQ=current?.thinkingMind?.find(q=>q.questionWord===action.questionWord);
 if(!current||!origin||!question||!currentQ||!question.question?.[action.language]||
     !currentQ.question?.[action.language])return null;
 const authored=qContract.inspect(question);
 if(!authored?.assessmentDeclared||authored.assessmentSkill!==action.skill||
   !skillIds.has(action.skill))return null; // S1/S2 WHY remains context only.
 if(action.currentExperienceId===action.originExperienceId){
   if(action.phase!=='local')return null;
 }else{
   if(action.phase!=='transfer'||origin.toroidalNext?.nextExperience!==current.id)return null;
   const resume=qContract.inspect(currentQ);
   // Canonical WHY S3→S4 is allowed for a retained authorized S3 Session;
   // WHERE/WHICH other paths must respect their explicitly authored resume targets.
   if(!(action.skill==='why.use.contextual-reason'&&origin.id==='having-dinner'&&current.id==='after-dinner-conversation')&&
      !(resume?.resumeOnly&&resume.assessmentSkill===action.skill&&resume.definitionPath===authored.definitionPath))
       return null;
 }
 return Object.freeze({originExperienceId:origin.id,currentExperienceId:current.id,
   questionWord:action.questionWord,skill:authored.assessmentSkill,definitionPath:authored.definitionPath,
   language:action.language,phase:action.phase});
}
export function createVerifiedAssessmentIntakeCandidate({
  now,resolveVerifiedSession,resolveDirectAction,resolveAuthorizedContract,
  assessAuthorizedAction,commitAtomicAssessment
}={}){
 if(![now,resolveVerifiedSession,resolveDirectAction,resolveAuthorizedContract,
   assessAuthorizedAction,commitAtomicAssessment].every(x=>typeof x==='function'))
   throw new TypeError('EVAL-08 requires six trusted server adapters');
 // Deliberately no PATCH/POST route, no client-visible GREEN signal.
 return Object.freeze({async submit(req){
   if(!exact(req,['sessionHandle','actionKey','eventId'])||
      typeof req.sessionHandle!=='string'||req.sessionHandle.length<1||req.sessionHandle.length>256||
      !isTok(req.actionKey)||typeof req.eventId!=='string'||!uuid.test(req.eventId))
      return fail('invalid_request');
   let stamp;try{stamp=now();}catch{return fail('clock_unavailable');}
   if(!Number.isSafeInteger(stamp))return fail('clock_unavailable');
   try{
     const identity=await resolveVerifiedSession(req.sessionHandle);
     if(!identity||identity.verified!==true||identity.issuerVerified!==true||
        !isTok(identity.subject)||!isTok(identity.sessionId)||identity.revoked!==false||
        !Number.isSafeInteger(identity.expiresAt)||identity.expiresAt<=stamp)
       return fail('unverified_session');
     const action=await resolveDirectAction(req.actionKey);
     if(!action||action.source!=='DIRECT_LEARNER_ACTION'||action.observed!==true||
        action.actor!=='learner'||action.subject!==identity.subject||
        action.sessionId!==identity.sessionId||action.eventId!==req.eventId||
        action.actionKey!==req.actionKey||action.consumed!==false||
        !Number.isSafeInteger(action.recordedAt)||action.recordedAt>stamp||
        action.recordedAt<stamp-300||!allowed.includes(action.language)||
        !['local','transfer'].includes(action.phase)||!isTok(action.questionWord)||
        !isTok(action.skill)||!isTok(action.originExperienceId)||!isTok(action.currentExperienceId)||
        !isTok(action.dimension)||!isTok(action.mode)||action.support!=='none')
       return fail('direct_action_not_verified');
     const target=authoritativeTarget(action);
     if(!target)return fail('no_authorized_authored_target');
     // A browser session or allowlist alone does not approve a pass contract.
     // This adapter MUST query the server-maintained authorized registry.
     const contract=await resolveAuthorizedContract({
       subject:identity.subject,sessionId:identity.sessionId,skill:target.skill,
       questionWord:target.questionWord,language:target.language,
       originExperienceId:target.originExperienceId,currentExperienceId:target.currentExperienceId,
       definitionPath:target.definitionPath,phase:target.phase
     });
     if(!contract||contract.authorized!==true||contract.revoked!==false||
       contract.subject!==identity.subject||contract.sessionId!==identity.sessionId||
       contract.skill!==target.skill||contract.language!==target.language||
       contract.originExperienceId!==target.originExperienceId||
       contract.currentExperienceId!==target.currentExperienceId||
       contract.definitionPath!==target.definitionPath||
       contract.phase!==target.phase||!isTok(contract.id)||
       !isTok(contract.version)||!Number.isSafeInteger(contract.revision)||contract.revision<1||
       !Number.isSafeInteger(contract.expiresAt)||contract.expiresAt<=stamp||
       !isRec(contract.passContract)||!Array.isArray(contract.passContract.requires)||
       !contract.passContract.requires.length)
       return fail('contract_not_authorized');
     const scope=scopeApi.create({learnerId:identity.subject,
       skill:target.skill,language:target.language,originExperienceId:target.originExperienceId});
     if(!scopeApi.valid(scope))return fail('invalid_scope');
     // Correctness is computed by a trusted, independently approved evaluator;
     // caller cannot pass their own grading, language, contract or answer.
     const verdict=await assessAuthorizedAction({action,target,contract,scope});
     if(!verdict||!['pass','fail'].includes(verdict.result)||
       verdict.dimension!==action.dimension||verdict.mode!==action.mode||
       verdict.skill!==target.skill||verdict.language!==target.language||
       verdict.experienceId!==target.currentExperienceId||
       verdict.support!=='none'||!isTok(verdict.provenanceId))
       return fail('evaluator_invalid_result');
     const packet=Object.freeze({skill:target.skill,dimension:verdict.dimension,
       mode:verdict.mode,result:verdict.result,support:'none',
       context:Object.freeze({assessmentScope:scope,language:target.language,
         experienceId:target.currentExperienceId,
         fromExperienceId:target.phase==='transfer'?target.originExperienceId:null,
         occurrenceId:req.eventId})});
     if(!scopeApi.ownsPacket(scope,packet))return fail('packet_scope_invalid');
     // A passing result must actually satisfy a dimension of the authorized contract.
     if(verdict.result==='pass'&&!contract.passContract.requires.some(
       requirement=>green.evidenceMatchesRequirement(packet,requirement)))
       return fail('verdict_outside_contract');
     // Atomic writer is the sole authority to consume the event and persist the
     // attempt and possible Evidence + outbox together. No success on 'pending'.
     const receipt=await commitAtomicAssessment({
       principal:Object.freeze({subject:identity.subject,sessionId:identity.sessionId}),
       eventId:req.eventId,actionKey:req.actionKey,
       contractId:contract.id,contractVersion:contract.version,contractRevision:contract.revision,
       scope,packet,verdictProvenanceId:verdict.provenanceId
     });
     if(!receipt||receipt.atomic!==true||receipt.eventId!==req.eventId||
       !['accepted','rejected'].includes(receipt.outcome)||
       receipt.attemptRecorded!==true||
       receipt.evidenceCreated!==(verdict.result==='pass')||
       receipt.outcome!==(verdict.result==='pass'?'accepted':'rejected'))
       return fail('no_confirmed_atomic_commit');
     return Object.freeze({ok:true,status:'COMMITTED_INJECTED_WRITER',
       outcome:receipt.outcome,eventId:req.eventId,scopeKey:scope.key,
       attemptRecorded:true,evidenceCreated:receipt.evidenceCreated,
       // No GREEN inferred from one accepted packet; the canonical aggregator
       // alone determines complete contract fulfillment after durable readback.
       greenPassIssued:false,productionDeployed:false});
   }catch{return fail('trusted_adapter_failed');}
 }});
}
