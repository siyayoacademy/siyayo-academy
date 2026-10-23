#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const a=require('../js/verb-explorer-visible-assessment-boundary.js');
const decision={skill:'what.use.object-question',assessmentScope:{learnerId:'why s3 s4',language:'en'}};
const base={questionWord:'why',wordType:'verb',language:'en',learnerId:'why s3 s4'};
assert.equal(a.classify({...base,decision}).status,'free-exploration');
assert.match(a.classify({...base,decision}).text,/active assessment is WHAT/);
assert.equal(a.classify({...base,decision:null}).status,'no-assessment');
assert.equal(a.classify({...base,decision:{skill:'why.use.contextual-reason',assessmentScope:decision.assessmentScope},panelVisible:true}).status,'assessment-panel');
assert.equal(a.classify({...base,decision:{skill:'why.use.contextual-reason',assessmentScope:decision.assessmentScope},panelVisible:false}).status,'assessment-not-visible');
assert.equal(a.classify({...base,wordType:'noun',decision}).status,'not-applicable');
assert.equal(a.classify({...base,decision:{...decision,assessmentScope:{learnerId:'another',language:'en'}}}).status,'no-assessment');
for(const language of ['en','es','pt']){
 const result=a.classify({...base,language,decision:{skill:'why.use.contextual-reason',assessmentScope:{learnerId:'why s3 s4',language}},panelVisible:true});
 assert.ok(result.text.length>70&&result.audibleOnly);
}
const html=fs.readFileSync('verb-explorer.html','utf8'),ui=fs.readFileSync('js/verb-explorer.js','utf8');
assert.ok(html.indexOf('js/verb-explorer-visible-assessment-boundary.js')<html.indexOf('js/verb-explorer.js'));
assert.ok(ui.includes('SIYAYOVerbExplorerVisibleAssessmentBoundary?.render?.'));
assert.ok(ui.includes('if(line)speakText(line.text,experienceLanguage)'),'LINES must remain audio-only');
assert.ok(!fs.readFileSync('js/verb-explorer-visible-assessment-boundary.js','utf8').includes('submitObservedAttempt'));
console.log('PASS JAGUAR 90C.4 read-only LINES vs assessment guard EN/ES/PT and foreign-learner negative');
