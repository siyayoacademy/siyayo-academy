// Browser-only interaction boundary for one already-presented Dependency Head Probe.
// It renders the prompt and authorized alternatives, then delegates one physical
// learner click to the canonical learner-event boundary. It does not evaluate
// correctness, expose canonical dependency relation, create Evidence/Attempt,
// grant Green Pass, authorize NEXT, or reuse exploratory Dependency Focus state.
(function(root,factory){
  var api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOAdaptiveDependencyHeadProbeBrowserWire=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function escapeHtml(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
    });
  }

  function validPresentation(view){
    if(!view||typeof view!=='object')return false;
    if(
      !text(view.experienceId)||
      !text(view.structureId)||
      !text(view.language)||
      text(view.dimension)!=='head-identification'||
      !view.targetToken||
      !text(view.targetToken.id)||
      !text(view.targetToken.form)||
      !text(view.targetToken.wordClass)||
      !text(view.prompt)||
      !Array.isArray(view.alternatives)||
      view.alternatives.length<2
    )return false;

    var seen=Object.create(null);
    return view.alternatives.every(function(item){
      var id=text(item&&item.id);
      var form=text(item&&item.form);
      var wordClass=text(item&&item.wordClass);
      if(!id||!form||!wordClass||id===view.targetToken.id||seen[id])return false;
      seen[id]=true;
      return true;
    });
  }

  // Only split fully recognized, corpus-authored relation questions.
  // Never infer a linguistic role or the correct answer from a translated guess.
  function splitLinkQuestion(view){
    var p=text(view.prompt),target=text(view.targetToken&&view.targetToken.form),language=text(view.language);
    var m=null,question='';
    if(language==='en'){
      m=/^In “([^”]+)”, (which (?:noun|verb|predicate) does) “([^”]+)” (modify|connect to)\?$/i.exec(p);
      if(m)question=m[2].charAt(0).toUpperCase()+m[2].slice(1)+' it '+m[4]+'?';
    }else if(language==='es'){
      m=/^En «([^»]+)», (¿a qué (?:sustantivo|verbo|predicado) se vincula) «([^»]+)»\?$/i.exec(p);
      if(m)question='¿'+m[2].slice(1,2).toUpperCase()+m[2].slice(2)+'?';
    }else if(language==='pt'){
      m=/^Em “([^”]+)”, (a qual (?:substantivo|verbo|predicado)) “([^”]+)” se liga\?$/i.exec(p);
      if(m)question=m[2].charAt(0).toUpperCase()+m[2].slice(1)+' se liga?';
    }
    if(!m||!target||m[3].toLocaleLowerCase()!==target.toLocaleLowerCase()||
       !m[1].toLocaleLowerCase().includes(target.toLocaleLowerCase()))return null;
    return {sentence:m[1],target:m[3],question:question};
  }

  function promptHtml(view){
    var parts=splitLinkQuestion(view);
    var api=root.SIYAYOStudyTargetPresentation;
    if(parts){
      var sentence=api&&typeof api.highlight==='function'
        ?api.highlight(parts.sentence,view.studyTarget):escapeHtml(parts.sentence);
      return '<span class="dependency-probe-reference">'+sentence+'</span>'+
        '<span class="dependency-probe-target">'+escapeHtml(parts.target)+'</span>'+
        '<span class="dependency-probe-short-question">'+escapeHtml(parts.question)+'</span>';
    }
    // Historical and unmatched probes preserve their authored question verbatim.
    var value=api&&typeof api.highlight==='function'?api.highlight(view.prompt,view.studyTarget):escapeHtml(view.prompt);
    return value.replace(/([”»],)\s+/,'$1<br>');
  }

  function render(view,options){
    options=options||{};
    var container=options.container;
    if(!validPresentation(view)||!container)return false;

    container.innerHTML=[
      '<section class="dependency-head-probe" aria-label="Dependency head check">',
      '<span class="dependency-probe-heading">',escapeHtml(({en:'DEPENDENCY HEAD PROBE',es:'DIAGNÓSTICO DE VÍNCULO',pt:'DIAGNÓSTICO DE LIGAÇÃO'})[view.language]),'</span>',
      '<button type="button" class="dependency-probe-question-card" data-dependency-probe-audio aria-label="',escapeHtml(({en:'Listen to the question',es:'Escuchar la pregunta',pt:'Ouvir a pergunta'})[view.language]),'"><span class="dependency-probe-audio siyayo-speaker" aria-hidden="true"></span><span class="dependency-head-probe-prompt">',promptHtml(view),'</span></button>',
      '<div class="dependency-head-probe-options">',
      view.alternatives.map(function(item){
        return [
          '<button type="button" data-dependency-head-probe-select="',
          escapeHtml(item.id),
          '">',
          escapeHtml(item.form),
          '</button>'
        ].join('');
      }).join(''),
      '</div>',
      '</section>'
    ].join('');

    return true;
  }

  function selectedChoice(target,view){
    if(!target||!target.dataset||!validPresentation(view))return null;
    var choice=text(target.dataset.dependencyHeadProbeSelect);
    if(!choice)return null;
    return view.alternatives.some(function(item){return item.id===choice;})?choice:null;
  }

  function install(view,options){
    options=options||{};
    var container=options.container;
    var learnerEvents=options.learnerEvents||root.SIYAYOVerbExplorerLearnerEvent;
    var onEvent=options.onEvent;

    if(!validPresentation(view))return false;
    if(!container||typeof container.addEventListener!=='function')return false;
    if(!learnerEvents||typeof learnerEvents.fromDependencyHeadProbeSelect!=='function')return false;
    if(typeof onEvent!=='function')return false;
    if(!render(view,{container:container}))return false;

    container.__siyayoDependencyHeadProbeBinding={
      view:view,
      learnerEvents:learnerEvents,
      onEvent:onEvent,
      speak:options.speak
    };

    if(container.__siyayoDependencyHeadProbeClickInstalled!==true){
      container.addEventListener('click',function(event){
        var binding=container.__siyayoDependencyHeadProbeBinding;
        if(!binding)return;
        var audio=event&&event.target&&event.target.closest&&event.target.closest('[data-dependency-probe-audio]');
        if(audio&&audio.dataset&&Object.prototype.hasOwnProperty.call(audio.dataset,'dependencyProbeAudio')){
          if(typeof binding.speak==='function')binding.speak(binding.view.prompt,binding.view.language);
          return;
        }

        var target=event&&event.target&&typeof event.target.closest==='function'
          ? event.target.closest('[data-dependency-head-probe-select]')
          : null;
        if(!target)return;

        var choice=selectedChoice(target,binding.view);
        if(!choice)return;

        var observed=binding.learnerEvents.fromDependencyHeadProbeSelect(choice,{
          currentExperienceId:binding.view.experienceId,
          structureId:binding.view.structureId,
          language:binding.view.language,
          dimension:binding.view.dimension,
          targetTokenId:binding.view.targetToken.id
        });

        if(observed)binding.onEvent(observed,target);
      });
      container.__siyayoDependencyHeadProbeClickInstalled=true;
    }

    return true;
  }

  return Object.freeze({render:render,install:install});
});
