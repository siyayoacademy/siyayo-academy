// JAGUAR H14.65: WHY S1/S2 contract-authority REVIEW relay (local Node laboratory).
// A H14.63 draft never becomes an EVAL-08 target or Pass Contract from a lab preflight.
// Never route a PATITA observation directly into an assessment; never create Evidence.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const h63=require('../../../../scripts/jaguar-h14-63-why-six-plan-handoff.js');
const h64=require('../../../../scripts/jaguar-h14-64-pedagogical-human-review-gate.js');
const draft=require('../../../../data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
const definitionPath='data/learning/skills/why.json';
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(x);
const token=x=>typeof x==='string'&&/^[A-Za-z0-9_.:-]{1,128}$/.test(x);
const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')===keys.slice().sort().join(',');
const prohibited=Object.freeze({canStartSession:false,canSubmitAttempt:false,canEvaluate:false,
  canIssueEvidence:false,canGrantGreenPass:false,canChangeExplorer:false});
const block=(code,extra={})=>Object.freeze({status:code,ok:false,
  ...prohibited,...extra});
// Explicitly import a trusted LAB preflight *service*, never accept a self-declared
// "passed" report from the browser or caller. Cannot be a product auth adapter.
export function createWhyLabAuthorityRelay({preflight}={}){
 if(!preflight||typeof preflight.inspect!=='function')throw new TypeError('trusted lab preflight required');
 const plans=h63.build();
 const reviews=h64.build();
 const draftPlans=draft.contractRegistry.filter(x=>x.status==='DRAFT_NOT_AUTHORIZED');
 const sourceReady=plans.status==='SIX_PLAN_PEDAGOGICAL_HANDOFF_REVIEW_PENDING'&&
   plans.issues.length===0&&plans.packets.length===6&&
   reviews.status==='PEDAGOGICAL_REVIEW_INSTRUMENT_READY_NOT_HOMOLOGATED'&&
   reviews.issues.length===0&&reviews.tasks.length===18&&
   reviews.gates.length===15&&reviews.gates.every(g=>g.closed===false&&g.actualHumanSignoff===null)&&
   reviews.counts.actualHumanReviews===0&&reviews.reviewerAuthenticityVerified===false&&
   reviews.mayHomologate===false&&
   draft.status==='SPECIFIED_NOT_AUTHORIZED'&&draftPlans.length===2&&
   draftPlans.every(d=>d.authority===false&&d.canMintEvidence===false);
 const available=Object.freeze(plans.packets.map(p=>Object.freeze({
  packetId:p.packetId,originExperienceId:p.originExperienceId,
  transferExperienceId:p.transferExperienceId,language:p.language,proposalId:p.proposalId
 })));
 return Object.freeze({
  describe(){
   return Object.freeze({status:sourceReady?'LAB_BRIDGE_READY_HUMAN_AUTHORITY_BLOCKED':'STOP_SOURCE_DRIFT',
    plans:available,assessmentAuthorization:false,realTeacherReviews:0,
    humanApproval:false,authIssuer:'SYNTHETIC_H14_54_ONLY',...prohibited});
  },
  async inspect(input){
   if(!sourceReady)return block('STOP_SOURCE_DRIFT');
   // Strict caller form: no subject, NICK, target, origin, permission, identity,
   // semantic approval or preflight verdict can be injected.
   if(!exact(input,['packetId','intent','proof','actionKey','eventId'])||
     typeof input.packetId!=='string'||!['start','resume'].includes(input.intent)||
     typeof input.proof!=='string'||!token(input.actionKey)||!uuid(input.eventId))
     return block('STOP_INVALID_REQUEST');
   const p=plans.packets.find(x=>x.packetId===input.packetId);
   if(!p||p.contractStatus!=='DRAFT_NOT_AUTHORIZED'||p.assessmentAuthority!==false||
      p.canMintEvidence!==false||p.canGrantGreenPass!==false||
      p.slots?.length!==3||p.slots.some(s=>s.taskHomologation!==null||
       s.semanticHomologation!==null||s.canMintEvidence!==false))
     return block('STOP_UNKNOWN_OR_UNAPPROVED_PACKET');
   const draftEntry=draftPlans.find(d=>d.id===p.proposalId&&
     d.originExperienceId===p.originExperienceId&&
     d.transferExperienceId===p.transferExperienceId);
   if(!draftEntry)return block('STOP_ORIGIN_CONTRACT_MISMATCH');
   // Local preflight start = origin; resume = transfer context. This resume
   // is NOT credit for the Pass Contract TRANSFER dimension.
   const experienceId=input.intent==='start'?p.originExperienceId:p.transferExperienceId;
   const proposal=Object.freeze({
    experienceId,questionWord:'why',language:p.language,skill:p.skill,
    definitionPath,proposedOriginExperienceId:p.originExperienceId,
    proposalKind:input.intent==='start'?'START_PROPOSAL_UNVERIFIED':'RESUME_PROPOSAL_UNVERIFIED',
    authorized:false,serverVerified:false,actionVerified:false,
    maySubmitAttempt:false,mayStartSession:false,mayIssueEvidence:false,
    mayGrantGreenPass:false,automaticForward:false
   });
   let result;
   try{
    result=await preflight.inspect(Object.freeze({
     proposal,proof:input.proof,actionKey:input.actionKey,
     eventId:input.eventId,intent:input.intent
    }));
   }catch{return block('STOP_LAB_PREFLIGHT_EXCEPTION');}
   if(!result||result.ok!==true||
     result.status!=='LAB_PREFLIGHT_REVIEWABLE_NOT_EXECUTABLE'||
     result.verifiedUsing!=='SYNTHETIC_LAB_AUTHORITIES_ONLY'||
     result.skill!==p.skill||result.language!==p.language||
     result.originExperienceId!==p.originExperienceId||
     result.currentExperienceId!==experienceId||
     result.eventId!==input.eventId||!token(result.subject)||
     !token(result.contractId)||!token(result.contractVersion)||
     !Number.isSafeInteger(result.revision)||result.revision<1||
     result.canStartSession!==false||result.canSubmitAttempt!==false||
     result.canIssueEvidence!==false||result.canGrantGreenPass!==false)
     return block('STOP_PREFLIGHT_NOT_REVIEWABLE');
   return block('HUMAN_HOMOLOGATION_AND_RUNTIME_AUTHORITY_BLOCKED',{
     // Result only carries minimal scoping and a lab-state marker:
     // no proof, subject, action token, approval or reusable authorization ticket.
     packetId:p.packetId,originExperienceId:p.originExperienceId,
     currentExperienceId:experienceId,language:p.language,
     questionWord:'why',intent:input.intent,
     labPreflight:'SYNTHETIC_CONTEXT_VALIDATED_ONLY',
     humanHomologationVerified:false,contractActivationAuthorized:false,
     transferDimensionCredited:false
   });
  }
 });
}
