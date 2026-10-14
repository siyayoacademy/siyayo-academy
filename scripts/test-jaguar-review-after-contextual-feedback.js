// JAGUAR ELO 7D.3.7 — post-feedback review, trilingual and observational.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const runtime=fs.readFileSync('js/verb-explorer.js','utf8'),html=fs.readFileSync('verb-explorer.html','utf8'),css=fs.readFileSync('css/verb-explorer.css','utf8');
const Resolver=require('../js/contextual-choice-resolver.js'),q=require('../data/learning/experience-seeds.json').items.find(e=>e.id==='shopping-for-dinner').thinkingMind.find(q=>q.questionWord==='which');
const nodes=Object.fromEntries(['choiceResolverPanel','choiceOptions','choiceFeedback','choiceReview'].map(k=>[k,{hidden:false,innerHTML:''}]));
const env={window:{SIYAYOChoiceResolver:Resolver},document:{getElementById:k=>nodes[k]},experienceWordType:'verb',experiencePerspective:null,experienceQuestion:0,experienceLanguage:'en',experienceChoiceCandidate:null,escapeHtml:v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),x:{thinkingMind:[q]},q};
const ctx=vm.createContext(env);
const a=runtime.indexOf('function contextualRoleLabels('),b=runtime.indexOf('function setExperienceGrammarLock(',a),c=runtime.indexOf('function choicePrompt('),d=runtime.indexOf('function renderLivingLines(',c);
assert.ok(a>=0&&b>a&&c>b&&d>c);
vm.runInContext(runtime.slice(a,b)+'\n'+runtime.slice(c,d),ctx);
let count=0;const check=(v,label)=>{assert.ok(v,label);count++};
check(html.includes('id="choiceReview"'),'review mount in markup');
check(html.indexOf('id="choiceFeedback"')<html.indexOf('id="choiceReview"'),'review after feedback');
check(css.includes('#choiceReview[hidden]{display:none}'),'hidden respected');
check(runtime.includes('document.getElementById("choiceReview").onclick'),'audio bound');
check(runtime.includes('renderLivingLines(x);renderChoiceResolver(x);window.SIYAYOPronounComparison?.mount('),'pronoun after choices');
for(const [lang,role,prompt] of [['en','REVIEW','Why does this choice fit the dinner?'],['es','REVISIÓN','¿Por qué esta elección combina con la cena?'],['pt','REVISÃO','Por que esta escolha combina com o jantar?']]){
 env.experienceLanguage=lang;env.experienceChoiceCandidate=null;
 vm.runInContext('renderChoiceResolver(x)',ctx);
 check(nodes.choiceReview.hidden&&!nodes.choiceReview.innerHTML,'hidden pre-choice '+lang);
 check(nodes.choiceOptions.innerHTML.includes('data-choice-audio="fresh-mild-cheese"'),'audio present '+lang);
 check(nodes.choiceFeedback.innerHTML.includes('choice-feedback-card'),'feedback pre-choice '+lang);
 const lines=vm.runInContext('contextualChoiceLines(q,experienceLanguage,false)',ctx);
 check(lines.length===2&&lines[0].text===q.question[lang],'2 lines before choice '+lang);
 for(const id of ['fresh-mild-cheese','aged-strong-cheese']){
  env.experienceChoiceCandidate=id;
  vm.runInContext('renderChoiceResolver(x)',ctx);
  check(!nodes.choiceReview.hidden,'review visible '+lang+' '+id);
  check(nodes.choiceReview.innerHTML.includes(role)&&nodes.choiceReview.innerHTML.includes(prompt),'review localized '+lang);
  check(nodes.choiceOptions.innerHTML.includes('data-choice-select="'+id+'"'),'candidate id unchanged '+lang);
 }
 env.experienceWordType='noun';
 vm.runInContext('renderChoiceResolver(x)',ctx);
 check(nodes.choiceReview.hidden&&!nodes.choiceReview.innerHTML,'hidden on leaving mode '+lang);
 env.experienceWordType='verb';
}
check(runtime.includes('if(result.canonicalForm.valid)renderChoiceReview(review,experienceLanguage)'),'valid gate');
check(runtime.includes('speakText(contextualChoiceReviewLine(experienceLanguage).text,experienceLanguage)'),'speech same text');
console.log('PASS: '+count+' contextual REVIEW assertions.');
