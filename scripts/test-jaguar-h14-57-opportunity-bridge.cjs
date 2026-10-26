'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),api=require(path.join(root,'js/verb-explorer-h14-57-opportunity-bridge.js'));
const contractApi=require(path.join(root,'js/question-word-assessment-contract.js'));
const corpus=JSON.parse(fs.readFileSync(path.join(root,'data/learning/experience-seeds.json'),'utf8')).items;
const ex=(id,qw)=>corpus.find(e=>e.id===id).thinkingMind.find(q=>q.questionWord===qw);
const observed=(experienceId,qw,lang='en',nick='A',kind='patita-interaction')=>({kind,evidenceProduced:false,learnerId:nick,after:{experienceId,questionWord:qw,language:lang}});
const inspect=(rows,nick='A')=>api.inspect({nick,observations:rows,experiences:corpus,contractApi});
test('real corpus is four Experiences with 21 QW slots',()=>{assert.equal(corpus.length,4);assert.equal(corpus.flatMap(x=>x.thinkingMind).length,21)});
test('S1 WHY observed does not generate declared target',()=>{
 const p=inspect([observed('shopping-for-dinner','why','pt')]);assert.equal(p.length,1);
 assert.equal(p[0].status,'OPPORTUNITY_ONLY');assert.equal(p[0].skill,null);
 assert.equal(p[0].canIssueEvidence,false);assert.equal(p[0].selectionRequested,false);
});
test('S3 WHY existing target is distinguished from authority to evaluate',()=>{
 const p=inspect([observed('having-dinner','why')]);assert.equal(p[0].status,'DECLARED_TARGET_REQUIRES_AUTHORITY');
 assert.equal(p[0].skill,'why.use.contextual-reason');assert.equal(p[0].canSubmitAttempt,false);
});
test('S4 WHY corpus question alone is not a contract',()=>{
 const p=inspect([observed('after-dinner-conversation','why','es')]);
 assert.equal(p[0].status,'OPPORTUNITY_ONLY');
});
test('all EN ES PT and origin Experiences remain separate',()=>{
 const arr=['en','es','pt'].map(x=>observed('having-dinner','why',x)).concat(observed('shopping-for-dinner','why','en'));
 const p=inspect(arr);
 assert.equal(p.length,4);assert.deepEqual(p.map(x=>x.language).sort(),['en','en','es','pt']);
 assert.ok(p.every(x=>x.canGrantGreenPass===false));
});
test('observations do not survive NICK identity mismatch',()=>{
 const row=observed('having-dinner','why','en','B');assert.equal(inspect([row]).length,0);
 assert.equal(inspect([row],'').length,0);
});
test('ignored PATITA false-credit, unknown QW, unknown Experience, and other rows',()=>{
 const a=observed('having-dinner','why');assert.equal(inspect([
  {...a,evidenceProduced:true}, {...a,kind:'canonical-evidence'},
  observed('wrong-experience','why'),observed('having-dinner','how-many'),
  {...a,learnerId:null}
 ]).length,0);
});
test('repeated clicks aggregate counts without awarding progress',()=>{
 const p=inspect([observed('having-dinner','why'),observed('having-dinner','why')]);
 assert.equal(p.length,1);assert.equal(p[0].observations,2);assert.equal(p[0].canGrantGreenPass,false);
});
test('source corpus and PATITA records remain immutable',()=>{
 const a=[observed('having-dinner','why')],before=JSON.stringify(a),whole=JSON.stringify(corpus);
 inspect(a);assert.equal(JSON.stringify(a),before);assert.equal(JSON.stringify(corpus),whole);
});
test('malformed injection does not create contract',()=>{
 assert.equal(inspect([{kind:'patita-observed-result',learnerId:'A',evidenceProduced:false,experienceId:'having-dinner',questionWord:'why',language:'ru'}]).length,0);
 assert.equal(api.inspect({nick:'A',observations:[],experiences:corpus,contractApi:null}).length,0);
});
test('Explorer integration is opt-in and preserves independent existing interfaces',()=>{
 const html=fs.readFileSync(path.join(root,'verb-explorer.html'),'utf8');
 const js=fs.readFileSync(path.join(root,'js/verb-explorer.js'),'utf8');
 assert.match(html,/id="h1457OpportunityReview"[^>]*hidden/);
 assert.match(html,/js\/verb-explorer-h14-57-opportunity-bridge\.js/);
 assert.match(js,/SIYAYOH1457OpportunityBridge\?\.refresh/);
 assert.match(html,/id="learnerTrailSurface"/);
 assert.match(html,/id="patitaInteractionLedger"/);
 assert.match(html,/id="h14SpecializedPreview"[^>]*hidden/);
 assert.match(js,/SIYAYOVerbExplorerThinkingMindAssessmentSelection/);
});
test('default hidden guard avoids reading ledger and grants nothing',()=>{
 let calls=0;const doc={getElementById(){return {hidden:false}}};
 const original=global.location;
 try{
  global.location={search:''};
  const result=api.refresh({document:doc,experiences:corpus,language:'en'});
  assert.equal(result,null);assert.equal(calls,0);
 }finally{global.location=original;}
});
