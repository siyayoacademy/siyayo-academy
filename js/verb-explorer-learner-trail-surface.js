// Read-only visual surface for the learner's canonical longitudinal Trail.
// It projects evidence into semantic progress markers and never creates score,
// mastery, sound, progression authority, or navigation.
(function(root){
  'use strict';

  var installed=false;

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function escapeHtml(value){
    return String(value==null?'':value)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }

  function glyph(marker){
    return {
      EMPTY_DOT:'○',
      PARTIAL_DOT:'◐',
      FILLED_DOT:'●',
      MILESTONE:'★'
    }[marker]||'○';
  }

  function stateLabel(state,language){
    var labels={en:{UNOBSERVED:'UNOBSERVED',IN_PROGRESS:'IN PROGRESS',CONFIRMED:'CONFIRMED',CONSOLIDATED_EVIDENCE:'CONSOLIDATED EVIDENCE'},es:{UNOBSERVED:'NO OBSERVADO',IN_PROGRESS:'EN PROGRESO',CONFIRMED:'CONFIRMADO',CONSOLIDATED_EVIDENCE:'EVIDENCIA CONSOLIDADA'},pt:{UNOBSERVED:'NÃO OBSERVADO',IN_PROGRESS:'EM PROGRESSO',CONFIRMED:'CONFIRMADO',CONSOLIDATED_EVIDENCE:'EVIDÊNCIA CONSOLIDADA'}};
    return (labels[language]||labels.en)[state]||state||(labels[language]||labels.en).UNOBSERVED;
  }
  function surfaceLabels(language){
    return {en:{title:'LEARNING TRAIL',context:'CONTEXT',contexts:'CONTEXTS',exploring:'EXPLORING',display:'DISPLAY',assessment:'ASSESSMENT'},
      es:{title:'RUTA DE APRENDIZAJE',context:'CONTEXTO',contexts:'CONTEXTOS',exploring:'EXPLORANDO',display:'PANTALLA',assessment:'EVALUACIÓN'},
      pt:{title:'TRILHA DE APRENDIZAGEM',context:'CONTEXTO',contexts:'CONTEXTOS',exploring:'EXPLORANDO',display:'TELA',assessment:'AVALIAÇÃO'}}[language]||
      {title:'LEARNING TRAIL',context:'CONTEXT',contexts:'CONTEXTS',exploring:'EXPLORING',display:'DISPLAY',assessment:'ASSESSMENT'};
  }

  function observationLabel(language){
    return {en:'◐ OBSERVED RESPONSE · the contract checks are counted separately',
      es:'◐ RESPUESTA OBSERVADA · las pruebas del contrato se cuentan por separado',
      pt:'◐ RESPOSTA OBSERVADA · as provas do contrato são contadas separadamente'}[language]||
      '◐ OBSERVED RESPONSE · the contract checks are counted separately';
  }

  function freeDiagnosticRecords(language,learnerId){
    var source=root.SIYAYOVerbExplorerDependencyHeadProbeLive,runtime=root.SIYAYOVerbExplorerExperienceRuntime;
    if(!source||typeof source.getPracticeTrace!=='function'||!runtime||typeof runtime.activeQuestionWord!=='function'||typeof runtime.activeExperienceId!=='function')return [];
    return source.getPracticeTrace().filter(function(record){
      return record.evidenceProduced===false&&record.greenPass===false&&text(record.learnerId)===text(learnerId)&&record.language===language&&record.questionWord===runtime.activeQuestionWord()&&record.experienceId===runtime.activeExperienceId();
    });
  }
  function freeDiagnosticLabel(language){
    return {en:'◐ EXPLORATORY RESPONSE OBSERVED · separate from assessment and Green Pass',es:'◐ RESPUESTA EXPLORATORIA OBSERVADA · separada de la evaluación y del Green Pass',pt:'◐ RESPOSTA EXPLORATÓRIA OBSERVADA · separada da avaliação e do Green Pass'}[language];
  }

  function journeyLabels(language){
    return {
      en:{path:'WORD PATH',visiting:'NOW VISITING',assessment:'ASSESSMENT RECORD',started:'started in',visit:'This visit does not begin a new assessment.',achieved:'achieved result',choice:'WHICH choice evidence accepted',saved:'progress saved',waiting:'not started'},
      es:{path:'RECORRIDO DE PALABRAS',visiting:'VISITANDO AHORA',assessment:'REGISTRO DE EVALUACIÓN',started:'iniciada en',visit:'Esta visita no inicia una nueva evaluación.',achieved:'resultado ya alcanzado',choice:'Evidencia de elección de WHICH aceptada',saved:'progreso guardado',waiting:'aún no iniciada'},
      pt:{path:'PERCURSO DAS PALAVRAS',visiting:'VISITANDO AGORA',assessment:'REGISTRO DA AVALIAÇÃO',started:'iniciada em',visit:'Esta visita não inicia uma nova avaliação.',achieved:'resultado já conquistado',choice:'Evidência de escolha de WHICH aceita',saved:'progresso guardado',waiting:'ainda não iniciada'}
    }[language]||{path:'WORD PATH',visiting:'NOW VISITING',assessment:'ASSESSMENT RECORD',started:'started in',visit:'This visit does not begin a new assessment.',achieved:'achieved result',choice:'WHICH choice evidence accepted',saved:'progress saved',waiting:'not started'};
  }

  function journeyHtml(profile,skill,trailView,markerAuthority,progress,snapshot,liveState,doc,language,assessmentLanguage,visualQWord){
    var labels=journeyLabels(language);
    var known=[
      {id:'which.use.determiner',word:'WHICH'},
      {id:'what.use.object-question',word:'WHAT'},
      {id:'why.use.contextual-reason',word:'WHY'},
      {id:'where.use.location-question',word:'WHERE'}
    ];
    var cards=known.map(function(item){
      var history=trailView.project(profile,item.id,root.AdaptiveAssessmentScope?{language:assessmentLanguage}:null);
      var past=history&&markerAuthority.resolve(history);
      var confirmed=past&&(past.state==='CONFIRMED'||past.state==='CONSOLIDATED_EVIDENCE');
      var current=item.id===skill&&(!root.AdaptiveAssessmentScope||snapshot&&snapshot.session&&snapshot.session.decision.assessmentScope&&snapshot.session.decision.assessmentScope.language===assessmentLanguage);
      var selection=root.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
      var saved=!current&&selection&&typeof selection.getRetainedProgress==='function'
        ?selection.getRetainedProgress(item.id,assessmentLanguage):[];
      var explored=visualQWord&&visualQWord===item.word.toLowerCase();
      var state=explored?(current?'active':'exploring'):confirmed?'confirmed':current?(visualQWord?'saved':'active'):saved.length?'saved':'waiting';
      var symbol=confirmed?'●':(current&&(past&&past.state==='IN_PROGRESS'||progress&&progress.completed>0)||saved.some(function(record){return record.progress.completed>0;}))?'◐':'○';
      var description=confirmed?stateLabel('CONFIRMED',language):
        current&&progress?progress.completed+'/'+progress.total+(visualQWord&&!explored?' · '+labels.saved:''):saved.length?saved.map(function(record){
          return record.progress.completed+'/'+record.progress.total+' · '+labels.saved+' · '+record.originExperienceId;
        }).join(' / '):labels.waiting;
      return '<span class="learner-journey-word" data-state="'+state+'">'+
        '<b aria-hidden="true">'+symbol+'</b><strong>'+item.word+'</strong><small>'+escapeHtml(description)+'</small></span>';
    }).join('');
    var origin=text(snapshot&&snapshot.session&&snapshot.session.decision&&snapshot.session.decision.experienceId);
    var destination=text(liveState.currentExperienceId);
    var currentWord=known.find(function(item){return item.id===skill;});
    var currentTitle=doc.getElementById('experienceTitle');
    var visitName=text(currentTitle&&currentTitle.textContent)||destination;
    var prior=origin&&destination&&origin!==destination;
    var achieved=progress&&progress.completed===3&&progress.total===3;
    var sameLanguage=!root.AdaptiveAssessmentScope||snapshot&&snapshot.session&&snapshot.session.decision.assessmentScope&&snapshot.session.decision.assessmentScope.language===assessmentLanguage;
    var context=prior&&sameLanguage?
      '<p><b>'+escapeHtml(labels.visiting)+'</b> · '+escapeHtml(visitName)+
      ' <span>'+escapeHtml(labels.visit)+'</span></p>'+
      '<p><b>'+escapeHtml(labels.assessment)+'</b> · '+escapeHtml(currentWord?currentWord.word:skill)+
      (achieved?' · 3/3 · '+escapeHtml(labels.achieved):'')+
      ' · '+escapeHtml(labels.started)+' '+escapeHtml(origin)+'</p>':'';
    var which=trailView.project(profile,'which.use.determiner',root.AdaptiveAssessmentScope?{language:assessmentLanguage}:null);
    var whichMarker=which&&markerAuthority.resolve(which);
    var choiceAccepted=(skill==='which.use.determiner'&&progress&&progress.satisfied[0])||
      (whichMarker&&(whichMarker.state==='CONFIRMED'||whichMarker.state==='CONSOLIDATED_EVIDENCE'));
    return '<div class="learner-journey" aria-label="'+escapeHtml(labels.path)+'">'+
      '<b class="learner-journey-title">'+escapeHtml(labels.path)+'</b>'+
      '<div class="learner-journey-words">'+cards+'</div>'+
      (choiceAccepted?'<small class="learner-journey-choice">✓ '+escapeHtml(labels.choice)+'</small>':'')+
      context+'</div>';
  }

  function refresh(options){
    options=options||{};
    var doc=options.document||root.document;
    if(!doc||typeof doc.getElementById!=='function')return false;

    var surface=doc.getElementById('learnerTrailSurface');
    if(!surface)return false;
    surface.hidden=true;surface.innerHTML='';
    var identity=root.SIYAYOVerbExplorerLearnerIdentitySource;
    var learnerId=identity&&typeof identity.getId==='function'?identity.getId():null;

    var profileSource=options.profileSource||root.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource;
    var skillSource=options.skillSource||root.SIYAYOVerbExplorerCanonicalSkillSource;
    var labelView=options.labelView||root.AdaptiveLearnerTrailLabel;
    var trailView=options.trailView||root.AdaptiveLearnerTrailView;
    var sequenceView=options.sequenceView||root.AdaptiveLearnerTrailSequence;
    var positionView=options.positionView||root.AdaptiveLearnerTrailPosition;
    var markerAuthority=options.markerAuthority||root.AdaptiveLearnerProgressMarker;
    var stateBridge=options.stateBridge||root.SIYAYOVerbExplorerAdaptiveStateBridge;

    if(!profileSource||typeof profileSource.getProfile!=='function')return false;
    if(!skillSource||typeof skillSource.getSkill!=='function'||typeof skillSource.getDefinition!=='function')return false;
    if(!labelView||typeof labelView.project!=='function')return false;
    if(!trailView||typeof trailView.project!=='function')return false;
    if(!sequenceView||typeof sequenceView.project!=='function')return false;
    if(!positionView||typeof positionView.resolve!=='function')return false;
    if(!markerAuthority||typeof markerAuthority.resolve!=='function')return false;
    if(!stateBridge||typeof stateBridge.getState!=='function')return false;

    var experienceRuntime=root.SIYAYOVerbExplorerExperienceRuntime;
    var liveLanguage=experienceRuntime&&typeof experienceRuntime.activeLanguage==='function'?experienceRuntime.activeLanguage():'';
    var language=text(options.language)||text(liveLanguage)||'en';
    var copy=surfaceLabels(language);
    delete surface.dataset.observationState;
    delete surface.dataset.assessmentSkill;delete surface.dataset.assessmentLanguage;
    delete surface.dataset.currentQword;delete surface.dataset.displayLanguage;
    var observations=freeDiagnosticRecords(language,learnerId);
    var observationHtml=observations.length?'<small class="learner-trail-observation" data-observation-kind="free-diagnostic">'+escapeHtml(freeDiagnosticLabel(language))+'</small>':'';
    function observationOnly(){
      if(!observations.length)return false;
      var latest=observations[observations.length-1];
      surface.dataset.marker='EMPTY_DOT';surface.dataset.state='UNOBSERVED';surface.dataset.observationState='OBSERVED';surface.hidden=false;
      surface.innerHTML='<div class="learner-trail-copy"><span class="learner-trail-label">'+escapeHtml(copy.title)+'</span><strong>'+escapeHtml(latest.questionWordLabel)+'</strong>'+observationHtml+'</div>';
      return true;
    }
    var profile=profileSource.getProfile();
    var definition=skillSource.getDefinition();
    var skill=text(skillSource.getSkill());
    var coordinator=options.coordinator||root.SIYAYOVerbExplorerAdaptiveCoordinator;
    var snapshot=coordinator&&typeof coordinator.snapshot==='function'?coordinator.snapshot():null;
    var decision=snapshot&&snapshot.session&&snapshot.session.decision;
    var assessmentLanguage=root.AdaptiveAssessmentScope&&decision&&decision.assessmentScope
      ?text(decision.assessmentScope.language):language;
    if(!['en','es','pt'].includes(assessmentLanguage))assessmentLanguage=language;
    var label=labelView.project(definition,assessmentLanguage);
    if(!profile||!skill||!label||label.skill!==skill)return observationOnly();
    if(identity&&(!learnerId||profile.id!==learnerId))return observationOnly();

    var trail=trailView.project(profile,skill,root.AdaptiveAssessmentScope?{language:assessmentLanguage}:null);
    if(!trail)return false;
    var marker=markerAuthority.resolve(trail);
    var sequence=sequenceView.project(trail);
    var liveState=stateBridge.getState();
    if(!marker||!sequence||!liveState)return false;
    var position=positionView.resolve(sequence,liveState.currentExperienceId);
    if(!position)return false;

    var confirmed=Number(marker.confirmedExperiences)||0;
    var contexts=confirmed===1?'1 '+copy.context:confirmed+' '+copy.contexts;
    var markerGlyph=glyph(marker.marker);
    // The three small marks show accepted contract evidence; the large marker
    // remains under canonical longitudinal Green Pass closure authority.
    var progressView=options.progressView||root.AdaptivePassContractProgressView;
    var evaluator=options.contractEvaluator||root.GreenPassProfile;
    var progress=snapshot&&decision&&
      decision.skill===skill&&(!root.AdaptiveAssessmentScope||decision.assessmentScope&&decision.assessmentScope.language===assessmentLanguage)&&progressView&&typeof progressView.project==='function'
      ?progressView.project(snapshot.context&&snapshot.context.passContract,
        snapshot.context&&snapshot.context.evidencePackets,evaluator):null;
    var evidenceLabel={en:'CONTRACT EVIDENCE',es:'EVIDENCIA DEL CONTRATO',pt:'EVIDÊNCIA DO CONTRATO'}[language]||'CONTRACT EVIDENCE';
    var progressHtml=progress?'<small class="learner-trail-contract-progress" aria-label="'+
      escapeHtml(evidenceLabel+': '+progress.completed+' / '+progress.total)+
      '">'+escapeHtml(evidenceLabel+' · ')+
      progress.satisfied.map(function(done,index){
        var requirement=snapshot.context.passContract.requires[index]||{};
        var labels={
          en:{choice:'CHOICE',use:'USE',transfer:'TRANSFER',spatial:'FUNCTION'},
          es:{choice:'ELECCIÓN',use:'USO',transfer:'TRANSFERENCIA',spatial:'FUNCIÓN'},
          pt:{choice:'ESCOLHA',use:'USO',transfer:'TRANSFERÊNCIA',spatial:'FUNÇÃO'}
        }[language]||{choice:'CHOICE',use:'USE',transfer:'TRANSFER'};
        var key=requirement.mode==='transfer'?'transfer':
          requirement.dimension==='spatial-function'?'spatial':requirement.dimension==='choice-function'?'choice':'use';
        return escapeHtml(labels[key]+' '+(done?'●':'○'));
      }).join(' · ')+
      ' · '+escapeHtml(progress.completed+'/'+progress.total)+'</small>':'';
    // A fresh Session has its own empty contract; confirmed earlier stages remain in the Trail.
    var previousConfirmed=sequence.segments.some(function(segment){
      return segment.state==='CONFIRMED'&&segment.experienceId!==liveState.currentExperienceId;
    });
    var freshStage=!!(previousConfirmed&&progress&&progress.completed===0&&progress.total===3&&
      snapshot.session.decision.experienceId===liveState.currentExperienceId);
    var freshStageLabel={
      en:'S1 ● completed → S2 ◐ visited · new assessment ○ 0/3',
      es:'S1 ● completada → S2 ◐ visitada · nueva evaluación ○ 0/3',
      pt:'S1 ● concluída → S2 ◐ visitada · nova avaliação ○ 0/3'
    }[language]||'S1 ● completed → S2 ○ new assessment · 0/3';
    var segmentHtml=sequence.segments.map(function(segment,index){
      var current=index===position.segmentIndex;
      return '<span class="learner-trail-segment" data-state="'+escapeHtml(segment.state)+'"'+
        (current?' data-current="true" aria-current="step"':'')+'>'+
        '<b aria-hidden="true">'+escapeHtml(glyph(segment.marker))+'</b>'+
        '<em>'+escapeHtml(segment.experienceId)+'</em>'+
      '</span>';
    }).join('');

    if(position.visited===false){
      segmentHtml+='<span class="learner-trail-segment learner-trail-current-unvisited" data-current="true" aria-current="step">'+
        '<b aria-hidden="true">◌</b>'+
        '<em>'+escapeHtml(position.currentExperienceId)+'</em>'+
      '</span>';
    }

    // A visual invitation is derived from canonical contract progress; NEXT stays learner-owned.
    var next=doc.getElementById('nextExperience');
    var nextCard=next&&typeof next.closest==='function'?next.closest('.toroidal-next'):null;
    if(nextCard){
      var ready=!!(progress&&progress.completed===2&&progress.total===3&&
        progress.satisfied[0]&&progress.satisfied[1]&&!progress.satisfied[2]&&
        snapshot.session.decision.experienceId===liveState.currentExperienceId&&
        text(next&&next.dataset&&next.dataset.nextExperience));
      nextCard.classList.toggle('next-transfer-invitation',ready);
      nextCard.style.boxShadow=ready?'0 0 0 2px #e3b856, 0 0 24px rgba(227,184,86,.45)':'';
      var hint=doc.getElementById('nextTransferInvitation');
      if(ready){
        if(!hint){hint=doc.createElement('p');hint.id='nextTransferInvitation';nextCard.appendChild(hint);}
        hint.textContent={en:'TRANSFER READY · Visit the next Experience to answer the final question.',es:'TRANSFERENCIA PENDIENTE · Visita la siguiente experiencia para responder la última pregunta.',pt:'TRANSFERÊNCIA PENDENTE · Visite a próxima experiência para responder à última pergunta.'}[language]||'TRANSFER READY · Visit the next Experience to answer the final question.';
        hint.style.color='#f6cf73';
      }else if(hint){hint.remove();}
    }

    var visualQWord=experienceRuntime&&typeof experienceRuntime.activeQuestionWord==='function'?text(experienceRuntime.activeQuestionWord()):'';
    var assessmentQWord=skill.split('.')[0]||'';
    var exploring=!!(visualQWord&&assessmentQWord&&visualQWord!==assessmentQWord);
    var catalog=root.SIYAYOVerbExplorerExperienceNavigation;
    var experience=catalog&&typeof catalog.getExperience==='function'?catalog.getExperience(liveState.currentExperienceId):null;
    var question=experience&&(experience.thinkingMind||[]).find(function(item){return item.questionWord===visualQWord;});
    var displayLabel=labelView.project(definition,language)||label;
    var visibleForm=text(question&&question.questionWordLabel&&question.questionWordLabel[language])||
      (exploring?visualQWord.toUpperCase():displayLabel.form);
    var scopeNotice='';
    if((visualQWord&&assessmentQWord&&visualQWord!==assessmentQWord)||assessmentLanguage!==language){
      var pieces=[];
      if(visualQWord&&assessmentQWord&&visualQWord!==assessmentQWord)
        pieces.push(copy.exploring+' '+visualQWord.toUpperCase()+' · '+copy.assessment+' '+assessmentQWord.toUpperCase());
      if(assessmentLanguage!==language)
        pieces.push(copy.display+' '+language.toUpperCase()+' · '+copy.assessment+' '+assessmentLanguage.toUpperCase());
      scopeNotice='<small class="learner-trail-scope-notice">'+escapeHtml(pieces.join(' · '))+'</small>';
    }

    var assessmentHtml=
      '<small class="learner-trail-meta">'+escapeHtml((exploring?label:displayLabel).family||'')+
        ((exploring?label:displayLabel).grammarRole?' · '+escapeHtml((exploring?label:displayLabel).grammarRole):'')+'</small>'+
      '<small>'+(exploring?escapeHtml(markerGlyph)+' ':'')+
        escapeHtml(marker.state==='UNOBSERVED'&&observations.length?({en:'ASSESSMENT NOT YET OBSERVED',es:'EVALUACIÓN AÚN NO OBSERVADA',pt:'AVALIAÇÃO AINDA NÃO OBSERVADA'}[language]):stateLabel(marker.state,language))+' · '+escapeHtml(contexts)+'</small>'+
      (marker.state==='IN_PROGRESS'?'<small class="learner-trail-observation">'+escapeHtml(observationLabel(language))+'</small>':'')+
      (freshStage?'<small class="learner-trail-new-stage">'+escapeHtml(freshStageLabel)+'</small>':'')+
      (trail.counts.legacyFootprints?'<small class="learner-trail-legacy">'+escapeHtml(({en:'HISTORICAL RECORDS',es:'REGISTROS ANTERIORES',pt:'REGISTROS ANTERIORES'}[language]||'HISTORICAL RECORDS')+' · '+trail.counts.legacyFootprints)+'</small>':'')+
      progressHtml+
      '<div class="learner-trail-sequence" aria-label="Visited learning experiences">'+segmentHtml+'</div>';
    var freeCopy={en:'FREE EXPLORATION · no assessment active for this selection',
      es:'EXPLORACIÓN LIBRE · sin evaluación activa para esta selección',
      pt:'EXPLORAÇÃO LIVRE · sem avaliação ativa para esta seleção'}[language]||'FREE EXPLORATION';
    var savedCopy={en:'SAVED ASSESSMENT',es:'EVALUACIÓN GUARDADA',pt:'AVALIAÇÃO PRESERVADA'}[language]||'SAVED ASSESSMENT';
    if(exploring)assessmentHtml=
      '<section class="learner-trail-assessment-record" data-assessment-qword="'+escapeHtml(assessmentQWord)+'">'+
        '<span class="learner-trail-label">'+escapeHtml(savedCopy+' · '+assessmentLanguage.toUpperCase())+'</span>'+
        '<strong>'+escapeHtml(label.form)+'</strong>'+assessmentHtml+'</section>';

    if(observations.length)surface.dataset.observationState='OBSERVED';
    surface.dataset.marker=exploring?'EMPTY_DOT':marker.marker;
    surface.dataset.state=exploring?'EXPLORING':marker.state;
    surface.dataset.currentQword=visualQWord||assessmentQWord;
    surface.dataset.displayLanguage=language;
    surface.dataset.assessmentSkill=skill;
    surface.dataset.assessmentLanguage=assessmentLanguage;
    surface.hidden=false;
    surface.innerHTML=
      '<div class="learner-trail-mark" aria-hidden="true">'+escapeHtml(exploring?'◌':markerGlyph)+'</div>'+
      '<div class="learner-trail-copy">'+
        '<span class="learner-trail-label">'+escapeHtml(copy.title)+'</span>'+
        '<strong class="learner-trail-current-word">'+escapeHtml(visibleForm)+'</strong>'+
        (exploring?'<small class="learner-trail-exploration">'+escapeHtml(freeCopy)+'</small>':'')+
        scopeNotice+
        observationHtml+
        assessmentHtml+
        journeyHtml(profile,skill,trailView,markerAuthority,progress,snapshot,liveState,doc,language,assessmentLanguage,visualQWord)+
      '</div>';

    return true;
  }

  function install(options){
    options=options||{};
    if(installed)return false;
    var doc=options.document||root.document;
    if(!doc||typeof doc.addEventListener!=='function')return false;

    doc.addEventListener('click',function(){
      Promise.resolve().then(function(){
        var nextOptions=Object.assign({},options);
        delete nextOptions.language;
        refresh(nextOptions);
      });
    });

    refresh(options);
    installed=true;
    return true;
  }

  root.SIYAYOVerbExplorerLearnerTrailSurface=Object.freeze({
    refresh:refresh,
    install:install
  });
})(typeof globalThis!=='undefined'?globalThis:this);
