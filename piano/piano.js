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
  const waitArchetypeIndicator = document.getElementById("waitArchetypeIndicator");
  const waitFace = document.getElementById("waitFace");
  const waitCopy = document.getElementById("waitCopy");
  const learnerWaitButtons = [...document.querySelectorAll("[data-wait-request]")];
  const microSupportActions = document.getElementById("microSupportActions");
  const microSupportButtons = [...document.querySelectorAll("[data-support-action]")];
  const canonicalNavigationOpportunity = document.getElementById("canonicalNavigationOpportunity");
  const canonicalNavigationCopy = document.getElementById("canonicalNavigationCopy");
  const canonicalNavigationButton = document.getElementById("canonicalNavigationButton");
  const semanticCadenceButton = document.getElementById("semanticCadenceButton");

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

  const semanticCadenceExample = Object.freeze({
    id: "which-cheese-should-we-choose",
    language: "en",
    locale: "en-US",
    evidence: "none",
    cells: [
      { note:"C4", speech:"Which" },
      { note:"E4", speech:"cheese" },
      { note:"G4", speech:"should we" },
      { note:"C5", speech:"choose?" }
    ]
  });

  let semanticCadenceRunning = false;

  function pulseCadenceActors(noteId) {
    const pianoKey = keyboard.querySelector('[data-note="' + noteId + '"]');
    const avatarZone = pianinhoHotspots.find(item => item.dataset.note === noteId);

    if (pianoKey) {
      pianoKey.classList.remove("is-cadence-pulse");
      void pianoKey.offsetWidth;
      pianoKey.classList.add("is-cadence-pulse");
      window.setTimeout(() => pianoKey.classList.remove("is-cadence-pulse"), 520);
    }

    if (avatarZone) {
      avatarZone.classList.remove("is-cadence-pulse");
      void avatarZone.offsetWidth;
      avatarZone.classList.add("is-cadence-pulse");
      window.setTimeout(() => avatarZone.classList.remove("is-cadence-pulse"), 520);
    }

    if (frondosa) {
      frondosa.classList.remove("is-semantic-cadence");
      void frondosa.offsetWidth;
      frondosa.classList.add("is-semantic-cadence");
      window.setTimeout(() => frondosa.classList.remove("is-semantic-cadence"), 540);
    }
  }

  function runSemanticCadence(definition = semanticCadenceExample) {
    if (semanticCadenceRunning || !definition || !Array.isArray(definition.cells)) return;
    semanticCadenceRunning = true;
    if (semanticCadenceButton) semanticCadenceButton.disabled = true;

    let index = 0;
    const waitMs = 220;

    function finish() {
      semanticCadenceRunning = false;
      if (semanticCadenceButton) semanticCadenceButton.disabled = false;
      if (noteStatus) noteStatus.textContent = "DÓ → MI → SOL → DÓ↑";
      if (wordStatus) wordStatus.textContent = "Which cheese should we choose?";

      window.dispatchEvent(new CustomEvent("siyayo:semantic-cadence-complete", {
        detail: {
          type: "semantic-musical-cadence-complete",
          source: "trio-actors",
          cadenceId: definition.id,
          language: definition.language,
          cells: definition.cells.map(cell => ({ ...cell })),
          evaluated: false,
          evidenceProduced: false
        }
      }));
    }

    function nextCell() {
      if (index >= definition.cells.length) {
        finish();
        return;
      }

      const cell = definition.cells[index];
      const key = keys.find(item => item.id === cell.note);
      if (!key) {
        index += 1;
        window.setTimeout(nextCell, waitMs);
        return;
      }

      // Piano Plano = grounded voice; Pianinho = octave-bright companion.
      playPianoLow(key.frequency);
      playPianinhoHigh(key.frequency, 0.035);
      pulseCadenceActors(key.id);

      if (noteStatus) noteStatus.textContent = key.solfege + " · " + key.id;
      if (wordStatus) wordStatus.textContent = cell.speech;

      window.dispatchEvent(new CustomEvent("siyayo:semantic-cadence-cell", {
        detail: {
          type: "semantic-musical-cadence-cell",
          source: "trio-actors",
          cadenceId: definition.id,
          index,
          note: key.id,
          speech: cell.speech,
          language: definition.language,
          evaluated: false,
          evidenceProduced: false
        }
      }));

      if (!("speechSynthesis" in window)) {
        index += 1;
        window.setTimeout(nextCell, 520 + waitMs);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cell.speech);
      utterance.lang = definition.locale || "en-US";
      utterance.rate = 0.84;
      utterance.onend = () => {
        index += 1;
        window.setTimeout(nextCell, waitMs);
      };
      utterance.onerror = () => {
        index += 1;
        window.setTimeout(nextCell, waitMs);
      };
      window.speechSynthesis.speak(utterance);
    }

    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    nextCell();
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

  if (semanticCadenceButton) {
    semanticCadenceButton.addEventListener("click", () => {
      runSemanticCadence(semanticCadenceExample);
    });
  }

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
  let activeWaitArchetype = null;
  let activeSupportTrace = [];
  let activeCanonicalNavigation = null;

  const waitArchetypes = Object.freeze({
    "thinking": {
      face: "🤔",
      copy: "PERAÍ… thinking",
      className: "wait-thinking"
    },
    "confused": {
      face: "😕",
      copy: "Hmm… clarification may be needed",
      className: "wait-confused"
    },
    "insufficient-context": {
      face: "🧩",
      copy: "Context gap • more information is needed",
      className: "wait-context-gap"
    }
  });

  function clearWaitArchetype() {
    activeWaitArchetype = null;
    Object.values(waitArchetypes).forEach(item => {
      if (pianinho) pianinho.classList.remove(item.className);
      if (frondosa) frondosa.classList.remove(item.className);
    });
    if (waitArchetypeIndicator) waitArchetypeIndicator.hidden = true;
  }

  function setWaitArchetype(nextState, source = "frondosa-semantic-lab") {
    const config = waitArchetypes[nextState];
    if (!config) return;

    clearWaitArchetype();
    activeWaitArchetype = nextState;

    if (pianinho) pianinho.classList.add(config.className);
    if (frondosa) frondosa.classList.add(config.className);

    if (waitFace) waitFace.textContent = config.face;
    if (waitCopy) waitCopy.textContent = config.copy;
    if (waitArchetypeIndicator) waitArchetypeIndicator.hidden = false;

    window.dispatchEvent(new CustomEvent("siyayo:wait-state-event", {
      detail: {
        type: "wait-archetype-state",
        state: nextState,
        source,
        questionWordId: activeQuestionWord ? activeQuestionWord.id : null,
        evaluated: false,
        evidenceProduced: false
      }
    }));
  }

  window.addEventListener("siyayo:set-wait-state", event => {
    const requestedState = event.detail && event.detail.state;
    setWaitArchetype(requestedState, (event.detail && event.detail.source) || "external-request");
  });

  function resetSemanticSequence() {
    if (!semanticSequence) return;
    activeQuestionWord = null;
    activeSupportTrace = [];
    clearWaitArchetype();
    semanticSequence.dataset.phase = "idle";
    if (semanticPhase) semanticPhase.textContent = "READY";
    if (semanticCue) semanticCue.textContent = "Touch a Question Word leaf";
    if (semanticAnswer) semanticAnswer.textContent = "Question → WAIT → learner response";
    if (learnerResponseForm) learnerResponseForm.hidden = true;
    if (learnerResponseInput) learnerResponseInput.value = "";
    if (microSupportActions) microSupportActions.hidden = true;
  }

  function runSemanticSequence(qw) {
    if (!semanticSequence || !qw) return;
    activeQuestionWord = qw;
    activeSupportTrace = [];
    clearCanonicalRouteResonance();
    clearCanonicalNavigationOpportunity();
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
      setWaitArchetype("thinking");
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

  learnerWaitButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (!activeQuestionWord) return;

      const requestedState = button.dataset.waitRequest;
      setWaitArchetype(requestedState, "learner-declared");

      semanticSequence.dataset.phase = "wait";
      if (semanticPhase) semanticPhase.textContent = "WAIT";
      if (semanticCue) semanticCue.textContent =
        requestedState === "thinking" ? "Learner requested more time" :
        requestedState === "confused" ? "Learner requested clarification" :
        "Learner reports missing context";
      if (semanticAnswer) semanticAnswer.textContent = "Explicit learner action • not evaluated • no Evidence";

      if (microSupportActions) {
        microSupportActions.hidden = requestedState === "thinking";
      }

      window.dispatchEvent(new CustomEvent("siyayo:support-opportunity-event", {
        detail: {
          type: "support-opportunity",
          source: "frondosa-semantic-lab",
          questionWordId: activeQuestionWord.id,
          reason: requestedState,
          actions: requestedState === "thinking"
            ? []
            : ["repeat-question","hear-qw","show-gap"],
          evaluated: false,
          evidenceProduced: false
        }
      }));

      window.dispatchEvent(new CustomEvent("siyayo:learner-action-event", {
        detail: {
          type: "wait-requested",
          source: "frondosa-semantic-lab",
          questionWordId: activeQuestionWord.id,
          waitState: requestedState,
          evaluated: false,
          evidenceProduced: false
        }
      }));
    });
  });

  microSupportButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (!activeQuestionWord) return;

      const action = button.dataset.supportAction;
      const model = questionWordPromptModels[activeQuestionWord.id] || {
        gap: "information",
        prompt: "Which information is missing?"
      };

      if (action === "repeat-question") {
        speak(activeQuestionWord.en + ". " + model.prompt, "en-US");
        if (semanticCue) semanticCue.textContent = activeQuestionWord.en.toUpperCase() + " · " + model.prompt;
      } else if (action === "hear-qw") {
        speak(activeQuestionWord.en, "en-US");
        if (semanticCue) semanticCue.textContent = activeQuestionWord.en.toUpperCase();
      } else if (action === "show-gap") {
        if (semanticAnswer) semanticAnswer.textContent = "Information gap: " + model.gap;
      }

      activeSupportTrace.push({
        action,
        source: "frondosa-semantic-lab"
      });

      window.dispatchEvent(new CustomEvent("siyayo:support-action-event", {
        detail: {
          type: "support-action-used",
          source: "frondosa-semantic-lab",
          questionWordId: activeQuestionWord.id,
          action,
          supportTrace: activeSupportTrace.map(item => ({ ...item })),
          evaluated: false,
          evidenceProduced: false
        }
      }));
    });
  });

  if (learnerResponseForm) {
    learnerResponseForm.addEventListener("submit", event => {
      event.preventDefault();
      const responseText = learnerResponseInput ? learnerResponseInput.value.trim() : "";
      if (!responseText || !activeQuestionWord) return;

      const learnerEvent = {
        observed: true,
        actor: "learner",
        relevantToWait: true,
        intent: "answer",
        type: "learner-response"
      };

      window.dispatchEvent(new CustomEvent("siyayo:learner-action-event", {
        detail: {
          type: "response-submitted",
          source: "frondosa-semantic-lab",
          questionWordId: activeQuestionWord.id,
          responseText,
          learnerEvent,
          supportTrace: activeSupportTrace.map(item => ({ ...item })),
          supportUsed: activeSupportTrace.length > 0,
          evaluated: false,
          evidenceProduced: false
        }
      }));

      clearWaitArchetype();
      semanticSequence.dataset.supportUsed = activeSupportTrace.length > 0 ? "true" : "false";
      semanticSequence.dataset.phase = "observed";
      if (semanticPhase) semanticPhase.textContent = "OBSERVED";
      if (semanticCue) semanticCue.textContent = "Learner response received";
      if (semanticAnswer) semanticAnswer.textContent = "Not evaluated yet • no GREEN • no Evidence";
      learnerResponseForm.hidden = true;

      if (pianinho) {
        pianinho.classList.remove("is-neutral-feedback");
        void pianinho.offsetWidth;
        pianinho.classList.add("is-neutral-feedback");
      }
      if (frondosa) {
        frondosa.classList.remove("is-neutral-feedback");
        void frondosa.offsetWidth;
        frondosa.classList.add("is-neutral-feedback");
      }

      window.dispatchEvent(new CustomEvent("siyayo:feedback-event", {
        detail: {
          type: "neutral-acknowledgement",
          source: "frondosa-semantic-lab",
          questionWordId: activeQuestionWord.id,
          evaluated: false,
          evidenceProduced: false,
          green: false
        }
      }));

      window.setTimeout(() => {
        speak("Response received.", "en-US");
      }, 140);

      window.setTimeout(() => {
        if (pianinho) pianinho.classList.remove("is-neutral-feedback");
        if (frondosa) frondosa.classList.remove("is-neutral-feedback");
      }, 700);

      window.setTimeout(() => {
        if (!activeQuestionWord) return;

        if (pianinho) pianinho.classList.add("is-external-evaluation");
        if (frondosa) frondosa.classList.add("is-external-evaluation");

        semanticSequence.dataset.phase = "external-evaluation";
        if (semanticPhase) semanticPhase.textContent = "EXTERNAL EVALUATION";
        if (semanticCue) semanticCue.textContent = "Canonical evaluator requested";
        if (semanticAnswer) semanticAnswer.textContent = "Awaiting external authority • no local judgement";

        window.dispatchEvent(new CustomEvent("siyayo:external-evaluation-request", {
          detail: {
            type: "learner-response-evaluation-request",
            source: "frondosa-semantic-lab",
            questionWordId: activeQuestionWord.id,
            responseText,
            learnerEvent,
            support: {
              used: activeSupportTrace.length > 0,
              actions: activeSupportTrace.map(item => item.action),
              provenance: activeSupportTrace.map(item => ({ ...item })),
              canonicalSupportValue: null
            },
            semantic: {
              kind: "question-word",
              id: activeQuestionWord.id
            },
            localEvaluation: false,
            evidenceProduced: false,
            green: false
          }
        }));
      }, 760);
    });
  }

  function clearCanonicalResultResonance() {
    if (semanticSequence) delete semanticSequence.dataset.canonicalState;
    ["canonical-wait","canonical-eligible","canonical-resume"].forEach(className => {
      if (pianinho) pianinho.classList.remove(className);
      if (frondosa) frondosa.classList.remove(className);
    });
  }

  function clearCanonicalNavigationOpportunity() {
    activeCanonicalNavigation = null;
    if (canonicalNavigationOpportunity) canonicalNavigationOpportunity.hidden = true;
    if (canonicalNavigationButton) canonicalNavigationButton.disabled = false;
  }

  function clearCanonicalRouteResonance() {
    leaves.forEach(leaf => leaf.classList.remove("is-canonical-resonance"));
  }

  function projectCanonicalRouteResonance(routeInspection = null) {
    clearCanonicalRouteResonance();
    const resonance = routeInspection && routeInspection.resonance;
    const matched = resonance && resonance.matched;
    const questionWords = matched && Array.isArray(matched.questionWords)
      ? matched.questionWords
      : [];

    if (!resonance || resonance.status !== "matched" || questionWords.length === 0) return;

    const normalized = new Set(questionWords.map(value => String(value).trim().toLowerCase()));
    leaves.forEach(leaf => {
      if (normalized.has(String(leaf.dataset.qw || "").toLowerCase())) {
        leaf.classList.add("is-canonical-resonance");
      }
    });

    window.dispatchEvent(new CustomEvent("siyayo:canonical-resonance-presented", {
      detail: {
        source: "piano-stage",
        status: resonance.status,
        score: Number.isFinite(resonance.score) ? resonance.score : null,
        questionWords: [...normalized],
        languagePatterns: matched && Array.isArray(matched.languagePatterns)
          ? [...matched.languagePatterns]
          : []
      }
    }));
  }

  function presentCanonicalResult(detail = {}) {
    clearCanonicalResultResonance();
    projectCanonicalRouteResonance(detail.routeInspection || null);

    const contractStatus = detail.contractEvaluation && detail.contractEvaluation.status;
    const recommendation = detail.recommendation || {};
    const routeInspection = detail.routeInspection || null;
    const waitClassification = detail.waitClassification || null;
    const resumeEvaluation = detail.resumeEvaluation || null;
    const resumeStatus = resumeEvaluation && resumeEvaluation.resumeEligibility
      ? resumeEvaluation.resumeEligibility.status
      : null;

    let state = "neutral";
    let phase = "EXTERNAL RESULT";
    let cue = detail.label || "Canonical result received";
    let answer = detail.message || "Presented from external authority";

    if (contractStatus === "WAITING_FOR_EVIDENCE") {
      state = "waiting";
      phase = "CANONICAL WAIT";
      cue = "More grounded learner evidence is required";
      answer = recommendation.reason || "continue-assessment";
      if (pianinho) pianinho.classList.add("canonical-wait");
      if (frondosa) frondosa.classList.add("canonical-wait");
    } else if (contractStatus === "GREEN_PASS") {
      state = "eligible";
      phase = "GREEN ELIGIBLE";
      cue = "Pass Contract satisfied";
      answer = recommendation.reason || "Awaiting canonical route authority";
      if (pianinho) pianinho.classList.add("canonical-eligible");
      if (frondosa) frondosa.classList.add("canonical-eligible");
    }

    if (waitClassification && waitClassification.state === "OPPORTUNITY_FOUND_AWAITING_EVENT") {
      state = "waiting";
      phase = "CANONICAL WAIT";
      cue = "Opportunity found • learner movement still awaited";
      answer = waitClassification.cause || answer;
      if (pianinho) pianinho.classList.add("canonical-wait");
      if (frondosa) frondosa.classList.add("canonical-wait");
    }

    if (resumeStatus === "RESUME_ELIGIBLE") {
      state = "resume";
      phase = "RESUME ELIGIBLE";
      cue = "Learner agency authorizes resume";
      answer = "Runtime dispatch remains external";
      if (pianinho) pianinho.classList.add("canonical-resume");
      if (frondosa) frondosa.classList.add("canonical-resume");
    }

    if (semanticSequence) {
      semanticSequence.dataset.phase = "observed";
      semanticSequence.dataset.canonicalState = state;
    }
    if (semanticPhase) semanticPhase.textContent = phase;
    if (semanticCue) semanticCue.textContent = cue;
    if (semanticAnswer) semanticAnswer.textContent = answer;

    const advanceSelection = detail.advanceSelection || null;
    const resumeContext = resumeEvaluation && resumeEvaluation.resumeContext
      ? resumeEvaluation.resumeContext
      : null;

    if (advanceSelection && advanceSelection.status === "selected" && advanceSelection.experienceId) {
      activeCanonicalNavigation = {
        kind: "advance",
        experienceId: advanceSelection.experienceId,
        fromExperience: advanceSelection.fromExperience || null,
        entryVerb: advanceSelection.entryVerb || null
      };
      if (canonicalNavigationCopy) canonicalNavigationCopy.textContent =
        "Canonical next Experience available: " + advanceSelection.experienceId;
      if (canonicalNavigationOpportunity) canonicalNavigationOpportunity.hidden = false;
    } else if (resumeStatus === "RESUME_ELIGIBLE" && resumeContext && resumeContext.status === "RESUME_CONTEXT_ELIGIBLE") {
      const snapshot = resumeContext.snapshot || {};
      activeCanonicalNavigation = {
        kind: "resume",
        experienceId: snapshot.currentExperienceId || null,
        resumeContext
      };
      if (canonicalNavigationCopy) canonicalNavigationCopy.textContent =
        "Canonical resume available" + (activeCanonicalNavigation.experienceId ? ": " + activeCanonicalNavigation.experienceId : "");
      if (canonicalNavigationOpportunity) canonicalNavigationOpportunity.hidden = false;
    } else {
      clearCanonicalNavigationOpportunity();
    }

    window.dispatchEvent(new CustomEvent("siyayo:canonical-result-presented", {
      detail: {
        source: "piano-stage",
        questionWordId: activeQuestionWord ? activeQuestionWord.id : null,
        canonicalState: state,
        contractStatus: contractStatus || null,
        waitState: waitClassification ? waitClassification.state || null : null,
        resumeStatus
      }
    }));
  }

  window.addEventListener("siyayo:external-evaluation-complete", event => {
    const detail = event.detail || {};
    if (detail.source !== "canonical-adaptive-authority") return;

    if (pianinho) pianinho.classList.remove("is-external-evaluation");
    if (frondosa) frondosa.classList.remove("is-external-evaluation");

    presentCanonicalResult(detail);
  });

  if (canonicalNavigationButton) {
    canonicalNavigationButton.addEventListener("click", () => {
      if (!activeCanonicalNavigation) return;

      canonicalNavigationButton.disabled = true;

      window.dispatchEvent(new CustomEvent("siyayo:canonical-navigation-request", {
        detail: {
          type: "learner-confirmed-canonical-navigation",
          source: "piano-stage",
          navigation: { ...activeCanonicalNavigation },
          learnerConfirmed: true,
          localRouting: false
        }
      }));

      if (semanticPhase) semanticPhase.textContent = "NAVIGATION REQUEST";
      if (semanticCue) semanticCue.textContent = "Learner confirmed canonical continuation";
      if (semanticAnswer) semanticAnswer.textContent = "Awaiting external runtime dispatch";
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
