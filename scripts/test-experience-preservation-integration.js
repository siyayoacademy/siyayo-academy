const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('js/verb-explorer.js','utf8'),html=fs.readFileSync('verb-explorer.html','utf8');
const experiences=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
assert.equal((html.match(/id="previousExperience"/g)||[]).length,1);
const functions=code.slice(code.indexOf('function previousExperienceCandidate()'),code.indexOf('function renderExperience()'));

const renderBody=code.slice(code.indexOf('function renderExperience()'),code.indexOf('function canonicalExperienceLine()'));
assert.ok(
  renderBody.includes('SIYAYOVerbExplorerPedagogicalSessionAdoptionSurface')&&
  renderBody.includes("install({document})"),
  'renderExperience must refresh the adoption surface after canonical previous/next/browser navigation'
);
let visits=[];const r={experiences,currentExperienceId:'preparing-dinner',experienceLanguage:'es',window:{SIYAYOVerbExplorerExperienceNavigation:{goToExperience(id){visits.push(id);return true;}}}};
vm.createContext(r);vm.runInContext(functions,r);
for(const [current,previous] of [['preparing-dinner','shopping-for-dinner'],['having-dinner','preparing-dinner'],['after-dinner-conversation','having-dinner'],['shopping-for-dinner','after-dinner-conversation']]){
 r.currentExperienceId=current;assert.equal(r.previousExperienceCandidate().id,previous);assert.equal(r.visitPreviousExperience(),true);assert.equal(visits.at(-1),previous);
}
r.currentExperienceId='missing';assert.equal(r.visitPreviousExperience(),false);
const start=code.indexOf('adoptAssessmentPresentation:skill=>{'),end=code.indexOf('\n  refreshAssessmentHighlight:',start);
const body=code.slice(start,end).replace('adoptAssessmentPresentation:skill=>','').replace(/,\s*$/,'');
let renders=0;r.activeExperience=()=>experiences.find(x=>x.id==='preparing-dinner');r.chooseThinkingQuestion=(x,i)=>{r.selected=x.thinkingMind[i].questionWord;return true;};r.renderExperience=()=>{renders++;};
vm.runInContext('adopt=skill=>'+body,r);
assert.equal(r.adopt('what.use.object-question'),true);assert.equal(r.selected,'what');assert.equal(renders,1);
assert.equal(r.adopt('undeclared'),false);assert.equal(renders,1);
console.log('PASS: reverse canonical visits delegate to existing navigation; successful adoption selects its corpus target and renders once; undeclared targets do not render.');
