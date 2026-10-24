// JAGUAR H14.4 · Pure WHY source-readiness diagnostic. No evidence, no Session, no writes.
'use strict';
const legacy=require('../js/adaptive-why-contextual-reason-probe-specification-source.js');
const languages=Object.freeze(['en','es','pt']);
const reason=(q)=>q&&q.reasonGrounding;
const presentation=(q)=>q&&q.presentationGrounding;
function lookup(e,word){return (e&&e.thinkingMind||[]).find(q=>q.questionWord===word);}
function inspect(input){
 input=input||{};
 const seeds=input.seeds,skill=input.skill,originId=input.originExperienceId,transferId=input.transferExperienceId;
 const origin=(seeds||[]).find(e=>e.id===originId),destination=(seeds||[]).find(e=>e.id===transferId);
 if(!origin||!destination||origin===destination||!skill||skill.id!=='why.use.contextual-reason')return null;
 const why=lookup(origin,'why'),how=lookup(origin,'how'),later=lookup(destination,'why');
 if(!why||!later)return null;
 const blockers=[];
 if(!why.assessmentTarget||why.assessmentTarget.skill!==skill.id)blockers.push('origin-assessment-entry-missing');
 if(!how)blockers.push('origin-how-question-missing');
 if(!reason(why))blockers.push('origin-reason-grounding-missing');
 if(!reason(later))blockers.push('transfer-reason-grounding-missing');
 if(later.assessmentTarget)blockers.push('transfer-already-has-independent-entry');
 if(origin.toroidalNext?.nextExperience!==destination.id)blockers.push('legacy-adjacent-experience-mismatch');
 const acceptedOrigin=reason(why)?.acceptedReasonId||presentation(why)?.referenceReasonId||null;
 const acceptedTransfer=reason(later)?.acceptedReasonId||presentation(later)?.referenceReasonId||null;
 const legacyPerLanguage=Object.fromEntries(languages.map(language=>[language,Boolean(legacy.resolve(skill,origin,destination,language))]));
 return Object.freeze({
  originExperienceId:origin.id,transferExperienceId:destination.id,
  languageStatus:Object.freeze(legacyPerLanguage),
  actualLegacyReady:languages.every(language=>legacyPerLanguage[language]),
  blockers:Object.freeze(blockers),
  sourceReasons:Object.freeze({local:acceptedOrigin,transfer:acceptedTransfer}),
  hasLocalPresentation:!!presentation(why),
  hasLocalReasonGrounding:!!reason(why),
  hasTransferReasonGrounding:!!reason(later),
  currentAssessmentAuthority:!!why.assessmentTarget,
  producesEvidence:false
 });
}
module.exports=Object.freeze({inspect});
