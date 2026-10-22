// JAGUAR ELO 7D.3.3 · ES pronoun comparison is a complementary free surface.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const api=require('../js/verb-explorer-pronoun-comparison.js');
const explorer=fs.readFileSync('js/verb-explorer.js','utf8');
const css=fs.readFileSync('css/verb-explorer.css','utf8');
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const question=corpus.items.find(x=>x.id==='shopping-for-dinner').thinkingMind.find(x=>x.questionWord==='which');
let checks=0;
function check(value,message){assert.ok(value,message);checks+=1;}
class El{
 constructor(tag){this.tag=tag;this.children=[];this.parentNode=null;this.id='';this.className='';this.hidden=false;this.textContent='';this.attrs={};}
 appendChild(el){el.parentNode=this;this.children.push(el);return el;}
 insertBefore(el,next){const i=next?this.children.indexOf(next):this.children.length;assert.notEqual(i,-1);this.children.splice(i,0,el);el.parentNode=this;return el;}
 remove(){if(!this.parentNode)return;const children=this.parentNode.children;children.splice(children.indexOf(this),1);this.parentNode=null;}
 get nextSibling(){return this.parentNode?.children[this.parentNode.children.indexOf(this)+1]||null;}
 setAttribute(key,value){this.attrs[key]=value;}
}
const host=new El('div');for(const id of ['livingLines','choiceResolverPanel','contrastProbePanel']){const el=host.appendChild(new El('section'));el.id=id;}
const document={getElementById:id=>host.children.find(x=>x.id===id),createElement:tag=>new El(tag)};
let played=[];
const input={document,question,language:'es',experienceId:'shopping-for-dinner',learnerId:'TEST-NICK',speak:(s,l)=>played.push({s,l})};
check(api.mount(input)===true,'ES Shopping mounts the authored comparison');
const anchor=document.getElementById('choiceResolverPanel'),panel=document.getElementById('pronounComparisonPanel');
check(host.children.indexOf(panel)===host.children.indexOf(anchor)+1,'after canonical choices and feedback');
check(panel.nextSibling===document.getElementById('contrastProbePanel'),'other panels not reordered');
check(panel.children[0].textContent.includes('EXPLORACIÓN GRAMATICAL COMPLEMENTARIA'),'separate complementary label');
check(panel.children[0].textContent.includes('PRÁCTICA LIBRE'),'free practice label');
check(panel.attrs['aria-label']==='Exploración gramatical complementaria','accessible section');
check(panel.children.filter(c=>c.className==='pronoun-comparison-case').length===2,'two authored ES situations preserved');
panel.children.find(c=>c.className==='pronoun-comparison-case').children.find(c=>c.className==='pronoun-comparison-question-card').onclick();
check(played.length===1&&played[0].s===question.pronounComparison.cases[0].audioSetup&&played[0].l==='es','Spanish speech unchanged');
panel.children.find(c=>c.className==='pronoun-comparison-case').children.find(c=>c.className==='pronoun-comparison-response-list').children.find(c=>c.className==='pronoun-comparison-response-row').children.find(c=>c.className==='pronoun-comparison-option').onclick();
check(api.getTrace().at(-1).result==='pass','correct canonical candidate ID unchanged');
check(api.getTrace().at(-1).evidenceProduced===false,'observation is not Evidence');
check(api.getTrace().at(-1).greenPass===false,'observation is not Green Pass');
check(api.mount(input)===true,'rerender mounts');
check(host.children.filter(c=>c.id==='pronounComparisonPanel').length===1,'old panel is removed');
anchor.hidden=true;
check(api.mount(input)===false,'not shown without contextual choices');
check(!document.getElementById('pronounComparisonPanel'),'stale section cleared');
anchor.hidden=false;
check(api.mount({...input,language:'en'})===false,'does not invent an English extension');
check(api.mount({...input,language:'pt'})===true,'Portuguese QUAL/QUAIS complementary module now exists');
check(explorer.includes('renderLivingLines(x);renderChoiceResolver(x);window.SIYAYOPronounComparison?.mount('),'resolver renders before observational panel');
check(css.includes('#pronounComparisonPanel>.pronoun-comparison-extension-label'),'responsive section marker present');
console.log('PASS: complementary pronoun placement; '+checks+' assertions; no new Evidence or Green.');
