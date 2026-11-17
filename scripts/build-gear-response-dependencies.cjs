'use strict';
// Authoring rules for the six fixed model dialogues, not a runtime/general parser.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=fs.readFileSync('data/learning/gear-question-expansion.json','utf8').replaceAll('\r\n','\n'),corpus=JSON.parse(source);
const tr=(en,es,pt)=>({en,es,pt}),tenses=['present','past','future'];
// Each tuple explicitly names dependent, head, relation, dependent class, head class.
const first={
 'how-many':tr(['two','carrots','nummod','NUM','NOUN'],['dos','zanahorias','nummod','NUM','NOUN'],['duas','cenouras','nummod','NUM','NOUN']),
 'whose':tr(['plate','mine','nsubj','NOUN','PRON'],['plato','mío','nsubj','NOUN','PRON'],['prato','meu','nsubj','NOUN','PRON']),
 'how-long':tr(['one','hour','nummod','NUM','NOUN'],['una','hora','nummod','NUM','NOUN'],['uma','hora','nummod','NUM','NOUN']),
 'how-far':tr(['one','kilometre','nummod','NUM','NOUN'],['un','kilómetro','nummod','NUM','NOUN'],['um','quilômetro','nummod','NUM','NOUN']),
 'how-often':tr(['twice','cook','advmod','ADV','VERB'],['dos','veces','nummod','NUM','NOUN'],['duas','vezes','nummod','NUM','NOUN']),
 'how-old':tr(['thirty','years','nummod','NUM','NOUN'],['treinta','años','nummod','NUM','NOUN'],['trinta','anos','nummod','NUM','NOUN'])
};
function primary(kind,lang,tense,mode){const rule=[...first[kind][lang]];if(kind==='how-often'&&lang==='en'&&tense==='past'&&mode==='affirmative')rule[1]='cooked';return rule;}
function correction(kind,lang,tense){const n=tenses.indexOf(tense);return{
 'how-many':tr(['three',['need','needed','need'][n],'obj','NUM','VERB'],['tres',['necesitamos','necesitábamos','necesitaremos'][n],'obj','NUM','VERB'],['três',['precisamos','precisávamos','precisaremos'][n],'obl','NUM','VERB']),
 'whose':tr(['it','yours','nsubj','PRON','PRON'],[['es','era','será'][n],'tuyo','cop','AUX','PRON'],[['é','era','será'][n],'seu','cop','AUX','PRON']),
 'how-long':tr(['two','hours','nummod','NUM','NOUN'],['dos','horas','nummod','NUM','NOUN'],['duas','horas','nummod','NUM','NOUN']),
 'how-far':tr(['two','kilometres','nummod','NUM','NOUN'],['dos','kilómetros','nummod','NUM','NOUN'],['dois','quilômetros','nummod','NUM','NOUN']),
 'how-often':tr(['once',['cook','cooked','cook'][n],'advmod','ADV','VERB'],['una','vez','nummod','NUM','NOUN'],['uma','vez','nummod','NUM','NOUN']),
 'how-old':tr(['guest','forty','nsubj','NOUN','NUM'],['cuarenta',['tiene','tenía','tendrá'][n],'obj','NUM','VERB'],['quarenta',['tem','tinha','terá'][n],'obj','NUM','VERB'])
 }[kind][lang];}
const output={version:'0.1.0',id:'gear-second-turn-dependencies',sourceCorpus:'data/learning/gear-question-expansion.json',sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),assessmentAuthority:false,assessmentEvidence:false,humanHomologation:'pending',structures:[]};
for(const item of corpus.items)for(const tense of tenses)for(const mode of ['affirmative','negative','interrogative'])for(const language of ['en','es','pt']){
 const questionWord=item.question.questionWord,turn=item.question.dialogueForms[tense][mode],sentence=turn.response[language];
 const tokens=[...sentence.matchAll(/[^\s¿?.;]+/gu)].map((m,i)=>({id:'w'+i,index:i+1,form:m[0],wordClass:'X',start:m.index,end:m.index+m[0].length,clause:sentence.slice(0,m.index).includes(';')?1:0}));
 const relations=[],studyTargets=[];
 const add=(id,clause,rule)=>{const [dependent,head,relation,dependentClass,headClass]=rule;const find=form=>{const matches=tokens.filter(t=>t.clause===clause&&t.form.toLowerCase()===form.toLowerCase());assert.equal(matches.length,1,`${questionWord}/${tense}/${mode}/${language}/${clause}: ambiguous or missing ${form}`);return matches[0];};const d=find(dependent),h=find(head);assert.notEqual(d.id,h.id);d.wordClass=dependentClass;h.wordClass=headClass;relations.push({head:h.id,dependent:d.id,relation});studyTargets.push({id,clause,targetTokenId:d.id,headTokenId:h.id});};
 add('primary',0,primary(questionWord,language,tense,mode));if(mode==='negative')add('correction',1,correction(questionWord,language,tense));
 output.structures.push({version:'0.1.0',id:`response-${item.experienceId}-${questionWord}-${tense}-${mode}-${language}`,language,sentence,tokens,relations,studyTargets,defaultFocus:studyTargets[0].headTokenId,pedagogy:{mode:'read-only-focus',doesNotClaim:['complete-parse','learner-evidence','green-pass','mastery']},source:{name:'SIYAYO authored second-turn relations',experienceId:item.experienceId,questionWord,tense,mode,field:'dialogueForms.response',responseKind:turn.responseKind||'model-answer',illustrative:true,notes:'Only listed target/head relations are authored. X is outside this partial analysis. Negative clauses are scoped separately; numeral ellipsis is retained.'}});
}
assert.equal(output.structures.length,162);fs.writeFileSync('data/learning/gear-response-dependencies.json',JSON.stringify(output,null,2)+'\n');
console.log('Authored 162 second-turn partial graphs and 216 clause-scoped target/head relations; original dialogue corpus unchanged.');
