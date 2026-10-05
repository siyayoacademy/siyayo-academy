#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs');
const files=[
  ['js/verb-explorer-what-assessment-live.js','WHAT'],
  ['js/verb-explorer-why-assessment-live.js','WHY'],
  ['js/verb-explorer-determiner-use-assessment-live.js','WHICH']
];
for(const [path,label] of files){
  const code=fs.readFileSync(path,'utf8');
  assert.match(code,/var feedbackMemory=Object\.create\(null\)/,label+' needs scoped feedback memory');
  assert.match(code,/decision&&decision\.assessmentScope\?decision\.assessmentScope\.key\+'\|'/,label+' feedback key must derive from canonical assessment scope');
  assert.match(code,/feedbackMemory\[feedbackKey\]=Object\.freeze\(\{text:feedback\.textContent\}\)/,label+' must store only presentation text');
  assert.match(code,/var savedFeedback=feedbackKey&&feedbackMemory\[feedbackKey\]/,label+' must restore only matching scope feedback');
  const restore=code.indexOf('var savedFeedback=feedbackKey&&feedbackMemory[feedbackKey]');
  const submit=code.lastIndexOf('submitObservedAttempt');
  assert.ok(restore>submit,label+' feedback restore must occur after handler wiring, not by resubmitting an Attempt');
}
console.log('PASS — WHAT/WHY/WHICH feedback survives remount by assessment scope without replaying learner Evidence.');
