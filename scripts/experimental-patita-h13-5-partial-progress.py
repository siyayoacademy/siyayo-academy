from playwright.sync_api import sync_playwright
from pathlib import Path
import json,traceback
out=Path("visual-audit-patita-h13-5");out.mkdir(exist_ok=True)
runs=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
 for lang in ["en","es","pt"]:
  c=b.new_context(viewport={"width":390,"height":844},reduced_motion="reduce");page=c.new_page()
  nick="H13.5-"+lang;stage="start";row={"language":lang,"status":"FAIL","stages":[]}
  def sample(label):
   state=page.evaluate("""({skill,lang}) => {
    const co=window.SIYAYOVerbExplorerAdaptiveCoordinator, sel=window.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
    const snap=co?.snapshot?.(),scope=snap?.session?.decision?.assessmentScope;
    const active=scope?.skill===skill&&scope?.language===lang;
    const project=window.AdaptivePassContractProgressView;
    const pp=active&&snap?.context?project?.project(snap.context.passContract,snap.context.evidencePackets,window.GreenPassProfile):null;
    const retained=sel?.getRetainedProgress?.(skill,lang)||[];
    const profile=window.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource?.getProfile?.();
    return {nick:window.SIYAYOVerbExplorerLearnerIdentitySource?.getId?.(), experience:window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId?.(),qw:window.SIYAYOVerbExplorerExperienceRuntime?.activeQuestionWord?.(),displayLanguage:window.SIYAYOVerbExplorerExperienceRuntime?.activeLanguage?.(),
    activeScope:scope?{skill:scope.skill,language:scope.language,origin:scope.originExperienceId,owner:scope.learnerId}:null,
    activeProgress:pp?{completed:pp.completed,total:pp.total,status:pp.status}:null,
    retained:retained.map(r=>({owner:JSON.parse(r.scopeKey)[0],origin:r.originExperienceId,completed:r.progress.completed,total:r.progress.total,status:r.progress.status})),
    evidenceCount:snap?.context?.evidencePackets?.length||0,profileOwner:profile?.id||null,
    trailQW:document.querySelector('#learnerTrailSurface')?.dataset.currentQword||null,trailLanguage:document.querySelector('#learnerTrailSurface')?.dataset.displayLanguage||null,
    wordPathLanguage:document.querySelector('.wp-polyglot')?.dataset.focusedLanguage||null,
    patitaOwners:[...new Set(window.SIYAYOPatitaInteractionTrail?.getVisibleRecords?.().map(r=>r.learnerId).filter(Boolean)||[])]
    };
   }""",{"skill":"which.use.determiner","lang":lang})
   row["stages"].append({"label":label,**state})
   assert state["nick"]==nick,(label,state)
   assert all(x==nick for x in state["patitaOwners"]),(label,state)
   assert not state["activeScope"] or state["activeScope"]["owner"]==nick,(label,state)
   print("H13.5",lang,label, json.dumps({k:v for k,v in state.items() if k in ("experience","qw","displayLanguage","activeProgress","retained","activeScope")}),flush=True)
   return state
  def choose_qw(word):
   page.evaluate("""(word) => {const runtime=window.SIYAYOVerbExplorerExperienceRuntime;const exp=window.SIYAYOVerbExplorerExperienceNavigation.getExperience(runtime.activeExperienceId());const index=exp.thinkingMind.findIndex(q=>q.questionWord===word);if(index<0)throw Error('QW absent: '+word);document.querySelector('#questionGear [data-question-index="'+index+'"]').click()}""",word)
   page.wait_for_function("(x)=>window.SIYAYOVerbExplorerExperienceRuntime.activeQuestionWord()===x",arg=word)
  try:
   page.goto("http://127.0.0.1:8879/verb-explorer.html?mode=experience&experience=shopping-for-dinner",wait_until="domcontentloaded")
   page.wait_for_function("() => document.querySelector('#learnerIdentityPanel')?.__siyayoLearnerIdentityInstalled===true && !!window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId()",timeout=15000)
   stage="choose-WHICH";page.locator('[data-experience-language="'+lang+'"]').click();choose_qw("which")
   stage="nick";page.locator("#learnerIdentityInput").fill(nick);page.locator("#learnerIdentityConfirm").click()
   page.wait_for_function("(x)=>window.SIYAYOVerbExplorerLearnerIdentitySource.getId()===x",arg=nick)
   page.wait_for_function("() => window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.()?.session?.decision?.skill==='which.use.determiner'",timeout=16000)
   page.locator('#learningTrailWordPathModule').evaluate("(e)=>e.open=true")
   sample("WHICH-start")
   stage="choice-1";page.locator('#choiceOptions [data-choice-select="fresh-mild-cheese"]').click()
   page.wait_for_function("() => {let s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();return !!s?.context && window.AdaptivePassContractProgressView.project(s.context.passContract,s.context.evidencePackets,window.GreenPassProfile)?.completed===1}",timeout=11000)
   sample("WHICH-1-of-3")
   stage="determiner-2";page.locator('#determinerUseAssessmentOptions [data-determiner-use-probe-select="cheese"]').click()
   page.wait_for_function("() => {let s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();return !!s?.context && window.AdaptivePassContractProgressView.project(s.context.passContract,s.context.evidencePackets,window.GreenPassProfile)?.completed===2}",timeout=11000)
   reached=sample("WHICH-2-of-3")
   assert reached["activeProgress"]["completed"]==2 and reached["activeProgress"]["total"]==3
   baseEvidence=reached["evidenceCount"]
   stage="change-QW";choose_qw("what")
   page.wait_for_timeout(350)
   moved=sample("S1-WHAT")
   assert any(x["completed"]==2 and x["origin"]=="shopping-for-dinner" for x in moved["retained"]),(stage,moved)
   stage="change-language";alternate={"en":"es","es":"pt","pt":"en"}[lang]
   page.locator('[data-experience-language="'+alternate+'"]').click()
   page.wait_for_function("(x)=>window.SIYAYOVerbExplorerExperienceRuntime.activeLanguage()===x",arg=alternate)
   sample("S1-WHAT-other-language")
   stage="S2";page.locator('#nextExperience').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='preparing-dinner'")
   choose_qw("where");sample("S2-WHERE")
   stage="S3";page.locator('#nextExperience').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='having-dinner'")
   choose_qw("why");sample("S3-WHY")
   stage="S4";page.locator('#nextExperience').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='after-dinner-conversation'")
   choose_qw("what");sample("S4-WHAT")
   stage="return-S1";page.locator('#nextExperience').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='shopping-for-dinner'")
   page.locator('[data-experience-language="'+lang+'"]').click()
   page.wait_for_function("(x)=>window.SIYAYOVerbExplorerExperienceRuntime.activeLanguage()===x",arg=lang)
   choose_qw("which")
   page.wait_for_function("() => {const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();if(!s?.session||s.session.decision.skill!=='which.use.determiner')return false;const p=window.AdaptivePassContractProgressView.project(s.context.passContract,s.context.evidencePackets,window.GreenPassProfile);return p?.completed===2 && p?.total===3}",timeout=17000)
   final=sample("WHICH-restored-2-of-3")
   assert final["activeScope"]["language"]==lang and final["activeScope"]["origin"]=="shopping-for-dinner",final
   assert final["activeProgress"]["status"]!='GREEN_PASS',final
   assert final["evidenceCount"]==baseEvidence,(final,baseEvidence)
   assert final["trailLanguage"] in (None,lang) and final["trailQW"] in (None,"which"),final
   assert final["wordPathLanguage"] in (None,lang),final
   page.screenshot(path=str(out/(lang+"-restored-2-of-3.png")),full_page=True)
   row["status"]="PASS"
  except Exception as e:
   row["stageFailed"]=stage;row["error"]=repr(e)[:1200];row["trace"]=traceback.format_exc()[-800:]
   try:page.screenshot(path=str(out/("ERROR-"+lang+".png")),full_page=True)
   except Exception:pass
  finally:
   runs.append(row);print("H13.5 RESULT",lang,row["status"],row.get("stageFailed",""),row.get("error",""),flush=True);c.close()
 b.close()
(out/"report.json").write_text(json.dumps(runs,indent=2,ensure_ascii=False))
if any(x["status"]!="PASS" for x in runs):raise SystemExit(1)
