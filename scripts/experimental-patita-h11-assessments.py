from playwright.sync_api import sync_playwright
from pathlib import Path
import json,traceback
out=Path('visual-audit-patita-h11');out.mkdir(exist_ok=True)
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for lang in ('en','es','pt'):
  context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  page=context.new_page();r={'language':lang,'status':'FAIL'}
  try:
   page.goto('http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner',wait_until='domcontentloaded')
   page.wait_for_function("() => !!window.SIYAYOPatitaInteractionTrail?.recordOutcome && !!window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId()")
   page.locator('[data-experience-language="'+lang+'"]').click()
   # Anonymous WHAT allows actual result but never canonical evidence.
   page.locator('#questionGear [data-question-index="0"]').click()
   page.wait_for_function("() => !document.querySelector('#whatAssessmentPanel')?.hidden")
   page.locator('#whatAssessmentPanel .what-object-question-probe .what-probe-option').first.click()
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().some(r=>r.source==='canonical-probe'&&r.questionWord==='what')")
   what=page.evaluate("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().filter(r=>r.source==='canonical-probe'&&r.questionWord==='what').at(-1)")
   assert what['phase']=='exploration' and what['evidenceProduced']==False,what
   assert what['resultCode'] in ('pass','fail'),what
   assert page.evaluate("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill||null") is None
   page.locator('#learnerIdentityInput').fill('PATITA-H11-'+lang)
   page.locator('#learnerIdentityConfirm').click()
   page.locator('#questionGear [data-question-index="1"]').click()
   page.wait_for_function("() => !document.querySelector('#whereAssessmentPanel')?.hidden",timeout=12000)
   page.locator('#whereAssessmentPanel .where-probe-option').first.click()
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().some(r=>r.source==='canonical-probe'&&r.questionWord==='where')")
   where=page.evaluate("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().filter(r=>r.source==='canonical-probe'&&r.questionWord==='where').at(-1)")
   assert where['phase']=='assessment-attempt' and where['evidenceProduced']==False,where
   assert where['resultCode'] in ('pass','fail'),where
   assert where['skill']=='where.use.location-question'
   page.locator('#learningTrailWordPathModule').evaluate('(e)=>e.open=true')
   assert page.locator('#patitaInteractionLedger [data-patita-kind="patita-observed-result"]').count()>=1
   page.screenshot(path=str(out/(lang+'-where.png')),full_page=True)
   page.locator('#nextExperience').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='preparing-dinner'")
   page.locator('#nextExperience').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='having-dinner'")
   page.locator('#questionGear [data-question-index="3"]').click()
   page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden",timeout=12000)
   page.locator('#whyAssessmentPanel .why-contextual-reason-probe .why-probe-option').first.click()
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().some(r=>r.source==='canonical-probe'&&r.questionWord==='why')",timeout=8000)
   why=page.evaluate("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().filter(r=>r.source==='canonical-probe'&&r.questionWord==='why').at(-1)")
   assert why['phase']=='assessment-attempt' and why['evidenceProduced']==False and why['skill']=='why.use.contextual-reason',why
   assert why['resultCode'] in ('pass','fail'),why
   page.screenshot(path=str(out/(lang+'-why.png')),full_page=True)
   r.update(status='PASS',where=where['resultCode'],why=why['resultCode'])
  except Exception as e:
   r.update(error=repr(e)[:700],trace=traceback.format_exc()[-1200:])
   try:page.screenshot(path=str(out/('ERROR-'+lang+'.png')),full_page=True)
   except Exception:pass
  finally:
   results.append(r);print('H11',lang,r['status'],r.get('error',''),flush=True);context.close()
 browser.close()
(out/'report.json').write_text(json.dumps(results,indent=2))
if any(r['status']!='PASS' for r in results):raise SystemExit(1)
