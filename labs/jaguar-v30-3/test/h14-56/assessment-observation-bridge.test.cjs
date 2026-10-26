'use strict';
const assert=require('node:assert/strict'),test=require('node:test');
const path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'../../../..');
const scopeApi=require(path.join(root,'js/adaptive-assessment-scope.js'));
const contractApi=require(path.join(root,'js/question-word-assessment-contract.js'));
const progressView=require(path.join(root,'js/adaptive-pass-contract-progress-view.js'));
const {createAssessmentObservationBridge}=require('./assessment-observation-bridge.cjs');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'data/learning/experience-seeds.json'),'utf8'));
const nick='LAB-NICK',learnerId='LAB-SUBJECT-A';
const qw=(exp,word)=>corpus.items.find(x=>x.id===exp).thinkingMind.find(x=>x.questionWord===word);
const status=(xs,experience,word,language)=>xs.find(x=>x.experienceId===experience&&x.questionWord===word&&x.language===language);
const s=(skill,language,origin,who=learnerId)=>scopeApi.create({learnerId:who,skill,language,originExperienceId:origin});
const evidence=(scope,dim,result='pass')=>({skill:scope.skill,result,
 dimension:dim,context:{assessmentScope:scope,language:scope.language,experienceId:scope.originExperienceId}});
const contract=()=>({requires:[{dimension:'question-function'},{dimension:'reason-answer(local)'},{dimension:'reason-answer(transfer)'}]});
const evaluator={
 evaluateContract(c,p){return {status:'MOCK_ONLY_NO_GREEN',requirements:c.requires.map(req=>({satisfied:p.some(x=>this.evidenceMatchesRequirement(x,req))}))}},
 evidenceMatchesRequirement(p,req){return p&&p.result==='pass'&&p.dimension===req.dimension;}
};
let contexts=[];
let lookupNick=nick;
function make(){return createAssessmentObservationBridge({scopeApi,contractApi,progressView,evaluator,
 resolveVisualIdentity:n=>n===lookupNick?{linkStatus:'LAB_LINKED_IDENTITY',displayNick:n,learnerId}:null,
 listCanonicalContexts:()=>contexts
});}
const obs=(n='pt',person=nick)=>({kind:'patita-observed-result',learnerId:person,
 language:n,evidenceProduced:false,answer:'Because...',questionWord:'why'});
const base={nick,corpus,visibleExperience:'shopping-for-dinner',visibleLanguage:'en',visibleQw:'why',patitaObservations:[obs()]};
test('real corpus: 4 Experiences and 21 authored QW slots; all three languages are visible opportunities',()=>{
 contexts=[];const p=make().project({...base,nick:''});
 assert.equal(corpus.items.length,4);
 assert.equal(corpus.items.reduce((n,x)=>n+x.thinkingMind.length,0),21);
 assert.equal(p.opportunities.length,63);assert.equal(p.nickActive,false);
 assert.equal(p.progress.length,0);assert.equal(p.canGrantGreenPass,false);
});
test('S1 WHY is an opportunity, never inferred as an assessment target',()=>{
 const p=make().project(base),o=status(p.opportunities,'shopping-for-dinner','why','en');
 assert.equal(o.status,'OPPORTUNITY_ONLY');assert.equal(o.canCreateAttempt,false);
});
test('existing S3 WHY target and declared S4 transfer retain their different authority statuses',()=>{
 const p=make().project(base);
 const s3=status(p.opportunities,'having-dinner','why','en');
 assert.ok(s3);
 assert.equal(s3.status,'DECLARED_TARGET_REQUIRES_AUTHORITY');
 assert.equal(status(p.opportunities,'after-dinner-conversation','why','en').status,'OPPORTUNITY_ONLY');
});
test('inactive NICK or unlinked NICK cannot produce progress despite observations',()=>{
 contexts=[{scope:s('why.use.contextual-reason','en','having-dinner'),passContract:contract(),evidencePackets:[]}];
 assert.equal(make().project({...base,nick:''}).progress.length,0);
 assert.equal(make().project({...base,nick:'FOREIGN'}).progress.length,0);
 assert.equal(make().project({...base,nick:'FOREIGN'}).identityLinked,false);
});
test('PATITA observations never become Attempt, canonical Evidence or Green Pass',()=>{
 contexts=[];const p=make().project({...base,patitaObservations:[obs(),obs('en'),obs('es')]});
 assert.equal(p.observationCount,3);assert.equal(p.progress.length,0);
 assert.equal(p.canCreateAttempt,false);assert.equal(p.canIssueEvidence,false);assert.equal(p.canGrantGreenPass,false);
});
test('EN/ES/PT independent canonical scopes are visible while exploring another Experience and language',()=>{
 const origin='having-dinner',skill='why.use.contextual-reason';
 contexts=['en','es','pt'].map((lang,n)=>{const scope=s(skill,lang,origin);return {scope,passContract:contract(),
 evidencePackets:['question-function','reason-answer(local)','reason-answer(transfer)'].slice(0,n+1).map(dim=>evidence(scope,dim))}});
 const p=make().project({...base,visibleExperience:'shopping-for-dinner',visibleLanguage:'pt',visibleQw:'what'});
 assert.equal(p.progress.length,3);
 assert.deepEqual(p.progress.map(x=>x.language),['en','es','pt']);
 assert.deepEqual(p.progress.map(x=>x.completed),[1,2,3]);
 assert.deepEqual(p.progress.map(x=>x.total),[3,3,3]);
 assert.ok(p.progress.every(x=>!x.currentVisibleContext&&!x.greenPassIssued));
});
test('same skill and language different origin Experiences remain separate',()=>{
 const a=s('why.use.contextual-reason','en','shopping-for-dinner');
 const b=s('why.use.contextual-reason','en','preparing-dinner');
 contexts=[a,b].map(scope=>({scope,passContract:contract(),evidencePackets:[evidence(scope,'question-function')]}));
 const p=make().project(base);assert.equal(p.progress.length,2);
 assert.notEqual(p.progress[0].scopeKey,p.progress[1].scopeKey);
});
test('wrong subject, wrong scope or mismatched-language packet cannot credit another circuit',()=>{
 const a=s('why.use.contextual-reason','en','having-dinner');
 const outsider=s('why.use.contextual-reason','en','having-dinner','OUTSIDER');
 const otherLanguage=s('why.use.contextual-reason','es','having-dinner');
 contexts=[
  {scope:outsider,passContract:contract(),evidencePackets:[evidence(outsider,'question-function')]},
  {scope:a,passContract:contract(),evidencePackets:[evidence(outsider,'question-function'),evidence(otherLanguage,'reason-answer(local)')]}
 ];
 const p=make().project(base);assert.equal(p.progress.length,1);assert.equal(p.progress[0].completed,0);
});
test('missing accepted evaluator result prevents forged pass-only packets',()=>{
 const a=s('why.use.contextual-reason','pt','having-dinner');
 contexts=[{scope:a,passContract:contract(),evidencePackets:[evidence(a,'question-function','fail'),{...evidence(a,'reason-answer(local)'),result:'pending'}]}];
 assert.equal(make().project(base).progress[0].completed,0);
});
test('duplicate scope cannot manufacture multiple rows or inflate progress',()=>{
 const a=s('why.use.contextual-reason','en','having-dinner');
 contexts=[{scope:a,passContract:contract(),evidencePackets:[evidence(a,'question-function')]},
  {scope:a,passContract:contract(),evidencePackets:[evidence(a,'question-function'),evidence(a,'reason-answer(local)')]}];
 const p=make().project(base);assert.equal(p.progress.length,1);assert.equal(p.progress[0].completed,1);
});
test('changing visible Experience/QW/language changes presentation not already linked progress',()=>{
 const a=s('why.use.contextual-reason','en','having-dinner');
 contexts=[{scope:a,passContract:contract(),evidencePackets:[evidence(a,'question-function')]}];
 const b=make();
 const p1=b.project({...base,visibleLanguage:'pt',visibleQw:'where'}).progress;
 const p2=b.project({...base,visibleLanguage:'es',visibleExperience:'preparing-dinner',visibleQw:'which'}).progress;
 assert.equal(p1.length,1);assert.deepEqual(p1.map(x=>x.scopeKey),p2.map(x=>x.scopeKey));
 assert.equal(p2[0].completed,1);
});
test('snapshot never mutates original corpus, PATITA records or canonical contexts',()=>{
 const a=s('why.use.contextual-reason','en','having-dinner');contexts=[{scope:a,passContract:contract(),evidencePackets:[evidence(a,'question-function')]}];
 const before=JSON.stringify(contexts),corpusSize=JSON.stringify(corpus).length;
 const o=[obs()];const old=JSON.stringify(o);
 make().project({...base,patitaObservations:o});
 assert.equal(JSON.stringify(contexts),before);
 assert.equal(JSON.stringify(o),old);assert.equal(JSON.stringify(corpus).length,corpusSize);
});
test('unknown QW and malformed contexts cannot invent assessment progress',()=>{
 const b=make(),a=s('foo.use.fake','en','having-dinner');
 contexts=[{scope:a,passContract:{requires:[]},evidencePackets:[]},null];
 const p=b.project(base);
 assert.equal(p.progress.length,0);
 assert.equal(p.opportunities.some(o=>o.questionWord==='how far'&&o.status!=='OPPORTUNITY_ONLY'),false);
});
