(function(root){'use strict';
const FUNCTIONS=['quality','state','movement','action','existence'];
function project(experience,cell,language,perspective,tense,mode){
 const core=root.SIYAYOH1413SpecializedMirror||(typeof module==='object'&&module.exports?require('../scripts/jaguar-h14-13-specialized-mirror-reference.js'):null);
 if(!core||typeof core.projectSingle!=='function')return null;
 const result=core.projectSingle({experience,cell,selection:{experienceId:experience?.id,functionId:cell?.functionId,language,perspective,tense,mode,period:'none'}});
 return result?Object.freeze({source:result.canonicalPerspectiveExamples,example:result.functionSourceExample,
 sourceStatus:result.functionExampleStatus,color:result.color,assessmentAuthority:false,evidenceProduced:false,greenPass:false}):null;
}
function start(){
 if(!root.location||new URLSearchParams(root.location.search).get('h14_14')!=='preview')return false;
 const doc=root.document,container=doc?.getElementById('h14SpecializedPreview');
 const runtime=root.SIYAYOVerbExplorerExperienceRuntime,nav=root.SIYAYOVerbExplorerExperienceNavigation;
 if(!container||!runtime||!nav)return false;
 container.hidden=false;
 let cells=[],functionByExperience=Object.create(null);
 const $=id=>doc.getElementById(id);
 const active=selector=>doc.querySelector(selector+'.active');
 function render(){
  const exp=nav.getExperience(runtime.activeExperienceId()),lang=runtime.activeLanguage();
  if(!exp||!cells.length)return;
  const func=functionByExperience[exp.id]||'quality',perspective=active('[data-perspective]')?.dataset.perspective||'describing';
  const tense=active('[data-experience-tense]')?.dataset.experienceTense||'present';
  const mode=active('[data-experience-form]')?.dataset.experienceForm||'affirmative';
  const cell=cells.find(x=>x.experienceId===exp.id&&x.functionId===func);
  const v=project(exp,cell,lang,perspective,tense,mode);
  container.querySelectorAll('[data-h14-function]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.h14Function===func)));
  $('h14PreviewContext').textContent=exp.id+' · '+lang.toUpperCase()+' · '+tense.toUpperCase()+' · '+mode.toUpperCase()+' · '+perspective.toUpperCase()+' · QW optional';
  $('h14PreviewFunctionText').textContent=v?.example||'Not authored for selected tense/mode; no inferred answer.';
  $('h14PreviewPerspectiveText').textContent=v?.source.join(' — ')||'Source unavailable';
  $('h14PreviewPerspectiveCard').dataset.perspectiveColor=v?.color||'red';
 }
 container.addEventListener('click',event=>{const b=event.target.closest('[data-h14-function]');if(!b||!FUNCTIONS.includes(b.dataset.h14Function))return;const exp=runtime.activeExperienceId();if(exp)functionByExperience[exp]=b.dataset.h14Function;render()});
 let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;root.setTimeout(()=>{scheduled=false;render()},0)}
 if(root.MutationObserver){for(const s of ['#experienceTitle','#perspectiveGear','#experienceLanguageGear','#experienceTenseGear','#experienceModeGear']){
  const node=doc.querySelector(s);if(node)new root.MutationObserver(schedule).observe(node,{attributes:true,attributeFilter:['class'],childList:true,characterData:true,subtree:true});
 }}
 doc.addEventListener('click',event=>{if(event.target.closest('[data-experience-language],[data-experience-tense],[data-experience-form],[data-perspective],[data-question-index],#nextExperience,#previousExperience'))schedule()});
 root.addEventListener('popstate',schedule);
 root.fetch('data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('missing source');return r.json()}).then(d=>{if(!Array.isArray(d.cells)||d.cells.length!==20)throw Error('invalid source');cells=d.cells;render()}).catch(()=>{$('h14PreviewContext').textContent='Source unavailable — no credit, no evidence.'});
 return true;
}
const api=Object.freeze({project,start});
if(typeof module==='object'&&module.exports)module.exports=api;else{root.SIYAYOH1414Preview=api;start();}
})(typeof globalThis!=='undefined'?globalThis:this);
