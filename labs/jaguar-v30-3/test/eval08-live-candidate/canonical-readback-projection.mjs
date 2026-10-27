// JAGUAR EVAL-08 · canonical READBACK → Word Path / Learning Trail adapters.
// LAB-ONLY, server-side. No Worker endpoint, no client NICK, no grade/credit writes.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const source=require('../../../../data/learning/experience-seeds.json');
const why=require('../../../../data/learning/skills/why.json');
const scopeApi=require('../../../../js/adaptive-assessment-scope.js');
const evaluator=require('../../../../js/green-pass-profile.js');
const progressView=require('../../../../js/adaptive-pass-contract-progress-view.js');
const trailView=require('../../../../js/adaptive-learner-trail-view.js');
const TOK=/^[A-Za-z0-9_.:-]{1,128}$/;
const eventIdOK=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const valid=t=>typeof t==='string'&&TOK.test(t);
const exact=(v,k)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join('|')===k.slice().sort().join('|');
const stop=(reason)=>Object.freeze({ok:false,status:'NO_PROJECTION',reason,greenPassIssued:false,evidenceWritten:false});
const frozen=x=>Object.freeze(x);
function authoredCanonicalTarget(skill,origin){
 const entry=source.items.find(e=>e.id===origin);
 const question=entry?.thinkingMind?.find(q=>q.questionWord==='why');
 // Intentionally narrow: S1/S2 authored draft targets cannot enter by a passed flag.
 return skill===why.id&&origin==='having-dinner'&&
  question?.assessmentTarget?.skill===why.id&&why.passContract.requires.length===3;
}
export function createCanonicalReadbackProjection({readAccepted,wordPathWitness}={}){
 if(typeof readAccepted!=='function'||typeof wordPathWitness?.project!=='function')
  throw new TypeError('trusted readback and canonical Word Path projector required');
 return frozen({async project(req){
  // No subject, NICK, Evidence, contract or result allowed from caller.
  if(!exact(req,['sessionHandle','skill','language','originExperienceId'])||
     typeof req.sessionHandle!=='string'||!req.sessionHandle||req.sessionHandle.length>256||
     !valid(req.skill)||!['en','es','pt'].includes(req.language)||
     !valid(req.originExperienceId))return stop('invalid_read_request');
  if(!authoredCanonicalTarget(req.skill,req.originExperienceId))
   return stop('no_authored_canonical_contract');
  let result;
  try{result=await readAccepted(req);}catch{return stop('trusted_readback_exception');}
  if(!result||result.ok!==true||result.status!=='LAB_CANONICAL_READBACK_NO_GREEN_AUTHORITY'||
     !scopeApi.valid(result.scope)||result.scope.skill!==req.skill||
     result.scope.language!==req.language||result.scope.originExperienceId!==req.originExperienceId||
     !Array.isArray(result.packets))return stop('invalid_verified_readback');
  const s=result.scope,events=new Set(),accepted=[];
  for(const item of result.packets){
   const eid=item?.context?.occurrenceId,ctx=item?.context;
   if(typeof eid!=='string'||!eventIdOK.test(eid)||events.has(eid)||
      item.result!=='pass'||item.support!=='none'||!scopeApi.ownsPacket(s,item)||
      ctx.language!==s.language||
      // S3 local + S4 transfer are distinct, never infer transfer from a visit.
      !(ctx.experienceId==='having-dinner'&&ctx.fromExperienceId==null&&item.mode!=='transfer')&&
      !(ctx.experienceId==='after-dinner-conversation'&&ctx.fromExperienceId==='having-dinner'&&item.mode==='transfer'))
     return stop('untrusted_or_duplicate_witness');
   if(!why.passContract.requires.some(r=>evaluator.evidenceMatchesRequirement(item,r)))
     return stop('unrecognized_contract_dimension');
   events.add(eid);accepted.push(item);
  }
  const context={assessmentScope:s,language:s.language,
    passContract:why.passContract,evidencePackets:accepted};
  let detail,progress,trail;
  try{
   detail=wordPathWitness.project({scope:s,context,scopeApi,evaluator,progressView});
   progress=progressView.project(why.passContract,accepted,evaluator);
   // These are read-only footprint records. No green-pass-contract closure
   // is synthesized from progress=3/3; only the authoritative closure does that.
   const observations=accepted.map(p=>({
    source:'canonical-evidence-readback',status:'accepted-witness',
    context:{skill:s.skill,assessmentScope:s,language:s.language,
     experienceId:p.context.experienceId,confirmed:false,contractStatus:null}
   }));
   trail=trailView.project({id:s.learnerId,observations},s.skill,
     {language:s.language,originExperienceId:s.originExperienceId});
  }catch{return stop('projector_failed');}
  if(!detail||!progress||!trail||detail.scopeKey!==s.key||
     detail.completed!==progress.completed||detail.total!==progress.total||
     detail.total!==why.passContract.requires.length||
     trail.counts.footprints!==accepted.length||trail.counts.greenPassClosures!==0||
     detail.items.filter(x=>x.accepted).length!==detail.completed)
    return stop('projection_witness_mismatch');
  const wordPath=frozen({scopeKey:detail.scopeKey,skill:detail.skill,
    language:detail.language,originExperienceId:detail.originExperienceId,
    completed:detail.completed,total:detail.total,
    items:frozen(detail.items.map(i=>frozen({...i})))});
  const trailSummary=frozen({state:trail.state,footprints:trail.counts.footprints,
    greenPassClosures:trail.counts.greenPassClosures,
    acceptedWitnesses:accepted.length,confirmedClosure:false});
  return frozen({ok:true,status:'LAB_CANONICAL_PRESENTATION_ONLY',
    language:s.language,originExperienceId:s.originExperienceId,
    wordPath,learningTrail:trailSummary,
    canonicalCompletionObserved:detail.completed===detail.total,
    greenPassIssued:false,greenPassAuthorized:false,
    evidenceWritten:false,assessmentTriggered:false,
    externalIdentityVerified:false,remoteD1Validated:false});
 }});
}
