#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {inspectSimulation,STATUS}=require('./jaguar-h14-39-shadow-occurrence-idempotence.js');
const phase=require('./jaguar-h14-38-independent-production-transfer.js').build();
assert.equal(phase.packets.length,6);
const packet=(origin,language)=>phase.packets.find(p=>p.originExperienceId===origin&&p.language===language);
const make=(p,dimension,occurrenceId,extra={})=>{
 const task=p.tasks.find(t=>t.dimension===dimension);
 return {profileSlot:'SIM_A',packetId:p.id,event:{
  originExperienceId:p.originExperienceId,experienceId:task.experienceId,
  language:p.language,questionWord:'why',dimension,
  intent:dimension==='reason-answer(transfer)'?'transfer':'start',
  occurrenceId,actionType:task.learnerFacing.expectedActionType,
  observed:true,actor:'learner',modelExposedBeforeAction:false,
  sourceKind:'SIMULATED_DIRECT_AUTHOR_ACTION',...extra}};
};
const s1=packet('shopping-for-dinner','pt'),s2=packet('preparing-dinner','pt'),
 en=packet('shopping-for-dinner','en');
assert.ok(s1&&s2&&en);
const local='reason-answer(local)',transfer='reason-answer(transfer)',func='question-function';
const first=make(s1,local,'SIM_OCC_AAAA');
const events=[first,{...first,event:{...first.event}},
 make(s1,transfer,'SIM_OCC_AAAA'),
 make(s2,local,'SIM_OCC_AAAA'),
 make(en,local,'SIM_OCC_AAAA'),
 {...make(s1,func,'SIM_OCC_AAAA'),profileSlot:'SIM_B'},
 make(s2,local,'SIM_OCC_BBBB'),
 make(s1,transfer,'SIM_OCC_CCCC'),
 make(s1,local,'SIM_OCC_DDDD'),
 make(s1,local,'SIM_OCC_EEEE',{sourceKind:'PATITA_OBSERVATION'}),
 make(s1,local,'SIM_OCC_FFFF',{actionType:'SCENE_VISIT'}),
 make(s1,local,'SIM_OCC_GGGG',{actionType:'SPEECH_PLAYBACK'}),
 make(s1,local,'SIM_OCC_HHHH',{modelExposedBeforeAction:true}),
 make(s1,local,'SIM_OCC_IIII',{intent:'transfer'}),
 make(s1,local,'SIM_OCC_JJJJ',{language:'es'}),
 make(s1,local,'SIM_OCC_KKKK',{observed:false}),
 {...make(s1,local,'SIM_OCC_LLLL'),profileSlot:'REAL_PERSON_NAME'},
 {...make(s1,local,'SIM_OCC_MMMM'),event:{...make(s1,local,'SIM_OCC_MMMM').event,answerText:'some personal text'}},
 make(s1,func,'SIM_OCC_NNNN')
];
const out=inspectSimulation({events});
assert.equal(out.status,'SHADOW_LEDGER_STUDY_ONLY');
assert.equal(out.results.length,events.length);
assert.deepEqual(out.results.map(x=>x.status),[
 STATUS.CANDIDATE,STATUS.REPLAY,
 STATUS.COLLISION,STATUS.COLLISION,STATUS.COLLISION,STATUS.COLLISION,
 STATUS.CANDIDATE,STATUS.CANDIDATE,STATUS.CANDIDATE,
 STATUS.BLOCKED,STATUS.BLOCKED,STATUS.BLOCKED,STATUS.BLOCKED,
 STATUS.BLOCKED,STATUS.BLOCKED,STATUS.BLOCKED,STATUS.BLOCKED,
 STATUS.BLOCKED,STATUS.CANDIDATE]);
assert.deepEqual(out.counts,{candidateEntries:5,identicalReplays:1,conflictingReuse:4,
 blocked:9,distinctSimulatedOccurrences:5,scopeDimensionsWithCandidates:4,
 realLearnerAttempts:0,canonicalEvidence:0,canonicalProgress:0});
assert.equal(out.guarantees.durableOrDistributedIdempotence,false);
assert.equal(out.guarantees.crossRuntimeConcurrencyNotTested,true);
assert.equal(out.guarantees.patitaObservationNotAnAttempt,true);
assert.equal(out.evidence,false);
for(const row of out.results){assert.equal(row.canMintEvidence,false);assert.equal(row.evidence,false);}
const dupWithin=inspectSimulation({events:[make(s1,func,'SIM_OCC_1234'),make(s1,local,'SIM_OCC_1234')]});
assert.equal(dupWithin.results[1].status,STATUS.COLLISION);
const independent=inspectSimulation({events:[make(s1,local,'SIM_OCC_1234'),make(s2,local,'SIM_OCC_5678')]});
assert.equal(independent.counts.candidateEntries,2);
assert.equal(inspectSimulation({events:[]}).counts.distinctSimulatedOccurrences,0);
assert.equal(inspectSimulation({events:{}}).status,'STOP_INVALID_EVENT_COLLECTION');
const source=fs.readFileSync('scripts/jaguar-h14-39-shadow-occurrence-idempotence.js','utf8');
for(const bad of ['localStorage','sessionStorage','createEvidence(','recordOutcome(','submitObservedAttempt','dispatchEvent(','fetch('])
 assert.ok(!source.includes(bad),'unexpected side effect '+bad);
function hash(path){const b=fs.readFileSync(path);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');}
assert.equal(hash('scripts/jaguar-h14-38-independent-production-transfer.js'),'48e70c983cb864c39d5a6b7e79f7069333c35377');
assert.equal(hash('js/adaptive-assessment-scope.js'),'ac0ec23f9a445377fba05092c684c2379afeff52');
assert.equal(hash('data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json'),'143e8692ac7dd5bdbd2de3d4624b0f264db7370d');
console.log('PASS H14.39: global-in-simulation occurrence replay/collision, 2 independent origins, 3 languages, isolated slots, zero Evidence');
