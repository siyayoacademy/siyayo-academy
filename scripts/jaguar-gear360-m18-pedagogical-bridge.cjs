const fs=require('node:fs'),assert=require('node:assert/strict');const read=p=>fs.readFileSync(p,'utf8');
const driver=read('js/verb-explorer.js'),html=read('verb-explorer.html'),bridge=read('js/gear360-why-pedagogical-bridge.js');
assert.ok(html.indexOf('js/gear360-why-pedagogical-bridge.js')<html.indexOf('js/verb-explorer.js'));
assert.match(driver,/SIYAYOGear360WhyPedagogicalBridge\?\.render/);
assert.match(driver,/matchingQuestion>=0\?matchingQuestion:0/);
assert.match(bridge,/source|fetch\('data\/learning\/dependencies\//);
for(const exp of ['shopping','preparing','having','after-dinner'])for(const lang of ['en','es','pt']){
 const o=JSON.parse(read('data/learning/dependencies/'+exp+'-why-'+lang+'.json'));
 assert.ok(o.sentence&&Array.isArray(o.tokens)&&o.tokens.length>0);
}
for(const forbidden of ['submitObservedAttempt','GREEN_PASS','getId','learnerId','assessmentScope'])assert.ok(!bridge.includes(forbidden),'Pedagogical bridge contains evaluator/identity reference '+forbidden);
console.log('PASS static: 12 WHY corpora + no-NICK presentation boundary + script ordering + QW retention');
