// Read-only visual projection of canonical dependency focus.
// It renders only relations already present in the dependency structure.
(function(root){
  'use strict';

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

  function render(options){
    options=options||{};
    var doc=options.document||root.document;
    if(!doc||typeof doc.getElementById!=='function')return false;

    var surface=doc.getElementById('dependencyFocusSurface');
    if(!surface)return false;

    var structure=options.structure;
    var focusId=text(options.focusId);
    var language=text(options.language)||'en';
    if(!/^(en|es|pt)$/.test(language))language='en';
    var focusView=options.focusView||root.AdaptiveDependencyFocusView;
    var connectorView=options.connectorView||root.AdaptiveDependencyConnectorView;
    if(!structure||!focusId||!focusView||typeof focusView.resolve!=='function')return false;
    if(!connectorView||typeof connectorView.draw!=='function')return false;

    var resolved=focusView.resolve(structure,focusId);
    if(!resolved)return false;

    var dependentIds=new Set((resolved.dependents||[]).map(function(item){return item.id;}));
    var headId=resolved.head&&resolved.head.id||null;

    var relationByToken=Object.create(null);
    (resolved.relations||[]).forEach(function(relation){
      if(relation.head===focusId)relationByToken[relation.dependent]=relation.relation;
      if(relation.dependent===focusId)relationByToken[relation.head]=relation.relation;
    });

    var tokenHtml=(structure.tokens||[]).map(function(token){
      var id=text(token&&token.id);
      var role='neutral';
      if(id===focusId)role='focus';
      else if(headId&&id===headId)role='head';
      else if(dependentIds.has(id))role='dependent';

      var relation=relationByToken[id]||'';
      return '<span class="dependency-token dependency-token-'+escapeHtml(role)+'"'+
        ' data-token-id="'+escapeHtml(id)+'" data-dependency-token="'+escapeHtml(id)+'" data-role="'+escapeHtml(role)+'" tabindex="0">'+
          '<b>'+escapeHtml(token&&token.form||id)+'</b>'+
          '<small>'+escapeHtml(token&&token.pedagogy&&token.pedagogy.wordType&&text(token.pedagogy.wordType[language])||token&&token.wordClass||'')+'</small>'+
          (relation?'<em>'+escapeHtml(relation)+'</em>':'')+
        '</span>';
    }).join('');

    var focusPedagogy=resolved.focus&&resolved.focus.pedagogy||null;
    var focusType=focusPedagogy&&focusPedagogy.wordType&&text(focusPedagogy.wordType[language])||text(resolved.focus.wordClass);
    var focusRole=focusPedagogy&&focusPedagogy.role&&text(focusPedagogy.role[language])||'';

    surface.dataset.focusToken=focusId;
    surface.dataset.language=language;
    surface.hidden=false;
    surface.innerHTML=
      '<div class="dependency-focus-heading">'+
        '<span>DEPENDENCY FOCUS</span>'+
        '<strong>'+escapeHtml(resolved.focus.form)+' / '+escapeHtml(focusType)+'</strong>'+
        (focusRole?'<small class="dependency-focus-role">'+escapeHtml(focusRole)+'</small>':'')+
      '</div>'+
      '<div class="dependency-token-stage">'+
        '<svg class="dependency-connector-overlay" data-dependency-connectors aria-hidden="true"></svg>'+
        '<div class="dependency-token-row" aria-label="Canonical dependency focus">'+tokenHtml+'</div>'+
      '</div>';

    return connectorView.draw({
      surface:surface,
      resolved:resolved
    });
  }

  root.SIYAYOVerbExplorerDependencyFocusSurface=Object.freeze({
    render:render
  });
})(typeof globalThis!=='undefined'?globalThis:this);
