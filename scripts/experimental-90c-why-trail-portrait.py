#!/usr/bin/env python3
"""89U isolated real-browser WHY HOW TO SHOW. No runtime fixtures or server writes."""
import json,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path("visual-audit-90c-why");OUT.mkdir(exist_ok=True)
URL="http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner"
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
 for lang in ["en","es","pt"]:
  for format,width,height in [("portrait",390,844)]:
   row={"language":lang,"format":format,"status":"FAIL"}
   ctx=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
   page=ctx.new_page()
   try:
    page.goto(URL,wait_until="domcontentloaded",timeout=25000)
    page.wait_for_function("() => typeof document.querySelector('#nextExperience')?.onclick === 'function' && !!window.SIYAYOVerbExplorerAdaptiveCoordinator && !!window.SIYAYOVerbExplorerLearnerIdentitySource",timeout=25000)
    page.locator("#nextExperience").click()
    page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='preparing-dinner'",timeout=11000)
    page.locator("#nextExperience").click()
    page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='having-dinner'",timeout=11000)
    page.locator('[data-experience-language="'+lang+'"]').click()
    page.locator("#learnerIdentityInput").fill("JAGUAR-89U-SYNTH-"+lang)
    page.locator("#learnerIdentityConfirm").click()
    page.locator('#questionGear [data-question-index="3"]').click()
    page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden && document.querySelectorAll('#whyAssessmentPanel .why-contextual-reason-probe').length === 2",timeout=14000)
    # Mock the PRESENTATION speech outlet ONLY, not the assessment API.
    page.evaluate("""() => {
       window.__audio89U=[];
       SpeechSynthesis.prototype.speak=function(u){
         window.__audio89U.push({text:u.text,lang:u.lang});
       };
       SpeechSynthesis.prototype.cancel=function(){};
    }""")
    before=page.evaluate("""() => {
       let c=window.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot()?.context;
       return window.AdaptivePassContractProgressView.project(c.passContract,c.evidencePackets,window.GreenPassProfile).completed;
    }""")
    page.locator('#whyAssessmentPanel .why-probe-question-card').first.click()
    page.locator('#whyAssessmentPanel .why-probe-audio').first.click()
    after=page.evaluate("""() => {
       let c=window.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot()?.context;
       return window.AdaptivePassContractProgressView.project(c.passContract,c.evidencePackets,window.GreenPassProfile).completed;
    }""")
    assert before==after==0,"Audio minted canonical evidence"
    audio=page.evaluate("window.__audio89U")
    assert len(audio)==2 and all(x["lang"].startswith(lang) and x["text"] for x in audio),"Audio was not routed through speech adapter"
    panel=page.locator('#whyAssessmentPanel')
    assert panel.locator('.why-probe-question-card .siyayo-speaker').count()==2,"Question SVG speakers missing"
    assert panel.locator('.why-probe-audio .siyayo-speaker').count()==4,"Response SVG speakers missing"
    label=page.evaluate("""() => {
       let s=window.AdaptiveWhyContextualReasonProbeSpecificationSource.resolve(
         window.SIYAYOVerbExplorerCanonicalSkillSource.getDefinition(),
         window.SIYAYOVerbExplorerExperienceNavigation.getExperience('having-dinner'),
         window.SIYAYOVerbExplorerExperienceNavigation.getExperience('after-dinner-conversation'),
         window.SIYAYOVerbExplorerExperienceRuntime.activeLanguage());
       return {q:s.functionProbe.alternatives.find(x=>x.id==='why').label,
               local:s.localProbe.alternatives.find(x=>x.id==='prepared-together').label,
               transfer:s.transferProbe.alternatives.find(x=>x.id==='talking-together').label};
    }""")
    panel.locator('.why-contextual-reason-probe').nth(0).get_by_role("button",name=label["q"],exact=True).click()
    panel.locator('.why-contextual-reason-probe').nth(1).get_by_role("button",name=label["local"],exact=True).click()
    assert "2/3" in panel.locator('.why-contract-progress').inner_text(),"Canonical 2/3 not shown"
    assert panel.locator('.why-probe-option[aria-pressed="true"]').count()==2,"Accepted answer highlights missing"
    page.locator('#learningTrailWordPathModule').evaluate("(e)=>e.open=true")
    # A visible Trail is evidence projection, never an evaluator.
    trail=page.evaluate("""() => {
      const t=document.querySelector('#learnerTrailSurface'),
        c=window.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot().context,
        p=window.AdaptivePassContractProgressView.project(c.passContract,c.evidencePackets,window.GreenPassProfile);
      const why=[...t.querySelectorAll('.wp-poly-word')].find(x=>x.querySelector('strong')?.textContent==='WHY');
      const scroll=t.querySelector('.wp-poly-scroller');
      return {completed:p.completed,total:p.total,language:t.dataset.assessmentLanguage,
        skill:t.dataset.assessmentSkill,
        trail:t.querySelector('.learner-trail-contract-progress')?.textContent||'',
        cells:t.querySelectorAll('.wp-poly-cell').length,
        es:why?.querySelector('span[lang="es"]')?.textContent||'',
        pt:why?.querySelector('span[lang="pt"]')?.textContent||'',
        innerScroll:!!scroll&&scroll.scrollWidth>scroll.clientWidth,
        overflow:document.documentElement.scrollWidth>innerWidth+4};
    }""")
    assert trail["completed"]==2 and trail["total"]==3 and "2/3" in trail["trail"] and trail["language"]==lang and trail["skill"]=="why.use.contextual-reason" and trail["cells"]>=12 and trail["es"]=="POR QUÉ" and trail["pt"]=="POR QUÊ" and trail["innerScroll"] and not trail["overflow"],"S3 Trail / Word Path disagrees: "+str(trail)
    row["S3Trail"]=trail
    page.screenshot(path=str(OUT/f"89u-S3-{lang}-{format}.png"),full_page=True,animations="disabled")
    page.locator("#nextExperience").click()
    page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='after-dinner-conversation'",timeout=11000)
    page.locator('#questionGear [data-question-index="2"]').click()
    page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden",timeout=11000)
    panel=page.locator('#whyAssessmentPanel')
    assert "2/3" in panel.locator('.why-contract-progress').inner_text(),"S4 falsely granted transfer"
    # A visible Trail is evidence projection, never an evaluator.
    trail=page.evaluate("""() => {
      const t=document.querySelector('#learnerTrailSurface'),
        c=window.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot().context,
        p=window.AdaptivePassContractProgressView.project(c.passContract,c.evidencePackets,window.GreenPassProfile);
      const why=[...t.querySelectorAll('.wp-poly-word')].find(x=>x.querySelector('strong')?.textContent==='WHY');
      const scroll=t.querySelector('.wp-poly-scroller');
      return {completed:p.completed,total:p.total,language:t.dataset.assessmentLanguage,
        skill:t.dataset.assessmentSkill,
        trail:t.querySelector('.learner-trail-contract-progress')?.textContent||'',
        cells:t.querySelectorAll('.wp-poly-cell').length,
        es:why?.querySelector('span[lang="es"]')?.textContent||'',
        pt:why?.querySelector('span[lang="pt"]')?.textContent||'',
        innerScroll:!!scroll&&scroll.scrollWidth>scroll.clientWidth,
        overflow:document.documentElement.scrollWidth>innerWidth+4};
    }""")
    assert trail["completed"]==2 and "2/3" in trail["trail"],"S4 visit changed Trail without transfer: "+str(trail)
    row["S4BeforeTransfer"]=trail
    # Clicking audio in S4 can never close the contract.
    panel.locator('.why-probe-audio').first.click()
    assert "2/3" in panel.locator('.why-contract-progress').inner_text(),"S4 speech gave transfer"
    panel.get_by_role("button",name=label["transfer"],exact=True).click()
    assert "3/3" in panel.locator('.why-contract-progress').inner_text(),"Canonical 3/3 missing"
    assert "GREEN PASS" in panel.inner_text(),"Canonical closure feedback missing"
    # A visible Trail is evidence projection, never an evaluator.
    trail=page.evaluate("""() => {
      const t=document.querySelector('#learnerTrailSurface'),
        c=window.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot().context,
        p=window.AdaptivePassContractProgressView.project(c.passContract,c.evidencePackets,window.GreenPassProfile);
      const why=[...t.querySelectorAll('.wp-poly-word')].find(x=>x.querySelector('strong')?.textContent==='WHY');
      const scroll=t.querySelector('.wp-poly-scroller');
      return {completed:p.completed,total:p.total,language:t.dataset.assessmentLanguage,
        skill:t.dataset.assessmentSkill,
        trail:t.querySelector('.learner-trail-contract-progress')?.textContent||'',
        cells:t.querySelectorAll('.wp-poly-cell').length,
        es:why?.querySelector('span[lang="es"]')?.textContent||'',
        pt:why?.querySelector('span[lang="pt"]')?.textContent||'',
        innerScroll:!!scroll&&scroll.scrollWidth>scroll.clientWidth,
        overflow:document.documentElement.scrollWidth>innerWidth+4};
    }""")
    assert trail["completed"]==3 and trail["total"]==3 and "3/3" in trail["trail"] and trail["language"]==lang and trail["skill"]=="why.use.contextual-reason" and trail["cells"]>=12 and trail["es"]=="POR QUÉ" and trail["pt"]=="POR QUÊ" and not trail["overflow"],"S4 GreenPass did not mirror in Trail/Word Path: "+str(trail)
    row["S4AfterTransfer"]=trail
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+4"),"Horizontal page overflow"
    page.screenshot(path=str(OUT/f"89u-S4-{lang}-{format}.png"),full_page=True,animations="disabled")
    row.update(status="PASS",audioCalls=len(page.evaluate("window.__audio89U")),beforeAudio=before,afterAudio=after,canonicalS3=2,canonicalS4=3)
   except Exception as ex:
    row["error"]=str(ex)[:900]
    row["trace"]=traceback.format_exc()[-1700:]
    try:page.screenshot(path=str(OUT/f"ERROR-{lang}-{format}.png"),full_page=True,timeout=12000)
    except Exception:pass
   finally:
    print("JAGUAR 90C WHY",lang,format,row["status"],row.get("error",""),flush=True)
    results.append(row);ctx.close()
 browser.close()
(OUT/"report.json").write_text(json.dumps(results,indent=2,ensure_ascii=False),encoding="utf8")
passed=sum(r["status"]=="PASS" for r in results)
print("JAGUAR 90C WHY PORTRAIT",passed,"/",len(results),flush=True)
if passed!=len(results):raise SystemExit(1)
