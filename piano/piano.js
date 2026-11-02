(() => {
  "use strict";

  const stage = document.getElementById("pianoStage");
  const keyboard = document.getElementById("keyboard");
  const noteStatus = document.getElementById("noteStatus");
  const wordStatus = document.getElementById("wordStatus");
  const modeStatus = document.getElementById("modeStatus");
  const modeButtons = [...document.querySelectorAll(".mode-button")];
  const activityButtons = [...document.querySelectorAll(".activity-button")];
  const contentGroupPanel = document.getElementById("contentGroupPanel");
  const contentGroupButtons = [...document.querySelectorAll(".content-group-button")];
  const collectionButtons = [...document.querySelectorAll(".collection-button")];
  const nounLayerPanel = document.getElementById("nounLayerPanel");
  const nounLayerButtons = [...document.querySelectorAll(".noun-layer-button")];
  const nounClassifyPanel = document.getElementById("nounClassifyPanel");
  const nounClassifyLabel = document.getElementById("nounClassifyLabel");
  const nounClassifyWord = document.getElementById("nounClassifyWord");
  const nounClassificationButtons = [...document.querySelectorAll("[data-noun-classification]")];
  const nounClassifyReveal = document.getElementById("nounClassifyReveal");
  const nounClassifyNext = document.getElementById("nounClassifyNext");
  const nounClassifyChoiceState = document.getElementById("nounClassifyChoiceState");
  const nounClassifySourceState = document.getElementById("nounClassifySourceState");
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
  const contextSupportPanel = document.getElementById("contextSupportPanel");
  const contextSupportTitle = document.getElementById("contextSupportTitle");
  const contextSupportText = document.getElementById("contextSupportText");
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

  const nounCollections = Object.freeze({
    concrete: {
      id: "concrete",
      labels: { en:"Concrete", es:"Concreto", pt:"Concreto" },
      example: {
        en:"The cat sleeps on the sofa.",
        es:"El gato duerme en el sofá.",
        pt:"O gato dorme no sofá."
      },
      items: [
        { id:"teacher", en:"teacher", es:"profesor", pt:"professor" },
        { id:"cat", en:"cat", es:"gato", pt:"gato" },
        { id:"book", en:"book", es:"libro", pt:"livro" },
        { id:"hotel", en:"hotel", es:"hotel", pt:"hotel" }
      ]
    },
    abstract: {
      id: "abstract",
      labels: { en:"Abstract", es:"Abstracto", pt:"Abstrato" },
      example: {
        en:"Love can change the world.",
        es:"El amor puede cambiar el mundo.",
        pt:"O amor pode mudar o mundo."
      },
      items: [
        { id:"love", en:"love", es:"amor", pt:"amor" },
        { id:"happiness", en:"happiness", es:"felicidad", pt:"felicidade" },
        { id:"freedom", en:"freedom", es:"libertad", pt:"liberdade" },
        { id:"decision", en:"decision", es:"decisión", pt:"decisão" },
        { id:"idea", en:"idea", es:"idea", pt:"ideia" }
      ]
    },
    proper: {
      id: "proper",
      labels: { en:"Proper", es:"Propio", pt:"Próprio" },
      example: {
        en:"London is a beautiful city.",
        es:"Londres es una ciudad hermosa.",
        pt:"Londres é uma cidade linda."
      },
      items: [
        { id:"susan", en:"Susan", es:"Susan", pt:"Susan" },
        { id:"paul", en:"Paul", es:"Paul", pt:"Paul" },
        { id:"london", en:"London", es:"Londres", pt:"Londres" },
        { id:"brazil", en:"Brazil", es:"Brasil", pt:"Brasil" }
      ]
    }
  });
  const verbActionItems = Object.freeze([
    {
        "id": "work",
        "en": "work",
        "es": "trabajo",
        "pt": "trabalho",
        "examples": {
            "en": "I work every day.",
            "es": "Yo trabajo todos los días.",
            "pt": "Eu trabalho todos os dias."
        },
        "morphology": {
            "language": "en",
            "lemma": "work",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "works",
                "past": "worked",
                "pastParticiple": "worked",
                "gerund": "working"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "work",
                "es": "trabajar",
                "pt": "trabalhar"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "study",
        "en": "study",
        "es": "estudio",
        "pt": "estudo",
        "examples": {
            "en": "I study English every day.",
            "es": "Yo estudio inglés todos los días.",
            "pt": "Eu estudo inglês todos os dias."
        },
        "morphology": {
            "language": "en",
            "lemma": "study",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "studies",
                "past": "studied",
                "pastParticiple": "studied",
                "gerund": "studying"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "study",
                "es": "estudiar",
                "pt": "estudar"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "play",
        "en": "play",
        "es": "juegan",
        "pt": "brincam",
        "examples": {
            "en": "The children play in the park.",
            "es": "Los niños juegan en el parque.",
            "pt": "As crianças brincam no parque."
        },
        "morphology": {
            "language": "en",
            "lemma": "play",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "plays",
                "past": "played",
                "pastParticiple": "played",
                "gerund": "playing"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "play",
                "es": "jugar",
                "pt": "jogar"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "walk",
        "en": "walk",
        "es": "Caminamos",
        "pt": "Caminhamos",
        "examples": {
            "en": "We walk to school.",
            "es": "Caminamos a la escuela.",
            "pt": "Caminhamos até a escola."
        },
        "morphology": {
            "language": "en",
            "lemma": "walk",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "walks",
                "past": "walked",
                "pastParticiple": "walked",
                "gerund": "walking"
            },
            "verbFunction": [
                "movement",
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "walk",
                "es": "caminar",
                "pt": "caminhar"
            },
            "verbFunction": [
                "movement",
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "talk",
        "en": "talk",
        "es": "hablan",
        "pt": "conversam",
        "examples": {
            "en": "They talk every morning.",
            "es": "Ellos hablan todas las mañanas.",
            "pt": "Eles conversam todas as manhãs."
        },
        "morphology": {
            "language": "en",
            "lemma": "talk",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "talks",
                "past": "talked",
                "pastParticiple": "talked",
                "gerund": "talking"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "talk",
                "es": "hablar",
                "pt": "falar"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "eat",
        "en": "eat",
        "es": "Desayunamos",
        "pt": "Tomamos",
        "examples": {
            "en": "We eat breakfast together.",
            "es": "Desayunamos juntos.",
            "pt": "Tomamos café da manhã juntos."
        },
        "morphology": {
            "language": "en",
            "lemma": "eat",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "eats",
                "past": "ate",
                "pastParticiple": "eaten",
                "gerund": "eating"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "eat",
                "es": "comer",
                "pt": "comer"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "drink",
        "en": "drinks",
        "es": "bebe",
        "pt": "bebe",
        "examples": {
            "en": "She drinks water in the morning.",
            "es": "Ella bebe agua por la mañana.",
            "pt": "Ela bebe água pela manhã."
        },
        "morphology": {
            "language": "en",
            "lemma": "drink",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "drinks",
                "past": "drank",
                "pastParticiple": "drunk",
                "gerund": "drinking"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "drink",
                "es": "beber",
                "pt": "beber"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "sleep",
        "en": "sleeps",
        "es": "duerme",
        "pt": "dorme",
        "examples": {
            "en": "The baby sleeps at night.",
            "es": "El bebé duerme por la noche.",
            "pt": "O bebê dorme à noite."
        },
        "morphology": {
            "language": "en",
            "lemma": "sleep",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "sleeps",
                "past": "slept",
                "pastParticiple": "slept",
                "gerund": "sleeping"
            },
            "verbFunction": [
                "state",
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "sleep",
                "es": "dormir",
                "pt": "dormir"
            },
            "verbFunction": [
                "state",
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "wake",
        "en": "wake",
        "es": "despierto",
        "pt": "acordo",
        "examples": {
            "en": "I wake up early.",
            "es": "Me despierto temprano.",
            "pt": "Eu acordo cedo."
        },
        "morphology": {
            "language": "en",
            "lemma": "wake",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "wakes",
                "past": "woke",
                "pastParticiple": "woken",
                "gerund": "waking"
            },
            "verbFunction": [
                "state",
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "wake",
                "es": "despertar",
                "pt": "acordar"
            },
            "verbFunction": [
                "state",
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "read",
        "en": "reads",
        "es": "lee",
        "pt": "lê",
        "examples": {
            "en": "She reads a book every night.",
            "es": "Ella lee un libro todas las noches.",
            "pt": "Ela lê um livro todas as noites."
        },
        "morphology": {
            "language": "en",
            "lemma": "read",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "reads",
                "past": "read",
                "pastParticiple": "read",
                "gerund": "reading"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "read",
                "es": "leer",
                "pt": "ler"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "write",
        "en": "writes",
        "es": "escribe",
        "pt": "escreve",
        "examples": {
            "en": "He writes a message.",
            "es": "Él escribe un mensaje.",
            "pt": "Ele escreve uma mensagem."
        },
        "morphology": {
            "language": "en",
            "lemma": "write",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "writes",
                "past": "wrote",
                "pastParticiple": "written",
                "gerund": "writing"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "write",
                "es": "escribir",
                "pt": "escrever"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "listen",
        "en": "listen",
        "es": "Escuchamos",
        "pt": "Escutamos",
        "examples": {
            "en": "We listen to music.",
            "es": "Escuchamos música.",
            "pt": "Escutamos música."
        },
        "morphology": {
            "language": "en",
            "lemma": "listen",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "listens",
                "past": "listened",
                "pastParticiple": "listened",
                "gerund": "listening"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "listen",
                "es": "escuchar",
                "pt": "escutar"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "speak",
        "en": "speak",
        "es": "hablan",
        "pt": "falam",
        "examples": {
            "en": "They speak three languages.",
            "es": "Ellos hablan tres idiomas.",
            "pt": "Eles falam três idiomas."
        },
        "morphology": {
            "language": "en",
            "lemma": "speak",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "speaks",
                "past": "spoke",
                "pastParticiple": "spoken",
                "gerund": "speaking"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "speak",
                "es": "hablar",
                "pt": "falar"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "go",
        "en": "go",
        "es": "Voy",
        "pt": "vou",
        "examples": {
            "en": "I go to work by bus.",
            "es": "Voy al trabajo en autobús.",
            "pt": "Eu vou ao trabalho de ônibus."
        },
        "morphology": {
            "language": "en",
            "lemma": "go",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "goes",
                "past": "went",
                "pastParticiple": "gone",
                "gerund": "going"
            },
            "verbFunction": [
                "movement",
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "go",
                "es": "ir",
                "pt": "ir"
            },
            "verbFunction": [
                "movement",
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "come",
        "en": "comes",
        "es": "viene",
        "pt": "vem",
        "examples": {
            "en": "She comes home in the evening.",
            "es": "Ella viene a casa por la tarde.",
            "pt": "Ela vem para casa à tarde."
        },
        "morphology": {
            "language": "en",
            "lemma": "come",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "comes",
                "past": "came",
                "pastParticiple": "come",
                "gerund": "coming"
            },
            "verbFunction": [
                "movement",
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "come",
                "es": "venir",
                "pt": "vir"
            },
            "verbFunction": [
                "movement",
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "run",
        "en": "runs",
        "es": "corre",
        "pt": "corre",
        "examples": {
            "en": "He runs in the park.",
            "es": "Él corre en el parque.",
            "pt": "Ele corre no parque."
        },
        "morphology": {
            "language": "en",
            "lemma": "run",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "runs",
                "past": "ran",
                "pastParticiple": "run",
                "gerund": "running"
            },
            "verbFunction": [
                "movement",
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "run",
                "es": "correr",
                "pt": "correr"
            },
            "verbFunction": [
                "movement",
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "buy",
        "en": "buy",
        "es": "Compramos",
        "pt": "Compramos",
        "examples": {
            "en": "We buy fresh fruit at the market.",
            "es": "Compramos fruta fresca en el mercado.",
            "pt": "Compramos frutas frescas no mercado."
        },
        "morphology": {
            "language": "en",
            "lemma": "buy",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "buys",
                "past": "bought",
                "pastParticiple": "bought",
                "gerund": "buying"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "buy",
                "es": "comprar",
                "pt": "comprar"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "choose",
        "en": "choose",
        "es": "Elegimos",
        "pt": "Escolhemos",
        "examples": {
            "en": "We choose the fresh cheese.",
            "es": "Elegimos el queso fresco.",
            "pt": "Escolhemos o queijo fresco."
        },
        "morphology": {
            "language": "en",
            "lemma": "choose",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "chooses",
                "past": "chose",
                "pastParticiple": "chosen",
                "gerund": "choosing"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "choose",
                "es": "elegir",
                "pt": "escolher"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "cook",
        "en": "cook",
        "es": "Cocino",
        "pt": "preparo",
        "examples": {
            "en": "I cook dinner at home.",
            "es": "Cocino la cena en casa.",
            "pt": "Eu preparo o jantar em casa."
        },
        "morphology": {
            "language": "en",
            "lemma": "cook",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "cooks",
                "past": "cooked",
                "pastParticiple": "cooked",
                "gerund": "cooking"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "cook",
                "es": "cocinar",
                "pt": "cozinhar"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "open",
        "en": "open",
        "es": "abre",
        "pt": "abra",
        "examples": {
            "en": "Please open the window.",
            "es": "Por favor, abre la ventana.",
            "pt": "Por favor, abra a janela."
        },
        "morphology": {
            "language": "en",
            "lemma": "open",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "opens",
                "past": "opened",
                "pastParticiple": "opened",
                "gerund": "opening"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "open",
                "es": "abrir",
                "pt": "abrir"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "close",
        "en": "close",
        "es": "cierra",
        "pt": "feche",
        "examples": {
            "en": "Please close the door.",
            "es": "Por favor, cierra la puerta.",
            "pt": "Por favor, feche a porta."
        },
        "morphology": {
            "language": "en",
            "lemma": "close",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "closes",
                "past": "closed",
                "pastParticiple": "closed",
                "gerund": "closing"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "close",
                "es": "cerrar",
                "pt": "fechar"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "find",
        "en": "find",
        "es": "Encontramos",
        "pt": "Encontramos",
        "examples": {
            "en": "We find the salmon at the fish counter.",
            "es": "Encontramos el salmón en la sección de pescado.",
            "pt": "Encontramos o salmão na seção de peixes."
        },
        "morphology": {
            "language": "en",
            "lemma": "find",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "finds",
                "past": "found",
                "pastParticiple": "found",
                "gerund": "finding"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "find",
                "es": "encontrar",
                "pt": "encontrar"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "need",
        "en": "need",
        "es": "Necesitamos",
        "pt": "Precisamos",
        "examples": {
            "en": "We need fresh vegetables for dinner.",
            "es": "Necesitamos verduras frescas para la cena.",
            "pt": "Precisamos de vegetais frescos para o jantar."
        },
        "morphology": {
            "language": "en",
            "lemma": "need",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "needs",
                "past": "needed",
                "pastParticiple": "needed",
                "gerund": "needing"
            },
            "verbFunction": [
                "state"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "need",
                "es": "necesitar",
                "pt": "precisar"
            },
            "verbFunction": [
                "state"
            ],
            "verbClass": []
        }
    },
    {
        "id": "serve",
        "en": "serve",
        "es": "Servimos",
        "pt": "Servimos",
        "examples": {
            "en": "We serve the strawberries fresh.",
            "es": "Servimos las fresas frescas.",
            "pt": "Servimos os morangos frescos."
        },
        "morphology": {
            "language": "en",
            "lemma": "serve",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "serves",
                "past": "served",
                "pastParticiple": "served",
                "gerund": "serving"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "serve",
                "es": "servir",
                "pt": "servir"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "arrive",
        "en": "arrive",
        "es": "Llegamos",
        "pt": "Chegamos",
        "examples": {
            "en": "We arrive at class in the morning.",
            "es": "Llegamos a clase por la mañana.",
            "pt": "Chegamos à aula pela manhã."
        },
        "morphology": {
            "language": "en",
            "lemma": "arrive",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "arrives",
                "past": "arrived",
                "pastParticiple": "arrived",
                "gerund": "arriving"
            },
            "verbFunction": [
                "movement",
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "arrive",
                "es": "llegar",
                "pt": "chegar"
            },
            "verbFunction": [
                "movement",
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "begin",
        "en": "begin",
        "es": "Empezamos",
        "pt": "Começamos",
        "examples": {
            "en": "We begin studying together.",
            "es": "Empezamos a estudiar juntos.",
            "pt": "Começamos a estudar juntos."
        },
        "morphology": {
            "language": "en",
            "lemma": "begin",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "begins",
                "past": "began",
                "pastParticiple": "begun",
                "gerund": "beginning"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "begin",
                "es": "empezar",
                "pt": "começar"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "understand",
        "en": "understand",
        "es": "Entendemos",
        "pt": "Entendemos",
        "examples": {
            "en": "We understand the lesson better together.",
            "es": "Entendemos mejor la lección juntos.",
            "pt": "Entendemos melhor a aula juntos."
        },
        "morphology": {
            "language": "en",
            "lemma": "understand",
            "regularity": "irregular",
            "forms": {
                "thirdPersonSingular": "understands",
                "past": "understood",
                "pastParticiple": "understood",
                "gerund": "understanding"
            },
            "verbFunction": [
                "state",
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "understand",
                "es": "entender",
                "pt": "entender"
            },
            "verbFunction": [
                "state",
                "action"
            ],
            "verbClass": []
        }
    },
    {
        "id": "share",
        "en": "share",
        "es": "Compartimos",
        "pt": "Compartilhamos",
        "examples": {
            "en": "We share a note with the class.",
            "es": "Compartimos un apunte con la clase.",
            "pt": "Compartilhamos uma anotação com a turma."
        },
        "morphology": {
            "language": "en",
            "lemma": "share",
            "regularity": "regular",
            "forms": {
                "thirdPersonSingular": "shares",
                "past": "shared",
                "pastParticiple": "shared",
                "gerund": "sharing"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        },
        "functionMeta": {
            "translations": {
                "en": "share",
                "es": "compartir",
                "pt": "compartilhar"
            },
            "verbFunction": [
                "action"
            ],
            "verbClass": []
        }
    }
]);
  const verbActionGroups = Object.freeze([
    Object.freeze(verbActionItems.slice(0,14)),
    Object.freeze(verbActionItems.slice(14,28))
  ]);
  let activeVerbGroup = 0;

  function currentVerbItems() {
    return verbActionGroups[activeVerbGroup] || verbActionGroups[0];
  }

  function refreshContentGroupControls() {
    const isGroupedCollection = activeCollectionId === "verbs";
    if (contentGroupPanel) contentGroupPanel.hidden = !isGroupedCollection;
    contentGroupButtons.forEach(button => {
      const index = Number(button.dataset.contentGroup);
      button.classList.toggle("is-active", index === activeVerbGroup);
      button.disabled = !isGroupedCollection;
    });
  }

  function setContentGroup(index) {
    const next = Number(index);
    if (!Number.isInteger(next) || !verbActionGroups[next]) return;
    activeVerbGroup = next;
    stage.dataset.verbGroup = String(activeVerbGroup + 1);
    clearVerbMorphologyFocus();
    clearVerbFunctionFocus();
    refreshContentGroupControls();
    refreshFrondosaLabels();

    if (semanticSequence) semanticSequence.dataset.phase = "idle";
    if (semanticPhase) semanticPhase.textContent =
      activeActivity === "morphology" ? "VERB · MORPHOLOGY · EN" :
      activeActivity === "function" ? "VERB · FUNCTION" :
      "VERBS · ACTIONS · GROUP " + (activeVerbGroup + 1);
    if (semanticCue) semanticCue.textContent =
      activeActivity === "morphology" ? "Touch a verb to inspect its English morphology" :
      activeActivity === "function" ? "Touch a verb to inspect its canonical function" :
      activeVerbGroup === 0 ? "Verb Actions 1–14" : "Verb Actions 15–28";
    if (semanticAnswer) semanticAnswer.textContent =
      activeActivity === "morphology" ? "English-only canonical regularity • no evaluation" :
      activeActivity === "function" ? "Canonical semantic function • overlaps allowed • no evaluation" :
      "Canonical trilingual action corpus • Explore";

    window.dispatchEvent(new CustomEvent("siyayo:content-group-changed", {
      detail:{
        collectionId:"verbs",
        groupIndex:activeVerbGroup,
        range:activeVerbGroup === 0 ? "1-14" : "15-28",
        evaluated:false,
        evidenceProduced:false
      }
    }));
  }
;

  let activeNounLayer = "concrete";

  function currentNounCollection() {
    return nounCollections[activeNounLayer] || nounCollections.concrete;
  }

  function currentNounItems() {
    return currentNounCollection().items;
  }

  const nounClassifyCopy = Object.freeze({
    en:{
      prompt:"Classify this noun",
      reveal:"Show source classification",
      next:"Next noun",
      received:"Choice received",
      yourChoice:"Your choice",
      spokenChoice:"Your choice",
      source:"Canonical source classification",
      spokenSource:"According to the source classification",
      noEvaluation:"Not evaluated • no GREEN • no Evidence"
    },
    es:{
      prompt:"Clasifica este sustantivo",
      reveal:"Mostrar clasificación de origen",
      next:"Siguiente sustantivo",
      received:"Elección recibida",
      yourChoice:"Tu elección",
      spokenChoice:"Tu elección",
      source:"Clasificación de origen canónica",
      spokenSource:"Según la clasificación de origen",
      noEvaluation:"No evaluado • sin GREEN • sin Evidence"
    },
    pt:{
      prompt:"Classifique este substantivo",
      reveal:"Mostrar classificação de origem",
      next:"Próximo substantivo",
      received:"Escolha recebida",
      yourChoice:"Sua escolha",
      spokenChoice:"Sua escolha",
      source:"Classificação de origem canônica",
      spokenSource:"Segundo a classificação de origem",
      noEvaluation:"Não avaliado • sem GREEN • sem Evidence"
    }
  });

  const nounClassifyDeck = Object.freeze([
    { ...nounCollections.concrete.items[0], classification:"concrete" },
    { ...nounCollections.abstract.items[0], classification:"abstract" },
    { ...nounCollections.proper.items[0], classification:"proper" },
    { ...nounCollections.concrete.items[1], classification:"concrete" },
    { ...nounCollections.abstract.items[1], classification:"abstract" },
    { ...nounCollections.proper.items[1], classification:"proper" },
    { ...nounCollections.concrete.items[2], classification:"concrete" },
    { ...nounCollections.abstract.items[2], classification:"abstract" },
    { ...nounCollections.proper.items[2], classification:"proper" },
    { ...nounCollections.concrete.items[3], classification:"concrete" },
    { ...nounCollections.abstract.items[3], classification:"abstract" },
    { ...nounCollections.proper.items[3], classification:"proper" }
  ]);
  let nounClassifyIndex = 0;
  let nounClassifyChoice = null;
  let nounClassifySourceRevealed = false;

  function nounClassifyLanguage() {
    return ["es","pt"].includes(mode) ? mode : "en";
  }

  function currentNounClassifyCopy() {
    return nounClassifyCopy[nounClassifyLanguage()] || nounClassifyCopy.en;
  }

  function classificationLabel(id) {
    const layer = nounCollections[id];
    if (!layer) return id;
    if (mode === "tripiano") return layer.labels.en + " · " + layer.labels.es + " · " + layer.labels.pt;
    const lang = nounClassifyLanguage();
    return layer.labels[lang] || layer.labels.en;
  }

  function currentNounClassifyItem() {
    return nounClassifyDeck[nounClassifyIndex % nounClassifyDeck.length];
  }

  function updateNounClassifyStateSurface() {
    const item = currentNounClassifyItem();
    const copy = currentNounClassifyCopy();

    if (nounClassifyChoiceState) {
      nounClassifyChoiceState.hidden = !nounClassifyChoice;
      nounClassifyChoiceState.textContent = nounClassifyChoice
        ? copy.yourChoice + ": " + classificationLabel(nounClassifyChoice)
        : "";
    }

    if (nounClassifySourceState) {
      nounClassifySourceState.hidden = !nounClassifySourceRevealed;
      nounClassifySourceState.textContent = nounClassifySourceRevealed
        ? copy.source + ": " + classificationLabel(item.classification)
        : "";
    }

    nounClassificationButtons.forEach(button => {
      const id = button.dataset.nounClassification;
      button.classList.toggle("is-selected", id === nounClassifyChoice);
      button.classList.toggle(
        "is-source",
        nounClassifySourceRevealed && id === item.classification
      );
    });

    leaves.forEach(leaf => {
      const branch = leaf.dataset.classifyBranch;
      leaf.classList.toggle("is-classify-choice", !!branch && branch === nounClassifyChoice);
      leaf.classList.toggle(
        "is-classify-source",
        !!branch && nounClassifySourceRevealed && branch === item.classification
      );
    });
  }

  function nounLabelInLanguage(item, language) {
    if (!item) return "";
    return item[language] || item.en;
  }

  function classificationLabelInLanguage(id, language) {
    const layer = nounCollections[id];
    if (!layer) return id;
    return layer.labels[language] || layer.labels.en;
  }

  function nounClassificationSentence(item, classificationId, language, prefixKind = "choice") {
    const noun = nounLabelInLanguage(item, language);
    const classification = classificationLabelInLanguage(classificationId, language);
    const copy = nounClassifyCopy[language] || nounClassifyCopy.en;
    const prefix = prefixKind === "source" ? copy.spokenSource : copy.spokenChoice;

    if (language === "es") {
      return prefix + ": " + noun + " es un sustantivo " + classification.toLowerCase() + ".";
    }
    if (language === "pt") {
      return prefix + ": " + noun + " é um substantivo " + classification.toLowerCase() + ".";
    }
    const article = /^[aeiou]/i.test(classification) ? "an" : "a";
    return prefix + ": " + noun + " is " + article + " " + classification.toLowerCase() + " noun.";
  }

  function speakNounClassificationSentence(item, classificationId, prefixKind = "choice") {
    if (mode === "tripiano") {
      speakSequence([
        { text:nounClassificationSentence(item, classificationId, "en", prefixKind), lang:"en-US" },
        { text:nounClassificationSentence(item, classificationId, "es", prefixKind), lang:"es-ES" },
        { text:nounClassificationSentence(item, classificationId, "pt", prefixKind), lang:"pt-BR" }
      ]);
      return;
    }

    const language = nounClassifyLanguage();
    const locale = language === "es" ? "es-ES" : language === "pt" ? "pt-BR" : "en-US";
    speak(nounClassificationSentence(item, classificationId, language, prefixKind), locale);
  }

  function chooseNounClassification(choice, source = "control-button") {
    if (activeActivity !== "classify" || activeCollectionId !== "nouns") return;
    if (!nounCollections[choice]) return;

    const item = currentNounClassifyItem();
    const copy = currentNounClassifyCopy();
    nounClassifyChoice = choice;

    updateNounClassifyStateSurface();
    speakNounClassificationSentence(item, choice, "choice");

    if (semanticSequence) semanticSequence.dataset.phase = "observed";
    if (semanticPhase) semanticPhase.textContent = "CHOICE RECEIVED";
    if (semanticCue) semanticCue.textContent = copy.received + ": " + classificationLabel(choice);
    if (semanticAnswer) semanticAnswer.textContent = copy.noEvaluation;

    window.dispatchEvent(new CustomEvent("siyayo:noun-classification-choice", {
      detail: {
        type:"noun-classification-choice",
        source,
        nounId:item.id,
        displayedWord:contentLabelForMode(item),
        choice,
        language:nounClassifyLanguage(),
        evaluated:false,
        evidenceProduced:false,
        green:false
      }
    }));
  }

  function resonateCurrentClassifyNoun() {
    if (!leaves || leaves.length < 4) return;
    const item = currentNounClassifyItem();
    const roles = [
      { type:"word", label:contentLabelForMode(item) },
      { type:"branch", id:"concrete", label:classificationLabel("concrete") },
      { type:"branch", id:"abstract", label:classificationLabel("abstract") },
      { type:"branch", id:"proper", label:classificationLabel("proper") }
    ];

    leaves.forEach((leaf, index) => {
      const label = leaf.querySelector("span");
      const role = roles[index] || null;

      leaf.hidden = !role;
      leaf.classList.remove(
        "is-classify-focus",
        "is-classify-word",
        "is-classify-branch",
        "is-classify-choice",
        "is-classify-source"
      );
      delete leaf.dataset.classifyBranch;
      delete leaf.dataset.classifyRole;

      if (!role) {
        if (label) label.textContent = "";
        return;
      }

      if (role.type === "word") {
        leaf.dataset.classifyRole = "word";
        leaf.classList.add("is-classify-focus","is-classify-word");
      } else {
        leaf.dataset.classifyRole = "branch";
        leaf.dataset.classifyBranch = role.id;
        leaf.classList.add("is-classify-branch","classify-branch-" + role.id);
      }

      if (label) label.textContent = role.label;
    });

    updateNounClassifyStateSurface();
  }

  function presentNounClassifyItem({ speakIt = true, resetState = true } = {}) {
    const item = currentNounClassifyItem();
    const copy = currentNounClassifyCopy();

    if (resetState) {
      nounClassifyChoice = null;
      nounClassifySourceRevealed = false;
    }

    if (nounClassifyLabel) nounClassifyLabel.textContent = copy.prompt;
    if (nounClassifyWord) nounClassifyWord.textContent = contentLabelForMode(item);
    nounClassificationButtons.forEach(button => {
      button.textContent = classificationLabel(button.dataset.nounClassification);
    });
    if (nounClassifyReveal) nounClassifyReveal.textContent = copy.reveal;
    if (nounClassifyNext) nounClassifyNext.textContent = copy.next;

    if (semanticSequence) semanticSequence.dataset.phase = "idle";
    if (semanticPhase) semanticPhase.textContent = "NOUN · CLASSIFY";
    if (semanticCue) semanticCue.textContent = contentLabelForMode(item);
    if (semanticAnswer) semanticAnswer.textContent = copy.noEvaluation;

    resonateCurrentClassifyNoun();
    updateNounClassifyStateSurface();

    if (speakIt) speakContentItem(item);
  }

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
      status: "canonical-layered-prototype",
      layers: Object.values(nounCollections).map(layer => ({
        id: layer.id,
        labels: { ...layer.labels },
        example: { ...layer.example },
        items: layer.items.map(item => ({ ...item }))
      }))
    });
    contentCollectionEngine.register({
      id: "verbs",
      label: "Verbs",
      status: "canonical-action-starter-window",
      items: verbActionItems.map(item => ({ ...item }))
    });
    contentCollectionEngine.activate("question-words", "piano-stage-bootstrap");
  }

  window.addEventListener("siyayo:activate-content-collection", event => {
    if (!contentCollectionEngine) return;
    const detail = event.detail || {};
    contentCollectionEngine.activate(detail.id, detail.source || "external-experience");
  });

  let mode = "sound";
  let activeActivity = "explore";
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

  const semanticCadenceExamples = Object.freeze({
    en: {
      id: "which-cheese-should-we-choose",
      language: "en",
      locale: "en-US",
      fullPhrase: "Which cheese should we choose?",
      evidence: "none",
      cells: [
        { note:"C4", speech:"Which" },
        { note:"E4", speech:"cheese" },
        { note:"G4", speech:"should we" },
        { note:"C5", speech:"choose?" }
      ]
    },
    es: {
      id: "que-queso-deberiamos-elegir",
      language: "es",
      locale: "es-ES",
      fullPhrase: "¿Qué queso deberíamos elegir?",
      evidence: "none",
      cells: [
        { note:"C4", speech:"Qué" },
        { note:"E4", speech:"queso" },
        { note:"G4", speech:"deberíamos" },
        { note:"C5", speech:"elegir?" }
      ]
    },
    pt: {
      id: "qual-queijo-devemos-escolher",
      language: "pt",
      locale: "pt-BR",
      fullPhrase: "Qual queijo devemos escolher?",
      evidence: "none",
      cells: [
        { note:"C4", speech:"Qual" },
        { note:"E4", speech:"queijo" },
        { note:"G4", speech:"devemos" },
        { note:"C5", speech:"escolher?" }
      ]
    }
  });

  function currentSemanticCadenceDefinition() {
    const language = mode === "questions"
      ? pedagogicalLanguage
      : ["en","es","pt"].includes(mode)
        ? mode
        : "en";
    return semanticCadenceExamples[language] || semanticCadenceExamples.en;
  }

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

  function runSemanticCadence(definition = currentSemanticCadenceDefinition()) {
    if (semanticCadenceRunning || !definition || !Array.isArray(definition.cells)) return;
    semanticCadenceRunning = true;
    if (semanticCadenceButton) semanticCadenceButton.disabled = true;

    let index = 0;
    const waitMs = 220;

    function finish() {
      semanticCadenceRunning = false;
      if (semanticCadenceButton) semanticCadenceButton.disabled = false;
      if (noteStatus) noteStatus.textContent = "DÓ → MI → SOL → DÓ↑";
      if (wordStatus) wordStatus.textContent = definition.fullPhrase || "";

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

  function speakSequence(parts = []) {
    if (!("speechSynthesis" in window)) return;
    const queue = parts.filter(part => part && part.text);
    if (!queue.length) return;
    window.speechSynthesis.cancel();
    queue.forEach(part => {
      const utterance = new SpeechSynthesisUtterance(part.text);
      utterance.lang = part.lang || "en-US";
      utterance.rate = Number.isFinite(part.rate) ? part.rate : 0.86;
      window.speechSynthesis.speak(utterance);
    });
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

  function refreshActivityControls() {
    activityButtons.forEach(button => {
      const id = button.dataset.activity;
      button.classList.toggle("is-active", id === activeActivity);
      if (id === "questions") button.disabled = activeCollectionId !== "question-words";
      if (id === "classify") button.disabled = activeCollectionId !== "nouns";
      if (id === "morphology") button.disabled = activeCollectionId !== "verbs";
      if (id === "function") button.disabled = activeCollectionId !== "verbs";
    });
  }

  function setActivity(nextActivity) {
    if (!["explore","questions","classify","morphology","function"].includes(nextActivity)) return;
    if (nextActivity === "questions" && activeCollectionId !== "question-words") return;
    if (nextActivity === "classify" && activeCollectionId !== "nouns") return;
    if (nextActivity === "morphology" && activeCollectionId !== "verbs") return;
    if (nextActivity === "function" && activeCollectionId !== "verbs") return;

    activeActivity = nextActivity;
    stage.dataset.activity = activeActivity;
    if (activeActivity !== "morphology") clearVerbMorphologyFocus();
    if (activeActivity !== "function") clearVerbFunctionFocus();
    refreshActivityControls();

    if (activeActivity === "questions") {
      if (nounLayerPanel) nounLayerPanel.hidden = true;
      if (nounClassifyPanel) nounClassifyPanel.hidden = true;
      setMode("questions");
    } else if (activeActivity === "classify") {
      if (mode === "questions") setMode(pedagogicalLanguage || "en");
      if (nounLayerPanel) nounLayerPanel.hidden = true;
      if (nounClassifyPanel) nounClassifyPanel.hidden = false;
      modeStatus.textContent = "CLASSIFY · " + mode.toUpperCase();
      presentNounClassifyItem({ speakIt:true, resetState:true });
    } else if (activeActivity === "morphology") {
      if (nounLayerPanel) nounLayerPanel.hidden = true;
      if (nounClassifyPanel) nounClassifyPanel.hidden = true;
      mode = "en";
      pedagogicalLanguage = "en";
      clearVerbMorphologyFocus();
      modeButtons.forEach(btn => btn.classList.toggle("is-active", btn.dataset.mode === "en"));
      stage.dataset.theme = "en";
      modeStatus.textContent = "MORPHOLOGY · EN";
      wordStatus.textContent = "Regular / Irregular";
      if (semanticSequence) semanticSequence.dataset.phase = "idle";
      if (semanticPhase) semanticPhase.textContent = "VERB · MORPHOLOGY · EN";
      if (semanticCue) semanticCue.textContent = "Touch a verb to inspect its English morphology";
      if (semanticAnswer) semanticAnswer.textContent = "English-only canonical regularity • no evaluation";
      refreshLabels();
      refreshFrondosaLabels();
    } else if (activeActivity === "function") {
      if (mode === "questions" || mode === "sound" || mode === "solfege") {
        mode = pedagogicalLanguage || "en";
      }
      if (!["en","es","pt","tripiano"].includes(mode)) mode = "en";
      if (nounLayerPanel) nounLayerPanel.hidden = true;
      if (nounClassifyPanel) nounClassifyPanel.hidden = true;
      clearVerbFunctionFocus();
      modeButtons.forEach(btn => btn.classList.toggle("is-active", btn.dataset.mode === mode));
      stage.dataset.theme = ["en","es","pt"].includes(mode) ? mode : "sound";
      modeStatus.textContent = "FUNCTION · " + mode.toUpperCase();
      wordStatus.textContent = "Quality · State · Movement · Action · Existence";
      if (semanticSequence) semanticSequence.dataset.phase = "idle";
      if (semanticPhase) semanticPhase.textContent = "VERB · FUNCTION";
      if (semanticCue) semanticCue.textContent = "Touch a verb to inspect its canonical function";
      if (semanticAnswer) semanticAnswer.textContent = "Current corpus presents Action, Movement and State; functions may overlap • no evaluation";
      refreshLabels();
      refreshFrondosaLabels();
    } else {
      if (mode === "questions") setMode(pedagogicalLanguage || "en");
      if (nounClassifyPanel) nounClassifyPanel.hidden = true;
      if (nounLayerPanel) nounLayerPanel.hidden = activeCollectionId !== "nouns";
      modeStatus.textContent = "EXPLORE · " + mode.toUpperCase();
    }

    refreshModeAvailability();

    window.dispatchEvent(new CustomEvent("siyayo:stage-activity-changed", {
      detail: {
        activity: activeActivity,
        collectionId: activeCollectionId,
        language: pedagogicalLanguage,
        evaluated: false,
        evidenceProduced: false
      }
    }));
  }

  function setMode(nextMode) {
    const isLanguage = ["en","es","pt"].includes(nextMode);
    if (activeCollectionId === "verbs" && activeActivity === "morphology" && ["es","pt","tripiano"].includes(nextMode)) return;

    // In 14 Questions the language is an independent lens: switching EN/ES/PT
    // keeps the pedagogical activity active instead of leaving Questions mode.
    if (mode === "questions" && isLanguage && activeCollectionId === "question-words") {
      pedagogicalLanguage = nextMode;
      modeButtons.forEach(btn => {
        const isActive = btn.dataset.mode === "questions" || btn.dataset.mode === pedagogicalLanguage;
        btn.classList.toggle("is-active", isActive);
      });
      stage.dataset.theme = pedagogicalLanguage;
      modeStatus.textContent = "QUESTIONS · " + pedagogicalLanguage.toUpperCase();
      wordStatus.textContent = currentSemanticCadenceDefinition().fullPhrase;
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
      : activeActivity === "classify"
        ? "CLASSIFY · " + mode.toUpperCase()
        : activeActivity === "morphology"
          ? "MORPHOLOGY · EN"
          : activeActivity === "function"
            ? "FUNCTION · " + mode.toUpperCase()
            : "EXPLORE · " + mode.toUpperCase();

    stage.dataset.theme = mode === "questions"
      ? pedagogicalLanguage
      : ["en","es","pt"].includes(mode) ? mode : "sound";

    wordStatus.textContent =
      mode === "sound" ? "DÓ → DÓ↑" :
      mode === "solfege" ? "Solfege" :
      mode === "tripiano" ? "EN → ES → PT" :
      mode === "questions" ? currentSemanticCadenceDefinition().fullPhrase :
      "Colors";
    refreshLabels();
    refreshFrondosaLabels();
    if (mode === "questions") localizeQuestionFlowSurface();
    if (activeActivity === "classify") presentNounClassifyItem({ speakIt:false, resetState:false });
    if (activeActivity === "function" && activeVerbFunctionItem) {
      presentVerbFunction(activeVerbFunctionItem, null, {speakIt:false});
    }
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

  activityButtons.forEach(button => {
    button.addEventListener("click", () => setActivity(button.dataset.activity));
  });

  collectionButtons.forEach(button => {
    button.addEventListener("click", () => setActiveCollection(button.dataset.collection));
  });

  contentGroupButtons.forEach(button => {
    button.addEventListener("click", () => setContentGroup(button.dataset.contentGroup));
  });

  nounLayerButtons.forEach(button => {
    button.addEventListener("click", () => setNounLayer(button.dataset.nounLayer));
  });

  nounClassificationButtons.forEach(button => {
    button.addEventListener("click", () => {
      chooseNounClassification(button.dataset.nounClassification, "piano-stage-control");
    });
  });

  if (nounClassifyReveal) {
    nounClassifyReveal.addEventListener("click", () => {
      if (activeActivity !== "classify") return;
      const item = currentNounClassifyItem();
      const copy = currentNounClassifyCopy();
      const sourceLabel = classificationLabel(item.classification);
      nounClassifySourceRevealed = true;
      updateNounClassifyStateSurface();

      if (semanticPhase) semanticPhase.textContent = "SOURCE";
      if (semanticCue) semanticCue.textContent = copy.source + ": " + sourceLabel;
      if (semanticAnswer) semanticAnswer.textContent = copy.noEvaluation;
      speakNounClassificationSentence(item, item.classification, "source");

      window.dispatchEvent(new CustomEvent("siyayo:noun-classification-source-revealed", {
        detail:{
          nounId:item.id,
          sourceClassification:item.classification,
          learnerChoice:nounClassifyChoice,
          evaluated:false,
          evidenceProduced:false
        }
      }));
    });
  }

  if (nounClassifyNext) {
    nounClassifyNext.addEventListener("click", () => {
      nounClassifyIndex = (nounClassifyIndex + 1) % nounClassifyDeck.length;
      presentNounClassifyItem({ speakIt:true, resetState:true });
    });
  }

  if (semanticCadenceButton) {
    semanticCadenceButton.addEventListener("click", () => {
      runSemanticCadence(currentSemanticCadenceDefinition());
    });
  }

  window.addEventListener("siyayo:run-semantic-cadence", event => {
    const definition = event.detail && event.detail.definition
      ? event.detail.definition
      : currentSemanticCadenceDefinition();
    runSemanticCadence(definition);
  });

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

  const questionContextModels = Object.freeze({
    "what": {
      sourceExperience:"shopping-for-dinner",
      en:{ situation:"You are shopping for tonight's dinner.", question:"What are you going to cook?" },
      es:{ situation:"Estás haciendo las compras para la cena de esta noche.", question:"¿Qué vas a cocinar?" },
      pt:{ situation:"Você está fazendo as compras para o jantar desta noite.", question:"O que você vai cozinhar?" }
    },
    "where": {
      sourceExperience:"shopping-for-dinner",
      en:{ situation:"You are in the supermarket looking for the salmon.", question:"Where can you find the salmon?" },
      es:{ situation:"Estás en el supermercado buscando el salmón.", question:"¿Dónde puedes encontrar el salmón?" },
      pt:{ situation:"Você está no supermercado procurando o salmão.", question:"Onde você pode encontrar o salmão?" }
    },
    "when": {
      sourceExperience:"preparing-dinner",
      en:{ situation:"You are preparing dinner at home and deciding the cooking order.", question:"When should you cook the salmon?" },
      es:{ situation:"Estás preparando la cena en casa y decidiendo el orden de cocción.", question:"¿Cuándo deberías cocinar el salmón?" },
      pt:{ situation:"Você está preparando o jantar em casa e decidindo a ordem do preparo.", question:"Quando você deveria cozinhar o salmão?" }
    },
    "who": {
      sourceExperience:"having-dinner",
      en:{ situation:"Dinner is ready and everyone is at the table.", question:"Who would like some salmon?" },
      es:{ situation:"La cena está lista y todos están en la mesa.", question:"¿Quién quiere un poco de salmón?" },
      pt:{ situation:"O jantar está pronto e todos estão à mesa.", question:"Quem gostaria de um pouco de salmão?" }
    },
    "which": {
      sourceExperience:"shopping-for-dinner",
      en:{ situation:"There are two cheeses in front of you: one fresh and one aged.", question:"Which cheese should you choose?" },
      es:{ situation:"Hay dos quesos frente a ti: uno fresco y uno curado.", question:"¿Qué queso deberías elegir?" },
      pt:{ situation:"Há dois queijos diante de você: um fresco e um maturado.", question:"Qual queijo você deveria escolher?" }
    },
    "why": {
      sourceExperience:"having-dinner",
      en:{ situation:"You are enjoying the dinner you prepared together.", question:"Why is this dinner special?" },
      es:{ situation:"Estás disfrutando la cena que prepararon juntos.", question:"¿Por qué esta cena es especial?" },
      pt:{ situation:"Você está desfrutando o jantar que prepararam juntos.", question:"Por que este jantar é especial?" }
    },
    "how": {
      sourceExperience:"preparing-dinner",
      en:{ situation:"The rice is ready to be prepared.", question:"How are you going to prepare the rice?" },
      es:{ situation:"El arroz está listo para ser preparado.", question:"¿Cómo vas a preparar el arroz?" },
      pt:{ situation:"O arroz está pronto para ser preparado.", question:"Como você vai preparar o arroz?" }
    },
    "how-much": {
      sourceExperience:"shopping-for-dinner",
      en:{ situation:"You are choosing the amount of salmon for dinner.", question:"How much salmon do you need?" },
      es:{ situation:"Estás eligiendo la cantidad de salmón para la cena.", question:"¿Cuánto salmón necesitas?" },
      pt:{ situation:"Você está escolhendo a quantidade de salmão para o jantar.", question:"Quanto salmão você precisa?" }
    },
    "how-many": {
      sourceExperience:"stage-context-prototype",
      en:{ situation:"You are setting the table for four people.", question:"How many plates do you need?" },
      es:{ situation:"Estás poniendo la mesa para cuatro personas.", question:"¿Cuántos platos necesitas?" },
      pt:{ situation:"Você está arrumando a mesa para quatro pessoas.", question:"Quantos pratos você precisa?" }
    },
    "whose": {
      sourceExperience:"stage-context-prototype",
      en:{ situation:"There are several jackets near the table and one belongs to your friend.", question:"Whose jacket is this?" },
      es:{ situation:"Hay varias chaquetas cerca de la mesa y una pertenece a tu amigo.", question:"¿De quién es esta chaqueta?" },
      pt:{ situation:"Há várias jaquetas perto da mesa e uma pertence ao seu amigo.", question:"De quem é esta jaqueta?" }
    },
    "whom": {
      sourceExperience:"after-dinner-conversation",
      en:{ situation:"After dinner, you are deciding which person you would like to listen to.", question:"Whom would you like to listen to?" },
      es:{ situation:"Después de la cena, estás decidiendo a qué persona te gustaría escuchar.", question:"¿A quién te gustaría escuchar?" },
      pt:{ situation:"Depois do jantar, você está decidindo qual pessoa gostaria de escutar.", question:"A quem você gostaria de escutar?" }
    },
    "how-long": {
      sourceExperience:"stage-context-prototype",
      en:{ situation:"Dinner is cooking and you need to decide the cooking time.", question:"How long should the vegetables cook?" },
      es:{ situation:"La cena se está cocinando y necesitas decidir el tiempo de cocción.", question:"¿Cuánto tiempo deben cocinarse las verduras?" },
      pt:{ situation:"O jantar está sendo preparado e você precisa decidir o tempo de cozimento.", question:"Quanto tempo os legumes devem cozinhar?" }
    },
    "how-far": {
      sourceExperience:"stage-context-prototype",
      en:{ situation:"You are leaving home and going to the market.", question:"How far is the market from your home?" },
      es:{ situation:"Estás saliendo de casa y yendo al mercado.", question:"¿Qué tan lejos está el mercado de tu casa?" },
      pt:{ situation:"Você está saindo de casa e indo ao mercado.", question:"Quão longe fica o mercado da sua casa?" }
    },
    "how-often": {
      sourceExperience:"stage-context-prototype",
      en:{ situation:"You are talking about your weekly routine.", question:"How often do you cook at home?" },
      es:{ situation:"Estás hablando de tu rutina semanal.", question:"¿Con qué frecuencia cocinas en casa?" },
      pt:{ situation:"Você está falando sobre sua rotina semanal.", question:"Com que frequência você cozinha em casa?" }
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
      showContext:"Show context",
      contextTitle:"CONTEXT",
      contextAvailable:"Context available",
      placeholder:"Type your response…",
      submit:"Submit response",
      requestedTime:"Learner requested more time",
      requestedClarification:"Learner requested clarification",
      reportedContext:"Learner reports missing context",
      speakMoreTime:"You asked for more time. Take the time you need.",
      speakClarification:"You asked for clarification. How would you like me to clarify?",
      speakMissingContext:"You said context is missing. I will show the available context.",
      speakGapPrefix:"The missing information is: ",
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
      showContext:"Mostrar contexto",
      contextTitle:"CONTEXTO",
      contextAvailable:"Contexto disponible",
      placeholder:"Escribe tu respuesta…",
      submit:"Enviar respuesta",
      requestedTime:"El estudiante pidió más tiempo",
      requestedClarification:"El estudiante pidió una aclaración",
      reportedContext:"El estudiante informa que falta contexto",
      speakMoreTime:"Pediste más tiempo. Tómate el tiempo que necesites.",
      speakClarification:"Pediste una aclaración. ¿Cómo deseas que lo aclare?",
      speakMissingContext:"Indicaste que falta contexto. Voy a mostrar el contexto disponible.",
      speakGapPrefix:"La información que falta es: ",
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
      showContext:"Mostrar contexto",
      contextTitle:"CONTEXTO",
      contextAvailable:"Contexto disponível",
      placeholder:"Digite sua resposta…",
      submit:"Enviar resposta",
      requestedTime:"O aluno pediu mais tempo",
      requestedClarification:"O aluno pediu esclarecimento",
      reportedContext:"O aluno informa que falta contexto",
      speakMoreTime:"Você pediu mais tempo. Use o tempo que precisar.",
      speakClarification:"Você pediu esclarecimento. Como deseja esclarecer?",
      speakMissingContext:"Você informou que falta contexto. Vou mostrar o contexto disponível.",
      speakGapPrefix:"A informação que falta é: ",
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

  function currentQuestionContext(qw) {
    const family = questionContextModels[qw && qw.id];
    return family && family[pedagogicalLanguage]
      ? { ...family[pedagogicalLanguage], sourceExperience: family.sourceExperience || null }
      : null;
  }

  function hideContextSupport() {
    if (contextSupportPanel) contextSupportPanel.hidden = true;
    if (contextSupportText) contextSupportText.textContent = "";
  }

  function showContextSupport({ speakIt = true } = {}) {
    if (!activeQuestionWord) return false;
    const copy = currentQuestionCopy();
    const context = currentQuestionContext(activeQuestionWord);
    if (!context) return false;

    if (contextSupportTitle) contextSupportTitle.textContent = copy.contextTitle;
    if (contextSupportText) {
      contextSupportText.textContent = context.situation + " " + context.question;
    }
    if (contextSupportPanel) contextSupportPanel.hidden = false;

    if (speakIt) speak(context.situation + " " + context.question, copy.locale);

    window.dispatchEvent(new CustomEvent("siyayo:context-support-event", {
      detail: {
        type: "context-support-presented",
        source: "frondosa-semantic-lab",
        questionWordId: activeQuestionWord.id,
        language: pedagogicalLanguage,
        sourceExperience: context.sourceExperience,
        evaluated: false,
        evidenceProduced: false
      }
    }));

    return true;
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
        action === "show-gap" ? copy.showGap :
        copy.showContext;
    });

    if (!semanticSequence) return;

    if (!activeQuestionWord) {
      semanticPhase.textContent = copy.ready;
      semanticCue.textContent = copy.readyCue;
      semanticAnswer.textContent = copy.readyAnswer;
      return;
    }

    const phase = semanticSequence.dataset.phase || "idle";
    const model = currentQuestionModel(activeQuestionWord);
    const qwLabel = currentQuestionWordLabel(activeQuestionWord);

    if (phase === "question") {
      semanticPhase.textContent = copy.question;
      semanticCue.textContent = qwLabel.toUpperCase() + " · " + model.prompt;
      semanticAnswer.textContent = copy.gapPrefix + model.gap;
    } else if (phase === "wait") {
      semanticPhase.textContent = copy.wait;
      if (activeWaitArchetype === "thinking") {
        semanticCue.textContent = copy.requestedTime;
        semanticAnswer.textContent = copy.explicitAction;
      } else if (activeWaitArchetype === "confused") {
        semanticCue.textContent = copy.requestedClarification;
        semanticAnswer.textContent = copy.explicitAction;
      } else if (activeWaitArchetype === "insufficient-context") {
        semanticCue.textContent = copy.reportedContext;
        semanticAnswer.textContent = copy.explicitAction;
      } else {
        semanticCue.textContent = copy.waitCue;
        semanticAnswer.textContent = copy.noEvidence;
      }
    } else if (phase === "response") {
      semanticPhase.textContent = copy.response;
      semanticCue.textContent = qwLabel + copy.remains;
      semanticAnswer.textContent = copy.awaitingResponse;
    } else if (phase === "observed") {
      semanticPhase.textContent = copy.observed;
      semanticCue.textContent = copy.responseReceived;
      semanticAnswer.textContent = copy.notEvaluated;
    } else if (phase === "external-evaluation") {
      semanticPhase.textContent = copy.externalPhase;
      semanticCue.textContent = copy.externalCue;
      semanticAnswer.textContent = copy.externalAnswer;
    }

    if (contextSupportPanel && !contextSupportPanel.hidden) {
      const context = currentQuestionContext(activeQuestionWord);
      if (contextSupportTitle) contextSupportTitle.textContent = copy.contextTitle;
      if (contextSupportText && context) {
        contextSupportText.textContent = context.situation + " " + context.question;
      }
    }

    if (phase === "wait" && activeWaitArchetype) {
      setWaitArchetype(activeWaitArchetype, "language-lens-change");
    } else if (phase !== "wait" && activeWaitArchetype) {
      clearWaitArchetype();
    }
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
    hideContextSupport();
    localizeQuestionFlowSurface();
  }

  function runSemanticSequence(qw) {
    if (!semanticSequence || !qw) return;
    activeQuestionWord = qw;
    activeSupportTrace = [];
    clearCanonicalRouteResonance();
    clearCanonicalNavigationOpportunity();
    hideContextSupport();

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
        clearWaitArchetype();
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
    const items = currentNounItems();
    return index >= 0 ? items[index] || null : null;
  }

  function verbForLeaf(leaf) {
    const index = leaves.indexOf(leaf);
    const items = currentVerbItems();
    return index >= 0 ? items[index] || null : null;
  }

  function activeContentItemForLeaf(leaf) {
    if (activeCollectionId === "nouns") return nounForLeaf(leaf);
    if (activeCollectionId === "verbs") return verbForLeaf(leaf);
    return questionWordForLeaf(leaf);
  }

  function contentLabelForMode(item) {
    if (!item) return "";
    if (activeCollectionId === "verbs" && activeActivity === "morphology") return verbMorphologyLabel(item);
    if (activeCollectionId === "verbs" && activeActivity === "function") {
      if (mode === "tripiano") {
        return ["en","es","pt"].map(language => verbFunctionWord(item, language)).join(" · ");
      }
      return verbFunctionWord(item);
    }
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
    if (activeCollectionId === "nouns" && activeActivity === "classify") {
      resonateCurrentClassifyNoun();
      return;
    }

    leaves.forEach(leaf => {
      const label = leaf.querySelector("span");
      const item = activeContentItemForLeaf(leaf);
      leaf.classList.remove(
        "is-classify-focus",
        "is-classify-word",
        "is-classify-branch",
        "is-classify-choice",
        "is-classify-source",
        "classify-branch-concrete",
        "classify-branch-abstract",
        "classify-branch-proper"
      );
      delete leaf.dataset.classifyRole;
      delete leaf.dataset.classifyBranch;
      leaf.hidden = ["nouns","verbs"].includes(activeCollectionId) && !item;
      if (label) label.textContent = item ? contentLabelForMode(item) : "";
    });
  }

  function speakContentItem(item) {
    if (!item) return;
    if (activeCollectionId === "verbs" && activeActivity === "morphology") {
      speakVerbMorphology(item);
      return;
    }
    if (activeCollectionId === "verbs" && activeActivity === "function") {
      speakVerbFunction(item);
      return;
    }
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

  function nounLayerLabel() {
    const collection = currentNounCollection();
    const language = mode === "questions" ? pedagogicalLanguage : ["en","es","pt"].includes(mode) ? mode : "en";
    return collection.labels[language] || collection.labels.en;
  }

  const verbFunctionCopy = Object.freeze({
    quality:{
      labels:{en:"Quality",es:"Cualidad",pt:"Qualidade"},
      descriptions:{
        en:"identity, classification, property or characteristic",
        es:"identidad, clasificación, propiedad o característica",
        pt:"identidade, classificação, propriedade ou característica"
      }
    },
    state:{
      labels:{en:"State",es:"Estado",pt:"Estado"},
      descriptions:{
        en:"condition or situation in context",
        es:"condición o situación en contexto",
        pt:"condição ou situação em contexto"
      }
    },
    movement:{
      labels:{en:"Movement",es:"Movimiento",pt:"Movimento"},
      descriptions:{
        en:"displacement, direction or change of position",
        es:"desplazamiento, dirección o cambio de posición",
        pt:"deslocamento, direção ou mudança de posição"
      }
    },
    action:{
      labels:{en:"Action",es:"Acción",pt:"Ação"},
      descriptions:{
        en:"what a subject does through a lexical action or activity",
        es:"lo que hace un sujeto mediante una acción o actividad léxica",
        pt:"o que o sujeito faz por meio de uma ação ou atividade lexical"
      }
    },
    existence:{
      labels:{en:"Existence",es:"Existencia",pt:"Existência"},
      descriptions:{
        en:"existence, presence, availability or occurrence",
        es:"existencia, presencia, disponibilidad u ocurrencia",
        pt:"existência, presença, disponibilidade ou ocorrência"
      }
    }
  });
  let activeVerbFunctionItem = null;

  function verbFunctionLanguage() {
    return ["es","pt"].includes(mode) ? mode : "en";
  }

  function verbFunctionWord(item, language = verbFunctionLanguage()) {
    if (!item) return "";
    return item.functionMeta?.translations?.[language] || item[language] || item.en || "";
  }

  function verbFunctionLabels(item, language = verbFunctionLanguage()) {
    return (item?.functionMeta?.verbFunction || []).map(id => verbFunctionCopy[id]?.labels?.[language] || id);
  }

  function verbFunctionSummary(item, language = verbFunctionLanguage()) {
    if (!item) return "";
    const functions = item.functionMeta?.verbFunction || [];
    return functions.map(id => {
      const copy = verbFunctionCopy[id];
      if (!copy) return id;
      return copy.labels[language] + " · " + copy.descriptions[language];
    }).join("  •  ");
  }

  function verbFunctionSentence(item, language) {
    const word = verbFunctionWord(item, language);
    const labels = verbFunctionLabels(item, language);
    if (!word || !labels.length) return "";
    const joined = labels.length === 1
      ? labels[0]
      : labels.slice(0,-1).join(", ") + (language === "es" ? " y " : language === "pt" ? " e " : " and ") + labels[labels.length-1];

    if (language === "es") return word + " expresa " + joined + ". " + verbFunctionSummary(item, language).replaceAll("  •  ", ". ") + ".";
    if (language === "pt") return word + " expressa " + joined + ". " + verbFunctionSummary(item, language).replaceAll("  •  ", ". ") + ".";
    return word + " expresses " + joined + ". " + verbFunctionSummary(item, language).replaceAll("  •  ", ". ") + ".";
  }

  function speakVerbFunction(item) {
    if (!item) return;
    if (mode === "tripiano") {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      [["en","en-US"],["es","es-ES"],["pt","pt-BR"]].forEach(([language,locale]) => {
        const sentence = verbFunctionSentence(item, language);
        if (!sentence) return;
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.lang = locale;
        utterance.rate = 0.84;
        window.speechSynthesis.speak(utterance);
      });
      return;
    }
    const language = verbFunctionLanguage();
    const locale = language === "es" ? "es-ES" : language === "pt" ? "pt-BR" : "en-US";
    speak(verbFunctionSentence(item, language), locale);
  }

  function clearVerbFunctionFocus() {
    activeVerbFunctionItem = null;
    delete stage.dataset.verbFunctions;
    leaves.forEach(leaf => leaf.classList.remove(
      "is-function-focus",
      "has-function-action",
      "has-function-movement",
      "has-function-state",
      "has-function-quality",
      "has-function-existence"
    ));
  }

  function presentVerbFunction(item, leaf = null, {speakIt=true} = {}) {
    if (!item || !item.functionMeta) return;
    activeVerbFunctionItem = item;
    const functions = item.functionMeta.verbFunction || [];
    const language = verbFunctionLanguage();

    if (leaf) {
      leaves.forEach(candidate => candidate.classList.remove(
        "is-function-focus",
        "has-function-action",
        "has-function-movement",
        "has-function-state",
        "has-function-quality",
        "has-function-existence"
      ));
      leaf.classList.add("is-function-focus");
      functions.forEach(id => leaf.classList.add("has-function-" + id));
    }

    stage.dataset.verbFunctions = functions.join(" ");
    if (semanticSequence) semanticSequence.dataset.phase = "observed";
    if (semanticPhase) semanticPhase.textContent = "VERB · FUNCTION · " + (mode === "tripiano" ? "TRIPIANO" : language.toUpperCase());
    if (semanticCue) semanticCue.textContent = verbFunctionWord(item, language).toUpperCase() + " · " + verbFunctionLabels(item, language).join(" + ").toUpperCase();
    if (semanticAnswer) semanticAnswer.textContent = verbFunctionSummary(item, language);
    wordStatus.textContent = verbFunctionWord(item, language) + " → " + verbFunctionLabels(item, language).join(" + ");

    if (speakIt) speakVerbFunction(item);
  }

  function verbMorphologyLabel(item) {
    return item && item.morphology ? item.morphology.lemma : (item ? item.en : "");
  }

  function verbMorphologySummary(item) {
    if (!item || !item.morphology) return "";
    const m = item.morphology;
    const past = m.forms && m.forms.past ? m.forms.past : "";
    const label = m.regularity === "irregular" ? "Irregular" : "Regular";
    return label + " · " + m.lemma + (past ? " → " + past : "");
  }

  function speakVerbMorphology(item) {
    if (!item || !item.morphology) return;
    const m = item.morphology;
    const kind = m.regularity === "irregular" ? "irregular" : "regular";
    const past = m.forms && m.forms.past ? m.forms.past : "";
    const sentence = m.lemma + " is an " + kind + " verb." + (past ? " Past: " + past + "." : "");
    speak(sentence, "en-US");
  }

  function clearVerbMorphologyFocus() {
    delete stage.dataset.verbRegularity;
    leaves.forEach(leaf => leaf.classList.remove("is-morphology-focus","is-regular-verb","is-irregular-verb"));
  }

  function refreshModeAvailability() {
    const morphologyEnglishOnly = activeCollectionId === "verbs" && activeActivity === "morphology";
    modeButtons.forEach(button => {
      const id = button.dataset.mode;
      button.disabled = morphologyEnglishOnly && ["es","pt","tripiano"].includes(id);
    });
  }

  function verbActionExample(item) {
    if (!item || !item.examples) return "";
    const language = mode === "es" ? "es" : mode === "pt" ? "pt" : "en";
    return item.examples[language] || item.examples.en || "";
  }

  function nounLayerExample() {
    const collection = currentNounCollection();
    const language = ["es","pt"].includes(mode) ? mode : "en";
    return collection.example[language] || collection.example.en;
  }

  function setNounLayer(nextLayer) {
    if (!nounCollections[nextLayer]) return;
    activeNounLayer = nextLayer;
    nounLayerButtons.forEach(button => {
      button.classList.toggle("is-active", button.dataset.nounLayer === activeNounLayer);
    });

    refreshFrondosaLabels();

    if (activeCollectionId === "nouns") {
      if (semanticSequence) semanticSequence.dataset.phase = "idle";
      if (semanticPhase) semanticPhase.textContent = "NOUNS · " + nounLayerLabel().toUpperCase();
      if (semanticCue) semanticCue.textContent = nounLayerExample();
      if (semanticAnswer) semanticAnswer.textContent = "Canonical noun classification • Explore";
    }

    window.dispatchEvent(new CustomEvent("siyayo:noun-layer-changed", {
      detail: {
        layer: activeNounLayer,
        source: "canonical-noun-classifications",
        evaluated: false,
        evidenceProduced: false
      }
    }));
  }

  function setActiveCollection(nextId) {
    if (!["question-words","nouns","verbs"].includes(nextId)) return;
    activeCollectionId = nextId;
    stage.dataset.collection = activeCollectionId;
    if (activeCollectionId === "verbs") stage.dataset.verbGroup = String(activeVerbGroup + 1);
    else delete stage.dataset.verbGroup;
    if (contentCollectionEngine) {
      contentCollectionEngine.activate(nextId, "piano-stage-collection-control");
    }

    collectionButtons.forEach(button => {
      button.classList.toggle("is-active", button.dataset.collection === activeCollectionId);
    });

    if (activeCollectionId !== "question-words" && activeActivity === "questions") {
      activeActivity = "explore";
      if (mode === "questions") setMode(pedagogicalLanguage || "en");
    }
    if (activeCollectionId !== "nouns" && activeActivity === "classify") {
      activeActivity = "explore";
    }
    if (activeCollectionId !== "verbs" && activeActivity === "morphology") {
      activeActivity = "explore";
      clearVerbMorphologyFocus();
    }
    if (activeCollectionId !== "verbs" && activeActivity === "function") {
      activeActivity = "explore";
      clearVerbFunctionFocus();
    }
    if (activeCollectionId === "verbs" && !["explore","morphology","function"].includes(activeActivity)) {
      activeActivity = "explore";
    }
    stage.dataset.activity = activeActivity;
    refreshActivityControls();
    refreshContentGroupControls();
    refreshModeAvailability();
    if (nounClassifyPanel) nounClassifyPanel.hidden = !(activeCollectionId === "nouns" && activeActivity === "classify");
    if (nounLayerPanel) nounLayerPanel.hidden = !(activeCollectionId === "nouns" && activeActivity === "explore");

    if (semanticSequence) semanticSequence.dataset.phase = "idle";
    if (semanticPhase) semanticPhase.textContent =
      activeCollectionId === "nouns"
        ? "NOUNS · " + nounLayerLabel().toUpperCase()
        : activeCollectionId === "verbs"
          ? "VERBS · ACTIONS · " + (activeVerbGroup === 0 ? "1–14" : "15–28")
          : "READY";
    if (semanticCue) semanticCue.textContent =
      activeCollectionId === "nouns"
        ? nounLayerExample()
        : activeCollectionId === "verbs"
          ? (activeVerbGroup === 0 ? "Touch a Verb Action leaf · Group 1" : "Touch a Verb Action leaf · Group 2")
          : "Touch a Question Word leaf";
    if (semanticAnswer) semanticAnswer.textContent =
      activeCollectionId === "nouns"
        ? "Canonical noun classification • Explore"
        : activeCollectionId === "verbs"
          ? "Canonical trilingual action corpus • Explore"
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
        : semanticContentItem && semanticContentItem.collectionId === "verbs"
          ? leaves.filter(item => {
              const verb = verbForLeaf(item);
              return verb && verb.id === semanticContentItem.id;
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
      if (activeCollectionId === "nouns" && activeActivity === "classify") {
        const classifyItem = currentNounClassifyItem();
        if (!classifyItem) return;

        if (leaf.dataset.classifyRole === "branch" && leaf.dataset.classifyBranch) {
          chooseNounClassification(leaf.dataset.classifyBranch, "frondosa-branch");
          return;
        }

        if (leaf.dataset.classifyRole === "word") {
          speakContentItem(classifyItem);
          if (semanticPhase) semanticPhase.textContent = "NOUN · CLASSIFY";
          if (semanticCue) semanticCue.textContent = contentLabelForMode(classifyItem);
          if (semanticAnswer) semanticAnswer.textContent = currentNounClassifyCopy().noEvaluation;
        }
        return;
      }

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
        if (semanticPhase) semanticPhase.textContent = "NOUN · " + nounLayerLabel().toUpperCase();
        if (semanticCue) semanticCue.textContent = contentLabelForMode(contentItem);
        if (semanticAnswer) semanticAnswer.textContent = nounLayerExample();

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

      if (activeCollectionId === "verbs") {
        if (activeActivity === "morphology") {
          const morphology = contentItem.morphology;
          if (!morphology) return;
          const pianoKey = keyboard.querySelector('[data-note="' + key.id + '"]');
          if (pianoKey) activateKey(pianoKey, key, "frondosa", {
            kind:"content-item",
            collectionId:"verbs",
            id:contentItem.id,
            evidence:"none"
          }, true);

          clearVerbMorphologyFocus();
          stage.dataset.verbRegularity = morphology.regularity;
          leaf.classList.add("is-morphology-focus", morphology.regularity === "irregular" ? "is-irregular-verb" : "is-regular-verb");

          if (semanticSequence) semanticSequence.dataset.phase = "observed";
          if (semanticPhase) semanticPhase.textContent = "VERB · MORPHOLOGY · EN";
          if (semanticCue) semanticCue.textContent = morphology.lemma.toUpperCase() + " · " + morphology.regularity.toUpperCase();
          if (semanticAnswer) semanticAnswer.textContent = verbMorphologySummary(contentItem);
          wordStatus.textContent = morphology.lemma + " → " + (morphology.forms.past || "");
          speakVerbMorphology(contentItem);

          window.dispatchEvent(new CustomEvent("siyayo:verb-morphology-presented", {
            detail:{
              verbId:contentItem.id,
              language:"en",
              lemma:morphology.lemma,
              regularity:morphology.regularity,
              forms:{...morphology.forms},
              evaluated:false,
              evidenceProduced:false,
              green:false
            }
          }));
          return;
        }

        if (activeActivity === "function") {
          const functionMeta = contentItem.functionMeta;
          if (!functionMeta) return;
          const pianoKey = keyboard.querySelector('[data-note="' + key.id + '"]');
          if (pianoKey) activateKey(pianoKey, key, "frondosa", {
            kind:"content-item",
            collectionId:"verbs",
            id:contentItem.id,
            semanticDimension:"verb-function",
            functions:[...functionMeta.verbFunction],
            evidence:"none"
          }, true);

          presentVerbFunction(contentItem, leaf, {speakIt:true});

          window.dispatchEvent(new CustomEvent("siyayo:verb-function-presented", {
            detail:{
              verbId:contentItem.id,
              functions:[...functionMeta.verbFunction],
              verbClass:[...(functionMeta.verbClass || [])],
              language:mode,
              source:"canonical-verb-function",
              evaluated:false,
              evidenceProduced:false,
              green:false
            }
          }));
          return;
        }

        const pianoKey = keyboard.querySelector('[data-note="' + key.id + '"]');
        if (pianoKey) activateKey(pianoKey, key, "frondosa", {
          kind:"content-item",
          collectionId:"verbs",
          id:contentItem.id,
          evidence:"none"
        }, mode !== "solfege");

        if (mode !== "solfege") speakContentItem(contentItem);
        if (semanticSequence) semanticSequence.dataset.phase = "observed";
        if (semanticPhase) semanticPhase.textContent = "VERB · ACTION";
        if (semanticCue) semanticCue.textContent = contentLabelForMode(contentItem);
        if (semanticAnswer) semanticAnswer.textContent = verbActionExample(contentItem);

        window.dispatchEvent(new CustomEvent("siyayo:content-item-event", {
          detail:{
            type:"content-item-explored",
            source:"frondosa",
            collectionId:"verbs",
            itemId:contentItem.id,
            mode,
            evaluated:false,
            evidenceProduced:false
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

      // WAIT Performance Layer: learner agency gets an audible response,
      // but still produces no evaluation, GREEN or Evidence.
      if (requestedState === "thinking") {
        playPianinhoHigh(523.25);
        speak(copy.speakMoreTime, copy.locale);
      } else if (requestedState === "confused") {
        playPianinhoHigh(392.00);
        speak(copy.speakClarification, copy.locale);
      } else if (requestedState === "insufficient-context") {
        playPianinhoHigh(329.63);
        const context = currentQuestionContext(activeQuestionWord);
        if (context) {
          speakSequence([
            { text: copy.speakMissingContext, lang: copy.locale },
            { text: context.situation + " " + context.question, lang: copy.locale }
          ]);
          showContextSupport({ speakIt: false });
        } else {
          speak(copy.speakMissingContext, copy.locale);
        }
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
            : ["repeat-question","hear-qw","show-gap","show-context"],
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
          performance: {
            speech: true,
            pianinhoAccent: true
          },
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
        speak(copy.speakGapPrefix + model.gap, copy.locale);
      } else if (action === "show-context") {
        showContextSupport({ speakIt: true });
        if (semanticCue) semanticCue.textContent = copy.contextAvailable;
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

  refreshActivityControls();
  refreshContentGroupControls();
  if (nounLayerPanel) nounLayerPanel.hidden = true;
  if (nounClassifyPanel) nounClassifyPanel.hidden = true;
  setNounLayer(activeNounLayer);
  resetSemanticSequence();
  updatePianinhoSequenceStatus();
  refreshLabels();
  refreshFrondosaLabels();
})();
