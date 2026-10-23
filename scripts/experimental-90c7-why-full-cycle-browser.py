#!/usr/bin/env python3
"""JAGUAR 90C.7: strict browser WHAT/HOW-TO-SHOW WHY EN ES PT S1-S4, isolated static server.
Real Chromium DOM and synthetic speech routing ONLY; human acoustic acceptance is separate.
No network writes, learner fixtures only in ephemeral browser context.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, traceback

ROOT = "http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner"
OUT = Path("visual-audit-90c7-why")
OUT.mkdir(exist_ok=True)
LANGS = ("en", "es", "pt")
VIEWPORTS = (("portrait",390,844),("landscape",844,390),("desktop",1366,900))
EXPERIENCES = (
  ("shopping-for-dinner",4,"exploratory"),
  ("preparing-dinner",5,"exploratory"),
  ("having-dinner",3,"assessment-origin"),
  ("after-dinner-conversation",2,"assessment-transfer"),
)
EXPECTED = {
 "shopping-for-dinner":{
   "en":("Why do you prefer the fresh cheese?","Because the fresh, mild cheese pairs well with the salmon."),
   "es":("¿Por qué prefieres el queso fresco?","Porque el queso fresco y suave combina bien con el salmón."),
   "pt":("Por que você prefere o queijo fresco?","Porque o queijo fresco e suave combina bem com o salmão.")},
 "preparing-dinner":{
   "en":("Why are we preparing this dinner together?","Because preparing it together lets us share the experience."),
   "es":("¿Por qué estamos preparando esta cena juntos?","Porque prepararla juntos nos permite compartir la experiencia."),
   "pt":("Por que estamos preparando este jantar juntos?","Porque prepará-lo juntos nos permite compartilhar essa experiência.")},
 "having-dinner":{
   "en":("Why is this dinner special?","Because we prepared it together."),
   "es":("¿Por qué esta cena es especial?","Porque la preparamos juntos."),
   "pt":("Por que este jantar é especial?","Porque preparamos o jantar juntos.")},
 "after-dinner-conversation":{
   "en":("Why do you enjoy this conversation?","Because we enjoy talking together."),
   "es":("¿Por qué disfrutas esta conversación?","Porque disfrutamos conversar juntos."),
   "pt":("Por que você gosta desta conversa?","Porque gostamos de conversar juntos.")},
}
def progress(page):
  return page.evaluate("""() => {
    const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();
    const c=s?.context,p=c&&window.AdaptivePassContractProgressView?.project?.(c.passContract,c.evidencePackets,window.GreenPassProfile);
    return {skill:s?.session?.decision?.skill||null,completed:p?.completed??null,total:p?.total??null,
      status:p?.status||null};
  }""")
def start(page):
  page.goto(ROOT,wait_until="domcontentloaded",timeout=28000)
  page.wait_for_function("""() => typeof document.querySelector('#nextExperience')?.onclick === 'function' &&
    !!window.SIYAYOVerbExplorerContextualCoherence && !!window.SIYAYOVerbExplorerVisibleAssessmentBoundary &&
    !!window.SIYAYOVerbExplorerAdaptiveCoordinator""",timeout=25000)
  page.evaluate("""() => {
    window.__why90c7speech=[];
    SpeechSynthesis.prototype.speak=function(u){window.__why90c7speech.push({text:u.text,lang:u.lang});};
    SpeechSynthesis.prototype.cancel=function(){};
  }""")
def assert_scene(page,scene,index,status,language,layout):
  page.wait_for_function("(id)=>window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()===id",arg=scene,timeout=15000)
  page.locator('#questionGear [data-question-index="'+str(index)+'"]').click()
  lines=page.locator('#livingLines button.living-line')
  expected_count=2 if status=="exploratory" else 3
  assert lines.count()==expected_count,(scene,language,layout,"line-count",lines.count())
  q,a=EXPECTED[scene][language]
  assert q in lines.nth(0).inner_text() and a in lines.nth(1).inner_text(),(scene,language,layout,[x.inner_text() for x in lines.all()])
  assert "breakfast" not in lines.nth(1).inner_text().lower()
  assert page.locator("#livingLineAuthorityNote").count()==1
  assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 4"),(scene,language,layout,"global-overflow")
  page.screenshot(path=str(OUT/("%s-%s-%s.png"%(scene,language,layout))),full_page=True,animations="disabled")
  return {"question":q,"answer":a,"lineCount":expected_count}
def no_audio_credit(page,language):
  before=progress(page)
  speech_before=page.evaluate("window.__why90c7speech.length")
  page.locator('#livingLines button.living-line').nth(1).click()
  speech=page.evaluate("window.__why90c7speech.slice(-1)[0]")
  after=progress(page)
  assert before==after,("corpus-speech-minted-credit",before,after)
  assert page.evaluate("window.__why90c7speech.length")==speech_before+1
  assert speech["lang"].lower().startswith(language) and speech["text"]
def click_correct(page,probe,dimension,expected_id):
  return page.evaluate("""({probe,dimension,expectedId})=>{
    const root=document.querySelector('#whyAssessmentPanel'),
      group=root.querySelectorAll('.why-contextual-reason-probe')[probe],
      buttons=[...group.querySelectorAll('.why-probe-option')],
      spec=window.AdaptiveWhyContextualReasonProbeSpecificationSource.resolve(
        window.SIYAYOVerbExplorerCanonicalSkillSource.getDefinition(),
        window.SIYAYOVerbExplorerExperienceNavigation.getExperience('having-dinner'),
        window.SIYAYOVerbExplorerExperienceNavigation.getExperience('after-dinner-conversation'),
        window.SIYAYOVerbExplorerExperienceRuntime.activeLanguage());
    const choose=dimension==='function' ? spec.functionProbe : dimension==='local'?spec.localProbe:spec.transferProbe;
    const index=choose.alternatives.findIndex(a=>a.id===expectedId);
    if(index<0||!buttons[index])return {ok:false,index};
    buttons[index].click();
    return {ok:true,index,pressed:buttons[index].getAttribute('aria-pressed'),
      green:getComputedStyle(buttons[index]).backgroundColor};
  }""",{"probe":probe,"dimension":dimension,"expectedId":expected_id})
results=[]
with sync_playwright() as playwright:
  browser=playwright.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
  for language in LANGS:
    for layout,width,height in VIEWPORTS:
      result={"language":language,"layout":layout,"viewport":f"{width}x{height}","status":"FAIL","scenes":[]}
      context=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
      page=context.new_page()
      try:
        start(page)
        page.locator('[data-experience-language="'+language+'"]').click()
        for scene,index,kind in EXPERIENCES[:2]:
          info=assert_scene(page,scene,index,kind,language,layout)
          assert progress(page)["skill"] is None,"No assessment should start from exploratory WHY"
          assert not page.locator('#whyAssessmentPanel').is_visible(),"S1/S2 cannot claim WHY assessment"
          assert page.locator('#livingLineAuthorityNote').get_attribute('data-authority-state')=="no-assessment"
          no_audio_credit(page,language)
          page.locator('[data-experience-tense="past"]').click()
          assert page.locator('#livingLines .living-line-status').count()==1,("unapproved tense",scene)
          assert page.locator('#livingLines .siyayo-speaker').count()==0,"Unauthored PAST cannot speak"
          page.locator('[data-experience-tense="present"]').click()
          # REVISIT to confirm recovery of contextual reference after blocked tense.
          assert EXPECTED[scene][language][1] in page.locator('#livingLines .living-line').nth(1).inner_text()
          result["scenes"].append({"id":scene,"authority":"free","context":info,"past":"blocked"})
          page.locator("#nextExperience").click()
        scene,index,kind=EXPERIENCES[2]
        page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='having-dinner'")
        page.locator('[data-experience-language="'+language+'"]').click()
        page.locator("#learnerIdentityInput").fill("JAGUAR-90C7-"+language+"-"+layout)
        page.locator("#learnerIdentityConfirm").click()
        page.locator('#questionGear [data-question-index="'+str(index)+'"]').click()
        page.wait_for_function("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill==='why.use.contextual-reason'",timeout=16000)
        page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden",timeout=11000)
        info=assert_scene(page,scene,index,kind,language,layout)
        before=progress(page)
        assert before["completed"]==0 and before["total"]==3,before
        no_audio_credit(page,language)
        # Correct assessment response only creates evidence through separate canonical option button.
        function_result=click_correct(page,0,"function","why")
        local_result=click_correct(page,1,"local","prepared-together")
        now=progress(page)
        assert function_result["ok"] and local_result["ok"] and now["completed"]==2 and now["total"]==3,(function_result,local_result,now)
        assert function_result["pressed"]=="true" and local_result["pressed"]=="true"
        assert function_result["green"]=="rgb(86, 200, 119)" and local_result["green"]=="rgb(86, 200, 119)",("accepted-green",function_result,local_result)
        page.locator('#learningTrailWordPathModule').evaluate("(e)=>e.open=true")
        trail=page.locator("#learnerTrailSurface")
        assert "2/3" in trail.inner_text(),"S3 trail not 2/3"
        assert trail.locator('.wp-poly-table').count()>=1
        result["scenes"].append({"id":scene,"authority":"assessed","context":info,"progress":now,"green":True})
        page.screenshot(path=str(OUT/("S3-EVIDENCE-"+language+"-"+layout+".png")),full_page=True,animations="disabled")
        page.locator("#nextExperience").click()
        scene,index,kind=EXPERIENCES[3]
        info=assert_scene(page,scene,index,kind,language,layout)
        page.wait_for_function("() => !document.querySelector('#whyAssessmentPanel')?.hidden",timeout=11000)
        assert progress(page)["completed"]==2,"S4 navigation cannot mint transfer"
        no_audio_credit(page,language)
        transfer_result=click_correct(page,0,"transfer","talking-together")
        closed=progress(page)
        assert transfer_result["ok"] and closed["completed"]==3 and closed["total"]==3,(transfer_result,closed)
        assert transfer_result["pressed"]=="true" and transfer_result["green"]=="rgb(86, 200, 119)"
        assert "GREEN PASS" in page.locator("#whyAssessmentPanel").inner_text()
        assert "3/3" in page.locator('#learnerTrailSurface').inner_text()
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 4")
        result["scenes"].append({"id":scene,"authority":"transfer","context":info,"progress":closed,"green":True})
        page.screenshot(path=str(OUT/("S4-GREEN-"+language+"-"+layout+".png")),full_page=True,animations="disabled")
        result["status"]="PASS"
      except Exception as exc:
        result["error"]=str(exc)[:1100]
        result["trace"]=traceback.format_exc()[-2200:]
        try: page.screenshot(path=str(OUT/("ERROR-"+language+"-"+layout+".png")),full_page=True,animations="disabled",timeout=12000)
        except Exception: pass
      finally:
        print("JAGUAR 90C7",language,layout,result["status"],result.get("error",""),flush=True)
        results.append(result)
        context.close()
  browser.close()
(OUT/"report.json").write_text(json.dumps(results,indent=2,ensure_ascii=False),encoding="utf8")
passed=sum(r["status"]=="PASS" for r in results)
print("JAGUAR 90C.7 WHY BROWSER",passed,"/",len(results),flush=True)
if passed!=len(results): raise SystemExit(1)
