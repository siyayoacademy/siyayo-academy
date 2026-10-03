// Canonical Thinking Mind Information Gap Resolver.
// Resolves the information need already declared by an Experience question.
// It never infers assessment Skill, creates learner Evidence, releases WAIT,
// or chooses a Question Word that the Experience did not declare.
(function(root){
'use strict';

var INTENTION_TO_FOCUS=Object.freeze({
  'thing-or-action':'thing-information',
  'thing':'thing-information',
  'information':'thing-information',
  'place':'place',
  'time':'time',
  'person':'person',
  'choice':'delimited-choice',
  'delimited-choice':'delimited-choice',
  'reason':'reason',
  'manner':'manner-method',
  'method':'manner-method',
  'quantity':'amount-price',
  'amount':'amount-price',
  'price':'amount-price',
  'count':'countable-quantity',
  'countable-quantity':'countable-quantity',
  'possession':'possession',
  'object-person':'object-person',
  'duration':'duration-length',
  'length':'duration-length',
  'distance':'distance',
  'frequency':'frequency',
  'age':'age'
});

function normalize(value){
  return typeof value==='string'?value.trim().toLowerCase():null;
}

function capabilityList(source){
  if(Array.isArray(source))return source;
  if(source&&Array.isArray(source.canonical))return source.canonical;
  return [];
}

function resolve(question,capabilities){
  if(!question||typeof question!=='object')return null;
  var questionWord=normalize(question.questionWord);
  var intention=normalize(question.intention);
  if(!questionWord||!intention)return null;

  var capability=capabilityList(capabilities).find(function(item){
    return normalize(item&&item.questionWord)===questionWord;
  });
  if(!capability)return null;

  var expectedFocus=INTENTION_TO_FOCUS[intention]||intention;
  var capabilityFocus=normalize(capability.intention);
  if(!capabilityFocus||capabilityFocus!==expectedFocus)return null;

  return Object.freeze({
    questionWord:questionWord,
    intention:intention,
    informationFocus:capabilityFocus,
    skill:typeof capability.skill==='string'?capability.skill:null,
    source:'experience-thinking-mind',
    opportunityOnly:true,
    evidenceProduced:false
  });
}

function resolveExperience(experience,capabilities){
  return ((experience&&experience.thinkingMind)||[]).map(function(question,index){
    var resolution=resolve(question,capabilities);
    return resolution?Object.freeze({index:index,resolution:resolution}):null;
  }).filter(Boolean);
}

root.SIYAYOThinkingMindInformationGapResolver=Object.freeze({
  resolve:resolve,
  resolveExperience:resolveExperience,
  intentionToFocus:INTENTION_TO_FOCUS
});
})(typeof globalThis!=='undefined'?globalThis:this);
