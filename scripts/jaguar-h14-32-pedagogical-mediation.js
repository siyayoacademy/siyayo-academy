'use strict';
// H14.32 mediation of TWO teacher reviews for synthetic study cases only.
const comparator=require('./jaguar-h14-31-two-reviewer-consistency.js');
const STATES=comparator.STATES,EXPRESSION=comparator.EXPRESSION;
const validMediator=m=>m&&m.role==='PEDAGOGICAL_MEDIATOR'&&/^[A-Za-z0-9_-]{2,40}$/.test(m.mediatorId||'')&&
 STATES.includes(m.proposedState)&&EXPRESSION.includes(m.proposedExpression)&&
 (m.proposedBand===null||(Number.isInteger(m.proposedBand)&&m.proposedBand>=0&&m.proposedBand<=4))&&
 typeof m.rationale==='string'&&m.rationale.trim().length>=25&&
 Array.isArray(m.supportingCaseFacts)&&m.supportingCaseFacts.every(x=>typeof x==='string'&&x.trim().length>5)&&
 typeof m.sourceStatus==='string'&&['GROUNDED_IN_SCENE','UNVERIFIED','CONTRADICTED','NOT_APPLICABLE'].includes(m.sourceStatus)&&
 m.learnerId===undefined&&m.attemptId===undefined&&m.evidence===undefined;
function mediate({caseId,reviews=[],mediator=null}={}){
 const comparison=comparator.inspect(caseId,reviews);
 const common={caseId,sourceComparisonStatus:comparison.status,
  academicOnly:true,assessmentAuthority:false,evidence:false,greenPass:false,canonicalProgress:null};
 if(comparison.reviewers!==2)return Object.freeze({...common,status:'BLOCKED_REVIEW_SET',decision:null});
 if(!mediator)return Object.freeze({...common,status:'AWAITING_MEDIATOR',decision:null});
 if(!validMediator(mediator)||reviews.some(r=>r.reviewerId===mediator.mediatorId))
  return Object.freeze({...common,status:'INVALID_MEDIATION',decision:null});
 const sourceSensitive=comparison.flags?.includes('SOURCE_PREMISE_OR_REFERENT_REVIEW')||
   comparison.flags?.includes('INDEPENDENCE_REVIEW')||
   comparison.status==='NEEDS_SOURCE_OR_INDEPENDENCE_REVIEW';
 if(sourceSensitive&&mediator.sourceStatus!=='GROUNDED_IN_SCENE'&&mediator.sourceStatus!=='NOT_APPLICABLE')
  return Object.freeze({...common,status:'UNRESOLVED_SOURCE_PREMISE',decision:null});
 if(sourceSensitive&&mediator.proposedState==='COHERENT'&&mediator.sourceStatus!=='GROUNDED_IN_SCENE')
  return Object.freeze({...common,status:'UNRESOLVED_SOURCE_PREMISE',decision:null});
 if(mediator.sourceStatus==='CONTRADICTED'&&mediator.proposedState==='COHERENT')
  return Object.freeze({...common,status:'CONTRADICTED_MEDIATION',decision:null});
 const decision=Object.freeze({mediatorId:mediator.mediatorId,reviewedStates:Object.freeze(reviews.map(r=>r.state)),
  proposedState:mediator.proposedState,proposedBand:mediator.proposedBand,
  proposedExpression:mediator.proposedExpression,rationale:mediator.rationale,
  caseFacts:Object.freeze([...mediator.supportingCaseFacts]),sourceStatus:mediator.sourceStatus,
  status:'PEDAGOGICAL_PROPOSAL_ONLY'});
 return Object.freeze({...common,status:'MEDIATION_PROPOSAL_RECORDED',decision});
}
module.exports=Object.freeze({mediate});
if(require.main===module)console.log('H14.32 teacher mediation protocol ready for supplied reviews; no reviews were collected');
