const assert=require('node:assert/strict'),fs=require('node:fs');
const Definition=require('../js/adaptive-dependency-head-probe-definition.js'),Result=require('../js/adaptive-dependency-head-probe-result.js');
const q=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json')).items[0].thinkingMind.find(q=>q.questionWord==='what');
for(const l of ['en','es','pt']){
 const d=JSON.parse(fs.readFileSync('data/learning/dependencies/shopping-what-'+l+'.json'));
 const spec=Definition.create(d,{experienceId:'shopping-for-dinner',targetTokenId:q.dependencyHeadProbe.targetTokenId,prompt:q.dependencyHeadProbe.prompt[l],alternativeTokenIds:q.dependencyHeadProbe.alternativeTokenIdsByLanguage[l]});
 assert.ok(spec);
 const event={observed:true,actor:'learner',relevantToWait:true,intent:'continue',type:'learner-response',source:'dependency-head-probe-select',occurrenceId:'head:'+l,choice:'cook',experienceId:'shopping-for-dinner',structureId:d.id,language:l,dimension:'head-identification',targetTokenId:'what'};
 assert.equal(Result.evaluate(spec,event).result,'pass');
 assert.equal(Result.evaluate(spec,{...event,choice:q.dependencyHeadProbe.alternativeTokenIdsByLanguage[l][0]}).result,'fail');
 assert.equal(Result.evaluate(spec,{...event,language:'xx'}),null);
 assert.equal(Result.evaluate(spec,event).greenPass,undefined);
}
console.log('Shopping WHAT head diagnostic EN/ES/PT: PASS');
