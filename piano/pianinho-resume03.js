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
    // SOUND CALIBRATION 01: single authoritative right-hand voice in piano.js.
    // A4=432 Hz, equal temperament; the existing Pianinho voice raises one octave.
    // No synthetic clicks on the Piano Plano: no duplicate notes or assessment.
    function sound(note){
      const semitone={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[note[0]]+(note.includes("#")?1:0);
      const midi=(Number(note.match(/\d/)[0])+1)*12+semitone;
      const frequency=window.SIYAYO_PIANO_TUNING?.frequencyFromMidi(midi);
      if(!Number.isFinite(frequency))throw Error("SOUND-02 shared tuning unavailable");
      window.dispatchEvent(new CustomEvent("siyayo:pianinho-fine-art-note",{
        detail:{note,midi,frequency,outputFrequency:frequency*2,
          scope:"musical.fine-art",semantic:null,evaluation:false,evidence:false}
      }));
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
    // RESUME-04.5: use Y as the input and solve the ellipse for X.
    // Sample the lower-left quarter ellipse in physical 690x460 matrix pixels,
    // then space the 7 left-to-center centers at equal ARC LENGTH (not equal X).
    // The right half is a reflection; F#4 is the unique center point.
    const arc={cx:50,cy:48,rx:44,ry:43};
    const steps=2048, samples=[{theta:-Math.PI/2,length:0}];
    let total=0, prevX=arc.rx*690/100*Math.cos(-Math.PI/2);
    let prevY=arc.ry*460/100*Math.sin(-Math.PI/2);
    for(let i=1;i<=steps;i++){
      const theta=-Math.PI/2+(Math.PI/2)*i/steps;
      const px=arc.rx*690/100*Math.cos(theta);
      const py=arc.ry*460/100*Math.sin(theta);
      total+=Math.hypot(px-prevX,py-prevY);
      samples.push({theta,length:total});prevX=px;prevY=py;
    }
    const leftNotes=[
      ["C4","C5"],["C#4","B4"],["D4","A#4"],
      ["D#4","A4"],["E4","G#4"],["F4","G4"]
    ];
    const ringPositions=[];
    for(let i=0;i<leftNotes.length;i++){
      const target=total*i/6;
      let lo=0,hi=steps;
      while(lo<hi){const mid=(lo+hi)>>1;if(samples[mid].length<target)lo=mid+1;else hi=mid;}
      const after=samples[lo],before=samples[Math.max(0,lo-1)];
      const fraction=after.length===before.length?0:(target-before.length)/(after.length-before.length);
      const theta=before.theta+(after.theta-before.theta)*fraction;
      const y=arc.cy+arc.ry*Math.cos(theta);
      // Inverse of lower ellipse: X_left = cx - rx*sqrt(1-((Y-cy)/ry)^2)
      const normalized=(y-arc.cy)/arc.ry;
      const x=arc.cx-arc.rx*Math.sqrt(Math.max(0,1-normalized*normalized));
      const [left,right]=leftNotes[i];
      ringPositions.push([left,x,y],[right,2*arc.cx-x,y]);
    }
    ringPositions.push(["F#4",arc.cx,arc.cy+arc.ry]);
    if(ringPositions.length!==13 ||
       ringPositions.some(([note,x,y])=>!note||x<0||x>100||y<0||y>100))
      throw new Error("RESUME-04.5 invalid inverse-ellipse ring");
    const ring=avatar.querySelector(".mirror-ring");
    for(const [note,x,y] of ringPositions){
      const node=Array.from(ring?.querySelectorAll(".mirror-node")||[])
        .find(el=>el.dataset.note===note);
      if(!node)continue;
      node.style.setProperty("left",x+"%","important");
      node.style.setProperty("top",y+"%","important");
    }
    avatar.dataset.resume03Version="04.5-inverse-y-equal-arc-length";
    // RESUME-05: one immutable 690x460 coordinate space for ALL preview modes.
    // Only the outer viewport scales. No note coordinate or MIDI changes.
    const originalParent=avatar.parentElement;
    const originalNext=avatar.nextSibling;
    const matrix=document.createElement("div");
    matrix.className="resume04-matrix-viewport";
    const stage=document.getElementById("stageViewport");
    originalParent.insertBefore(matrix,originalNext);
    matrix.appendChild(avatar);
    avatar.classList.add("resume04-matrix");
    function updateMatrix(){
      const available=Math.max(1,originalParent.clientWidth-12);
      const portrait=stage?.dataset.preview==="portrait";
      const factor=Math.min(portrait?1:1.35,available/690);
      matrix.style.width=(690*factor)+"px";
      matrix.style.height=(460*factor)+"px";
      avatar.style.setProperty("--resume04-scale",String(factor));
    }
    const observer=new ResizeObserver(updateMatrix);
    observer.observe(originalParent);
    if(stage){
      const changes=new MutationObserver(updateMatrix);
      changes.observe(stage,{attributes:true,attributeFilter:["data-preview"]});
    }
    updateMatrix();
    // Existing mirror ring retains all 13 note IDs and handlers; only styling changes.
  };
  probe.src=asset;
})();
