#!/usr/bin/env python3
"""90C.7H.3: Cross-language S1 WHAT -> S3 WHY independent origin, then S4 transfer.
This is the missing user sequence: WHAT EN active -> switch to PT -> start WHY in S3.
No false assessment on language-only switch, S4 direct visit, QW audio or navigation.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import traceback,json
out=Path("visual-audit-90c7h3");out.mkdir(exist_ok=True)
cases=[]
SOURCE_TARGETS=(("en","pt"),("en","es"),("pt","en"),("es","pt"),("pt","es"),("es","en"))
def progress(page):
 return page.evaluate("""() => {
 const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();
 const d=s?.session?.decision||null,c=s?.context;
 const p=c&&window.AdaptivePassContractProgressView?.project?.(c.passContract,c.evidencePackets,window.GreenPassProfile);
 return {skill:d?.skill||null,language:d?.assessmentScope?.language||null,origin:d?.assessmentScope?.originExperienceId||null,
   completed:p?.completed??null,total:p?.total??null};
 }""")
def answer(page,probe,chosen):
 return page.evaluate("""({probe,chosen})=>{
 const skill=window.SIYAYOVerbExplorerCanonicalSkillSource.getDefinition(),
 source=window.AdaptiveWhyContextualReasonProbeSpecificationSource,
 nav=window.SIYAYOVerbExplorerExperienceNavigation;
 const language=window.SIYAYOVerbExplorerExperienceRuntime.activeLanguage();
 const s=source.resolve(skill,nav.getExperience('having-dinner'),nav.getExperience('after-dinner-conversation'),language);
 const choice=probe==='function'?s.functionProbe:probe==='local'?s.localProbe:s.transferProbe;
 const index=choice.alternatives.findIndex(v=>v.id===chosen);
 const root=document.querySelector('#whyAssessmentPanel'),
   group=[...root.querySelectorAll('.why-contextual-reason-probe')][probe==='local'?1:0],
   button=group?.querySelectorAll('.why-probe-option')[index];
 if(!button||index<0)return false;
 button.click();return button.getAttribute('aria-pressed')==='true';
 }""",{"probe":probe,"chosen":chosen})
with sync_playwright() as p:
 browser=p.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
 for source,target in SOURCE_TARGETS:
  name=source+"-what-to-"+target+"-why"
  entry={"case":name,"status":"FAIL"}
  ctx=browser.new_context(viewport={"width":390,"height":844},reduced_motion="reduce")
  page=ctx.new_page()
  try:
   page.goto("http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner",wait_until="domcontentloaded",timeout=25000)
   page.wait_for_function("() => !!window.SIYAYOVerbExplorerAdaptiveCoordinator && typeof document.querySelector('#nextExperience')?.onclick==='function'",timeout=22000)
   page.locator(f'[data-experience-language="{source}"]').click()
   page.locator('#questionGear [data-question-index="0"]').click()
   page.locator("#learnerIdentityInput").fill("90C7H3-"+name)
   page.locator("#learnerIdentityConfirm").click()
   page.wait_for_function("l => {const d=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision;return d?.skill==='what.use.object-question'&&d.assessmentScope?.language===l}",arg=source,timeout=18000)
   original=progress(page)
   assert original["origin"]=="shopping-for-dinner" and original["completed"]==0,original
   page.locator("#nextExperience").click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='preparing-dinner'")
   page.locator("#nextExperience").click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='having-dinner'")
   # User reaches S3 with a legitimate WHAT Session owned in a DIFFERENT language.
   page.locator(f'[data-experience-language="{target}"]').click()
   assert progress(page)==original,("Language-only switch minted a session",progress(page),original)
   page.locator('#questionGear [data-question-index="3"]').click()
   page.wait_for_function("l => {const d=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision;return d?.skill==='why.use.contextual-reason'&&d.assessmentScope?.language===l}",arg=target,timeout=15000)
   page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden",timeout=9000)
   now=progress(page)
   assert now=={"skill":"why.use.contextual-reason","language":target,"origin":"having-dinner","completed":0,"total":3},now
   assert page.locator("#livingLineAuthorityNote").get_attribute("data-authority-state")=="assessment-panel"
   retained=page.evaluate("l=>window.SIYAYOVerbExplorerThinkingMindAssessmentSelection.getRetainedProgress('what.use.object-question',l).map(x=>x.progress.completed)",source)
   assert original["completed"] in retained,("Prior WHAT lost",source,target,retained)
   # The audio-only LINES cards do not generate Attempt or Evidence.
   page.locator('#livingLines .living-line').nth(1).click()
   assert progress(page)==now,("Audio minted WHY credit",progress(page))
   assert answer(page,"function","why")
   assert answer(page,"local","prepared-together")
   assert progress(page)["completed"]==2,("S3 WHY 2/3 missing",progress(page))
   page.screenshot(path=str(out/(name+"-S3-2of3.png")),full_page=True,animations="disabled")
   page.locator("#nextExperience").click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='after-dinner-conversation'")
   assert progress(page)["completed"]==2,("Navigation minted S4 credit",progress(page))
   assert answer(page,"transfer","talking-together")
   final=progress(page)
   assert final["completed"]==3 and final["language"]==target and final["origin"]=="having-dinner",final
   page.locator("#learningTrailWordPathModule").evaluate("(e)=>{e.open=true}")
   assert "3/3" in page.locator("#learnerTrailSurface .learner-trail-contract-progress").inner_text()
   assert page.locator("#learnerTrailSurface .wp-polyglot").get_attribute("data-focused-language")==target
   entry.update(status="PASS",original=original,newOrigin=now,originalRetained=retained,final=final)
   page.screenshot(path=str(out/(name+"-S4-GREEN.png")),full_page=True,animations="disabled")
  except Exception as error:
   entry["error"]=str(error)[:950];entry["trace"]=traceback.format_exc()[-2000:]
   try:page.screenshot(path=str(out/("ERROR-"+name+".png")),full_page=True,animations="disabled")
   except Exception:pass
  finally:
   print("90C7H3",name,entry["status"],entry.get("error",""),flush=True)
   cases.append(entry);ctx.close()
 browser.close()
(out/"report.json").write_text(json.dumps(cases,indent=2,ensure_ascii=False),encoding="utf8")
print("90C7H3 PASS",sum(c["status"]=="PASS" for c in cases),"/",len(cases),flush=True)
if any(c["status"]!="PASS" for c in cases):raise SystemExit(1)
