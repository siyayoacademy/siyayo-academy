(function(root){'use strict';
if(!root.document||!root.SIYAYOH1413SpecializedMirror||!root.SIYAYOH1418FunctionWindow)return;
const $=id=>document.getElementById(id);
const urls=['../../data/learning/experience-seeds.json','../../data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json','../../data/learning/references/master-vip-verb-functions-v0.1.json','../../data/learning/references/jaguar-h14-9-semantic-80-review-v0.1.json'];
const locales={en:'en-US',es:'es-ES',pt:'pt-BR'};
const controls=['experience','language','tense','mode','perspective','questionWord'];
let sources=null,selectedFunction='movement',spoken='',selectionByExperience=new Map();
function qs(){const exp=sources?.experiences.find(x=>x.id===$('experience').value);if(!exp)return;const prev=$('questionWord').value;$('questionWord').replaceChildren(new Option('None',''),...exp.thinkingMind.map(q=>new Option(q.questionWord.toUpperCase(),q.questionWord)));if([...$('questionWord').options].some(o=>o.value===prev))$('questionWord').value=prev;}
function speechAvailable(){return typeof root.SpeechSynthesisUtterance==='function'&&!!root.speechSynthesis&&typeof root.speechSynthesis.speak==='function'}
function stopAudio(){if(root.speechSynthesis&&typeof root.speechSynthesis.cancel==='function')root.speechSynthesis.cancel();$('func13Speak').classList.remove('is-speaking')}
function render(){if(!sources)return;stopAudio();
 const input={experienceId:$('experience').value,language:$('language').value,tense:$('tense').value,mode:$('mode').value,perspective:$('perspective').value||null,questionWord:$('questionWord').value||null,functionId:selectedFunction,period:null,periodSource:'UNAVAILABLE_IN_CURRENT_GEAR_STACK'};
 const view=root.SIYAYOH1418FunctionWindow.inspect({selection:input,sources});document.querySelectorAll('[data-function]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.function===selectedFunction)));
 if(!view){spoken='';$('func13SpeechText').textContent='Referência contextual indisponível; nenhuma frase gerada.';$('func13Speak').disabled=true;$('func13Status').textContent='LACUNA · nenhum conteúdo sintético ou crédito';return;}
 const lang=input.language,txt=view.function.adaptedExample;
 spoken=typeof txt==='string'&&txt.trim()?txt:'';
 $('func13SpeechText').textContent=spoken||({en:'No authored function sentence for the selected TENSE/MODE.',es:'No hay frase autorada para el TENSE/MODE seleccionado.',pt:'Não há frase autorada para o TENSE/MODE selecionado.'})[lang];
 $('func13SpeechText').lang=locales[lang];$('speechSource').textContent=spoken?'SIYAYO ADAPTATION · PENDING HOMOLOGATION':'AUTHORING GAP · NO SPEECH';
 $('func13Speak').disabled=!spoken||!speechAvailable();
 $('func13Speak').setAttribute('aria-label',({en:'Hear sentence in English',es:'Escuchar frase en español',pt:'Ouvir frase em português'})[lang]);
 $('func13Speak').title=$('func13Speak').getAttribute('aria-label');
 $('functionPattern').textContent=view.function.masterPattern;
 $('functionOriginal').textContent=view.function.masterExample||({en:'Master source example unavailable in this language.',es:'Ejemplo original no indexado en este idioma.',pt:'Exemplo original não indexado neste idioma.'})[lang];
 $('functionAdaptation').textContent=spoken||'NOT AUTHORED for selected grammar';
 $('contextDescription').textContent=view.context.experienceTitle+' · '+view.context.perspective.toUpperCase()+(view.perspectiveFallbackDisplayOnly?' · DISPLAY FALLBACK ONLY':'');
 $('perspectiveLines').textContent=view.context.sourceLines.join(' — ');
 $('perspectiveCell').dataset.perspectiveColor=view.context.perspectiveColor;
 $('reviewType').textContent=view.fineStudy.review;
 $('reviewReason').textContent=view.fineStudy.reason;
 $('func13Status').textContent='ESTUDO APENAS · '+view.function.adaptationStatus+' · QW OPTIONAL · NO EVIDENCE';
 $('speechState').textContent=spoken?(!speechAvailable()?'Audio playback unsupported in this browser.':''):'Áudio indisponível para conteúdo não autorado.';
}
$('func13Speak').addEventListener('click',()=>{
 if(!spoken||!speechAvailable())return;stopAudio();
 const u=new root.SpeechSynthesisUtterance(spoken);u.lang=locales[$('language').value];
 u.onstart=()=>{$('func13Speak').classList.add('is-speaking');$('speechState').textContent='Speech · '+u.lang;};
 u.onend=()=>{$('func13Speak').classList.remove('is-speaking');$('speechState').textContent='';};
 u.onerror=()=>{$('func13Speak').classList.remove('is-speaking');$('speechState').textContent='Audio unavailable';};
 root.speechSynthesis.speak(u);
});
document.querySelectorAll('[data-function]').forEach(b=>b.addEventListener('click',()=>{selectedFunction=b.dataset.function;selectionByExperience.set($('experience').value,selectedFunction);render()}));
for(const id of controls)$(id).addEventListener('change',()=>{if(id==='experience'){selectedFunction=selectionByExperience.get($('experience').value)||'movement';qs();}render()});
Promise.all(urls.map(url=>fetch(url).then(r=>{if(!r.ok)throw Error('Missing source '+url);return r.json()})))
.then(([e,matrix,master,review])=>{sources={experiences:e.items,matrix,master,review,mirror:root.SIYAYOH1413SpecializedMirror};qs();render()})
.catch(e=>{$('func13Status').textContent='Source unavailable · '+e.message;$('func13Speak').disabled=true});
})(typeof globalThis!=='undefined'?globalThis:this);