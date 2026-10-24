from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('visual-audit-patita-h13-4');out.mkdir(exist_ok=True)
stages=[
 ('shopping-for-dinner','which','en'),
 ('preparing-dinner','where','es'),
 ('having-dinner','why','pt'),
 ('after-dinner-conversation','what','en'),
]
runs=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for initial_language in ['en','es','pt']:
  c=browser.new_context(viewport={'width':390,'height':844})
  page=c.new_page();row={'startLanguage':initial_language,'status':'FAIL','visited':[]}
  try:
   page.goto('http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner',wait_until='domcontentloaded')
   page.wait_for_function("() => !!window.SIYAYOPatitaInteractionTrail?.projectVisible && document.querySelector('#learnerIdentityPanel')?.__siyayoLearnerIdentityInstalled===true")
   page.locator('[data-experience-language="'+initial_language+'"]').click()
   nick='H13.4-'+initial_language
   page.locator('#learnerIdentityInput').fill(nick);page.locator('#learnerIdentityConfirm').click()
   page.wait_for_function("(nick) => window.SIYAYOVerbExplorerLearnerIdentitySource?.getId()===nick",arg=nick)
   for index,(experience,word,base_language) in enumerate(stages):
    lang=['en','es','pt'][(['en','es','pt'].index(base_language)+['en','es','pt'].index(initial_language))%3]
    page.wait_for_function("(exp) => window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId()===exp",arg=experience)
    page.locator('[data-experience-language="'+lang+'"]').click()
    selector=page.locator('#questionGear button').filter(has_text={'which':{'en':'WHICH','es':'CUÁL','pt':'QUAL'}}.get(word,{}).get(lang,'')) if False else None
    page.evaluate("(word) => {const q=window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId();const buttons=[...document.querySelectorAll('#questionGear [data-question-index]')];const corpus=window.SIYAYOVerbExplorerExperienceNavigation.getExperience(q);const idx=corpus.thinkingMind.findIndex(x=>x.questionWord===word);if(idx<0)throw Error('missing QW '+word);buttons[idx].click();}",word)
    page.wait_for_function("(x) => window.SIYAYOVerbExplorerExperienceRuntime.activeQuestionWord()===x",arg=word)
    page.locator('#learningTrailWordPathModule').evaluate('(el)=>el.open=true')
    page.evaluate("() => window.SIYAYOVerbExplorerLearnerTrailSurface.refresh({document})")
    snap=page.evaluate("""() => ({
      identity:window.SIYAYOVerbExplorerLearnerIdentitySource.getId(),
      experience:window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId(),
      language:window.SIYAYOVerbExplorerExperienceRuntime.activeLanguage(),
      questionWord:window.SIYAYOVerbExplorerExperienceRuntime.activeQuestionWord(),
      trailLanguage:document.querySelector('#learnerTrailSurface')?.dataset.displayLanguage||null,
      trailQW:document.querySelector('#learnerTrailSurface')?.dataset.currentQword||null,
      wordPathDisplay:document.querySelector('.wp-polyglot')?.dataset.focusedLanguage||null,
      wordPathAssessment:document.querySelector('.wp-polyglot')?.dataset.assessmentLanguage||null,
      patitaOwner:window.SIYAYOPatitaInteractionTrail.getVisibleRecords().map(x=>x.learnerId).filter(Boolean),
      outcomes:window.SIYAYOPatitaInteractionTrail.getVisibleRecords().filter(x=>x.kind==='patita-observed-result').length
    })""")
    assert snap['identity']==nick,snap
    assert snap['experience']==experience and snap['language']==lang and snap['questionWord']==word,snap
    assert snap['trailLanguage'] in (None,lang),snap
    assert snap['trailQW'] in (None,word),snap
    assert snap['wordPathDisplay'] in (None,lang),snap
    assert all(x==nick for x in snap['patitaOwner']),snap
    row['visited'].append(snap)
    if index<len(stages)-1:
     page.locator('#nextExperience').click()
   page.screenshot(path=str(out/(initial_language+'-s4.png')),full_page=True)
   assert row['visited'][-1]['outcomes']==0,'navigation created observed result'
   row['status']='PASS'
  except Exception as e:
   row['error']=repr(e)[:1200]
   try:page.screenshot(path=str(out/('ERROR-'+initial_language+'.png')),full_page=True)
   except Exception:pass
  finally:
   runs.append(row);print('H13.4',initial_language,row['status'],row.get('error',''),flush=True);c.close()
 browser.close()
(out/'report.json').write_text(json.dumps(runs,indent=2,ensure_ascii=False))
if any(x['status']!='PASS' for x in runs):raise SystemExit(1)
