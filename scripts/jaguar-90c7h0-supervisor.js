#!/usr/bin/env node
// JAGUAR 90C.7H.0 READ-ONLY SUPERVISION
// Coverage is not a Green Pass, a semantic review, or a production release.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const experiences=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const langs=['en','es','pt'],list=[],defects=[],gaps=[];
const catalog=new Map(experiences.map(x=>[x.id,x]));
const v=x=>typeof x==='string'?x.trim():'';
const skills={which:'which.use.determiner',what:'what.use.object-question',where:'where.use.location-question',why:'why.use.contextual-reason'};
for(const experience of experiences){
 assert.ok(catalog.has(experience.toroidalNext?.nextExperience),'Broken NEXT: '+experience.id);
 let seen=new Set();
 for(const [index,q] of experience.thinkingMind.entries()){
  let word=q.questionWord,key=experience.id+'/'+word;
  if(seen.has(word))defects.push({key,reason:'duplicate-question-word'});seen.add(word);
  let owned=q.assessmentTarget?.skill||null,resume=q.assessmentResumeTarget?.skill||null,free=!!q.presentationGrounding,reason=!!q.reasonGrounding;
  if(owned&&skills[word]!==owned)defects.push({key,reason:'unknown-or-mismatched-target'});
  if(resume&&skills[word]!==resume)defects.push({key,reason:'unknown-or-mismatched-resume'});
  if(owned&&resume)defects.push({key,reason:'origin-and-resume-collision'});
  if(free&&(owned||resume||q.presentationGrounding.assessmentAuthority!==false||q.presentationGrounding.assessmentEvidence!==false))defects.push({key,reason:'free-presentation-gained-credit'});
  if(Boolean(q.dependencyFocus)!==Boolean(q.dependencyHeadProbe))defects.push({key,reason:'focus-probe-mismatch'});
  let loc={};
  for(let lang of langs){
   if(!v(q.question?.[lang]))defects.push({key,lang,reason:'missing-question-text'});
   let id=q.dependencyFocus?.structureIds?.[lang], head=q.dependencyHeadProbe;
   if(q.dependencyFocus){
    if(!id||!fs.existsSync('data/learning/dependencies/'+id+'.json'))defects.push({key,lang,reason:'dependency-file-not-found',id});
    else{
     let data=JSON.parse(fs.readFileSync('data/learning/dependencies/'+id+'.json','utf8'));
     if(data.language!==lang||data.id!==id)defects.push({key,lang,reason:'wrong-dependency-scope'});
     if(head?.structureIds?.[lang]!==id)defects.push({key,lang,reason:'head-structure-disagreement'});
     let target=head?.targetTokenIdsByLanguage?.[lang]||head?.targetTokenId;
     if(!data.tokens?.some(x=>x.id===target))defects.push({key,lang,reason:'head-target-not-in-sentence',target});
    }
   }
   const grounding=q.presentationGrounding||q.reasonGrounding;
   if(word==='why'&&grounding){
    const accepted=q.presentationGrounding?.referenceReasonId||q.reasonGrounding?.acceptedReasonId;
    const matches=grounding.alternatives?.filter(x=>x.id===accepted)||[];
    if(matches.length!==1||!v(matches[0]?.response?.[lang]))defects.push({key,lang,reason:'missing-localized-reason'});
   }
   loc[lang]={corpusQuestion:Boolean(v(q.question?.[lang])),dependencyFocus:!!id,
    headProbe:!!head?.structureIds?.[lang],assessment:owned?'origin':resume?'resume-only':'none'};
  }
  let stage=owned?'ASSESSMENT_ORIGIN':resume?'ASSESSMENT_RESUME':reason?'TRANSFER_CORPUS':free?'FREE_CONTEXTUAL':q.choiceContext?'CHOICE_CONTEXT':q.dialogueForms?'GRAMMAR_CORPUS':'QUESTION_ONLY';
  let open=[];
  if(!q.dependencyFocus)open.push('DEPENDENCY_FOCUS_NOT_AUTHORED');
  if(!q.dependencyHeadProbe)open.push('HEAD_PROBE_NOT_AUTHORED');
  if(!skills[word])open.push('WORD_PATH_FAMILY_NOT_AUTHORIZED');
  if(!owned&&!resume&&!reason&&!free)open.push('NO_EVALUATION_CONTRACT_FOR_THIS_CELL');
  gaps.push(...open.map(reason=>({key,reason})));
  list.push({experience:experience.id,questionWord:word,index,stage,
    howToDo:owned?'assessment-owner and learner answer':resume?'resume/transfer by authorized button':reason?'owned transfer or corpus-only':'corpus and free study',
    howToShow:owned||resume||reason?'LINES + conditional probe/feedback + progress':'LINES and free-exploration status',
    howToRecord:owned||resume||reason?'only accepted contract evidence':'no contract evidence',
    source:free?'presentationGrounding':reason?'reasonGrounding':q.choiceContext?'choiceContext':q.dialogueForms?'dialogueForms':'question',
    owner:owned,resume,loc,open,sharePrint:'NOT_VERIFIED'});
 }
}
assert.equal(experiences.length,4);
assert.equal(list.length,21,'Unexpected QW × Experience change requires new baseline');
assert.equal(new Set(list.map(x=>x.questionWord)).size,8);
assert.equal(list.filter(x=>x.owner).length,5);
for(const exp of ['shopping-for-dinner','preparing-dinner']){
 const which=list.find(x=>x.experience===exp&&x.questionWord==='which');
 const why=list.find(x=>x.experience===exp&&x.questionWord==='why');
 assert.ok(which&&langs.every(l=>which.loc[l].dependencyFocus&&which.loc[l].headProbe));
 assert.ok(why?.stage==='FREE_CONTEXTUAL'&&why.open.includes('DEPENDENCY_FOCUS_NOT_AUTHORED'));
}
assert.equal(list.find(x=>x.experience==='having-dinner'&&x.questionWord==='why')?.owner,'why.use.contextual-reason');
assert.equal(list.find(x=>x.experience==='after-dinner-conversation'&&x.questionWord==='why')?.stage,'TRANSFER_CORPUS');
assert.deepEqual(defects,[],JSON.stringify(defects,null,2));
const summary={experiences:4,questionEntries:21,uniqueQWs:8,languageCells:63,
 assessmentOrigins:5,dependencyPairs:list.filter(x=>langs.every(l=>x.loc[l].dependencyFocus&&x.loc[l].headProbe)).length};
const report={version:'90C.7H.0',status:'STRUCTURAL_GATE_ONLY',summary,defects,gaps,
 release:{whichReference:'STRUCTURAL_CHECK_PASSED',whichToWhyBrowser:'NOT_YET_CERTIFIED',whyS1S2Dependency:'AUTHORING_PENDING',
  sharePrint:'NOT_CERTIFIED',externalSecurity:'BLOCKED'},matrix:list};
fs.mkdirSync('visual-audit-90c7h0',{recursive:true});
fs.writeFileSync('visual-audit-90c7h0/supervision.json',JSON.stringify(report,null,2)+'\n');
let lines=['# SIYAYO 90C.7H.0 HOW TO DO × HOW TO SHOW × HOW TO RECORD','',
 '| EXPERIENCE | QW | HOW TO DO | HOW TO SHOW | HOW TO RECORD | STAGE | PENDÊNCIAS |','|---|---|---|---|---|---|---|'];
for(const item of list)lines.push('| '+[item.experience,item.questionWord,item.howToDo,item.howToShow,item.howToRecord,item.stage,item.open.join(', ')||'none'].join(' | ')+' |');
lines.push('','THIS MATRIX IS COVERAGE, NOT A COMPLETE ASSESSMENT OR HUMAN SIGN-OFF.');
fs.writeFileSync('visual-audit-90c7h0/supervision.md',lines.join('\n')+'\n');
console.log('PASS SUPERVISOR STRUCTURE '+JSON.stringify(summary)+'; known pending='+gaps.length+'; release stays BLOCKED');
