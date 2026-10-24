from playwright.sync_api import sync_playwright
from pathlib import Path
import json,traceback
out=Path("visual-audit-patita-h13-7");out.mkdir(exist_ok=True)
runs=[]
with sync_playwright() as p:
 b=p.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
 for lang in ["en","es","pt"]:
  c=b.new_context(viewport={"width":390,"height":844},reduced_motion="reduce");page=c.new_page()
  nick="H13.7-"+lang;stage="start";row={"language":lang,"status":"FAIL","stages":[]}
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
   print("H13.7",lang,label, json.dumps({k:v for k,v in state.items() if k in ("experience","qw","displayLanguage","activeProgress","retained","activeScope")}),flush=True)
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
   stage="S2-transfer";page.locator('#nextExperience').click()
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeExperienceId()==='preparing-dinner'")
   choose_qw("which")
   page.wait_for_function("() => document.querySelector('#determinerUseAssessmentPanel')?.dataset.assessmentMode==='transfer' && !document.querySelector('#determinerUseAssessmentPanel')?.hidden",timeout=15000)
   pre=sample("S2-transfer-ready")
   assert pre["activeProgress"]["completed"]==2 and pre["evidenceCount"]==baseEvidence,pre
   stage="wrong-transfer"
   bad=page.locator('#determinerUseAssessmentOptions [data-determiner-use-transfer-probe-select]').last
   assert bad.get_attribute('data-determiner-use-transfer-probe-select')!='carrots'
   bad.click()
   page.wait_for_function("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().some(x=>x.source==='determiner-use'&&x.mode==='transfer'&&x.resultCode==='fail')",timeout=11000)
   wrong=sample("S2-incorrect-transfer")
   assert wrong["activeProgress"]["completed"]==2 and wrong["activeProgress"]["status"]!='GREEN_PASS',wrong
   stage="correct-transfer"
   page.locator('#determinerUseAssessmentOptions [data-determiner-use-transfer-probe-select="carrots"]').click()
   page.wait_for_function("() => {let s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();if(!s?.context)return false;let p=window.AdaptivePassContractProgressView.project(s.context.passContract,s.context.evidencePackets,window.GreenPassProfile);return p?.completed===3&&p?.total===3&&p?.status==='GREEN_PASS'}",timeout=12000)
   completed=sample("S2-transfer-GREEN-3-of-3")
   assert completed["activeScope"]["origin"]=="shopping-for-dinner" and completed["activeScope"]["language"]==lang,completed
   trail=page.locator('#learnerTrailSurface')
   assert trail.get_attribute('data-assessment-language') in (None,lang)
   records=page.evaluate("() => window.SIYAYOPatitaInteractionTrail.getVisibleRecords().filter(x=>x.source==='determiner-use'&&x.mode==='transfer')")
   assert any(x['resultCode']=='fail' for x in records) and any(x['resultCode']=='pass' for x in records),records
   assert all(x['evidenceProduced'] is False and x['assessmentCredit'] is False for x in records)
   page.locator('#learningTrailWordPathModule').evaluate("(e)=>e.open=true")
   page.evaluate("() => window.SIYAYOVerbExplorerLearnerTrailSurface.refresh({document})")
   stage="crosscheck-green"
   page.wait_for_function("(lang)=>{const t=document.querySelector('#learnerTrailSurface .learner-trail-contract-progress');const w=document.querySelector('.wp-poly-cell[data-skill=\"which.use.determiner\"][data-language=\"'+lang+'\''] .wp-poly-value');return t?.textContent?.includes('3/3')&&w?.textContent?.trim()==='3/3'}",arg=lang,timeout=10000)
   audit=page.evaluate("""({lang,nick})=>{
     const s=window.SIYAYOVerbExplorerAdaptiveCoordinator.snapshot();
     const p=window.AdaptivePassContractProgressView.project(s.context.passContract,s.context.evidencePackets,window.GreenPassProfile);
     const root=document.querySelector('#learnerTrailSurface');
     const wp=document.querySelector('.wp-poly-cell[data-skill="which.use.determiner"][data-language="'+lang+'"]');
     const patita=window.SIYAYOPatitaInteractionTrail.getVisibleRecords();
     return {
       nick:window.SIYAYOVerbExplorerLearnerIdentitySource.getId(),
       scope:s.session.decision.assessmentScope,
       acceptedRequirements:p.satisfied,
       evaluation:p.status,
       contractCount:p.completed,
       evidencePackets:s.context.evidencePackets.length,
       trail:{visible:!root.hidden,progress:root.querySelector('.learner-trail-contract-progress')?.textContent.trim(),skill:root.dataset.assessmentSkill,language:root.dataset.assessmentLanguage,visibleQW:root.dataset.currentQword},
       wordPath:{value:wp?.querySelector('.wp-poly-value')?.textContent.trim(),state:wp?.dataset.state,language:document.querySelector('.wp-polyglot')?.dataset.focusedLanguage},
       patita:patita.filter(x=>x.source==='determiner-use'&&x.mode==='transfer').map(x=>({owner:x.learnerId,result:x.resultCode,credit:x.assessmentCredit,produced:x.evidenceProduced,language:x.language,experience:x.experienceId}))
     };
   }""",{"lang":lang,"nick":nick})
   assert audit['nick']==nick,audit
   assert audit['scope']['skill']=='which.use.determiner' and audit['scope']['language']==lang and audit['scope']['originExperienceId']=='shopping-for-dinner' and audit['scope']['learnerId']==nick,audit
   assert audit['acceptedRequirements']==[True,True,True] and audit['evaluation']=='GREEN_PASS' and audit['contractCount']==3,audit
   assert audit['trail']['visible'] and audit['trail']['skill']=='which.use.determiner' and audit['trail']['language']==lang and '3/3' in audit['trail']['progress'],audit
   assert audit['wordPath']['value']=='3/3' and audit['wordPath']['language']==lang,audit
   assert [x['result'] for x in audit['patita']]==['fail','pass'] and all(x['owner']==nick and x['language']==lang and x['experience']=='preparing-dinner' and x['produced'] is False and x['credit'] is False for x in audit['patita']),audit
   row['crosscheck']=audit
   page.screenshot(path=str(out/(lang+"-green-crosscheck.png")),full_page=True)
   stage="leave-green"
   choose_qw("where")
   page.wait_for_function("() => window.SIYAYOVerbExplorerExperienceRuntime.activeQuestionWord()==='where'")
   page.wait_for_function("(lang)=>document.querySelector('.wp-poly-cell[data-skill=\"which.use.determiner\"][data-language=\"'+lang+'\''] .wp-poly-value')?.textContent?.trim()==='3/3'",arg=lang,timeout=10000)
   page.evaluate("() => window.SIYAYOVerbExplorerLearnerTrailSurface.refresh({document})")
   assert page.locator('#learnerTrailSurface').get_attribute('data-current-qword') in (None,'where')
   stage="switch-display-language"
   other={"en":"pt","es":"en","pt":"es"}[lang]
   page.locator('[data-experience-language="'+other+'"]').click()
   page.wait_for_function("(other)=>document.querySelector('.wp-polyglot')?.dataset.focusedLanguage===other",arg=other,timeout=10000)
   assert page.locator('.wp-poly-cell[data-skill="which.use.determiner"][data-language="'+lang+'"] .wp-poly-value').inner_text().strip()=='3/3'
   assert page.locator('.wp-polyglot').get_attribute('data-assessment-language') in ('none',lang,other)
   page.screenshot(path=str(out/(lang+"-green-saved-other-language.png")),full_page=True)
   stage="return-green"
   page.locator('[data-experience-language="'+lang+'"]').click()
   page.wait_for_function("(lang)=>window.SIYAYOVerbExplorerExperienceRuntime.activeLanguage()===lang",arg=lang)
   choose_qw("which")
   page.wait_for_function("() => {const s=window.SIYAYOVerbExplorerAdaptiveCoordinator?.snapshot?.();if(s?.session?.decision?.skill!=='which.use.determiner')return false;const p=window.AdaptivePassContractProgressView.project(s.context.passContract,s.context.evidencePackets,window.GreenPassProfile);return p?.completed===3&&p?.total===3&&p?.status==='GREEN_PASS'}",timeout=14000)
   check=sample("S2-WHICH-return-GREEN-3-of-3")
   assert check['activeScope']['origin']=='shopping-for-dinner' and check['activeScope']['language']==lang,check
   assert check['activeProgress']['completed']==3 and check['activeProgress']['status']=='GREEN_PASS',check
   assert page.locator('.wp-poly-cell[data-skill="which.use.determiner"][data-language="'+lang+'"] .wp-poly-value').inner_text().strip()=='3/3'
   page.screenshot(path=str(out/(lang+"-green-return.png")),full_page=True)
   row["status"]="PASS"
  except Exception as e:
   row["stageFailed"]=stage;row["error"]=repr(e)[:1200];row["trace"]=traceback.format_exc()[-800:]
   try:page.screenshot(path=str(out/("ERROR-"+lang+".png")),full_page=True)
   except Exception:pass
  finally:
   runs.append(row);print("H13.7 RESULT",lang,row["status"],row.get("stageFailed",""),row.get("error",""),flush=True);c.close()
 b.close()
(out/"report.json").write_text(json.dumps(runs,indent=2,ensure_ascii=False))
if any(x["status"]!="PASS" for x in runs):raise SystemExit(1)
