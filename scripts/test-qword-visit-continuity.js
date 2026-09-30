#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('js/verb-explorer.js','utf8');
const navigation=code.match(/function goToExperience\(id\)\{[^\n]+/)[0];
for(const word of ['which','what','why']){
 const s={selected:word,currentExperienceId:'shopping-for-dinner',experienceQuestion:0,experiences:[{id:'shopping-for-dinner',thinkingMind:[{questionWord:word}]},{id:'preparing-dinner',thinkingMind:[{questionWord:'what'},{questionWord:'which'},{questionWord:'why'}]}],window:{SIYAYOVerbExplorerThinkingMindAssessmentSelection:{invalidatePending(){}}},syncExplorerRoute(){},renderExperience(){},activeThinkingQuestion(x){return x.thinkingMind[this.experienceQuestion||0]},activeExperience(){return s.experiences.find(x=>x.id===s.currentExperienceId)}};
 // Bind the same global lookup semantics as the browser runtime.
 s.activeThinkingQuestion=x=>x.thinkingMind[s.experienceQuestion];vm.createContext(s);vm.runInContext(navigation,s);
 assert.equal(s.goToExperience('preparing-dinner'),true);
 assert.equal(s.experiences[1].thinkingMind[s.experienceQuestion].questionWord,word);
 assert.equal(s.goToExperience('missing'),false);
}
const css=fs.readFileSync('css/verb-explorer.css','utf8');
const active=css.match(/#questionGear \.gear-option\.session-target\{([^}]+)\}/)[1];
assert.doesNotMatch(active,/#42d796|rgba\(66,215,150/);
assert.match(css,/#questionGear \.question-word-confirmed/);
console.log('QWord visit continuity and neutral active-assessment styling: PASS');
