(() => {
  "use strict";

  const ALLOWED = new Set(["auto","portrait","landscape"]);
  const STORAGE_KEY = "siyayo-responsive-preview-mode";
  const viewport = document.querySelector("[data-siyayo-responsive-viewport]") || document.getElementById("stageViewport");
  const toolbar = document.querySelector("[data-siyayo-responsive-toolbar]") || document.getElementById("devPreviewToolbar");
  if (!viewport || !toolbar) return;

  const buttons = [...toolbar.querySelectorAll("[data-preview]")];
  const isTouchFirst = window.matchMedia
    ? window.matchMedia("(hover:none) and (pointer:coarse)").matches
    : false;

  function apply(mode, {persist=true, source="developer"} = {}) {
    const next = ALLOWED.has(mode) ? mode : "auto";
    const effective = isTouchFirst ? "auto" : next;

    viewport.dataset.preview = effective;
    buttons.forEach(button => {
      const active = button.dataset.preview === effective;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (persist && !isTouchFirst) {
      try { localStorage.setItem(STORAGE_KEY, effective); } catch (error) {}
    }

    window.dispatchEvent(new CustomEvent("siyayo:responsive-preview-changed", {
      detail:{
        requestedMode:next,
        mode:effective,
        source,
        touchFirst:isTouchFirst,
        pedagogicalChange:false,
        evaluated:false,
        evidenceProduced:false
      }
    }));
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => apply(button.dataset.preview || "auto"));
  });

  let saved = null;
  if (!isTouchFirst) {
    try {
      saved = localStorage.getItem(STORAGE_KEY);
      if (!ALLOWED.has(saved)) {
        const legacy = localStorage.getItem("siyayo-piano-preview-mode");
        if (ALLOWED.has(legacy)) {
          saved = legacy;
          localStorage.setItem(STORAGE_KEY, legacy);
        }
      }
    } catch (error) {}
  }

  apply(saved || "auto", {persist:false, source:"bootstrap"});

  window.SIYAYOResponsivePreview = Object.freeze({
    setMode(mode){ apply(mode); },
    getMode(){ return viewport.dataset.preview || "auto"; },
    modes:Object.freeze([...ALLOWED])
  });
})();
