#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs');
const seeds=require('../data/learning/experience-seeds.json').items;
const accessories=require('../data/learning/nice-party-accessories.json');
const Definition=require('../js/adaptive-dependency-head-probe-definition.js');

const preparing=seeds.find(x=>x.id==='preparing-dinner');
const where=preparing.thinkingMind.find(q=>q.questionWord==='where');
assert.ok(where);
assert.equal(where.assessmentTarget,undefined);
assert.equal(where.assessmentResumeTarget,undefined);

const plate=accessories.categories.find(c=>c.id==='table-setting').items.find(i=>i.id==='plate');
assert.deepEqual(plate,{id:'plate',en:'plate',es:'plato',pt:'prato'});
assert.match(where.responses.en,/plate/);
assert.match(where.responses.es,/plato/);
assert.match(where.responses.pt,/prato/);

for(const language of ['en','es','pt']){
  const id=where.dependencyFocus.structureIds[language];
  const structure=require('../data/learning/dependencies/'+id+'.json');
  assert.equal(structure.language,language);
  assert.equal(structure.source.experienceId,'preparing-dinner');
  assert.equal(structure.source.questionWord,'where');
  const relation=structure.relations.find(r=>r.dependent==='where');
  assert.deepEqual(relation,{head:'put',dependent:'where',relation:'advmod'});
  const def=Definition.create(structure,{
    experienceId:'preparing-dinner',
    targetTokenId:'where',
    prompt:where.dependencyHeadProbe.prompt[language],
    alternativeTokenIds:where.dependencyHeadProbe.alternativeTokenIdsByLanguage[language]
  });
  assert.ok(def);
  assert.equal(def.expectedHeadTokenId,'put');
}
const runtime=fs.readFileSync('js/verb-explorer.js','utf8');
for(const language of ['en','es','pt'])
  assert.ok(runtime.includes('data/learning/dependencies/preparing-where-'+language+'.json'));
console.log('PASS — Preparing WHERE is presentation-grounded to canonical plate/plato/prato and dependency DNA, while assessment remains absent.');
