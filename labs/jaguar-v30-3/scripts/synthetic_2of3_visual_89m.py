#!/usr/bin/env python3
"""89M: synthetic 2/3 via original canonical renderers, NEVER real learner evidence."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8879/verb-explorer.html?mode=experience"
OUT = Path("visual-audit-89m")
OUT.mkdir(exist_ok=True)
LANGS = {
 "en":("LAB SIMULATION · SYNTHETIC 2/3 · NO REAL LEARNER","CHOICE ● · USE ● · TRANSFER ○ · 2/3","TRANSFER READY"),
 "es":("SIMULACIÓN DE LABORATORIO · 2/3 SINTÉTICO · SIN ALUMNO REAL","ELECCIÓN ● · USO ● · TRANSFERENCIA ○ · 2/3","TRANSFERENCIA PENDIENTE"),
 "pt":("SIMULAÇÃO DE LABORATÓRIO · 2/3 SINTÉTICO · SEM ALUNO REAL","ESCOLHA ● · USO ● · TRANSFERÊNCIA ○ · 2/3","TRANSFERÊNCIA PENDENTE")
}
JS = r"""({language,badge})=>{
 const w=window,d=document,skill='which.use.determiner',origin='shopping-for-dinner';
 const needed=['GreenPassProfile','AdaptivePassContractProgressView',
  'AdaptiveLearnerProgressMarker','AdaptiveLearnerTrailLabel',
  'AdaptiveLearnerTrailPosition','SIYAYOVerbExplorerLearnerTrailSurface',
  'SIYAYOVerbExplorerPolyglotWordPathView'];
 for(const name of needed)if(!w[name])throw Error('MISSING PINNED MODULE '+name);
 const id=w.SIYAYOVerbExplorerLearnerIdentitySource?.getId?.();
 if(!id)throw Error('Synthetic learner missing');
 const s={learnerId:id,skill,language,originExperienceId:origin,
  key:JSON.stringify([id,skill,language,origin])};
 const contract={requires:[
  {dimension:'choice-function',result:'pass'},
  {dimension:'determiner-use',result:'pass',support:'none',mode:'local'},
  {dimension:'determiner-use',result:'pass',support:'none',mode:'transfer'}]};
 const packets=[
  {skill,dimension:'choice-function',result:'pass',scopeKey:s.key,
   context:{language,experienceId:origin,selectedAlternativeId:'cheese'}},
  {skill,dimension:'determiner-use',result:'pass',support:'none',mode:'local',scopeKey:s.key,
   context:{language,experienceId:origin,selectedAlternativeId:'cheese'}}];
 const score=w.AdaptivePassContractProgressView.project(contract,packets,w.GreenPassProfile);
 if(score.completed!==2||score.status!=='WAITING_FOR_EVIDENCE'||score.satisfied.join(',')!=='true,true,false')
  throw Error('Canonical 2/3 assessment projection mismatch');
 const person={id};
 const identity={getId:()=>id};
 const assessment={session:{decision:{skill,experienceId:origin,assessmentScope:s}},
  context:{assessmentScope:s,passContract:contract,evidencePackets:packets}};
 const foot={source:'lab-observation-only',status:'observed',experienceId:origin,
  confirmed:false,contractStatus:null};
 const trailView={project:(_p,key)=>({skill:key,footprints:key===skill?[foot]:[],
  counts:{legacyFootprints:0}})};
 const marker=w.AdaptiveLearnerProgressMarker.resolve(trailView.project(person,skill));
 if(marker.marker!=='PARTIAL_DOT'||marker.confirmedExperiences!==0)
  throw Error('Synthetic evidence must NOT create Green closure');
 const source={getSkill:()=>skill,getDefinition:()=>({
  id:skill,language:'en',form:'which',family:'question-word',
  grammarRole:'interrogative-determiner',realizations:{
   en:{form:'which',family:'question-word',grammarRole:'interrogative-determiner'},
   es:{form:'cuál',family:'palabra-interrogativa',grammarRole:'determinante-interrogativo'},
   pt:{form:'qual',family:'palavra-interrogativa',grammarRole:'determinante-interrogativo'}}})};
 const scopeApi={valid:x=>Boolean(x?.key&&x.learnerId===id),
  same:(x,y)=>x?.key===y?.key,
  ownsPacket:(x,p)=>p?.scopeKey===x.key&&p.skill===x.skill&&p.context?.language===x.language};
 const selection={getRetainedProgress:()=>[],getRetainedEvidence:()=>[]};
 w.SIYAYOVerbExplorerExperienceRuntime={
  activeLanguage:()=>language,activeQuestionWord:()=>'which',activeExperienceId:()=>origin};
 // Replaces DOM in a disposable LOCAL runner browser only. No code/deploy/data is written.
 d.body.innerHTML='<div class="stage-viewport" data-preview="auto" data-siyayo-responsive-viewport>'+
  '<main class="verb-explorer" style="max-width:980px;margin:auto;padding:12px">'+
  '<p id="simulationNotice" style="padding:12px;border:2px dashed gold;color:#f2d88a;'+
  'font-size:14px;font-weight:bold;text-align:center">'+badge+'</p>'+
  '<details id="learningTrailWordPathModule" class="learning-trail-word-path-module" open>'+
  '<summary class="learning-trail-word-path-trigger">LAB · 2/3 CANONICAL RENDERER</summary>'+
  '<div id="learningTrailWordPathPanel" class="learning-trail-word-path-panel">'+
  '<section id="learnerTrailSurface" class="learner-trail-surface"></section>'+
  '</div></details>'+
  '<div class="toroidal-next" style="margin:14px auto;padding:12px">'+
  '<button id="nextExperience" data-next-experience="preparing-dinner">NEXT → TEST ONLY</button>'+
  '</div></main></div>';
 const ok=w.SIYAYOVerbExplorerLearnerTrailSurface.refresh({
  document:d,language,profileSource:{getProfile:()=>person},skillSource:source,
  labelView:w.AdaptiveLearnerTrailLabel,trailView,
  markerAuthority:w.AdaptiveLearnerProgressMarker,
  sequenceView:{project:t=>({skill:t.skill,segments:[
   {experienceId:origin,state:'IN_PROGRESS',marker:'PARTIAL_DOT'}]})},
  positionView:w.AdaptiveLearnerTrailPosition,
  stateBridge:{getState:()=>({currentExperienceId:origin})},
  coordinator:{snapshot:()=>assessment},
  progressView:w.AdaptivePassContractProgressView,contractEvaluator:w.GreenPassProfile});
 if(!ok)throw Error('Original Trail renderer failed');
 d.querySelectorAll('#learnerTrailSurface .learner-journey').forEach(node=>node.remove());
 const matrix=w.SIYAYOVerbExplorerPolyglotWordPathView.render({
  language,profile:person,identity,selection,trailView,
  markerAuthority:w.AdaptiveLearnerProgressMarker,scopeApi,snapshot:assessment,
  progressView:w.AdaptivePassContractProgressView,evaluator:w.GreenPassProfile,
  catalog:w.SIYAYOVerbExplorerExperienceNavigation});
 if(!matrix)throw Error('Original Word Path renderer failed');
 d.querySelector('#learningTrailWordPathPanel').insertAdjacentHTML('beforeend',matrix);
 return {
  marks:d.querySelector('.learner-trail-contract-progress')?.textContent||'',
  marker:d.querySelector('#learnerTrailSurface')?.dataset?.marker,
  matrix:d.querySelector('.wp-poly-cell[data-skill="which.use.determiner"][data-language="'+language+'"] .wp-poly-value')?.textContent,
  next:d.querySelector('#nextTransferInvitation')?.textContent||'',
  accepted:d.querySelectorAll('.wp-evidence-requirement[data-accepted="true"]').length,
  pending:d.querySelectorAll('.wp-evidence-requirement[data-accepted="false"]').length,
  warning:!!d.querySelector('#simulationNotice'),
  bodyOverflow:d.documentElement.scrollWidth>innerWidth+2
 };
}"""
RESULTS=[]
with sync_playwright() as p:
    browser=p.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
    for mode,(width,height) in {"desktop":(1440,900),"portrait":(390,844)}.items():
        for lang,(badge,marks,hint) in LANGS.items():
            result={"mode":mode,"language":lang}
            RESULTS.append(result)
            ctx=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
            page=ctx.new_page()
            try:
                page.goto(URL,wait_until="domcontentloaded",timeout=25000)
                page.wait_for_timeout(500)
                if not page.locator("#experienceView").is_visible():
                    page.locator('[data-mode="experience"]').click()
                if mode=="portrait":page.locator('button[data-preview="portrait"]').click()
                if page.locator("#learnerIdentityInput").is_visible():
                    page.locator("#learnerIdentityInput").fill("SIMULATED-89M")
                    page.locator("#learnerIdentityConfirm").click()
                page.locator(f'[data-experience-language="{lang}"]').click()
                details=page.locator("#learningTrailWordPathModule")
                if not details.evaluate("(e)=>e.open"):details.locator(":scope > summary").click()
                page.wait_for_timeout(250)
                scroll=page.locator(".wp-poly-scroller").first.evaluate("""el=>{
                  const diff=el.scrollWidth-el.clientWidth;el.scrollLeft=el.scrollWidth;
                  return {available:diff>0,offset:el.scrollLeft,
                    pageOverflow:document.documentElement.scrollWidth>innerWidth+2};
                }""")
                result["baselineScroll"]=scroll
                if scroll["pageOverflow"]:raise AssertionError("Original page horizontal overflow")
                if mode=="portrait" and not(scroll["available"] and scroll["offset"]>0):
                    raise AssertionError("Original Portuguese column is not horizontally reachable")
                view=page.evaluate(JS,{"language":lang,"badge":badge})
                result["fixture"]=view
                if not(view["warning"] and view["marker"]=="PARTIAL_DOT" and
                       view["matrix"]=="2/3" and marks in view["marks"] and
                       hint in view["next"] and view["accepted"]==2 and
                       view["pending"]==1 and not view["bodyOverflow"]):
                    raise AssertionError("Simulation invariant mismatch: "+repr(view))
                page.locator("#learningTrailWordPathModule").screenshot(
                    path=str(OUT/f"simulated-2of3-{mode}-{lang}.png"),animations="disabled")
                result["passed"]=True
            except Exception as error:
                result["passed"]=False
                result["error"]=str(error)[:1200]
                try:page.screenshot(path=str(OUT/f"diagnostic-{mode}-{lang}.png"),full_page=True)
                except Exception:pass
            finally:ctx.close()
    browser.close()
(OUT/"report.json").write_text(json.dumps({
 "elo":"V30.3.89M","sourcePin":"c7e83709cacf8479847df0f3cee4ed8a563aaae6",
 "syntheticOnly":True,"genuineAssessment":False,"cloudflareChanged":False,
 "results":RESULTS},ensure_ascii=False,indent=2),encoding="utf-8")
for r in RESULTS:print(r["mode"],r["language"],"PASS" if r["passed"] else "FAIL",r.get("error",""),r.get("baselineScroll",""))
print("STRICT 89M PASSED",sum(r["passed"] for r in RESULTS),"/6")
if not all(r["passed"] for r in RESULTS):raise SystemExit(1)
