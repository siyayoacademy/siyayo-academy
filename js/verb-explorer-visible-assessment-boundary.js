// JAGUAR 90C.4 · Read-only visual boundary between CORPUS/audio and authorized assessment.
// Must not submit Attempts, create Evidence, interpret scores, or change navigation.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOVerbExplorerVisibleAssessmentBoundary=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
var words={which:'which.use.determiner',what:'what.use.object-question',where:'where.use.location-question',why:'why.use.contextual-reason'};
var copy={
 en:{base:'CORPUS · LISTEN ONLY. The 03 / 03 counter counts dialogue lines, NOT assessment progress.',
     exploring:'Exploring {word}; the active assessment is {active}. The lines speak but do not record an answer.',
     noSession:'No authorized assessment for {word} is active. The lines do not record an answer.',
     available:'To register {word} evidence, use the separate assessment response buttons below, not these audio lines.',
     unavailable:'The assessment response panel for {word} is not active here. Listening does not change progress.'},
 es:{base:'CORPUS · SOLO AUDIO. El contador 03 / 03 cuenta líneas de diálogo, NO progreso de evaluación.',
     exploring:'Explorando {word}; la evaluación activa es {active}. Estas líneas reproducen audio, no registran respuestas.',
     noSession:'No hay evaluación autorizada activa para {word}. Estas líneas no registran respuestas.',
     available:'Para registrar evidencia de {word}, utiliza los botones separados de evaluación, no estas líneas de audio.',
     unavailable:'El panel de evaluación de {word} no está activo aquí. Escuchar no cambia el progreso.'},
 pt:{base:'CORPUS · SOMENTE ÁUDIO. O contador 03 / 03 indica linhas do diálogo, NÃO progresso avaliativo.',
     exploring:'Explorando {word}; a avaliação ativa é {active}. Estas linhas reproduzem áudio, não registram respostas.',
     noSession:'Nenhuma avaliação autorizada de {word} está ativa. Estas linhas não registram respostas.',
     available:'Para registrar evidência de {word}, utilize os botões separados de avaliação, não estas linhas de áudio.',
     unavailable:'O painel avaliativo de {word} não está ativo aqui. Ouvir não altera o progresso.'}
};
function message(template,word,active){return template.replace('{word}',word.toUpperCase()).replace('{active}',active.toUpperCase());}
function classify(input){
  input=input||{};
  var word=String(input.questionWord||'').toLowerCase();
  if(!words[word]||input.wordType!=='verb'||input.perspective)return Object.freeze({status:'not-applicable',text:'',audibleOnly:true});
  var language=copy[input.language]?input.language:'en',labels=copy[language];
  var decision=input.decision||null,scope=decision&&decision.assessmentScope||null;
  var sameOwner=!!(decision&&scope&&input.learnerId&&scope.learnerId===input.learnerId&&scope.language===language);
  var assessed=sameOwner?String(decision.skill||'').split('.')[0]:'';
  var status,detail;
  if(assessed&&assessed!==word){status='free-exploration';detail=labels.exploring;}
  else if(!assessed){status='no-assessment';detail=labels.noSession;}
  else if(input.panelVisible===true){status='assessment-panel';detail=labels.available;}
  else{status='assessment-not-visible';detail=labels.unavailable;}
  return Object.freeze({status:status,text:labels.base+' '+message(detail,word,assessed),audibleOnly:true,word:word,assessmentWord:assessed||null});
}
function render(input){
  input=input||{};
  var doc=input.document||null;if(!doc||!doc.getElementById)return false;
  var lines=doc.getElementById('livingLines'),head=doc.querySelector('.living-window-head');
  if(!lines||!head||!head.parentNode)return false;
  var note=doc.getElementById('livingLineAuthorityNote');
  if(!note){
    note=doc.createElement('p');note.id='livingLineAuthorityNote';note.className='living-line-authority-note';
    note.setAttribute('role','note');head.insertAdjacentElement('afterend',note);
  }
  var question=input.question||{};
  var snapshot=input.snapshot||null,decision=snapshot&&snapshot.session&&snapshot.session.decision;
  var word=String(question.questionWord||'').toLowerCase();
  var panelId={which:'determinerUseAssessmentPanel',what:'whatAssessmentPanel',where:'whereAssessmentPanel',why:'whyAssessmentPanel'}[word];
  var panel=panelId?doc.getElementById(panelId):null;
  var state=classify({questionWord:word,wordType:input.wordType,language:input.language,
    perspective:input.perspective,learnerId:input.learnerId,decision:decision,
    panelVisible:!!(panel&&!panel.hidden)});
  note.hidden=state.status==='not-applicable';
  note.textContent=state.text;
  note.dataset.authorityState=state.status;
  note.dataset.visualQuestionWord=word;
  note.dataset.assessmentQuestionWord=state.assessmentWord||'';
  return state;
}
return Object.freeze({classify:classify,render:render});
});