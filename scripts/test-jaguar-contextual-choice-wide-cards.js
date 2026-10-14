// JAGUAR ELO 7D.3.4 — visual policy regression: wide stacked R1/R2.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const css=fs.readFileSync('css/verb-explorer.css','utf8');
const runtime=fs.readFileSync('js/verb-explorer.js','utf8');
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const options=corpus.items.find(x=>x.id==='shopping-for-dinner').thinkingMind.find(q=>q.questionWord==='which').choiceContext.canonicalCandidates;
let n=0;
function check(test,message){assert.ok(test,message);n++;}
check(css.includes('.choice-options{display:grid;grid-template-columns:minmax(0,1fr);gap:9px}'),'R1/R2 occupy a single wide column at every viewport');
check(!css.includes('.choice-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}'),'two-column R1/R2 rule removed');
check(css.includes('.choice-options .choice-option{\n  width:100%;'),'each response card fills the container');
check(css.includes('.choice-options .choice-select span{'),'wide-card text receives readable sizing');
check(css.includes('.choice-option{grid-template-columns:48px minmax(0,1fr) 48px;position:relative}'),'speaker left, text center, symmetric trailing rail');
check(css.includes('.choice-feedback{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))'),'canonical/contextual feedback remains separate and unchanged');
check(css.includes('.choice-options,.choice-feedback{grid-template-columns:1fr}'),'portrait rule still applies');
check(options.length===2,'two canonical candidates remain');
check(options.every(c=>['en','es','pt'].every(l=>typeof c.response[l]==='string'&&c.response[l].length>0)),'all canonical response languages remain');
check(options[0].id==='fresh-mild-cheese'&&options[1].id==='aged-strong-cheese','pedagogical IDs and order are preserved');
check(runtime.includes('experienceChoiceCandidate=select.dataset.choiceSelect'),'selection still uses independent button');
check(runtime.includes('speakChoiceCandidate(audio.dataset.choiceAudio,audio);return'),'audio does not submit choice');
check(runtime.includes('renderLivingLines(x);renderChoiceResolver(x);window.SIYAYOPronounComparison?.mount('),'complementary pronoun section remains below choice');
console.log('PASS: '+n+' wide-R1/R2 layout regression assertions');
