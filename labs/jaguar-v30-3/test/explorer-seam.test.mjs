// V30.3.85: read-only cross-branch Explorer contract audit.
// Pinned Explorer code is downloaded by GitHub Actions, not modified.
// These tests establish interface facts and document gaps, NOT readiness to deploy.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
import {verifyMockIdentity} from './identity-mock/identity.mjs';

const lab=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const snapshot=resolve(lab,'..','..','.snapshot-explorer');
const read=(file)=>readFileSync(join(snapshot,'js',file),'utf8');
function load(...files) {
  const context={};
  files.forEach(file=>runInNewContext(read(file),context,{filename:file,timeout:2000}));
  return context;
}
function blobSHA(bytes){
  return createHash('sha1').update(Buffer.concat([Buffer.from('blob '+bytes.length+'\0'),bytes])).digest('hex');
}
const pins={
  'adaptive-assessment-scope.js':'ac0ec23f9a445377fba05092c684c2379afeff52',
  'verb-explorer-learner-identity-source.js':'556d7baac8d873dea4020c6268d45e5ac973aaff',
  'verb-explorer-learner-identity-provider.js':'3fa660989a60d67ae6f0bc7256609e82c49787e9',
  'verb-explorer-learner-event.js':'c45da1c55290f738e6161f22e885137ba903960e',
  'question-word-assessment-contract.js':'13d361054ca4cdb7a930aabb707b383f5041d733'
};
test('Explorer snapshot contains exactly the five audited blobs',()=>{
  for(const [name,expected] of Object.entries(pins)){
    const bytes=readFileSync(join(snapshot,'js',name));
    assert.equal(blobSHA(bytes),expected,name);
  }
});
test('NICK source is in-memory and does not authenticate',()=>{
  const x=load('verb-explorer-learner-identity-source.js').SIYAYOVerbExplorerLearnerIdentitySource;
  assert.equal(x.getId(),null);
  assert.equal(x.adopt(' ALUNO '),true);
  assert.equal(x.getId(),'ALUNO');
  assert.equal(Object.hasOwn(x,'authenticate'),false);
  x.clear();assert.equal(x.getId(),null);
});
test('identity provider forwards a NICK; it is not an authentication mechanism',()=>{
  const x=load('verb-explorer-learner-identity-source.js','verb-explorer-learner-identity-provider.js');
  assert.equal(x.SIYAYOVerbExplorerLearnerIdentityProvider.provide('ALUNO'),true);
  assert.equal(x.SIYAYOVerbExplorerLearnerIdentitySource.getId(),'ALUNO');
  assert.equal(Object.hasOwn(x.SIYAYOVerbExplorerLearnerIdentityProvider,'authenticate'),false);
});
test('Explorer assessment scope is learner + skill + language + origin',()=>{
  const api=load('adaptive-assessment-scope.js').AdaptiveAssessmentScope;
  const s=api.create({learnerId:'nick-a',skill:'which.use.determiner',language:'en',originExperienceId:'shopping-for-dinner'});
  assert.equal(api.valid(s),true);
  assert.equal(s.key,JSON.stringify(['nick-a','which.use.determiner','en','shopping-for-dinner']));
});
test('assessment scopes do not mix EN, ES, PT or individual learners',()=>{
  const api=load('adaptive-assessment-scope.js').AdaptiveAssessmentScope;
  const make=(learnerId,language)=>api.create({learnerId,skill:'which.use.determiner',language,originExperienceId:'shopping-for-dinner'});
  const s=['en','es','pt'].map(language=>make('nick-a',language));
  assert.equal(new Set(s.map(x=>x.key)).size,3);
  assert.equal(api.same(s[0],make('nick-b','en')),false);
  assert.equal(api.same(s[0],s[1]),false);
});
test('Explorer event IDs contain colon, which the current mock D1 contract does not accept',()=>{
  const api=load('verb-explorer-learner-event.js').SIYAYOVerbExplorerLearnerEvent;
  const ev=api.fromChoiceSelect('books',{currentExperienceId:'shopping-for-dinner',experienceLanguage:'en'});
  assert.equal(ev.occurrenceId,'choice-select:1');
  assert.equal(/^[A-Za-z0-9_-]{1,64}$/.test(ev.occurrenceId),false);
});
test('Explorer event counters restart in a new runtime; do NOT use as durable IDs',()=>{
  const first=load('verb-explorer-learner-event.js').SIYAYOVerbExplorerLearnerEvent;
  const second=load('verb-explorer-learner-event.js').SIYAYOVerbExplorerLearnerEvent;
  const state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'en'};
  assert.equal(first.fromChoiceSelect('books',state).occurrenceId,second.fromChoiceSelect('books',state).occurrenceId);
});
test('Explorer choice event carries no verified learner subject or authorized skill',()=>{
  const api=load('verb-explorer-learner-event.js').SIYAYOVerbExplorerLearnerEvent;
  const e=api.fromChoiceSelect('books',{currentExperienceId:'shopping-for-dinner',experienceLanguage:'en'});
  assert.equal(e.actor,'learner');
  assert.equal(e.observed,true);
  assert.equal(Object.hasOwn(e,'subject'),false);
  assert.equal(Object.hasOwn(e,'skillId'),false);
  assert.equal(Object.hasOwn(e,'greenPass'),false);
});
test('origin Experience and current Experience are distinct concepts',()=>{
  const context=load('adaptive-assessment-scope.js','verb-explorer-learner-event.js');
  const scope=context.AdaptiveAssessmentScope.create({learnerId:'nick-a',skill:'which.use.determiner',language:'en',originExperienceId:'shopping-for-dinner'});
  const e=context.SIYAYOVerbExplorerLearnerEvent.fromChoiceSelect('carrots',{currentExperienceId:'preparing-dinner',experienceLanguage:'en'});
  assert.notEqual(scope.originExperienceId,e.experienceId);
  assert.equal(scope.originExperienceId,'shopping-for-dinner');
  assert.equal(e.experienceId,'preparing-dinner');
});
test('Question Word opportunity alone never implies assessment',()=>{
  const api=load('question-word-assessment-contract.js').SIYAYOQuestionWordAssessmentContract;
  const result=api.inspect({questionWord:'WHICH'},null);
  assert.equal(result.status,'OPPORTUNITY_ONLY');
  assert.equal(result.assessmentDeclared,false);
  assert.equal(result.evidenceProduced,false);
  assert.equal(result.automaticPromotion,false);
});
test('declared assessment target still does not automatically produce evidence',()=>{
  const api=load('question-word-assessment-contract.js').SIYAYOQuestionWordAssessmentContract;
  const result=api.inspect({questionWord:'WHICH',assessmentTarget:{skill:'which.use.determiner',definitionPath:'data/mock.json'}},null);
  assert.equal(result.status,'ASSESSMENT_DECLARED');
  assert.equal(result.assessmentSkill,'which.use.determiner');
  assert.equal(result.evidenceProduced,false);
  assert.equal(result.automaticPromotion,false);
});
test('existing lab D1 scope omits skill and assessment origin: compatibility BLOCKED',()=>{
  const bridge=readFileSync(join(lab,'src/bridge.mjs'),'utf8');
  const declaration=bridge.split('\n').find(line=>line.includes('const scopeFor ='));
  assert.ok(declaration);
  assert.ok(declaration.includes('questionWord'));
  assert.ok(declaration.includes('experienceId'));
  assert.equal(declaration.includes('skillId'),false);
  assert.equal(declaration.includes('originExperienceId'),false);
});
test('mock proof rejection remains fail-closed and is not a real login',()=>{
  assert.equal(verifyMockIdentity(null,new Map(),1000).ok,false);
  assert.equal(verifyMockIdentity({ticket:'fake'},new Map(),1000).ok,false);
});
test('Explorer source explicitly distinguishes a NICK from persistence',()=>{
  const source=read('verb-explorer-learner-identity-source.js');
  assert.match(source,/does not invent, persist, authenticate, or derive learner identity/);
  assert.doesNotMatch(source,/localStorage|sessionStorage/);
});
