const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const seeds=require('../data/learning/experience-seeds.json').items;
async function scenario(language,word,changed){
 let id=null,active=null,selected=word,experience='shopping-for-dinner',renders=0;
 const listeners={};
 const panel={dataset:{}},input={value:'entry-'+language,addEventListener(t,f){listeners[t]=f;}},confirm={addEventListener(t,f){listeners.click=f;}},status={};
 const document={getElementById(k){return {learnerIdentityPanel:panel,learnerIdentityInput:input,learnerIdentityConfirm:confirm,learnerIdentityStatus:status}[k];}};
 const root={Promise,Object,Set,Array,document,GreenPassAuthorityPolicy:require('../data/learning/green-pass-authority.json'),GreenPassProfile:require('../js/green-pass-profile'),AdaptiveEvidenceProfile:require('../js/adaptive-evidence-profile'),SIYAYOVerbExplorerLearnerIdentitySource:{getId:()=>id},SIYAYOVerbExplorerLearnerIdentityProvider:{provide(value){id=value;return true;}},SIYAYOVerbExplorerAdaptiveCoordinator:{snapshot:()=>active,clear(){active=null;}},SIYAYOVerbExplorerAdaptiveCoordinatorConfig:{configure(values){active=values;return true;}},SIYAYOVerbExplorerAdaptiveStateBridge:{getState:()=>({currentExperienceId:experience,experienceLanguage:language})},SIYAYOVerbExplorerExperienceRuntime:{activeExperienceId:()=>experience,activeQuestionWord:()=>selected,render(){renders++;}},AdaptivePedagogicalOrchestrator:require('../js/adaptive-pedagogical-orchestrator')};
 root.globalThis=root;vm.createContext(root);
 const modules=['adaptive-attempt-loop','verb-explorer-adaptive-session-source','verb-explorer-adaptive-profile-source','verb-explorer-adaptive-evidence-profile-source','verb-explorer-canonical-skill-source','leaf-assessment-target-authority','leaf-canonical-skill-bridge','verb-explorer-adaptive-composer','verb-explorer-adaptive-live-start','verb-explorer-adaptive-readiness-trigger','leaf-assessment-target-readiness','leaf-assessment-target-provider','verb-explorer-thinking-mind-assessment-selection','verb-explorer-learner-identity-surface'];
 for(const m of modules)vm.runInContext(fs.readFileSync('js/'+m+'.js','utf8'),root,{filename:m});
 root.SIYAYOVerbExplorerCanonicalSkillLoader={clear(){},async load(path){return root.SIYAYOVerbExplorerCanonicalSkillSource.adopt(JSON.parse(fs.readFileSync(path)));}};
 const selection=root.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
 const question=seeds[0].thinkingMind.find(q=>q.questionWord===word);
 await selection.select(question);assert.equal(active,null,'anonymous selection cannot start Session');
 // Pending selection must survive a lost Target and be reapplied on explicit identity confirmation.
 root.SIYAYOLeafAssessmentTargetAuthority.clear();
 if(changed==='word'){selected='where';selection.invalidatePending();}
 if(changed==='experience'){experience='preparing-dinner';selection.invalidatePending();}
 root.SIYAYOVerbExplorerLearnerIdentitySurface.install();listeners.click();
 for(let i=0;i<50;i++)await Promise.resolve();
 assert.equal(id,'entry-'+language);assert.ok(renders>0);
 if(changed){assert.equal(active,null);return;}
 assert.ok(active&&active.session,'nick creates Session directly, without WHICH detour');
 assert.equal(active.session.decision.skill,question.assessmentTarget.skill);
 assert.equal(active.session.decision.experienceId,'shopping-for-dinner');
 assert.equal(active.context.evidencePackets.length,0);
 assert.equal(root.GreenPassProfile.evaluateContract(active.context.passContract,active.context.evidencePackets).status,'WAITING_FOR_EVIDENCE');
 const original=active.session;assert.equal(await selection.resumeForIdentity(),false);assert.equal(active.session,original);
}
(async()=>{for(const l of ['en','es','pt']){await scenario(l,'what');await scenario(l,'which');await scenario(l,'what','word');await scenario(l,'what','experience');}console.log('PASS — explicit WHAT/WHICH -> nick -> canonical Session, empty contract, stale target/visit WAIT, EN/ES/PT.');})().catch(e=>{console.error(e);process.exit(1);});
