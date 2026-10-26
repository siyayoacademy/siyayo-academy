'use strict';
// JAGUAR H14.66 — WHAT TO SHOW, NEVER WHAT TO CREDIT.
// Test-only canonical witness boundary. No product ledger, route, runtime or store.
// Only S3→S4 canonical fixtures can generate a demonstrative 0/3..3/3 display.
// S1↔S2 WHY drafts always BLOCK, even for fabricated "accepted" ledger entries.
const source=require('../../../../data/learning/experience-seeds.json').items;
const why=require('../../../../data/learning/skills/why.json');
const draft=require('../../../../data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
const h63=require('../../../../scripts/jaguar-h14-63-why-six-plan-handoff.js');
const h64=require('../../../../scripts/jaguar-h14-64-pedagogical-human-review-gate.js');
const LANG=['en','es','pt'];
const exact=(o,keys)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join(',')===keys.slice().sort().join(',');
const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(x);
const token=x=>typeof x==='string'&&/^[A-Za-z0-9_.:-]{1,128}$/.test(x);
const DENY=Object.freeze({canWriteEvidence:false,canIssueGreenPass:false,canAdvanceLearner:false,
canActivateDraft:false,canIssueAssessment:false,productionAuthorized:false});
const frozen=x=>Object.freeze(x);
const empty=(reason,rows=[])=>frozen({ok:false,status:reason,rows:frozen(rows),...DENY});
function createWhy66Projection({resolveLabViewer,loadLabCanonicalWitnesses,scopeApi,progressView,evaluator,wordPathWitness}={}){
 if(![resolveLabViewer,loadLabCanonicalWitnesses].every(x=>typeof x==='function')||
    typeof scopeApi?.create!=='function'||typeof scopeApi?.valid!=='function'||
    typeof scopeApi?.ownsPacket!=='function'||typeof progressView?.project!=='function'||
    typeof evaluator?.evidenceMatchesRequirement!=='function'||
    typeof wordPathWitness?.project!=='function')throw new TypeError('missing_separate_read_only_sources');
 const ready=h63.build(),review=h64.build();
 const intact=ready.status==='SIX_PLAN_PEDAGOGICAL_HANDOFF_REVIEW_PENDING'&&
     review.status==='PEDAGOGICAL_REVIEW_INSTRUMENT_READY_NOT_HOMOLOGATED'&&
     review.counts.actualHumanReviews===0&&review.counts.authorizedContracts===0&&
     review.gates.length===15&&review.gates.every(g=>g.closed===false)&&
     draft.contractRegistry.filter(c=>c.status==='DRAFT_NOT_AUTHORIZED').length===2;
 function project({viewerHandle,currentExperienceId,currentLanguage,currentQw}={}){
  if(!intact)return empty('STOP_PEDAGOGICAL_SOURCE_DRIFT');
  // Caller supplies no subject, scope, accepted packets or scoring flags.
  if(typeof viewerHandle!=='string'||viewerHandle.length>128||!token(currentExperienceId)||
      !LANG.includes(currentLanguage)||typeof currentQw!=='string')
    return empty('INVALID_VIEW_CONTEXT');
  let person;
  try{person=resolveLabViewer(viewerHandle);}catch{return empty('LAB_VIEWER_UNAVAILABLE');}
  if(!person||person.labVerified!==true||!token(person.subject)||!token(person.sessionId)||
      person.authSource!=='SYNTHETIC_LAB_ONLY')
   return empty('LAB_VIEWER_NOT_VERIFIED');
  let ledgers;
  try{ledgers=loadLabCanonicalWitnesses(person.subject);}catch{return empty('LAB_LEDGER_UNAVAILABLE');}
  if(!Array.isArray(ledgers))return empty('LAB_LEDGER_UNAVAILABLE');
  const keys=new Set(),result=[];
  for(const language of LANG){
   for(const originExperienceId of ['shopping-for-dinner','preparing-dinner','having-dinner']){
    const scope=scopeApi.create({learnerId:person.subject,skill:why.id,language,originExperienceId});
    if(!scopeApi.valid(scope)||keys.has(scope.key))continue;
    keys.add(scope.key);
    if(originExperienceId!=='having-dinner'){
      // This is a HARD NO-GO, independent of the contents of the fixture ledger.
      result.push(frozen({scopeKey:scope.key,language,originExperienceId,
        status:'WHY_S1_S2_DRAFT_BLOCKED',completed:0,total:3,
        items:frozen([false,false,false]),displayOnly:true,
        currentVisibleContext:currentExperienceId===originExperienceId&&currentLanguage===language,
        greenPassIssued:false,sourceIsCanonical:false}));
      continue;
    }
    const records=ledgers.filter(r=>r&&r.scopeKey===scope.key&&r.originExperienceId===originExperienceId&&
      r.language===language&&r.skill===why.id&&r.subject===person.subject);
    // Reused occurrence IDs are never eligible, including duplicated receipts
    // with different payloads. Never transform a pending 85C receipt to Evidence.
    const occurrences=new Map();
    for(const r of records)if(uuid(r.eventId))occurrences.set(r.eventId,(occurrences.get(r.eventId)||0)+1);
    const accepted=[];
    for(const r of records){
      if(!uuid(r.eventId)||occurrences.get(r.eventId)!==1||
         r.finalOutcome!=='LAB_CANONICAL_ACCEPTED_FIXTURE'||
         r.authoritySource!=='CANONICAL_S3_S4_TEST_SOURCE'||
         r.contractVersion!=='0.1.0'||!r.authorizedDirectAction||
         r.pendingReceipt===true||r.patitaObservation===true||
         !r.packet||r.packet.skill!==why.id||r.packet.result!=='pass'||
         !scopeApi.ownsPacket(scope,r.packet))continue;
      const packet=r.packet;
      const from=packet.context?.fromExperienceId;
      const inScene=packet.context?.experienceId;
      const validScene=(packet.dimension==='question-function'||packet.mode==='local')?
         inScene==='having-dinner'&&(!from||from==='having-dinner'):
         packet.mode==='transfer'&&inScene==='after-dinner-conversation'&&from==='having-dinner';
      if(!validScene||packet.support!=='none'||
          (packet.dimension==='reason-answer'&&!['local','transfer'].includes(packet.mode)))
        continue;
      if(!why.passContract.requires.some(req=>evaluator.evidenceMatchesRequirement(packet,req)))continue;
      accepted.push(packet);
    }
    // Call production-owned pure projectors for demonstration. No extra
    // inference or award of Green Pass from their calculated 3/3 status.
    const ctx={assessmentScope:scope,language,passContract:why.passContract,evidencePackets:accepted};
    const witness=wordPathWitness.project({scope,context:ctx,scopeApi,evaluator,progressView});
    if(!witness||witness.total!==3||witness.items?.length!==3)return empty('WORD_PATH_PROJECTION_FAILURE');
    const bits=witness.items.map(x=>x.accepted===true);
    const count=bits.filter(Boolean).length;
    if(count!==witness.completed)return empty('WITNESS_COUNT_MISMATCH');
    result.push(frozen({scopeKey:scope.key,language,originExperienceId,
      status:count===3?'LAB_CANONICAL_FIXTURE_3_OF_3_NO_PRODUCT_GREEN':'LAB_CANONICAL_FIXTURE_IN_PROGRESS',
      completed:count,total:3,items:frozen(bits),
      displayOnly:true,currentVisibleContext:currentExperienceId===originExperienceId&&currentLanguage===language,
      greenPassIssued:false,sourceIsCanonical:false,fixtureReferenceOnly:true}));
   }
  }
  return frozen({ok:true,status:'READ_ONLY_WHY_SCOPE_PROJECTION_LAB',scopeOwner:'SYNTHETIC_LAB_ONLY',
    currentView:frozen({experienceId:currentExperienceId,language:currentLanguage,questionWord:currentQw}),
    rows:frozen(result),observationsIgnored:true,attestationsPerformed:false,...DENY});
 }
 return frozen({project});
}
module.exports=frozen({createWhy66Projection});
