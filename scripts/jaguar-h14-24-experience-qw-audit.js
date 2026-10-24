// JAGUAR H14.24 — read-only Experience × QW source audit.
// It NEVER opens Sessions, infers assessments, or creates Evidence.
'use strict';
const TOROIDAL_QWS=Object.freeze(['what','where','when','who','which','why','how','how-much','how-many','whose','whom','how-long','how-far','how-often']);
const LANGUAGES=Object.freeze(['en','es','pt']);
const text=x=>typeof x==='string'?x.trim():'';
function audit({experiences,questionContract,coherence}={}){
 if(!Array.isArray(experiences)||!questionContract||typeof questionContract.inspect!=='function'||!coherence||typeof coherence.resolve!=='function')return null;
 const slots=[],views=[],missing=[],anomalies=[],seenExperience=new Set();
 for(const exp of experiences){
  if(!exp||!text(exp.id)||seenExperience.has(exp.id)||!Array.isArray(exp.thinkingMind)){anomalies.push({type:'INVALID_EXPERIENCE',id:exp?.id??null});continue;}
  seenExperience.add(exp.id);
  const qs=exp.thinkingMind,declared=new Set();
  for(const q of qs){
   const qw=text(q?.questionWord);
   if(!qw||declared.has(qw)){anomalies.push({type:'INVALID_OR_DUPLICATE_QW',experienceId:exp.id,questionWord:qw});continue;}
   declared.add(qw);
   const c=questionContract.inspect(q,null);
   if(!c){anomalies.push({type:'UNRESOLVED_CONTRACT_DECLARATION',experienceId:exp.id,questionWord:qw});continue;}
   if(!TOROIDAL_QWS.includes(qw))anomalies.push({type:'OUTSIDE_REGISTERED_14_QWS',experienceId:exp.id,questionWord:qw});
   const status=c.status; // Explicit declaration only; NEVER read this as runtime authorization for a new contract.
   const entry=status==='ASSESSMENT_DECLARED',resume=status==='ASSESSMENT_RESUME_ONLY';
   const slot=Object.freeze({
    experienceId:exp.id,questionWord:qw,
    status,declaredAssessmentSkill:c.assessmentSkill||null,definitionPath:c.definitionPath||null,
    entryDeclared:entry,resumeOnly:resume,explicitScopeRequired:entry||resume,
    sourceFlags:Object.freeze({question:!!q.question,answerGrounding:!!q.answerGrounding,
     reasonGrounding:!!q.reasonGrounding,presentationGrounding:!!q.presentationGrounding,
     choiceContext:!!q.choiceContext,responses:!!q.responses,dialogueForms:!!q.dialogueForms,
     dependencyFocus:!!q.dependencyFocus,dependencyHeadProbe:!!q.dependencyHeadProbe}),
    approval:Object.freeze({newContractAuthorized:false,newEvidence:false,newGreenPass:false,
     requiresHumanContextReview:true,needsIndependentOriginContractReview:!entry&&!resume})
   });
   slots.push(slot);
   for(const language of LANGUAGES){
    const questionText=text(q.question?.[language])||null;
    const why=qw==='why'?coherence.resolve({question:q,language,tense:'present',form:'affirmative'}):null;
    const whyGrounded=why?.status==='grounded'&&!!text(why.response)&&!!text(why.question);
    views.push(Object.freeze({
     experienceId:exp.id,questionWord:qw,language,questionText,
     questionAuthored:!!questionText,
     contextualReferenceStatus:qw==='why'?(whyGrounded?'WHY_PRESENT_AFFIRMATIVE_GROUNDED_REFERENCE':why?.status||'NO_GROUNDED_REFERENCE'):'NOT_VERIFIED_BY_WHY_COHERENCE_RESOLVER',
     contextualAnswer:whyGrounded?why.response:null,
     contextualAnswerProvenance:whyGrounded?why.source:null,
     exploratoryReference:whyGrounded?why.exploratory===true:false,
     needsHumanReferentCheck:true,needsHumanLanguageReview:true,
     tenseModePeriod:'PRESENT_AFFIRMATIVE_ONLY_FOR_VALIDATED_WHY; OTHER_GRAMMAR_NOT_INFERRED',
     assessmentStatus:status,canAwardEvidence:false,canGrantGreenPass:false
    }));
   }
  }
  for(const qw of TOROIDAL_QWS)if(!declared.has(qw))missing.push(Object.freeze({experienceId:exp.id,questionWord:qw,status:'NOT_DECLARED_IN_EXPERIENCE',
   eligibleWithoutGrounding:false,questionGenerated:false,assessmentGenerated:false}));
 }
 const countStatus=s=>slots.filter(x=>x.status===s).length;
 const counts=Object.freeze({experiences:seenExperience.size,questionSlots:slots.length,languageViews:views.length,
   declaredEntries:countStatus('ASSESSMENT_DECLARED'),resumeOnly:countStatus('ASSESSMENT_RESUME_ONLY'),
   opportunityOnly:countStatus('OPPORTUNITY_ONLY'),unregisteredExperienceQwPairs:missing.length,
   fullToroidalCandidates:seenExperience.size*TOROIDAL_QWS.length});
 return Object.freeze({id:'JAGUAR-H14.24',status:'STUDY_ONLY',source:'data/learning/experience-seeds.json',counts,
   toroidalQuestionWords:TOROIDAL_QWS,slots:Object.freeze(slots),views:Object.freeze(views),
   unregistered:Object.freeze(missing),anomalies:Object.freeze(anomalies),
   assessmentAuthority:false,observedLearnerAttempt:false,patitaWrite:false,greenPass:false});
}
module.exports=Object.freeze({audit,TOROIDAL_QWS,LANGUAGES});
if(require.main===module){
 const fs=require('node:fs'),p='data/learning/experience-seeds.json';
 const report=audit({experiences:JSON.parse(fs.readFileSync(p,'utf8')).items,
   questionContract:require('../js/question-word-assessment-contract.js'),
   coherence:require('../js/verb-explorer-contextual-coherence.js')});
 if(!report){console.error('No report');process.exitCode=1;}else{
  if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(report,null,2)+'\n');
  else console.log('H14.24 SOURCE AUDIT '+JSON.stringify(report.counts)+'; anomalies '+report.anomalies.length);
 }
}
