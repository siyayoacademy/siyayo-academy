// V30.3 isolated bridge: NOT production authentication, NOT a deployable Worker.
// The identity registry and policy are explicitly simulated and injected by the test harness.
import {verifyMockIdentity, authorizeMockOccurrence} from '../test/identity-mock/identity.mjs';
import {createHash} from 'node:crypto';

const fail = (reason) => ({ok:false,reason});
const sha = (s) => createHash('sha256').update(s).digest('hex');
const canonical = (o) => JSON.stringify(Object.fromEntries(Object.entries(o).sort(([a],[b])=>a.localeCompare(b))));
const scopeFor = (r) => `${r.questionWord}/${r.language}/${r.experienceId}`;

export async function processLabOccurrence({proof,request,registry,policies,db,now}) {
  if(!db || typeof db.prepare !== 'function') return fail('storage_unavailable');
  const verified = verifyMockIdentity(proof,registry,now);
  if(!verified.ok) return fail('unauthenticated');
  if(!request || !['exploration','assessment'].includes(request.purpose)) return fail('invalid_purpose');
  if(request.event === null || typeof request.event !== 'object' || Array.isArray(request.event)) return fail('invalid_request');
  // Fail closed on nested attempts at authority injection too.
  const forbidden = new Set(['subject','learner_subject','status','credit','credits','greenPass','confirmed','scope_key']);
  const containsForbidden = (v, depth=0) => depth>12 || (v && typeof v==='object' && Object.entries(v).some(([k,x])=>forbidden.has(k)||containsForbidden(x,depth+1)));
  if(containsForbidden(request.event)) return fail('invalid_request');
  const auth = authorizeMockOccurrence(verified,request,policies);
  if(!auth.ok) return fail(auth.reason);
  const {subject} = verified.identity;
  const scope = scopeFor(request);
  const status = request.purpose === 'exploration' ? 'observed_exploratory' : 'pending';
  const payload = canonical(request.event);
  const digest = sha(payload);
  try {
    const ins = await db.prepare(`INSERT INTO v30_occurrences
      (learner_subject,scope_key,occurrence_id,purpose,status,contract_version,payload_sha256,payload_json)
      VALUES (?,?,?,?,?,?,?,?)
      ON CONFLICT(learner_subject,scope_key,occurrence_id) DO NOTHING`)
      .bind(subject,scope,request.occurrenceId,request.purpose,status,request.contractVersion,digest,payload).run();
    const row = await db.prepare(`SELECT learner_subject,scope_key,occurrence_id,purpose,status,contract_version,payload_sha256,payload_json
      FROM v30_occurrences WHERE learner_subject=? AND scope_key=? AND occurrence_id=?`)
      .bind(subject,scope,request.occurrenceId).first();
    if(!row || row.learner_subject!==subject || row.scope_key!==scope || !['pending','observed_exploratory'].includes(row.status) || row.status !== (row.purpose==='exploration'?'observed_exploratory':'pending') || sha(row.payload_json)!==row.payload_sha256) return fail('integrity_failure');
    if(row.purpose!==request.purpose || row.contract_version!==request.contractVersion || row.payload_sha256!==digest || row.payload_json!==payload) return fail('occurrence_conflict');
    return {ok:true,receipt:ins.meta?.changes===1?'created':'duplicate',occurrenceId:row.occurrence_id,purpose:row.purpose,status:row.status};
  } catch {return fail('storage_failure');}
}

export async function readLabOccurrence({proof,request,registry,policies,db,now}) {
  if(!db || typeof db.prepare!=='function') return fail('storage_unavailable');
  const verified = verifyMockIdentity(proof,registry,now);
  if(!verified.ok) return fail('unauthenticated');
  if(!request || !['exploration','assessment'].includes(request.purpose)) return fail('invalid_purpose');
  // Reauthorize reads with the same identity, skill, language, experience and contract boundary.
  const auth = authorizeMockOccurrence(verified,{...request,event:{}},policies);
  if(!auth.ok) return fail(auth.reason);
  const subject=verified.identity.subject, scope=scopeFor(request);
  try {
    const row=await db.prepare(`SELECT learner_subject,scope_key,occurrence_id,purpose,status,contract_version,payload_sha256,payload_json
      FROM v30_occurrences WHERE learner_subject=? AND scope_key=? AND occurrence_id=?`)
      .bind(subject,scope,request.occurrenceId).first();
    if(!row) return fail('not_found');
    if(row.learner_subject!==subject || row.scope_key!==scope || row.purpose!==request.purpose || row.contract_version!==request.contractVersion) return fail('not_found');
    if(row.status !== (row.purpose==='exploration'?'observed_exploratory':'pending') || sha(row.payload_json)!==row.payload_sha256) return fail('integrity_failure');
    return {ok:true,occurrenceId:row.occurrence_id,purpose:row.purpose,status:row.status,event:JSON.parse(row.payload_json)};
  } catch{return fail('storage_failure');}
}