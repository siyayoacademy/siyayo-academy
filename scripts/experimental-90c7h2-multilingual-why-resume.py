#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,traceback
out=Path("visual-audit-90c7h2");out.mkdir(exist_ok=True)
def progress(page):
 return page.evaluate("""() => {const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();const p=s?.context&&window.AdaptivePassContractProgressView.project(s.context.passContract,s.context.evidencePackets,window.GreenPassProfile);return {skill:s?.session?.decision?.skill,language:s?.session?.decision?.assessmentScope?.language,completed:p?.completed,total:p?.total}}""")
def click(page,kind,id):
 return page.evaluate("""({kind,id})=>{let s=window.AdaptiveWhyContextualReasonProbeSpecificationSource.resolve(window.SIYAYOVerbExplorerCanonicalSkillSource.getDefinition(),window.SIYAYOVerbExplorerExperienceNavigation.getExperience('having-dinner'),window.SIYAYOVerbExplorerExperienceNavigation.getExperience('after-dinner-conversation'),window.SIYAYOVerbExplorerExperienceRuntime.activeLanguage());let spec=kind==='function'?s.functionProbe:kind==='local'?s.localProbe:s.transferProbe;let i=spec.alternatives.findIndex(x=>x.id===id),p=[...document.querySelectorAll('#whyAssessmentPanel .why-contextual-reason-probe')][kind==='local'?1:0],b=p?.querySelectorAll('.why-probe-option')[i];if(!b)return false;b.click();return b.getAttribute('aria-pressed')==='true'}""",{"kind":kind,"id":id})
rows=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
 for viewport,w,h in [("portrait",390,844),("desktop",1366,900)]:
  ctx=browser.new_context(viewport={"width":w,"height":h},reduced_motion="reduce")
  page=ctx.new_page();r={"viewport":viewport,"status":"FAIL"}
  try:
   page.goto("http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner",wait_until="domcontentloaded")
   page.wait_for_function("() => !!window.SIYAYOVerbExplorerAdaptiveCoordinator && typeof document.querySelector('#nextExperience')?.onclick==='function'")
   page.locator("#learnerIdentityInput").fill("90C7H2-RESUME-"+viewport)
   page.locator("#learnerIdentityConfirm").click()
   page.locator("#nextExperience").click();page.locator("#nextExperience").click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='having-dinner'")
   for lang in ("en","es","pt"):
    page.locator('[data-experience-language="'+lang+'"]').click()
    page.locator('#questionGear [data-question-index="3"]').click()
    page.wait_for_function("l => {const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();return s?.session?.decision?.skill==='why.use.contextual-reason' && s.session.decision.assessmentScope?.language===l}",arg=lang)
    page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden")
    assert click(page,"function","why")
    assert click(page,"local","prepared-together")
    assert progress(page)=={"skill":"why.use.contextual-reason","language":lang,"completed":2,"total":3},progress(page)
   # All 3 are 2/3. Switch languages on S4 where resumeOnly cannot create a new assessment.
   page.locator("#nextExperience").click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='after-dinner-conversation'")
   for lang in ("es","pt","en"):
    page.locator('[data-experience-language="'+lang+'"]').click()
    page.wait_for_function("l => {const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();return s?.session?.decision?.assessmentScope?.language===l && !document.querySelector('#whyAssessmentPanel')?.hidden}",arg=lang,timeout=17000)
    before=progress(page)
    assert before["completed"]==2,(lang,before)
    assert click(page,"transfer","talking-together")
    assert progress(page)["completed"]==3,(lang,progress(page))
    page.locator("#learningTrailWordPathModule").evaluate("(x)=>x.open=true")
    assert "3/3" in page.locator("#learnerTrailSurface .learner-trail-contract-progress").inner_text()
    assert page.locator("#learnerTrailSurface .wp-polyglot").get_attribute("data-focused-language")==lang
    page.screenshot(path=str(out/(viewport+"-"+lang+"-green.png")),full_page=True,animations="disabled")
   r["status"]="PASS"
  except Exception as e:
   r["error"]=str(e)[:800];r["trace"]=traceback.format_exc()[-2000:]
   try:page.screenshot(path=str(out/("ERROR-"+viewport+".png")),full_page=True)
   except Exception:pass
  finally:
   print("90C7H2",viewport,r["status"],r.get("error",""),flush=True)
   rows.append(r);ctx.close()
 browser.close()
(out/"report.json").write_text(json.dumps(rows,indent=2))
if any(x["status"]!="PASS" for x in rows):raise SystemExit(1)
