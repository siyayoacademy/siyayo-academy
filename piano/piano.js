(() => {
  "use strict";

  const stage = document.getElementById("pianoStage");
  const keyboard = document.getElementById("keyboard");
  const noteStatus = document.getElementById("noteStatus");
  const wordStatus = document.getElementById("wordStatus");
  const modeStatus = document.getElementById("modeStatus");
  const modeButtons = [...document.querySelectorAll(".mode-button")];

  const keys = [
    { id:"C4", frequency:261.63, solfege:"DÓ",  en:"green",  es:"verde",    pt:"verde" },
    { id:"D4", frequency:293.66, solfege:"RÉ",  en:"blue",   es:"azul",     pt:"azul" },
    { id:"E4", frequency:329.63, solfege:"MI",  en:"white",  es:"blanco",   pt:"branco" },
    { id:"F4", frequency:349.23, solfege:"FÁ",  en:"yellow", es:"amarillo", pt:"amarelo" },
    { id:"G4", frequency:392.00, solfege:"SOL", en:"brown",  es:"marrón",   pt:"marrom" },
    { id:"A4", frequency:440.00, solfege:"LÁ",  en:"red",    es:"rojo",     pt:"vermelho" },
    { id:"B4", frequency:493.88, solfege:"SI",  en:"gold",   es:"dorado",   pt:"dourado" },
    { id:"C5", frequency:523.25, solfege:"DÓ↑", en:"black",  es:"negro",    pt:"preto" }
  ];

  let mode = "sound";
  let audioContext = null;

  function ensureAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function playTone(frequency) {
    const ctx = ensureAudio();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    const body = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    const shimmerGain = ctx.createGain();

    body.type = "triangle";
    shimmer.type = "sine";
    body.frequency.setValueAtTime(frequency, now);
    shimmer.frequency.setValueAtTime(frequency * 2, now);

    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.42, now + 0.012);
    bodyGain.gain.exponentialRampToValueAtTime(0.12, now + 0.34);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);

    shimmerGain.gain.setValueAtTime(0.0001, now);
    shimmerGain.gain.exponentialRampToValueAtTime(0.085, now + 0.008);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);

    master.gain.value = 0.72;

    body.connect(bodyGain).connect(master);
    shimmer.connect(shimmerGain).connect(master);
    master.connect(ctx.destination);

    body.start(now);
    shimmer.start(now);
    body.stop(now + 1.3);
    shimmer.stop(now + 0.4);
  }

  function speak(text, lang) {
    if (!("speechSynthesis" in window) || !text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.88;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function speakTripiano(key) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    [
      [key.en, "en-US"],
      [key.es, "es-ES"],
      [key.pt, "pt-BR"]
    ].forEach(([text, lang]) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.86;
      window.speechSynthesis.speak(u);
    });
  }

  function currentLabel(key) {
    if (mode === "solfege" || mode === "sound") return key.solfege;
    if (mode === "tripiano") return key.en + " · " + key.es + " · " + key.pt;
    return key[mode];
  }

  function refreshLabels() {
    keyboard.querySelectorAll(".piano-key").forEach((button, index) => {
      button.querySelector(".key-word").textContent = currentLabel(keys[index]);
    });
  }

  function setMode(nextMode) {
    mode = nextMode;
    modeButtons.forEach(btn => btn.classList.toggle("is-active", btn.dataset.mode === mode));
    modeStatus.textContent = mode.toUpperCase();
    stage.dataset.theme = ["en","es","pt"].includes(mode) ? mode : "sound";
    wordStatus.textContent =
      mode === "sound" ? "DÓ → DÓ↑" :
      mode === "solfege" ? "Solfege" :
      mode === "tripiano" ? "EN → ES → PT" :
      "Colors";
    refreshLabels();
  }

  function activateKey(button, key) {
    playTone(key.frequency);

    window.dispatchEvent(new CustomEvent("siyayo:musical-event", {
      detail: {
        type: "note",
        source: "piano-flat",
        note: key.id,
        solfege: key.solfege,
        mode,
        word: currentLabel(key),
        payload: { en:key.en, es:key.es, pt:key.pt }
      }
    }));

    button.classList.remove("is-active");
    void button.offsetWidth;
    button.classList.add("is-active", "has-memory");
    window.setTimeout(() => button.classList.remove("is-active"), 560);

    noteStatus.textContent = key.solfege + " · " + key.id;
    wordStatus.textContent = currentLabel(key);

    if (mode === "solfege") speak(key.solfege.replace("↑", ""), "pt-BR");
    if (mode === "en") speak(key.en, "en-US");
    if (mode === "es") speak(key.es, "es-ES");
    if (mode === "pt") speak(key.pt, "pt-BR");
    if (mode === "tripiano") speakTripiano(key);
  }

  keys.forEach((key, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "piano-key";
    button.dataset.note = key.id;
    button.setAttribute("aria-label", key.solfege + " " + key.id);
    button.innerHTML =
      '<span class="key-tint-layer"></span>' +
      '<span class="key-glow-layer"></span>' +
      '<span class="key-ripple-layer"></span>' +
      '<span class="key-memory-layer"></span>' +
      '<span class="key-label-layer">' +
        '<span class="key-word"></span>' +
        '<span class="key-note">' + key.id + '</span>' +
      '</span>';

    button.addEventListener("pointerdown", event => {
      event.preventDefault();
      activateKey(button, key);
    });

    keyboard.appendChild(button);
  });

  modeButtons.forEach(button => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  const frondosa = document.getElementById("frondosa");
  const leaves = [...document.querySelectorAll(".leaf")];

  function leafLabelForMode(key) {
    if (mode === "sound" || mode === "solfege") return key.solfege;
    if (mode === "tripiano") return key.en + " · " + key.es + " · " + key.pt;
    return key[mode];
  }

  function refreshFrondosaLabels() {
    leaves.forEach((leaf, index) => {
      const label = leaf.querySelector("span");
      if (label) label.textContent = leafLabelForMode(keys[index]);
    });
  }

  window.addEventListener("siyayo:musical-event", event => {
    const detail = event.detail || {};
    if (detail.type !== "note" || !detail.note) return;
    const leaf = leaves.find(item => item.dataset.note === detail.note);
    if (!leaf) return;

    leaf.classList.remove("is-resonating");
    if (frondosa) frondosa.classList.remove("is-resonating");
    void leaf.offsetWidth;
    leaf.classList.add("is-resonating");
    if (frondosa) frondosa.classList.add("is-resonating");

    window.setTimeout(() => {
      leaf.classList.remove("is-resonating");
      if (frondosa) frondosa.classList.remove("is-resonating");
    }, 660);
  });

  leaves.forEach((leaf, index) => {
    leaf.addEventListener("click", () => {
      const key = keys[index];
      const pianoKey = keyboard.querySelector('[data-note="' + key.id + '"]');
      if (pianoKey) activateKey(pianoKey, key);
    });
  });

  modeButtons.forEach(button => {
    button.addEventListener("click", refreshFrondosaLabels);
  });

  refreshLabels();
  refreshFrondosaLabels();
})();
