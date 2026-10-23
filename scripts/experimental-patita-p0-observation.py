#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,traceback
out=Path("visual-audit-patita-p0");out.mkdir(exist_ok=True)
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
 for lang in ("en","es","pt"):
  c=browser.new_context(viewport={"width":390,"height":844})
  page=c.new_page()
  row={"language":lang,"status":"FAIL"}
  try:
   page.goto("http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner",wait_until="domcontentloaded")
   page.wait_for_function("() => !!window.SIYAYOPatitaInteractionTrail && !!window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId()")
   page.locator('[data-experience-language="'+lang+'"]').click()
   page.locator('#questionGear [data-question-index="4"]').click()
   page.locator('#experienceTenseGear [data-experience-tense="past"]').click()
   page.locator('#experienceModeGear [data-experience-form="negative"]').click()
   page.locator('[data-word-type="noun"]').click()
   page.locator('[data-perspective="describing"]').click()
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().length>=6",timeout=4000)
   before=page.evaluate("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill||null")
   assert before is None,("Navigation wrongly started assessment",before)
   trace=page.evaluate("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords()")
   assert [r["action"] for r in trace][-6:]==["language","question-word","tense","mode","word-type","perspective"],[r["action"] for r in trace]
   assert all(r["evidenceProduced"] is False and r["assessmentCredit"] is False and r["greenPass"] is False for r in trace)
   assert all(r["learnerId"] is None for r in trace), "Anonymous trace must remain anonymous"
   page.locator('#learningTrailWordPathModule').evaluate('(e)=>e.open=true')
   assert page.locator('#patitaInteractionLedger').is_visible()
   page.locator('#learnerIdentityInput').fill("PATITA-"+lang)
   page.locator('#learnerIdentityConfirm').click()
   # NOUN locks TENSE; it must not be clicked or counted as an event.
   assert page.locator('#experienceTenseGear [data-experience-tense="future"]').is_disabled()
   anonymous_count=page.evaluate("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().length")
   page.locator('[data-word-type="verb"]').click()
   page.locator('#experienceTenseGear [data-experience-tense="future"]').click()
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().length>=2",timeout=4000)
   identified=page.evaluate("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords()")
   assert len(identified)>=2 and all(r["learnerId"]=="PATITA-"+lang for r in identified),identified
   assert identified[-1]["action"]=="tense" and identified[-1]["uiOutcome"]=="changed",identified[-1]
   assert all(r["evidenceProduced"] is False for r in identified)
   # A detached read must not allow a caller to mutate ledger state.
   page.evaluate("() => {const rows=window.SIYAYOPatitaInteractionTrail.getVisibleRecords();rows[0].after.language='zz'}")
   assert page.evaluate("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords()[0].after.language")!="zz"
   assert not any(r["action"]=="question-word" for r in identified),"Anonymous observations must not be silently attributed to NICK"
   assert page.evaluate("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill||null") is None
   page.screenshot(path=str(out/(lang+".png")),full_page=True)
   row.update(status="PASS",anonymousActions=len(trace),identifiedActions=len(identified))
  except Exception as e:
   row["error"]=str(e)[:1000];row["trace"]=traceback.format_exc()[-1300:]
   try:page.screenshot(path=str(out/("ERROR-"+lang+".png")),full_page=True)
   except Exception:pass
  finally:
   results.append(row);print("PATITA",lang,row["status"],row.get("error",""),flush=True);c.close()
 browser.close()
(out/"report.json").write_text(json.dumps(results,indent=2))
if any(r["status"]!="PASS" for r in results):raise SystemExit(1)
