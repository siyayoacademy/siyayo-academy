// SIYAYO JAGUAR V30.3.85E — TEST-ONLY observation UI adapter.
// Never deploy or install into the production Explorer. This does NOT authenticate,
// score, issue Green Pass, or hydrate getRetainedProgress/getRetainedEvidence.
// Observations must remain visually separate from canonical accepted evidence.

const QWS=Object.freeze([
  Object.freeze({questionWord:'WHICH',skillId:'which.use.determiner'}),
  Object.freeze({questionWord:'WHAT',skillId:'what.use.object-question'}),
  Object.freeze({questionWord:'WHERE',skillId:'where.use.location-question'}),
  Object.freeze({questionWord:'WHY',skillId:'why.use.contextual-reason'})
]);
const LANG=Object.freeze(['en','es','pt']);
const words={
 WHICH:{en:'WHICH',es:'CUÁL',pt:'QUAL'},
 WHAT:{en:'WHAT',es:'QUÉ',pt:'O QUE'},
 WHERE:{en:'WHERE',es:'DÓNDE',pt:'ONDE'},
 WHY:{en:'WHY',es:'POR QUÉ',pt:'POR QUÊ'}
};
const labels={
 en:{title:'OBSERVED RECORDS',note:'Observations and pending records are not accepted evidence or Green Pass.',none:'No authenticated observational snapshot',invalid:'Observation view unavailable',empty:'No observations',exp:'exploratory',pending:'pending'},
 es:{title:'REGISTROS OBSERVADOS',note:'Las observaciones y registros pendientes no son evidencias aceptadas ni Green Pass.',none:'Sin registros de observación autenticados',invalid:'Vista de observaciones no disponible',empty:'Sin observaciones',exp:'exploratorias',pending:'pendientes'},
 pt:{title:'REGISTROS OBSERVADOS',note:'Observações e registros pendentes não são evidências aceitas nem Green Pass.',none:'Sem registro de observações autenticado',invalid:'Visualização das observações indisponível',empty:'Sem observações',exp:'exploratórias',pending:'pendentes'}
};
const cellFields=['acceptedProgress','confirmed','exploratoryObservations','greenPass','language','observationMarker','pendingOccurrences','questionWord','skillId'].sort().join(',');
function numeric(n){return Number.isSafeInteger(n)&&n>=0&&n<=100;}
export function validateObservationSnapshot85E(snapshot){
 if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot)||
   Object.keys(snapshot).sort().join(',')!=='cells,kind,ok'||
   snapshot.ok!==true||snapshot.kind!=='OBSERVATION_PREVIEW_ONLY'||
   !Array.isArray(snapshot.cells)||snapshot.cells.length!==12)return false;
 const seen=new Set();
 for(const cell of snapshot.cells){
  if(!cell||typeof cell!=='object'||Array.isArray(cell)||
    Object.keys(cell).sort().join(',')!==cellFields||!LANG.includes(cell.language))return false;
  const word=QWS.find(q=>q.questionWord===cell.questionWord);
  if(!word||word.skillId!==cell.skillId)return false;
  const key=cell.questionWord+'/'+cell.language;
  if(seen.has(key))return false;
  seen.add(key);
  if(!numeric(cell.exploratoryObservations)||!numeric(cell.pendingOccurrences)||
    cell.acceptedProgress!==null||cell.confirmed!==false||cell.greenPass!==false||
    cell.observationMarker!==(cell.exploratoryObservations+cell.pendingOccurrences>0?'◐':'○'))
    return false;
 }
 return seen.size===12;
}
function el(doc,name,value){
 const node=doc.createElement(name);
 if(value!==undefined)node.textContent=String(value);
 return node;
}
export function createObservationPanel85E({document,element,loadSnapshot}={}){
 if(!document||typeof document.createElement!=='function'||!element||
    typeof element.replaceChildren!=='function'||typeof loadSnapshot!=='function')
   throw new TypeError('read_only_dependencies_required');
 let epoch=0;
 const clearNodes=()=>element.replaceChildren();
 function message(language,state,value){
  clearNodes();element.dataset.state=state;
  element.append(el(document,'p',value));
 }
 function show(snapshot,language){
  const t=labels[language],table=el(document,'table');
  table.append(el(document,'caption',t.title));
  const head=el(document,'thead'),hrow=el(document,'tr');
  hrow.append(el(document,'th','QUESTION WORD'));
  LANG.forEach(l=>hrow.append(el(document,'th',l.toUpperCase())));
  head.append(hrow);table.append(head);
  const body=el(document,'tbody');
  for(const qw of QWS){
   const row=el(document,'tr');row.append(el(document,'th',words[qw.questionWord][language]));
   for(const lang of LANG){
    const cell=snapshot.cells.find(c=>c.questionWord===qw.questionWord&&c.language===lang);
    const text=cell.exploratoryObservations+cell.pendingOccurrences===0
      ?'○ '+t.empty
      :'◐ '+cell.exploratoryObservations+' '+t.exp+' · '+cell.pendingOccurrences+' '+t.pending;
    row.append(el(document,'td',text));
   }
   body.append(row);
  }
  table.append(body);
  clearNodes();
  element.dataset.state='observations-only';
  element.append(el(document,'p',t.note),table);
 }
 return Object.freeze({
  async refresh({viewKey,displayLanguage='en'}={}){
   // viewKey is an ephemeral test-only selection key, NOT an authentication credential.
   const version=++epoch;
   const language=LANG.includes(displayLanguage)?displayLanguage:'en';
   if(typeof viewKey!=='string'||!viewKey.trim()){
    message(language,'empty',labels[language].none);
    return false;
   }
   clearNodes();element.dataset.state='loading';
   let snapshot;
   try{snapshot=await loadSnapshot(viewKey);}catch{snapshot=null;}
   if(version!==epoch)return false;
   if(!validateObservationSnapshot85E(snapshot)){
    message(language,'unavailable',labels[language].invalid);
    return false;
   }
   show(snapshot,language);return true;
  },
  clear(){++epoch;clearNodes();element.dataset.state='empty';return true;},
  getState(){return element.dataset.state;}
 });
}
