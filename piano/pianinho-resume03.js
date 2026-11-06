/* RESUME-03 — opt-in visual integration; legacy remains default.
   Activate only with ?pianinho_resume03=1 and after uploading the approved PNG.
   No changes to Piano Plano or semantic assessment contracts. */
(() => {
  "use strict";
  if (new URLSearchParams(location.search).get("pianinho_resume03") !== "1") return;
  const avatar=document.getElementById("pianinho"), image=avatar?.querySelector(".pianinho-visual");
  if (!avatar || !image) return;
  const asset="./assets/pianinho-semicircular-homologado.png";
  const probe=new Image();
  probe.onload=()=>{
    const legacy=image.getAttribute("src");
    const restore=()=>{image.src=legacy;avatar.classList.remove("resume03");avatar.querySelector(".resume03-keys")?.remove();};
    image.addEventListener("error",restore,{once:true});
    image.src=asset;
    avatar.classList.add("resume03");
    const keys=document.createElement("div");keys.className="resume03-keys";
    keys.setAttribute("role","group");keys.setAttribute("aria-label","Teclado semicircular interativo, 22 notas");
    const notes=["G3","G#3","A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5","C#5","D5","D#5","E5"];
    const whites=notes.filter(n=>!n.includes("#"));
    let audio;
    function sound(note){
      const existing=avatar.querySelector('.mirror-mini [data-note="'+note+'"]');
      if(existing){existing.click();return;}
      const piano=document.querySelector('#keyboard [data-note="'+note+'"]');
      if(piano){piano.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,cancelable:true,pointerType:"touch"}));return;}
      const semitone={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[note[0]]+(note.includes("#")?1:0);
      const midi=(Number(note.match(/\d/)[0])+1)*12+semitone;
      const freq=440*Math.pow(2,(midi-69)/12);
      try{
        const C=window.AudioContext||window.webkitAudioContext;
        if(!C)return;
        audio??=new C();if(audio.state==="suspended")audio.resume();
        const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;
        o.frequency.value=freq;o.type="sine";g.gain.setValueAtTime(.0001,t);
        g.gain.exponentialRampToValueAtTime(.14,t+.02);
        g.gain.exponentialRampToValueAtTime(.0001,t+.45);
        o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.46);
      }catch(e){console.warn("RESUME-03 audio unavailable",e)}
      window.dispatchEvent(new CustomEvent("siyayo:mirror-extension-note",{detail:{note,scope:"musical.extension",semantic:null,evaluation:false,evidence:false}}));
    }
    notes.forEach(note=>{
      const sharp=note.includes("#");
      const i=sharp?whites.indexOf(notes[notes.indexOf(note)-1])+.5:whites.indexOf(note);
      const u=(i-6)/6;
      const b=document.createElement("button");b.type="button";
      b.className="resume03-key"+(sharp?" is-sharp":"");
      b.dataset.note=note;b.setAttribute("aria-label",note);
      b.style.left=(23.5+53*i/12)+"%";
      b.style.top=((sharp?72.7:80)-(sharp?13:14.5)*u*u)+"%";
      b.style.setProperty("--angle",(-u*35)+"deg");
      b.addEventListener("click",()=>{sound(note);b.classList.add("is-lit");setTimeout(()=>b.classList.remove("is-lit"),350)});
      keys.appendChild(b);
    });
    avatar.appendChild(keys);
    // RESUME-03.5: one authoritative, ordinal 13-note grid.
    // Apply coordinates directly with important priority to avoid legacy CSS
    // overrides and ensure the seventh note F#4 is bottom-center.
    const ringPositions=[
      ["C4",6,48],["C#4",8,60],["D4",14,71],
      ["D#4",24,81],["E4",36,88],["F4",43,81],
      ["F#4",50,91],["G4",76,81],["G#4",86,71],
      ["A4",92,81],["A#4",94,71],["B4",94,60],["C5",92,48]
    ];
    const ring=avatar.querySelector(".mirror-ring");
    for(const [note,x,y] of ringPositions){
      const node=Array.from(ring?.querySelectorAll(".mirror-node")||[])
        .find(el=>el.dataset.note===note);
      if(!node)continue;
      node.style.setProperty("left",x+"%","important");
      node.style.setProperty("top",y+"%","important");
    }
    avatar.dataset.resume03Version="03.5";
    // Existing mirror ring retains all 13 note IDs and handlers; only styling changes.
  };
  probe.src=asset;
})();
