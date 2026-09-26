(() => {
  "use strict";

  const stage = document.getElementById("pianoStage");
  const keyboard = document.getElementById("keyboard");
  const noteStatus = document.getElementById("noteStatus");
  const wordStatus = document.getElementById("wordStatus");
  const modeStatus = document.getElementById("modeStatus");
  const modeButtons = [...document.querySelectorAll(".mode-button")];
  const pianinho = document.getElementById("pianinho");
  const pianinhoHotspots = [...document.querySelectorAll(".pianinho-hotspot")];
  const pianinhoSequenceStatus = document.getElementById("pianinhoSequenceStatus");
  const stageViewport = document.getElementById("stageViewport");
  const previewButtons = [...document.querySelectorAll(".preview-button")];

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

  const pianinhoChord = ["C4","E4","G4","C5"];
  let pianinhoChordProgress = 0;
  let pianinhoChordTimer = null;

  function ensureAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function playPianoLow(frequency, when = 0) {
    const ctx = ensureAudio();
    const now = ctx.currentTime + when;
    const base = frequency * 0.5;

    const master = ctx.createGain();
    const body = ctx.createOscillator();
    const octave = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    const octaveGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    body.type = "triangle";
    octave.type = "sine";
    body.frequency.setValueAtTime(base, now);
    octave.frequency.setValueAtTime(base * 2, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1500, now);
    filter.Q.setValueAtTime(0.7, now);

    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.48, now + 0.014);
    bodyGain.gain.exponentialRampToValueAtTime(0.17, now + 0.34);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);

    octaveGain.gain.setValueAtTime(0.0001, now);
    octaveGain.gain.exponentialRampToValueAtTime(0.10, now + 0.012);
    octaveGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);

    master.gain.value = 0.72;

    body.connect(bodyGain).connect(filter);
    octave.connect(octaveGain).connect(filter);
    filter.connect(master).connect(ctx.destination);

    body.start(now);
    octave.start(now);
    body.stop(now + 1.6);
    octave.stop(now + 0.7);
  }

  function playPianinhoHigh(frequency, when = 0) {
    const ctx = ensureAudio();
    const now = ctx.currentTime + when;
    const base = frequency * 2;

    const master = ctx.createGain();
    const body = ctx.createOscillator();
    const sparkle = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    const sparkleGain = ctx.createGain();

    body.type = "triangle";
    sparkle.type = "sine";
    body.frequency.setValueAtTime(base, now);
    sparkle.frequency.setValueAtTime(base * 2.01, now);

    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.28, now + 0.006);
    bodyGain.gain.exponentialRampToValueAtTime(0.055, now + 0.20);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.78);

    sparkleGain.gain.setValueAtTime(0.0001, now);
    sparkleGain.gain.exponentialRampToValueAtTime(0.12, now + 0.004);
    sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    master.gain.value = 0.64;

    body.connect(bodyGain).connect(master);
    sparkle.connect(sparkleGain).connect(master);
    master.connect(ctx.destination);

    body.start(now);
    sparkle.start(now);
    body.stop(now + 0.82);
    sparkle.stop(now + 0.36);
  }

  function playFrondosaHarp(frequency, when = 0) {
    const ctx = ensureAudio();
    const now = ctx.currentTime + when;

    const master = ctx.createGain();
    const string = ctx.createOscillator();
    const chime = ctx.createOscillator();
    const stringGain = ctx.createGain();
    const chimeGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    string.type = "triangle";
    chime.type = "sine";
    string.frequency.setValueAtTime(frequency, now);
    chime.frequency.setValueAtTime(frequency * 3, now);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(Math.min(2400, frequency * 4), now);
    filter.Q.setValueAtTime(0.9, now);

    stringGain.gain.setValueAtTime(0.0001, now);
    stringGain.gain.exponentialRampToValueAtTime(0.30, now + 0.005);
    stringGain.gain.exponentialRampToValueAtTime(0.08, now + 0.28);
    stringGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);

    chimeGain.gain.setValueAtTime(0.0001, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.07, now + 0.003);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);

    master.gain.value = 0.62;

    string.connect(stringGain).connect(filter);
    chime.connect(chimeGain).connect(filter);
    filter.connect(master).connect(ctx.destination);

    string.start(now);
    chime.start(now);
    string.stop(now + 1.2);
    chime.stop(now + 0.56);
  }

  function playInstrument(source, frequency, when = 0) {
    if (source === "pianinho-magico") {
      playPianinhoHigh(frequency, when);
      return;
    }

    if (source === "frondosa") {
      playFrondosaHarp(frequency, when);
      return;
    }

    playPianoLow(frequency, when);
  }

  function playTrioAccent(frequency, when = 0) {
    playPianoLow(frequency, when);
    playFrondosaHarp(frequency, when + 0.02);
    playPianinhoHigh(frequency, when + 0.04);
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

  function activateKey(button, key, source = "piano-flat") {
    playInstrument(source, key.frequency);

    window.dispatchEvent(new CustomEvent("siyayo:musical-event", {
      detail: {
        type: "note",
        source,
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
      activateKey(button, key, "piano-flat");
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


  function updatePianinhoSequenceStatus() {
    if (pianinhoSequenceStatus) {
      pianinhoSequenceStatus.textContent = pianinhoChordProgress + "/4";
    }
  }

  function resetPianinhoChord() {
    pianinhoChordProgress = 0;
    if (pianinhoChordTimer) {
      window.clearTimeout(pianinhoChordTimer);
      pianinhoChordTimer = null;
    }
    updatePianinhoSequenceStatus();
  }

  function playGreenCI() {
    const chordKeys = pianinhoChord
      .map(note => keys.find(key => key.id === note))
      .filter(Boolean);

    if (chordKeys[0]) playPianoLow(chordKeys[0].frequency, 0.00);
    if (chordKeys[1]) playPianinhoHigh(chordKeys[1].frequency, 0.14);
    if (chordKeys[2]) playFrondosaHarp(chordKeys[2].frequency, 0.28);
    if (chordKeys[3]) playTrioAccent(chordKeys[3].frequency, 0.44);
  }

  function completePianinhoChord() {
    if (pianinho) {
      pianinho.classList.remove("is-chord-complete");
      void pianinho.offsetWidth;
      pianinho.classList.add("is-chord-complete");
    }

    if (frondosa) {
      frondosa.classList.remove("is-chord-complete");
      void frondosa.offsetWidth;
      frondosa.classList.add("is-chord-complete");
    }

    if (pianinhoSequenceStatus) {
      pianinhoSequenceStatus.textContent = "CI ✓";
    }

    playGreenCI();

    window.dispatchEvent(new CustomEvent("siyayo:resonance-event", {
      detail: {
        type: "chord-complete",
        id: "do-mi-sol-do",
        source: "pianinho-magico",
        notes: [...pianinhoChord]
      }
    }));

    window.setTimeout(() => {
      if (pianinho) pianinho.classList.remove("is-chord-complete");
      if (frondosa) frondosa.classList.remove("is-chord-complete");
      resetPianinhoChord();
    }, 1100);
  }

  function trackPianinhoChord(note) {
    const expected = pianinhoChord[pianinhoChordProgress];

    if (note === expected) {
      pianinhoChordProgress += 1;
      updatePianinhoSequenceStatus();

      if (pianinhoChordTimer) window.clearTimeout(pianinhoChordTimer);
      pianinhoChordTimer = window.setTimeout(resetPianinhoChord, 2600);

      if (pianinhoChordProgress === pianinhoChord.length) {
        if (pianinhoChordTimer) window.clearTimeout(pianinhoChordTimer);
        pianinhoChordTimer = null;
        completePianinhoChord();
      }
      return;
    }

    pianinhoChordProgress = note === pianinhoChord[0] ? 1 : 0;
    updatePianinhoSequenceStatus();

    if (pianinhoChordTimer) window.clearTimeout(pianinhoChordTimer);
    pianinhoChordTimer = pianinhoChordProgress
      ? window.setTimeout(resetPianinhoChord, 2600)
      : null;
  }

  window.addEventListener("siyayo:musical-event", event => {
    const detail = event.detail || {};
    if (detail.type !== "note" || !detail.note) return;

    if (detail.source === "pianinho-magico") {
      trackPianinhoChord(detail.note);
    }
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

    const avatarZone = pianinhoHotspots.find(item => item.dataset.note === detail.note);
    if (avatarZone) {
      avatarZone.classList.remove("is-resonating");
      if (pianinho) pianinho.classList.remove("is-resonating");
      void avatarZone.offsetWidth;
      avatarZone.classList.add("is-resonating");
      if (pianinho) pianinho.classList.add("is-resonating");
      window.setTimeout(() => {
        avatarZone.classList.remove("is-resonating");
        if (pianinho) pianinho.classList.remove("is-resonating");
      }, 660);
    }
  });

  leaves.forEach((leaf, index) => {
    leaf.addEventListener("click", () => {
      const key = keys[index];
      const pianoKey = keyboard.querySelector('[data-note="' + key.id + '"]');
      if (pianoKey) activateKey(pianoKey, key, "frondosa");
    });
  });

  pianinhoHotspots.forEach(zone => {
    zone.addEventListener("click", () => {
      const key = keys.find(item => item.id === zone.dataset.note);
      if (!key) return;
      const pianoKey = keyboard.querySelector('[data-note="' + key.id + '"]');
      if (pianoKey) activateKey(pianoKey, key, "pianinho-magico");
    });
  });

  modeButtons.forEach(button => {
    button.addEventListener("click", refreshFrondosaLabels);
  });

  function setPreviewMode(nextMode) {
    if (!stageViewport) return;
    stageViewport.dataset.preview = nextMode;
    previewButtons.forEach(button => {
      button.classList.toggle("is-active", button.dataset.preview === nextMode);
    });
    try {
      localStorage.setItem("siyayo-piano-preview-mode", nextMode);
    } catch (error) {}
  }

  previewButtons.forEach(button => {
    button.addEventListener("click", () => setPreviewMode(button.dataset.preview || "auto"));
  });

  try {
    const savedPreview = localStorage.getItem("siyayo-piano-preview-mode");
    if (savedPreview && ["auto","portrait","landscape"].includes(savedPreview)) {
      setPreviewMode(savedPreview);
    }
  } catch (error) {}

  updatePianinhoSequenceStatus();
  refreshLabels();
  refreshFrondosaLabels();
})();
