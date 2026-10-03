#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/leaf-canonical-skill-bridge.js','utf8');

function build({target=null,loadResult=true,loadedSkill='which.use.determiner',reject=false,withAuthority=true,withLoader=true,withSource=true}={}){
  const calls=[];
  const sandbox=vm.createContext({Object,Promise});
  sandbox.globalThis=sandbox;
  if(withAuthority)sandbox.SIYAYOLeafAssessmentTargetAuthority={getTarget:()=>target};
  if(withLoader)sandbox.SIYAYOVerbExplorerCanonicalSkillLoader={load:path=>{calls.push(path);return reject?Promise.reject(new Error('loader failed')):Promise.resolve(loadResult);}};
  if(withSource)sandbox.SIYAYOVerbExplorerCanonicalSkillSource={getSkill:()=>loadedSkill};
  vm.runInContext(code,sandbox,{filename:'js/leaf-canonical-skill-bridge.js'});
  return {bridge:sandbox.SIYAYOLeafCanonicalSkillBridge,calls};
}

(async()=>{
  {
    const {bridge,calls}=build();
    assert.equal(await bridge.loadTarget(),false,'missing Target must WAIT');
    assert.deepEqual(calls,[],'WAIT must not call Loader');
  }

  {
    const target={skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'};
    const {bridge,calls}=build({target});
    assert.equal(await bridge.loadTarget(),true);
    assert.deepEqual(calls,['data/learning/skills/which.json'],'bridge must load the exact explicit Target path');
  }

  for(const target of [
    {},
    {skill:'which.use.determiner'},
    {definitionPath:'data/learning/skills/which.json'},
    {skill:' ',definitionPath:'data/learning/skills/which.json'},
    {skill:'which.use.determiner',definitionPath:' '}
  ]){
    const {bridge,calls}=build({target});
    assert.equal(await bridge.loadTarget(),false,'incomplete Target must WAIT');
    assert.deepEqual(calls,[]);
  }

  {
    const target={skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'};
    const {bridge}=build({target,loadResult:false});
    assert.equal(await bridge.loadTarget(),false,'Loader rejection must not advance');
  }

  {
    const target={skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'};
    const {bridge}=build({target,reject:true});
    assert.equal(await bridge.loadTarget(),false,'Loader failure must remain fail-closed');
  }

  {
    const target={skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'};
    const {bridge}=build({target,loadedSkill:'different.skill'});
    assert.equal(await bridge.loadTarget(),false,'loaded definition must match the explicit Leaf Target skill');
  }

  for(const options of [{withAuthority:false},{withLoader:false},{withSource:false}]){
    const target={skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'};
    const {bridge}=build({target,...options});
    assert.equal(await bridge.loadTarget(),false,'missing dependency must WAIT');
  }

  console.log('Leaf Canonical Skill Bridge: PASS — WAIT without Target; exact explicit path only; Loader/source failure or Skill mismatch never advances.');
})().catch(error=>{console.error(error);process.exit(1);});
