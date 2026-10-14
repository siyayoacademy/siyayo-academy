#!/usr/bin/env node
'use strict';
// JAGUAR ELO 7D.3.6 · Three separate reading phases for corpus-owned Head Probes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const seeds=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const Definition=require('../js/adaptive-dependency-head-probe-definition.js');
const Presenter=require('../js/adaptive-dependency-head-probe-presenter.js');
const source=fs.readFileSync('js/adaptive-dependency-head-probe-browser-wire.js','utf8');
const css=fs.readFileSync('css/verb-explorer.css','utf8');
const sandbox=vm.createContext({});
sandbox.globalThis=sandbox;
vm.runInContext(fs.readFileSync('js/study-target-presentation.js','utf8'),sandbox);
vm.runInContext(source,sandbox);
const Wire=sandbox.SIYAYOAdaptiveDependencyHeadProbeBrowserWire;
let cases=0;
for(const experience of seeds){
 for(const q of experience.thinkingMind||[]){
  const meta=q.dependencyHeadProbe;
  if(!meta)continue;
  for(const language of ['en','es','pt']){
   const structureId=meta.structureIds[language];
   const structure=JSON.parse(fs.readFileSync('data/learning/dependencies/'+structureId+'.json','utf8'));
   const targetTokenId=meta.targetTokenIdsByLanguage?.[language]||meta.targetTokenId;
   const def=Definition.create(structure,{
    experienceId:experience.id,
    targetTokenId,
    prompt:meta.prompt[language],
    alternativeTokenIds:meta.alternativeTokenIdsByLanguage?.[language]||meta.alternativeTokenIds
   });
   assert.ok(def,experience.id+'/'+q.questionWord+'/'+language+' valid definition');
   const presentation=Presenter.present(def);
   assert.ok(presentation,'canonical presentation');
   const view={...presentation,studyTarget:q.questionWordLabel[language]};
   const box={innerHTML:''};
   assert.equal(Wire.render(view,{container:box}),true);
   const html=box.innerHTML;
   const labels=['dependency-probe-reference','dependency-probe-target','dependency-probe-short-question'];
   for(const label of labels)assert.ok(html.includes('class="'+label+'"'),label+' missing: '+experience.id+'/'+language+'/'+q.questionWord);
   const reference=html.indexOf('class="dependency-probe-reference"');
   const target=html.indexOf('class="dependency-probe-target"');
   const question=html.indexOf('class="dependency-probe-short-question"');
   assert.ok(reference<target&&target<question,'sentence → target → brief question in order');
   assert.ok(html.includes('<span class="dependency-probe-target">'+presentation.targetToken.form+'</span>'),
    'word shown exactly as found in the authored language-specific dependency structure');
   assert.ok(!html.includes('class="dependency-probe-short-question">In '));
   assert.ok(!html.includes('class="dependency-probe-short-question">En '));
   assert.ok(!html.includes('class="dependency-probe-short-question">Em '));
   for(const candidate of presentation.alternatives)
     assert.ok(html.includes('data-dependency-head-probe-select="'+candidate.id+'"'),'original candidate ID is present');
   assert.ok(!/expectedHeadTokenId|data-correct=|greenPass|createEvidence/.test(html),'no correct ID or progress contract exposed');
   cases++;
  }
 }
}
assert.equal(cases,27,'all currently authored Experience × QW × EN/ES/PT diagnostics must use the three-step method');

// The historical book example does not have the same authored question grammar.
// Fail closed to the original prompt instead of guessing a sentence or target.
const old=JSON.parse(fs.readFileSync('data/learning/dependencies/all-these-three-books.json','utf8'));
const legacy=Definition.create(old,{
 experienceId:'shopping-for-dinner',
 targetTokenId:'three',
 prompt:'Which word is the head of “three”?',
 alternativeTokenIds:['all','these','books']
});
const legacyBox={innerHTML:''};
assert.equal(Wire.render(Presenter.present(legacy),{container:legacyBox}),true);
assert.ok(legacyBox.innerHTML.includes('Which word is the head of “three”?'));
assert.ok(!legacyBox.innerHTML.includes('dependency-probe-short-question'));

// Audio must read the untouched authored prompt without producing an answer.
const x=seeds[0],q=x.thinkingMind.find(q=>q.questionWord==='which');
const s=JSON.parse(fs.readFileSync('data/learning/dependencies/'+q.dependencyHeadProbe.structureIds.es+'.json','utf8'));
const definition=Definition.create(s,{experienceId:x.id,targetTokenId:q.dependencyHeadProbe.targetTokenIdsByLanguage.es,
 prompt:q.dependencyHeadProbe.prompt.es,alternativeTokenIds:q.dependencyHeadProbe.alternativeTokenIdsByLanguage.es});
const view={...Presenter.present(definition),studyTarget:'CUÁL'};
let listener,speech=null,answers=0;
const container={innerHTML:'',addEventListener(event,fn){if(event==='click')listener=fn;}};
assert.equal(Wire.install(view,{container,
 learnerEvents:{fromDependencyHeadProbeSelect(){answers++;return null;}},
 onEvent(){answers++;},
 speak(text,lang){speech={text,lang};}
}),true);
listener({target:{closest(sel){return sel==='[data-dependency-probe-audio]'?
 {dataset:{dependencyProbeAudio:''}}:null;}}});
assert.deepEqual(speech,{text:q.dependencyHeadProbe.prompt.es,lang:'es'});
assert.equal(answers,0,'speaker may never submit learner answer');
assert.ok(css.includes('#dependencyHeadProbePanel .dependency-probe-target'),'three-step visual styling');
assert.ok(css.includes('@container siyayo-explorer (max-width:520px)'),'portrait support preserved');
console.log('PASS: 27 contextual tri-language head probes + historical fallback + speech/contract isolation.');
