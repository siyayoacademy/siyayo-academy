const assert=require('node:assert/strict');
const Profile=require('../js/green-pass-profile.js');
for(const name of ['which','what','why']){
  const skill=require('../data/learning/skills/'+name+'.json');
  const [fn,local,transfer]=skill.passContract.requires;
  for(const language of ['en','es','pt']){
    const packet=(requirement,extra={})=>({skill:skill.id,...requirement,context:{language},...extra});
    const f=packet(fn),l=packet(local),t=packet(transfer);
    for(const incomplete of [[f,t],[f,l],[f,t,t],[f,{...l,mode:undefined},t],
      [f,{...l,mode:'free-production'},t],[f,{...l,result:'fail'},t],
      [f,{...l,support:'audio'},t]]){
      assert.equal(Profile.evaluateContract(skill.passContract,incomplete).status,'WAITING_FOR_EVIDENCE');
    }
    const missing=Profile.evaluateContract(skill.passContract,[f,t]).missing;
    assert.ok(missing.some(r=>r.mode==='local'),'transfer cannot satisfy local use');
    assert.equal(Profile.evaluateContract(skill.passContract,[f,l,t]).status,'GREEN_PASS');
  }
}
console.log('Local/transfer separation: PASS for WHICH, WHAT and WHY with EN/ES/PT-tagged packets.');
