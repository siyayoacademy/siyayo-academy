from playwright.sync_api import sync_playwright
from pathlib import Path
import json,traceback
out=Path("visual-audit-patita-h10");out.mkdir(exist_ok=True)
rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
 for lang in ("en","es","pt"):
  ctx=b.new_context(viewport={"width":390,"height":844})
  page=ctx.new_page()
  row={"lang":lang,"status":"FAIL"}
  try:
   page.goto("http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner",wait_until="domcontentloaded")
   page.wait_for_function("() => !!window.SIYAYOPatitaInteractionTrail?.recordOutcome")
   page.locator('[data-experience-language="'+lang+'"]').click()
   page.locator('#questionGear [data-question-index="3"]').click()
   page.locator('#choiceOptions [data-choice-select="fresh-mild-cheese"]').click()
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().some(r=>r.kind==='patita-observed-result'&&r.source==='contextual-choice')")
   outcome=page.evaluate("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().filter(r=>r.kind==='patita-observed-result').at(-1)")
   assert outcome["resultCode"]=="best-fit" and outcome["score"]==4 and outcome["possibleScore"]==4,outcome
   assert outcome["phase"]=="exploration" and outcome["evidenceProduced"] is False,outcome
   assert "4 / 4" in page.locator('#choiceFeedback').inner_text()
   page.locator('#questionGear [data-question-index="4"]').click()
   page.wait_for_function("() => !document.querySelector('#dependencyHeadProbePanel')?.hidden")
   page.locator('#dependencyHeadProbeOptions [data-dependency-head-probe-select="prefer"]').click()
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().some(r=>r.kind==='patita-observed-result'&&r.source==='dependency-head-probe')")
   probe=page.evaluate("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().filter(r=>r.kind==='patita-observed-result'&&r.source==='dependency-head-probe').at(-1)")
   assert probe["resultCode"]=="pass" and probe["phase"]=="exploration" and probe["evidenceProduced"] is False,probe
   assert page.evaluate("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill||null") is None
   page.locator('#learningTrailWordPathModule').evaluate('(el)=>el.open=true')
   assert page.locator('#patitaInteractionLedger [data-patita-kind="patita-observed-result"]').count()>=2
   page.screenshot(path=str(out/(lang+"-outcomes.png")),full_page=True)
   row.update(status="PASS",choice="4/4 context-only",head="pass observation-only")
  except Exception as e:
   row.update(error=repr(e)[:750],trace=traceback.format_exc()[-1000:])
   try:page.screenshot(path=str(out/("ERROR-"+lang+".png")),full_page=True)
   except Exception:pass
  finally:
   rows.append(row);print("H10",lang,row["status"],row.get("error",""),flush=True);ctx.close()
 b.close()
(out/"report.json").write_text(json.dumps(rows,indent=2))
if any(r["status"]!="PASS" for r in rows):raise SystemExit(1)
