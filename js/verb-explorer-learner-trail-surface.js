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
    return {en:{title:'LEARNING TRAIL',context:'CONTEXT',contexts:'CONTEXTS'},es:{title:'RUTA DE APRENDIZAJE',context:'CONTEXTO',contexts:'CONTEXTOS'},pt:{title:'TRILHA DE APRENDIZAGEM',context:'CONTEXTO',contexts:'CONTEXTOS'}}[language]||{title:'LEARNING TRAIL',context:'CONTEXT',contexts:'CONTEXTS'};
  }

  function refresh(options){
    options=options||{};
    var doc=options.document||root.document;
    if(!doc||typeof doc.getElementById!=='function')return false;

    var surface=doc.getElementById('learnerTrailSurface');
    if(!surface)return false;

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
    var profile=profileSource.getProfile();
    var definition=skillSource.getDefinition();
    var skill=text(skillSource.getSkill());
    var label=labelView.project(definition,language);
    if(!profile||!skill||!label||label.skill!==skill)return false;

    var trail=trailView.project(profile,skill);
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

    surface.dataset.marker=marker.marker;
    surface.dataset.state=marker.state;
    surface.hidden=false;
    surface.innerHTML=
      '<div class="learner-trail-mark" aria-hidden="true">'+escapeHtml(markerGlyph)+'</div>'+
      '<div class="learner-trail-copy">'+
        '<span class="learner-trail-label">'+escapeHtml(copy.title)+'</span>'+
        '<strong>'+escapeHtml(label.form)+'</strong>'+
        '<small class="learner-trail-meta">'+escapeHtml(label.family||'')+(label.grammarRole?' · '+escapeHtml(label.grammarRole):'')+'</small>'+
        '<small>'+escapeHtml(stateLabel(marker.state,language))+' · '+escapeHtml(contexts)+'</small>'+
        '<div class="learner-trail-sequence" aria-label="Visited learning experiences">'+segmentHtml+'</div>'+
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
