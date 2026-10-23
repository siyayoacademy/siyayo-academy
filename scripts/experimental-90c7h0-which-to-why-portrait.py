#!/usr/bin/env python3
"""Critical missing transition test: identified WHICH S1 -> WHY S3 without false evidence."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,traceback
out=Path('visual-audit-90c7h0-switch');out.mkdir(exist_ok=True)
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for lang in ('en','es','pt'):
  for answered in (False,True):
   name=lang+('-with-which-evidence' if answered else '-which-empty')
   row={'case':name,'status':'FAIL'}
   context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
   page=context.new_page()
   try:
    page.goto('http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner',wait_until='domcontentloaded',timeout=25000)
    page.wait_for_function("() => !!window.SIYAYOVerbExplorerAdaptiveCoordinator && typeof document.querySelector('#nextExperience')?.onclick==='function'")
    page.locator('[data-experience-language="'+lang+'"]').click()
    page.locator('#questionGear [data-question-index="3"]').click()
    page.locator('#learnerIdentityInput').fill('90C7H-SUPERVISOR-'+name)
    page.locator('#learnerIdentityConfirm').click()
    page.wait_for_function("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill==='which.use.determiner'",timeout=18000)
    if answered:
     # The separate canonical WHICH determiner use probe is the only accepted evidence route.
     options=page.locator('#determinerUseAssessmentOptions button[data-determiner-use-probe-select]')
     assert options.count()>0,'WHICH assessment buttons missing'
     # Use a candidate and save resulting progress, without manufacturing a pass.
     options.first.click()
    old=page.evaluate("""() => {
      const s=window.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot();
      const p=window.AdaptivePassContractProgressView.project(s.context.passContract,s.context.evidencePackets,window.GreenPassProfile);
      return {completed:p.completed,total:p.total,skill:s.session.decision.skill};
    }""")
    page.locator('#nextExperience').click()
    page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='preparing-dinner'")
    page.locator('#nextExperience').click()
    page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='having-dinner'")
    page.locator('#questionGear [data-question-index="3"]').click()
    page.wait_for_function("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill==='why.use.contextual-reason'",timeout=15000)
    page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden",timeout=13000)
    before=page.evaluate("""() => {
      const s=window.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot();
      const p=window.AdaptivePassContractProgressView.project(s.context.passContract,s.context.evidencePackets,window.GreenPassProfile);
      return {completed:p.completed,total:p.total};
    }""")
    retained=page.evaluate("""l=>window.SIYAYOVerbExplorerThinkingMindAssessmentSelection.getRetainedProgress('which.use.determiner',l).map(x=>x.progress.completed)""",lang)
    assert before['completed']==0 and before['total']==3 and old['completed'] in retained,(before,old,retained)
    assert page.locator('#livingLineAuthorityNote').get_attribute('data-authority-state')=='assessment-panel'
    assert page.locator('#determinerUseAssessmentPanel').is_hidden(),'WHICH panel must not impersonate WHY'
    page.screenshot(path=str(out/(name+'.png')),full_page=True,animations='disabled')
    row.update(status='PASS',old=old,retained=retained,why=before)
   except Exception as exc:
    row['error']=str(exc)[:850];row['trace']=traceback.format_exc()[-1600:]
    try: page.screenshot(path=str(out/('ERROR-'+name+'.png')),full_page=True)
    except Exception:pass
   finally:
    results.append(row);print('WHICH->WHY',name,row['status'],row.get('error',''),flush=True);context.close()
 browser.close()
(out/'report.json').write_text(json.dumps(results,indent=2),encoding='utf8')
if any(x['status']!='PASS' for x in results):raise SystemExit(1)
