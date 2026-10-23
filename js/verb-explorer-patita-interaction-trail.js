// JAGUAR P0 · PATITA interaction ledger v0.1.
// Observation ONLY. This module must never create an Assessment, Attempt,
// Evidence, Green Pass, navigation, speech output, or credit by itself.
(function(root){
'use strict';
var KEY='siyayo.patita.interactions.v1',SESSION_KEY='siyayo.patita.tab-session.v1',LIMIT=500;
var LANGUAGES=['en','es','pt'],doc=root.document;
function text(value){return typeof value==='string'?value.trim():'';}
function escapeHtml(value){return String(value==null?'':value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;");}
function read(){
  try{
    var rows=JSON.parse(root.localStorage.getItem(KEY)||'[]');
    return Array.isArray(rows)?rows.filter(function(r){return r&&r.kind==='patita-interaction'&&r.evidenceProduced===false;}).slice(-LIMIT):[];
  }catch(_error){return [];}
}
function sessionId(){
  try{
    var value=root.sessionStorage.getItem(SESSION_KEY);
    if(value)return value;
    value='tab-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
    root.sessionStorage.setItem(SESSION_KEY,value);
    return value;
  }catch(_error){return 'ephemeral';}
}
function learnerId(){
  try{
    var id=root.SIYAYOVerbExplorerLearnerIdentitySource?.getId?.();
    return text(id)||null;
  }catch(_error){return null;}
}
function activeValue(selector,attribute){
  var el=doc?.querySelector(selector);
  return el?text(el.getAttribute(attribute))||null:null;
}
function snapshot(){
  var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
  return {
    experienceId:runtime?.activeExperienceId?.()||null,
    language:runtime?.activeLanguage?.()||null,
    questionWord:runtime?.activeQuestionWord?.()||null,
    tense:activeValue('#experienceTenseGear .active[data-experience-tense]','data-experience-tense'),
    mode:activeValue('#experienceModeGear .active[data-experience-form]','data-experience-form'),
    wordType:activeValue('#wordTypeGear .active[data-word-type]','data-word-type'),
    perspective:activeValue('#perspectiveGear .active[data-perspective]','data-perspective'),
    view:doc?.getElementById('experienceView')?.hidden?'dna':'experience'
  };
}
var controls=[
  ['[data-experience-language]','language','experienceLanguage'],
  ['#questionGear [data-question-index]','question-word','questionIndex'],
  ['[data-experience-tense]','tense','experienceTense'],
  ['[data-experience-form]','mode','experienceForm'],
  ['[data-word-type]','word-type','wordType'],
  ['#nounOptions [data-noun-id]','noun','nounId'],
  ['#adjectiveOptions [data-adjective-id]','adjective','adjectiveId'],
  ['[data-perspective]','perspective','perspective'],
  ['#composeSelection','compose','id'],
  ['#buildSentence','build-sentence','id'],
  ['#nextExperience','next-experience','nextExperience'],
  ['#previousExperience','previous-experience','id'],
  ['#livingLines [data-sentence-axis]','sentence-axis','sentenceAxis'],
  ['#livingLines .living-line[data-line-index]','line-audio-or-practice','lineIndex'],
  ['#lineUp','lines-previous','id'],
  ['#lineDown','lines-next','id'],
  ['#choiceOptions [data-choice-select]','contextual-choice','choiceSelect'],
  ['#choiceOptions [data-choice-audio]','choice-audio-request','choiceAudio'],
  ['#choiceReview [data-choice-review-audio]','review-audio-request','choiceReviewAudio'],
  ['#dependencyHeadProbeOptions [data-dependency-head-probe-select]','dependency-head-choice','dependencyHeadProbeSelect'],
  ['#whyAssessmentPanel .why-probe-option','why-assessment-button','id'],
  ['#whatAssessmentPanel .what-probe-option','what-assessment-button','id'],
  ['#whereAssessmentPanel .where-probe-option','where-assessment-button','id'],
  ['#determinerUseAssessmentPanel button','determiner-assessment-button','id'],
  ['#learnerIdentityConfirm','identify-session','id'],
  ['#learnerIdentityChange','change-session-identity','id'],
  ['#previousVerb','previous-verb','id'],
  ['#nextVerb','next-verb','id'],
  ['#verbList button[data-index]','select-verb','index'],
  ['.language-card','word-audio-request','language'],
  ['.tense-tab','verb-tense','tense'],
  ['.form-tab','verb-mode','form'],
  ['.subject-tab','verb-subject','subject'],
  ['.form-sentence','form-audio-request','formLanguage'],
  ['.explorer-mode','explorer-mode','mode'],
  ['#learningTrailWordPathModule > summary','word-path-open','id']
];
function identify(target){
  if(!target||typeof target.closest!=='function')return null;
  for(var i=0;i<controls.length;i++){
    var entry=controls[i],node=target.closest(entry[0]);
    if(!node||node.disabled||node.getAttribute('aria-disabled')==='true')continue;
    return {action:entry[1],selected:text(node.dataset?.[entry[2]]||node.id||'').slice(0,96)};
  }
  return null;
}
function visibleRecords(){
  var id=learnerId(),session=sessionId();
  return read().filter(function(r){
    return id?r.learnerId===id:!r.learnerId&&r.sessionId===session;
  });
}
function render(){
  var panel=doc?.getElementById('patitaInteractionLedger');
  if(!panel)return;
  var rows=visibleRecords(),language=snapshot().language||'en';
  if(!rows.length){panel.hidden=true;panel.innerHTML='';return;}
  var labels={
    en:{heading:'PATITA · INTERACTION TRAIL',detail:'Observed navigation · no automatic assessment credit',anonymous:'Anonymous session · not attached to a NICK'},
    es:{heading:'PATITA · REGISTRO DE INTERACCIONES',detail:'Navegación observada · sin crédito evaluativo automático',anonymous:'Sesión anónima · no vinculada a un NICK'},
    pt:{heading:'PATITA · REGISTRO DE INTERAÇÕES',detail:'Navegação observada · sem crédito avaliativo automático',anonymous:'Sessão anônima · não vinculada a um NICK'}
  }[language]||{heading:'PATITA · INTERACTION TRAIL',detail:'No automatic assessment credit',anonymous:'Anonymous'};
  var last=rows.slice(-12).reverse();
  panel.hidden=false;panel.dataset.observationOnly='true';
  panel.innerHTML='<h4>'+escapeHtml(labels.heading)+' · '+rows.length+'</h4>'+
    '<p>'+escapeHtml(labels.detail)+(learnerId()?'':' · '+escapeHtml(labels.anonymous))+'</p>'+
    '<ol>'+last.map(function(r){
      return '<li><strong>'+escapeHtml(r.action)+'</strong> · '+
        escapeHtml(r.selected||'—')+' <small>'+escapeHtml((r.after?.language||r.before?.language||'—').toUpperCase())+
        ' · '+escapeHtml(r.after?.experienceId||r.before?.experienceId||'—')+
        ' · '+escapeHtml(r.after?.questionWord||r.before?.questionWord||'—')+'</small></li>';
    }).join('')+'</ol>';
}
function observe(event){
  var intent=identify(event.target);
  if(!intent)return;
  var before=snapshot(),id=learnerId(),session=sessionId();
  // Read the rendered result after native and existing Explorer event handlers.
  // Microtask captures the action, never calls any assessment or progression API.
  Promise.resolve().then(function(){
    var after=snapshot(),rows=read();
    var prior=rows.length?rows[rows.length-1].sequence:0;
    rows.push({
      version:1,kind:'patita-interaction',sequence:(Number.isInteger(prior)?prior:0)+1,
      observedAt:new Date().toISOString(),sessionId:session,learnerId:id,
      action:intent.action,selected:intent.selected,before:before,after:after,
      observationOnly:true,evidenceProduced:false,assessmentCredit:false,greenPass:false
    });
    try{root.localStorage.setItem(KEY,JSON.stringify(rows.slice(-LIMIT)));}catch(_error){}
    render();
  });
}
if(doc&&typeof doc.addEventListener==='function'){
  // Capture before handler dispatch so BEFORE is truly before QW/language changes.
  doc.addEventListener('click',observe,true);
  doc.addEventListener('DOMContentLoaded',render);
}
root.SIYAYOPatitaInteractionTrail=Object.freeze({
  getVisibleRecords:function(){return visibleRecords().map(function(r){return Object.assign({},r);});},
  refresh:render,
  storageKey:KEY
});
})(typeof globalThis!=='undefined'?globalThis:this);
