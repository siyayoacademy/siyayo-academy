#!/usr/bin/env python3
"""JAGUAR 89N.1-4: four QWs x EN/ES/PT x desktop/portrait, SYNTHETIC & no remote writes."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path("visual-audit-89n"); OUT.mkdir(exist_ok=True)
SITE="http://127.0.0.1:8879/verb-explorer.html?mode=experience"
WORDS={"which":"which.use.determiner","what":"what.use.object-question",
       "where":"where.use.location-question","why":"why.use.contextual-reason"}
LOCALES={
 "en":{"notice":"LAB SIMULATION · 2/3 · NO REAL LEARNER","next":"TRANSFER READY",
       "swipe":"SWIPE TABLE TO SEE PORTUGUÊS →"},
 "es":{"notice":"SIMULACIÓN · 2/3 · SIN ALUMNO REAL","next":"TRANSFERENCIA PENDIENTE",
       "swipe":"DESLIZA LA TABLA PARA VER PORTUGUÊS →"},
 "pt":{"notice":"SIMULAÇÃO · 2/3 · SEM ALUNO REAL","next":"TRANSFERÊNCIA PENDENTE",
       "swipe":"DESLIZE A TABELA PARA VER PORTUGUÊS →"}
}
SIM=r"""async ({word,language,notice,swipe,portrait})=>{
 const w=window,d=document,origin='shopping-for-dinner',skill={
  which:'which.use.determiner',what:'what.use.object-question',
  where:'where.use.location-question',why:'why.use.contextual-reason'}[word];
 const definition=await (await fetch('/data/learning/skills/'+word+'.json',{cache:'no-store'})).json();
 if(definition.id!==skill||definition.passContract?.requires?.length!==3)
  throw Error('Missing canonical definition and 3 requirements: '+word);
 const person={id:w.SIYAYOVerbExplorerLearnerIdentitySource?.getId?.()};
 if(!person.id)throw Error('No synthetic learner identity');
 const scope={learnerId:person.id,skill,language,originExperienceId:origin,
  key:JSON.stringify([person.id,skill,language,origin])};
 const requests=definition.passContract.requires;
 const packets=requests.slice(0,2).map((r,i)=>({...r,skill,scopeKey:scope.key,
  context:{assessmentScope:scope,language,experienceId:origin,
   originExperienceId:origin,selectedAlternativeId:'SIMULATED-ONLY-'+i}}));
 const score=w.AdaptivePassContractProgressView.project(definition.passContract,packets,w.GreenPassProfile);
 if(score.completed!==2||score.total!==3||score.status!=='WAITING_FOR_EVIDENCE'||
    score.satisfied.join(',')!=='true,true,false')throw Error('Assessment projection is not 2/3: '+word);
 const snapshot={session:{decision:{skill,experienceId:origin,assessmentScope:scope}},
  context:{assessmentScope:scope,passContract:definition.passContract,evidencePackets:packets}};
 const foot={source:'lab-synthetic-observed',status:'observed',experienceId:origin,
  confirmed:false,contractStatus:null};
 const trailView={project:(_p,chosen)=>({skill:chosen,
  footprints:chosen===skill?[foot]:[],counts:{legacyFootprints:0}})};
 const marker=w.AdaptiveLearnerProgressMarker.resolve(trailView.project(person,skill));
 if(marker.marker!=='PARTIAL_DOT'||marker.confirmedExperiences!==0)
  throw Error('Unauthorized Green Pass');
 const src={getSkill:()=>skill,getDefinition:()=>definition},identity={getId:()=>person.id};
 const selection={getRetainedProgress:()=>[],getRetainedEvidence:()=>[]};
 const scopeApi={valid:s=>s?.key===JSON.stringify([s.learnerId,s.skill,s.language,s.originExperienceId]),
  same:(a,b)=>a?.key===b?.key,
  ownsPacket:(s,p)=>p?.skill===s.skill&&p?.context?.language===s.language&&
    p?.context?.assessmentScope?.key===s.key};
 w.SIYAYOVerbExplorerExperienceRuntime={
   activeLanguage:()=>language,activeQuestionWord:()=>word,activeExperienceId:()=>origin};
 // This creates a disposable DOM fixture only within a localhost GitHub Actions browser.
 d.body.innerHTML='<div class="stage-viewport" data-preview="auto" data-siyayo-responsive-viewport>'+
  '<main class="verb-explorer" id="audit-89n-root" style="max-width:950px;margin:auto;padding:12px">'+
  '<details id="learningTrailWordPathModule" class="learning-trail-word-path-module" open>'+
  '<summary class="learning-trail-word-path-trigger">LAB · FOUR-QW VISUAL AUDIT · 2/3</summary>'+
  '<div id="learningTrailWordPathPanel" class="learning-trail-word-path-panel">'+
  '<p class="lab-simulation-banner" style="text-align:center;border:2px dashed #f2d88a;'+
  'padding:10px;color:#f2d88a;font-weight:bold;margin:8px 0 12px">'+notice+'</p>'+
  '<section id="learnerTrailSurface" class="learner-trail-surface"></section></div></details>'+
  '<div class="toroidal-next" id="nextCandidate89n" style="max-width:650px;'+
  'margin:15px auto;padding:13px;border:1px solid #a79060">'+
  '<button id="nextExperience" data-next-experience="preparing-dinner">NEXT → LAB ONLY</button></div></main></div>';
 const ok=w.SIYAYOVerbExplorerLearnerTrailSurface.refresh({
  document:d,language,profileSource:{getProfile:()=>person},skillSource:src,
  labelView:w.AdaptiveLearnerTrailLabel,trailView,
  markerAuthority:w.AdaptiveLearnerProgressMarker,
  sequenceView:{project:t=>({skill:t.skill,segments:[
    {experienceId:origin,state:'IN_PROGRESS',marker:'PARTIAL_DOT'}]})},
  positionView:w.AdaptiveLearnerTrailPosition,
  stateBridge:{getState:()=>({currentExperienceId:origin})},
  coordinator:{snapshot:()=>snapshot},
  progressView:w.AdaptivePassContractProgressView,contractEvaluator:w.GreenPassProfile});
 if(!ok)throw Error('Canonical Learning Trail did not render');
 d.querySelectorAll('#learnerTrailSurface .learner-journey').forEach(node=>node.remove());
 const html=w.SIYAYOVerbExplorerPolyglotWordPathView.render({
  language,profile:person,identity,selection,trailView,
  markerAuthority:w.AdaptiveLearnerProgressMarker,scopeApi,snapshot,
  progressView:w.AdaptivePassContractProgressView,evaluator:w.GreenPassProfile,
  catalog:w.SIYAYOVerbExplorerExperienceNavigation});
 if(!html)throw Error('Canonical Word Path did not render');
 d.querySelector('#learningTrailWordPathPanel').insertAdjacentHTML('beforeend',html);
 const card=d.querySelector('.wp-evidence-card[data-language="'+language+'"]');
 if(!card)throw Error('Evidence card not found '+word+' '+language);
 card.open=true;
 const rows=card.querySelectorAll('.wp-evidence-requirement');
 const statuses=Array.from(rows).map(el=>el.dataset.accepted);
 const otherCells=Array.from(d.querySelectorAll('.wp-poly-cell[data-skill="'+skill+'"]'))
  .filter(el=>el.dataset.language!==language).map(el=>el.querySelector('.wp-poly-value')?.textContent);
 const meta=d.querySelector('.learner-trail-meta');
 const originalMeta=meta?.textContent?.trim()||'';
 const header=d.querySelector('.wp-poly-table thead th:first-child');
 const originalHeader=header?.textContent?.trim()||'';
 const whySmall=d.querySelector('.wp-poly-word:nth-child(1)'); // rows are located by row index instead
 const whyCell=d.querySelector('.wp-poly-table tbody tr:nth-child(3) th small');
 const originalWhy=whyCell?.textContent||'';
 const beforeScroll=d.querySelector('.wp-poly-scroller');
 const scrollerMetrics={visible:beforeScroll.clientWidth,content:beforeScroll.scrollWidth};
 beforeScroll.scrollLeft=beforeScroll.scrollWidth;
 scrollerMetrics.offset=beforeScroll.scrollLeft;
 scrollerMetrics.available=beforeScroll.scrollWidth-beforeScroll.clientWidth;
 // This is a VISUAL PREVIEW, not a source change. Retain original text in data attributes.
 if(portrait){
  if(language!=='en' && meta){
   const bits=originalMeta.split(' · ');
   if(bits.length!==2)throw Error('Unexpected ES/PT trail grammatical label: '+originalMeta);
   meta.dataset.auditOriginalText=originalMeta;
   meta.textContent='';
   bits.forEach((bit,i)=>{
    const span=d.createElement('span');span.className='lab-meta-line';
    span.textContent=bit;span.style.display='block';span.style.whiteSpace='nowrap';
    span.style.fontSize=i===0?'0.94em':'0.96em';meta.appendChild(span);
   });
   meta.style.lineHeight='1.2';meta.style.textAlign='center';
  }
  if(header&&language!=='en'){
   const bits=originalHeader.split(' ');
   if(bits.length!==2)throw Error('Unexpected ES/PT Word Path heading: '+originalHeader);
   header.dataset.auditOriginalText=originalHeader;header.textContent='';
   bits.forEach(bit=>{
    const span=d.createElement('span');span.className='lab-header-line';
    span.textContent=bit;span.style.display='block';span.style.whiteSpace='nowrap';
    span.style.fontSize='0.93em';header.appendChild(span);
   });
  }
  if(whyCell){
   const bits=originalWhy.split(' · ');
   if(bits.length!==2)throw Error('WHY translations unexpected: '+originalWhy);
   whyCell.dataset.auditOriginalText=originalWhy;whyCell.textContent='';
   bits.forEach(bit=>{
    const span=d.createElement('span');span.className='lab-why-line';
    span.textContent=bit;span.style.display='block';span.style.whiteSpace='nowrap';
    whyCell.appendChild(span);
   });
  }
  const hint=d.createElement('p');hint.id='labSwipeHint';
  hint.textContent='⇆ '+swipe;hint.style.color='#f2d88a';
  hint.style.textAlign='center';hint.style.fontSize='10px';
  hint.style.margin='3px 0 7px';
  beforeScroll.parentNode.insertBefore(hint,beforeScroll);
 }
 function fitsAll(selector){
  return Array.from(d.querySelectorAll(selector)).every(el=>{
   const a=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();
   return a.width<=p.width+2&&a.left>=p.left-2&&a.right<=p.right+2;
  });
 }
 const outcome={
  word,language,syntheticBannerVisible:!!d.querySelector('.lab-simulation-banner'),
  grammaticalLabelBefore:originalMeta,grammaticalLabelAfter:meta?.textContent,
  wordPathHeadingBefore:originalHeader,wordPathHeadingAfter:header?.textContent,
  whyTranslationsBefore:originalWhy,whyTranslationsAfter:whyCell?.textContent,
  lineCount:{grammar:d.querySelectorAll('.lab-meta-line').length,
             wordPathHeader:d.querySelectorAll('.lab-header-line').length,
             why:d.querySelectorAll('.lab-why-line').length},
  lineFits:fitsAll('.lab-meta-line, .lab-header-line, .lab-why-line'),
  evidenceCardOpen:card.open,requirements:statuses,
  progressText:d.querySelector('.learner-trail-contract-progress')?.textContent||'',
  trailMarker:d.querySelector('#learnerTrailSurface')?.dataset?.marker,
  wordPathValue:d.querySelector('.wp-poly-cell[data-skill="'+skill+'"][data-language="'+language+'"] .wp-poly-value')?.textContent,
  otherLanguageValues:otherCells,
  nextHint:d.querySelector('#nextTransferInvitation')?.textContent||'',
  nextIlluminated:d.querySelector('.toroidal-next')?.classList.contains('next-transfer-invitation'),
  scroller:scrollerMetrics,
  swipeVisible:!!d.querySelector('#labSwipeHint'),
  overflow:d.documentElement.scrollWidth>innerWidth+2,
  note:'DOM candidate overlay only; original JS, CSS, contracts and source remain unchanged'
 };
 if(outcome.grammaticalLabelBefore!==outcome.grammaticalLabelAfter && !portrait)
  throw Error('Desktop label changed');
 return outcome;
}""";

REPORT=[]
with sync_playwright() as engine:
    browser=engine.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
    for mode,viewport in {"desktop":(1440,900),"portrait":(390,844)}.items():
        for word in WORDS:
            for language,copy in LOCALES.items():
                item={"mode":mode,"word":word,"language":language}
                REPORT.append(item)
                context=browser.new_context(viewport={"width":viewport[0],"height":viewport[1]},
                                            reduced_motion="reduce")
                page=context.new_page()
                try:
                    page.goto(SITE,wait_until="domcontentloaded",timeout=18000)
                    page.wait_for_timeout(120)
                    if not page.locator('#experienceView').is_visible():
                        page.locator('[data-mode="experience"]').click(timeout=5000)
                    if mode=="portrait":
                        page.locator('button[data-preview="portrait"]').click(timeout=5000)
                    ident=page.locator('#learnerIdentityInput')
                    if ident.is_visible():
                        ident.fill('LAB-ONLY-89N')
                        page.locator('#learnerIdentityConfirm').click(timeout=5000)
                    # Fresh local page per skill/locale avoids progress crossing test scenarios.
                    data=page.evaluate(SIM,{
                        "word":word,"language":language,"notice":copy["notice"],
                        "swipe":copy["swipe"],"portrait":mode=="portrait"})
                    item["audit"]=data
                    checks={
                        "89N1_qw_label":word in WORDS and data["grammaticalLabelBefore"]!='',
                        "89N1_word_path_all_qws":page.locator('.wp-poly-table tbody tr').count()==4,
                        "89N1_portrait_breaks":mode!="portrait" or (
                            (language=="en" or (data["lineCount"]["grammar"]==2 and data["lineCount"]["wordPathHeader"]==2)) and
                            data["lineCount"]["why"]==2 and data["lineFits"]),
                        "89N2_card":data["evidenceCardOpen"] and data["requirements"]==["true","true","false"],
                        "89N3_next":data["trailMarker"]=="PARTIAL_DOT" and
                            data["nextIlluminated"] and copy["next"] in data["nextHint"] and
                            "2/3" in data["progressText"] and data["wordPathValue"]=="2/3",
                        "89N4_swipe":not data["overflow"] and (mode!="portrait" or
                            (data["scroller"]["available"]>0 and data["scroller"]["offset"]>0 and
                             data["swipeVisible"])),
                        "89N4_simulation":data["syntheticBannerVisible"],
                        "scope_other_languages":data["otherLanguageValues"]==["—","—"]
                    }
                    item["checks"]=checks
                    if not all(checks.values()):
                        raise AssertionError("Incomplete checks: "+repr({k:v for k,v in checks.items() if not v}))
                    # One image includes the evidence card AND lit NEXT, with simulation badge.
                    page.locator('#audit-89n-root').screenshot(
                        path=str(OUT/f"89n-{mode}-{word}-{language}.png"),
                        animations="disabled",timeout=20000)
                    item["passed"]=True
                except Exception as err:
                    item["passed"]=False;item["error"]=str(err)[:850]
                    try:
                        page.screenshot(path=str(OUT/f"diagnostic-{mode}-{word}-{language}.png"),
                                        full_page=True,timeout=10000)
                    except Exception:pass
                finally:context.close()
    browser.close()

out={"elo":"V30.3.89N.1–N.4","officialPin":"c7e83709cacf8479847df0f3cee4ed8a563aaae6",
     "syntheticOnly":True,"noOfficialUiEdits":True,"noCloudflareMutation":True,
     "noRealLearnerEvidence":True,"totalCases":len(REPORT),"cases":REPORT}
(OUT/"report.json").write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding="utf-8")
for item in REPORT:
    print("89N",item["mode"],item["word"],item["language"],
          "PASS" if item["passed"] else "FAIL",
          ",".join(k for k,v in item.get("checks",{}).items() if not v),
          item.get("error",""))
num=sum(x["passed"] for x in REPORT)
print("JAGUAR 89N STRICT PASS",num,"/",len(REPORT))
if num!=24:raise SystemExit(1)
