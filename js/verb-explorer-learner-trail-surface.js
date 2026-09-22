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

  function stateLabel(state){
    return {
      UNOBSERVED:'UNOBSERVED',
      IN_PROGRESS:'IN PROGRESS',
      CONFIRMED:'CONFIRMED',
      CONSOLIDATED_EVIDENCE:'CONSOLIDATED EVIDENCE'
    }[state]||state||'UNOBSERVED';
  }

  function refresh(options){
    options=options||{};
    var doc=options.document||root.document;
    if(!doc||typeof doc.getElementById!=='function')return false;

    var surface=doc.getElementById('learnerTrailSurface');
    if(!surface)return false;

    var profileSource=options.profileSource||root.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource;
    var skillSource=options.skillSource||root.SIYAYOVerbExplorerCanonicalSkillSource;
    var trailView=options.trailView||root.AdaptiveLearnerTrailView;
    var sequenceView=options.sequenceView||root.AdaptiveLearnerTrailSequence;
    var markerAuthority=options.markerAuthority||root.AdaptiveLearnerProgressMarker;

    if(!profileSource||typeof profileSource.getProfile!=='function')return false;
    if(!skillSource||typeof skillSource.getSkill!=='function')return false;
    if(!trailView||typeof trailView.project!=='function')return false;
    if(!sequenceView||typeof sequenceView.project!=='function')return false;
    if(!markerAuthority||typeof markerAuthority.resolve!=='function')return false;

    var profile=profileSource.getProfile();
    var skill=text(skillSource.getSkill());
    if(!profile||!skill)return false;

    var trail=trailView.project(profile,skill);
    if(!trail)return false;
    var marker=markerAuthority.resolve(trail);
    var sequence=sequenceView.project(trail);
    if(!marker||!sequence)return false;

    var confirmed=Number(marker.confirmedExperiences)||0;
    var contexts=confirmed===1?'1 CONTEXT':confirmed+' CONTEXTS';
    var markerGlyph=glyph(marker.marker);
    var segmentHtml=sequence.segments.map(function(segment){
      return '<span class="learner-trail-segment" data-state="'+escapeHtml(segment.state)+'">'+
        '<b aria-hidden="true">'+escapeHtml(glyph(segment.marker))+'</b>'+
        '<em>'+escapeHtml(segment.experienceId)+'</em>'+
      '</span>';
    }).join('');

    surface.dataset.marker=marker.marker;
    surface.dataset.state=marker.state;
    surface.hidden=false;
    surface.innerHTML=
      '<div class="learner-trail-mark" aria-hidden="true">'+escapeHtml(markerGlyph)+'</div>'+
      '<div class="learner-trail-copy">'+
        '<span class="learner-trail-label">LEARNING TRAIL</span>'+
        '<strong>'+escapeHtml(skill)+'</strong>'+
        '<small>'+escapeHtml(stateLabel(marker.state))+' · '+escapeHtml(contexts)+'</small>'+
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
      Promise.resolve().then(function(){refresh(options);});
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
