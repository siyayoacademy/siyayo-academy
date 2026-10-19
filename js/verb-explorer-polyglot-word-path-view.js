// SIYAYO · JAGUAR ELO 7D.2 — read-only evidence details for the Word Path.
// Only canonical accepted contract witnesses. Never adopts Sessions, submits
// Attempts, creates Evidence, awards Green Pass, navigates, or writes storage.
(function(root){
'use strict';
var LANGUAGES=['en','es','pt'];
var WORDS=Object.freeze([
  Object.freeze({id:'which.use.determiner',word:'WHICH'}),
  Object.freeze({id:'what.use.object-question',word:'WHAT'}),
  Object.freeze({id:'why.use.contextual-reason',word:'WHY'}),
  Object.freeze({id:'where.use.location-question',word:'WHERE'})
]);
function text(v){return typeof v==='string'?v.trim():'';}
function html(v){return String(v==null?'':v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
var COPY={
 en:{title:'ACCEPTED EVIDENCE · WHAT I DEMONSTRATED',empty:'No accepted evidence yet',current:'Current',saved:'Saved',origin:'Started in',at:'Answered in',question:'QUESTION FUNCTION',local:'LOCAL ANSWER',transfer:'TRANSFER',use:'USE',choice:'CHOICE',answer:'ANSWER',pending:'Not yet accepted',accepted:'Accepted',notAvailable:'Answer text unavailable in this corpus',token:'Canonical identifier',note:'Only accepted contract requirements are shown. Exploratory responses never earn credit.'},
 es:{title:'EVIDENCIAS ACEPTADAS · LO QUE DEMOSTRÉ',empty:'Todavía no hay evidencias aceptadas',current:'Actual',saved:'Guardada',origin:'Iniciada en',at:'Respondida en',question:'FUNCIÓN INTERROGATIVA',local:'RESPUESTA LOCAL',transfer:'TRANSFERENCIA',use:'USO',choice:'ELECCIÓN',answer:'RESPUESTA',pending:'Aún no aceptada',accepted:'Aceptada',notAvailable:'Respuesta no disponible en este corpus',token:'Identificador canónico',note:'Solo se muestran requisitos aceptados del contrato. La exploración libre no otorga puntos.'},
 pt:{title:'EVIDÊNCIAS ACEITAS · O QUE DEMONSTREI',empty:'Ainda não há evidências aceitas',current:'Atual',saved:'Preservada',origin:'Iniciada em',at:'Respondida em',question:'FUNÇÃO INTERROGATIVA',local:'RESPOSTA LOCAL',transfer:'TRANSFERÊNCIA',use:'USO',choice:'ESCOLHA',answer:'RESPOSTA',pending:'Ainda não aceita',accepted:'Aceita',notAvailable:'Resposta indisponível neste corpus',token:'Identificador canônico',note:'Somente requisitos aceitos do contrato. Respostas exploratórias não geram pontos.'}
};
function project(input){
 input=input||{};
 var s=input.scope,c=input.context,api=input.scopeApi,e=input.evaluator,pv=input.progressView;
 if(!s||!api||typeof api.valid!=='function'||!api.valid(s)||
    !c||!c.assessmentScope||typeof api.same!=='function'||!api.same(s,c.assessmentScope)||
    !LANGUAGES.includes(s.language)||!Array.isArray(c.passContract&&c.passContract.requires)||
    !Array.isArray(c.evidencePackets)||!e||typeof e.evidenceMatchesRequirement!=='function'||
    !pv||typeof pv.project!=='function')return null;
 var progress;
 try{progress=pv.project(c.passContract,c.evidencePackets,e);}catch(_error){return null;}
 if(!progress||!Array.isArray(progress.satisfied)||progress.satisfied.length!==c.passContract.requires.length)return null;
 var items=c.passContract.requires.map(function(req,index){
   var accepted=progress.satisfied[index]===true;
   var witness=null;
   if(accepted)witness=c.evidencePackets.find(function(packet){
     return packet&&packet.skill===s.skill&&packet.result==='pass'&&
       packet.context&&packet.context.language===s.language&&
       typeof api.ownsPacket==='function'&&api.ownsPacket(s,packet)&&
       e.evidenceMatchesRequirement(packet,req);
   })||null;
   // No scope-owned matching witness, no 'accepted' label.
   var verified=accepted&&!!witness;
   var ctx=verified?witness.context:{};
   return Object.freeze({accepted:verified,dimension:text(req.dimension),mode:text(req.mode),
     selectedAlternativeId:verified?text(ctx.selectedAlternativeId):'',
     experienceId:verified?text(ctx.experienceId):'',
     fromExperienceId:verified?text(ctx.fromExperienceId):''});
 });
 return Object.freeze({scopeKey:s.key,skill:s.skill,language:s.language,
  originExperienceId:s.originExperienceId,completed:items.filter(x=>x.accepted).length,
  total:items.length,items:Object.freeze(items)});
}
function render(input){
 input=input||{};
 var profile=input.profile,identity=input.identity,api=input.scopeApi,selection=input.selection,
     snapshot=input.snapshot,lang=LANGUAGES.includes(input.language)?input.language:'en',catalog=input.catalog;
 var copy=COPY[lang],e=input.evaluator,pv=input.progressView;
 if(!profile||!text(profile.id)||!identity||typeof identity.getId!=='function'||
    text(identity.getId())!==text(profile.id)||!api||typeof api.valid!=='function'||
    !selection||typeof selection.getRetainedEvidence!=='function')return '';
 var byKey=new Map();
 WORDS.forEach(function(word){LANGUAGES.forEach(function(language){
   var saved=[];try{saved=selection.getRetainedEvidence(word.id,language);}catch(_error){saved=[];}
   (Array.isArray(saved)?saved:[]).forEach(function(record){
     if(!record||!record.detail||!text(record.scopeKey)||record.language!==language||
        record.detail.scopeKey!==record.scopeKey||record.detail.skill!==word.id||
        record.detail.language!==language||!record.detail.items)return;
     var parts;try{parts=JSON.parse(record.scopeKey);}catch(_error){return;}
     if(!Array.isArray(parts)||parts.length!==4||parts[0]!==profile.id||
        parts[1]!==word.id||parts[2]!==language||parts[3]!==record.originExperienceId)return;
     byKey.set(record.scopeKey,{detail:record.detail,state:'saved'});
   });
 });});
 var decision=snapshot&&snapshot.session&&snapshot.session.decision,s=decision&&decision.assessmentScope;
 if(s&&api.valid(s)&&s.learnerId===profile.id&&snapshot.context&&
    snapshot.context.assessmentScope&&typeof api.same==='function'&&api.same(s,snapshot.context.assessmentScope)){
   var live=project({scope:s,context:snapshot.context,scopeApi:api,evaluator:e,progressView:pv});
   if(live)byKey.set(s.key,{detail:live,state:'current'});
 }
 function experienceName(id){var x=catalog&&catalog.getExperience&&catalog.getExperience(id);return text(x&&x.title&&x.title[lang])||text(id);}
 function labelAnswer(rec,item){
   var id=item.selectedAlternativeId,language=rec.language,exp=catalog&&catalog.getExperience&&catalog.getExperience(item.experienceId);
   // Accepted choice evidence may lack the historic answer-text identifier.
   // Report that provenance gap without inventing a selected sentence.
   if(!id&&item.dimension==='choice-function'&&item.accepted)return {label:{en:'Contextual choice accepted · answer text not retained',es:'Elección contextual aceptada · texto de respuesta no conservado',pt:'Escolha contextual aceita · texto da resposta não preservado'}[lang],extra:''};
   if(!id)return {label:'',extra:''};
   var word=WORDS.find(function(x){return x.word.toLowerCase()===id;});
   if(word&&exp){
     var q=(exp.thinkingMind||[]).find(function(x){return x.questionWord===id;});
     var label=text(q&&q.questionWordLabel&&q.questionWordLabel[language]);
     if(label)return {label:label,extra:''};
   }
   var nouns=catalog&&catalog.getNouns&&catalog.getNouns(),items=nouns&&nouns.items;
   var noun=Array.isArray(items)&&items.find(function(n){return n.id===id;});
   if(noun&&exp&&exp.links&&Array.isArray(exp.links.vocabulary)&&exp.links.vocabulary.includes(id)){
     var localized=text(noun.translations&&noun.translations[language]);
     if(localized){
       var question=(exp.thinkingMind||[]).find(function(x){return x.questionWord===rec.skill.split('.')[0];});
       var matches=question&&question.answerGrounding&&question.answerGrounding.canonicalResponses;
       var response=Array.isArray(matches)&&matches.find(function(x){return x.id===id;});
       var sentence=text(response&&response.response&&response.response[language]);
       return {label:localized,extra:sentence&&sentence!==localized?sentence:''};
     }
   }
   // Identifier is faithful evidence even when no canonical wording is available.
   return {label:copy.token+': '+id,extra:''};
 }
 function kind(item){
   if(item.mode==='transfer')return copy.transfer;
   if(item.dimension==='question-function'||item.dimension==='spatial-function')return copy.question;
   if(item.dimension==='choice-function')return copy.choice;
   if(item.dimension==='determiner-use')return copy.use;
   if(item.mode==='local')return copy.local;
   return copy.answer;
 }
 var cards=Array.from(byKey.values()).filter(function(v){return v.detail.completed>0;}).map(function(v){
   var rec=v.detail,items=rec.items.map(function(item){
     var name=kind(item),word=labelAnswer(rec,item),response=item.accepted
       ?'<strong class="wp-evidence-answer">'+html(word.label||copy.notAvailable)+'</strong>'+
          (word.extra?'<span class="wp-evidence-sentence">'+html(word.extra)+'</span>':'')+
          (item.experienceId?'<small>'+html(copy.at)+' · '+html(experienceName(item.experienceId))+'</small>':'')
       :'<span class="wp-evidence-pending">○ '+html(copy.pending)+'</span>';
     return '<li class="wp-evidence-requirement" data-accepted="'+String(item.accepted)+'">'+
       '<b>'+html(item.accepted?'●':'○')+' '+html(name)+'</b>'+response+'</li>';
   }).join('');
   var short=rec.skill.split('.')[0].toUpperCase(),state=v.state==='current'?copy.current:copy.saved;
   return '<details class="wp-evidence-card" data-language="'+html(rec.language)+'">'+
     '<summary><b>'+html(short)+' · '+html(rec.language.toUpperCase())+'</b><span>'+html(rec.completed+'/'+rec.total)+' · '+html(state)+'</span></summary>'+
     '<p class="wp-evidence-origin">'+html(copy.origin)+' · '+html(experienceName(rec.originExperienceId))+'</p>'+
     '<ol class="wp-evidence-items">'+items+'</ol></details>';
 }).join('');
 if(!cards)return '';
 return '<section class="wp-evidence-detail" aria-label="'+html(copy.title)+'">'+
   '<h5>'+html(copy.title)+'</h5><div class="wp-evidence-grid">'+cards+'</div>'+
   '<p class="wp-evidence-note">'+html(copy.note)+'</p></section>';
}
root.SIYAYOVerbExplorerWordPathWitnessView=Object.freeze({project:project,render:render});
})(typeof globalThis!=='undefined'?globalThis:this);

// SIYAYO · JAGUAR ELO 7D.1 — read-only polyglot Word Path matrix.
// No Session creation, Evidence, score, Green Pass, navigation or storage writes.
(function(root){
'use strict';
var WORDS=Object.freeze([
  Object.freeze({id:'which.use.determiner',en:'WHICH',es:'CUÁL',pt:'QUAL'}),
  Object.freeze({id:'what.use.object-question',en:'WHAT',es:'QUÉ',pt:'O QUE'}),
  Object.freeze({id:'why.use.contextual-reason',en:'WHY',es:'POR QUÉ',pt:'POR QUÊ'}),
  Object.freeze({id:'where.use.location-question',en:'WHERE',es:'DÓNDE',pt:'ONDE'})
]);
var LANGUAGES=Object.freeze(['en','es','pt']);
function text(v){return typeof v==='string'?v.trim():'';}
function escapeHtml(v){return String(v==null?'':v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function labels(language){return ({
  en:{heading:'POLYGLOT WORD PATH',qword:'QUESTION WORD',empty:'Not started',saved:'Saved',active:'Current',confirmed:'Confirmed',multiple:'circuits',scope:'Started in',scopeNote:'Contract-owned progress · no credit from free exploration',details:'Only four Question Words currently have these canonical assessment families.'},
  es:{heading:'RECORRIDO POLÍGLOTA',qword:'PALABRA INTERROGATIVA',empty:'Sin iniciar',saved:'Guardada',active:'Actual',confirmed:'Confirmada',multiple:'circuitos',scope:'Iniciada en',scopeNote:'Progreso por contrato · la exploración libre no otorga puntos',details:'Actualmente se muestran las cuatro familias de evaluación canónicas disponibles.'},
  pt:{heading:'WORD PATH POLIGLOTA',qword:'PALAVRA INTERROGATIVA',empty:'Não iniciada',saved:'Preservada',active:'Atual',confirmed:'Confirmada',multiple:'circuitos',scope:'Iniciada em',scopeNote:'Progresso por contrato · exploração livre não gera pontos',details:'Apenas quatro famílias canônicas de avaliação estão disponíveis nesta etapa.'}
})[language]||labels('en');}
function view(input){
 input=input||{};
 var language=LANGUAGES.includes(input.language)?input.language:'en';
 var copy=labels(language),profile=input.profile,selection=input.selection,trailView=input.trailView,markerAuthority=input.markerAuthority;
 var snapshot=input.snapshot,progressView=input.progressView,evaluator=input.evaluator,scopeApi=input.scopeApi;
 var identity=input.identity, catalog=input.catalog;
 function experienceName(id){var experience=catalog&&typeof catalog.getExperience==='function'&&catalog.getExperience(id);return text(experience&&experience.title&&experience.title[language])||text(id);}
 if(!profile||!text(profile.id)||!identity||typeof identity.getId!=='function'||text(identity.getId())!==text(profile.id)||
    !selection||typeof selection.getRetainedProgress!=='function'||!trailView||typeof trailView.project!=='function'||
    !markerAuthority||typeof markerAuthority.resolve!=='function'||!scopeApi||typeof scopeApi.valid!=='function')return '';
 var decision=snapshot&&snapshot.session&&snapshot.session.decision;
 var currentScope=decision&&decision.assessmentScope;
 var currentValid=!!(currentScope&&scopeApi.valid(currentScope)&&currentScope.learnerId===profile.id&&
   snapshot.context&&snapshot.context.assessmentScope&&scopeApi.same(currentScope,snapshot.context.assessmentScope));
 function one(word,lang){
   var byKey=new Map();
   var saved;
   try{saved=selection.getRetainedProgress(word.id,lang);}catch(_error){saved=[];}
   (Array.isArray(saved)?saved:[]).forEach(function(entry){
     if(!entry||!text(entry.scopeKey)||entry.language!==lang||!entry.progress)return;
     // A retained record is keyed by its canonical scope. Never combine origins.
     var parts;try{parts=JSON.parse(entry.scopeKey);}catch(_error){return;}
     if(!Array.isArray(parts)||parts.length!==4||parts[0]!==profile.id||parts[1]!==word.id||parts[2]!==lang||parts[3]!==entry.originExperienceId)return;
     var p=entry.progress;
     if(!Number.isInteger(p.completed)||!Number.isInteger(p.total)||p.total<1||p.completed<0||p.completed>p.total)return;
     byKey.set(entry.scopeKey,{origin:entry.originExperienceId,progress:p,state:'saved'});
   });
   if(currentValid&&currentScope.skill===word.id&&currentScope.language===lang&&
      progressView&&typeof progressView.project==='function'){
     var progress=progressView.project(snapshot.context.passContract,snapshot.context.evidencePackets,evaluator);
     if(progress&&Number.isInteger(progress.completed)&&Number.isInteger(progress.total)&&progress.total>0&&progress.completed>=0&&progress.completed<=progress.total){
       byKey.set(currentScope.key,{origin:currentScope.originExperienceId,progress:progress,state:'active'});
     }
   }
   var historic=null,marker=null;
   try{historic=trailView.project(profile,word.id,{language:lang});marker=historic&&markerAuthority.resolve(historic);}catch(_error){marker=null;}
   var confirmed=marker&&(marker.state==='CONFIRMED'||marker.state==='CONSOLIDATED_EVIDENCE');
   var records=Array.from(byKey.values());
   var status='empty',value='—',info=copy.empty, detail='';
   if(records.length===1){
     var rec=records[0];value=rec.progress.completed+'/'+rec.progress.total;
     status=rec.state;info=rec.state==='active'?copy.active:copy.saved;
     detail=copy.scope+' '+experienceName(rec.origin);
   }else if(records.length>1){
     status='multiple';value=String(records.length);info=copy.multiple;
     detail=records.map(function(rec){return rec.progress.completed+'/'+rec.progress.total+' · '+copy.scope+' '+experienceName(rec.origin);}).join(' / ');
   }else if(confirmed){status='confirmed';value=marker.marker==='MILESTONE'?'★':'●';info=copy.confirmed;}
   if(confirmed&&records.length){info+=' · '+copy.confirmed+' ('+lang.toUpperCase()+')';}
   return '<td class="wp-poly-cell" data-skill="'+escapeHtml(word.id)+'" data-language="'+lang+'" data-state="'+status+'">'+
     '<strong class="wp-poly-value">'+escapeHtml(value)+'</strong>'+
     '<span class="wp-poly-status">'+escapeHtml(info)+'</span>'+
     (detail?'<small class="wp-poly-origin">'+escapeHtml(detail)+'</small>':'')+'</td>';
 }
 var rows=WORDS.map(function(word){
   return '<tr><th scope="row" class="wp-poly-word"><strong>'+escapeHtml(word.en)+'</strong><small>'+escapeHtml(word.es)+' · '+escapeHtml(word.pt)+'</small></th>'+
     LANGUAGES.map(function(l){return one(word,l);}).join('')+'</tr>';
 }).join('');
 return '<section class="wp-polyglot" aria-label="'+escapeHtml(copy.heading)+'">'+
  '<h4 class="wp-poly-title">'+escapeHtml(copy.heading)+'</h4>'+
  '<div class="wp-poly-scroller" tabindex="0" role="region" aria-label="'+escapeHtml(copy.heading)+'">'+
    '<table class="wp-poly-table"><thead><tr><th scope="col">'+escapeHtml(copy.qword)+'</th>'+
    '<th scope="col">ENGLISH</th><th scope="col">ESPAÑOL</th><th scope="col">PORTUGUÊS</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
  '<p class="wp-poly-footnote">'+escapeHtml(copy.scopeNote)+'</p>'+
  '<p class="wp-poly-footnote wp-poly-coverage">'+escapeHtml(copy.details)+'</p>'+
  patitaHtml(input)+
  (root.SIYAYOVerbExplorerWordPathWitnessView&&typeof root.SIYAYOVerbExplorerWordPathWitnessView.render==='function'
    ?root.SIYAYOVerbExplorerWordPathWitnessView.render(input):'')+'</section>';
}
var patitaKey='siyayo.patita.contextual-choices.v1';
function readPatita(){
 try{var rows=JSON.parse(root.localStorage.getItem(patitaKey)||'[]');return Array.isArray(rows)?rows.filter(function(r){return r&&r.learnerId&&['en','es','pt'].includes(r.language)&&r.answer;}).slice(-500):[];}catch(_e){return [];}
}
function observeChoice(input){
 input=input||{};
 var id=text(input.learnerId),language=text(input.language),answer=text(input.answer);
 if(!id||!['en','es','pt'].includes(language)||!answer)return false;
 var rows=readPatita();
 rows.push({learnerId:id,language:language,questionWord:text(input.questionWord),experienceId:text(input.experienceId),candidateId:text(input.candidateId),answer:answer,observedAt:new Date().toISOString(),kind:'exploratory-contextual-choice',evidenceProduced:false});
 try{root.localStorage.setItem(patitaKey,JSON.stringify(rows.slice(-500)));return true;}catch(_e){return false;}
}
function patitaRecords(id){return readPatita().filter(function(r){return r.learnerId===text(id);});}
function patitaHtml(input){
 var identity=input&&input.identity,id=identity&&typeof identity.getId==='function'?text(identity.getId()):'';
 if(!id||!input.profile||text(input.profile.id)!==id)return '';
 var rows=patitaRecords(id).slice(-30).reverse();
 if(!rows.length)return '';
 var labels={en:'PATITA · observed choices · no assessment credit',es:'PATITA · respuestas observadas · sin crédito evaluativo',pt:'PATITA · respostas observadas · sem crédito avaliativo'};
 return '<section class="wp-patita-observations" data-observation-only="true"><h4>'+escapeHtml(labels[input.language]||labels.en)+'</h4><ol>'+rows.map(function(r){return '<li data-observed-language="'+escapeHtml(r.language)+'"><strong>'+escapeHtml(r.language.toUpperCase()+' · '+r.questionWord.toUpperCase())+'</strong> · '+escapeHtml(r.answer)+' <small>'+escapeHtml(r.experienceId)+' · '+escapeHtml(r.observedAt)+'</small></li>';}).join('')+'</ol></section>';
}
root.SIYAYOVerbExplorerPolyglotWordPathView=Object.freeze({render:view,observeChoice:observeChoice,patitaRecords:patitaRecords});
})(typeof globalThis!=='undefined'?globalThis:this);
