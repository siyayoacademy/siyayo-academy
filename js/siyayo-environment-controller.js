(() => {
  "use strict";

  const host=document.querySelector("[data-siyayo-environment-host]");
  if(!host) return;

  const registryUrl=host.dataset.environmentRegistry || "../data/environments/siyayo-environments.json";
  const runtimeDefault=host.dataset.environmentRuntime || "auto-local-time";
  const toolbar=document.querySelector("[data-siyayo-environment-toolbar]");
  const buttons=toolbar ? [...toolbar.querySelectorAll("[data-environment-choice]")] : [];
  const weatherToolbar=document.querySelector("[data-siyayo-weather-toolbar]");
  const weatherButtons=weatherToolbar ? [...weatherToolbar.querySelectorAll("[data-weather-choice]")] : [];
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

  function isWeatherAllowed(id){
    return !!registry?.weatherSystem?.allowed?.includes(id);
  }

  function updateWeatherToolbar(requested,next){
    weatherButtons.forEach(button=>{
      const active=button.dataset.weatherChoice===requested || button.dataset.weatherChoice===next;
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-pressed",String(active));
    });
  }

  function applyWeather(requested,{source="runtime",preview=false}={}){
    const fallback=registry?.weatherSystem?.defaultWeather || "clear";
    const next=isWeatherAllowed(requested) ? requested : fallback;
    host.dataset.weather=next;
    host.dataset.weatherMode=preview ? "developer-preview" : "runtime-bound";
    updateWeatherToolbar(requested,next);

    window.dispatchEvent(new CustomEvent("siyayo:weather-changed",{
      detail:{
        requested,
        weatherId:next,
        mode:host.dataset.weatherMode,
        source,
        preview,
        pedagogicalChange:false,
        evaluated:false,
        evidenceProduced:false,
        green:false
      }
    }));
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

    weatherButtons.forEach(button=>{
      button.addEventListener("click",()=>{
        applyWeather(button.dataset.weatherChoice || "clear",{
          source:"developer-weather-toolbar",
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

    window.addEventListener("siyayo:set-weather",event=>{
      const id=event.detail?.weatherId;
      if(!id) return;
      applyWeather(id,{
        source:event.detail?.source || "external-weather-binding",
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
      applyWeather(registry?.weatherSystem?.defaultWeather || "clear",{source:"runtime-bootstrap",preview:false});
    })
    .catch(()=>{
      registry={
        defaultEnvironment:"cosmic-night",
        environments:[{id:"cosmic-night"}],
        weatherSystem:{defaultWeather:"clear",allowed:["clear"]}
      };
      bind();
      apply("cosmic-night",{source:"fallback",preview:false});
      applyWeather("clear",{source:"fallback",preview:false});
    });

  window.SIYAYOEnvironment=Object.freeze({
    set(id){ apply(id,{source:"api",preview:false}); },
    preview(id){ apply(id,{source:"api-preview",preview:true}); },
    current(){ return host.dataset.environment || null; },
    mode(){ return host.dataset.environmentMode || null; },
    autoByLocalTime(){ apply("auto-local-time",{source:"api",preview:false}); },
    restoreRuntime(){ apply(runtimeDefault,{source:"runtime-restore",preview:false}); }
  });

  window.SIYAYOWeather=Object.freeze({
    set(id){ applyWeather(id,{source:"api",preview:false}); },
    preview(id){ applyWeather(id,{source:"api-preview",preview:true}); },
    current(){ return host.dataset.weather || null; },
    mode(){ return host.dataset.weatherMode || null; },
    restoreRuntime(){ applyWeather(registry?.weatherSystem?.defaultWeather || "clear",{source:"runtime-restore",preview:false}); }
  });
})();
