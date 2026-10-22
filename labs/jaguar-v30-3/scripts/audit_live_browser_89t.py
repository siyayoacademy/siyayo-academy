#!/usr/bin/env python3
"""89T: REAL pinned Explorer DOM in disposable Chromium. No synthetic DOM or real student."""
import json, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path("visual-audit-89t");OUT.mkdir(exist_ok=True)
URL="http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner"
LANGS=("en","es","pt")
REVIEW={
 "en":("REVIEW","Why does this choice fit the dinner?"),
 "es":("REVISIÓN","¿Por qué esta elección combina con la cena?"),
 "pt":("REVISÃO","Por que esta escolha combina com o jantar?")
}
REPORT=[]
def check(ok,description):
 if not ok: raise AssertionError(description)
def shot(page,label):
 page.screenshot(path=str(OUT/(label+".png")),full_page=True,animations="disabled",timeout=18000)
def enter(page):
 page.goto(URL,wait_until="domcontentloaded",timeout=25000)
 page.wait_for_function("() => !!window.SIYAYOVerbExplorerExperienceNavigation && document.querySelectorAll('#questionGear [data-question-index]').length>=4",timeout=20000)
 # Both the learning cycle and NEXT wire bootstrap asynchronously, independently
 # of the visible corpus/QW buttons. Never click NEXT before its own binding.
 page.wait_for_function("""() =>
   typeof document.getElementById('nextExperience')?.onclick==='function' &&
   !!window.SIYAYOVerbExplorerAdaptiveCoordinator &&
   !!window.SIYAYOVerbExplorerLearnerIdentitySource
 """,timeout=30000)
 if not page.locator("#experienceView").is_visible():
  page.locator('[data-mode="experience"]').click()
 check("Shopping" in page.locator("#experienceTitle").inner_text(),"not S1 Shopping")
def keep(label,page,fn):
 item={"case":label,"status":"FAIL"}
 try:
  item["details"]=fn(page)
  item["status"]="PASS"
 except Exception as error:
  item["error"]=str(error)[:1200]
  item["trace"]=traceback.format_exc()[-2500:]
  try:
   item["browser_state"]=page.evaluate("""() => ({
     experience:window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId?.()||null,
     nextBound:typeof document.getElementById('nextExperience')?.onclick==='function',
     nextTo:document.getElementById('nextExperience')?.dataset?.nextExperience||null,
     nextCardState:document.getElementById('nextExperience')?.closest('.toroidal-next')?.dataset?.nextState||null,
     hasCoordinator:!!window.SIYAYOVerbExplorerAdaptiveCoordinator,
     hasNextWire:!!window.SIYAYOVerbExplorerLiveNextWire,
     hasIdentity:!!window.SIYAYOVerbExplorerLearnerIdentitySource
   })""")
  except Exception:pass
  try:shot(page,"FAIL-"+label)
  except Exception:pass
 finally:
  REPORT.append(item)
 print("JAGUAR 89T",label,item["status"],item.get("error",""),flush=True)
def review_case(page):
 enter(page)
 checked=[]
 for lang in LANGS:
  page.locator('[data-experience-language="'+lang+'"]').click()
  # S1 WHICH is the authored fourth question (index 3); no assessment is inferred by question text.
  page.locator('#questionGear [data-question-index="3"]').click()
  page.wait_for_function("() => !document.getElementById('choiceResolverPanel').hidden && document.querySelectorAll('#choiceOptions [data-choice-select]').length===2",timeout=15000)
  check(page.locator("#choiceReview").is_hidden(),"REVIEW visible before R1/R2 selection "+lang)
  check(page.locator("#choiceFeedback").is_visible(),"Contextual feedback absent "+lang)
  choices=page.locator("#choiceOptions [data-choice-select]")
  check(choices.count()==2,"Expected canonical R1/R2 choices "+lang)
  first=choices.first.get_attribute("data-choice-select")
  choices.first.click()
  page.wait_for_function("() => !document.getElementById('choiceReview').hidden",timeout=9000)
  review=page.locator("#choiceReview").inner_text()
  check(REVIEW[lang][0] in review and REVIEW[lang][1] in review,"Review translation mismatch "+lang)
  check(page.locator("#choiceFeedback").inner_text().strip()!="","Missing post-choice feedback "+lang)
  check(page.locator('#choiceReview [data-choice-review-audio]').count()==1,"Review speech control absent "+lang)
  check(page.evaluate("""() => {
    let f=document.getElementById('choiceFeedback'),r=document.getElementById('choiceReview');
    return !!(f.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_FOLLOWING);
  }"""),"REVIEW must follow feedback in DOM "+lang)
  shot(page,"S1-WHICH-R1R2-REVIEW-"+lang)
  checked.append({"language":lang,"selectedCandidate":first,"review":REVIEW[lang][1],
    "choiceCount":2,"contractScoreProducedByReview":False,
    "audioButtonVisible":True})
 # Repeated choices remain contextual; no NICK means no claimed authenticated assessment.
 return checked
def why_score(page):
 return page.evaluate("""() => {
  const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();
  const c=s?.context||{};
  const p=window.AdaptivePassContractProgressView?.project?.(
    c.passContract,c.evidencePackets,window.GreenPassProfile);
  return {skill:s?.session?.decision?.skill||null,
   origin:s?.session?.decision?.assessmentScope?.originExperienceId||null,
   assessmentLanguage:s?.session?.decision?.assessmentScope?.language||null,
   completed:p?.completed??null,total:p?.total??null,status:p?.status||null,
   experience:window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId?.()||null};
 }""")
def spec_labels(page,language):
 return page.evaluate("""language=>{
  const nav=window.SIYAYOVerbExplorerExperienceNavigation;
  const source=window.AdaptiveWhyContextualReasonProbeSpecificationSource;
  const skill=window.SIYAYOVerbExplorerCanonicalSkillSource?.getDefinition?.();
  if(!nav||!source||skill?.id!=='why.use.contextual-reason')return null;
  const s=source.resolve(skill,nav.getExperience('having-dinner'),
    nav.getExperience('after-dinner-conversation'),language);
  const choice=(p,id)=>p?.alternatives?.find(x=>x.id===id)?.label||null;
  return s&&{question:choice(s.functionProbe,'why'),
    local:choice(s.localProbe,'prepared-together'),
    transfer:choice(s.transferProbe,'talking-together')};
 }""",language)
def why_case(page,language):
 enter(page)
 # S1 → S2 → S3 via explicit, learner-owned NEXT; no scoring from navigation.
 # Real NEXT remains learner-owned; verify the source-installed onclick and route.
 check(page.evaluate("() => typeof document.querySelector('#nextExperience')?.onclick==='function'"),"NEXT not installed before first visit")
 page.locator("#nextExperience").click()
 page.wait_for_function("""() => 
   window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId?.()==='preparing-dinner' &&
   document.querySelector('#experienceTitle')?.textContent?.includes('Preparing')
 """,timeout=12000)
 page.locator("#nextExperience").click()
 page.wait_for_function("""() =>
   window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId?.()==='having-dinner' &&
   document.querySelector('#experienceTitle')?.textContent?.includes('Having')
 """,timeout=12000)
 page.locator('[data-experience-language="'+language+'"]').click()
 page.locator("#learnerIdentityInput").fill("JAGUAR-89T-SYNTH-"+language.upper())
 page.locator("#learnerIdentityConfirm").click()
 page.locator('#questionGear [data-question-index="3"]').click()  # WHY in S3
 page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden && document.querySelectorAll('#whyAssessmentPanel .why-contextual-reason-probe').length===2",timeout=18000)
 labels=spec_labels(page,language)
 check(labels is not None and all(labels.values()),"Cannot resolve canonical WHY alternatives "+language)
 start=why_score(page)
 check(start["skill"]=="why.use.contextual-reason" and start["origin"]=="having-dinner","Wrong WHY origin "+language)
 panel=page.locator("#whyAssessmentPanel")
 panel.locator(".why-contextual-reason-probe").nth(0).get_by_role("button",name=labels["question"],exact=True).click()
 panel.locator(".why-contextual-reason-probe").nth(1).get_by_role("button",name=labels["local"],exact=True).click()
 page.wait_for_function("""() => {
  const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.(),c=s?.context;
  const p=c&&window.AdaptivePassContractProgressView?.project?.(c.passContract,c.evidencePackets,window.GreenPassProfile);
  return p?.completed===2;
 }""",timeout=12000)
 partial=why_score(page)
 check(partial["status"]=="WAITING_FOR_EVIDENCE","2/3 must not be Green "+language)
 shot(page,"S3-WHY-2of3-"+language)
 page.locator("#nextExperience").click() # deliberate S4 visit, not automatic transfer
 page.wait_for_function("() => document.querySelector('#experienceTitle')?.textContent?.includes('After') || document.querySelector('#experienceTitle')?.textContent?.includes('jantar') || document.querySelector('#experienceTitle')?.textContent?.includes('cena')",timeout=14000)
 # S4 is indexed WHAT, WHO, WHY, HOW.
 page.locator('#questionGear [data-question-index="2"]').click()
 page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden && document.querySelectorAll('#whyAssessmentPanel .why-contextual-reason-probe').length===1",timeout=16000)
 before=why_score(page)
 check(before["completed"]==2 and before["origin"]=="having-dinner" and before["status"]=="WAITING_FOR_EVIDENCE","Visiting S4 must retain 2/3 and S3 origin "+language+" "+str(before))
 shot(page,"S4-WHY-BEFORE-TRANSFER-"+language)
 page.locator('#whyAssessmentPanel .why-contextual-reason-probe').first.get_by_role("button",name=labels["transfer"],exact=True).click()
 page.wait_for_function("""() => {
  const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.(),c=s?.context;
  const p=c&&window.AdaptivePassContractProgressView?.project?.(c.passContract,c.evidencePackets,window.GreenPassProfile);
  return p?.completed===3 && p?.status==='GREEN_PASS';
 }""",timeout=14000)
 after=why_score(page)
 check(after["origin"]=="having-dinner" and after["experience"]=="after-dinner-conversation","Transfer changed origin or stage "+language)
 check("GREEN PASS" in page.locator("#whyAssessmentPanel").inner_text(),"No WHY panel Green feedback "+language)
 shot(page,"S4-WHY-TRANSFER-3of3-"+language)
 return {"language":language,"S3":partial,"S4_before_response":before,"S4_after_response":after,
  "canonical":labels,"nextWasUserClicked":True,"speakerAcousticsVerified":False}
def layout_case(page,width,height,label):
 page.set_viewport_size({"width":width,"height":height})
 enter(page)
 page.locator("#questionGear [data-question-index='3']").click()
 page.locator("#choiceOptions [data-choice-select]").first.click()
 page.locator("#learningTrailWordPathModule summary").click()
 page.wait_for_timeout(180)
 stats=page.evaluate("""() => {
   const dims=el=>{if(!el)return null;let b=el.getBoundingClientRect();
     return {left:b.left,right:b.right,width:b.width,top:b.top,bottom:b.bottom}};
   return {width:innerWidth,height:innerHeight,
    docWidth:document.documentElement.scrollWidth,
    next:dims(document.querySelector('#nextExperience')),
    trail:dims(document.querySelector('#learningTrailWordPathModule')),
    review:dims(document.querySelector('#choiceReview')),
    scroller:dims(document.querySelector('.wp-poly-scroller')),
    scrollableWordPath:(()=>{let n=document.querySelector('.wp-poly-scroller');return n&&n.scrollWidth>n.clientWidth})()
   };
 }""")
 check(stats["review"] is not None and stats["next"] is not None,"Review/NEXT missing "+label)
 check(stats["docWidth"]<=width+4,"Global horizontal overflow "+label+" "+str(stats["docWidth"]))
 for target in ("next","review"):
  b=stats[target]
  check(b["left"]>=-3 and b["right"]<=width+3,"Element clipped "+target+" "+label+" "+str(b))
 shot(page,"UI-"+label)
 return stats
with sync_playwright() as runner:
 browser=runner.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
 ctx=browser.new_context(viewport={"width":1440,"height":900},reduced_motion="reduce")
 p=ctx.new_page()
 keep("S1-REVIEW-EN-ES-PT",p,review_case)
 ctx.close()
 for language in LANGS:
  ctx=browser.new_context(viewport={"width":1440,"height":900},reduced_motion="reduce")
  p=ctx.new_page()
  keep("S3-S4-WHY-"+language,p,lambda pg,lang=language:why_case(pg,lang))
  ctx.close()
 for label,width,height in [("DESKTOP",1440,900),("PORTRAIT-390x844",390,844),("LANDSCAPE-844x390",844,390)]:
  ctx=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
  p=ctx.new_page()
  keep("LAYOUT-"+label,p,lambda pg,w=width,h=height,n=label:layout_case(pg,w,h,n))
  ctx.close()
 browser.close()
(OUT/"report.json").write_text(json.dumps({
 "elo":"V30.3.89T","source":"pinned Explorer c7e83709cacf8479847df0f3cee4ed8a563aaae6",
 "kind":"actual rendered browser UI, synthetic identity; no DOM fixtures",
 "visualViewportIsEmulation":True,"realPhoneOrAcousticAudioVerified":False,
 "results":REPORT},ensure_ascii=False,indent=2),encoding="utf8")
passed=sum(x["status"]=="PASS" for x in REPORT)
print("JAGUAR V30.3.89T strict real browser",passed,"/",len(REPORT),flush=True)
if passed!=len(REPORT):raise SystemExit(1)
