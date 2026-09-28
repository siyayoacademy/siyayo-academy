#!/usr/bin/env node
const assert = require('node:assert/strict');
const source = require('../js/adaptive-what-object-question-probe-specification-source.js');
const experiences = require('../data/learning/experience-seeds.json').items;
const nouns = require('../data/lexicon/nouns/nouns.json');
const skill = require('../data/learning/skills/what.json');
const shopping = experiences.find(item => item.id === 'shopping-for-dinner');
const preparing = experiences.find(item => item.id === 'preparing-dinner');
const having = experiences.find(item => item.id === 'having-dinner');

for (const language of ['en', 'es', 'pt']) {
  const probes = source.resolve(skill, preparing, having, nouns, language);
  assert.ok(probes, `S2 WHAT probe specification missing for ${language}`);
  assert.equal(probes.functionProbe.expectedAlternativeId, 'what');
  assert.equal(probes.functionProbe.dimension, 'question-function');
  assert.equal(probes.localProbe.experienceId, preparing.id);
  assert.equal(probes.localProbe.mode, 'local');
  assert.ok(probes.localProbe.expectedAlternativeIds.includes('carrots'));
  assert.ok(probes.localProbe.expectedAlternativeIds.includes('tomatoes'));
  assert.ok(!probes.localProbe.expectedAlternativeIds.includes('salmon'));
  assert.equal(probes.transferProbe.fromExperienceId, preparing.id);
  assert.equal(probes.transferProbe.experienceId, having.id);
  assert.equal(probes.transferProbe.mode, 'transfer');
  assert.deepEqual(probes.transferProbe.expectedAlternativeIds, ['salmon']);
  assert.equal(source.resolve(skill, shopping, preparing, nouns, language), null,
    'S1 WHICH transfer cannot be used as a WHAT S2 probe');
  assert.equal(source.resolve(skill, having, preparing, nouns, language), null,
    'reverse Experience navigation cannot manufacture transfer');
  assert.equal(source.resolve({...skill, id: 'which.use.determiner'}, preparing, having, nouns, language), null);
  assert.equal(source.resolve(skill, {...preparing, thinkingMind: preparing.thinkingMind.filter(q => q.questionWord !== 'where')}, having, nouns, language), null);
  const corrupted = {...preparing, thinkingMind: preparing.thinkingMind.map(q =>
    q.questionWord === 'what'
      ? {...q, answerGrounding: {...q.answerGrounding, acceptedVocabularyIds: ['salmon']}}
      : q)};
  assert.equal(source.resolve(skill, corrupted, having, nouns, language), null,
    'salmon is not a vegetable answer in S2');
}
console.log('PASS — three read-only WHAT probe specifications are grounded, trilingual and fail closed.');
