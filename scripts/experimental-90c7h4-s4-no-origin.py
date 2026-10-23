from pathlib import Path
from playwright.sync_api import sync_playwright
import json
out=Path('visual-audit-90c7h4');out.mkdir(exist_ok=True)
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for lang in ['en','es','pt']:
  ctx=b.new_context(viewport={'width':390,'height':844})
  page=ctx.new_page()
  try:
   page.goto('http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=after-dinner-conversation',wait_until='domcontentloaded')
   page.wait_for_function("() => !!window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId")
   page.locator('#learnerIdentityInput').fill('90C7H4-S4-'+lang)
   page.locator('#learnerIdentityConfirm').click()
   page.locator('[data-experience-language="'+lang+'"]').click()
   page.locator('#questionGear [data-question-index="2"]').click()
   page.wait_for_function("() => !!document.querySelector('#assessmentEntryNotice') && !document.querySelector('#assessmentEntryNotice').hidden",timeout=10000)
   assert page.locator('#whyAssessmentPanel').is_hidden()
   assert page.locator('#assessmentEntryNotice').is_visible()
   assert page.locator('#assessmentEntryNotice').inner_text().strip()
   s=page.evaluate("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()")
   assert not s or not s.get('session'), 'S4 must not invent a session'
   page.screenshot(path=str(out/(lang+'-no-origin.png')),full_page=True)
   results.append({'language':lang,'status':'PASS','notice':page.locator('#assessmentEntryNotice').inner_text()})
  except Exception as e:
   results.append({'language':lang,'status':'FAIL','error':str(e)[:600]})
   page.screenshot(path=str(out/('ERROR-'+lang+'.png')),full_page=True)
  finally: ctx.close()
 b.close()
(out/'report.json').write_text(json.dumps(results,indent=2,ensure_ascii=False))
print(results)
if any(x['status']!='PASS' for x in results):raise SystemExit(1)
