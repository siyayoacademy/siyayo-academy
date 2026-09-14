#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/leaf-assessment-target-authority.js','utf8');

function build(policy=true){
  const sandbox=vm.createContext({Object,Array});
  sandbox.globalThis=sandbox;
  if(policy){
    sandbox.GreenPassAuthorityPolicy=Object.freeze({contractAuthoritySkills:['which.use.determiner']});
  }
  vm.runInContext(code,sandbox,{filename:'js/leaf-assessment-target-authority.js'});
  return sandbox.SIYAYOLeafAssessmentTargetAuthority;
}

{
  const authority=build();
  assert.equal(authority.getTarget(),null,'Leaf starts in WAIT');
  assert.equal(authority.getSkill(),null);
  assert.equal(authority.getDefinitionPath(),null);

  assert.equal(authority.adopt({
    skill:'which.use.determiner',
    definitionPath:'data/learning/skills/which.json'
  }),true);

  assert.deepEqual(
    JSON.parse(JSON.stringify(authority.getTarget())),
    {skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'}
  );
  assert.equal(authority.getSkill(),'which.use.determiner');
  assert.equal(authority.getDefinitionPath(),'data/learning/skills/which.json');

  assert.equal(authority.adopt({skill:'verb-function',definitionPath:'data/learning/skills/which.json'}),false,'legacy fallback is not a canonical Leaf Target');
  assert.equal(authority.getSkill(),'which.use.determiner','invalid replacement must not erase valid Target');

  authority.clear();
  assert.equal(authority.getTarget(),null,'clear returns Leaf to WAIT');
}

for(const target of [
  null,
  {},
  {skill:'which.use.determiner'},
  {definitionPath:'data/learning/skills/which.json'},
  {skill:'',definitionPath:'data/learning/skills/which.json'},
  {skill:'which.use.determiner',definitionPath:'   '}
]){
  const authority=build();
  assert.equal(authority.adopt(target),false,'incomplete Target must WAIT');
  assert.equal(authority.getTarget(),null);
}

{
  const authority=build(false);
  assert.equal(authority.adopt({skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'}),false,'missing contract authority policy must WAIT');
  assert.equal(authority.getTarget(),null);
}

{
  const authority=build();
  assert.equal(authority.adopt({skill:'  which.use.determiner  ',definitionPath:'  data/learning/skills/which.json  '}),true);
  assert.equal(authority.getSkill(),'which.use.determiner');
  assert.equal(authority.getDefinitionPath(),'data/learning/skills/which.json');
}

console.log('Leaf Assessment Target Authority: PASS — only an explicit contract-authority Skill + definition path resolves Target; otherwise Leaf remains WAIT.');
