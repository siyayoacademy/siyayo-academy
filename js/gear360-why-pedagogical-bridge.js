(function(root){
'use strict';
// Presentation-only GEAR/WHY surface. Does not call learner, evaluator, PATITA or Green Pass.
var epoch=0;
function render(input){
  var doc=input&&input.document,exp=input&&input.experience,lang=input&&input.language,word=input&&input.questionWord;
  if(!doc||!exp)return;
  var view=doc.getElementById('experienceView');
  if(!view)return;
  var host=doc.getElementById('gear360WhyStudy');
  if(!host){
    host=doc.createElement('section');host.id='gear360WhyStudy';
    host.className='concept-panel';host.setAttribute('aria-label','WHY pedagogical study');
    view.appendChild(host);
  }
  var current=++epoch;host.replaceChildren();host.hidden=word!=='why';
  if(host.hidden||!['en','es','pt'].includes(lang))return;
  var slug={shopping:'shopping',preparing:'preparing','having-dinner':'having','after-dinner-conversation':'after-dinner'}[exp.id];
  if(!slug)return;
  var h=doc.createElement('h3');h.textContent={en:'WHY · CONTEXTUAL STUDY',es:'POR QUÉ · ESTUDIO CONTEXTUAL',pt:'POR QUÊ · ESTUDO CONTEXTUAL'}[lang];host.appendChild(h);
  fetch('data/learning/dependencies/'+slug+'-why-'+lang+'.json').then(function(response){
    if(!response.ok)throw new Error('Corpus unavailable');
    return response.json();
  }).then(function(corpus){
    if(current!==epoch||host.hidden)return;
    var p=doc.createElement('p');p.className='why-probe-question-text';p.textContent=corpus.sentence||'';host.appendChild(p);
    var body=doc.createElement('div');body.className='gear360-why-words';
    (corpus.tokens||[]).forEach(function(token){
      var span=doc.createElement('span');span.className='gear360-why-token';
      var strong=doc.createElement('strong');strong.textContent=token.form||'';
      var label=doc.createElement('small');label.textContent=token.pedagogy?.wordType?.[lang]||token.wordClass||'';
      span.appendChild(strong);span.appendChild(label);body.appendChild(span);
    });host.appendChild(body);
    var notice=doc.createElement('p');notice.textContent={en:'Free study · no evaluation required',es:'Estudio libre · sin evaluación obligatoria',pt:'Estudo livre · sem avaliação obrigatória'}[lang];host.appendChild(notice);
  }).catch(function(){if(current!==epoch)return;var notice=doc.createElement('p');notice.textContent={en:'Study corpus unavailable',es:'Corpus de estudio no disponible',pt:'Corpus de estudo indisponível'}[lang];host.appendChild(notice);});
}
root.SIYAYOGear360WhyPedagogicalBridge=Object.freeze({render:render});
})(typeof globalThis!=='undefined'?globalThis:this);
