const assert = require('assert');
const Resume = require('../js/adaptive-resume-eligibility.js');

const current = { currentExperience: 'shopping-for-dinner' };

assert.deepStrictEqual(
  Resume.evaluateResumeEligibility(null, current),
  {
    status: 'RESUME_NOT_ELIGIBLE',
    reason: 'wait-not-release-eligible',
    experienceId: 'shopping-for-dinner'
  }
);

assert.deepStrictEqual(
  Resume.evaluateResumeEligibility({ status: 'WAIT_PRESERVED' }, current),
  {
    status: 'RESUME_NOT_ELIGIBLE',
    reason: 'wait-not-release-eligible',
    experienceId: 'shopping-for-dinner'
  }
);

assert.deepStrictEqual(
  Resume.evaluateResumeEligibility({ status: 'RELEASE_ELIGIBLE' }, {}),
  {
    status: 'RESUME_NOT_ELIGIBLE',
    reason: 'preserved-current-experience-unavailable',
    experienceId: null
  }
);

assert.deepStrictEqual(
  Resume.evaluateResumeEligibility({ status: 'RELEASE_ELIGIBLE' }, current),
  {
    status: 'RESUME_ELIGIBLE',
    reason: 'release-eligible-with-preserved-current-experience',
    experienceId: 'shopping-for-dinner',
    scope: 'current-experience'
  }
);

console.log('Adaptive resume eligibility: PASS — release eligibility may expose the preserved current Experience without executing RESUME, restart, or NEXT.');
