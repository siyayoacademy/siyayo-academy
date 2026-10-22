// SIYAYO Jaguar V30.3.89O — source-provenance and sequence regression.
// Audit only. Does not invoke accepted learner Attempts, publish UI, or promote candidate QWs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createRequire} from 'node:module';
const root=process.env.SIYAYO_89O_PINNED_ROOT;
if(!root)throw Error('STOP: pinned canonical Explorer checkout is mandatory');
const base=resolve(process.cwd(),root);
const requireSource=createRequire(join(base,'package.json'));
const read=path=>readFileSync(join(base,path),'utf8');
const data=JSON.parse(read('data/learning/experience-seeds.json'));
const stages=data.items;
const byId=Object.fromEntries(stages.map(e=>[e.id,e]));
const q=(stage,id)=>byId[stage].thinkingMind.find(x=>x.questionWord===id);
const skills=Object.fromEntries(['which','what','where','why'].map(x=>
 [x,JSON.parse(read('data/learning/skills/'+x+'.json'))]));
const lang=['en','es','pt'];
const order=['shopping-for-dinner','preparing-dinner','having-dinner','after-dinner-conversation'];
const questions={
 'shopping-for-dinner':['what','where','how-much','which','why','who'],
 'preparing-dinner':['what','where','when','how','which','why','who'],
 'having-dinner':['what','who','how','why'],
 'after-dinner-conversation':['what','who','why','how']
};
const source=read('js/verb-explorer.js');
const markup=read('verb-explorer.html');
const reviewSpec=read('scripts/test-jaguar-review-after-contextual-feedback.js');
const whySource=read('js/verb-explorer-why-assessment-live.js');
const whyProbe=read('js/adaptive-why-contextual-reason-probe-specification-source.js');
const registry=JSON.parse(read('labs/jaguar-v30-3/governance/contract-evolution-registry.json'));

test('89O.1 four Experience stages follow S1 → S2 → S3 → S4 → S1 in authored Toro route',()=>{
 assert.deepEqual(stages.map(x=>x.id),order);
 for(let i=0;i<stages.length;i++)
  assert.equal(stages[i].toroidalNext.nextExperience,order[(i+1)%4]);
 // This sequence describes available routes, not automatic scored advancement.
});
test('89O.1 all 21 authored Question Word slots are grounded in EN ES PT across 8 distinct types',()=>{
 let slots=0;const kinds=new Set();
 for(const stage of stages){
  const words=stage.thinkingMind.map(x=>x.questionWord);
  assert.deepEqual(words,questions[stage.id]);
  assert.equal(new Set(words).size,words.length);
  for(const qq of stage.thinkingMind){
   kinds.add(qq.questionWord);slots++;
   for(const l of lang)assert.ok(typeof qq.question?.[l]==='string'&&qq.question[l].trim().length>5,
    stage.id+' '+qq.questionWord+' '+l);
  }
 }
 assert.equal(slots,21);assert.equal(slots*lang.length,63);assert.equal(kinds.size,8);
});
test('89O.1 only the four authored contract families appear in Word Path; not all 8 QWs scored',()=>{
 assert.deepEqual(Object.keys(skills),['which','what','where','why']);
 const ids=Object.values(skills).map(x=>x.id);
 assert.equal(new Set(ids).size,4);
 for(const def of Object.values(skills)){
  assert.equal(def.passContract.requires.length,3);
  for(const l of lang)assert.ok(def.realizations[l]?.form);
 }
 assert.equal(skills.where.status,'isolated-candidate','WHERE not implicitly homologated');
});
test('89O.2 contextual R1/R2 review is scoped to S1 WHICH, not every WHY wording',()=>{
 const contexts=stages.flatMap(s=>s.thinkingMind
  .filter(x=>x.choiceContext).map(x=>({stage:s.id,word:x.questionWord,candidates:x.choiceContext.canonicalCandidates})));
 assert.equal(contexts.length,1);
 assert.equal(contexts[0].stage,'shopping-for-dinner');
 assert.equal(contexts[0].word,'which');
 assert.equal(contexts[0].candidates.length,2);
 assert.equal(q('shopping-for-dinner','why').choiceContext,undefined);
 assert.equal(q('having-dinner','why').choiceContext,undefined);
 assert.ok(markup.indexOf('id="choiceReview"')>markup.indexOf('id="choiceFeedback"'));
 assert.match(source,/function renderChoiceReview\(/);
 assert.match(source,/if\(result\.canonicalForm\.valid\)renderChoiceReview\(review,experienceLanguage\)/);
 assert.match(source,/if\(!experienceChoiceCandidate\)\{feedback\.innerHTML=/);
});
test('89O.2 REVIEW is EN ES PT, speech follows identical displayed text, never awards score',()=>{
 const copy={
  en:['REVIEW','Why does this choice fit the dinner?'],
  es:['REVISIÓN','¿Por qué esta elección combina con la cena?'],
  pt:['REVISÃO','Por que esta escolha combina com o jantar?']
 };
 for(const [l,[role,sentence]]of Object.entries(copy)){
  assert.ok(source.includes(role),l);
  assert.ok(source.includes(sentence),l);
 }
 assert.match(source,/speakText\(contextualChoiceReviewLine\(experienceLanguage\)\.text,experienceLanguage\)/);
 assert.match(reviewSpec,/hidden pre-choice/);
 assert.match(reviewSpec,/candidate id unchanged/);
 assert.doesNotMatch(whySource,/choiceReview|renderChoiceReview/);
});
test('89O.3 WHICH, WHAT, WHERE, WHY have independently defined three-requirement contracts',()=>{
 const want={
  which:['choice-function','determiner-use','determiner-use'],
  what:['question-function','object-answer','object-answer'],
  where:['spatial-function','location-answer','location-answer'],
  why:['question-function','reason-answer','reason-answer']
 };
 for(const [word,dimensions]of Object.entries(want)){
  const req=skills[word].passContract.requires;
  assert.deepEqual(req.map(r=>r.dimension),dimensions);
  assert.equal(req[1].mode,'local');
  assert.equal(req[2].mode,'transfer');
 }
});
test('89O.3 supported transfer edges are contextual; not one automatic QW promotion order',()=>{
 const edges=[
  ['which','shopping-for-dinner','preparing-dinner'],
  ['what','shopping-for-dinner','preparing-dinner'],
  ['what','preparing-dinner','having-dinner'],
  ['where','shopping-for-dinner','preparing-dinner'],
  ['why','having-dinner','after-dinner-conversation']
 ];
 for(const [word,from,to]of edges){
  assert.ok(q(from,word),word+' origin missing');
  assert.ok(q(to,word),word+' destination missing');
  assert.equal(byId[from].toroidalNext.nextExperience,to);
 }
 // These are documented candidate/probe paths, not a required linear curriculum.
 assert.equal(edges.filter(x=>x[0]==='what').length,2);
});
test('89O.3 WHY canonical probe activates at S3 and transfers only to S4, independent of Shopping REVIEW',()=>{
 assert.ok(q('having-dinner','why').reasonGrounding);
 assert.ok(q('after-dinner-conversation','why').reasonGrounding);
 const spec=requireSource('./js/adaptive-why-contextual-reason-probe-specification-source.js');
 for(const l of lang){
  const trio=spec.resolve(skills.why,byId['having-dinner'],byId['after-dinner-conversation'],l);
  assert.ok(trio,l);
  assert.equal(trio.functionProbe.dimension,'question-function');
  assert.equal(trio.localProbe.dimension,'reason-answer');
  assert.equal(trio.localProbe.experienceId,'having-dinner');
  assert.equal(trio.transferProbe.mode,'transfer');
  assert.equal(trio.transferProbe.experienceId,'after-dinner-conversation');
  assert.equal(trio.transferProbe.fromExperienceId,'having-dinner');
 }
 assert.match(whySource,/var available=transfer\?\[specs\.transferProbe\]:\[specs\.functionProbe,specs\.localProbe\]/);
 assert.match(whyProbe,/if\(!skill\|\|skill\.id!=='why\.use\.contextual-reason'/);
});
test('89O.4 future DISCOVER WHY remains explicitly parked, never silent runtime scope expansion',()=>{
 const planned=registry.candidates.find(x=>x.id==='JAGUAR-7D.3.10-CONTEXTUAL-THINKING-MIND');
 assert.ok(planned);
 assert.equal(planned.status,'candidate-not-implemented');
 assert.equal(planned.capabilities.newVisualModuleAuthorized,false);
 assert.deepEqual(planned.capabilities.sequence,[
  'QUESTION','CHOICE R1/R2','CONTEXTUAL FEEDBACK 0/4–4/4',
  'REVIEW','DISCOVER WHY','REFLECT & TRANSFER'
 ]);
 assert.equal(planned.authority.revealCriteriaCreatesEvidence,false);
 assert.equal(planned.authority.exploratoryCardsGrantGreenPass,false);
 assert.equal(planned.authority.transferRequiresAuthorizedAssessmentTarget,true);
 assert.equal(registry.governance.constraints.newQuestionWordDoesNotImplyNewScoredContract,true);
});
test('89O.4 0/4–4/4 contextual response is never interchangeable with canonical 0/3–3/3',()=>{
 assert.match(source,/contextualResponse\.score/);
 assert.match(source,/contextualResponse\.possibleScore/);
 assert.equal(skills.which.passContract.requires.length,3);
 assert.equal(skills.why.passContract.requires.length,3);
 assert.equal(registry.governance.constraints.exploratoryEventsCannotCreateAcceptedEvidence,true);
 assert.equal(registry.governance.constraints.visualModulesCannotGrantGreenPass,true);
});
test('89O.4 prior homologation, public production and staging are separate, preserving fail-closed behavior',()=>{
 assert.equal(registry.canonicalSource.commit,'c7e83709cacf8479847df0f3cee4ed8a563aaae6');
 assert.equal(registry.canonicalSource.integrationStatus,'not-yet-merged-into-explorer-canonical-map');
 assert.equal(registry.governance.constraints.changesMustPreservePreviouslyHomologatedCircuits,true);
 assert.equal(registry.governance.constraints.nicknameIsNotServerAuthentication,true);
 const release=registry.integrationContracts.find(x=>x.id==='OPS-RELEASE');
 assert.match(release.status,/12-external-controls-blocked/);
});
