#!/usr/bin/env python3
"""90C.7H.1 real Chromium: WHY S1/S2 DF & DHP and optional WHICH -> WHY S3/S4 0/3->3/3.
Strict authority: observational Head Probe and LINES speech never mint Evidence.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, traceback
OUT=Path("visual-audit-90c7h1-dependency");OUT.mkdir(exist_ok=True)
URL="http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner"
EXPECT={
 'shopping-for-dinner': {'en':('Why do you prefer the fresh cheese?','prefer'),
                         'es':('¿Por qué prefieres el queso fresco?','prefer'),
                         'pt':('Por que você prefere o queijo fresco?','prefer')},
 'preparing-dinner': {'en':('Why are we preparing this dinner together?','preparing'),
                      'es':('¿Por qué estamos preparando esta cena juntos?','preparing'),
                      'pt':('Por que estamos preparando este jantar juntos?','preparing')}
}
def session(page):
 return page.evaluate("""() => {
  const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.(),c=s?.context;
  const p=c&&window.AdaptivePassContractProgressView?.project?.(c.passContract,c.evidencePackets,window.GreenPassProfile);
  return {skill:s?.session?.decision?.skill||null,completed:p?.completed??null,total:p?.total??null};
 }""")
def audit_exploration(page,lang,scene,index,layout):
 page.wait_for_function("id=>window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()===id",arg=scene)
 page.locator(f'#questionGear [data-question-index="{index}"]').click()
 page.wait_for_function("() => document.querySelector('#dependencyFocusSurface')?.hidden===false && document.querySelector('#dependencyHeadProbePanel')?.hidden===false")
 focus=page.locator('#dependencyFocusSurface');probe=page.locator('#dependencyHeadProbePanel')
 text,head=EXPECT[scene][lang]
 assert text in focus.inner_text(),('dependency sentence',scene,lang,focus.inner_text())
 assert focus.get_attribute('data-language')==lang
 assert focus.get_attribute('data-focus-token')==head
 assert probe.get_attribute('data-assessment-state') in ('anonymous-practice','identified-observation')
 assert page.locator('#dependencyHeadProbeOptions button[data-dependency-head-probe-select]').count()==3
 assert page.locator('#livingLines .living-line').count()==2
 assert session(page)['skill'] is None,('S1/S2 free only',session(page))
 assert page.locator('#whyAssessmentPanel').is_hidden()
 before=session(page)
 page.locator(f'#dependencyHeadProbeOptions [data-dependency-head-probe-select="{head}"]').click()
 assert 'observ' in page.locator('#dependencyHeadProbeFeedback').inner_text().lower() or 'práctica' in page.locator('#dependencyHeadProbeFeedback').inner_text().lower() or 'prática' in page.locator('#dependencyHeadProbeFeedback').inner_text().lower()
 assert session(page)==before,('head free practice generated assessment',scene,lang,before,session(page))
 traces=page.evaluate("""() => window.SIYAYOVerbExplorerDependencyHeadProbeLive.getPracticeTrace().slice(-1)[0]""")
 assert traces and traces['evidenceProduced']==False and traces['greenPass']==False and traces['result']=='pass',traces
 assert page.evaluate("() => document.documentElement.scrollWidth <= innerWidth+4"),('global-overflow',scene,lang,layout)
 page.screenshot(path=str(OUT/f'{scene}-{lang}-{layout}.png'),full_page=True,animations='disabled')
 return {'scene':scene,'head':head,'trace':'free-observation-no-credit','layout':layout}
def answer(page,kind,answer_id):
 return page.evaluate("""({kind,answerId})=>{
  const root=document.querySelector('#whyAssessmentPanel'),s=window.AdaptiveWhyContextualReasonProbeSpecificationSource.resolve(
   window.SIYAYOVerbExplorerCanonicalSkillSource.getDefinition(),
   window.SIYAYOVerbExplorerExperienceNavigation.getExperience('having-dinner'),
   window.SIYAYOVerbExplorerExperienceNavigation.getExperience('after-dinner-conversation'),
   window.SIYAYOVerbExplorerExperienceRuntime.activeLanguage());
  const spec=kind==='function'?s.functionProbe:kind==='local'?s.localProbe:s.transferProbe,
    probeIndex=kind==='transfer'?0:kind==='function'?0:1,
    buttons=[...root.querySelectorAll('.why-contextual-reason-probe')][probeIndex].querySelectorAll('.why-probe-option'),
    index=spec.alternatives.findIndex(a=>a.id===answerId),button=buttons[index];
  if(!button)return {ok:false,index,alternatives:spec.alternatives.map(a=>a.id)};
  button.click();
  return {ok:true,pressed:button.getAttribute('aria-pressed'),style:getComputedStyle(button).backgroundColor};
 }""",{'kind':kind,'answerId':answer_id})
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for lang in ['en','es','pt']:
  for layout,w,h in [('portrait',390,844),('desktop',1366,900)]:
   r={'language':lang,'layout':layout,'status':'FAIL','scenes':[]}
   context=browser.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
   page=context.new_page()
   try:
    page.goto(URL,wait_until='domcontentloaded',timeout=28000)
    page.wait_for_function("() => typeof document.querySelector('#nextExperience')?.onclick==='function' && !!window.SIYAYOVerbExplorerDependencyHeadProbeLive",timeout=25000)
    page.locator(f'[data-experience-language="{lang}"]').click()
    r['scenes'].append(audit_exploration(page,lang,'shopping-for-dinner',4,layout))
    page.locator('#nextExperience').click()
    r['scenes'].append(audit_exploration(page,lang,'preparing-dinner',5,layout))
    page.locator('#nextExperience').click()
    page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='having-dinner'")
    page.locator('#learnerIdentityInput').fill('90C7H1-FULL-'+lang+'-'+layout)
    page.locator('#learnerIdentityConfirm').click()
    page.locator('#questionGear [data-question-index="3"]').click()
    page.wait_for_function("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill==='why.use.contextual-reason'",timeout=14000)
    assert session(page)['completed']==0
    page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden")
    assert answer(page,'function','why')['ok']
    assert answer(page,'local','prepared-together')['ok']
    assert session(page)['completed']==2,('S3 progression',session(page))
    r['scenes'].append({'scene':'having-dinner','progress':session(page)})
    page.screenshot(path=str(OUT/f'S3-2of3-{lang}-{layout}.png'),full_page=True,animations='disabled')
    page.locator('#nextExperience').click()
    page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='after-dinner-conversation'")
    assert session(page)['completed']==2,('S4 navigation mutated progress',session(page))
    assert answer(page,'transfer','talking-together')['ok']
    assert session(page)['completed']==3,('S4 transfer',session(page))
    page.wait_for_timeout(250)
    trail_text=page.locator('#learnerTrailSurface').inner_text()
    if '3/3' not in trail_text:
     r['trailObservation']={'excerpt':trail_text[:2000],'html':page.locator('#learnerTrailSurface').inner_html()[:1500]}
    assert '3/3' in trail_text,('Trail not reflecting certified 3/3',r.get('trailObservation'))
    r['scenes'].append({'scene':'after-dinner-conversation','progress':session(page)})
    page.screenshot(path=str(OUT/f'S4-3of3-{lang}-{layout}.png'),full_page=True,animations='disabled')
    r['status']='PASS'
   except Exception as e:
    r['error']=str(e)[:950];r['trace']=traceback.format_exc()[-2200:]
    try:page.screenshot(path=str(OUT/f'ERROR-{lang}-{layout}.png'),full_page=True)
    except Exception:pass
   finally:
    print('90C7H1 DF/DHP',lang,layout,r['status'],r.get('error',''),flush=True)
    results.append(r);context.close()
 browser.close()
(OUT/'report.json').write_text(json.dumps(results,indent=2,ensure_ascii=False),encoding='utf-8')
if any(x['status']!='PASS' for x in results):raise SystemExit(1)
