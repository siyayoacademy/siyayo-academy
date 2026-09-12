const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const resolver=require('../js/contextual-choice-resolver.js');
const experiences=require('../data/learning/experience-seeds.json');
const q=experiences.items.find(x=>x.id==='shopping-for-dinner').thinkingMind.find(x=>x.questionWord==='which');
const sandbox={};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('js/choice-evidence-evaluator.js','utf8'),sandbox);
const evaluate=sandbox.SIYAYOChoiceEvidenceEvaluator.evaluate;
function context(choice){return {currentExperienceId:'shopping-for-dinner',experienceLanguage:'en',experienceQuestion:2,experienceChoiceCandidate:choice};}
assert.equal(evaluate(resolver.resolveChoice(q.choiceContext,'fresh-mild-cheese','en')),null);
assert.equal(evaluate(resolver.resolveChoice(q.choiceContext,'fresh-mild-cheese','en'),context('fresh-mild-cheese')).result,'pass');
assert.equal(evaluate(resolver.resolveChoice(q.choiceContext,'aged-strong-cheese','en'),context('aged-strong-cheese')),null);
assert.equal(evaluate(resolver.resolveChoice(q.choiceContext,'missing-cheese','en'),context('missing-cheese')).result,'fail');
console.log('Choice evidence evaluator: PASS — grounded preferred=pass, possible=WAIT, invalid=fail; ungrounded evidence=WAIT.');
