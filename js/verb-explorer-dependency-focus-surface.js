// Read-only visual projection of canonical dependency focus.
// It renders only relations already present in the dependency structure.
(function(root){
  'use strict';

  var activeRender=null;
  var observedStage=null;
  var resizeObserver=null;
  var listenersInstalled=false;
  var refreshPending=false;

  function refresh(){
    var current=activeRender;
    if(!current||current.surface.hidden||current.surface.isConnected===false)return false;
    var stage=current.surface.querySelector('.dependency-token-stage');
    if(!stage)return false;
    var rect=stage.getBoundingClientRect();
    if(!(rect.width>0&&rect.height>0))return false;
    var result=current.connectorView.draw({surface:current.surface,resolved:current.resolved});
    var scroll=current.surface.querySelector('.dependency-diagram-scroll');
    var hint=current.surface.querySelector('.dependency-scroll-hint');
    if(scroll&&hint)hint.hidden=scroll.scrollWidth<=scroll.clientWidth+1;
    return result;
  }

  function scheduleRefresh(){
    if(refreshPending)return;
    if(typeof root.requestAnimationFrame!=='function'){refresh();return;}
    refreshPending=true;
    root.requestAnimationFrame(function(){refreshPending=false;refresh();});
  }

  function watchLayout(surface,doc){
    var stage=surface.querySelector('.dependency-token-stage');
    if(stage&&typeof root.ResizeObserver==='function'){
      if(!resizeObserver)resizeObserver=new root.ResizeObserver(scheduleRefresh);
      if(stage!==observedStage){
        resizeObserver.disconnect();
        resizeObserver.observe(stage);
        observedStage=stage;
      }
    }
    if(listenersInstalled)return;
    if(typeof root.addEventListener==='function'){
      root.addEventListener('resize',scheduleRefresh);
      root.addEventListener('siyayo:responsive-preview-changed',scheduleRefresh);
    }
    if(doc.fonts){
      if(doc.fonts.ready&&typeof doc.fonts.ready.then==='function')doc.fonts.ready.then(scheduleRefresh);
      if(typeof doc.fonts.addEventListener==='function')doc.fonts.addEventListener('loadingdone',scheduleRefresh);
    }
    listenersInstalled=true;
  }

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
        '<small>'+escapeHtml(({en:'Canonical reference example',es:'Ejemplo canónico de referencia',pt:'Exemplo canônico de referência'})[language])+' · '+escapeHtml(structure.sentence||'')+'</small>'+
        '<strong>'+escapeHtml(resolved.focus.form)+' / '+escapeHtml(focusType)+'</strong>'+
        (focusRole?'<small class="dependency-focus-role">'+escapeHtml(focusRole)+'</small>':'')+
      '</div>'+
      '<div class="dependency-diagram-scroll" tabindex="0" role="region" aria-label="'+escapeHtml(({en:'Dependency diagram',es:'Diagrama de relaciones',pt:'Diagrama de relações'})[language])+'">'+
      '<div class="dependency-token-stage">'+
        '<svg class="dependency-connector-overlay" data-dependency-connectors aria-hidden="true"></svg>'+
        '<div class="dependency-token-row" aria-label="Canonical dependency focus">'+tokenHtml+'</div>'+
      '</div></div>'+
      '<small class="dependency-scroll-hint" hidden>'+escapeHtml(({en:'Scroll sideways to see the complete sentence.',es:'Desliza hacia los lados para ver la frase completa.',pt:'Deslize para os lados para ver a frase completa.'})[language])+'</small>';

    activeRender={surface:surface,resolved:resolved,connectorView:connectorView};
    watchLayout(surface,doc);
    var result=refresh();
    scheduleRefresh();
    return result;
  }

  root.SIYAYOVerbExplorerDependencyFocusSurface=Object.freeze({
    render:render,
    refresh:refresh
  });
})(typeof globalThis!=='undefined'?globalThis:this);
