const assert=require('node:assert/strict'),fs=require('node:fs');
const a=require('../js/verb-explorer-pronoun-comparison.js');
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json'));
const q=corpus.items.find(x=>x.id==='shopping-for-dinner').thinkingMind.find(x=>x.questionWord==='which');
const es=q.pronounComparison,pt=es.counterparts.pt;
for(const [spec,singular,plural] of [[es,'cual','cuales'],[pt,'qual','quais']]){
 assert.equal(spec.cases.length,2);assert.equal(spec.alternatives.length,2);
 for(const [i,expected,other] of [[0,singular,plural],[1,plural,singular]]){
  const c=spec.cases[i];
  assert.ok(!c.gapPrompt.includes(expected), 'hidden answer must not be exposed in question');
  assert.ok(!c.audioSetup.toLowerCase().includes(expected), 'audio must not reveal answer');
  let good=a.evaluate(spec,expected,c.id),bad=a.evaluate(spec,other,c.id);
  assert.equal(good.result,'pass');assert.equal(bad.result,'fail');
  assert.equal(good.greenPass,false);assert.equal(good.evidenceProduced,false);
 }
}
assert.equal(a.evaluate(es,'cual').result,'pass');
assert.equal(a.evaluate(es,'cuales').result,'fail');
assert.equal(a.evaluate(pt,'qual','singular').result,'pass');
assert.equal(a.evaluate(pt,'quais','plural').result,'pass');
assert.equal(a.evaluate({...es,language:'en'},'cual'),null);
console.log('PASS 89Z ES/PT singular plural; optional free practice cannot mint Evidence/Green.');
