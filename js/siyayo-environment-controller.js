(() => {
  "use strict";

  const host=document.querySelector("[data-siyayo-environment-host]");
  if(!host) return;

  const registryUrl=host.dataset.environmentRegistry || "../data/environments/siyayo-environments.json";
  const runtimeDefault=host.dataset.environmentRuntime || "auto-local-time";
  const toolbar=document.querySelector("[data-siyayo-environment-toolbar]");
  const buttons=toolbar ? [...toolbar.querySelectorAll("[data-environment-choice]")] : [];
  let registry=null;

  function isAllowed(id){
    return !!registry?.environments?.some(item=>item.id===id);
  }

  function environmentForLocalTime(){
    const hour=new Date().getHours();
    if(hour>=5 && hour<7) return "river-dawn";
    if(hour>=7 && hour<17) return "forest-day";
    if(hour>=17 && hour<20) return "nice-party-evening";
    return "cosmic-night";
  }

  function resolve(requested){
    const resolved=requested==="auto-local-time" ? environmentForLocalTime() : requested;
    return isAllowed(resolved) ? resolved : (registry?.defaultEnvironment || "cosmic-night");
  }

  function updateToolbar(requested,next){
    buttons.forEach(button=>{
      const active=button.dataset.environmentChoice===requested ||
        (requested!=="auto-local-time" && button.dataset.environmentChoice===next);
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-pressed",String(active));
    });
  }

  function apply(requested,{source="runtime",preview=false}={}){
    const next=resolve(requested);
    host.dataset.environment=next;
    host.dataset.environmentMode=preview ? "developer-preview" :
      (requested==="auto-local-time" ? "auto-local-time" : "runtime-bound");
    updateToolbar(requested,next);

    window.dispatchEvent(new CustomEvent("siyayo:environment-changed",{
      detail:{
        requested,
        environmentId:next,
        mode:host.dataset.environmentMode,
        source,
        preview,
        pedagogicalChange:false,
        evaluated:false,
        evidenceProduced:false,
        green:false
      }
    }));
  }

  function bind(){
    buttons.forEach(button=>{
      button.addEventListener("click",()=>{
        apply(button.dataset.environmentChoice || "cosmic-night",{
          source:"developer-toolbar",
          preview:true
        });
      });
    });

    window.addEventListener("siyayo:set-environment",event=>{
      const id=event.detail?.environmentId;
      if(!id) return;
      apply(id,{
        source:event.detail?.source || "external-binding",
        preview:false
      });
    });
  }

  fetch(registryUrl)
    .then(response=>{
      if(!response.ok) throw new Error("Environment registry unavailable");
      return response.json();
    })
    .then(data=>{
      registry=data;
      bind();
      apply(runtimeDefault,{source:"runtime-bootstrap",preview:false});
    })
    .catch(()=>{
      registry={defaultEnvironment:"cosmic-night",environments:[{id:"cosmic-night"}]};
      bind();
      apply("cosmic-night",{source:"fallback",preview:false});
    });

  window.SIYAYOEnvironment=Object.freeze({
    set(id){ apply(id,{source:"api",preview:false}); },
    preview(id){ apply(id,{source:"api-preview",preview:true}); },
    current(){ return host.dataset.environment || null; },
    mode(){ return host.dataset.environmentMode || null; },
    autoByLocalTime(){ apply("auto-local-time",{source:"api",preview:false}); },
    restoreRuntime(){ apply(runtimeDefault,{source:"runtime-restore",preview:false}); }
  });
})();
