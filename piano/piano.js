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
  const semanticSequence = document.getElementById("semanticSequence");
  const semanticPhase = document.getElementById("semanticPhase");
  const semanticCue = document.getElementById("semanticCue");
  const semanticAnswer = document.getElementById("semanticAnswer");
  const learnerResponseForm = document.getElementById("learnerResponseForm");
  const learnerResponseInput = document.getElementById("learnerResponseInput");

  const keys = [
    { id:"C4",  frequency:261.63, solfege:"DÓ",  en:"green",  es:"verde",    pt:"verde",    kind:"white" },
    { id:"C#4", frequency:277.18, solfege:"DÓ♯", en:"sharp",  es:"sostenido",pt:"sustenido",kind:"black" },
    { id:"D4",  frequency:293.66, solfege:"RÉ",  en:"blue",   es:"azul",     pt:"azul",     kind:"white" },
    { id:"D#4", frequency:311.13, solfege:"RÉ♯", en:"sharp",  es:"sostenido",pt:"sustenido",kind:"black" },
    { id:"E4",  frequency:329.63, solfege:"MI",  en:"white",  es:"blanco",   pt:"branco",   kind:"white" },
    { id:"F4",  frequency:349.23, solfege:"FÁ",  en:"yellow", es:"amarillo", pt:"amarelo",  kind:"white" },
    { id:"F#4", frequency:369.99, solfege:"FÁ♯", en:"sharp",  es:"sostenido",pt:"sustenido",kind:"black" },
    { id:"G4",  frequency:392.00, solfege:"SOL", en:"brown",  es:"marrón",   pt:"marrom",   kind:"white" },
    { id:"G#4", frequency:415.30, solfege:"SOL♯",en:"sharp",  es:"sostenido",pt:"sustenido",kind:"black" },
    { id:"A4",  frequency:440.00, solfege:"LÁ",  en:"red",    es:"rojo",     pt:"vermelho", kind:"white" },
    { id:"A#4", frequency:466.16, solfege:"LÁ♯", en:"sharp",  es:"sostenido",pt:"sustenido",kind:"black" },
    { id:"B4",  frequency:493.88, solfege:"SI",  en:"gold",   es:"dorado",   pt:"dourado",  kind:"white" },
    { id:"C5",  frequency:523.25, solfege:"DÓ↑", en:"black",  es:"negro",    pt:"preto",    kind:"white" }
  ];

  const whiteKeys = keys.filter(key => key.kind === "white");
  const blackKeys = keys.filter(key => key.kind === "black");

  // Perceptual labels only. Canonical QW capability/skill/evidence authority lives outside this stage.
  const questionWords = [
    { id:"what",      en:"What",      es:"Qué",          pt:"O que" },
    { id:"where",     en:"Where",     es:"Dónde",        pt:"Onde" },
    { id:"when",      en:"When",      es:"Cuándo",       pt:"Quando" },
    { id:"who",       en:"Who",       es:"Quién",        pt:"Quem" },
    { id:"which",     en:"Which",     es:"Cuál",         pt:"Qual" },
    { id:"why",       en:"Why",       es:"Por qué",      pt:"Por quê" },
    { id:"how",       en:"How",       es:"Cómo",         pt:"Como" },
    { id:"how-much",  en:"How much",  es:"Cuánto",       pt:"Quanto" },
    { id:"how-many",  en:"How many",  es:"Cuántos",      pt:"Quantos" },
    { id:"whose",     en:"Whose",     es:"De quién",     pt:"De quem" },
    { id:"whom",      en:"Whom",      es:"A quién",      pt:"A quem" },
    { id:"how-long",  en:"How long",  es:"Cuánto tiempo",pt:"Quanto tempo" },
    { id:"how-far",   en:"How far",   es:"Qué tan lejos",pt:"Quão longe" },
    { id:"how-often", en:"How often", es:"Con qué frecuencia", pt:"Com que frequência" }
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
    if (mode === "solfege" || mode === "sound" || mode === "questions") return key.solfege;
    if (mode === "tripiano") return key.en + " · " + key.es + " · " + key.pt;
    return key[mode];
  }

  function refreshLabels() {
    keyboard.querySelectorAll(".piano-key").forEach(button => {
      const key = keys.find(item => item.id === button.dataset.note);
      if (key) button.querySelector(".key-word").textContent = currentLabel(key);
    });
  }

  function setMode(nextMode) {
    mode = nextMode;
    modeButtons.forEach(btn => btn.classList.toggle("is-active", btn.dataset.mode === mode));
    modeStatus.textContent = mode.toUpperCase();
    stage.dataset.theme = ["en","es","pt","questions"].includes(mode) ? mode : "sound";
    wordStatus.textContent =
      mode === "sound" ? "DÓ → DÓ↑" :
      mode === "solfege" ? "Solfege" :
      mode === "tripiano" ? "EN → ES → PT" :
      mode === "questions" ? "14 Question Words" :
      "Colors";
    refreshLabels();
  }

  function activateKey(button, key, source = "piano-flat", semantic = null) {
    playInstrument(source, key.frequency);

    window.dispatchEvent(new CustomEvent("siyayo:musical-event", {
      detail: {
        type: "note",
        source,
        note: key.id,
        solfege: key.solfege,
        mode,
        word: currentLabel(key),
        semantic,
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

  function createPianoKey(key) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "piano-key" + (key.kind === "black" ? " black-key" : "");
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
  }

  whiteKeys.forEach(createPianoKey);
  blackKeys.forEach(createPianoKey);

  modeButtons.forEach(button => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  const frondosa = document.getElementById("frondosa");
  const leaves = [...document.querySelectorAll(".leaf")];

  const questionWordPromptModels = Object.freeze({
    "what":      { gap:"thing / information", prompt:"What information is missing?" },
    "where":     { gap:"place", prompt:"Which place is missing?" },
    "when":      { gap:"time", prompt:"Which time is missing?" },
    "who":       { gap:"person", prompt:"Which person is missing?" },
    "which":     { gap:"delimited choice", prompt:"Which option must be chosen?" },
    "why":       { gap:"reason", prompt:"Which reason is missing?" },
    "how":       { gap:"manner / method", prompt:"Which manner or method is missing?" },
    "how-much":  { gap:"amount / price", prompt:"Which amount or price is missing?" },
    "how-many":  { gap:"countable quantity", prompt:"Which countable quantity is missing?" },
    "whose":     { gap:"possession", prompt:"Whose possession is missing?" },
    "whom":      { gap:"object-person", prompt:"Which object-person relation is missing?" },
    "how-long":  { gap:"duration / length", prompt:"Which duration or length is missing?" },
    "how-far":   { gap:"distance", prompt:"Which distance is missing?" },
    "how-often": { gap:"frequency", prompt:"Which frequency is missing?" }
  });

  let semanticSequenceTimer = null;
  let activeQuestionWord = null;

  function resetSemanticSequence() {
    if (!semanticSequence) return;
    activeQuestionWord = null;
    semanticSequence.dataset.phase = "idle";
    if (semanticPhase) semanticPhase.textContent = "READY";
    if (semanticCue) semanticCue.textContent = "Touch a Question Word leaf";
    if (semanticAnswer) semanticAnswer.textContent = "Question → WAIT → learner response";
    if (learnerResponseForm) learnerResponseForm.hidden = true;
    if (learnerResponseInput) learnerResponseInput.value = "";
  }

  function runSemanticSequence(qw) {
    if (!semanticSequence || !qw) return;
    activeQuestionWord = qw;
    const model = questionWordPromptModels[qw.id] || { gap:"information", prompt:"Which information is missing?" };

    if (semanticSequenceTimer) {
      window.clearTimeout(semanticSequenceTimer);
      semanticSequenceTimer = null;
    }

    semanticSequence.dataset.phase = "question";
    if (semanticPhase) semanticPhase.textContent = "QUESTION";
    if (semanticCue) semanticCue.textContent = qw.en.toUpperCase() + " · " + model.prompt;
    if (semanticAnswer) semanticAnswer.textContent = "Information gap: " + model.gap;

    // Speech role: question-word + prompt. WAIT itself remains intentionally silent.
    window.setTimeout(() => {
      speak(qw.en + ". " + model.prompt, "en-US");
    }, 120);

    semanticSequenceTimer = window.setTimeout(() => {
      semanticSequence.dataset.phase = "wait";
      if (semanticPhase) semanticPhase.textContent = "WAIT";
      if (semanticCue) semanticCue.textContent = "Learner action is still required";
      if (semanticAnswer) semanticAnswer.textContent = "No evidence yet";

      semanticSequenceTimer = window.setTimeout(() => {
        semanticSequence.dataset.phase = "response";
        if (semanticPhase) semanticPhase.textContent = "RESPONSE";
        if (semanticCue) semanticCue.textContent = qw.en + " remains the active opportunity";
        if (semanticAnswer) semanticAnswer.textContent = "Awaiting an explicit learner response";
        if (learnerResponseForm) learnerResponseForm.hidden = false;
        if (learnerResponseInput) learnerResponseInput.focus();
      }, 850);
    }, 700);
  }

  function questionWordForLeaf(leaf) {
    return questionWords.find(item => item.id === leaf.dataset.qw);
  }

  function leafLabelForMode(leaf) {
    const qw = questionWordForLeaf(leaf);
    if (!qw) return "";
    if (mode === "es") return qw.es;
    if (mode === "pt") return qw.pt;
    if (mode === "tripiano") return qw.en + " · " + qw.es + " · " + qw.pt;
    return qw.en;
  }

  function refreshFrondosaLabels() {
    leaves.forEach(leaf => {
      const label = leaf.querySelector("span");
      if (label) label.textContent = leafLabelForMode(leaf);
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
    const semanticQuestionWord =
      detail.semantic &&
      detail.semantic.kind === "question-word" &&
      detail.semantic.id
        ? detail.semantic.id
        : null;

    const matchingLeaves = semanticQuestionWord
      ? leaves.filter(item => item.dataset.qw === semanticQuestionWord)
      : mode === "questions"
        ? []
        : leaves.filter(item => item.dataset.note === detail.note);

    if (matchingLeaves.length) {
      matchingLeaves.forEach(leaf => {
        leaf.classList.remove("is-resonating");
        void leaf.offsetWidth;
        leaf.classList.add("is-resonating");
      });

      if (frondosa) frondosa.classList.add("is-resonating");

      window.setTimeout(() => {
        matchingLeaves.forEach(leaf => leaf.classList.remove("is-resonating"));
        if (frondosa) frondosa.classList.remove("is-resonating");
      }, 660);
    }

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

  leaves.forEach(leaf => {
    leaf.addEventListener("click", () => {
      const key = keys.find(item => item.id === leaf.dataset.note);
      const qw = questionWordForLeaf(leaf);
      if (!key || !qw) return;

      const semanticIdentity = {
        kind: "question-word",
        id: qw.id,
        evidence: "none"
      };

      const pianoKey = keyboard.querySelector('[data-note="' + key.id + '"]');
      if (pianoKey) activateKey(pianoKey, key, "frondosa", semanticIdentity);

      window.dispatchEvent(new CustomEvent("siyayo:semantic-event", {
        detail: {
          type: "question-word-opportunity",
          source: "frondosa",
          questionWordId: qw.id,
          mode,
          evidence: "none"
        }
      }));

      if (mode === "questions") {
        runSemanticSequence(qw);
      }
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

  if (learnerResponseForm) {
    learnerResponseForm.addEventListener("submit", event => {
      event.preventDefault();
      const responseText = learnerResponseInput ? learnerResponseInput.value.trim() : "";
      if (!responseText || !activeQuestionWord) return;

      window.dispatchEvent(new CustomEvent("siyayo:learner-action-event", {
        detail: {
          type: "response-submitted",
          source: "frondosa-semantic-lab",
          questionWordId: activeQuestionWord.id,
          responseText,
          evaluated: false,
          evidenceProduced: false
        }
      }));

      semanticSequence.dataset.phase = "observed";
      if (semanticPhase) semanticPhase.textContent = "OBSERVED";
      if (semanticCue) semanticCue.textContent = "Learner response received";
      if (semanticAnswer) semanticAnswer.textContent = "Not evaluated yet • no GREEN • no Evidence";
      learnerResponseForm.hidden = true;
    });
  }

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

  resetSemanticSequence();
  updatePianinhoSequenceStatus();
  refreshLabels();
  refreshFrondosaLabels();
})();
