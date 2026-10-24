from playwright.sync_api import sync_playwright
from pathlib import Path
import json,traceback
out=Path('visual-audit-patita-h13');out.mkdir(exist_ok=True)
runs=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for lang in ('en','es','pt'):
  ctx=b.new_context(viewport={'width':390,'height':844});page=ctx.new_page();row={'lang':lang,'status':'FAIL'}
  stage='init'
  try:
   page.goto('http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner',wait_until='domcontentloaded')
   page.wait_for_function("() => !!window.SIYAYOPatitaInteractionTrail?.projectVisible")
   page.locator('[data-experience-language="'+lang+'"]').click()
   page.locator('#learnerIdentityInput').fill('H13-ALPHA-'+lang)
   page.locator('#learnerIdentityConfirm').click()
   page.wait_for_function("() => document.querySelector('#learnerIdentityPanel')?.dataset.identityDisplay==='compact'")
   page.locator('#questionGear [data-question-index="3"]').click()
   page.locator('#choiceOptions [data-choice-select="fresh-mild-cheese"]').click()
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.projectVisible().some(r=>r.questionWord==='which'&&r.results===1)")
   page.locator('#nextExperience').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='preparing-dinner'")
   page.wait_for_function("() => document.querySelector('#learnerIdentityPanel')?.dataset.identityDisplay==='compact' && !document.querySelector('#learnerIdentityCompact')?.hidden")
   before=page.evaluate("() => window.SIYAYOPatitaInteractionTrail.projectVisible()")
   assert any(x['questionWord']=='which' and x['results']>=1 for x in before)
   stage='click-change'
   page.locator('#learnerIdentityChange').click()
   page.wait_for_function("() => document.querySelector('#learnerIdentityPanel')?.dataset.identityDisplay==='editor'")
   stage='enter-beta'
   page.locator('#learnerIdentityInput').fill('H13-BETA-'+lang)
   page.locator('#learnerIdentityConfirm').click()
   stage='confirm-beta'
   page.wait_for_function("() => window.SIYAYOVerbExplorerLearnerIdentitySource?.getId()?.startsWith('H13-BETA-') && document.querySelector('#learnerIdentityPanel')?.dataset.identityDisplay==='compact'")
   assert not any(x['results'] for x in page.evaluate("() => window.SIYAYOPatitaInteractionTrail.projectVisible()"))
   stage='return-alpha'
   page.locator('#learnerIdentityChange').click()
   page.locator('#learnerIdentityInput').fill('H13-ALPHA-'+lang)
   page.locator('#learnerIdentityConfirm').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerLearnerIdentitySource?.getId()?.startsWith('H13-ALPHA-')")
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.projectVisible().some(r=>r.questionWord==='which'&&r.results>=1)")
   assert page.evaluate("() => document.querySelector('#learnerIdentityName')?.textContent")=='H13-ALPHA-'+lang
   page.screenshot(path=str(out/(lang+'-identity-switch.png')),full_page=True)
   row.update(status='PASS',isolation=True,returnToNick=True)
  except Exception as e:
   row.update(stage=stage,error=repr(e)[:700],trace=traceback.format_exc()[-1000:])
   try:page.screenshot(path=str(out/('ERROR-'+lang+'.png')),full_page=True)
   except Exception:pass
  finally:
   print('H13 SWITCH',lang,row['status'],row.get('error',''),flush=True)
   runs.append(row);ctx.close()
 b.close()
(out/'switch-report.json').write_text(json.dumps(runs,indent=2))
if any(x['status']!='PASS' for x in runs):raise SystemExit(1)
