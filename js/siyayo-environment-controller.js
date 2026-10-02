(() => {
  "use strict";

  const host=document.querySelector("[data-siyayo-environment-host]");
  if(!host) return;

  const registryUrl=host.dataset.environmentRegistry || "../data/environments/siyayo-environments.json";
  const toolbar=document.querySelector("[data-siyayo-environment-toolbar]");
  const buttons=toolbar ? [...toolbar.querySelectorAll("[data-environment-choice]")] : [];
  const STORAGE_KEY="siyayo-environment-choice";
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

  function apply(requested,{persist=true,source="developer"}={}){
    const resolved=requested==="auto-local-time" ? environmentForLocalTime() : requested;
    const next=isAllowed(resolved) ? resolved : (registry?.defaultEnvironment || "cosmic-night");
    host.dataset.environment=next;
    host.dataset.environmentMode=requested==="auto-local-time" ? "auto-local-time" : "manual";

    buttons.forEach(button=>{
      const active=button.dataset.environmentChoice===requested ||
        (requested!=="auto-local-time" && button.dataset.environmentChoice===next);
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-pressed",String(active));
    });

    if(persist){
      try{ localStorage.setItem(STORAGE_KEY,requested); }catch(error){}
    }

    window.dispatchEvent(new CustomEvent("siyayo:environment-changed",{
      detail:{
        requested,
        environmentId:next,
        mode:host.dataset.environmentMode,
        source,
        pedagogicalChange:false,
        evaluated:false,
        evidenceProduced:false,
        green:false
      }
    }));
  }

  function bind(){
    buttons.forEach(button=>{
      button.addEventListener("click",()=>apply(button.dataset.environmentChoice || "cosmic-night"));
    });

    window.addEventListener("siyayo:set-environment",event=>{
      const id=event.detail?.environmentId;
      if(!id) return;
      apply(id,{persist:false,source:event.detail?.source || "external-binding"});
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
      let saved=null;
      try{ saved=localStorage.getItem(STORAGE_KEY); }catch(error){}
      apply(saved || registry.defaultEnvironment || "cosmic-night",{persist:false,source:"bootstrap"});
    })
    .catch(()=>{
      registry={defaultEnvironment:"cosmic-night",environments:[{id:"cosmic-night"}]};
      bind();
      apply("cosmic-night",{persist:false,source:"fallback"});
    });

  window.SIYAYOEnvironment=Object.freeze({
    set(id){ apply(id,{source:"api"}); },
    current(){ return host.dataset.environment || null; },
    autoByLocalTime(){ apply("auto-local-time",{source:"api"}); }
  });
})();
