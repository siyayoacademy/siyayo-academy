// V30.3.89K — presentation semantics, offline and read-only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {runInNewContext} from 'node:vm';
import {read89D,inspect89D} from '../scripts/check-staging-architecture-89d.mjs';
import {observationPreview85D} from './storage-contract/restore-observer.mjs';
const root=process.env.SIYAYO_89K_PINNED_ROOT;
if(!root)throw Error('STOP: explicitly pinned official Explorer checkout is required');
const dir=resolve(process.cwd(),root);
const read=f=>readFileSync(join(dir,f),'utf8');
const css=read('css/verb-explorer.css');
const trail=read('js/verb-explorer-learner-trail-surface.js');
const wordPath=read('js/verb-explorer-polyglot-word-path-view.js');
const langCodes=['en','es','pt'];
const translations=[
 {skill:'which.use.determiner',en:'WHICH',es:'CUÁL',pt:'QUAL'},
 {skill:'what.use.object-question',en:'WHAT',es:'QUÉ',pt:'O QUE'},
 {skill:'why.use.contextual-reason',en:'WHY',es:'POR QUÉ',pt:'POR QUÊ'},
 {skill:'where.use.location-question',en:'WHERE',es:'DÓNDE',pt:'ONDE'}
];
function sandbox(){
 const m=new Map(), storage={getItem:key=>m.get(key)||null,setItem:(key,v)=>m.set(key,String(v))};
 const root={Object,Array,Map,Set,Number,JSON,Date,localStorage:storage};
 root.globalThis=root;runInNewContext(wordPath,root,{filename:'pinned-word-path.js'});
 return root.SIYAYOVerbExplorerPolyglotWordPathView;
}
const scope=(skill,language,origin='shopping-for-dinner',owner='LEARNER-A')=>({
 learnerId:owner,skill,language,originExperienceId:origin,
 key:JSON.stringify([owner,skill,language,origin])
});
const retained=(s,completed=2)=>({scopeKey:s.key,language:s.language,
 originExperienceId:s.originExperienceId,progress:{completed,total:3}});
const locales={
 en:{heading:'POLYGLOT WORD PATH',qword:'QUESTION WORD',
  empty:'Not started',disclaimer:'no credit from free exploration'},
 es:{heading:'RECORRIDO POLÍGLOTA',qword:'PALABRA INTERROGATIVA',
  empty:'Sin iniciar',disclaimer:'la exploración libre no otorga puntos'},
 pt:{heading:'WORD PATH POLIGLOTA',qword:'PALAVRA INTERROGATIVA',
  empty:'Não iniciada',disclaimer:'exploração livre não gera pontos'}
};
function harness(language='en',saved=[]){
 const learner='LEARNER-A';
 return {
  language,profile:{id:learner},identity:{getId:()=>learner},
  selection:{getRetainedProgress(skill,l){return saved.filter(r=>{
   let parts=JSON.parse(r.scopeKey);return parts[1]===skill&&r.language===l;
  });}},
  trailView:{project(_profile,skill,filter){return {skill,language:filter.language};}},
  markerAuthority:{resolve(){return {state:'UNOBSERVED',marker:'EMPTY_DOT'};}},
  scopeApi:{valid(){return true},same(a,b){return a?.key===b?.key}},
  catalog:{getExperience(id){return id==='shopping-for-dinner'?{
   title:{en:'Shopping for a Nice Dinner',es:'Compras para una linda cena',
    pt:'Compras para um belo jantar'}}:null;}}
 };
}
function render(language='en',saved=[]){return sandbox().render(harness(language,saved));}
function cell(html,skill,language){
 const re=new RegExp('data-skill="'+skill.replaceAll('.','\\.')+
  '" data-language="'+language+'" data-state="([^"]+)"[^>]*>\\s*'+
  '<strong class="wp-poly-value">([^<]*)<\\/strong>([\\s\\S]*?)<\\/td>');
 const m=html.match(re);return m?{state:m[1],value:m[2],extra:m[3]}:null;
}

test('EN ES PT headings, table label and non-credit notes use their own display locale',()=>{
 for(const l of langCodes){const html=render(l),t=locales[l];
  assert.ok(html.includes(t.heading),l);
  assert.ok(html.includes(t.qword),l);
  assert.ok(html.includes(t.disclaimer),l);
  assert.ok(html.includes(t.empty),l);
 }
});
test('each Word Path display uses exactly four authored QW rows x three language cells',()=>{
 for(const l of langCodes){const html=render(l);
  assert.equal((html.match(/class="wp-poly-cell"/g)||[]).length,12);
  assert.equal((html.match(/class="wp-poly-word"/g)||[]).length,4);
  for(const q of translations){
   assert.ok(html.includes('<strong>'+q.en+'</strong><small>'+q.es+' · '+q.pt+'</small>'));
   for(const lang of langCodes)assert.deepEqual(
    {...cell(html,q.skill,lang)}, {state:'empty',value:'—',extra:cell(html,q.skill,lang).extra}
   );
  }
  assert.ok(!html.includes('WHO</strong>'));
 }
});
test('saved 2/3 EN record never becomes ES or PT progress on language selection',()=>{
 const saved=[retained(scope('what.use.object-question','en'),2)];
 for(const display of langCodes){
  const html=render(display,saved);
  assert.equal(cell(html,'what.use.object-question','en').value,'2/3');
  assert.equal(cell(html,'what.use.object-question','en').state,'saved');
  for(const other of ['es','pt']){
   assert.equal(cell(html,'what.use.object-question',other).value,'—');
   assert.equal(cell(html,'what.use.object-question',other).state,'empty');
  }
 }
});
test('saved origin is translated independently of the assessment locale',()=>{
 const saved=[retained(scope('what.use.object-question','en'))];
 for(const display of langCodes){
  const html=render(display,saved);
  const expected={en:'Shopping for a Nice Dinner',es:'Compras para una linda cena',
   pt:'Compras para um belo jantar'}[display];
  assert.ok(html.includes(expected),display);
 }
});
test('scope ownership filters a retained record belonging to another learner',()=>{
 const forged=retained(scope('what.use.object-question','en','shopping-for-dinner','OTHER'));
 for(const l of langCodes){
  const html=render(l,[forged]);
  assert.equal(cell(html,'what.use.object-question','en').value,'—');
 }
});
test('render does not produce accepted contract progress from observation-only local records',()=>{
 const observation=observationPreview85D([{ok:true,kind:'OBSERVATIONS_ONLY',
  questionWord:'WHAT',skillId:'what.use.object-question',language:'pt',
  originExperienceId:'shopping-for-dinner',events:[{questionWord:'WHAT',language:'pt',
    originExperienceId:'shopping-for-dinner',purpose:'assessment',status:'pending'}]}]);
 assert.equal(observation.cells.find(c=>c.questionWord==='WHAT'&&c.language==='pt').observationMarker,'◐');
 const html=render('pt');
 assert.equal(cell(html,'what.use.object-question','pt').value,'—');
 assert.doesNotMatch(html,/Green Pass awarded|3\/3/);
});
test('a free PATITA local observation can never mint a scored record',()=>{
 const api=sandbox();
 assert.equal(api.observeChoice({learnerId:'LEARNER-A',language:'pt',questionWord:'WHY',
   experienceId:'shopping-for-dinner',answer:'sample free response'}),true);
 const items=api.patitaRecords('LEARNER-A');
 assert.equal(items.length,1);assert.equal(items[0].evidenceProduced,false);
 const html=api.render(harness('pt'));
 assert.ok(html.includes('sem crédito avaliativo'));
 assert.equal(cell(html,'why.use.contextual-reason','pt').value,'—');
});
test('Word Path table has dedicated horizontally scrollable accessible focus region',()=>{
 assert.ok(wordPath.includes('class="wp-poly-scroller" tabindex="0" role="region"'));
 assert.ok(wordPath.includes('<th scope="col">ENGLISH'));
 assert.ok(wordPath.includes('<th scope="row" class="wp-poly-word"'));
 assert.ok(css.includes('.wp-poly-scroller{max-width:100%;overflow-x:auto'));
 assert.ok(css.includes('.wp-poly-scroller:focus-visible'));
});
test('portrait CSS narrows table and evidence cards without hiding other language columns',()=>{
 assert.ok(css.includes('@container siyayo-explorer (max-width:480px)'));
 assert.ok(css.includes('.wp-poly-table{min-width:322px}'));
 assert.ok(css.includes('.wp-evidence-grid{grid-template-columns:minmax(0,1fr)}'));
 assert.ok(css.includes('.learning-trail-word-path-trigger:focus-visible'));
 assert.ok(css.includes('@media (prefers-reduced-motion:reduce)'));
});
test('Trail correctly distinguishes display ES/PT from assessment EN in original source',()=>{
 assert.ok(trail.includes('assessmentLanguage!==language'));
 assert.ok(trail.includes("copy.display+' '+language.toUpperCase()"));
 assert.ok(trail.includes("copy.assessment+' '+assessmentLanguage.toUpperCase()"));
 for(const local of ['LEARNING TRAIL','RUTA DE APRENDIZAJE','TRILHA DE APRENDIZAGEM'])
  assert.ok(trail.includes(local));
});
test('Trail helps EN ES PT explain large circles distinct from contract small circles',()=>{
 for(const title of ['HOW TO READ THE TRAIL','CÓMO LEER LA RUTA','COMO LER A TRILHA'])
  assert.ok(trail.includes(title));
 assert.ok(trail.includes('○ no observation, ◐ observed response, ● one confirmed context, ★ two or more confirmed contexts'));
 assert.ok(trail.includes('The three contract marks are binary: ○ evidence not yet accepted; ● evidence accepted'));
});
test('observed English-only aria-label is recorded for later localization review, NOT automatically fixed',()=>{
 assert.ok(trail.includes('aria-label="Visited learning experiences"'));
});
test('CI is not authorized to activate external staging or pay',()=>{
 const gate=inspect89D(read89D());assert.equal(gate.verdict,'BLOCKED');
 assert.equal(gate.blockedExternalGates,12);
});
