// Canonical boundary between a Question Word capability and an evaluative skill.
// Capability identifies an information-gap opportunity. Assessment exists only
// when the Experience explicitly declares assessmentTarget / assessmentResumeTarget.
// This module never infers a skill, loads a definition, creates a Session,
// produces Evidence, evaluates a Pass Contract, or authorizes navigation.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOQuestionWordAssessmentContract=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function text(value){return typeof value==='string'?value.trim():'';}
  function declaredTarget(value){
    if(!value||typeof value!=='object')return null;
    var skill=text(value.skill),definitionPath=text(value.definitionPath);
    return skill&&definitionPath?Object.freeze({skill:skill,definitionPath:definitionPath}):null;
  }
  function inspect(question,capabilityResolution){
    if(!question||typeof question!=='object')return null;
    var questionWord=text(question.questionWord).toLowerCase();
    if(!questionWord)return null;
    var capabilitySkill=text(capabilityResolution&&capabilityResolution.skill);
    var capabilityWord=text(capabilityResolution&&capabilityResolution.questionWord).toLowerCase();
    if(capabilityResolution&&(
      capabilityWord!==questionWord||
      capabilityResolution.opportunityOnly!==true||
      capabilityResolution.evidenceProduced!==false
    ))return null;

    var start=declaredTarget(question.assessmentTarget);
    var resume=declaredTarget(question.assessmentResumeTarget);
    if(start&&resume&&start.skill!==resume.skill)return null;

    var assessment=start||resume;
    return Object.freeze({
      questionWord:questionWord,
      capabilitySkill:capabilitySkill||null,
      assessmentSkill:assessment?assessment.skill:null,
      definitionPath:assessment?assessment.definitionPath:null,
      status:start?'ASSESSMENT_DECLARED':resume?'ASSESSMENT_RESUME_ONLY':'OPPORTUNITY_ONLY',
      assessmentDeclared:!!start,
      resumeOnly:!start&&!!resume,
      evidenceProduced:false,
      automaticPromotion:false
    });
  }
  function targetForSelection(question,capabilityResolution){
    var contract=inspect(question,capabilityResolution);
    if(!contract||(!contract.assessmentDeclared&&!contract.resumeOnly))return null;
    return Object.freeze({
      skill:contract.assessmentSkill,
      definitionPath:contract.definitionPath,
      resumeOnly:contract.resumeOnly
    });
  }
  return Object.freeze({inspect:inspect,targetForSelection:targetForSelection});
});
