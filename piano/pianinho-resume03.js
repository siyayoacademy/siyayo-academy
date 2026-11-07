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
    // RESUME-04.4: all 13 note centers lie on ONE lower semi-ellipse.
    // The 690x460 reference matrix scales as a unit in Portrait.
    // Endpoints: (6%,48%) and (94%,48%); lowest point F#4: (50%,91%).
    // Y = 48 + 43 * sqrt(1 - ((X-50)/44)^2).
    const arc={cx:50,cy:48,rx:44,ry:43};
    const arcY=x=>arc.cy+arc.ry*Math.sqrt(Math.max(0,1-((x-arc.cx)/arc.rx)**2));
    const leftRing=[
      ["C4",6,"C5"],["C#4",9,"B4"],
      ["D4",14,"A#4"],["D#4",21,"A4"],
      ["E4",30,"G#4"],["F4",40,"G4"]
    ];
    const ringPositions=[
      ...leftRing.flatMap(([left,x,right])=>[
        [left,x,arcY(x)],[right,2*arc.cx-x,arcY(x)]
      ]),
      ["F#4",arc.cx,arcY(arc.cx)]
    ];
    if(ringPositions.length!==13 ||
       ringPositions.some(([note,x,y])=>!note||x<0||x>100||y<0||y>100))
      throw new Error("RESUME-04.3 invalid musical ellipse");
    const ring=avatar.querySelector(".mirror-ring");
    for(const [note,x,y] of ringPositions){
      const node=Array.from(ring?.querySelectorAll(".mirror-node")||[])
        .find(el=>el.dataset.note===note);
      if(!node)continue;
      node.style.setProperty("left",x+"%","important");
      node.style.setProperty("top",y+"%","important");
    }
    avatar.dataset.resume03Version="04.4-spaced-algebraic-semiellipse";
    // RESUME-04: fixed 690x460 reference matrix; portrait changes ONLY
    // the scale of the complete actor (art, ring, keys, visual feedback).
    // Auto and Landscape retain their existing layout and DOM placement.
    const originalParent=avatar.parentElement;
    const originalNext=avatar.nextSibling;
    const matrix=document.createElement("div");
    matrix.className="resume04-matrix-viewport";
    const stage=document.getElementById("stageViewport");
    let observer;
    function updateMatrix(){
      const portrait=stage?.dataset.preview==="portrait";
      if(!portrait){
        if(matrix.contains(avatar)){
          originalParent.insertBefore(avatar,originalNext);
          matrix.remove();
        }
        avatar.classList.remove("resume04-matrix");
        avatar.style.removeProperty("--resume04-scale");
        return;
      }
      if(!matrix.contains(avatar)){
        originalParent.insertBefore(matrix,originalNext);
        matrix.appendChild(avatar);
      }
      const available=Math.max(1,originalParent.clientWidth-12);
      const factor=Math.min(1,available/690);
      matrix.style.width=(690*factor)+"px";
      matrix.style.height=(460*factor)+"px";
      avatar.style.setProperty("--resume04-scale",String(factor));
      avatar.classList.add("resume04-matrix");
    }
    if(stage){
      observer=new ResizeObserver(updateMatrix);
      observer.observe(originalParent);
      const changes=new MutationObserver(updateMatrix);
      changes.observe(stage,{attributes:true,attributeFilter:["data-preview"]});
      updateMatrix();
    }
    // Existing mirror ring retains all 13 note IDs and handlers; only styling changes.
  };
  probe.src=asset;
})();
