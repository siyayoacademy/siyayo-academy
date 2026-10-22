from pathlib import Path
import json,traceback
from playwright.sync_api import sync_playwright
OUT=Path('visual-audit-89z');OUT.mkdir(exist_ok=True)
RESULTS=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for lang in ('es','pt'):
  ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  page=ctx.new_page()
  row={'language':lang,'portrait':'390x844','status':'FAIL'}
  try:
   page.goto('http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner',wait_until='domcontentloaded',timeout=25000)
   page.wait_for_function("() => !!window.SIYAYOVerbExplorerExperienceNavigation && typeof document.querySelector('#nextExperience')?.onclick==='function'",timeout=25000)
   page.locator('[data-experience-language="'+lang+'"]').click()
   page.locator('#questionGear [data-question-index="3"]').click()
   page.wait_for_function("() => !document.querySelector('#pronounComparisonPanel')?.hidden && document.querySelectorAll('#pronounComparisonPanel .pronoun-comparison-case').length===2",timeout=15000)
   page.evaluate("""() => {
     window.__zSpeak=[];
     SpeechSynthesis.prototype.speak=function(u){window.__zSpeak.push({text:u.text,lang:u.lang})};
     SpeechSynthesis.prototype.cancel=function(){};
   }""")
   names=('cual','cuales') if lang=='es' else ('qual','quais')
   panel=page.locator('#pronounComparisonPanel')
   def score():
    return page.evaluate("""() => {
     const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();
     const c=s?.context;
     const p=c&&window.AdaptivePassContractProgressView.project(c.passContract,c.evidencePackets,window.GreenPassProfile);
     return {completed:p?.completed??null,packets:c?.evidencePackets?.length??0};
    }""")
   before=score()
   cases=panel.locator('.pronoun-comparison-case')
   assert cases.count()==2
   for i in range(2):
    case=cases.nth(i)
    assert case.locator('.pronoun-comparison-question-card > .siyayo-speaker').count()==1
    assert case.locator('.pronoun-comparison-response-row').count()==2
    assert case.locator('.pronoun-comparison-audio .siyayo-speaker').count()==2
    q=case.locator('.pronoun-comparison-gap').inner_text()
    assert '___' in q and names[i].upper() not in q.upper(),'answer disclosed prematurely'
   page.screenshot(path=str(OUT/f'89z-{lang}-before-portrait.png'),full_page=True,animations='disabled')
   cases.first.locator('.pronoun-comparison-question-card').click()
   cases.first.locator('.pronoun-comparison-audio').first.click()
   assert len(page.evaluate('window.__zSpeak'))==2
   assert score()==before,'listening alone minted canonical evidence'
   for i in range(2):
    case=cases.nth(i)
    case.locator(f'[data-pronoun-choice="{names[i]}"]').click()
    assert case.locator('.pronoun-comparison-complete').count()==1
    assert case.locator('.pronoun-comparison-option[data-pronoun-free-correct="true"]').count()==1
   assert score()==before,'free practice minted canonical evidence'
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+4'),'global portrait overflow'
   page.screenshot(path=str(OUT/f'89z-{lang}-answered-portrait.png'),full_page=True,animations='disabled')
   row.update(status='PASS',canonicalScore=before,freeSituations=2,questionSpeakers=2,responseSpeakers=4)
  except Exception as e:
   row.update(error=str(e)[:900],trace=traceback.format_exc()[-2100:])
   try:page.screenshot(path=str(OUT/f'89z-{lang}-FAIL-portrait.png'),full_page=True,timeout=12000)
   except Exception:pass
  finally:
   print('JAGUAR 89Z',lang,row['status'],row.get('error',''),flush=True)
   RESULTS.append(row);ctx.close()
 browser.close()
(OUT/'report.json').write_text(json.dumps(RESULTS,indent=2,ensure_ascii=False),encoding='utf-8')
passed=sum(x['status']=='PASS' for x in RESULTS)
print('JAGUAR 89Z PORTRAIT',passed,'/',len(RESULTS))
if passed!=len(RESULTS):raise SystemExit(1)
