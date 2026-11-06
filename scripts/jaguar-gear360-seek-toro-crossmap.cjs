'use strict';
// SEEK × TORO cross-map: historical plans are evidence, never runtime authority.
// Recalculate on every audit from the CURRENT repository HEAD.
const fs=require('node:fs'),assert=require('node:assert/strict');
const path=require('node:path');
const raw=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const stages=raw.items||[];
const languages=['en','es','pt'],tenses=['present','past','future'],modes=['affirmative','negative','interrogative'];
const historical={
  seekToro:'docs/siyayo-seek-toro-sector-register.md',
  masterMap:'docs/SIYAYO-WORK-MAP.md',
  integration:'docs/JAGUAR-GEAR-MAIN-LAB-INTEGRATION-20261030.md',
  moduleInventory:'docs/JAGUAR-H14-54-EXPLORER-INTEGRATION-INVENTORY.md',
  whyHandoff:'data/learning/references/jaguar-h14-67-final-why-experimental-handoff-v0.1.json'
};
for(const [key,file] of Object.entries(historical)) assert.ok(fs.existsSync(file),'Historical mapping unavailable: '+key+' '+file);
const statusFlags={};
const slots=stages.flatMap((exp,i)=>(exp.thinkingMind||[]).map(q=>{
  const id=exp.id+'/'+q.questionWord,missingLanguages=[];
  for(const lang of languages)if(!q.question?.[lang]||!q.questionWordLabel?.[lang])missingLanguages.push(lang);
  const formCells=tenses.flatMap(t=>modes.map(m=>q.dialogueForms?.[t]?.[m]));
  const allForms=formCells.every(v=>v&&languages.every(lang=>typeof v.question?.[lang]==='string'&&typeof v.response?.[lang]==='string'&&v.question[lang].trim()&&v.response[lang].trim()));
  const partialForms=formCells.some(Boolean);
  const focus=q.dependencyFocus,head=q.dependencyHeadProbe;
  const validStructures=focus?.structureIds&&languages.every(lang=>{
    const filename='data/learning/dependencies/'+focus.structureIds[lang]+'.json';
    return fs.existsSync(filename);
  });
  const specialization={
    focus:!!focus,headProbe:!!head,focusStructuresPresent:!!validStructures,
    presentationGrounding:!!q.presentationGrounding,
    reasonGrounding:!!q.reasonGrounding,
    answerGrounding:!!q.answerGrounding,
    choiceContext:!!q.choiceContext
  };
  const assessment=q.assessmentTarget?{status:'runtime_target_declared',skill:q.assessmentTarget.skill||null}:{status:'no_runtime_target'};
  const legacyWhyDraft=q.questionWord==='why'&&i<2?'H14.63–67 WHY S1/S2 plans: human-review pending, not contract authority':null;
  const gaps=[];
  if(missingLanguages.length)gaps.push('missing_QW_text_'+missingLanguages.join('_'));
  if(!focus)gaps.push('dependency_focus_not_authored');
  else if(!validStructures)gaps.push('dependency_structure_not_found');
  if(!head)gaps.push('head_probe_not_authored');
  if(!allForms)gaps.push(partialForms?'dialogue_grid_partial':'dialogue_grid_not_authored');
  if(!q.assessmentTarget)gaps.push('no_runtime_assessment_target');
  return {experience:exp.id,questionWord:q.questionWord,slot:id,languagesPresent:languages.filter(l=>!missingLanguages.includes(l)),
    dialogueGrid:allForms?'complete':partialForms?'partial':'absent',specialization,assessment,legacyWhyDraft,gaps};
}));
const qws=[...new Set(slots.map(s=>s.questionWord))];
const counts={experiences:stages.length,placements:slots.length,distinctQWs:qws.length,trilingual:slots.filter(s=>s.languagesPresent.length===3).length,
  completeDialogueGrids:slots.filter(s=>s.dialogueGrid==='complete').length,
  dependencyFocus:slots.filter(s=>s.specialization.focus).length,
  dependencyHeadProbe:slots.filter(s=>s.specialization.headProbe).length,
  validDependencyStructures:slots.filter(s=>s.specialization.focusStructuresPresent).length,
  assessmentTargetDeclared:slots.filter(s=>s.assessment.status==='runtime_target_declared').length};
assert.ok(counts.experiences>=4,'An existing Experience disappeared');
assert.ok(counts.placements>=21,'Existing Experience/QW slots were lost');
assert.ok(counts.distinctQWs>=8,'Existing QW family was lost');
assert.equal(counts.trilingual,counts.placements,'An Experience/QW lost required EN/ES/PT coverage');
assert.ok(counts.completeDialogueGrids>=5,'Existing complete tense/mode grids were lost');
for(const slot of slots){
 if(slot.specialization.focus)assert.ok(slot.specialization.focusStructuresPresent,
  'Dependency Focus points to missing structure '+slot.slot);
 if(slot.specialization.headProbe)assert.ok(slot.specialization.focus,'Head Probe detached from Focus '+slot.slot);
}
const report={id:'SIYAYO-SEEK-TORO-RUNTIME-CROSSMAP',version:'1.0',authority:'inventory_only_no_credit',
 source:'data/learning/experience-seeds.json',historicalSources:historical,counts,slots,
 missingCanonicalQWs:['how-many','whose','whom','how-long','how-far','how-often'].filter(q=>!qws.includes(q)),
 notes:['Historical documents are dated snapshots. Live corpus always wins when statuses disagree.',
 'Not authored does not mean regression: the baseline integrity gate separately detects removals.',
 'A declared assessmentTarget is NOT proof of a completed or homologated evaluation.',
 'Do not grant credits for PATITA observations, study, audio, a dialogue grid or H14 draft plans.']};
const output=process.argv.indexOf('--json')>=0?JSON.stringify(report,null,2):null;
if(output)process.stdout.write(output+'\n');else{
 console.log('SEEK × TORO CURRENT MAIN CORPUS: '+JSON.stringify(counts));
 for(const slot of slots)console.log(slot.slot+' | '+slot.dialogueGrid+' | DF='+(slot.specialization.focus?'yes':'no')+
  ' | HEAD='+(slot.specialization.headProbe?'yes':'no')+
  ' | contract='+slot.assessment.status+' | '+slot.gaps.join(', '));
 console.log('Historical crosslinks: '+Object.values(historical).join(' | '));
}
