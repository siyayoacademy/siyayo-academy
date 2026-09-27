#!/usr/bin/env node
const assert=require('node:assert/strict');
const Agency=require('../js/adaptive-learner-agency.js');
const WaitRelease=require('../js/adaptive-wait-release.js');
const ResumeEligibility=require('../js/adaptive-resume-eligibility.js');
const ResumeContext=require('../js/adaptive-resume-context.js');

const wait={state:'OPPORTUNITY_FOUND_AWAITING_EVENT',cause:'meaningful-opportunity-found-without-movement-authorization'};
const preserved={currentExperienceId:'shopping-for-dinner',experienceLanguage:'en',experienceQuestion:3,experienceTense:'present',experienceForm:'affirmative'};
const snapshot=ResumeContext.captureResumeContext(preserved);

let agency=Agency.evaluateAgency(wait,null);
assert.equal(agency.status,'AGENCY_NOT_OBSERVED');
let release=WaitRelease.evaluateRelease(wait,agency);
assert.equal(release.status,'WAIT_PRESERVED');
let eligibility=ResumeEligibility.evaluateResumeEligibility(release,{currentExperience:'shopping-for-dinner'});
assert.equal(eligibility.status,'RESUME_NOT_ELIGIBLE');
assert.equal(ResumeContext.evaluateResumeContext(snapshot,eligibility).status,'RESUME_CONTEXT_PRESERVED');

const unrelated={observed:true,actor:'learner',relevantToWait:false,intent:'continue',type:'click'};
agency=Agency.evaluateAgency(wait,unrelated);
assert.equal(agency.status,'AGENCY_AMBIGUOUS');
release=WaitRelease.evaluateRelease(wait,agency);
assert.equal(release.status,'WAIT_PRESERVED');

const continueEvent={observed:true,actor:'learner',relevantToWait:true,intent:'continue',type:'continue'};
agency=Agency.evaluateAgency(wait,continueEvent);
assert.equal(agency.status,'RESUME_AUTHORIZATION_ELIGIBLE');
release=WaitRelease.evaluateRelease(wait,agency);
assert.equal(release.status,'RELEASE_ELIGIBLE');
eligibility=ResumeEligibility.evaluateResumeEligibility(release,{currentExperience:'shopping-for-dinner'});
assert.equal(eligibility.status,'RESUME_ELIGIBLE');
const resume=ResumeContext.evaluateResumeContext(snapshot,eligibility);
assert.equal(resume.status,'RESUME_CONTEXT_ELIGIBLE');
assert.equal(resume.snapshot.currentExperienceId,'shopping-for-dinner');

const Advance=require('../js/adaptive-advance-selector.js');
const noAdvance=Advance.select({action:'continue-assessment'},{currentExperience:'shopping-for-dinner'});
assert.equal(noAdvance.action,'continue-assessment');
assert.equal(noAdvance.experienceId,'shopping-for-dinner');

console.log('GREEN agency boundary: PASS — GREEN wait is preserved until a relevant learner resume event; release resumes the preserved Experience and still does not manufacture NEXT.');
