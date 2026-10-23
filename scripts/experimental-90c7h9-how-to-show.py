from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('visual-audit-90c7h9');out.mkdir(exist_ok=True)
cases=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for lang in ['en','es','pt']:
  c=b.new_context(viewport={'width':390,'height':844})
  page=c.new_page()
  stage='initial'
  try:
   stage='load'
   page.goto('http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner',wait_until='domcontentloaded')
   page.wait_for_function("() => !!window.SIYAYOVerbExplorerExperienceRuntime?.activeQuestionWord()")
   page.locator('[data-experience-language="'+lang+'"]').click()
   stage='WHO'
   page.locator('#questionGear [data-question-index="5"]').click() # WHO: question authored, answer not
   page.wait_for_function("() => document.querySelector('#livingLines')?.dataset.corpusStatus==='authoring-gap'")
   lines=page.locator('#livingLines')
   assert lines.locator('.living-line').count()==1
   assert lines.locator('.living-line-status').count()==1
   assert 'Who' in lines.inner_text() or 'Quién' in lines.inner_text() or 'Quem' in lines.inner_text()
   assert page.evaluate("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill||null") is None
   page.screenshot(path=str(out/(lang+'-who-authoring-gap.png')),full_page=True)
   stage='WHY'
   page.locator('#questionGear [data-question-index="4"]').click() # WHY S1 grounded
   page.wait_for_function("() => document.querySelector('#livingLines')?.dataset.corpusStatus==='authored'")
   assert page.locator('#livingLines .living-line').count()==2
   stage='dependency'
   assert page.locator('#dependencyFocusSurface').is_visible(),page.locator('#dependencyFocusSurface').get_attribute('hidden')
   assert page.locator('#dependencyHeadProbePanel').is_visible()
   assert page.evaluate("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill||null") is None
   cases.append({'language':lang,'status':'PASS'})
  except Exception as e:
   cases.append({'language':lang,'status':'FAIL','stage':stage,'error':repr(e)[:500], 'lines':page.locator('#livingLines').inner_text()[:500]})
  finally:c.close()
 b.close()
(out/'report.json').write_text(json.dumps(cases,indent=2))
print(cases)
if any(c['status']!='PASS' for c in cases):raise SystemExit(1)
