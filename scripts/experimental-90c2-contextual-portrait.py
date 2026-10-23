#!/usr/bin/env python3
"""JAGUAR 90C.2 strict real Chromium PORTRAIT semantic coherence and Word Path focus."""
from pathlib import Path
import json,traceback
from playwright.sync_api import sync_playwright
OUT=Path('visual-audit-90c2-coherence');OUT.mkdir(exist_ok=True)
EXPECTED={
 'having-dinner':{
  'en':('Why is this dinner special?','Because we prepared it together.'),
  'es':('¿Por qué esta cena es especial?','Porque la preparamos juntos.'),
  'pt':('Por que este jantar é especial?','Porque preparamos o jantar juntos.')},
 'after-dinner-conversation':{
  'en':('Why do you enjoy this conversation?','Because we enjoy talking together.'),
  'es':('¿Por qué disfrutas esta conversación?','Porque disfrutamos conversar juntos.'),
  'pt':('Por que você gosta desta conversa?','Porque gostamos de conversar juntos.')}
}
REPORT=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for lang in ['en','es','pt']:
  context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  page=context.new_page()
  row={'language':lang,'viewport':'390x844','status':'FAIL'}
  try:
   page.goto('http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner',wait_until='domcontentloaded',timeout=24000)
   page.wait_for_function("() => !!window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId && !!window.SIYAYOVerbExplorerContextualCoherence && typeof document.querySelector('#nextExperience')?.onclick==='function'",timeout=25000)
   page.locator('#nextExperience').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='preparing-dinner'",timeout=13000)
   page.locator('#nextExperience').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='having-dinner'",timeout=13000)
   page.locator('[data-experience-language="'+lang+'"]').click()
   page.locator('#learnerIdentityInput').fill('90C2-SYNTH-'+lang)
   page.locator('#learnerIdentityConfirm').click()
   page.locator('#questionGear [data-question-index="3"]').click()
   page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden",timeout=11000)
   page.locator('#learningTrailWordPathModule').evaluate("(e)=>e.open=true")
   for scene in ['having-dinner','after-dinner-conversation']:
    q,a=EXPECTED[scene][lang]
    page.wait_for_function("(exp)=>window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()===exp",arg=scene,timeout=13000)
    lines=page.locator('#livingLines .living-line')
    assert lines.count()==3,(scene,lang,'expected 3 LINES')
    got=[x.inner_text().strip() for x in lines.all()]
    assert q in got[0] and a in got[1],(scene,lang,got)
    assert 'breakfast' not in got[1].lower() and 'desayuno' not in got[1].lower() and 'café da manhã' not in got[1].lower()
    scope=page.evaluate("""() => {
      let t=document.querySelector('#learnerTrailSurface');
      let w=t.querySelector('.wp-polyglot');
      let sc=t.querySelector('.wp-poly-scroller');
      let table=sc.querySelector('.wp-poly-table');
      let first=table.querySelector('thead th:nth-child(2)'),row=table.querySelector('tbody tr:nth-child(3)');
      let qword=table.querySelector('thead th:first-child');
      const r=e=>e.getBoundingClientRect();
      return {target:w.dataset.focusedLanguage,actual:first.dataset.language,
        firstHeader:first.textContent,questionWordVisible:r(qword).left>=r(sc).left-2,
        activeVisible:r(first).left>=r(sc).left-2&&r(first).right<=r(sc).right+2,
        languageCell:row.querySelector('td:first-of-type')?.dataset.language,
        internallyScrollable:sc.scrollWidth>sc.clientWidth,
        noGlobalOverflow:document.documentElement.scrollWidth<=innerWidth+4};
    }""")
    assert scope['target']==lang and scope['actual']==lang and scope['languageCell']==lang and scope['questionWordVisible'] and scope['activeVisible'] and scope['internallyScrollable'] and scope['noGlobalOverflow'],(scene,lang,scope)
    row[scene]={'question':q,'answer':a,'wordPath':scope}
    page.screenshot(path=str(OUT/f'{scene}-{lang}-portrait.png'),full_page=True,animations='disabled')
    if scene=='having-dinner':
     page.locator('#nextExperience').click()
     page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='after-dinner-conversation'",timeout=13000)
     page.locator('#questionGear [data-question-index="2"]').click()
     page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden",timeout=11000)
   # Authentic verbs/tense/mode combinations not authored are explicitly blocked.
   page.locator('[data-experience-tense="past"]').click()
   notice=page.locator('#livingLines .living-line-status')
   assert notice.count()==1 and 'corpus' in notice.inner_text().lower(),notice.inner_text()
   assert notice.locator('.siyayo-speaker').count()==0,'missing corpus answer must not claim speech'
   assert page.locator('#livingLines .living-line').count()==1
   page.screenshot(path=str(OUT/f'unauthored-past-{lang}-portrait.png'),full_page=True,animations='disabled')
   row['status']='PASS'
  except Exception as exc:
   row['error']=str(exc)[:1100];row['trace']=traceback.format_exc()[-2300:]
   try:page.screenshot(path=str(OUT/f'FAIL-{lang}-portrait.png'),full_page=True,animations='disabled')
   except Exception:pass
  finally:
   print('JAGUAR 90C.2',lang,'PORTRAIT',row['status'],row.get('error',''),flush=True)
   REPORT.append(row);context.close()
 browser.close()
(OUT/'report.json').write_text(json.dumps(REPORT,indent=2,ensure_ascii=False),encoding='utf8')
print('JAGUAR 90C.2 STRICT PORTRAIT',sum(x['status']=='PASS' for x in REPORT),'/',len(REPORT))
if any(x['status']!='PASS' for x in REPORT):raise SystemExit(1)
