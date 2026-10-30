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

// A full candidate cannot silently lose one of its declared runtime assets.
const styles=[...html.matchAll(/<link[^>]*href="([^"]+\\.css)"/g)].map(m=>m[1]);
for(const file of [...scripts,...styles]){
 assert.ok(fs.existsSync(file),'STOP: HTML runtime asset missing '+file);
}
assert.equal(new Set(scripts).size,scripts.length,'STOP: duplicate runtime script');
for(const file of ['js/verb-explorer-learner-identity-surface.js','js/verb-explorer-learner-trail-surface.js']){
 assert.ok(scripts.includes(file),'STOP: learner identity/trail surface disconnected '+file);
}
const mainDriver=fs.readFileSync('js/verb-explorer.js','utf8');
for(const marker of ['SIYAYOVerbExplorerWhyAssessmentLive','SIYAYOVerbExplorerLearnerTrailSurface','SIYAYOVerbExplorerDependencyHeadProbeLive']){
 assert.ok(mainDriver.includes(marker),'STOP: full GEAR driver missing specialized mount '+marker);
}
console.log('PASS full candidate asset closure: '+scripts.length+' scripts, '+styles.length+' styles');
