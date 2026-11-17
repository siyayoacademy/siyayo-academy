'use strict';
// Deterministic authoring tool, never a runtime parser or assessment engine.
// Every lexical frame and finite form below is explicitly authored for free study.
const fs=require('node:fs');
const langs=['en','es','pt'],tenses=['present','past','future'],modes=['affirmative','negative','interrogative'];
const tri=(en,es,pt)=>({en,es,pt});
const kinds=['verb','noun','pronoun','adjective','adverb','article','preposition','conjunction','interjection','numeral'];
const labels={verb:tri('VERB','VERBO','VERBO'),noun:tri('NOUN','SUSTANTIVO','SUBSTANTIVO'),pronoun:tri('PRONOUN','PRONOMBRE','PRONOME'),adjective:tri('ADJECTIVE','ADJETIVO','ADJETIVO'),adverb:tri('ADVERB','ADVERBIO','ADVÉRBIO'),article:tri('ARTICLE','ARTÍCULO','ARTIGO'),preposition:tri('PREPOSITION','PREPOSICIÓN','PREPOSIÇÃO'),conjunction:tri('CONJUNCTION','CONJUNCIÓN','CONJUNÇÃO'),interjection:tri('INTERJECTION','INTERJECCIÓN','INTERJEIÇÃO'),numeral:tri('NUMERAL','NUMERAL','NUMERAL')};
const frames=[
 {id:'shopping-for-dinner',verb:tri(['buy','bought','buying'],['compramos','comprábamos','compraremos','comprando'],['compramos','comprávamos','compraremos','comprando']),
  body:tri('two fresh carrots and a lemon at the supermarket','dos zanahorias frescas y un limón en el supermercado','duas cenouras frescas e um limão no supermercado'),
  targets:tri({noun:['carrots','lemon'],adjective:['fresh'],adverb:['usually'],article:['a','the'],preposition:['at'],conjunction:['and'],numeral:['two']},{noun:['zanahorias','limón'],adjective:['frescas'],adverb:['normalmente'],article:['un','el'],preposition:['en'],conjunction:['y'],numeral:['dos']},{noun:['cenouras','limão'],adjective:['frescas'],adverb:['geralmente'],article:['um'],preposition:['no'],conjunction:['e'],numeral:['duas']}),
  location:tri('supermarket','supermercado','supermercado'),quality:tri(['The cheese','mild'],['El queso','suave'],['O queijo','suave']),state:tri(['The salmon','fresh'],['El salmón','fresco'],['O salmão','fresco']),existence:tri(['a carrot','two carrots','at the supermarket'],['una zanahoria','dos zanahorias','en el supermercado'],['uma cenoura','duas cenouras','no supermercado'])},
 {id:'preparing-dinner',verb:tri(['prepare','prepared','preparing'],['preparamos','preparábamos','prepararemos','preparando'],['preparamos','preparávamos','prepararemos','preparando']),
  body:tri('two fresh carrots and a potato in the kitchen','dos zanahorias frescas y una patata en la cocina','duas cenouras frescas e uma batata na cozinha'),
  targets:tri({noun:['carrots','potato'],adjective:['fresh'],adverb:['usually'],article:['a','the'],preposition:['in'],conjunction:['and'],numeral:['two']},{noun:['zanahorias','patata'],adjective:['frescas'],adverb:['normalmente'],article:['una','la'],preposition:['en'],conjunction:['y'],numeral:['dos']},{noun:['cenouras','batata'],adjective:['frescas'],adverb:['geralmente'],article:['uma'],preposition:['na'],conjunction:['e'],numeral:['duas']}),
  location:tri('kitchen','cocina','cozinha'),quality:tri(['The carrot','orange'],['La zanahoria','anaranjada'],['A cenoura','alaranjada']),state:tri(['The soup','hot'],['La sopa','caliente'],['A sopa','quente']),existence:tri(['a carrot','two carrots','on the kitchen table'],['una zanahoria','dos zanahorias','sobre la mesa de la cocina'],['uma cenoura','duas cenouras','sobre a mesa da cozinha'])},
 {id:'having-dinner',verb:tri(['share','shared','sharing'],['compartimos','compartíamos','compartiremos','compartiendo'],['compartilhamos','compartilhávamos','compartilharemos','compartilhando']),
  body:tri('two fresh carrots and a potato at the table','dos zanahorias frescas y una patata en la mesa','duas cenouras frescas e uma batata à mesa'),
  targets:tri({noun:['carrots','potato'],adjective:['fresh'],adverb:['usually'],article:['a','the'],preposition:['at'],conjunction:['and'],numeral:['two']},{noun:['zanahorias','patata'],adjective:['frescas'],adverb:['normalmente'],article:['una','la'],preposition:['en'],conjunction:['y'],numeral:['dos']},{noun:['cenouras','batata'],adjective:['frescas'],adverb:['geralmente'],article:['uma'],preposition:['à'],conjunction:['e'],numeral:['duas']}),
  location:tri('table','mesa','mesa'),quality:tri(['The cheese','mild'],['El queso','suave'],['O queijo','suave']),state:tri(['The salmon','delicious'],['El salmón','delicioso'],['O salmão','delicioso']),existence:tri(['a plate','two plates','on the dining table'],['un plato','dos platos','sobre la mesa del comedor'],['um prato','dois pratos','sobre a mesa de jantar'])},
 {id:'after-dinner-conversation',verb:tri(['discuss','discussed','discussing'],['comentamos','comentábamos','comentaremos','comentando'],['comentamos','comentávamos','comentaremos','comentando']),
  body:tri('two interesting stories and a question after dinner','dos historias interesantes y una pregunta después de la cena','duas histórias interessantes e uma pergunta depois do jantar'),
  targets:tri({noun:['stories','question'],adjective:['interesting'],adverb:['usually'],article:['a'],preposition:['after'],conjunction:['and'],numeral:['two']},{noun:['historias','pregunta'],adjective:['interesantes'],adverb:['normalmente'],article:['una','la'],preposition:['después de'],conjunction:['y'],numeral:['dos']},{noun:['histórias','pergunta'],adjective:['interessantes'],adverb:['geralmente'],article:['uma'],preposition:['depois do'],conjunction:['e'],numeral:['duas']}),
  location:tri('dinner','cena','jantar'),quality:tri(['The conversation','important'],['La conversación','importante'],['A conversa','importante']),state:tri(['The conversation','pleasant'],['La conversación','agradable'],['A conversa','agradável']),existence:tri(['a question','two questions','after dinner'],['una pregunta','dos preguntas','después de la cena'],['uma pergunta','duas perguntas','depois do jantar'])}
];
function sentence(parts,l,m){const s=parts.filter(Boolean).join(' ');return (m==='interrogative'&&l==='es'?'¿':'')+s[0].toUpperCase()+s.slice(1)+(m==='interrogative'?'?':'.');}
function action(f,l,t,m,progressive=false){
 const n=tenses.indexOf(t),v=f.verb[l],sub=tri('we','nosotros','nós')[l],adv=f.targets[l].adverb[0];let parts,verb;
 if(l==='en'){
  if(progressive){const aux=['are','were','will'][n];verb=v[2];parts=m==='interrogative'?[aux,sub,n===2?'be':'',verb,f.body[l]]:[sub,aux,m==='negative'?'not':'',n===2?'be':'',verb,f.body[l]];}
  else{verb=n===1&&m==='affirmative'?v[1]:v[0];const aux=['do','did','will'][n];parts=m==='interrogative'?[aux,sub,adv,verb,f.body[l]]:m==='negative'?[sub,aux,'not',adv,verb,f.body[l]]:[sub,n===2?'will':'',adv,verb,f.body[l]];}
 }else{
  verb=progressive?v[3]:v[n];const aux=progressive?(l==='es'?['estamos','estábamos','estaremos']:['estamos','estávamos','estaremos'])[n]:'';
  parts=[sub,m==='negative'?(l==='es'?'no':'não'):'',aux,progressive?'':adv,verb,f.body[l]];
 }
 const text=sentence(parts,l,m);return{text,targets:{...f.targets[l],verb:[verb],pronoun:[sub],adverb:progressive?[]:[adv]},root:verb};
}
function copula(f,l,t,m,kind){const [sub,adj]=f[kind][l],n=tenses.indexOf(t);let parts,verb;
 if(l==='en'){verb=['is','was','will be'][n];parts=m==='interrogative'?(n===2?['will',sub.toLowerCase(),'be',adj]:[verb,sub.toLowerCase(),adj]):[sub,n===2?'will':verb,m==='negative'?'not':'',n===2?'be':'',adj];}
 else{verb=(kind==='quality'?(l==='es'?['es','era','será']:['é','era','será']):(l==='es'?['está','estaba','estará']:['está','estava','estará']))[n];parts=[sub,m==='negative'?(l==='es'?'no':'não'):'',verb,adj];}
 return{text:sentence(parts,l,m),targets:{verb:verb.split(' '),adjective:[adj]},root:adj};}
function existence(f,l,t,m,number){const n=tenses.indexOf(t),[sing,plural,place]=f.existence[l],pivot=number==='plural'?plural:sing;let parts,verb;
 if(l==='en'){verb=(number==='plural'?['are','were','will be']:['is','was','will be'])[n];parts=m==='interrogative'?(n===2?['will','there','be',pivot,place]:[verb,'there',pivot,place]):['there',n===2?'will':verb,m==='negative'?'not':'',n===2?'be':'',pivot,place];}
 else{verb=(l==='es'?['hay','había','habrá']:['há','havia','haverá'])[n];parts=[m==='negative'?(l==='es'?'no':'não'):'',verb,pivot,place];}
 return{text:sentence(parts,l,m),targets:{verb:verb.split(' '),numeral:number==='plural'?[pivot.split(' ')[0]]:[]},root:l==='en'?(t==='future'?'be':verb):verb};}
// Explicit relation authoring for the controlled ACTION/MOVEMENT frame only.
// No relation is guessed for quality/state/existence or arbitrary corpus text.
function graph(f,l,t,m,item,kind){
 const words=item.text.replace(/[¿?.]/g,'').split(/\s+/),tokens=words.map((form,i)=>({id:'w'+i,index:i+1,form,wordClass:'X'}));
 const find=s=>tokens.find(t=>t.form.toLocaleLowerCase()===s.toLocaleLowerCase());
 const root=find(item.root),noun1=find(f.targets[l].noun[0]),noun2=find(f.targets[l].noun[1]),location=find(f.location[l]),relations=[];
 const add=(s,head,rel,cls)=>{const token=find(s);if(!token||!head||token.id===head.id)return;token.wordClass=cls;relations.push({head:head.id,dependent:token.id,relation:rel});};
 root.wordClass='VERB';
 add(item.targets.pronoun[0],root,'nsubj','PRON');add(noun1.form,root,'obj','NOUN');add(noun2.form,noun1,'conj','NOUN');add(location.form,root,'obl','NOUN');
 for(const a of item.targets.adverb)add(a,root,'advmod','ADV');
 for(const a of f.targets[l].adjective)add(a,noun1,'amod','ADJ');
 for(const a of f.targets[l].numeral)add(a,noun1,'nummod','NUM');
 for(const a of f.targets[l].conjunction)add(a,noun2,'cc','CCONJ');
 for(const a of f.targets[l].article)add(a,['a','un','una','um','uma'].includes(a)?noun2:location,'det','DET');
 // Closed authored expressions only: preserve orthographic tokens and expose the external case relation.
 // Internal de / do structure remains outside this partial graph (do is not split into de + o).
 for(const a of f.targets[l].preposition){
  if(!a.includes(' '))add(a,location,'case',l==='pt'&&['no','na','à'].includes(a)?'ADP+DET':'ADP');
  else if(f.id==='after-dinner-conversation'&&((l==='es'&&a==='después de')||(l==='pt'&&a==='depois do'))){
   const anchor=find(a.split(' ')[0]),tail=find(a.split(' ')[1]);add(anchor.form,location,'case','ADV');tail.wordClass=l==='pt'?'ADP+DET':'ADP';
   item.targetAnchors={[a]:{targetTokenId:anchor.id,headTokenId:location.id,phrase:a,internalAnalysis:false}};
  }
 }
 for(const token of tokens)if(token.wordClass==='X'&&['are','were','will','be','do','did','estamos','estábamos','estaremos','estávamos'].includes(token.form.toLowerCase()))add(token.form,root,'aux','AUX');
 for(const token of tokens)if(token.form.toLowerCase()===tri('not','no','não')[l])add(token.form,root,'advmod','PART');
 return {version:'0.1.0',id:`gear-${f.id}-${kind}-${l}-${t}-${m}`,language:l,sentence:item.text,tokens,relations,pedagogy:{mode:'read-only-focus',doesNotClaim:['learner-evidence','green-pass','mastery','complete-parse']},source:{name:'SIYAYO authored illustrative frame',experienceId:f.id,field:'gear-study-corpus',notes:'Partial authored relations; X tokens and multiword contractions are not fully analysed.'},defaultFocus:root.id};
}
const corpus={version:'1.0.0',status:'illustrative-study-only',assessmentAuthority:false,assessmentEvidence:false,greenPass:false,sourceRefs:['chapters/01-nouns/chapter.json','chapters/02-pronouns/chapter.json','chapters/03-verbs/chapter.json','chapters/04-adjectives/chapter.json','chapters/05-adverbs/chapter.json','chapters/06-articles/chapter.json','chapters/07-prepositions/chapter.json','chapters/08-conjunctions/chapter.json','chapters/09-interjections/chapter.json','chapters/10-numerals/chapter.json','data/learning/references/master-vip-verb-functions-v0.1.json','data/learning/references/master-vip-existence-v0.1.json'],wordTypes:kinds.map(id=>({id,label:labels[id]})),functions:[{id:'quality',label:tri('QUALITY','CUALIDAD','QUALIDADE'),meaning:tri('Characteristic · TO BE','Característica · SER','Característica · SER')},{id:'state',label:tri('STATE','ESTADO','ESTADO'),meaning:tri('Condition · TO BE','Condición · ESTAR','Condição · ESTAR')},{id:'movement',label:tri('MOVEMENT','MOVIMIENTO','MOVIMENTO'),meaning:tri('Activity in progress · BE + ING','Actividad en curso · ESTAR + gerundio','Atividade em andamento · ESTAR + gerúndio')},{id:'action',label:tri('ACTION','ACCIÓN','AÇÃO'),meaning:tri('Routine or habit · lexical verb','Rutina o hábito · verbo léxico','Rotina ou hábito · verbo lexical')},{id:'existence',label:tri('EXISTENCE','EXISTENCIA','EXISTÊNCIA'),meaning:tri('Existence · THERE + BE, not possession HAVE','Existencia · HABER impersonal','Existência · HAVER impessoal')}],items:[]};
function coreGraph(f,l,t,m,item,kind,number){
 const tokens=item.text.replace(/[¿?.]/g,'').split(/\s+/).map((form,i)=>({id:'w'+i,index:i+1,form,wordClass:'X'})),relations=[];
 const find=s=>tokens.find(t=>t.form.toLowerCase()===s.toLowerCase());
 const root=find(item.root);root.wordClass=kind==='existence'?'VERB':'ADJ';
 const attach=(token,head,relation,cls)=>{if(!token||token===head)return;token.wordClass=cls;relations.push({head:head.id,dependent:token.id,relation});};
 if(kind==='existence'){
  const pivot=f.existence[l][number==='plural'?1:0].split(' '),noun=find(pivot.at(-1));
  attach(noun,root,l==='en'?'nsubj':'obj','NOUN');attach(find(pivot[0]),noun,number==='plural'?'nummod':'det',number==='plural'?'NUM':'DET');
  if(l==='en')attach(find('there'),root,'expl','PRON');
 }else{
  const sub=f[kind][l][0].split(' '),noun=find(sub.at(-1));attach(noun,root,'nsubj','NOUN');attach(find(sub[0]),noun,'det','DET');
 }
 for(const token of tokens){if(token.wordClass!=='X')continue;const w=token.form.toLowerCase();
  if(['is','was','be','es','era','será','é','está','estaba','estará','estava'].includes(w))attach(token,root,kind==='existence'?'aux':'cop','AUX');
  if(w==='will')attach(token,root,'aux','AUX');
  if(w===tri('not','no','não')[l])attach(token,root,'advmod','PART');
 }
 const classes={on:'ADP',at:'ADP',after:'ADP',in:'ADP',sobre:'ADP',en:'ADP',de:'ADP',no:'ADP+DET',na:'ADP+DET',da:'ADP+DET',do:'ADP+DET',después:'ADV',depois:'ADV',the:'DET',el:'DET',la:'DET',a:'DET',o:'DET',kitchen:'NOUN',table:'NOUN',dining:'NOUN',dinner:'NOUN',supermarket:'NOUN',supermercado:'NOUN',mesa:'NOUN',cocina:'NOUN',cozinha:'NOUN',comedor:'NOUN',cena:'NOUN',jantar:'NOUN'};
 for(const token of tokens)if(token.wordClass==='X'&&classes[token.form.toLowerCase()])token.wordClass=classes[token.form.toLowerCase()];
 return{version:'0.1.0',id:`gear-${f.id}-${kind}-${number}-${l}-${t}-${m}`,language:l,sentence:item.text,tokens,relations,defaultFocus:root.id,pedagogy:{mode:'read-only-focus',doesNotClaim:['learner-evidence','green-pass','mastery','complete-parse']},source:{name:'SIYAYO authored core relation',experienceId:f.id,notes:'Only copular/existential core relations are analysed; other words retain their lexical labels.'}};
}
for(const f of frames){const entry={experienceId:f.id,provenance:'SIYAYO_ADAPTATION',homologation:'PENDING_HUMAN_REVIEW',sceneFact:false,interjection:tri('Wow!','¡Vaya!','Uau!'),forms:{}};
 for(const kind of ['quality','state','movement','action','existence']){entry.forms[kind]={};for(const number of kind==='existence'?['singular','plural']:['default']){entry.forms[kind][number]={};for(const t of tenses){entry.forms[kind][number][t]={};for(const m of modes){const cell={};for(const l of langs){const item=kind==='existence'?existence(f,l,t,m,number):['quality','state'].includes(kind)?copula(f,l,t,m,kind):action(f,l,t,m,kind==='movement');item.dependency=['action','movement'].includes(kind)?graph(f,l,t,m,item,kind):coreGraph(f,l,t,m,item,kind,number);cell[l]=item;}entry.forms[kind][number][t][m]=cell;}}}
 }corpus.items.push(entry);}
for(const entry of corpus.items)for(const numbers of Object.values(entry.forms))for(const ts of Object.values(numbers))for(const ms of Object.values(ts))for(const ls of Object.values(ms))for(const cell of Object.values(ls))cell.dependency.source.illustrative=true;
fs.writeFileSync('data/learning/gear-study-corpus.json',JSON.stringify(corpus)+'\n');
console.log('Authored 4 Experiences × 6 function/number variants × 9 tense/mode × 3 languages = 648 study forms; no assessment authority.');
