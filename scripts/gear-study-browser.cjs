'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const corpus=require('../data/learning/gear-study-corpus.json');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
try{const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.__spoken=[];Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},speak(u){window.__spoken.push({text:u.text,lang:u.lang});u.onstart?.();}}});});
let checked=0;
for(const entry of corpus.items){await page.goto('http://127.0.0.1:8765/verb-explorer.html?mode=experience&experience='+entry.experienceId);await page.waitForFunction(()=>document.querySelectorAll('#wordTypeGear button').length===10);
for(const lang of ['en','es','pt']){await page.locator(`[data-experience-language="${lang}"]`).click();
for(const kind of corpus.functions){await page.locator('[data-word-type="verb"]').click();await page.locator(`[data-verb-function="${kind.id}"]`).click();
for(const number of kind.id==='existence'?['singular','plural']:['default']){if(kind.id==='existence')await page.locator(`[data-study-number="${number}"]`).click();
for(const tense of ['present','past','future']){await page.locator(`[data-experience-tense="${tense}"]`).click();for(const mode of ['affirmative','negative','interrogative']){
await page.locator(`[data-experience-form="${mode}"]`).click();const cell=entry.forms[kind.id][number][tense][mode][lang];
assert.equal(await page.locator('#livingLines button p').first().textContent(),cell.text);
assert.ok(await page.locator('#gearQuestionContext').isVisible());
assert.ok(await page.locator('#dependencyFocusSurface').isVisible(),`Missing graph ${cell.dependency.id}`);
assert.ok((await page.locator('#dependencyFocusSurface').innerText()).includes(cell.text),`Stale graph ${cell.dependency.id}`);
assert.ok(await page.locator('#dependencyHeadProbePanel').isVisible(),`Missing probe ${cell.dependency.id}`);
assert.equal(await page.locator('#livingLines .study-target-word').count()>0,true);
checked++;
}}}}
for(const type of ['pronoun','adverb','article','preposition','conjunction','interjection','numeral']){await page.locator(`[data-word-type="${type}"]`).click();assert.ok(await page.locator('#studyKeywordGear button').count());assert.ok(await page.locator('#livingLines button').count());assert.ok(await page.locator('#gearQuestionContext').isVisible());if(type==='interjection')assert.equal(await page.locator('#dependencyFocusSurface').isVisible(),false);}
}}
// Reproduce screenshot: WHEN + COMPOSE retains the real question and response.
await page.goto('http://127.0.0.1:8765/verb-explorer.html?mode=experience&experience=preparing-dinner');await page.waitForFunction(()=>document.querySelectorAll('#wordTypeGear button').length===10);
await page.locator('#questionGear button').filter({hasText:/^WHEN$/}).click();await page.locator('#composeSelection').click();
assert.match(await page.locator('#gearQuestionContext').innerText(),/When should we cook the salmon\?/);assert.match(await page.locator('#gearQuestionContext').innerText(),/before dinner/);
await page.locator('[data-return-dialogue]').click();assert.equal(await page.locator('#gearQuestionContext').isVisible(),false);
// Speech uses displayed construction and locale; no green or progress is introduced.
await page.locator('[data-verb-function="existence"]').click();await page.locator('[data-study-number="plural"]').click();
const before=await page.locator('#learnerTrailSurface').textContent();await page.locator('#livingLines button').first().click();
const speech=await page.evaluate(()=>window.__spoken.at(-1));assert.equal(speech.text,'There are two carrots on the kitchen table.');assert.equal(speech.lang,'en-US');assert.equal(await page.locator('#learnerTrailSurface').textContent(),before);
// Return navigation retains the new presentation axes.
await page.evaluate(()=>SIYAYOVerbExplorerExperienceNavigation.goToExperience('having-dinner'));await page.evaluate(()=>SIYAYOVerbExplorerExperienceNavigation.goToExperience('preparing-dinner'));
assert.equal(await page.locator('[data-verb-function="existence"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-study-number="plural"]').getAttribute('aria-pressed'),'true');
// Identified free study still cannot submit to a retained/active assessor.
await page.locator('#learnerIdentityInput').fill('GEAR STUDY REGRESSION');await page.locator('#learnerIdentityConfirm').click();
await page.locator('[data-verb-function="existence"]').click();
await page.evaluate(()=>{window.__studySubmissions=0;window.__realCoordinator=window.SIYAYOVerbExplorerAdaptiveCoordinator;window.SIYAYOVerbExplorerAdaptiveCoordinator={snapshot:()=>window.__realCoordinator?.snapshot?.(),submitObservedAttempt:()=>{window.__studySubmissions++;}};});
await page.locator('#dependencyHeadProbeOptions [data-dependency-head-probe-select]').first().click();
assert.match(await page.locator('#dependencyHeadProbeFeedback').innerText(),/free practice/i);
assert.equal(await page.evaluate(()=>window.__studySubmissions),0);
await page.evaluate(()=>window.SIYAYOVerbExplorerAdaptiveCoordinator=window.__realCoordinator);
await page.locator('[data-study-number="singular"]').click();await page.locator('[data-study-number="plural"]').click();
await page.waitForTimeout(30);assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('siyayo.patita.interactions.v1')||'[]').some(r=>r.action==='study-number'&&r.evidenceProduced===false)));
fs.mkdirSync(process.env.GEAR_SCREENSHOTS||'test-results/gear-study',{recursive:true});
for(const [name,width,height] of [['desktop',1280,900],['portrait',390,844],['landscape',844,390]]){await page.setViewportSize({width,height});for(const lang of ['en','es','pt']){await page.locator(`[data-experience-language="${lang}"]`).click();const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,word:document.getElementById('wordTypeGear').getBoundingClientRect().top,thinking:document.getElementById('questionGear').getBoundingClientRect().top}));assert.equal(geometry.overflow,false,`${name}/${lang} overflow`);assert.ok(geometry.word<geometry.thinking);await page.locator('#livingLines').scrollIntoViewIfNeeded();await page.screenshot({path:(process.env.GEAR_SCREENSHOTS||'test-results/gear-study')+`/${name}-${lang}.png`,fullPage:true});}}
assert.deepEqual(errors,[]);console.log(`PASS Chromium ${checked} forms, 7 added classes × 4 Experiences × 3 languages, context, graph/probe, speech, return, 9 viewport/language screenshots`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
