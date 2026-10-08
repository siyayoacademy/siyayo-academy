#!/usr/bin/env node
const assert=require('node:assert/strict');
const Profile=require('../js/adaptive-evidence-profile.js');
const Source=require('../js/adaptive-observed-attempt-evidence-source.js');
const skill='what.use.object-question',from='preparing-dinner',to='having-dinner';
for (const language of ['en','es','pt']) {
  const profile=Profile.createProfile('learner-'+language);
  const occurrenceId='what-object-question-probe-select:'+language;
  const learnerEvent={observed:true,actor:'learner',intent:'answer',source:'what-object-question-probe-select',
    occurrenceId,fromExperienceId:from,experienceId:to,language};
  const attempt={occurrenceId,skill,dimension:'object-answer',mode:'transfer',context:{
    occurrenceId,fromExperienceId:from,experienceId:to,language,selectedAlternativeId:'salmon'
  }};
  const packet={skill,dimension:'object-answer',result:'pass',support:'none',mode:'transfer',context:{
    occurrenceId,fromExperienceId:from,experienceId:to,language,selectedAlternativeId:'salmon'
  }};
  const session={decision:{skill,experienceId:from}};
  const input={cycleResult:{evidencePacket:packet},session,attempt,learnerEvent,context:{language}};
  assert.equal(Source.record(Profile,profile,input),profile);
  assert.equal(profile.observations.length,1);
  assert.equal(profile.observations[0].context.experienceId,to);
  assert.equal(profile.observations[0].context.fromExperienceId,from);
  assert.equal(profile.observations[0].context.confirmed,false);
  assert.equal(Source.record(Profile,profile,input),profile,'same occurrence cannot create a second footprint');
  assert.equal(profile.observations.length,1);
  assert.equal(Source.record(Profile,Profile.createProfile('wrong-origin'),{...input,
    learnerEvent:{...learnerEvent,fromExperienceId:'shopping-for-dinner'}}),null);
  assert.equal(Source.record(Profile,Profile.createProfile('wrong-language'),{...input,
    learnerEvent:{...learnerEvent,language:language==='en'?'es':'en'}}),null);
}
console.log('PASS — S2 WHAT transfer leaves one non-confirmatory S3 footprint in EN/ES/PT.');
