'use strict';
// Blank teacher review sheets for authored demonstration cases.
// Zero human reviews are pre-filled; source hypotheses are NOT reviewer findings.
const bank=require('./jaguar-h14-28-semantic-contrast-bank.js');
const earlier=require('./jaguar-h14-30-supervised-semantic-protocol.js');
const byId=new Map(earlier.cases.map(x=>[x.id,x]));
const cases=bank.cases.map(c=>Object.freeze({
 caseId:c.id,experienceId:c.experienceId,language:c.language,dimension:c.dimension,
 caseKind:c.caseKind,text:c.response,
 authoredDemonstration:true,teacherOnly:true,
 referenceHypothesisForDiscussion:byId.get(c.id)?.hypothesis??null,
 firstReview:null,secondReview:null,adjudication:null,
 learnerAttemptId:null,canonicalProgress:null,authorizedEvidence:false
}));
const out=Object.freeze({id:'JAGUAR-H14.31-REVIEW-FORMS',version:'0.1.0',
 status:'EMPTY_HUMAN_REVIEW_FORMS_NOT_ASSESSMENT',reviewerInstructions:[
 'Assign separate TEACHER_REVIEW entries from two reviewers; do not copy the source hypothesis as a judgment.',
 'For each entry explicitly record semantic state, contextual 0/4 guidance band or null, expression quality and contextual rationale.',
 'Do not disclose teacher reference model before a learner attempt if these prompts are later authored as assessments.',
 'Escalate mismatches; final adjudication remains pedagogical and cannot grant learner Evidence.',
 'Do not infer agreement rates from empty templates or simulated reviewers.'
 ],cases:Object.freeze(cases),authority:Object.freeze({assessment:false,patitaWrite:false,evidence:false,greenPass:false})});
module.exports=out;
if(require.main===module){if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(out,null,2)+'\n');else console.log('H14.31: 48 empty human-review forms; no ratings');}
