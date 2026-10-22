#!/usr/bin/env python3
"""JAGUAR 89Y: native Chromium S1 WHICH/WHAT/WHERE HOW TO SHOW; WHY via 89U."""
import json,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('visual-audit-89y');OUT.mkdir(exist_ok=True)
URL='http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner'
LANGS=('en','es','pt')
FORMATS=(('desktop',1440,900),('portrait',390,844),('landscape',844,390))
REV={'en':('REVIEW','Why does this choice fit the dinner?'),
     'es':('REVISIÓN','¿Por qué esta elección combina con la cena?'),
     'pt':('REVISÃO','Por que esta escolha combina com o jantar?')}
CASES=[]
def check(ok,description):
 if not ok:raise AssertionError(description)
def capture(page,part,lang,form):
 page.screenshot(path=str(OUT/f'{part}-{lang}-{form}.png'),full_page=True,animations='disabled',timeout=16000)
def audit_qw(page,lang,form):
 check(page.evaluate('document.documentElement.scrollWidth<=innerWidth+4'),f'global overflow {lang}/{form}')
 return page.evaluate("""() => {
  let r=e=>e.getBoundingClientRect();
  let trail=document.querySelector('#learnerTrailSurface');
  let wp=trail?.querySelector('.wp-poly-scroller');
  let why=[...trail?.querySelectorAll('.wp-poly-word')||[]]
       .find(x=>x.querySelector('strong')?.textContent==='WHY');
  let es=why?.querySelector('small span[lang="es"]');
  let pt=why?.querySelector('small span[lang="pt"]');
  return {cells:trail?.querySelectorAll('.wp-poly-cell').length||0,
   grammaticalFamily:trail?.querySelector('.learner-trail-family')?.textContent||null,
   grammaticalRole:trail?.querySelector('.learner-trail-grammar-role')?.textContent||null,
   separatedGrammar:(()=>{let a=trail?.querySelector('.learner-trail-family'),b=trail?.querySelector('.learner-trail-grammar-role');
      return !!a&&!!b&&r(b).top>r(a).top+2})(),
   es:es?.textContent||null,pt:pt?.textContent||null,
   separatedQW:!!es&&!!pt&&r(pt).top>r(es).top+2,
   internalScroll:!!wp&&wp.scrollWidth>wp.clientWidth};
 }""")
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 for lang in LANGS:
  for form,w,h in FORMATS:
   row={'language':lang,'format':form,'status':'FAIL'}
   ctx=browser.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
   page=ctx.new_page()
   try:
    page.goto(URL,wait_until='domcontentloaded',timeout=25000)
    page.wait_for_function("""() => !!window.SIYAYOVerbExplorerLearnerIdentitySource &&
      !!window.SIYAYOVerbExplorerAdaptiveCoordinator &&
      typeof document.querySelector('#nextExperience')?.onclick==='function'""",timeout=25000)
    page.locator('[data-experience-language="'+lang+'"]').click()
    page.locator('#learnerIdentityInput').fill('JAGUAR-89Y-SYNTH-'+lang+'-'+form)
    page.locator('#learnerIdentityConfirm').click()
    page.locator('#questionGear [data-question-index="3"]').click()
    page.wait_for_function("""() => !document.querySelector('#choiceResolverPanel')?.hidden &&
     document.querySelectorAll('#choiceOptions .choice-option').length===2""",timeout=14000)
    choices=page.evaluate("""() => [...document.querySelectorAll('#choiceOptions .choice-option')].map(row=>{
      let a=row.querySelector('.choice-audio'),b=row.querySelector('.choice-select');
      let r=row.getBoundingClientRect(),ra=a?.getBoundingClientRect(),rb=b?.getBoundingClientRect();
      return {width:r.width,audio:!!a?.querySelector('.siyayo-speaker'),
       response:!!b,ordered:!!ra&&!!rb&&ra.left<rb.left,aria:b?.getAttribute('aria-pressed')};
    })""")
    check(len(choices)==2 and all(x['audio'] and x['response'] and x['ordered'] for x in choices),
      'WHICH response/audio pairing lost')
    check(page.locator('#choiceReview').is_hidden(),'REVIEW shown prematurely')
    page.locator('#choiceOptions [data-choice-select]').first.click()
    page.wait_for_function("() => !document.querySelector('#choiceReview')?.hidden",timeout=10000)
    review=page.locator('#choiceReview').inner_text()
    check(REV[lang][0] in review and REV[lang][1] in review,'REVIEW localization or order wrong')
    check(page.locator('#choiceReview [data-choice-review-audio] .siyayo-speaker').count()==1,
      'WHICH REVIEW gold speaker absent')
    capture(page,'S1-WHICH-R1R2-REVIEW',lang,form)
    row['which']={'twoResponseRows':True,'reviewAfterChoice':True}
    page.locator('#questionGear [data-question-index="0"]').click()
    page.wait_for_function("""() => !document.querySelector('#whatAssessmentPanel')?.hidden &&
     document.querySelectorAll('#whatAssessmentPanel .what-probe-question-card').length===2""",timeout=15000)
    what=page.evaluate("""() => {
      let p=document.querySelector('#whatAssessmentPanel');
      let qs=[...p.querySelectorAll('.what-probe-question-card')];
      let rs=[...p.querySelectorAll('.what-probe-response-row')];
      let width=p.querySelector('.what-object-question-probe').getBoundingClientRect().width;
      return {questionCount:qs.length,
       questionsIntegrated:qs.every(q=>!!q.querySelector(':scope > .siyayo-speaker')),
       rows:rs.length,rowsPaired:rs.every(x=>!!x.querySelector('.what-probe-speaker .siyayo-speaker') &&
           !!x.querySelector('.what-probe-option') && x.getBoundingClientRect().width>=width*.79),
       noPrematureQWDisclosure:!qs[0]?.querySelector('.study-target-word')};
    }""")
    check(what['questionCount']==2 and what['questionsIntegrated'] and what['rows']>=2 and
       what['rowsPaired'] and what['noPrematureQWDisclosure'],'WHAT QUESTION vs RESPONSE signature mismatched '+str(what))
    capture(page,'S1-WHAT',lang,form)
    row['what']=what
    page.locator('#questionGear [data-question-index="1"]').click()
    page.wait_for_function("""() => !document.querySelector('#whereAssessmentPanel')?.hidden &&
     document.querySelectorAll('#whereAssessmentPanel button.where-probe-question').length===2""",timeout=15000)
    where=page.evaluate("""() => {
      let p=document.querySelector('#whereAssessmentPanel');
      let qs=[...p.querySelectorAll('button.where-probe-question')];
      let rs=[...p.querySelectorAll('.where-probe-choice')];
      let base=p.querySelector('.where-location-probe').getBoundingClientRect().width;
      return {questions:qs.length,questionsIntegrated:qs.every(q=>
        !!q.querySelector(':scope > .siyayo-speaker') && !q.querySelector('.where-probe-audio') &&
        !!q.querySelector('.study-target-word') &&
        getComputedStyle(q.querySelector('.study-target-word')).whiteSpace==='nowrap'),
       rows:rs.length,rowsPaired:rs.every(x=>!!x.querySelector('.where-probe-audio .siyayo-speaker')&&
           !!x.querySelector('.where-probe-option')&&x.getBoundingClientRect().width>=base*.79),
       livingRolesHidden:[...document.querySelectorAll('#livingLines .living-line')].slice(0,2)
         .every(x=>!!x.querySelector('.siyayo-speaker')&&!x.querySelector(':scope > span')&&!!x.getAttribute('aria-label'))};
    }""")
    check(where['questions']==2 and where['questionsIntegrated'] and where['rows']>=4 and
       where['rowsPaired'] and where['livingRolesHidden'],'WHERE full-width HOW TO SHOW mismatch '+str(where))
    page.locator('#learningTrailWordPathModule').evaluate('(e)=>e.open=true')
    trail=audit_qw(page,lang,form)
    check(trail['cells']>=12 and trail['separatedGrammar'] and
      trail['es']=='POR QUÉ' and trail['pt']=='POR QUÊ' and trail['separatedQW'],
      'Learning Trail / Word Path breakdown '+str(trail))
    if form=='portrait':check(trail['internalScroll'],'Word Path portrait scroll must be internal')
    row['where']=where;row['trail']=trail
    capture(page,'S1-WHERE-TRAIL-WORDPATH',lang,form)
    page.locator('#questionGear [data-question-index="3"]').click()
    page.wait_for_function("() => !document.querySelector('#choiceResolverPanel')?.hidden",timeout=13000)
    row['status']='PASS'
   except Exception as err:
    row['error']=str(err)[:1100]
    row['trace']=traceback.format_exc()[-2100:]
    try:capture(page,'FAIL',lang,form)
    except Exception:pass
   finally:
    CASES.append(row);print('JAGUAR 89Y',lang,form,row['status'],row.get('error',''),flush=True)
    ctx.close()
 browser.close()
(OUT/'report.json').write_text(json.dumps(CASES,ensure_ascii=False,indent=2),encoding='utf8')
passed=sum(x['status']=='PASS' for x in CASES)
print('JAGUAR 89Y STRICT',passed,'/',len(CASES),flush=True)
if passed!=len(CASES):raise SystemExit(1)
