#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const sandbox={Object,Number};sandbox.globalThis=sandbox;
vm.runInNewContext(fs.readFileSync('js/verb-explorer-experience-presentation-memory.js','utf8'),sandbox);
const Memory=sandbox.SIYAYOVerbExplorerExperiencePresentationMemory;
assert.ok(Memory);
assert.equal(Memory.remember('shopping-for-dinner',{
  questionWord:'which',perspective:'debating',choiceCandidate:'fresh-mild-cheese',
  wordType:'sentence',nounId:'cheese',adjectiveId:'fresh',lineOffset:2,
  tense:'past',form:'interrogative',session:{must:'not be retained'}
}),true);
const shopping=Memory.recall('shopping-for-dinner');
assert.deepEqual(JSON.parse(JSON.stringify(shopping)),{
  questionWord:'which',perspective:'debating',choiceCandidate:'fresh-mild-cheese',
  wordType:'sentence',nounId:'cheese',adjectiveId:'fresh',lineOffset:2,
  tense:'past',form:'interrogative'
});
assert.equal('session' in shopping,false,'presentation memory must not retain Session');
assert.equal(Memory.recall('preparing-dinner'),null,'unvisited Experience has no memory');
assert.equal(Memory.remember('preparing-dinner',{questionWord:'what',lineOffset:-9}),true);
assert.equal(Memory.recall('preparing-dinner').lineOffset,0);
assert.equal(Memory.forget('preparing-dinner'),true);
assert.equal(Memory.recall('preparing-dinner'),null);
Memory.clear();assert.equal(Memory.recall('shopping-for-dinner'),null);
const runtime=fs.readFileSync('js/verb-explorer.js','utf8');
for(const hook of ['rememberExperiencePresentation()','restoreExperiencePresentation(destination,selectedWord)','SIYAYOVerbExplorerExperiencePresentationMemory'])
  assert.ok(runtime.includes(hook),'missing TORO presentation-memory integration hook: '+hook);
const html=fs.readFileSync('verb-explorer.html','utf8');
assert.ok(html.includes('js/verb-explorer-experience-presentation-memory.js'),'production HTML must load TORO presentation memory');
assert.ok(html.indexOf('js/verb-explorer-experience-presentation-memory.js')<html.indexOf('js/verb-explorer.js'),'memory must load before Verb Explorer runtime');
console.log('PASS — TORO presentation memory is Experience-scoped, presentation-only, and wired before navigation runtime.');
