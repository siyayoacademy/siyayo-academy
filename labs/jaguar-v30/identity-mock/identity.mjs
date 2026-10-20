// V30.2: pure test-only boundary. NOT authentication. Never deploy.
export function verifyMockIdentity(proof, registry, now) {
  if (!proof || typeof proof !== 'object' || Array.isArray(proof)) return {ok:false, reason:'unauthenticated'};
  if (Object.keys(proof).sort().join(',') !== 'aud,exp,iat,iss,sessionId,subject,ticket') return {ok:false,reason:'invalid_proof'};
  if (typeof proof.ticket !== 'string' || !proof.ticket) return {ok:false, reason:'invalid_proof'};
  const record=registry?.get(proof.ticket);
  if (!record || record.revoked) return {ok:false,reason:'unauthenticated'};
  if (record.iss!==proof.iss || record.aud!==proof.aud || record.subject!==proof.subject || record.sessionId!==proof.sessionId || record.iat!==proof.iat || record.exp!==proof.exp) return {ok:false,reason:'invalid_proof'};
  if (record.iss!=='mock-v30-local' || record.aud!=='v30-identity-lab') return {ok:false,reason:'invalid_proof'};
  if (!Number.isSafeInteger(now) || !Number.isSafeInteger(record.iat) || !Number.isSafeInteger(record.exp) || record.iat>now || record.exp<=now) return {ok:false,reason:'expired'};
  return {ok:true, identity:Object.freeze({subject:record.subject,sessionId:record.sessionId})};
}
export function authorizeMockOccurrence(verified, request, policy) {
  if (!verified?.ok || !verified.identity?.subject) return {ok:false,reason:'unauthenticated'};
  if (!request || typeof request!=='object' || Array.isArray(request)) return {ok:false,reason:'invalid_request'};
  const allowed=new Set(['occurrenceId','skillId','language','experienceId','questionWord','purpose','contractVersion','event']);
  if (Object.keys(request).some(k=>!allowed.has(k)) || !request.event || typeof request.event!=='object' || Array.isArray(request.event)) return {ok:false,reason:'invalid_request'};
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(request.occurrenceId||'')) return {ok:false,reason:'invalid_request'};
  const p=policy?.get(verified.identity.subject);
  if (!p || !p.some(rule=>['skillId','language','experienceId','questionWord','purpose','contractVersion'].every(k=>rule[k]===request[k]))) return {ok:false,reason:'forbidden'};
  if (Object.keys(request.event).some(k=>['subject','learner_subject','status','credit','greenPass','confirmed','scope_key'].includes(k))) return {ok:false,reason:'invalid_request'};
  // Never return an evaluative decision. Mock result allows only pending/exploratory behavior.
  return {ok:true, occurrence:Object.freeze({subject:verified.identity.subject,occurrenceId:request.occurrenceId,scope:`${request.questionWord}/${request.language}/${request.experienceId}`,status:request.purpose==='exploration'?'observed_exploratory':'pending',event:structuredClone(request.event)})};
}
