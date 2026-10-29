(function(global){
'use strict';
const locales=Object.freeze({en:'en-US',es:'es-ES',pt:'pt-BR'});
const labels=Object.freeze({en:'inglês',es:'espanhol',pt:'português'});
function normalizeText(text){return String(text||'').replace(/[\uE000-\uF8FF]/g,'').replace(/[.…_]{3,}/g,' ').replace(/\s+/g,' ').trim();}
function meaningful(text){return /[\p{L}\p{N}]/u.test(normalizeText(text));}
function blockId(unit,key,lang){return unit.id+':BLOCK:'+key+':'+lang;}
function createController(host,onStatus){
 let serial=0,active=null;
 const supported=()=>Boolean(host&&host.speechSynthesis&&typeof host.SpeechSynthesisUtterance==='function');
 const tell=message=>{if(onStatus)onStatus(message);};
 function clear(entry){if(entry?.element){entry.element.classList.remove('is-speaking');entry.element.removeAttribute('aria-busy');entry.element.dataset.speechState='idle';}}
 function cancel(){serial++;const previous=active;active=null;clear(previous);if(supported())host.speechSynthesis.cancel();tell('');}
 function read({text,lang,element,key}){
  if(!locales[lang]||!meaningful(text))return false;
  if(!supported()){tell('A leitura por voz não está disponível neste navegador.');return false;}
  cancel();const token=++serial;const utterance=new host.SpeechSynthesisUtterance(normalizeText(text));utterance.lang=locales[lang];utterance.rate=.92;utterance.pitch=1;utterance.volume=1;
  const voices=typeof host.speechSynthesis.getVoices==='function'?host.speechSynthesis.getVoices():[];
  const voice=voices.find(v=>v.lang?.toLowerCase()===locales[lang].toLowerCase())||voices.find(v=>v.lang?.toLowerCase().split('-')[0]===lang);if(voice)utterance.voice=voice;
  active={element,key,token,utterance};if(element){element.dataset.speechState='pending';element.dataset.speechLocale=utterance.lang;element.dataset.speechVoiceCount=String(voices.length);delete element.dataset.speechError;element.setAttribute('aria-busy','true');}
  utterance.onstart=()=>{if(active?.token!==token)return;if(element){element.classList.add('is-speaking');element.dataset.speechState='speaking';}tell('Lendo em '+labels[lang]+'.');};
  utterance.onend=()=>{if(active?.token!==token)return;clear(active);active=null;tell('Leitura concluída.');};
  utterance.onerror=event=>{if(active?.token!==token)return;clear(active);active=null;if(element)element.dataset.speechError=event?.error||'unknown';if(!['canceled','interrupted'].includes(event?.error))tell('Não foi possível reproduzir a leitura neste navegador.');};
  try{host.speechSynthesis.speak(utterance);return true;}catch(error){clear(active);active=null;tell('Não foi possível reproduzir a leitura neste navegador.');return false;}
 }
 return Object.freeze({supported,read,cancel,getActive:()=>active?{key:active.key,lang:active.utterance.lang}:null});
}
// Reviewed language spans preserve the exact source string. Unlisted surrounding
// explanation uses Portuguese; all spans are references, never new translations.
const englishSpans={
 P02741:['The star A Star This star That star These stars Those stars'],P02742:['My star Carol’s star Some stars Any star No star One star Two stars'],P02745:['The my car is there.'],P02748:['The Brazil.'],P02754:['Susan is my teacher.'],P02756:['Susan is my teacher.'],P02760:['A / AN','I watched a movie.'],P02761:['a +','a book – a doctor – a teacher – a student – a movie – a house – a horse.'],P02765:['an +','an elephant – an egg – an orange – an engineer – an umbrella – an ant.'],P02767:['THE','The movie was very good.','The teacher.','The teachers.','The boy.','The girl.'],P02771:['The Susan is my teacher.'],P02772:['The my bag is blue.'],P02777:['That is my car.','That is not right.'],P02779:['That is a good idea.'],P02781:['That is terrible.'],

 P00902:['Verbs:'],P00904:['Nouns:'],P00906:['Articles:','a, an, the'],P00907:['Pronouns:'],P00909:['Adjectives:'],P00910:['beautiful, cheap, short,','Adverbs:','here, there, slowly,','Prepositions:'],P00912:['Conjunctions:'],P00914:['Numbers:'],P00916:['Interjections:'],P00917:['wow, yay, oh my God,'],P00919:['she is beautiful, we are tall...'],
 P00987:['I am a teacher.'],P00988:['Helen is a good driver.'],P00989:['Peter and Paul are from the United States.'],P00992:['I am tired.'],P00993:['She is at school.'],P00994:['My car is there.'],P00997:['I am studying English now.','She is going up the stairs.'],P00998:['The car is going into the garage.'],P01001:['I usually wake up at 7 o’clock.'],P01002:['The dog barks when it sees a cat.'],P01003:['The earth goes around the sun.'],P01006:['There is somebody outside.'],P01007:['There are two cars in the garage.'],P01008:['There will be a problem if you do that.'],P01125:['With whom?','Who are you going with?'],P01127:['Who is he? What happened? Who discovered Brazil? What makes you think that the economy will be better next year? Is there anybody waiting for me?'],P01142:['I will not can do that tomorrow. Correct: I will not be able to do that tomorrow.'],
 P11803:['There is a problem'],P11804:['There was a party'],P11805:['There were many people'],P11806:['There will be a meeting'],P11807:['There has been a party'],P11809:['Has a problem','There is a problem.'],P11811:['I have a problem','There is a problem'],P11813:['have','there + to be']
};
function splitSpans(text,base,fragments){const intervals=[];for(const item of fragments||[]){const start=text.indexOf(item);if(start>=0)intervals.push({start,end:start+item.length,lang:'en'});}return splitIntervals(text,base,intervals);}
function splitIntervals(text,base,intervals){const out=[];let at=0;for(const part of intervals.sort((a,b)=>a.start-b.start)){if(part.start<at)continue;if(part.start>at)out.push({text:text.slice(at,part.start),lang:base,start:at,end:part.start});out.push({text:text.slice(part.start,part.end),lang:part.lang,start:part.start,end:part.end});at=part.end;}if(at<text.length)out.push({text:text.slice(at),lang:base,start:at,end:text.length});return out.length?out:[{text,lang:base,start:0,end:text.length}];}
function sourceLineParts(unit,row){const text=row.text||'',n=Number(String(row.source_id||'').slice(1));if(row.source_id==='P03108')return splitIntervals(text,'en',Array.from(text.matchAll(/Slide: Maradona |Slide: Jobs/g),m=>({start:m.index,end:m.index+m[0].length,lang:'en'})));if(unit.id.includes(':HAND-HELPERS:')){const tokens={P02719:/Slide: Personal Pronouns/g,P02782:/Nouns|Slide: Singular and Plural Articles|Demonstratives/g}[row.source_id];if(tokens)return splitIntervals(text,'en',Array.from(text.matchAll(tokens),m=>({start:m.index,end:m.index+m[0].length,lang:'en'})));if(!englishSpans[row.source_id])return [{text,lang:n<2728||n===2728||[2751,2785,2786,2787,2790,2791,2792].includes(n)?'en':'pt',start:0,end:text.length}];}if(unit.id.startsWith('MVP:UNIT:TO-BE:QUALITY:')){const tokens={P02443:/QUALITY & STATE|Nouns|Numbers|Demonstratives|Possessives|Adjectives/g,P02464:/I|you/g,P02471:/he|she|it/g,P02473:/we|they/g,P02476:/ORDER OF SENTENCES – TO BE|I am an auxiliary/g}[row.source_id];if(tokens)return splitIntervals(text,'en',Array.from(text.matchAll(tokens),m=>({start:m.index,end:m.index+m[0].length,lang:'en'})));}if(englishSpans[row.source_id])return splitSpans(text,'pt',englishSpans[row.source_id]);
 let lang=null;if(unit.source_languages?.length===1)lang=unit.source_languages[0];else if(unit.chapter_id==='MVP:CH:MOVEMENT')lang='en';else if(n>=11879&&n<=11904)lang='en';else if(n>=11913&&n<=12021)lang='pt';else if(n>=12027&&n<=12081)lang='en';else if(n===11808)lang='pt';else if(n>=897&&n<=1127)lang=[903,905,908,911,913,915].includes(n)?'en':'pt';else if(n>=1139&&n<=1141)lang='pt';else if(n>=1195&&n<=1200)lang='en';else if(unit.chapter_id==='MVP:CH:TO-BE')lang='en';
 return [{text,lang,start:0,end:text.length}];
}
function cellParts(unit,text,row,col){const id=unit.source_table_id;
 if(['T0019','T0020'].includes(id))return [{text,lang:'en',start:0,end:text.length}];
 if(id==='T0017'){const globalRow=unit.source_row_indices[row];const lang=globalRow>=20&&col===1?'pt':'en';const split={SheIt:3,isis:2,'is notis not':6,WhyWhere:3,'Por queOnde':7,'Iyou he she it we you they':1}[text];if(split)return [{text:text.slice(0,split),lang,start:0,end:split},{text:text.slice(split),lang,start:split,end:text.length}];return [{text,lang,start:0,end:text.length}];}

 if(id==='T0013')return [{text,lang:row===2?'pt':'en',start:0,end:text.length}];
 if(id==='T0014'||id==='T0016'||['T0090','T0091','T0092'].includes(id))return [{text,lang:'en',start:0,end:text.length}];
 if(id==='T0015')return [{text,lang:row===1&&col===0?'pt':'en',start:0,end:text.length}];
 if(id==='T0004')return [{text,lang:'pt',start:0,end:text.length}];
 if(id==='T0005'){
  if(row===0)return [{text,lang:'pt',start:0,end:text.length}];
  if(col===4&&row>0){const ptStart=['','Ela é','Ele está','Nós estamos','Eles comem','Há um'][row];const i=text.indexOf(ptStart);if(i>0)return splitIntervals(text,'pt',[{start:0,end:i,lang:'en'}]);}
  return [{text,lang:col===0?'en':col===2&&row!==4?'en':'pt',start:0,end:text.length}];
 }
 if(id==='T0006'){return splitSpans(text,'pt',['(Do you work here?)','(I do not work here)','(Where do you work?)']);}
 if(id==='T0007'){
  if(row===1&&col===2){const i=text.indexOf('I DO NOT');if(i>=0)return splitIntervals(text,'pt',[{start:i,end:text.length,lang:'en'}]);}
  return [{text,lang:row===1?'pt':row>=3&&row%2===0?'pt':'en',start:0,end:text.length}];
 }
 if(id==='T0008'){
  if(col===0)return [{text,lang:'en',start:0,end:text.length}];
  const intervals=[];let match;const quoted=/[“"]([^”"\n]+)[”"]/g;while((match=quoted.exec(text)))intervals.push({start:match.index,end:match.index+match[0].length,lang:'en'});
  if(row===7){const start=text.indexOf('CAN,');const end=text.indexOf('* dependem');if(start>=0)intervals.push({start,end:end>=0?end:text.length,lang:'en'});}
  return splitIntervals(text,'pt',intervals);
 }
 if(['T0009','T0010','T0011'].includes(id))return [{text,lang:'en',start:0,end:text.length}];
 if(id==='T0012'){const i=text.indexOf('Ex.:');if(i>=0)return splitIntervals(text,'pt',[{start:i+4,end:text.length,lang:'en'}]);return [{text,lang:'pt',start:0,end:text.length}];}
 return [{text,lang:null,start:0,end:text.length}];
}
function roleFor(unit){return unit.type==='ANSWER_KEY'?'answer':unit.type.includes('EXERCISE')||unit.type.includes('PRACTICE')?'exercise':unit.type==='CONCEPT'||unit.type==='SOURCE_TEXT'?'explanation':unit.type==='FIGURE'?'figure':'example';}
function describeUnit(unit){const targets=[];const add=(key,text,lang,role,extra={})=>{if(!meaningful(text))return;targets.push({id:blockId(unit,key,lang||'und'),unit_id:unit.id,key,text,lang,role,...extra});};
 for(const field of ['instructions','body'])for(const lang of ['en','es','pt'])if(unit[field]?.[lang])add(field,unit[field][lang],lang,'explanation');
 (unit.examples||[]).forEach((ex,i)=>{for(const lang of ['en','es','pt'])if(ex.text?.[lang])add('example:'+i,ex.text[lang],lang,unit.type==='ANSWER_KEY'?'answer':'example',{sentence_id:ex.id});});
 (unit.source_lines||[]).forEach((row,i)=>sourceLineParts(unit,row).forEach((part,j)=>add('source:'+i+':'+j,part.text,part.lang,roleFor(unit),{source_id:row.source_id,start:part.start,end:part.end})));
 (unit.source_rows||[]).forEach((row,i)=>row.forEach((text,j)=>{if(i<(unit.source_header_rows||0)||(['T0016','T0019'].includes(unit.source_table_id)&&j===0)||(unit.source_table_id==='T0020'&&j<2))return;cellParts(unit,text,i,j).forEach((part,k)=>add('cell:'+i+':'+j+':'+k,part.text,part.lang,roleFor(unit),{source_table_id:unit.source_table_id}));}));
 (unit.prompts||[]).forEach((text,i)=>add('prompt:'+i,text,'en','exercise'));
 (unit.original_lines||[]).forEach((line,i)=>sourceLineParts(unit,line).forEach((part,j)=>add('original:'+i+':'+j,part.text,part.lang,'example',{source_id:line.source_id})));
 (unit.rows||[]).forEach((row,i)=>{for(const lang of ['en','es','pt'])if(row.text?.[lang])add('table:'+i,row.text[lang],lang,'example');});
 (unit.terms||[]).forEach((term,i)=>{for(const lang of ['en','es','pt'])if(term.text?.[lang])add('term:'+i,term.text[lang],lang,'example');});
 (unit.word_types||[]).forEach((term,i)=>{for(const lang of ['en','es','pt'])if(term.names?.[lang])add('word:'+i,term.names[lang]+': '+term.example[lang],lang,'example');});
 if(unit.asset?.alt)for(const lang of ['en','es','pt'])if(unit.asset.alt[lang])add('figure-description',unit.asset.alt[lang],lang,'figure');
 return targets;
}
global.MasterVIPSpeech=Object.freeze({locales,labels,normalizeText,meaningful,blockId,createController,sourceLineParts,cellParts,roleFor,describeUnit});
})(typeof globalThis!=='undefined'?globalThis:this);
