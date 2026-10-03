(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDependencyConnectorView=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function esc(value){
    return String(value==null?'':value)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }

  function plan(resolved){
    if(!resolved||resolved.status!=='DEPENDENCY_FOCUS_READY'||!resolved.focus||!Array.isArray(resolved.relations))return null;

    var focusId=text(resolved.focus.id);
    if(!focusId)return null;

    var connectors=[];
    for(var i=0;i<resolved.relations.length;i+=1){
      var relation=resolved.relations[i]||{};
      var from=text(relation.dependent);
      var to=text(relation.head);
      var label=text(relation.relation);
      if(!from||!to||!label)return null;
      connectors.push(Object.freeze({
        from:from,
        to:to,
        label:label
      }));
    }

    return Object.freeze({
      status:'DEPENDENCY_CONNECTORS_READY',
      focusId:focusId,
      connectors:Object.freeze(connectors)
    });
  }

  function draw(input){
    input=input||{};
    var surface=input.surface;
    var resolved=input.resolved;
    if(!surface||typeof surface.querySelector!=='function'||typeof surface.querySelectorAll!=='function')return false;

    var connectorPlan=plan(resolved);
    if(!connectorPlan)return false;

    var overlay=surface.querySelector('[data-dependency-connectors]');
    var stage=surface.querySelector('.dependency-token-stage');
    if(!overlay||!stage||typeof stage.getBoundingClientRect!=='function')return false;

    var stageRect=stage.getBoundingClientRect();
    var width=Math.max(1,Math.round(Number(stageRect.width)||0));
    var height=Math.max(1,Math.round(Number(stageRect.height)||0));
    if(!width||!height)return false;

    var tokens=surface.querySelectorAll('[data-token-id]');
    var byId=Object.create(null);

    for(var i=0;i<tokens.length;i+=1){
      var element=tokens[i];
      var id=text(element&&element.dataset&&element.dataset.tokenId);
      if(id&&typeof element.getBoundingClientRect==='function')byId[id]=element;
    }

    var markup=[
      '<defs>',
      '<marker id="dependencyArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">',
      '<path d="M 0 0 L 8 4 L 0 8 z"></path>',
      '</marker>',
      '</defs>'
    ];

    for(var j=0;j<connectorPlan.connectors.length;j+=1){
      var connector=connectorPlan.connectors[j];
      var fromEl=byId[connector.from];
      var toEl=byId[connector.to];
      if(!fromEl||!toEl)continue;

      var fromRect=fromEl.getBoundingClientRect();
      var toRect=toEl.getBoundingClientRect();

      var x1=(Number(fromRect.left)||0)-(Number(stageRect.left)||0)+(Number(fromRect.width)||0)/2;
      var y1=(Number(fromRect.top)||0)-(Number(stageRect.top)||0);
      var x2=(Number(toRect.left)||0)-(Number(stageRect.left)||0)+(Number(toRect.width)||0)/2;
      var y2=(Number(toRect.top)||0)-(Number(stageRect.top)||0);

      var midX=(x1+x2)/2;
      var distance=Math.abs(x2-x1);
      var lift=28+Math.min(30,distance*0.12);
      var controlY=Math.max(8,Math.min(y1,y2)-lift);
      var labelY=Math.max(10,controlY-5);

      markup.push(
        '<path class="dependency-connector-path" d="M '+x1.toFixed(1)+' '+y1.toFixed(1)+
        ' Q '+midX.toFixed(1)+' '+controlY.toFixed(1)+' '+x2.toFixed(1)+' '+y2.toFixed(1)+
        '" marker-end="url(#dependencyArrow)" data-relation="'+esc(connector.label)+'"></path>'
      );
      markup.push(
        '<text class="dependency-connector-label" x="'+midX.toFixed(1)+'" y="'+labelY.toFixed(1)+
        '" text-anchor="middle">'+esc(connector.label)+'</text>'
      );
    }

    overlay.setAttribute('viewBox','0 0 '+width+' '+height);
    overlay.setAttribute('preserveAspectRatio','none');
    overlay.innerHTML=markup.join('');
    return true;
  }

  return Object.freeze({
    plan:plan,
    draw:draw
  });
});
