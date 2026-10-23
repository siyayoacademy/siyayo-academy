#!/usr/bin/env python3
"""90C.4 Chrome: reproduces a saved WHAT Session before fresh S3 WHY selection."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,traceback
out=Path("visual-audit-90c4");out.mkdir(exist_ok=True)
cases=[]
with sync_playwright() as playwright:
 browser=playwright.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
 for lang in ["en","es","pt"]:
  case={"lang":lang,"status":"FAIL"}
  context=browser.new_context(viewport={"width":390,"height":844},reduced_motion="reduce")
  page=context.new_page()
  try:
   page.goto("http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner",wait_until="domcontentloaded")
   page.wait_for_function("() => !!window.SIYAYOVerbExplorerAdaptiveCoordinator && !!window.SIYAYOVerbExplorerExperienceRuntime && typeof document.querySelector('#nextExperience')?.onclick==='function'",timeout=25000)
   page.locator('[data-experience-language="'+lang+'"]').click()
   page.locator("#learnerIdentityInput").fill("why s3 s4 "+lang)
   page.locator("#learnerIdentityConfirm").click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill==='what.use.object-question'",timeout=16000)
   page.locator("#nextExperience").click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='preparing-dinner'")
   page.locator("#nextExperience").click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='having-dinner'")
   # HOW TO SHOW before adoption: user sees WHY with the prior WHAT contract still active.
   page.locator('#questionGear [data-question-index="3"]').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill==='why.use.contextual-reason'",timeout=16000)
   page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden",timeout=12000)
   n=page.locator("#livingLineAuthorityNote")
   assert "03 / 03" in n.inner_text() and n.get_attribute("data-authority-state")=="assessment-panel"
   preserved=page.evaluate("""lang => window.SIYAYOVerbExplorerThinkingMindAssessmentSelection.getRetainedProgress('what.use.object-question',lang).map(r=>r.progress.completed)""",lang)
   assert preserved==[0],("prior WHAT not preserved",preserved)
   before=page.evaluate("""() => {let s=window.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot();return window.AdaptivePassContractProgressView.project(s.context.passContract,s.context.evidencePackets,window.GreenPassProfile).completed}""")
   page.locator("#livingLines .living-line").nth(1).click()
   after=page.evaluate("""() => {let s=window.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot();return window.AdaptivePassContractProgressView.project(s.context.passContract,s.context.evidencePackets,window.GreenPassProfile).completed}""")
   assert before==after==0,"LINES speech fabricated evidence"
   page.screenshot(path=str(out/("90c4-why-s3-"+lang+".png")),full_page=True,animations="disabled")
   page.locator("#nextExperience").click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='after-dinner-conversation'")
   page.locator('#questionGear [data-question-index="2"]').click()
   page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden")
   assert "0/3" in page.locator("#whyAssessmentPanel").inner_text(),"S4 visit minted evidence"
   page.screenshot(path=str(out/("90c4-why-s4-"+lang+".png")),full_page=True,animations="disabled")
   case.update(status="PASS",priorWhat=preserved,priorWhy=before,afterAudio=after,whyPanel=True)
  except Exception as e:
   case["error"]=str(e)[:950]
   case["trace"]=traceback.format_exc()[-1800:]
   try:page.screenshot(path=str(out/("ERROR-"+lang+".png")),full_page=True)
   except Exception:pass
  finally:
   print("90C4 WHY new S3 entry "+lang+" "+case["status"]+" "+case.get("error",""),flush=True)
   cases.append(case)
   context.close()
 browser.close()
(out/"report.json").write_text(json.dumps(cases,indent=2,ensure_ascii=False),encoding="utf-8")
if any(x["status"]!="PASS" for x in cases):raise SystemExit(1)
