from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('visual-audit-patita-h13-3');out.mkdir(exist_ok=True)
rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for lang in ['en','es','pt']:
  context=b.new_context(viewport={'width':390,'height':844});page=context.new_page();r={'language':lang,'status':'FAIL'}
  try:
   page.goto('http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner',wait_until='domcontentloaded')
   page.wait_for_function("() => document.querySelector('#learnerIdentityPanel')?.__siyayoLearnerIdentityInstalled===true && !!window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId()")
   page.locator('[data-experience-language="'+lang+'"]').click()
   page.locator('#learnerIdentityInput').fill('H13.3-'+lang)
   page.locator('#learnerIdentityConfirm').click()
   page.wait_for_function("() => document.querySelector('#learnerIdentityPanel')?.dataset.identityDisplay==='compact'")
   page.locator('#questionGear [data-question-index="3"]').click()
   page.locator('#choiceOptions [data-choice-select="fresh-mild-cheese"]').click()
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.projectVisible().some(r=>r.questionWord==='which'&&r.results>=1)")
   page.locator('#learningTrailWordPathModule').evaluate('(el)=>el.open=true')
   page.wait_for_function("() => document.querySelector('#patitaInteractionLedger .patita-replay-row[data-patita-qw=which]')")
   page.evaluate("() => window.SIYAYOVerbExplorerLearnerTrailSurface.refresh({document})")
   trail=page.locator('#learnerTrailSurface')
   assert trail.get_attribute('data-display-language')==lang,(lang,trail.get_attribute('data-display-language'))
   assert trail.get_attribute('data-current-qword')=='which'
   assert page.locator('#patitaInteractionLedger .patita-replay-row[data-patita-qw="which"][data-patita-language="'+lang+'"]').count()==1
   page.locator('#nextExperience').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='preparing-dinner'")
   page.evaluate("() => window.SIYAYOVerbExplorerLearnerTrailSurface.refresh({document})")
   assert page.locator('#patitaInteractionLedger .patita-replay-row[data-patita-qw="which"][data-patita-language="'+lang+'"]').count()==1
   assert page.locator('#learnerIdentityName').inner_text()=='H13.3-'+lang
   matrix=page.locator('.wp-polyglot')
   if matrix.count():
    assert matrix.get_attribute('data-focused-language')==lang
    assert matrix.get_attribute('data-assessment-language') in ['en','es','pt','none']
   page.screenshot(path=str(out/(lang+'-context.png')),full_page=True)
   r.update(status='PASS',matrixPresent=matrix.count()>0)
  except Exception as e:r.update(error=repr(e)[:700])
  finally:rows.append(r);print('H13.3',lang,r,flush=True);context.close()
 b.close()
(out/'report.json').write_text(json.dumps(rows,indent=2))
if any(r['status']!='PASS' for r in rows):raise SystemExit(1)
