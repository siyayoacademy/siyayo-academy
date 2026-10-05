#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const contractCode=fs.readFileSync('js/question-word-assessment-contract.js','utf8');
const code=fs.readFileSync('js/verb-explorer-thinking-mind-assessment-selection.js','utf8');

function load(options={}){
  const calls=[];
  const sandbox=vm.createContext({Object,Promise});
  sandbox.globalThis=sandbox;
  vm.runInContext(contractCode,sandbox,{filename:'js/question-word-assessment-contract.js'});
  if(options.provider!==false){
    sandbox.SIYAYOLeafAssessmentTargetProvider={
      select(leaf){
        calls.push(leaf);
        return Promise.resolve(options.result===true);
      }
    };
  }
  vm.runInContext(code,sandbox,{filename:'js/verb-explorer-thinking-mind-assessment-selection.js'});
  return {api:sandbox.SIYAYOVerbExplorerThinkingMindAssessmentSelection,calls};
}

(async()=>{
  const which={
    questionWord:'which',
    assessmentTarget:{
      skill:'which.use.determiner',
      definitionPath:'data/learning/skills/which.json'
    }
  };

  {
    const t=load({result:true});
    assert.equal(await t.api.select(which),true);
    assert.equal(t.calls.length,1);
    assert.equal(t.calls[0].assessmentTarget.skill,'which.use.determiner');
    assert.equal(t.calls[0].assessmentTarget.definitionPath,'data/learning/skills/which.json');
  }

  for(const ordinary of [
    null,
    {},
    {questionWord:'which'},
    {questionWord:'which',choiceContext:{}},
    {questionWord:'what',assessmentTarget:null}
  ]){
    const t=load({result:true});
    assert.equal(await t.api.select(ordinary),false);
    assert.equal(t.calls.length,0,'questionWord/choiceContext must never infer assessment Target');
  }

  {
    const t=load({provider:false});
    assert.equal(await t.api.select(which),false);
  }

  {
    // Real producer/authority chain: the first nick must not revive an older
    // anonymous WHAT selection after the learner has chosen undeclared WHICH.
    const root={Object,Promise};root.globalThis=root;
    const context=vm.createContext(root);
    for(const name of ['question-word-assessment-contract','leaf-assessment-target-authority','leaf-assessment-target-readiness',
      'leaf-assessment-target-provider','verb-explorer-thinking-mind-assessment-selection']){
      vm.runInContext(fs.readFileSync('js/'+name+'.js','utf8'),context);
    }
    let learner=null,active=null,starts=0,clears=0;
    root.GreenPassAuthorityPolicy={contractAuthoritySkills:['what.use.object-question','which.use.determiner']};
    root.SIYAYOVerbExplorerLearnerIdentitySource={getId:()=>learner};
    root.SIYAYOVerbExplorerAdaptiveCoordinator={snapshot:()=>active};
    root.SIYAYOVerbExplorerAdaptiveReadinessTrigger={
      clear(){clears++;},
      signal(){if(learner&&root.SIYAYOLeafAssessmentTargetAuthority.getTarget()){starts++;return true;}return false;}
    };
    const api=root.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
    const what={assessmentTarget:{skill:'what.use.object-question',definitionPath:'what.json'}};
    await api.select(what);
    assert.equal(root.SIYAYOLeafAssessmentTargetAuthority.getSkill(),'what.use.object-question');
    await api.select({questionWord:'which'});
    assert.equal(root.SIYAYOLeafAssessmentTargetAuthority.getTarget(),null);
    learner='First';
    assert.equal(await root.SIYAYOVerbExplorerAdaptiveReadinessTrigger.signal(),false);
    assert.equal(starts,0,'nick cannot resurrect stale WHAT');
    learner=null;
    await api.select(what);await api.select(which);
    learner='First';
    assert.equal(await root.SIYAYOVerbExplorerAdaptiveReadinessTrigger.signal(),true);
    assert.equal(root.SIYAYOLeafAssessmentTargetAuthority.getSkill(),'which.use.determiner');
    const before=clears;
    active={session:{decision:{skill:'which.use.determiner'}}};
    await api.select({questionWord:'where'});
    assert.equal(clears,before,'identified active assessment survives exploration');
    learner=null;active=null;
    await api.select(what);
    api.invalidatePending();
    assert.equal(root.SIYAYOLeafAssessmentTargetAuthority.getTarget(),null,'free navigation invalidates pending origin');
  }

  console.log('Thinking Mind assessment selection: PASS — only an explicitly declared assessmentTarget is forwarded; questionWord, choiceContext, and Experience semantics never infer Skill.');
})().catch(error=>{console.error(error);process.exit(1);});
