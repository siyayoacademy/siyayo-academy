#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const spec=read('data/learning/references/jaguar-h14-27-why-question-function-semantic-rubric-v0.1.json');
const registry=read('data/learning/references/jaguar-h14-27-module-registry-crosscheck-v0.1.json');
const skill=read('data/learning/skills/why.json');
assert.ok(spec&&typeof spec==='object');const flat=JSON.stringify(spec);
assert.match(flat,/WHY|why/);assert.match(flat,/EN|en/);assert.match(flat,/ES|es/);assert.match(flat,/PT|pt/);
assert.ok(flat.length>2500,'insufficient trilingual specifications');
assert.equal(skill.id,'why.use.contextual-reason');
assert.deepEqual(skill.passContract.requires.map(x=>x.dimension+(x.mode?'('+x.mode+')':'')),['question-function','reason-answer(local)','reason-answer(transfer)']);
assert.equal(registry.sourceRegistryBlob,'0ee10834cc168c462f96bc569953591bb6f8c51c');
assert.equal(registry.sourceCommit,'719f259d78ca27d444bdfacecd3ccd2091818980');
assert.equal(registry.authorization,false);
for(const code of ['HEAD_04','EVAL_08','LIVE_07','SPEECH_A','PATITA_12','FUNC_13'])assert.ok(registry.governance[code],code);
const hash=p=>{const b=fs.readFileSync(p);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex')};
for(const [p,sha] of Object.entries({
 'data/learning/experience-seeds.json':'9a7165df76aed1b3b726c8198311027e024e91c4',
 'data/learning/skills/why.json':'cf16e1e879bd236e5199240e350c0c623a2bc3ed',
 'data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json':'143e8692ac7dd5bdbd2de3d4624b0f264db7370d',
 'scripts/jaguar-h14-26-why-independent-task-blueprints.js':'8004dd85f124a0a68e12c60d8dfb2feeb938f0cf'
}))assert.equal(hash(p),sha,'protected source drift: '+p);
assert.doesNotMatch(flat,/"newEvidence"\s*:\s*true/);
assert.doesNotMatch(flat,/"assessmentAuthority"\s*:\s*true/);
console.log('PASS H14.27 independent WHY semantic rubric; cross-branch registry ref validated; H14.26 preserved');
