/* SIYAYO M1-M4 mirror 21: additive, non-evaluative musical layer. */
(() => {
"use strict";
const avatar=document.getElementById("pianinho"), keyboard=document.getElementById("keyboard");
if(!avatar||!keyboard||avatar.dataset.mirror21)return;
const notes=[
["G#3","SOL♯",207.65,"black"],["A3","LÁ",220,"white"],["A#3","LÁ♯",233.08,"black"],["B3","SI",246.94,"white"],
["C4","DÓ",261.63,"white"],["C#4","DÓ♯",277.18,"black"],["D4","RÉ",293.66,"white"],["D#4","RÉ♯",311.13,"black"],
["E4","MI",329.63,"white"],["F4","FÁ",349.23,"white"],["F#4","FÁ♯",369.99,"black"],["G4","SOL",392,"white"],
["G#4","SOL♯",415.30,"black"],["A4","LÁ",440,"white"],["A#4","LÁ♯",466.16,"black"],["B4","SI",493.88,"white"],
["C5","DÓ↑",523.25,"white"],["C#5","DÓ♯",554.37,"black"],["D5","RÉ",587.33,"white"],["D#5","RÉ♯",622.25,"black"],["E5","MI",659.25,"white"]
];
const anchor=new Set(notes.slice(4,17).map(n=>n[0]));
const map=new Map(notes.map(n=>[n[0],n]));
const white=notes.filter(n=>n[3]==="white");
const nodes=new Map(),minis=new Map(),extensions=new Map();
const coords=[[34,28],[27,39],[22,52],[26,67],[37,79],[49,84],[62,79],[74,67],[78,52],[73,39],[66,28],[60,18],[49,14]];
const colors=["#f6cb5c","#47ceff","#d97bff","#f4dc3c","#ff9a39","#eec958","#3bd4ff","#f1c75e","#f9a04e","#f1c75e","#dd6cff","#f5e36c","#ffd25a"];
const ring=document.createElement("div");ring.className="mirror-ring mirror-smile-grid";ring.setAttribute("role","group");ring.setAttribute("aria-label","Aro musical de 13 notas");
notes.filter(n=>anchor.has(n[0])).forEach((n,i)=>{
const b=document.createElement("button");b.type="button";b.className="mirror-node";b.dataset.note=n[0];b.dataset.chromatic=String(n[3]==="black");
b.style.setProperty("--x",coords[i][0]+"%");b.style.setProperty("--y",coords[i][1]+"%");b.style.setProperty("--tone",colors[i]);
b.textContent=n[1];b.setAttribute("aria-label",n[1]+" "+n[0]);b.addEventListener("click",()=>play(n[0],true));ring.appendChild(b);nodes.set(n[0],b);
});
const mini=document.createElement("div");mini.className="mirror-mini";mini.setAttribute("aria-label","Tecladinho de 21 notas G sustenido 3 a Mi 5");
white.forEach(n=>{const b=document.createElement("button");b.type="button";b.className="mirror-mini-white";b.dataset.note=n[0];b.title=n[1]+" "+n[0];b.setAttribute("aria-label",b.title);b.addEventListener("click",()=>play(n[0],true));mini.appendChild(b);minis.set(n[0],b)});
notes.filter(n=>n[3]==="black").forEach(n=>{
const idx=white.findIndex(w=>notes.indexOf(w)>notes.indexOf(n));
const b=document.createElement("button");b.type="button";b.className="mirror-mini-black";b.style.left=(idx/12*100)+"%";b.dataset.note=n[0];b.title=n[1]+" "+n[0];b.setAttribute("aria-label",b.title);b.addEventListener("click",()=>play(n[0],true));mini.appendChild(b);minis.set(n[0],b);
});
avatar.dataset.mirror21="true";avatar.classList.add("mirror-hybrid");avatar.append(mini,ring);
const firstWhite=keyboard.querySelector('.piano-key:not(.black-key)');
const lastWhite=keyboard.querySelector('.piano-key[data-note="C5"]');
for(const n of notes.filter(n=>!anchor.has(n[0]))){
const b=document.createElement("button");b.type="button";b.className="mirror-extension-key "+(n[3]==="black"?"black-key":"white-key");
b.dataset.note=n[0];b.setAttribute("aria-label",n[1]+" "+n[0]+" — solfejo musical");b.innerHTML='<span class="mirror-extension-label">'+n[1]+'<small>'+n[0]+'</small></span>';
b.addEventListener("pointerdown",e=>{e.preventDefault();play(n[0],false)});
if(n[3]==="white"&&notes.indexOf(n)<4)keyboard.insertBefore(b,firstWhite);
else if(n[3]==="white")keyboard.appendChild(b);
else keyboard.appendChild(b);
extensions.set(n[0],b);
}
keyboard.classList.add("mirror-keyboard-21");
// White-key order is explicit; black keys are positioned over white-key boundaries.
white.forEach((n,index)=>{const b=keyboard.querySelector('[data-note="'+n[0]+'"]');if(b)b.style.setProperty("--mirror-white-index",String(index));});
const switches=document.createElement("div");switches.className="mirror-switch";
switches.innerHTML='<small>ESPELHO MUSICAL · 13 NO ARO / 21 NO TECLADO</small>';
const original=document.createElement("button"),hybrid=document.createElement("button");
original.type=hybrid.type="button";original.textContent="8 original";hybrid.textContent="13 + 21";
function setView(on){avatar.classList.toggle("mirror-hybrid",on);keyboard.classList.toggle("mirror-keyboard-21",on);ring.hidden=mini.hidden=!on;extensions.forEach(b=>b.hidden=!on);original.setAttribute("aria-pressed",String(!on));hybrid.setAttribute("aria-pressed",String(on));}
original.addEventListener("click",()=>setView(false));hybrid.addEventListener("click",()=>setView(true));
switches.append(original,hybrid);avatar.parentElement.insertAdjacentElement("afterend",switches);setView(true);
let audio=null;
function extensionSound(n,octaveMultiplier=1){
try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!audio)audio=new C();if(audio.state==="suspended")audio.resume();
const osc=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;osc.type="sine";osc.frequency.value=n[2]*octaveMultiplier;gain.gain.setValueAtTime(0.0001,now);gain.gain.exponentialRampToValueAtTime(.18,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+.5);osc.connect(gain);gain.connect(audio.destination);osc.start(now);osc.stop(now+.52);}catch(e){console.warn("Mirror extension audio unavailable",e)}
}
function play(id,fromAvatar){
const n=map.get(id);if(!n)return;
if(anchor.has(id)){
if(fromAvatar&&n[3]==="black"){extensionSound(n,2);light(id);return;}
if(fromAvatar&&n[3]==="white"){const hotspot=avatar.querySelector('.pianinho-hotspot[data-note="'+id+'"]');if(hotspot){hotspot.click();return}}
const key=keyboard.querySelector('.piano-key[data-note="'+id+'"]');
if(key)key.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,cancelable:true,pointerType:"touch"}));
return;
}
extensionSound(n,fromAvatar?2:1);
const noteStatus=document.getElementById("noteStatus"),wordStatus=document.getElementById("wordStatus");
if(noteStatus)noteStatus.textContent=n[1]+" · "+id;
if(wordStatus)wordStatus.textContent="SOLFEGE · extensão musical";
window.dispatchEvent(new CustomEvent("siyayo:mirror-extension-note",{detail:{note:id,solfege:n[1],scope:"musical.extension",semantic:null,evaluation:false,evidence:false}}));
light(id);
}
function light(id){for(const el of [nodes.get(id),minis.get(id),extensions.get(id)]){if(!el)continue;el.classList.remove("is-mirror-lit");void el.offsetWidth;el.classList.add("is-mirror-lit");window.setTimeout(()=>el.classList.remove("is-mirror-lit"),550)}}
window.addEventListener("siyayo:musical-event",e=>{const d=e.detail||{};if(d.type==="note"&&map.has(d.note))light(d.note)});
})();
