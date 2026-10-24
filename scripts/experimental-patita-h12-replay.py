from playwright.sync_api import sync_playwright
from pathlib import Path
import json,traceback
out=Path('visual-audit-patita-h12');out.mkdir(exist_ok=True)
runs=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for lang in ['en','es','pt']:
  ctx=b.new_context(viewport={'width':390,'height':844})
  page=ctx.new_page();row={'language':lang,'status':'FAIL'}
  stage='load'
  try:
   page.goto('http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner',wait_until='domcontentloaded')
   page.wait_for_function("() => !!window.SIYAYOPatitaInteractionTrail?.projectVisible && !!window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId()")
   page.locator('[data-experience-language="'+lang+'"]').click()
   page.locator('#learnerIdentityInput').fill('H12-ALPHA-'+lang)
   page.locator('#learnerIdentityConfirm').click()
   page.locator('#questionGear [data-question-index="3"]').click()
   page.locator('#choiceOptions [data-choice-select="fresh-mild-cheese"]').click()
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.projectVisible().some(r=>r.questionWord==='which'&&r.results>=1)")
   page.locator('#questionGear [data-question-index="4"]').click()
   page.locator('#dependencyHeadProbeOptions [data-dependency-head-probe-select="prefer"]').click()
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.projectVisible().some(r=>r.questionWord==='why'&&r.results>=1)")
   before=page.evaluate("() => window.SIYAYOPatitaInteractionTrail.projectVisible()")
   assert any(r['questionWord']=='which' and r['language']==lang for r in before),before
   assert any(r['questionWord']=='why' and r['language']==lang for r in before),before
   page.locator('#learningTrailWordPathModule').evaluate('(e)=>e.open=true')
   assert page.locator('#patitaInteractionLedger .patita-replay-row[data-patita-qw="which"][data-patita-language="'+lang+'"]').count()==1
   page.locator('#nextExperience').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='preparing-dinner'")
   stage='reload'
   page.reload(wait_until='domcontentloaded')
   page.wait_for_function("() => !!window.SIYAYOPatitaInteractionTrail?.projectVisible && !!window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId()")
   # Identity is explicit; a reload does not authorize silent NICK restoration.
   page.locator('#learnerIdentityInput').fill('H12-ALPHA-'+lang)
   page.locator('#learnerIdentityConfirm').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerLearnerIdentitySource.getId()?.startsWith('H12-ALPHA-')")
   after=page.evaluate("() => window.SIYAYOPatitaInteractionTrail.projectVisible()")
   assert all(any(x['questionWord']==r['questionWord'] and x['language']==r['language'] and x['results']>=r['results'] for x in after) for r in before),(before,after)
   stage='change-NICK'
   page.locator('#learnerIdentityChange').click()
   page.locator('#learnerIdentityInput').fill('H12-BETA-'+lang)
   page.locator('#learnerIdentityConfirm').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerLearnerIdentitySource.getId()?.startsWith('H12-BETA-')")
   assert not any(r['results'] for r in page.evaluate("() => window.SIYAYOPatitaInteractionTrail.projectVisible()"))
   page.screenshot(path=str(out/(lang+'-nick-isolation.png')),full_page=True)
   row.update(status='PASS',originalResults=sum(r['results'] for r in before),nickIsolation=True)
  except Exception as e:
   row.update(stage=stage,error=repr(e)[:600],trace=traceback.format_exc()[-1100:])
   try:page.screenshot(path=str(out/('ERROR-'+lang+'.png')),full_page=True)
   except Exception:pass
  finally:runs.append(row);print('H12',lang,row['status'],row.get('error',''),flush=True);ctx.close()
 b.close()
(out/'report.json').write_text(json.dumps(runs,indent=2))
if any(x['status']!='PASS' for x in runs):raise SystemExit(1)
