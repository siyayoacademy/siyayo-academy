/* JAGUAR KEY MAP LAB 01 — opt-in calibration, no audio/MIDI changes. */
(() => {
  "use strict";
  const q=new URLSearchParams(location.search);
  if(q.get("pianinho_resume03")!=="1"||q.get("keymap_lab")!=="1")return;
  const boot=()=>{
    const actor=document.getElementById("pianinho");
    const keys=actor?.querySelector(".resume03-keys");
    if(!actor||!keys){setTimeout(boot,250);return;}
    if(actor.dataset.keymapLab)return;
    actor.dataset.keymapLab="01";
    const list=[...keys.querySelectorAll(".resume03-key")];
    const initial=list.map(k=>({note:k.dataset.note,x:parseFloat(k.style.left),y:parseFloat(k.style.top),angle:parseFloat(k.style.getPropertyValue("--angle"))||0,width:null,height:null}));
    const values=initial.map(v=>({...v}));
    const css=document.createElement("style");
    css.textContent=`
      .keymap-lab-grid{position:absolute;inset:4% 8% 8%;z-index:3;pointer-events:none;
        background-image:linear-gradient(#3bd7ee55 1px,transparent 1px),linear-gradient(90deg,#3bd7ee55 1px,transparent 1px);
        background-size:5% 5%;outline:1px solid #3bd7eeaa}
      .keymap-lab-grid:after{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:1px dashed #ffd569}
      .keymap-lab-panel{position:relative;z-index:20;max-width:690px;margin:12px auto;padding:12px;border:1px solid #d9ad52;border-radius:12px;
        background:#101d32;color:#ffe4a0;font:14px system-ui;display:grid;gap:8px}
      .keymap-lab-panel label{display:flex;align-items:center;gap:8px;justify-content:space-between}
      .keymap-lab-panel input{width:min(58%,240px)}
      .keymap-lab-panel select,.keymap-lab-panel button{background:#263a55;color:#ffe4a0;border:1px solid #a98a45;border-radius:7px;padding:6px}
      .keymap-lab-panel output{font-variant-numeric:tabular-nums;min-width:65px}
      .keymap-lab-panel pre{white-space:pre-wrap;max-height:180px;overflow:auto;font-size:11px}
      .pianinho.resume03 .resume03-key.keymap-selected{outline:2px dashed #fff!important;background:#ffd35b66!important}
    `;
    document.head.appendChild(css);
    const grid=document.createElement("div");grid.className="keymap-lab-grid";
    actor.appendChild(grid);
    const panel=document.createElement("section");panel.className="keymap-lab-panel";
    panel.setAttribute("aria-label","JAGUAR KEY MAP LAB");
    panel.innerHTML='<strong>🐆 KEY MAP LAB · 22 notas · somente calibração visual</strong><label>Tecla <select data-key></select></label><label>X (%) <input data-axis="x" type="range" min="0" max="100" step=".05"><output data-out="x"></output></label><label>Y (%) <input data-axis="y" type="range" min="0" max="100" step=".05"><output data-out="y"></output></label><label>Rotação (°) <input data-axis="angle" type="range" min="-65" max="65" step=".5"><output data-out="angle"></output></label><label>Largura (%) <input data-axis="width" type="range" min="1" max="10" step=".1"><output data-out="width"></output></label><label>Altura (%) <input data-axis="height" type="range" min="3" max="26" step=".1"><output data-out="height"></output></label><div><button type="button" data-grid>Grade ON/OFF</button> <button type="button" data-reset>Restaurar original</button> <button type="button" data-export>Exportar JSON</button></div><pre data-json hidden></pre><small>Não altera MIDI, som, aro musical ou avaliação. Não salva nem publica calibrações automaticamente.</small>';
    actor.closest(".avatar-stage")?.appendChild(panel);
    const select=panel.querySelector("[data-key]");
    list.forEach((k,i)=>{const opt=document.createElement("option");opt.value=i;opt.textContent=k.dataset.note;select.appendChild(opt);});
    let selected=10;
    const defaults=i=>({width:list[i].classList.contains("is-sharp")?2.5:5.3,height:list[i].classList.contains("is-sharp")?10.5:17});
    const apply=i=>{
      const v=values[i],k=list[i],d=defaults(i);
      k.style.left=v.x+"%";k.style.top=v.y+"%";
      k.style.setProperty("--angle",v.angle+"deg");
      k.style.width=(v.width??d.width)+"%";k.style.height=(v.height??d.height)+"%";
    };
    const render=()=>{
      list.forEach((k,i)=>k.classList.toggle("keymap-selected",i===selected));
      select.value=String(selected);
      const v=values[selected],d=defaults(selected);
      for(const axis of ["x","y","angle","width","height"]){
        const n=v[axis]??d[axis];
        panel.querySelector('[data-axis="'+axis+'"]').value=n;
        panel.querySelector('[data-out="'+axis+'"]').textContent=Number(n).toFixed(axis==="angle"?1:2);
      }
    };
    panel.querySelectorAll("[data-axis]").forEach(input=>input.addEventListener("input",()=>{
      values[selected][input.dataset.axis]=Number(input.value);
      apply(selected);render();
    }));
    select.addEventListener("change",()=>{selected=Number(select.value);render();});
    panel.querySelector("[data-grid]").addEventListener("click",()=>{grid.hidden=!grid.hidden;grid.style.display=grid.hidden?"none":"";});
    panel.querySelector("[data-reset]").addEventListener("click",()=>{
      initial.forEach((v,i)=>{values[i]={...v};apply(i);});
      render();
    });
    panel.querySelector("[data-export]").addEventListener("click",()=>{
      const json=JSON.stringify({version:"keymap-lab-01",reference:"pianinho-resume03 690x460",keys:values},null,2);
      const pre=panel.querySelector("[data-json]");pre.hidden=false;pre.textContent=json;
      if(navigator.clipboard?.writeText)navigator.clipboard.writeText(json).catch(()=>{});
    });
    render();
  };
  boot();
})();