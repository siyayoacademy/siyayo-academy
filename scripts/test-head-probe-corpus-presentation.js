const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const seeds=require('../data/learning/experience-seeds.json').items;
const Definition=require('../js/adaptive-dependency-head-probe-definition');
for(const x of seeds.slice(0,2))for(const word of ['what','which'])for(const language of ['en','es','pt']){
 const q=x.thinkingMind.find(q=>q.questionWord===word),m=q.dependencyHeadProbe||x.dependencyHeadProbe;
 const structure=JSON.parse(fs.readFileSync('data/learning/dependencies/'+m.structureIds[language]+'.json'));
 const d=Definition.create(structure,{experienceId:x.id,targetTokenId:m.targetTokenIdsByLanguage?.[language]||m.targetTokenId,prompt:m.prompt[language],alternativeTokenIds:m.alternativeTokenIdsByLanguage?.[language]||m.alternativeTokenIds});
 assert.ok(d,`${x.id}/${word}/${language}`);
 assert.equal(m.structureIds[language],q.dependencyFocus.structureIds[language]);
 assert.equal(d.expectedHeadTokenId,word==='what'?(x.id==='shopping-for-dinner'?'cook':'prepare'):(x.id==='preparing-dinner'?'carrots':language==='es'?'cheese':'books'));
}
const sandbox={};sandbox.globalThis=sandbox;vm.createContext(sandbox);
for(const path of ['js/study-target-presentation.js','js/adaptive-dependency-head-probe-browser-wire.js'])vm.runInContext(fs.readFileSync(path,'utf8'),sandbox);
let clicks=0,spoken=null,listener;
const container={innerHTML:'',addEventListener(type,fn){listener=fn;}};
const view={experienceId:'shopping-for-dinner',structureId:'shopping-what-en',language:'en',dimension:'head-identification',targetToken:{id:'what',form:'What',wordClass:'PRON'},prompt:'In “What are we going to cook?”, which verb does “What” connect to?',studyTarget:'WHAT',alternatives:[{id:'are',form:'are',wordClass:'AUX'},{id:'cook',form:'cook',wordClass:'VERB'}]};
assert.equal(sandbox.SIYAYOAdaptiveDependencyHeadProbeBrowserWire.install(view,{container,learnerEvents:{fromDependencyHeadProbeSelect(){clicks++;return {}; }},onEvent(){clicks++;},speak(text,lang){spoken={text,lang};}}),true);
assert.ok(container.innerHTML.includes('<br>'));assert.ok(container.innerHTML.includes('study-target-word'));assert.ok(!container.innerHTML.includes('study-target-word">which'));
listener({target:{closest(selector){return selector==='[data-dependency-probe-audio]'?{dataset:{dependencyProbeAudio:''}}:null;}}});
assert.deepEqual(spoken,{text:view.prompt,lang:'en'});assert.equal(clicks,0);
console.log('PASS: twelve grounded same-structure diagnostics; preserved WHICH EN/PT, aligned CUÁL ES; target, line break and speech without observed answer.');
