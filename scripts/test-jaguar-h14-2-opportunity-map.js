#!/usr/bin/env node
const fs=require('fs'),assert=require('node:assert/strict');
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const map=JSON.parse(fs.readFileSync('data/learning/references/jaguar-h14-2-qw-opportunity-map-v0.1.json','utf8'));
const langs=['en','es','pt'];const expected=[];
for(const e of corpus)for(const q of e.thinkingMind){
 const actual=map.slots.find(s=>s.experienceId===e.id&&s.questionWord===q.questionWord);
 assert.ok(actual,'Missing '+e.id+' '+q.questionWord);
 assert.deepEqual(Object.keys(actual.questionText).sort(),langs.slice().sort());
 assert.equal(actual.assessment.entryTarget,q.assessmentTarget?.skill||null);
 assert.equal(actual.assessment.resumeTarget,q.assessmentResumeTarget?.skill||null);
 assert.equal(actual.assessment.authorizedNewContract,Boolean(q.assessmentTarget));
 assert.equal(actual.assessment.transferRequiresExistingContract,Boolean(q.assessmentResumeTarget));
 const answered=Boolean(q.answerGrounding||q.dialogueForms||q.choiceContext||q.reasonGrounding||q.responses);
 assert.equal(actual.sourceCapabilities.contextualResponseAuthored,answered);
 expected.push(actual);
}
assert.equal(map.slots.length,expected.length);
assert.equal(map.audit.questionSlots,expected.length);
assert.equal(map.audit.entrySlots,expected.filter(s=>s.assessment.authorizedNewContract).length);
assert.equal(map.audit.resumeOnlySlots,expected.filter(s=>s.assessment.transferRequiresExistingContract).length);
assert.equal(map.audit.contextResponseSlots,expected.filter(s=>s.sourceCapabilities.contextualResponseAuthored).length);
assert.equal(map.audit.questionOrPresentationOnlySlots,expected.filter(s=>s.classification==='QUESTION_OR_PRESENTATION_ONLY').length);
for(const field of ['assessmentAuthority','assessmentEvidence','greenPass'])assert.equal(map[field],false);
assert.ok(expected.some(s=>s.classification==='CONTEXT_AUTHORED_NO_ENTRY'));
assert.ok(expected.some(s=>s.classification==='DECLARED_RESUME_ONLY'));
console.log('PASS H14.2 source-matched QW opportunity map: '+expected.length+' slots; '+map.audit.entrySlots+' entries; '+map.audit.resumeOnlySlots+' resumes; '+map.audit.contextResponseSlots+' authored context responses; zero inferred evidence');
