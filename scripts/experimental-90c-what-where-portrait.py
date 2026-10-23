#!/usr/bin/env python3
"""JAGUAR 89W: live WHAT/WHERE voice, evidence boundaries, and Word Path restoration."""
import json,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path("visual-audit-90c-what-where");OUT.mkdir(exist_ok=True)
URL="http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner"
FORMATS=[("portrait",390,844)]
LANGS=("en","es","pt")
CASES=[]
def check(value,reason):
 if not value: raise AssertionError(reason)
def canonical(page):
 return page.evaluate("""() => {
  const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();
  const c=s?.context, p=c&&window.AdaptivePassContractProgressView?.project?.(
    c.passContract,c.evidencePackets,window.GreenPassProfile);
  return {skill:s?.session?.decision?.skill||null,
    origin:s?.session?.decision?.assessmentScope?.originExperienceId||null,
    language:s?.session?.decision?.assessmentScope?.language||null,
    completed:p?.completed??null,total:p?.total??null,status:p?.status||null};
 }""")
def assertions(page,skill,language,n):
 c=canonical(page)
 check(c["skill"]==skill and c["origin"]=="shopping-for-dinner" and c["language"]==language,
       "Cross-scope assessment: "+str(c))
 check(c["completed"]==n and c["total"]==3,
       "Canonical expected "+str(n)+"/3 got "+str(c))
 return c
def setup(page,language,nick):
 page.goto(URL,wait_until="domcontentloaded",timeout=26000)
 page.wait_for_function("""() => !!window.SIYAYOVerbExplorerLearnerIdentitySource &&
  !!window.SIYAYOVerbExplorerAdaptiveCoordinator &&
  typeof document.querySelector('#nextExperience')?.onclick==='function'""",timeout=26000)
 page.locator('[data-experience-language="'+language+'"]').click()
 page.locator("#learnerIdentityInput").fill(nick)
 page.locator("#learnerIdentityConfirm").click()
 page.evaluate("""() => {
   window.__speech89W=[];
   SpeechSynthesis.prototype.speak=function(u){window.__speech89W.push({text:u.text,lang:u.lang});};
   SpeechSynthesis.prototype.cancel=function(){};
 }""")
def what(page,language):
 page.locator('#questionGear [data-question-index="0"]').click()
 page.wait_for_function("""() => {
  const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();
  return s?.session?.decision?.skill==='what.use.object-question' &&
    !document.querySelector('#whatAssessmentPanel')?.hidden &&
    document.querySelectorAll('#whatAssessmentPanel .what-probe-question-card').length===2;
 }""",timeout=18000)
 check(page.locator("#whatAssessmentPanel .what-probe-question-card .siyayo-speaker").count()==2,
       "WHAT question speakers missing")
 check(page.locator("#whatAssessmentPanel .what-probe-speaker .siyayo-speaker").count()>=2,
       "WHAT canonical response SVG speakers missing")
 checks=assertions(page,'what.use.object-question',language,0)
 before=len(page.evaluate("window.__speech89W"))
 page.locator("#whatAssessmentPanel .what-probe-question-card").first.click()
 page.locator("#whatAssessmentPanel .what-probe-speaker").first.click()
 after=len(page.evaluate("window.__speech89W"))
 check(after-before==2,"WHAT speech wasn't called twice")
 assertions(page,'what.use.object-question',language,0)
 spec=page.evaluate("""lang=>{
  const nav=window.SIYAYOVerbExplorerExperienceNavigation;
  const skill=window.SIYAYOVerbExplorerCanonicalSkillSource.getDefinition();
  const s=window.AdaptiveWhatObjectQuestionProbeSpecificationSource.resolve(
    skill,nav.getExperience('shopping-for-dinner'),nav.getExperience('preparing-dinner'),
    nav.getNouns(),lang);
  return {functionLabel:s?.functionProbe?.alternatives?.find(x=>x.id==='what')?.label,
   localLabel:(()=>{let l=s?.localProbe;let v=l?.alternatives?.find(x=>l.expectedAlternativeIds.includes(x.id));
      return v?.response||v?.label;})()};
 }""",language)
 check(spec and all(spec.values()),"WHAT labels missing from canonical spec")
 page.locator('#whatAssessmentPanel .what-object-question-probe[data-dimension="question-function"]').get_by_role("button",name=spec["functionLabel"],exact=True).click()
 page.locator('#whatAssessmentPanel .what-object-question-probe[data-dimension="object-answer"]').get_by_role("button",name=spec["localLabel"],exact=True).click()
 c=assertions(page,'what.use.object-question',language,2)
 check(c["status"]=="WAITING_FOR_EVIDENCE","WHAT 2/3 should remain WAIT")
 # The homologated Learning Trail & Word Path shell starts collapsed. Open
 # it through the native details state before asserting visible text.
 page.locator("#learningTrailWordPathModule").evaluate("(e)=>{e.open=true}")
 trail=page.locator("#learnerTrailSurface")
 check(trail.locator('.learner-trail-contract-progress').count()==1 and "2/3" in trail.inner_text(),
       "WHAT 2/3 not represented in Learning Trail")
 return {"noCreditFromSpeech":True,"speechCalls":after-before,"progress":c}
def where(page,language):
 page.locator('#questionGear [data-question-index="1"]').click()
 page.wait_for_function("""() => {
   const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();
   return s?.session?.decision?.skill==='where.use.location-question' &&
     !document.querySelector('#whereAssessmentPanel')?.hidden &&
     document.querySelectorAll('#whereAssessmentPanel .where-location-probe').length===2;
 }""",timeout=18000)
 check(page.locator("#whereAssessmentPanel .where-probe-audio .siyayo-speaker").count()>=4,
       "WHERE gold speaker SVG missing; note glyph not replaced")
 check("♪" not in page.locator("#whereAssessmentPanel").inner_text(),"WHERE legacy note glyph remains")
 c=assertions(page,'where.use.location-question',language,0)
 before=len(page.evaluate("window.__speech89W"))
 page.locator("#whereAssessmentPanel .where-probe-audio").first.click()
 page.locator("#whereAssessmentPanel .where-probe-audio").last.click()
 after=len(page.evaluate("window.__speech89W"))
 check(after-before==2,"WHERE speech not routed through browser")
 assertions(page,'where.use.location-question',language,0)
 # Speech requests are not completed audio playback. Onstart is NOT fired by this mock.
 check(page.locator("#whereAssessmentPanel .where-probe-support").is_hidden(),
       "Audio support falsely registered before native speech onstart")
 page.locator('#whereAssessmentPanel .where-location-probe[data-dimension="spatial-function"] .where-probe-option[data-alternative-id="location"]').click()
 page.locator('#whereAssessmentPanel .where-location-probe[data-dimension="location-answer"] .where-probe-option[data-alternative-id="grounded-location"]').click()
 c=assertions(page,'where.use.location-question',language,2)
 check(c["status"]=="WAITING_FOR_EVIDENCE","WHERE 2/3 must remain WAIT")
 check("2/3" in page.locator("#learnerTrailSurface").inner_text(),"WHERE Trail 2/3 not displayed")
 return {"noCreditFromSpeech":True,"audioSupportNotInferred":True,"speechCalls":after-before,"progress":c}
def saved_what(page,language):
 store=page.evaluate("""lang=>{
 const saved=window.SIYAYOVerbExplorerThinkingMindAssessmentSelection?.getRetainedProgress?.(
  'what.use.object-question',lang)||[];
 return saved.map(x=>({origin:x.originExperienceId,completed:x.progress?.completed,total:x.progress?.total}));
 }""",language)
 check(any(x["origin"]=="shopping-for-dinner" and x["completed"]==2 for x in store),
       "Saved WHAT origin 2/3 lost while exploring WHERE: "+str(store))
 return store
def trail_matrix(page,activeQword):
 page.locator("#learningTrailWordPathModule").evaluate("(e)=>{e.open=true}")
 html=page.evaluate("""() => {
 const e=document.querySelector('#learnerTrailSurface');
 return {html:e?.innerHTML||'',qword:e?.dataset.currentQword||null,
  assessment:e?.dataset.assessmentSkill||null,
  wordCells:e?.querySelectorAll('.wp-poly-cell').length||0,
  evidenceCards:e?.querySelectorAll('.wp-evidence-card').length||0};
 }""")
 check(html["qword"]==activeQword,"Trail QW does not match visual QW "+str(html))
 check(html["wordCells"]>=12,"Word Path 4x3 matrix not present")
 return {k:html[k] for k in ["qword","assessment","wordCells","evidenceCards"]}
with sync_playwright() as p:
 browser=p.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
 for language in LANGS:
  for form,w,h in FORMATS:
   row={"language":language,"format":form,"status":"FAIL"}
   ctx=browser.new_context(viewport={"width":w,"height":h},reduced_motion="reduce")
   page=ctx.new_page()
   try:
    setup(page,language,"JAGUAR-89W-SYNTH-"+language+"-"+form)
    row["what"]=what(page,language)
    row["matrixWHAT"]=trail_matrix(page,"what")
    wh=page.evaluate("""() => {
      let p=document.querySelector('#whatAssessmentPanel'),q=[...p.querySelectorAll('.what-probe-question-card')];
      let rows=[...p.querySelectorAll('.what-probe-response-row')];
      let width=p.querySelector('.what-object-question-probe').getBoundingClientRect().width;
      return {width,questionWidths:q.map(x=>x.getBoundingClientRect().width),
       rows:rows.map(x=>({width:x.getBoundingClientRect().width,
         audio:!!x.querySelector('.what-probe-speaker'),
         response:!!x.querySelector('.what-probe-option')}))};
    }""")
    check(all(v>=.83*wh["width"] for v in wh["questionWidths"]),"WHAT question clipped")
    check(all(x["width"]>=.83*wh["width"] and x["audio"] and x["response"] for x in wh["rows"]),"WHAT responses not full-width")
    row["whatGeometry"]=wh
    page.screenshot(path=str(OUT/f"WHAT-{language}-{form}.png"),full_page=True,animations="disabled")
    row["where"]=where(page,language)
    row["savedWHAT"]=saved_what(page,language)
    row["matrixWHERE"]=trail_matrix(page,"where")
    # 89X: semantic geometry. No answer may occupy a half-width/narrow column.
    def geometry():
     return page.evaluate("""() => {
       let panel=document.querySelector('#whereAssessmentPanel');
       let q=panel.querySelector('.where-probe-question');
       let rows=[...panel.querySelectorAll('.where-probe-choice')];
       let width=panel.querySelector('.where-location-probe').getBoundingClientRect().width;
       return {width, question:q.getBoundingClientRect().width,
         rows:rows.map(x=>({width:x.getBoundingClientRect().width,
           speakers:x.querySelectorAll('.siyayo-speaker').length,
           audio:!!x.querySelector('.where-probe-audio'),
           response:!!x.querySelector('.where-probe-option')}))};
     }""")
    g=geometry()
    check(g["question"]>=.83*g["width"],"WHERE question not full-width")
    check(all(x["width"]>=.83*g["width"] and x["speakers"]==1 and x["audio"] and x["response"] for x in g["rows"]),
          "WHERE speaker/response split or narrow: "+str(g))
    row["whereGeometry"]=g
    audit=page.evaluate("""() => {
      const root=document.querySelector('#whereAssessmentPanel');
      const qs=[...root.querySelectorAll('button.where-probe-question')];
      const rect=e=>e.getBoundingClientRect();
      const questions=qs.map(q=>{
        const icon=q.querySelector(':scope > .siyayo-speaker');
        const text=q.querySelector(':scope > .where-probe-question-text');
        const gold=text?.querySelector('.study-target-word');
        return {qTag:q.tagName,hasDivider:!!q.querySelector('.where-probe-audio'),
          speaker:!!icon,text:text?.innerText||null,qword:gold?.innerText||null,
          targetNoWrap:gold&&getComputedStyle(gold).whiteSpace==='nowrap',
          targetWithinText:gold&&rect(gold).left>=rect(text).left-2&&rect(gold).right<=rect(text).right+2,
          goldColor:gold&&getComputedStyle(gold).color,
          aria:q.getAttribute('aria-label'),width:rect(q).width};
      });
      const lines=[...document.querySelectorAll('#livingLines .living-line')].map(b=>({
        visibleRole:!!b.querySelector(':scope > span'),
        hasSpeaker:!!b.querySelector('.siyayo-speaker'),
        label:b.getAttribute('aria-label')||'',
        dialogue:b.querySelector(':scope > p')?.innerText||''
      }));
      const trail=document.querySelector('#learnerTrailSurface');
      const family=trail?.querySelector('.learner-trail-family');
      const grammar=trail?.querySelector('.learner-trail-grammar-role');
      const why=[...trail?.querySelectorAll('.wp-poly-word')||[]].find(x=>x.querySelector('strong')?.textContent==='WHY');
      const es=why?.querySelector('span[lang="es"]'),pt=why?.querySelector('span[lang="pt"]');
      const scroller=trail?.querySelector('.wp-poly-scroller');
      return {questions,lines,
        trail:{family:family?.textContent,grammar:grammar?.textContent,
          separated:!!family&&!!grammar&&rect(grammar).top>rect(family).top+2},
        wordPath:{es:es?.textContent,pt:pt?.textContent,
          separated:!!es&&!!pt&&rect(pt).top>rect(es).top+2,
          atomic:!!es&&!!pt&&getComputedStyle(es).whiteSpace==='nowrap'&&getComputedStyle(pt).whiteSpace==='nowrap',
          internalScroll:!!scroller&&scroller.scrollWidth>scroller.clientWidth},
        globalWidth:document.documentElement.scrollWidth,viewport:innerWidth};
    }""")
    check(len(audit["questions"])==2 and all(x["qTag"]=="BUTTON" and not x["hasDivider"] and
      x["speaker"] and x["qword"] and x["targetNoWrap"] and x["targetWithinText"] and x["aria"]
      for x in audit["questions"]),"Unintegrated WHERE QUESTION or split QW: "+str(audit["questions"]))
    check(len(audit["lines"])==2 and all(not x["visibleRole"] and x["hasSpeaker"] and x["label"] and x["dialogue"]
      for x in audit["lines"]),"LINES role label was not hidden or speech/ARIA lost: "+str(audit["lines"]))
    check(audit["trail"]["separated"],"Trail family/grammar must render in two lines")
    wp=audit["wordPath"]
    check(wp["es"]=="POR QUÉ" and wp["pt"]=="POR QUÊ" and wp["separated"] and wp["atomic"],
      "Word Path accent preservation and separate ES/PT lines: "+str(wp))
    if form=="portrait":check(wp["internalScroll"],"Word Path portrait requires internal table scroll")
    check(audit["globalWidth"]<=audit["viewport"]+4,"Global overflow")
    row["howToShowGate"]=audit
    page.screenshot(path=str(OUT/f"WHERE-{language}-{form}.png"),full_page=True,animations="disabled")
    page.locator('#questionGear [data-question-index="0"]').click()
    page.wait_for_function("""() =>
      window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill==='what.use.object-question'
      && !document.querySelector('#whatAssessmentPanel')?.hidden
    """,timeout=18000)
    row["restoredWHAT"]=assertions(page,'what.use.object-question',language,2)
    # Restored WHAT must reproject the SAME two accepted witnesses in Trail.
    restored=page.evaluate("""() => {
      const el=document.querySelector('#learnerTrailSurface');
      const c=window.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot().context;
      const pr=window.AdaptivePassContractProgressView.project(c.passContract,c.evidencePackets,window.GreenPassProfile);
      return {qword:el.dataset.currentQword,skill:el.dataset.assessmentSkill,
        assessment:el.dataset.assessmentLanguage,display:el.dataset.displayLanguage,
        completed:pr.completed,total:pr.total,
        trail:el.querySelector('.learner-trail-contract-progress')?.textContent||'',
        cells:el.querySelectorAll('.wp-poly-cell').length,
        overflow:document.documentElement.scrollWidth>innerWidth+4};
    }""")
    check(restored["qword"]=="what" and restored["skill"]=="what.use.object-question" and
      restored["assessment"]==language and restored["display"]==language and
      restored["completed"]==2 and restored["total"]==3 and
      "2/3" in restored["trail"] and restored["cells"]>=12 and not restored["overflow"],
      "Read-only Trail/WP diverged after returning to WHAT: "+str(restored))
    row["restoredTrail"]=restored
    check(page.evaluate("document.documentElement.scrollWidth<=innerWidth+4"),
      "Global overflow at "+language+"/"+form)
    page.screenshot(path=str(OUT/f"RESTORED-WHAT-{language}-{form}.png"),full_page=True,animations="disabled")
    row["status"]="PASS"
   except Exception as err:
    row["error"]=str(err)[:1200]
    row["trace"]=traceback.format_exc()[-2200:]
    try:page.screenshot(path=str(OUT/f"FAIL-{language}-{form}.png"),full_page=True,animations="disabled",timeout=12000)
    except Exception:pass
   finally:
    CASES.append(row);print("JAGUAR 90C",language,form,row["status"],row.get("error",""),flush=True)
    ctx.close()
 browser.close()
(OUT/"report.json").write_text(json.dumps(CASES,ensure_ascii=False,indent=2),encoding="utf8")
n=sum(r["status"]=="PASS" for r in CASES)
print(f"JAGUAR 90C WHAT WHERE PORTRAIT {n}/{len(CASES)}",flush=True)
if n!=len(CASES):raise SystemExit(1)
