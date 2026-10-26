'use strict';
const a=require('node:assert/strict'),fs=require('node:fs');
const {build,reviewSyntheticEvent,DIMENSIONS,LANGS,ORIGINS}=require('./jaguar-h14-63-why-six-plan-handoff.js');
const baseline=require('./jaguar-h14-38-independent-production-transfer.js').build();
const j=build(),corpus=require('../data/learning/experience-seeds.json').items;
const draft=require('../data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
a.equal(j.status,'SIX_PLAN_PEDAGOGICAL_HANDOFF_REVIEW_PENDING',JSON.stringify(j.issues));
a.equal(j.issues.length,0);
a.deepEqual(j.counts,{draftOrigins:2,languagePlans:6,independentTaskSlots:18,
 authoredQuestionFunctionTasksApproved:0,humanReviewersFinished:0,contractsAuthorized:0,
 attempts:0,evidence:0,greenPasses:0});
a.deepEqual([...DIMENSIONS],['question-function','reason-answer(local)','reason-answer(transfer)']);
a.deepEqual([...LANGS],['en','es','pt']);
a.deepEqual([...ORIGINS],['shopping-for-dinner','preparing-dinner']);
a.equal(baseline.packets.length,6);
let combos=[];
for(const origin of ORIGINS)for(const lang of LANGS){
 const packet=j.packets.find(p=>p.originExperienceId===origin&&p.language===lang);
 const old=baseline.packets.find(p=>p.originExperienceId===origin&&p.language===lang);
 const proposal=draft.contractRegistry.find(x=>x.id===packet?.proposalId);
 a.ok(packet&&old&&proposal,'missing '+origin+'/'+lang);
 a.equal(packet.contractStatus,'DRAFT_NOT_AUTHORIZED');a.equal(proposal.status,'DRAFT_NOT_AUTHORIZED');
 a.equal(packet.transferExperienceId,old.transferExperienceId);
 a.equal(packet.slots.length,3);
 a.equal(packet.modelAnswerExposedToLearner,false);
 a.equal(packet.sequenceRequirement,'NONE_FREE_EXPLORATION');
 a.equal(packet.explicitOriginAndIntentRequired,true);
 a.equal(packet.pedagogicalApproval,null);
 a.equal(packet.canMintEvidence,false);a.equal(packet.canGrantGreenPass,false);
 a.deepEqual(packet.slots.map(s=>s.dimension),DIMENSIONS);
 const source=corpus.find(x=>x.id===origin).thinkingMind.find(q=>q.questionWord==='why');
 const other=corpus.find(x=>x.id===packet.transferExperienceId).thinkingMind.find(q=>q.questionWord==='why');
 a.ok(source.presentationGrounding&&other.presentationGrounding);
 a.equal(source.assessmentTarget,undefined);a.equal(other.assessmentTarget,undefined);
 for(let i=0;i<3;i++){
  const slot=packet.slots[i],prior=old.tasks[i];
  a.equal(slot.experienceId,i===2?packet.transferExperienceId:origin);
  a.equal(slot.language,lang);a.equal(slot.dimension,DIMENSIONS[i]);
  a.equal(slot.expectedLearnerAction,prior.learnerFacing.expectedActionType);
  a.equal(slot.teacherModelsIncluded,false);a.equal(slot.learnerAnswerCaptured,false);
  a.equal(slot.assessmentAuthority,false);a.equal(slot.canMintEvidence,false);
  a.equal(slot.taskHomologation,null);a.equal(slot.semanticHomologation,null);
  a.equal(slot.independentActionVerified,false);a.equal(slot.authoritativeEventId,null);
  a.ok(slot.criteria.length===3);
  a.equal(Object.hasOwn(slot,'teacherOnly'),false);
  a.equal(Object.hasOwn(slot,'modelAnswer'),false);
  a.equal(Object.hasOwn(slot,'contrastAnswer'),false);
  if(i===0){
   a.equal(slot.publicPromptDraft,null);
   a.equal(slot.promptStatus,'QUESTION_FUNCTION_PROMPT_REQUIRES_INDEPENDENT_AUTHORING');
   a.ok(slot.pedagogicalInstructionDraft);
  }else{
   a.equal(slot.publicPromptDraft,prior.learnerFacing.question);
   a.equal(slot.promptStatus,'SOURCE_QUESTION_GROUNDED_PROMPT_NOT_HOMOLOGATED');
  }
 }
 const action=(index,change={})=>({
  originExperienceId:origin,experienceId:packet.slots[index].experienceId,
  language:lang,dimension:DIMENSIONS[index],questionWord:'why',
  intent:index===2?'transfer':'start',occurrenceId:'SYNTHETIC-'+index,
  actionType:packet.slots[index].expectedLearnerAction,observed:true,actor:'learner',
  modelExposedBeforeAction:false,...change
 });
 const valid=reviewSyntheticEvent({handoff:j,packetId:packet.packetId,dimension:DIMENSIONS[2],event:action(2)});
 a.equal(valid.status,'CANDIDATE_FOR_HUMAN_TASK_REVIEW_ONLY');
 a.equal(valid.independenceVerified,false);a.equal(valid.canMintEvidence,false);
 a.equal(reviewSyntheticEvent({handoff:j,packetId:packet.packetId,dimension:DIMENSIONS[2],event:action(2,{intent:'start'})}).status,'STOP_INTENT_MISMATCH');
 a.equal(reviewSyntheticEvent({handoff:j,packetId:packet.packetId,dimension:DIMENSIONS[1],event:action(1,{actionType:'SCENE_VISIT'})}).status,'NOT_AN_INDEPENDENT_TEXT_RESPONSE');
 a.equal(reviewSyntheticEvent({handoff:j,packetId:packet.packetId,dimension:DIMENSIONS[1],event:action(1,{modelExposedBeforeAction:true})}).status,'NEEDS_UNBIASED_INDEPENDENCE_CHECK');
 a.equal(reviewSyntheticEvent({handoff:j,packetId:packet.packetId,dimension:DIMENSIONS[1],event:action(1,{answerText:'do not send actual text'})}).reason,'UNTRUSTED_EVENT_FIELD');
 a.equal(reviewSyntheticEvent({handoff:j,packetId:packet.packetId,dimension:DIMENSIONS[1],event:action(1,{learnerId:'PERSON'})}).reason,'UNTRUSTED_EVENT_FIELD');
 combos.push(origin+'/'+lang);
}
a.equal(new Set(combos).size,6);
a.equal(new Set(j.packets.map(p=>p.packetId)).size,6);
a.notEqual(j.packets[0].proposalId,j.packets[3].proposalId);
a.equal(j.protections.noMandatoryExperienceOrder,true);
a.equal(j.protections.noPriorWhichOrHowRequired,true);
a.equal(j.protections.whyS3S4CanonicalUnchanged,true);
a.equal(j.protections.canScoreFreeText,false);
a.equal(j.protections.canApproveAssessment,false);
const s3=corpus.find(x=>x.id==='having-dinner').thinkingMind.find(x=>x.questionWord==='why');
a.equal(s3.assessmentTarget.skill,'why.use.contextual-reason');
const serialized=JSON.stringify(j);
for(const forbidden of ['Because the fresh, mild cheese','Porque el queso fresco y suave','Porque prepará-lo juntos',
'"teacherOnly":','"contrastAnswer":','"modelAnswer":','\"learnerId\":\"'])a.equal(serialized.includes(forbidden),false,'teacher content leak: '+forbidden);
const m=JSON.parse(fs.readFileSync('data/learning/references/jaguar-h14-63-why-six-plan-contract-v0.1.json'));
a.equal(m.id,'SIYAYO-H14.63-WHY-SIX-PLAN-PEDAGOGICAL-HANDOFF');
a.equal(m.status,'DRAFT_FOR_HUMAN_HOMOLOGATION_NO_EVIDENCE_AUTHORITY');
a.equal(m.plans.length,6);
a.ok(m.plans.every(p=>p.dimensions.length===3&&p.humanApproval===null&&p.contractAuthorized===false));
a.ok(m.gates.every(g=>g.closed===false));
a.equal(m.runtimeChanges,false);
console.log('H14.63 PASS: 6 origins×language plans /18 dimensions; 0 approvals, 0 automatic grades, preserved existing S3→S4');
