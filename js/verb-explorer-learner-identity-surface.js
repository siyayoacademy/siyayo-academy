// Explicit learner-owned identity surface for the Verb Explorer.
// It forwards only a human-entered name/nickname to the canonical provider.
// It does not persist, authenticate, derive, randomize, or silently invent identity.
(function(root){
'use strict';

var installedReflect=null;
function text(value){return typeof value==='string'?value.trim():'';}

function install(options){
  options=options||{};
  var doc=options.document||root.document;
  var provider=options.provider||root.SIYAYOVerbExplorerLearnerIdentityProvider;
  var source=options.source||root.SIYAYOVerbExplorerLearnerIdentitySource;
  var readiness=options.readiness||root.SIYAYOVerbExplorerAdaptiveReadinessTrigger;
  if(!doc||typeof doc.getElementById!=='function')return false;

  var panel=doc.getElementById('learnerIdentityPanel');
  var input=doc.getElementById('learnerIdentityInput');
  var confirm=doc.getElementById('learnerIdentityConfirm');
  var status=doc.getElementById('learnerIdentityStatus');
  if(!panel||!input||!confirm||!status)return false;
  if(!provider||typeof provider.provide!=='function')return false;
  if(!source||typeof source.getId!=='function')return false;

  var editor=doc.getElementById('learnerIdentityEditor');
  var compact=doc.getElementById('learnerIdentityCompact');
  var name=doc.getElementById('learnerIdentityName');
  var change=doc.getElementById('learnerIdentityChange');
  var cancel=doc.getElementById('learnerIdentityCancel');
  var editing=false;
  var enhanced=!!(editor&&compact&&name&&change&&cancel);
  function copy(){
    var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
    var language=runtime&&typeof runtime.activeLanguage==='function'?runtime.activeLanguage():'en';
    return {en:{change:'Change learner',cancel:'Cancel',confirm:'Confirm learner',enter:'Enter experience',label:'LEARNER · NAME OR NICKNAME',placeholder:'Your name or nickname',ready:'LEARNER READY',waiting:'Choose your name or nickname to track your progress.',blank:'Enter a name or nickname.',error:'Identity could not be accepted.'},
      es:{change:'Cambiar estudiante',cancel:'Cancelar',confirm:'Confirmar estudiante',enter:'Entrar a la experiencia',label:'ESTUDIANTE · NOMBRE O APODO',placeholder:'Tu nombre o apodo',ready:'ESTUDIANTE LISTO',waiting:'Elige tu nombre o apodo para seguir tu progreso.',blank:'Escribe un nombre o apodo.',error:'No se pudo aceptar la identidad.'},
      pt:{change:'Trocar aluno',cancel:'Cancelar',confirm:'Confirmar aluno',enter:'Entrar na experiência',label:'ALUNO · NOME OU NICK',placeholder:'Seu nome ou nick',ready:'ALUNO PRONTO',waiting:'Escolha seu nome ou nick para acompanhar seu progresso.',blank:'Informe um nome ou nick.',error:'Não foi possível aceitar a identidade.'}}[language]||null;
  }
  function copyFallback(){return {change:'Change learner',cancel:'Cancel',confirm:'Confirm learner',enter:'Enter experience',label:'LEARNER · NAME OR NICKNAME',placeholder:'Your name or nickname',ready:'LEARNER READY',waiting:'Choose your name or nickname to track your progress.',blank:'Enter a name or nickname.',error:'Identity could not be accepted.'};}
  function reflect(){
    var current=text(source.getId());
    panel.dataset.identityState=current?'ready':'waiting';
    input.disabled=false;
    confirm.disabled=false;
    if(enhanced){
      var labels=copy()||copyFallback();
      panel.dataset.identityDisplay=current&&!editing?'compact':'editor';
      editor.hidden=!!current&&!editing;compact.hidden=!current||editing;
      cancel.hidden=!current||!editing;
      name.textContent=current;change.textContent=labels.change;
      cancel.textContent=labels.cancel;confirm.textContent=current?labels.confirm:labels.enter;
      input.placeholder=labels.placeholder;
      var label=editor.querySelector&&editor.querySelector('label');
      if(label)label.textContent=labels.label;
      status.textContent=current?labels.ready+' · '+current:labels.waiting;
      var focusAnchor=doc.getElementById('dependencyFocusSurface');
      var anchor=current?(doc.getElementById('dependencyHeadProbePanel')||focusAnchor):focusAnchor;
      if(anchor&&anchor.parentNode===panel.parentNode&&panel.parentNode){
        if(current){if(anchor.nextElementSibling!==panel)anchor.parentNode.insertBefore(panel,anchor.nextSibling);}
        else if(panel.nextElementSibling!==anchor)anchor.parentNode.insertBefore(panel,anchor);
      }
    }else if(current){status.textContent='LEARNER READY · '+current;}
  }

  function submit(){
    var previous=text(source.getId());
    if(previous&&previous===text(input.value)){editing=false;reflect();if(enhanced)change.focus();return Promise.resolve(false);}
    var id=text(input.value);
    if(!id){
      status.textContent=enhanced?(copy()||copyFallback()).blank:'Enter a name or nickname to begin the adaptive Session.';
      return Promise.resolve(false);
    }
    if(provider.provide(id)!==true){
      status.textContent=enhanced?(copy()||copyFallback()).error:'Identity could not be accepted.';
      return Promise.resolve(false);
    }
    editing=false;reflect();
    if(enhanced)change.focus();
    var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
    if(runtime&&typeof runtime.render==='function')runtime.render();
    var selection=root.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
    var resume=selection&&typeof selection.resumeForIdentity==='function'
      ?selection.resumeForIdentity():Promise.resolve(false);
    return Promise.resolve(resume).then(function(started){
      if(started===true)return true;
      return readiness&&typeof readiness.signal==='function'?readiness.signal():false;
    }).then(function(){
      if(runtime&&typeof runtime.render==='function')runtime.render();
      return true;
    },function(){return true;});
  }

  if(panel.__siyayoLearnerIdentityInstalled!==true){
    confirm.addEventListener('click',function(){submit();});
    input.addEventListener('keydown',function(event){
      if(event&&event.key==='Enter'){
        if(typeof event.preventDefault==='function')event.preventDefault();
        submit();
      }
    });
    if(enhanced){
      change.addEventListener('click',function(){editing=true;input.value=text(source.getId());reflect();input.focus();});
      cancel.addEventListener('click',function(){editing=false;input.value=text(source.getId());reflect();change.focus();});
    }
    panel.__siyayoLearnerIdentityInstalled=true;
  }

  installedReflect=reflect;
  reflect();
  return true;
}

root.SIYAYOVerbExplorerLearnerIdentitySurface=Object.freeze({install:install,refresh:function(){if(installedReflect)installedReflect();}});
})(typeof globalThis!=='undefined'?globalThis:this);
