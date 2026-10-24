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
    return Array.isArray(rows)?rows.filter(function(r){return r&&['patita-interaction','patita-observed-result'].includes(r.kind)&&r.evidenceProduced===false;}).slice(-LIMIT):[];
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
// P0.3: one observation envelope for post-interaction feedback *returned by*
// existing contextual resolvers. No ability to submit Attempt/Evidence.
function append(record){
  var rows=read(),prior=rows.length?rows[rows.length-1].sequence:0;
  record.sequence=(Number.isInteger(prior)?prior:0)+1;
  rows.push(record);
  try{root.localStorage.setItem(KEY,JSON.stringify(rows.slice(-LIMIT)));}catch(_error){}
  render();
}
function recordOutcome(input){
  input=input||{};
  var source=text(input.source),phase=text(input.phase),code=text(input.resultCode);
  if(!['contextual-choice','dependency-head-probe'].includes(source))return false;
  if(!['exploration','assessment-attempt'].includes(phase))return false;
  if(!['best-fit','possible-fit','pass','fail'].includes(code))return false;
  if(source==='contextual-choice'&&(phase!=='exploration'||!['best-fit','possible-fit'].includes(code)))return false;
  if(source==='dependency-head-probe'&&!['pass','fail'].includes(code))return false;
  var context=snapshot(),selected=text(input.selected);
  if(!selected||text(input.experienceId)!==context.experienceId||
    text(input.language)!==context.language||text(input.questionWord)!==context.questionWord)return false;
  var numerator=input.score,denominator=input.possibleScore;
  if(source==='contextual-choice'&&(!Number.isInteger(numerator)||!Number.isInteger(denominator)||
    denominator<=0||numerator<0||numerator>denominator))return false;
  if(source==='contextual-choice'){
    if((code==='best-fit'&&input.isBestFit!==true)||
      (code==='possible-fit'&&input.isBestFit!==false))return false;
  }
  var observerId=learnerId(),tab=sessionId();
  var outcome={
    version:1,kind:'patita-observed-result',observedAt:new Date().toISOString(),
    sessionId:tab,learnerId:observerId,
    action:source,selected:selected.slice(0,96),source:source,phase:phase,
    resultCode:code,experienceId:context.experienceId,language:context.language,questionWord:context.questionWord,
    ...(source==='contextual-choice'?{score:numerator,possibleScore:denominator}:{structureId:text(input.structureId)||null}),
    before:context,after:context,uiOutcome:'observed-result',
    observationOnly:true,evidenceProduced:false,assessmentCredit:false,greenPass:false
  };
  // Defer write until captured raw click intent is committed; do not delay any assessor.
  root.setTimeout(function(){append(outcome);},0);
  return true;
}
function visibleRecords(){
  var id=learnerId(),session=sessionId();
  return read().filter(function(r){
    return id?r.learnerId===id:!r.learnerId&&r.sessionId===session;
  });
}
// A control request is not necessarily an accepted result.
// This classification describes UI interaction only; assessment results belong
// exclusively to existing canonical evaluators.
var STATE_FIELDS=Object.freeze({
  'language':'language','question-word':'questionWord',
  'tense':'tense','mode':'mode','word-type':'wordType',
  'perspective':'perspective','next-experience':'experienceId',
  'previous-experience':'experienceId','explorer-mode':'view'
});
function classify(action,before,after){
  var field=STATE_FIELDS[action];
  if(!field)return 'requested';
  return before[field]===after[field]?'unchanged':'changed';
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
      return '<li data-patita-kind="'+escapeHtml(r.kind)+'"><strong>'+escapeHtml(r.action)+'</strong> · '+
        escapeHtml(r.selected||'—')+' · '+escapeHtml(r.uiOutcome||'requested')+
        (r.kind==='patita-observed-result'?' · '+escapeHtml(r.resultCode||'')+
          (Number.isInteger(r.score)?' · '+escapeHtml(r.score)+'/'+escapeHtml(r.possibleScore)+' (context, not Green Pass)':' · observed, not Green Pass'):'')+
        ' <small>'+escapeHtml((r.after?.language||r.before?.language||'—').toUpperCase())+
        ' · '+escapeHtml(r.after?.experienceId||r.before?.experienceId||'—')+
        ' · '+escapeHtml(r.after?.questionWord||r.before?.questionWord||'—')+'</small></li>';
    }).join('')+'</ol>';
}
function observe(event){
  var intent=identify(event.target);
  if(!intent)return;
  var before=snapshot(),id=learnerId(),session=sessionId();
  // A capture-phase microtask may run BEFORE target/bubble click handlers.
  // Defer the AFTER snapshot to the next task so the Explorer has updated UI state.
  // Observation only: no assessment/progression calls.
  root.setTimeout(function(){
    var after=snapshot(),rows=read();
    var prior=rows.length?rows[rows.length-1].sequence:0;
    rows.push({
      version:1,kind:'patita-interaction',sequence:(Number.isInteger(prior)?prior:0)+1,
      observedAt:new Date().toISOString(),sessionId:session,learnerId:id,
      action:intent.action,selected:intent.selected,before:before,after:after,
      uiOutcome:classify(intent.action,before,after),
      observationOnly:true,evidenceProduced:false,assessmentCredit:false,greenPass:false
    });
    try{root.localStorage.setItem(KEY,JSON.stringify(rows.slice(-LIMIT)));}catch(_error){}
    render();
  },0);
}
if(doc&&typeof doc.addEventListener==='function'){
  // Capture before handler dispatch so BEFORE is truly before QW/language changes.
  doc.addEventListener('click',observe,true);
  doc.addEventListener('DOMContentLoaded',render);
}
root.SIYAYOPatitaInteractionTrail=Object.freeze({
  getVisibleRecords:function(){return visibleRecords().map(function(r){return JSON.parse(JSON.stringify(r));});},
  refresh:render,
  recordOutcome:recordOutcome,
  storageKey:KEY
});
})(typeof globalThis!=='undefined'?globalThis:this);
