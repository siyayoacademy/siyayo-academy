from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path('visual-audit-patita-h13');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for language in ['en','es','pt']:
  context=browser.new_context(viewport={'width':390,'height':844})
  page=context.new_page()
  try:
   page.goto('http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner',wait_until='domcontentloaded')
   page.wait_for_function("() => !!window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId() && !!window.SIYAYOVerbExplorerLearnerIdentitySource")
   page.locator('[data-experience-language="'+language+'"]').click()
   def state(where):
    data=page.evaluate("""() => {
     let el=document.querySelector('#learnerIdentityPanel'),compact=document.querySelector('#learnerIdentityCompact'),b=document.querySelector('#learnerIdentityChange'),editor=document.querySelector('#learnerIdentityEditor'),source=window.SIYAYOVerbExplorerLearnerIdentitySource;
     return {learnerId:source?.getId(),experience:window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId(),questionWord:window.SIYAYOVerbExplorerExperienceRuntime?.activeQuestionWord(),panelDisplay:el?.dataset.identityDisplay,compactHidden:compact?.hidden,editorHidden:editor?.hidden,buttonVisible:!!b?.getBoundingClientRect().width,position:el?.parentNode?.id,html:el?.outerHTML.slice(0,750),trail:window.SIYAYOPatitaInteractionTrail?.projectVisible()};
    }""")
    print('H13 STATE',language,where,json.dumps(data,ensure_ascii=False)[:2700],flush=True)
   state('before')
   page.locator('#learnerIdentityInput').fill('H13-ALPHA-'+language)
   page.locator('#learnerIdentityConfirm').click()
   page.wait_for_timeout(250)
   state('after-confirm')
   page.locator('#questionGear [data-question-index="3"]').click()
   page.wait_for_timeout(200)
   state('which')
   page.locator('#nextExperience').click()
   page.wait_for_timeout(250)
   state('after-next')
   page.screenshot(path=str(out/(language+'-diagnostic.png')),full_page=True)
  except Exception as e: print('H13 ERROR',language,repr(e),flush=True)
  finally:context.close()
 browser.close()
