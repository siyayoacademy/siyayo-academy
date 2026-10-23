#!/usr/bin/env node
// JAGUAR 90C.3 · Read-only retrospective CORPUS -> HOW TO SHOW inventory.
// Never grants assessment credit, rewrites authoring, or treats authored grammar as approved assessment.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const coherence=require('../js/verb-explorer-contextual-coherence.js');
const LANGS=['en','es','pt'];
const TENSES=new Set(['present','past','future']);
const MODES=new Set(['affirmative','negative','interrogative']);
const v=x=>typeof x==='string'?x.trim():'';
const EXPECTED_UNAUTHORED=new Set(['shopping-for-dinner','preparing-dinner']);
function audit(items){
  const issues=[],inventory=[],metrics={experiences:0,questions:0,localizedQuestions:0,authoredGrammarTriples:0,whyGrounded:0,whyKnownGaps:0,whyUnexpectedGaps:0,groundedChoiceCandidates:0,groundedWhatAnswers:0,unverifiedSemanticDialogues:0};
  for(const experience of items||[]){
    metrics.experiences++;
    for(const q of experience.thinkingMind||[]){
      metrics.questions++;
      const name=String(q.questionWord||'');
      const row={experienceId:experience.id,questionWord:name,sourceTypes:[],assessmentStatus:'not-certified-by-this-audit'};
      for(const language of LANGS){
        if(!v(q.question&&q.question[language]))issues.push({experienceId:experience.id,questionWord:name,language,reason:'missing-question-translation'});
        else metrics.localizedQuestions++;
      }
      if(q.dialogueForms){
        row.sourceTypes.push('dialogueForms');
        for(const [tense,forms] of Object.entries(q.dialogueForms)){
          if(!TENSES.has(tense))issues.push({experienceId:experience.id,questionWord:name,reason:'unknown-tense',tense});
          for(const [mode,pair] of Object.entries(forms||{})){
            if(!MODES.has(mode))issues.push({experienceId:experience.id,questionWord:name,reason:'unknown-mode',mode});
            metrics.authoredGrammarTriples++;
            for(const language of LANGS){
              if(!v(pair.question&&pair.question[language])||!v(pair.response&&pair.response[language]))
                issues.push({experienceId:experience.id,questionWord:name,language,tense,mode,reason:'incomplete-grammar-dialogue'});
            }
          }
        }
        metrics.unverifiedSemanticDialogues++;
      }
      if(q.answerGrounding){
        row.sourceTypes.push('answerGrounding');
        for(const language of LANGS)
          if(!v(q.answerGrounding.context&&q.answerGrounding.context[language]))
            issues.push({experienceId:experience.id,questionWord:name,language,reason:'missing-context-translation'});
        const accepted=q.answerGrounding.acceptedVocabularyIds||[];
        const answers=q.answerGrounding.canonicalResponses||[];
        if(!Array.isArray(accepted)||accepted.length===0)
          issues.push({experienceId:experience.id,questionWord:name,reason:'no-accepted-vocabulary-ids'});
        if(answers.length) {
          for(const id of accepted){
            const candidates=answers.filter(a=>a&&a.id===id);
            if(candidates.length!==1)issues.push({experienceId:experience.id,questionWord:name,id,reason:'ambiguous-or-missing-accepted-answer'});
          }
          for(const answer of answers){
            metrics.groundedWhatAnswers++;
            for(const language of LANGS)if(!v(answer.response&&answer.response[language]))
              issues.push({experienceId:experience.id,questionWord:name,language,id:answer.id,reason:'missing-answer-translation'});
          }
        }else {
          row.sourceTypes.push('context-only-no-localized-canonical-responses');
        }
      }
      if(q.choiceContext&&Array.isArray(q.choiceContext.canonicalCandidates)){
        row.sourceTypes.push('choiceContext');
        for(const choice of q.choiceContext.canonicalCandidates){
          metrics.groundedChoiceCandidates++;
          for(const language of LANGS)if(!v(choice.response&&choice.response[language]))
            issues.push({experienceId:experience.id,questionWord:name,language,id:choice.id,reason:'missing-choice-translation'});
        }
      }
      if(name==='why'){
        for(const language of LANGS){
          const result=coherence.resolve({question:q,language,tense:'present',form:'affirmative'});
          if(result&&result.status==='grounded'){
            metrics.whyGrounded++;
            row.sourceTypes.push('acceptedReason:'+language);
          }else if(result&&result.status==='corpus-gap'&&result.reason==='missing-grounding'&&EXPECTED_UNAUTHORED.has(experience.id)){
            metrics.whyKnownGaps++;
            row.sourceTypes.push('known-authoring-gap:'+language);
          }else {
            metrics.whyUnexpectedGaps++;
            issues.push({experienceId:experience.id,questionWord:name,language,reason:'unexpected-why-gap',detail:result?.reason||result?.status||'null'});
          }
        }
      }
      inventory.push(row);
    }
  }
  return {metrics,issues,inventory};
}
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const result=audit(corpus.items);
assert.equal(result.metrics.experiences,4,'S1-S4 expected; review any new Experience before broadening');
assert.equal(result.metrics.questions,21,'Question count changed: review new authoring inventory');
assert.equal(result.metrics.localizedQuestions,63,'21 EN/ES/PT questions required');
assert.equal(result.metrics.whyKnownGaps,0,'90C.6 S1/S2 presentation grounding is now authored');
assert.equal(result.metrics.whyGrounded,12,'S1–S4 WHY EN/ES/PT grounding required');
assert.equal(result.metrics.whyUnexpectedGaps,0);
assert.equal(result.issues.length,0,JSON.stringify(result.issues,null,2));
assert.ok(result.metrics.authoredGrammarTriples>0,'Must inspect grammar dialogue forms');
assert.ok(result.inventory.every(row=>row.assessmentStatus==='not-certified-by-this-audit'));
const neg=JSON.parse(JSON.stringify(corpus.items));
neg[0].thinkingMind[0].question.es='';
assert.ok(audit(neg).issues.some(x=>x.reason==='missing-question-translation'));
const duplicate=JSON.parse(JSON.stringify(corpus.items));
const q=duplicate[2].thinkingMind.find(q=>q.questionWord==='why');
q.reasonGrounding.alternatives.push({...q.reasonGrounding.alternatives[0]});
assert.ok(audit(duplicate).issues.some(x=>x.reason==='unexpected-why-gap'));
console.log('JAGUAR 90C.3 PASS structural audit: '+JSON.stringify(result.metrics));
console.log('WHY S1/S2: six new exploratory grounded localizations; WHY S3/S4: six assessed grounded localizations.');
console.log('Other QW/tense/mode entries are inventory only; this test does NOT certify semantic correctness or assessment.');
module.exports={audit};
