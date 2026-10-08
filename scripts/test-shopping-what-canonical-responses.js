const assert=require('node:assert/strict'),fs=require('node:fs');
const Source=require('../js/adaptive-what-object-question-probe-specification-source.js');
const Result=require('../js/adaptive-what-object-question-probe-result.js');
const seeds=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json')).items;
const skill=JSON.parse(fs.readFileSync('data/learning/skills/what.json'));
const nouns=JSON.parse(fs.readFileSync('data/lexicon/nouns/nouns.json'));
for(const language of ['en','es','pt']){
 const specs=Source.resolve(skill,seeds[0],seeds[1],nouns,language);assert.ok(specs);
 for(const a of specs.localProbe.alternatives){
  assert.ok(a.response);
  const event={observed:true,actor:'learner',relevantToWait:true,intent:'answer',type:'learner-response',source:'what-object-question-probe-select',occurrenceId:'canonical:'+language+':'+a.id,skill:skill.id,dimension:'object-answer',mode:'local',language,choice:a.id,fromExperienceId:null,experienceId:seeds[0].id};
  const result=Result.evaluate(specs.localProbe,event);assert.ok(result);
  assert.equal(result.result,a.id==='parsley'?'fail':'pass');
  assert.equal(result.greenPass,undefined);
 }
}
assert.match(fs.readFileSync('js/verb-explorer-what-assessment-live.js','utf8'),/alternative.response\|\|alternative.label/);
console.log('Shopping WHAT canonical responses: PASS; same identities/results EN/ES/PT, no new Green authority');
