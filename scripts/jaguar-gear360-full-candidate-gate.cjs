'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('verb-explorer.html','utf8');
const scripts=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]);
const required=['js/verb-explorer.js','js/verb-explorer-why-assessment-live.js','js/verb-explorer-dependency-head-probe-live.js','js/verb-explorer-patita-interaction-trail.js','js/verb-explorer-thinking-mind-assessment-selection.js','js/verb-explorer-polyglot-word-path-view.js'];
assert.ok(scripts.length>=48,'STOP: full Explorer replaced by reduced loader');
for(const file of required){assert.ok(scripts.includes(file),'STOP: required full Explorer module missing: '+file);assert.ok(fs.existsSync(file),'STOP: required module file absent: '+file)}
for(const file of ['data/learning/skills/why.json','data/learning/experience-seeds.json'])assert.ok(fs.existsSync(file),'STOP: required corpus missing '+file);
for(const exp of ['shopping','preparing','having','after-dinner'])for(const lang of ['en','es','pt']){const name='data/learning/dependencies/'+exp+'-why-'+lang+'.json';const obj=JSON.parse(fs.readFileSync(name,'utf8'));assert.ok(obj.sentence&&obj.tokens?.length,'Missing authored WHY corpus '+name)}
const why=fs.readFileSync('js/verb-explorer-why-assessment-live.js','utf8');assert.ok(why.includes('function mountExploration('),'STOP: no-NICK study fallback missing');
const css=fs.readFileSync('css/verb-explorer.css','utf8');assert.ok(css.includes('#whyAssessmentPanel .why-contextual-reason-probe{width:100%'),'STOP: PT wrapping fix missing');
console.log('PASS full Explorer candidate integrity: '+scripts.length+' scripts; S1-S4 x EN/ES/PT; no-NICK fallback; PT wrapping fix');
