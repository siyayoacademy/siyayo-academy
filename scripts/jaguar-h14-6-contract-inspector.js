// JAGUAR H14.6 — Pure contract proposal inspector. NOT a runtime dispatcher, evaluator or authority.
'use strict';
const scopeApi=require('../js/adaptive-assessment-scope.js');
const langs=['en','es','pt'];
const trim=v=>typeof v==='string'?v.trim():'';
const selectQ=e=>e?.thinkingMind?.filter(q=>q?.questionWord==='why')||[];
function validScene(experience,reasonId,type){
 if(!experience||selectQ(experience).length!==1||!trim(experience.id))return false;
 const question=selectQ(experience)[0];
 const g=type==='presentationGrounding'?question.presentationGrounding:question.reasonGrounding;
 if(!g||g.groundedIn!=='situation')return false;
 if(type==='presentationGrounding'&&(g.assessmentAuthority!==false||g.assessmentEvidence!==false||g.tense!=='present'||g.form!=='affirmative'))return false;
 const id=type==='presentationGrounding'?g.referenceReasonId:g.acceptedReasonId;
 if(id!==reasonId||!Array.isArray(g.alternatives)||g.alternatives.length<2)return false;
 const ids=g.alternatives.map(a=>trim(a?.id));
 if(new Set(ids).size!==ids.length||!ids.includes(reasonId)||ids.some(id=>!id))return false;
 for(const l of langs){
  const q=(type==='presentationGrounding'&&experience.id==='shopping-for-dinner')?g.questionOverride?.[l]:question.question?.[l];
  if(!trim(q)||!trim(question.questionWordLabel?.[l])||!trim(experience.situation?.[l]))return false;
  if(g.alternatives.some(a=>!trim(a?.response?.[l])))return false;
 }
 return true;
}
function inspect(input){
 input=input||{};
 const {registry,seeds}=input;
 if(!registry||registry.status!=='SPECIFIED_NOT_AUTHORIZED'||registry.newAssessmentAuthority!==false||
  registry.newAssessmentEvidence!==false||registry.newGreenPass!==false||
  !Array.isArray(registry.contractRegistry)||!Array.isArray(seeds))return null;
 const intent=trim(input.intent),here=trim(input.experienceId),originId=trim(input.originExperienceId),learnerId=trim(input.learnerId),language=trim(input.language);
 if(!['start','resume','transfer'].includes(intent)||!here||!learnerId||!langs.includes(language))return null;
 if(intent!=='start'&&!originId)return null;
 if(intent==='start'&&originId&&originId!==here)return null;
 const origin=intent==='start'?here:originId;
 const candidates=registry.contractRegistry.filter(c=>c.originExperienceId===origin&&
  (intent==='start'?c.originExperienceId===here:intent==='transfer'?c.transferExperienceId===here:(c.originExperienceId===here||c.transferExperienceId===here)));
 if(candidates.length!==1)return null;
 const candidate=candidates[0],local=seeds.find(e=>e.id===candidate.originExperienceId),transfer=seeds.find(e=>e.id===candidate.transferExperienceId);
 if(!local||!transfer||local.id===transfer.id||candidate.localReasonId===candidate.transferReasonId||
  candidate.localSemanticRole===candidate.transferSemanticRole)return null;
 if(candidate.sourceType!=='presentationGrounding'&&candidate.sourceType!=='reasonGrounding')return null;
 if(!validScene(local,candidate.localReasonId,candidate.sourceType)||!validScene(transfer,candidate.transferReasonId,candidate.sourceType))return null;
 const localQuestion=selectQ(local)[0],remoteQuestion=selectQ(transfer)[0];
 const existing=candidate.status==='EXISTING_CANONICAL_UNCHANGED';
 if(existing){
  if(localQuestion.assessmentTarget?.skill!==registry.skill||remoteQuestion.assessmentTarget)return null;
 }else if(candidate.status==='DRAFT_NOT_AUTHORIZED'){
  if(candidate.authority!==false||candidate.canMintEvidence!==false||localQuestion.assessmentTarget||remoteQuestion.assessmentTarget)return null;
 }else return null;
 const scope=scopeApi.create({learnerId,skill:registry.skill,language,originExperienceId:origin});
 if(!scope)return null;
 // Trusted scope listings are injected as a read-only model input. They are not self-asserted client claims.
 if(intent!=='start'){
  if(!Array.isArray(input.retainedScopes)||!input.retainedScopes.some(s=>scopeApi.same(s,scope)))return null;
 }
 return Object.freeze({
  proposalId:candidate.id,intent,experienceId:here,
  scopeKey:scope.key,originExperienceId:origin,language,
  sourceStatus:candidate.status,
  decision:existing?'EXISTING_CANONICAL_REFERENCE':'DRAFT_PENDING_HOMOLOGATION',
  canSubmitAttempt:false,canCreateEvidence:false,canGrantGreenPass:false,
  // A separate authorized production runtime remains the only place capable of producing evidence.
  runtimeDispatch:false
 });
}
module.exports=Object.freeze({inspect});
