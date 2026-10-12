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
   if(confirmed&&records.length){info+=' · '+copy.confirmed+' ('+language.toUpperCase()+')';}
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
  '<p class="wp-poly-footnote wp-poly-coverage">'+escapeHtml(copy.details)+'</p></section>';
}
root.SIYAYOVerbExplorerPolyglotWordPathView=Object.freeze({render:view});
})(typeof globalThis!=='undefined'?globalThis:this);
