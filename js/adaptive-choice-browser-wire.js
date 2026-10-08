// Browser-only interaction boundary for an already-authorized adaptive Choice presentation.
// One physical data-choice-select click may create one canonical LearnerEvent.
// This module does not create Attempt, evaluate evidence, submit to Coordinator/Cycle,
// grant Green Pass, authorize progression, or mutate Session state.
(function(root,factory){
  var api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.SIYAYOAdaptiveChoiceBrowserWire=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function validPresentation(view){
    if(!view||typeof view!=='object')return false;
    if(!text(view.skill)||!text(view.experienceId)||!text(view.questionWord)||!text(view.intention))return false;
    if(!view.question||typeof view.question!=='object')return false;
    if(!Array.isArray(view.alternatives)||view.alternatives.length<1)return false;

    var seen=Object.create(null);
    return view.alternatives.every(function(item){
      var id=text(item&&item.id);
      var response=item&&item.response;
      if(!id||seen[id]||!response||typeof response!=='object')return false;
      seen[id]=true;
      return ['en','es','pt'].some(function(language){
        return !!text(response[language]);
      });
    });
  }

  function selectedChoice(target,view){
    if(!target||!target.dataset||!validPresentation(view))return null;
    var choice=text(target.dataset.choiceSelect);
    if(!choice)return null;
    return view.alternatives.some(function(item){
      return item.id===choice;
    })?choice:null;
  }

  function questionText(view){
    if(!view||!view.question)return null;
    return text(view.question.en)||text(view.question.es)||text(view.question.pt)||null;
  }

  function install(view,options){
    options=options||{};
    var doc=options.document||(typeof document!=='undefined'?document:null);
    var learnerEvents=options.learnerEvents||root.SIYAYOVerbExplorerLearnerEvent;
    var onEvent=options.onEvent;

    if(!validPresentation(view))return false;
    if(!doc||typeof doc.addEventListener!=='function')return false;
    if(!learnerEvents||typeof learnerEvents.fromChoiceSelect!=='function')return false;
    if(typeof onEvent!=='function')return false;

    doc.__siyayoAdaptiveChoiceBinding={
      view:view,
      learnerEvents:learnerEvents,
      onEvent:onEvent
    };

    if(doc.__siyayoAdaptiveChoiceClickInstalled!==true){
      doc.addEventListener('click',function(event){
        var binding=doc.__siyayoAdaptiveChoiceBinding;
        if(!binding)return;

        var target=event&&event.target&&typeof event.target.closest==='function'
          ? event.target.closest('[data-choice-select]')
          : null;
        if(!target)return;

        var choice=selectedChoice(target,binding.view);
        if(!choice)return;

        var observed=binding.learnerEvents.fromChoiceSelect(choice,{
          currentExperienceId:binding.view.experienceId,
          experienceQuestion:questionText(binding.view),
          experiencePerspective:null,
          experienceWordType:'verb'
        });

        if(observed)binding.onEvent(observed,target);
      });

      doc.__siyayoAdaptiveChoiceClickInstalled=true;
    }

    return true;
  }

  return Object.freeze({
    install:install
  });
});
