// Localized interface copy. Canonical circumstance keys and assessment scope stay unchanged.
(function(root){
  'use strict';
  var labels={
    en:{time:'TIME',place:'PLACE',weather:'WEATHER',company:'COMPANY',purpose:'PURPOSE'},
    es:{time:'TIEMPO',place:'LUGAR',weather:'CLIMA',company:'COMPAÑÍA',purpose:'PROPÓSITO'},
    pt:{time:'TEMPO',place:'LUGAR',weather:'CLIMA',company:'COMPANHIA',purpose:'PROPÓSITO'}
  };
  var values={
    tonight:['tonight','esta noche','hoje à noite'],
    supermarket:['supermarket','supermercado','supermercado'],
    'warm-evening':['warm evening','noche cálida','noite quente'],
    together:['together','juntos','juntos'],
    'prepare-a-special-dinner':['prepare a special dinner','preparar una cena especial','preparar um jantar especial'],
    'home-kitchen':['home kitchen','cocina de casa','cozinha de casa'],
    'home-dining-table':['home dining table','mesa de casa','mesa de casa'],
    'enjoy-a-special-dinner':['enjoy a special dinner','disfrutar de una cena especial','apreciar um jantar especial'],
    'after-dinner':['after dinner','después de cenar','depois do jantar'],
    'continue-the-conversation':['continue the conversation','continuar la conversación','continuar a conversa']
  };
  var controls={
    en:{language:'LANGUAGE',thinking:'THINKING MIND',type:'WORD TYPE',tense:'TENSE',mode:'MODE',perspective:'PERSPECTIVE',
      verb:'VERB',noun:'NOUN',adjective:'ADJECTIVE',present:'PRESENT',past:'PAST',future:'FUTURE',
      affirmative:'AFFIRMATIVE',negative:'NEGATIVE',interrogative:'INTERROGATIVE',
      describing:'DESCRIBE',narrating:'NARRATE',debating:'DEBATE',concluding:'CONCLUDE',
      lines:'LINES / POSSIBLE RESPONSES',sequence:'QUESTION · RESPONSE · FOLLOW-UP',next:'NEXT?',candidate:'NEXT CANDIDATE',trailModule:'LEARNING TRAIL & WORD PATH',trailEmpty:'RESERVED AREA · NO LEARNER DATA MOVED'},
    es:{language:'IDIOMA',thinking:'MENTE PENSANTE',type:'TIPO DE PALABRA',tense:'TIEMPO VERBAL',mode:'MODO',perspective:'PERSPECTIVA',
      verb:'VERBO',noun:'SUSTANTIVO',adjective:'ADJETIVO',present:'PRESENTE',past:'PASADO',future:'FUTURO',
      affirmative:'AFIRMATIVO',negative:'NEGATIVO',interrogative:'INTERROGATIVO',
      describing:'DESCRIBIR',narrating:'NARRAR',debating:'DEBATIR',concluding:'CONCLUIR',
      lines:'LÍNEAS / POSIBLES RESPUESTAS',sequence:'PREGUNTA · RESPUESTA · CONTINUACIÓN',next:'¿SIGUIENTE?',candidate:'SIGUIENTE EXPERIENCIA',trailModule:'RUTA DE APRENDIZAJE Y RECORRIDO DE PALABRAS',trailEmpty:'ÁREA RESERVADA · SIN MOVER DATOS DEL ESTUDIANTE'},
    pt:{language:'IDIOMA',thinking:'MENTE PENSANTE',type:'TIPO DE PALAVRA',tense:'TEMPO VERBAL',mode:'MODO',perspective:'PERSPECTIVA',
      verb:'VERBO',noun:'SUBSTANTIVO',adjective:'ADJETIVO',present:'PRESENTE',past:'PASSADO',future:'FUTURO',
      affirmative:'AFIRMATIVO',negative:'NEGATIVO',interrogative:'INTERROGATIVO',
      describing:'DESCREVER',narrating:'NARRAR',debating:'DEBATER',concluding:'CONCLUIR',
      lines:'LINHAS / POSSÍVEIS RESPOSTAS',sequence:'PERGUNTA · RESPOSTA · CONTINUAÇÃO',next:'PRÓXIMA?',candidate:'PRÓXIMA EXPERIÊNCIA',trailModule:'TRILHA DE APRENDIZAGEM E PERCURSO DAS PALAVRAS',trailEmpty:'ÁREA RESERVADA · SEM MOVER DADOS DO ALUNO'}
  };
  function escape(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
  function localize(doc,experience,language){
    var copy=controls[language]||controls.en,index=['en','es','pt'].indexOf(language);
    if(index<0)index=0;
    var icons={time:'🌙',place:'🏠',weather:'☀️',company:'👥',purpose:'🎯'};
    var strip=doc.getElementById('circumstanceStrip');
    if(strip)strip.innerHTML=Object.entries(experience.circumstances||{}).map(function(entry){
      var key=entry[0],value=entry[1],localized=values[value];
      return '<div><span>'+escape((icons[key]||'◆')+' '+((labels[language]||labels.en)[key]||key.toUpperCase()))+
        '</span><strong>'+escape(localized?localized[index]:String(value).replaceAll('-',' '))+'</strong></div>';
    }).join('');
    [['languageGearLabel','🌐 '+copy.language],['thinkingMindLabel','🧠 '+copy.thinking],['wordTypeLabel','⚙ '+copy.type],
      ['tenseGearLabel','⏱ '+copy.tense],['modeGearLabel','◈ '+copy.mode],['perspectiveGearLabel',copy.perspective],
      ['livingLinesLabel',copy.lines],['lineSequenceLabel',copy.sequence],['nextHeading','🌀 '+copy.next],
      ['learningTrailWordPathHeading',copy.trailModule],['learningTrailWordPathEmpty',copy.trailEmpty]].forEach(function(pair){
      var node=doc.getElementById(pair[0]);if(node)node.textContent=pair[1];
    });
    ['wordType','experienceTense','experienceForm','perspective'].forEach(function(axis){
      var attribute=axis.replace(/[A-Z]/g,function(letter){return '-'+letter.toLowerCase();});
      doc.querySelectorAll('[data-'+attribute+']').forEach(function(button){
        var key=button.dataset[axis];if(!copy[key])return;
        var icon=axis==='perspective'?{describing:'🔴 ',narrating:'🟡 ',debating:'🟢 ',concluding:'🔵 '}[key]:'';
        button.textContent=icon+copy[key];
      });
    });
    var next=doc.getElementById('nextExperience');
    if(next){
      var catalog=root.SIYAYOVerbExplorerExperienceNavigation;
      var nextId=experience.toroidalNext&&experience.toroidalNext.nextExperience;
      var destination=catalog&&catalog.getExperience&&catalog.getExperience(nextId);
      next.textContent=copy.candidate+' · '+(destination&&destination.title&&destination.title[language]||nextId||'—');
    }
    if(doc.documentElement)doc.documentElement.lang=language;
    return true;
  }
  root.SIYAYOVerbExplorerPresentationCopy=Object.freeze({localize:localize});
})(typeof globalThis!=='undefined'?globalThis:this);
