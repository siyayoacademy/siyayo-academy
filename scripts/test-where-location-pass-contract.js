#!/usr/bin/env node
const assert=require('node:assert/strict');
const GreenPass=require('../js/green-pass-profile.js');
const where=require('../data/learning/skills/where.json');

assert.equal(where.status,'isolated-candidate');
assert.equal(where.id,'where.use.location-question');
assert.equal(where.function.semanticFamily,'spatial-target');
assert.equal(where.function.subtype,'location');
assert.ok(where.passContract.doesNotClaim.includes('destination-use'));
assert.ok(where.passContract.doesNotClaim.includes('preposition-mastery'));

const contract=where.passContract;
let evidence=[
  {skill:where.id,dimension:'spatial-function',result:'pass',mode:'observed-diagnostic',support:'none',context:'shopping-for-dinner'},
  {skill:where.id,dimension:'location-answer',result:'pass',mode:'local',support:'none',context:'shopping-for-dinner'}
];
let result=GreenPass.evaluateContract(contract,evidence);
assert.equal(result.status,'WAITING_FOR_EVIDENCE');
assert.equal(result.missing.length,1);
assert.equal(result.missing[0].mode,'transfer');

evidence.push({skill:where.id,dimension:'location-answer',result:'pass',mode:'transfer',support:'none',context:'preparing-dinner'});
result=GreenPass.evaluateContract(contract,evidence);
assert.equal(result.status,'GREEN_PASS');
assert.equal(result.satisfied,true);

result=GreenPass.evaluateContract(contract,[
  {skill:where.id,dimension:'head-observation',result:'pass',mode:'observed-diagnostic',support:'none',context:'shopping-for-dinner'}
]);
assert.equal(result.status,'WAITING_FOR_EVIDENCE');
assert.equal(result.missing.length,3);

result=GreenPass.evaluateContract(contract,[
  {skill:where.id,dimension:'spatial-function',result:'pass',mode:'controlled-production',support:'audio',context:'shopping-for-dinner'},
  {skill:where.id,dimension:'location-answer',result:'pass',mode:'local',support:'audio',context:'shopping-for-dinner'},
  {skill:where.id,dimension:'location-answer',result:'pass',mode:'transfer',support:'none',context:'preparing-dinner'}
]);
assert.equal(result.status,'WAITING_FOR_EVIDENCE');
assert.ok(result.missing.some(x=>x.dimension==='location-answer'&&x.mode==='local'));

result=GreenPass.evaluateContract(contract,[
  {skill:where.id,dimension:'spatial-function',result:'pass',mode:'free-production',support:'none',context:'going-to-college'},
  {skill:where.id,dimension:'destination-answer',result:'pass',mode:'local',support:'none',context:'going-to-college'},
  {skill:where.id,dimension:'destination-answer',result:'pass',mode:'transfer',support:'none',context:'going-somewhere-else'}
]);
assert.equal(result.status,'WAITING_FOR_EVIDENCE');
assert.ok(result.missing.some(x=>x.dimension==='location-answer'));

result=GreenPass.evaluateContract(contract,[
  {skill:where.id,dimension:'spatial-function',result:'pass',mode:'free-production',support:'none',context:'shopping-for-dinner'},
  {skill:where.id,dimension:'location-answer',result:'pass',mode:'transfer',support:'none',context:'preparing-dinner'}
]);
assert.equal(result.status,'WAITING_FOR_EVIDENCE');
assert.ok(result.missing.some(x=>x.mode==='local'));

console.log('PASS — isolated WHERE location contract separates local/transfer and excludes destination/diagnostic evidence.');
