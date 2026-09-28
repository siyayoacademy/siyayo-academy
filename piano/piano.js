(() => {
  "use strict";

  const stage = document.getElementById("pianoStage");
  const keyboard = document.getElementById("keyboard");
  const noteStatus = document.getElementById("noteStatus");
  const wordStatus = document.getElementById("wordStatus");
  const modeStatus = document.getElementById("modeStatus");
  const modeButtons = [...document.querySelectorAll(".mode-button")];
  const collectionButtons = [...document.querySelectorAll(".collection-button")];
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
  const learnerSubmitButton = learnerResponseForm
    ? learnerResponseForm.querySelector('button[type="submit"]')
    : null;

  const keys = [
    { id:"C4",  frequency:261.63, solfege:"DÓ",  en:"green",  es:"verde",    pt:"verde",    kind:"white" },
    { id:"C#4", frequency:277.18, solfege:"DÓ♯", solfegeSharp:"DÓ♯", solfegeFlat:"RÉ♭", speechSharp:"Dó sustenido", speechFlat:"Ré bemol", en:"sharp", es:"sostenido",pt:"sustenido",kind:"black" },
    { id:"D4",  frequency:293.66, solfege:"RÉ",  en:"blue",   es:"azul",     pt:"azul",     kind:"white" },
    { id:"D#4", frequency:311.13, solfege:"RÉ♯", solfegeSharp:"RÉ♯", solfegeFlat:"MI♭", speechSharp:"Ré sustenido", speechFlat:"Mi bemol", en:"sharp", es:"sostenido",pt:"sustenido",kind:"black" },
    { id:"E4",  frequency:329.63, solfege:"MI",  en:"white",  es:"blanco",   pt:"branco",   kind:"white" },
    { id:"F4",  frequency:349.23, solfege:"FÁ",  en:"yellow", es:"amarillo", pt:"amarelo",  kind:"white" },
    { id:"F#4", frequency:369.99, solfege:"FÁ♯", solfegeSharp:"FÁ♯", solfegeFlat:"SOL♭", speechSharp:"Fá sustenido", speechFlat:"Sol bemol", en:"sharp", es:"sostenido",pt:"sustenido",kind:"black" },
    { id:"G4",  frequency:392.00, solfege:"SOL", en:"brown",  es:"marrón",   pt:"marrom",   kind:"white" },
    { id:"G#4", frequency:415.30, solfege:"SOL♯",solfegeSharp:"SOL♯",solfegeFlat:"LÁ♭", speechSharp:"Sol sustenido", speechFlat:"Lá bemol", en:"sharp", es:"sostenido",pt:"sustenido",kind:"black" },
    { id:"A4",  frequency:440.00, solfege:"LÁ",  en:"red",    es:"rojo",     pt:"vermelho", kind:"white" },
    { id:"A#4", frequency:466.16, solfege:"LÁ♯", solfegeSharp:"LÁ♯", solfegeFlat:"SI♭", speechSharp:"Lá sustenido", speechFlat:"Si bemol", en:"sharp", es:"sostenido",pt:"sustenido",kind:"black" },
    { id:"B4",  frequency:493.88, solfege:"SI",  en:"gold",   es:"dorado",   pt:"dourado",  kind:"white" },
    { id:"C5",  frequency:523.25, solfege:"DÓ↑", en:"black",  es:"negro",    pt:"preto",    kind:"white" }
  ];

  const whiteKeys = keys.filter(key => key.kind === "white");
  const blackKeys = keys.filter(key => key.kind === "black");

  // Perceptual labels only. Canonical QW capability/skill/evidence authority lives outside this stage.
  const contentCollectionEngine = window.SIYAYOContentCollectionEngine || null;

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

  const nounItems = [
      {
          "id": "cheese",
          "en": "Cheese",
          "es": "Queso",
          "pt": "Queijo"
      },
      {
          "id": "bread",
          "en": "Bread",
          "es": "Pan",
          "pt": "Pão"
      },
      {
          "id": "market",
          "en": "Market",
          "es": "Mercado",
          "pt": "Mercado"
      },
      {
          "id": "hotel",
          "en": "Hotel",
          "es": "Hotel",
          "pt": "Hotel"
      },
      {
          "id": "airport",
          "en": "Airport",
          "es": "Aeropuerto",
          "pt": "Aeroporto"
      },
      {
          "id": "book",
          "en": "Book",
          "es": "Libro",
          "pt": "Livro"
      },
      {
          "id": "teacher",
          "en": "Teacher",
          "es": "Profesor",
          "pt": "Professor"
      },
      {
          "id": "student",
          "en": "Student",
          "es": "Estudiante",
          "pt": "Estudante"
      },
      {
          "id": "music",
          "en": "Music",
          "es": "Música",
          "pt": "Música"
      },
      {
          "id": "tree",
          "en": "Tree",
          "es": "Árbol",
          "pt": "Árvore"
      },
      {
          "id": "dinner",
          "en": "Dinner",
          "es": "Cena",
          "pt": "Jantar"
      },
      {
          "id": "water",
          "en": "Water",
          "es": "Agua",
          "pt": "Água"
      },
      {
          "id": "city",
          "en": "City",
          "es": "Ciudad",
          "pt": "Cidade"
      },
      {
          "id": "friend",
          "en": "Friend",
          "es": "Amigo",
          "pt": "Amigo"
      }
  ];
  let activeCollectionId = "question-words";

  if (contentCollectionEngine) {
    contentCollectionEngine.register({
      id: "question-words",
      label: "Question Words",
      status: "active-prototype",
      items: questionWords.map(item => ({ ...item }))
    });
    contentCollectionEngine.register({
      id: "nouns",
      label: "Nouns",
      status: "visual-prototype",
      items: nounItems.map(item => ({ ...item }))
    });
    contentCollectionEngine.activate("question-words", "piano-stage-bootstrap");
  }

  window.addEventListener("siyayo:activate-content-collection", event => {
    if (!contentCollectionEngine) return;
    const detail = event.detail || {};
    contentCollectionEngine.activate(detail.id, detail.source || "external-experience");
  });

  let mode = "sound";
  let pedagogicalLanguage = "en";
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

  let enharmonicMode = "auto";

  function pitchIdentityForKey(key) {
    if (!key || key.kind !== "black") {
      return {
        physicalNote: key ? key.id : null,
        display: key ? key.solfege : "",
        sharp: null,
        flat: null,
        selected: key ? key.solfege : ""
      };
    }

    const selected =
      enharmonicMode === "flat" ? key.solfegeFlat :
      enharmonicMode === "sharp" ? key.solfegeSharp :
      null;

    return {
      physicalNote: key.id,
      display: selected || (key.solfegeSharp + " / " + key.solfegeFlat),
      sharp: key.solfegeSharp,
      flat: key.solfegeFlat,
      selected,
      mode: enharmonicMode
    };
  }

  function solfegeSpeechForKey(key) {
    if (!key || key.kind !== "black") return key ? key.solfege.replace("↑", "") : "";
    if (enharmonicMode === "flat") return key.speechFlat;
    // auto/contextual remains non-authoritative until an Experience supplies function.
    return key.speechSharp;
  }

  function currentLabel(key) {
    if (mode === "solfege") return pitchIdentityForKey(key).display;
    if (mode === "sound" || mode === "questions") return key.solfege;
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
    const isLanguage = ["en","es","pt"].includes(nextMode);

    // In 14 Questions the language is an independent lens: switching EN/ES/PT
    // keeps the pedagogical activity active instead of leaving Questions mode.
    if (mode === "questions" && isLanguage && activeCollectionId === "question-words") {
      pedagogicalLanguage = nextMode;
      modeButtons.forEach(btn => {
        const isActive = btn.dataset.mode === "questions" || btn.dataset.mode === pedagogicalLanguage;
        btn.classList.toggle("is-active", isActive);
      });
      stage.dataset.theme = pedagogicalLanguage;
      refreshLabels();
      refreshFrondosaLabels();
      localizeQuestionFlowSurface();
      return;
    }

    if (isLanguage) pedagogicalLanguage = nextMode;
    mode = nextMode;

    modeButtons.forEach(btn => {
      const isActive = mode === "questions"
        ? btn.dataset.mode === "questions" || btn.dataset.mode === pedagogicalLanguage
        : btn.dataset.mode === mode;
      btn.classList.toggle("is-active", isActive);
    });

    modeStatus.textContent = mode === "questions"
      ? "QUESTIONS · " + pedagogicalLanguage.toUpperCase()
      : mode.toUpperCase();

    stage.dataset.theme = mode === "questions"
      ? pedagogicalLanguage
      : ["en","es","pt"].includes(mode) ? mode : "sound";

    wordStatus.textContent =
      mode === "sound" ? "DÓ → DÓ↑" :
      mode === "solfege" ? "Solfege" :
      mode === "tripiano" ? "EN → ES → PT" :
      mode === "questions" ? "14 Question Words · " + pedagogicalLanguage.toUpperCase() :
      "Colors";
    refreshLabels();
    refreshFrondosaLabels();
    if (mode === "questions") localizeQuestionFlowSurface();
  }

  function activateKey(button, key, source = "piano-flat", semantic = null, suppressSpeech = false) {
    playInstrument(source, key.frequency);

    window.dispatchEvent(new CustomEvent("siyayo:musical-event", {
      detail: {
        type: "note",
        source,
        note: key.id,
        solfege: key.solfege,
        pitch: pitchIdentityForKey(key),
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

    const pitchIdentity = pitchIdentityForKey(key);
    noteStatus.textContent = (key.kind === "black" ? pitchIdentity.display : key.solfege) + " · " + key.id;
    wordStatus.textContent = currentLabel(key);

    if (!suppressSpeech) {
      if (mode === "solfege") speak(solfegeSpeechForKey(key), "pt-BR");
      if (mode === "en") speak(key.en, "en-US");
      if (mode === "es") speak(key.es, "es-ES");
      if (mode === "pt") speak(key.pt, "pt-BR");
      if (mode === "tripiano") speakTripiano(key);
    }
  }

  function createPianoKey(key) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "piano-key" + (key.kind === "black" ? " black-key" : "");
    button.dataset.note = key.id;
    const pitchIdentity = pitchIdentityForKey(key);
    button.setAttribute("aria-label", (key.kind === "black" ? pitchIdentity.display : key.solfege) + " " + key.id);
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

  collectionButtons.forEach(button => {
    button.addEventListener("click", () => setActiveCollection(button.dataset.collection));
  });

  if (semanticCadenceButton) {
    semanticCadenceButton.addEventListener("click", () => {
      runSemanticCadence(semanticCadenceExample);
    });
  }

  const frondosa = document.getElementById("frondosa");
  const leaves = [...document.querySelectorAll(".leaf")];

  const questionWordPromptModels = Object.freeze({
    "what": {
      en:{ gap:"thing / information", prompt:"What information is missing?" },
      es:{ gap:"cosa / información", prompt:"¿Qué información falta?" },
      pt:{ gap:"coisa / informação", prompt:"Que informação está faltando?" }
    },
    "where": {
      en:{ gap:"place", prompt:"Which place is missing?" },
      es:{ gap:"lugar", prompt:"¿Qué lugar falta?" },
      pt:{ gap:"lugar", prompt:"Que lugar está faltando?" }
    },
    "when": {
      en:{ gap:"time", prompt:"Which time is missing?" },
      es:{ gap:"momento / tiempo", prompt:"¿Qué momento falta?" },
      pt:{ gap:"momento / tempo", prompt:"Que momento está faltando?" }
    },
    "who": {
      en:{ gap:"person", prompt:"Which person is missing?" },
      es:{ gap:"persona", prompt:"¿Qué persona falta?" },
      pt:{ gap:"pessoa", prompt:"Qual pessoa está faltando?" }
    },
    "which": {
      en:{ gap:"delimited choice", prompt:"Which option must be chosen?" },
      es:{ gap:"elección delimitada", prompt:"¿Qué opción debe elegirse?" },
      pt:{ gap:"escolha delimitada", prompt:"Qual opção deve ser escolhida?" }
    },
    "why": {
      en:{ gap:"reason", prompt:"Which reason is missing?" },
      es:{ gap:"razón", prompt:"¿Qué razón falta?" },
      pt:{ gap:"razão", prompt:"Qual razão está faltando?" }
    },
    "how": {
      en:{ gap:"manner / method", prompt:"Which manner or method is missing?" },
      es:{ gap:"manera / método", prompt:"¿Qué manera o método falta?" },
      pt:{ gap:"maneira / método", prompt:"Que maneira ou método está faltando?" }
    },
    "how-much": {
      en:{ gap:"amount / price", prompt:"Which amount or price is missing?" },
      es:{ gap:"cantidad / precio", prompt:"¿Qué cantidad o precio falta?" },
      pt:{ gap:"quantidade / preço", prompt:"Que quantidade ou preço está faltando?" }
    },
    "how-many": {
      en:{ gap:"countable quantity", prompt:"Which countable quantity is missing?" },
      es:{ gap:"cantidad contable", prompt:"¿Qué cantidad contable falta?" },
      pt:{ gap:"quantidade contável", prompt:"Que quantidade contável está faltando?" }
    },
    "whose": {
      en:{ gap:"possession", prompt:"Whose possession is missing?" },
      es:{ gap:"posesión", prompt:"¿Qué relación de posesión falta identificar?" },
      pt:{ gap:"posse", prompt:"Que relação de posse falta identificar?" }
    },
    "whom": {
      en:{ gap:"object-person", prompt:"Which object-person relation is missing?" },
      es:{ gap:"persona como objeto", prompt:"¿Qué persona como objeto falta identificar?" },
      pt:{ gap:"pessoa como objeto", prompt:"Que pessoa como objeto precisa ser identificada?" }
    },
    "how-long": {
      en:{ gap:"duration / length", prompt:"Which duration or length is missing?" },
      es:{ gap:"duración / longitud", prompt:"¿Qué duración o longitud falta?" },
      pt:{ gap:"duração / comprimento", prompt:"Que duração ou comprimento está faltando?" }
    },
    "how-far": {
      en:{ gap:"distance", prompt:"Which distance is missing?" },
      es:{ gap:"distancia", prompt:"¿Qué distancia falta?" },
      pt:{ gap:"distância", prompt:"Que distância está faltando?" }
    },
    "how-often": {
      en:{ gap:"frequency", prompt:"Which frequency is missing?" },
      es:{ gap:"frecuencia", prompt:"¿Qué frecuencia falta?" },
      pt:{ gap:"frequência", prompt:"Que frequência está faltando?" }
    }
  });

  const questionFlowCopy = Object.freeze({
    en: {
      locale:"en-US",
      ready:"READY",
      readyCue:"Touch a Question Word leaf",
      readyAnswer:"Question → WAIT → learner response",
      question:"QUESTION",
      gapPrefix:"Information gap: ",
      wait:"WAIT",
      waitCue:"Learner action is still required",
      noEvidence:"No evidence yet",
      response:"RESPONSE",
      remains:" remains the active opportunity",
      awaitingResponse:"Awaiting an explicit learner response",
      waitThinking:"HOLD ON… thinking",
      waitConfused:"Hmm… clarification may be needed",
      waitContext:"Context gap • more information is needed",
      moreTime:"Need more time",
      clarification:"Need clarification",
      missingContext:"Context is missing",
      repeatQuestion:"Repeat question",
      hearQw:"Hear QW again",
      showGap:"Show information gap",
      placeholder:"Type your response…",
      submit:"Submit response",
      requestedTime:"Learner requested more time",
      requestedClarification:"Learner requested clarification",
      reportedContext:"Learner reports missing context",
      explicitAction:"Explicit learner action • not evaluated • no Evidence",
      observed:"OBSERVED",
      responseReceived:"Learner response received",
      notEvaluated:"Not evaluated yet • no GREEN • no Evidence",
      responseSpeech:"Response received.",
      externalPhase:"EXTERNAL EVALUATION",
      externalCue:"Canonical evaluator requested",
      externalAnswer:"Awaiting external authority • no local judgement"
    },
    es: {
      locale:"es-ES",
      ready:"LISTO",
      readyCue:"Toca una hoja de palabra interrogativa",
      readyAnswer:"Pregunta → WAIT → respuesta del estudiante",
      question:"PREGUNTA",
      gapPrefix:"Información faltante: ",
      wait:"WAIT",
      waitCue:"Todavía se requiere una acción del estudiante",
      noEvidence:"Aún no hay evidencia",
      response:"RESPUESTA",
      remains:" sigue siendo la oportunidad activa",
      awaitingResponse:"Esperando una respuesta explícita del estudiante",
      waitThinking:"ESPERA… pensando",
      waitConfused:"Hmm… puede ser necesaria una aclaración",
      waitContext:"Falta contexto • se necesita más información",
      moreTime:"Necesito más tiempo",
      clarification:"Necesito aclaración",
      missingContext:"Falta contexto",
      repeatQuestion:"Repetir pregunta",
      hearQw:"Oír la palabra interrogativa otra vez",
      showGap:"Mostrar información faltante",
      placeholder:"Escribe tu respuesta…",
      submit:"Enviar respuesta",
      requestedTime:"El estudiante pidió más tiempo",
      requestedClarification:"El estudiante pidió una aclaración",
      reportedContext:"El estudiante informa que falta contexto",
      explicitAction:"Acción explícita del estudiante • no evaluada • sin Evidence",
      observed:"OBSERVADO",
      responseReceived:"Respuesta del estudiante recibida",
      notEvaluated:"Aún no evaluado • sin GREEN • sin Evidence",
      responseSpeech:"Respuesta recibida.",
      externalPhase:"EVALUACIÓN EXTERNA",
      externalCue:"Evaluador canónico solicitado",
      externalAnswer:"Esperando autoridad externa • sin juicio local"
    },
    pt: {
      locale:"pt-BR",
      ready:"PRONTO",
      readyCue:"Toque uma folha de palavra interrogativa",
      readyAnswer:"Pergunta → WAIT → resposta do aluno",
      question:"PERGUNTA",
      gapPrefix:"Informação faltante: ",
      wait:"WAIT",
      waitCue:"Ainda é necessária uma ação do aluno",
      noEvidence:"Ainda não há evidência",
      response:"RESPOSTA",
      remains:" continua sendo a oportunidade ativa",
      awaitingResponse:"Aguardando uma resposta explícita do aluno",
      waitThinking:"PERAÍ… pensando",
      waitConfused:"Hmm… pode ser necessário um esclarecimento",
      waitContext:"Falta contexto • é necessária mais informação",
      moreTime:"Preciso de mais tempo",
      clarification:"Preciso de esclarecimento",
      missingContext:"Falta contexto",
      repeatQuestion:"Repetir pergunta",
      hearQw:"Ouvir a palavra interrogativa novamente",
      showGap:"Mostrar informação faltante",
      placeholder:"Digite sua resposta…",
      submit:"Enviar resposta",
      requestedTime:"O aluno pediu mais tempo",
      requestedClarification:"O aluno pediu esclarecimento",
      reportedContext:"O aluno informa que falta contexto",
      explicitAction:"Ação explícita do aluno • não avaliada • sem Evidence",
      observed:"OBSERVADO",
      responseReceived:"Resposta do aluno recebida",
      notEvaluated:"Ainda não avaliado • sem GREEN • sem Evidence",
      responseSpeech:"Resposta recebida.",
      externalPhase:"AVALIAÇÃO EXTERNA",
      externalCue:"Avaliador canônico solicitado",
      externalAnswer:"Aguardando autoridade externa • sem julgamento local"
    }
  });

  function currentQuestionCopy() {
    return questionFlowCopy[pedagogicalLanguage] || questionFlowCopy.en;
  }

  function currentQuestionModel(qw) {
    const family = questionWordPromptModels[qw && qw.id];
    return family && family[pedagogicalLanguage]
      ? family[pedagogicalLanguage]
      : { gap:"information", prompt:"Which information is missing?" };
  }

  function currentQuestionWordLabel(qw) {
    return qw && (qw[pedagogicalLanguage] || qw.en) || "";
  }

  function localizeQuestionFlowSurface() {
    const copy = currentQuestionCopy();
    if (learnerResponseInput) {
      learnerResponseInput.placeholder = copy.placeholder;
      learnerResponseInput.setAttribute("aria-label", copy.placeholder);
    }
    if (learnerSubmitButton) learnerSubmitButton.textContent = copy.submit;
    learnerWaitButtons.forEach(button => {
      const state = button.dataset.waitRequest;
      button.textContent =
        state === "thinking" ? copy.moreTime :
        state === "confused" ? copy.clarification :
        copy.missingContext;
    });
    microSupportButtons.forEach(button => {
      const action = button.dataset.supportAction;
      button.textContent =
        action === "repeat-question" ? copy.repeatQuestion :
        action === "hear-qw" ? copy.hearQw :
        copy.showGap;
    });

    if (!activeQuestionWord && semanticSequence) {
      semanticPhase.textContent = copy.ready;
      semanticCue.textContent = copy.readyCue;
      semanticAnswer.textContent = copy.readyAnswer;
    }

    if (activeWaitArchetype) setWaitArchetype(activeWaitArchetype, "language-lens-change");
  }

  let semanticSequenceTimer = null;
  let activeQuestionWord = null;
  let activeWaitArchetype = null;
  let activeSupportTrace = [];
  let activeCanonicalNavigation = null;

  const waitArchetypes = Object.freeze({
    "thinking": { face:"🤔", copyKey:"waitThinking", className:"wait-thinking" },
    "confused": { face:"😕", copyKey:"waitConfused", className:"wait-confused" },
    "insufficient-context": { face:"🧩", copyKey:"waitContext", className:"wait-context-gap" }
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
    if (waitCopy) waitCopy.textContent = currentQuestionCopy()[config.copyKey];
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
    const copy = currentQuestionCopy();
    activeQuestionWord = null;
    activeSupportTrace = [];
    clearWaitArchetype();
    semanticSequence.dataset.phase = "idle";
    if (semanticPhase) semanticPhase.textContent = copy.ready;
    if (semanticCue) semanticCue.textContent = copy.readyCue;
    if (semanticAnswer) semanticAnswer.textContent = copy.readyAnswer;
    if (learnerResponseForm) learnerResponseForm.hidden = true;
    if (learnerResponseInput) learnerResponseInput.value = "";
    if (microSupportActions) microSupportActions.hidden = true;
    localizeQuestionFlowSurface();
  }

  function runSemanticSequence(qw) {
    if (!semanticSequence || !qw) return;
    activeQuestionWord = qw;
    activeSupportTrace = [];
    clearCanonicalRouteResonance();
    clearCanonicalNavigationOpportunity();

    const copy = currentQuestionCopy();
    const model = currentQuestionModel(qw);
    const qwLabel = currentQuestionWordLabel(qw);

    if (semanticSequenceTimer) {
      window.clearTimeout(semanticSequenceTimer);
      semanticSequenceTimer = null;
    }

    semanticSequence.dataset.phase = "question";
    if (semanticPhase) semanticPhase.textContent = copy.question;
    if (semanticCue) semanticCue.textContent = qwLabel.toUpperCase() + " · " + model.prompt;
    if (semanticAnswer) semanticAnswer.textContent = copy.gapPrefix + model.gap;

    // Speech follows the selected pedagogical language. WAIT remains silent.
    window.setTimeout(() => {
      speak(qwLabel + ". " + model.prompt, copy.locale);
    }, 120);

    semanticSequenceTimer = window.setTimeout(() => {
      semanticSequence.dataset.phase = "wait";
      setWaitArchetype("thinking");
      if (semanticPhase) semanticPhase.textContent = copy.wait;
      if (semanticCue) semanticCue.textContent = copy.waitCue;
      if (semanticAnswer) semanticAnswer.textContent = copy.noEvidence;

      semanticSequenceTimer = window.setTimeout(() => {
        semanticSequence.dataset.phase = "response";
        if (semanticPhase) semanticPhase.textContent = copy.response;
        if (semanticCue) semanticCue.textContent = qwLabel + copy.remains;
        if (semanticAnswer) semanticAnswer.textContent = copy.awaitingResponse;
        if (learnerResponseForm) learnerResponseForm.hidden = false;
        if (learnerResponseInput) learnerResponseInput.focus();
      }, 850);
    }, 700);
  }

  function questionWordForLeaf(leaf) {
    return questionWords.find(item => item.id === leaf.dataset.qw);
  }

  function nounForLeaf(leaf) {
    const index = leaves.indexOf(leaf);
    return index >= 0 ? nounItems[index] || null : null;
  }

  function activeContentItemForLeaf(leaf) {
    return activeCollectionId === "nouns" ? nounForLeaf(leaf) : questionWordForLeaf(leaf);
  }

  function contentLabelForMode(item) {
    if (!item) return "";
    if (mode === "questions") return item[pedagogicalLanguage] || item.en;
    if (mode === "es") return item.es;
    if (mode === "pt") return item.pt;
    if (mode === "tripiano") return item.en + " · " + item.es + " · " + item.pt;
    return item.en;
  }

  function leafLabelForMode(leaf) {
    return contentLabelForMode(activeContentItemForLeaf(leaf));
  }

  function refreshFrondosaLabels() {
    leaves.forEach(leaf => {
      const label = leaf.querySelector("span");
      if (label) label.textContent = leafLabelForMode(leaf);
    });
  }

  function speakContentItem(item) {
    if (!item) return;
    if (mode === "es") speak(item.es, "es-ES");
    else if (mode === "pt") speak(item.pt, "pt-BR");
    else if (mode === "tripiano") {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      [
        [item.en, "en-US"],
        [item.es, "es-ES"],
        [item.pt, "pt-BR"]
      ].forEach(([text, lang]) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = 0.86;
        window.speechSynthesis.speak(u);
      });
    } else {
      speak(item.en, "en-US");
    }
  }

  function setActiveCollection(nextId) {
    if (!["question-words","nouns"].includes(nextId)) return;
    activeCollectionId = nextId;
    if (contentCollectionEngine) {
      contentCollectionEngine.activate(nextId, "piano-stage-collection-control");
    }

    collectionButtons.forEach(button => {
      button.classList.toggle("is-active", button.dataset.collection === activeCollectionId);
    });

    const questionsButton = modeButtons.find(button => button.dataset.mode === "questions");
    if (questionsButton) questionsButton.disabled = activeCollectionId !== "question-words";

    if (activeCollectionId === "nouns" && mode === "questions") {
      setMode("en");
    }

    if (semanticSequence) semanticSequence.dataset.phase = "idle";
    if (semanticPhase) semanticPhase.textContent = activeCollectionId === "nouns" ? "NOUNS" : "READY";
    if (semanticCue) semanticCue.textContent = activeCollectionId === "nouns"
      ? "Touch a noun leaf"
      : "Touch a Question Word leaf";
    if (semanticAnswer) semanticAnswer.textContent = activeCollectionId === "nouns"
      ? "Explore collection • no evaluation"
      : "Question → WAIT → learner response";
    if (learnerResponseForm) learnerResponseForm.hidden = true;
    clearWaitArchetype();
    refreshFrondosaLabels();

    window.dispatchEvent(new CustomEvent("siyayo:content-surface-presented", {
      detail: {
        collectionId: activeCollectionId,
        source: "frondosa",
        evaluated: false,
        evidenceProduced: false
      }
    }));
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
    localizeQuestionFlowSurface();
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

    const semanticContentItem =
      detail.semantic &&
      detail.semantic.kind === "content-item" &&
      detail.semantic.collectionId &&
      detail.semantic.id
        ? {
            collectionId: detail.semantic.collectionId,
            id: detail.semantic.id
          }
        : null;

    const matchingLeaves = semanticQuestionWord
      ? leaves.filter(item => item.dataset.qw === semanticQuestionWord)
      : semanticContentItem && semanticContentItem.collectionId === "nouns"
        ? leaves.filter(item => {
            const noun = nounForLeaf(item);
            return noun && noun.id === semanticContentItem.id;
          })
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
    } else {
      const playedKey = keys.find(item => item.id === detail.note);
      if (playedKey && playedKey.kind === "black") {
        // Chromatic notes are musical identities, not Question Word leaves.
        // The actors therefore answer globally instead of inventing semantic hotspots.
        [pianinho, frondosa].forEach(actor => {
          if (!actor) return;
          actor.classList.remove("is-chromatic-resonance");
          void actor.offsetWidth;
          actor.classList.add("is-chromatic-resonance");
        });

        window.dispatchEvent(new CustomEvent("siyayo:chromatic-resonance", {
          detail: {
            type: "chromatic-note-resonance",
            source: detail.source || "unknown",
            note: playedKey.id,
            pitch: pitchIdentityForKey(playedKey),
            semanticActivation: false,
            evaluated: false,
            evidenceProduced: false
          }
        }));

        window.setTimeout(() => {
          if (pianinho) pianinho.classList.remove("is-chromatic-resonance");
          if (frondosa) frondosa.classList.remove("is-chromatic-resonance");
        }, 720);
      }
    }
  });

  leaves.forEach(leaf => {
    leaf.addEventListener("click", () => {
      const key = keys.find(item => item.id === leaf.dataset.note);
      const qw = questionWordForLeaf(leaf);
      const contentItem = activeContentItemForLeaf(leaf);
      if (!key || !contentItem) return;

      if (activeCollectionId === "nouns") {
        const pianoKey = keyboard.querySelector('[data-note="' + key.id + '"]');
        if (pianoKey) activateKey(pianoKey, key, "frondosa", {
          kind: "content-item",
          collectionId: "nouns",
          id: contentItem.id,
          evidence: "none"
        }, mode !== "solfege");

        if (mode !== "solfege") speakContentItem(contentItem);
        if (semanticSequence) semanticSequence.dataset.phase = "observed";
        if (semanticPhase) semanticPhase.textContent = "NOUN";
        if (semanticCue) semanticCue.textContent = contentLabelForMode(contentItem);
        if (semanticAnswer) semanticAnswer.textContent = "Collection item explored • no evaluation";

        window.dispatchEvent(new CustomEvent("siyayo:content-item-event", {
          detail: {
            type: "content-item-explored",
            source: "frondosa",
            collectionId: "nouns",
            itemId: contentItem.id,
            mode,
            evaluated: false,
            evidenceProduced: false
          }
        }));
        return;
      }

      if (!qw) return;
      const semanticIdentity = {
        kind: "question-word",
        id: qw.id,
        evidence: "none"
      };

      const pianoKey = keyboard.querySelector('[data-note="' + key.id + '"]');
      if (pianoKey) activateKey(
        pianoKey,
        key,
        "frondosa",
        semanticIdentity,
        mode !== "solfege"
      );

      if (mode !== "questions" && mode !== "solfege") {
        speakContentItem(qw);
      }

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

  window.addEventListener("siyayo:set-enharmonic-mode", event => {
    const requested = event.detail && event.detail.mode;
    if (!["sharp","flat","auto","contextual"].includes(requested)) return;
    enharmonicMode = requested === "contextual" ? "auto" : requested;
    refreshLabels();

    window.dispatchEvent(new CustomEvent("siyayo:enharmonic-mode-changed", {
      detail: {
        mode: requested,
        effectiveMode: enharmonicMode,
        authority: requested === "contextual" ? "experience-required" : "local-presentation"
      }
    }));
  });

  learnerWaitButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (!activeQuestionWord) return;

      const requestedState = button.dataset.waitRequest;
      setWaitArchetype(requestedState, "learner-declared");

      const copy = currentQuestionCopy();
      semanticSequence.dataset.phase = "wait";
      if (semanticPhase) semanticPhase.textContent = copy.wait;
      if (semanticCue) semanticCue.textContent =
        requestedState === "thinking" ? copy.requestedTime :
        requestedState === "confused" ? copy.requestedClarification :
        copy.reportedContext;
      if (semanticAnswer) semanticAnswer.textContent = copy.explicitAction;

      if (microSupportActions) {
        microSupportActions.hidden = requestedState === "thinking";
      }

      window.dispatchEvent(new CustomEvent("siyayo:support-opportunity-event", {
        detail: {
          type: "support-opportunity",
          source: "frondosa-semantic-lab",
          questionWordId: activeQuestionWord.id,
          language: pedagogicalLanguage,
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
          language: pedagogicalLanguage,
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
      const copy = currentQuestionCopy();
      const model = currentQuestionModel(activeQuestionWord);
      const qwLabel = currentQuestionWordLabel(activeQuestionWord);

      if (action === "repeat-question") {
        speak(qwLabel + ". " + model.prompt, copy.locale);
        if (semanticCue) semanticCue.textContent = qwLabel.toUpperCase() + " · " + model.prompt;
      } else if (action === "hear-qw") {
        speak(qwLabel, copy.locale);
        if (semanticCue) semanticCue.textContent = qwLabel.toUpperCase();
      } else if (action === "show-gap") {
        if (semanticAnswer) semanticAnswer.textContent = copy.gapPrefix + model.gap;
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
          language: pedagogicalLanguage,
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
          language: pedagogicalLanguage,
          responseText,
          learnerEvent,
          supportTrace: activeSupportTrace.map(item => ({ ...item })),
          supportUsed: activeSupportTrace.length > 0,
          evaluated: false,
          evidenceProduced: false
        }
      }));

      const copy = currentQuestionCopy();
      clearWaitArchetype();
      semanticSequence.dataset.supportUsed = activeSupportTrace.length > 0 ? "true" : "false";
      semanticSequence.dataset.phase = "observed";
      if (semanticPhase) semanticPhase.textContent = copy.observed;
      if (semanticCue) semanticCue.textContent = copy.responseReceived;
      if (semanticAnswer) semanticAnswer.textContent = copy.notEvaluated;
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
        speak(copy.responseSpeech, copy.locale);
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
        if (semanticPhase) semanticPhase.textContent = copy.externalPhase;
        if (semanticCue) semanticCue.textContent = copy.externalCue;
        if (semanticAnswer) semanticAnswer.textContent = copy.externalAnswer;

        window.dispatchEvent(new CustomEvent("siyayo:external-evaluation-request", {
          detail: {
            type: "learner-response-evaluation-request",
            source: "frondosa-semantic-lab",
            questionWordId: activeQuestionWord.id,
            language: pedagogicalLanguage,
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
