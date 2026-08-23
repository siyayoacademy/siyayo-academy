/* ========================================
   SIYAYO ACADEMY
   Content Engine - v0.5
   Smart Slides + Speech Engine
   ======================================== */

const ACADEMY_MANIFEST = "data/academy.json";

let currentChapterData = null;
let currentSlides = [];
let currentSlideIndex = 0;

/* Speech state */
let isSpeaking = false;
let isPaused = false;
let currentUtterances = [];


/* ========================================
   LOAD ACADEMY MANIFEST
   ======================================== */

async function loadAcademyManifest() {
  try {
    const response = await fetch(ACADEMY_MANIFEST);

    if (!response.ok) {
      throw new Error(
        `Erro ao carregar ${ACADEMY_MANIFEST}: ${response.status}`
      );
    }

    const academy = await response.json();

    validateAcademyManifest(academy);

    console.log(
      "SIYAYO ACADEMY manifest loaded successfully."
    );

    console.log(
      "Project:",
      academy.project?.name
    );

    console.log(
      "Product:",
      academy.project?.product
    );

    console.log(
      "Languages:",
      academy.project?.languageOrder
    );

    console.log(
      `${academy.chapters.length} chapters loaded.`
    );

    console.log(
      `${academy.extraModules.length} extra module(s) loaded.`
    );

    return academy;

  } catch (error) {
    console.error(
      "SIYAYO ACADEMY loader error:",
      error
    );

    return null;
  }
}


/* ========================================
   VALIDATE ACADEMY
   ======================================== */

function validateAcademyManifest(academy) {

  if (!academy) {
    throw new Error(
      "academy.json está vazio ou inválido."
    );
  }

  if (!academy.project) {
    throw new Error(
      "academy.json não possui o objeto 'project'."
    );
  }

  if (!Array.isArray(academy.chapters)) {
    throw new Error(
      "academy.json não possui capítulos válidos."
    );
  }

  if (!Array.isArray(academy.extraModules)) {
    throw new Error(
      "academy.json não possui módulos extras válidos."
    );
  }
}


/* ========================================
   FIND ACTIVE CHAPTER
   ======================================== */

function findActiveChapter(academy) {

  const activeChapter = academy.chapters.find(
    chapter => chapter.status === "active"
  );

  if (!activeChapter) {
    console.warn(
      "No active chapter was found."
    );

    return null;
  }

  console.log(
    "Active chapter:",
    activeChapter.number,
    activeChapter.title?.en
  );

  console.log(
    "Chapter path:",
    activeChapter.path
  );

  return activeChapter;
}


/* ========================================
   LOAD CHAPTER
   ======================================== */

async function loadChapter(chapterReference) {

  if (!chapterReference?.path) {
    console.error(
      "Chapter reference does not contain a valid path."
    );

    return null;
  }

  try {
    const response =
      await fetch(chapterReference.path);

    if (!response.ok) {
      throw new Error(
        `Erro ao carregar ${chapterReference.path}: ${response.status}`
      );
    }

    const chapterData =
      await response.json();

    validateChapter(chapterData);

    console.log(
      "Chapter JSON loaded successfully."
    );

    console.log(
      "Chapter number:",
      chapterData.chapter?.number
    );

    console.log(
      "Chapter slug:",
      chapterData.chapter?.slug
    );

    console.log(
      "Chapter title:",
      chapterData.chapter?.title
    );

    console.log(
      "Sections:",
      chapterData.chapter?.sections?.length
    );

    return chapterData;

  } catch (error) {
    console.error(
      "SIYAYO Chapter Loader error:",
      error
    );

    return null;
  }
}


/* ========================================
   VALIDATE CHAPTER
   ======================================== */

function validateChapter(chapterData) {

  if (!chapterData) {
    throw new Error(
      "chapter.json está vazio ou inválido."
    );
  }

  if (!chapterData.chapter) {
    throw new Error(
      "chapter.json não possui objeto chapter."
    );
  }

  if (!Array.isArray(
    chapterData.chapter.sections
  )) {
    throw new Error(
      "chapter.json não possui sections válidas."
    );
  }
}


/* ========================================
   ESCAPE HTML
   ======================================== */

function escapeHtml(text = "") {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* ========================================
   TARGET WORD FORMATTER
   ======================================== */

function formatTargetSentence(
  sentence = "",
  targetWord = ""
) {

  if (!targetWord) {
    return escapeHtml(sentence);
  }

  const source = String(sentence);
  const target = String(targetWord);

  const index =
    source.toLowerCase().indexOf(
      target.toLowerCase()
    );

  if (index === -1) {
    return escapeHtml(source);
  }

  const before =
    source.slice(0, index);

  const match =
    source.slice(
      index,
      index + target.length
    );

  const after =
    source.slice(
      index + target.length
    );

  return `
    ${escapeHtml(before)}
    <strong>
      <em class="target-word">
        ${escapeHtml(match)}
      </em>
    </strong>
    ${escapeHtml(after)}
  `;
}


/* ========================================
   TRILINGUAL LINES
   ======================================== */

function createLanguageLines(
  content,
  targetWords = {}
) {

  const order = [
    {
      code: "en",
      label: "EN"
    },
    {
      code: "es",
      label: "ES"
    },
    {
      code: "pt",
      label: "PT"
    }
  ];

  return order
    .filter(
      language =>
        content?.[language.code]
    )
    .map(
      language => ({
        language:
          language.code,

        label:
          language.label,

        text:
          content[
            language.code
          ],

        target:
          targetWords?.[
            language.code
          ] ?? ""
      })
    );
}


/* ========================================
   BUILD SMART SLIDES
   ======================================== */

function buildSlides(chapterData) {

  const sections =
    chapterData.chapter.sections ?? [];

  const slides = [];


  sections.forEach(section => {

    switch (section.type) {


      /* PARAGRAPH */

      case "paragraph": {

        const content =
          section.content?.pt ??
          section.content?.en ??
          section.content?.es ??
          "";

        slides.push({
          type: "paragraph",
          sectionId: section.id,
          title: section.title,
          content
        });

        break;
      }


      /* GRAMMAR */

      case "grammar": {

        slides.push({
          type: "grammar",
          sectionId: section.id,
          title: section.title,
          lines:
            createLanguageLines(
              section.content
            )
        });

        break;
      }


      /* EXAMPLES */

      case "examples": {

        const items =
          section.items ?? [];

        items.forEach(
          (item, itemIndex) => {

            const classification =
              [
                item.classification?.en,
                item.classification?.es,
                item.classification?.pt
              ]
                .filter(Boolean)
                .join(" · ");

            slides.push({
              type: "example",
              sectionId: section.id,
              itemIndex,
              title:
                classification ||
                section.title,

              lines:
                createLanguageLines(
                  item.sentences,
                  item.targetWords
                )
            });
          }
        );

        break;
      }


      /* CONVERSATION */

      case "conversation": {

        const items =
          section.items ?? [];

        items.forEach(
          (item, itemIndex) => {

            slides.push({
              type: "conversation",
              sectionId: section.id,
              itemIndex,
              title: section.title,

              lines:
                 createLanguageLines(
                   item,
                   item.targetWords ?? {}
              )
            });
          }
        );

        break;
      }


      default:

        console.warn(
          "Unknown section type:",
          section.type,
          section
        );
    }
  });


  console.log(
    `${slides.length} smart slides generated.`
  );

  return slides;
}


/* ========================================
   RENDER LANGUAGE LINES
   ======================================== */

function renderLanguageLines(lines = []) {

  return lines
    .map(line => {

      const formattedText =
        formatTargetSentence(
          line.text,
          line.target
        );

      return `
        <div
          class="
            language-line
            language-${line.language}
          "
          data-language="${line.language}"
        >

          <span class="language-label">
            ${line.label}
          </span>

          <p class="language-text">
            ${formattedText}
          </p>

        </div>
      `;
    })
    .join("");
}


/* ========================================
   RENDER SLIDE CONTENT
   ======================================== */

function renderSlideContent(slide) {

  switch (slide.type) {

    case "paragraph":

      return `
        <article
          class="
            slide-content
            slide-paragraph
          "
        >

          <h2 class="section-title">
            ${escapeHtml(
              slide.title ?? ""
            )}
          </h2>

          <p class="section-content">
            ${escapeHtml(
              slide.content ?? ""
            )}
          </p>

        </article>
      `;


    case "grammar":

      return `
        <article
          class="
            slide-content
            slide-grammar
          "
        >

          <h2 class="section-title">
            ${escapeHtml(
              slide.title ?? ""
            )}
          </h2>

          <div class="trilingual-content">
            ${renderLanguageLines(
              slide.lines
            )}
          </div>

        </article>
      `;


    case "example":

      return `
        <article
          class="
            slide-content
            slide-example
          "
        >

          <h2 class="section-title">
            ${escapeHtml(
              slide.title ?? ""
            )}
          </h2>

          <div class="trilingual-content">
            ${renderLanguageLines(
              slide.lines
            )}
          </div>

        </article>
      `;


    case "conversation":

      return `
        <article
          class="
            slide-content
            slide-conversation
          "
        >

          <h2 class="section-title">
            ${escapeHtml(
              slide.title ?? ""
            )}
          </h2>

          <div class="trilingual-content">
            ${renderLanguageLines(
              slide.lines
            )}
          </div>

        </article>
      `;


    default:

      return `
        <p>
          Unsupported slide type.
        </p>
      `;
  }
}


/* ========================================
   RENDER CURRENT SLIDE
   ======================================== */

function renderCurrentSlide() {

  stopSpeech();

  if (
    !currentChapterData ||
    currentSlides.length === 0
  ) {
    return;
  }

  const main =
    document.querySelector("main");

  if (!main) {
    console.error(
      "Elemento <main> não encontrado."
    );

    return;
  }

  const chapter =
    currentChapterData.chapter;

  const slide =
    currentSlides[
      currentSlideIndex
    ];

  const chapterTitle =
    [
      chapter.title?.en,
      chapter.title?.es,
      chapter.title?.pt
    ]
      .filter(Boolean)
      .join(" · ");

  const isFirst =
    currentSlideIndex === 0;

  const isLast =
    currentSlideIndex ===
    currentSlides.length - 1;


  main.innerHTML = `
    <section
      class="
        chapter-view
        current-${slide.type}
      "
    >

      <header class="chapter-header">

        <p class="chapter-number">
          Chapter ${chapter.number}
        </p>

        <h1 class="chapter-title">
          ${escapeHtml(
            chapterTitle
          )}
        </h1>

      </header>


      ${renderSlideContent(slide)}


      <footer class="chapter-footer">

        <div class="chapter-progress">

          ${currentSlideIndex + 1}
          /
          ${currentSlides.length}

        </div>


        <nav
          class="slider-controls"
          aria-label="Carousel controls"
        >

          <button
            id="previousButton"
            class="slider-button"
            type="button"
            ${isFirst ? "disabled" : ""}
            aria-label="Previous"
          >
            ◀
          </button>


          <button
            id="playPauseButton"
            class="slider-button"
            type="button"
            aria-label="Play or pause"
          >
            ▶
          </button>


          <button
            id="nextButton"
            class="slider-button"
            type="button"
            ${isLast ? "disabled" : ""}
            aria-label="Next"
          >
            ▶
          </button>

        </nav>

      </footer>

    </section>
  `;


  attachSliderEvents();


  console.log(
    `Rendered smart slide ${
      currentSlideIndex + 1
    }/${currentSlides.length}`,
    slide
  );
}


/* ========================================
   SLIDER EVENTS
   ======================================== */

function attachSliderEvents() {

  const previousButton =
    document.getElementById(
      "previousButton"
    );

  const nextButton =
    document.getElementById(
      "nextButton"
    );

  const playPauseButton =
    document.getElementById(
      "playPauseButton"
    );


  previousButton?.addEventListener(
    "click",
    showPreviousSlide
  );


  nextButton?.addEventListener(
    "click",
    showNextSlide
  );


  playPauseButton?.addEventListener(
    "click",
    toggleSpeech
  );
}


/* ========================================
   PREVIOUS
   ======================================== */

function showPreviousSlide() {

  if (currentSlideIndex > 0) {

    currentSlideIndex--;

    renderCurrentSlide();
  }
}


/* ========================================
   NEXT
   ======================================== */

function showNextSlide() {

  if (
    currentSlideIndex <
    currentSlides.length - 1
  ) {

    currentSlideIndex++;

    renderCurrentSlide();
  }
}


/* ========================================
   SPEECH SUPPORT
   ======================================== */

function speechIsSupported() {

  return (
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}


/* ========================================
   LANGUAGE TO LOCALE
   ======================================== */

function getLocale(language) {

  const locales = {
    en: "en-US",
    es: "es-ES",
    pt: "pt-BR"
  };

  return (
    locales[language] ??
    "pt-BR"
  );
}


/* ========================================
   BUILD SPEECH QUEUE
   ======================================== */

function buildSpeechQueue(slide) {

  const queue = [];

  if (!slide) {
    return queue;
  }


  /* Paragraph */

  if (
    slide.type === "paragraph"
  ) {

    if (slide.title) {
      queue.push({
        text: slide.title,
        language: "pt"
      });
    }

    if (slide.content) {
      queue.push({
        text: slide.content,
        language: "pt"
      });
    }

    return queue;
  }


  /* Trilingual slides */

  if (
    Array.isArray(slide.lines)
  ) {

    slide.lines.forEach(line => {

      if (!line.text) {
        return;
      }

      queue.push({
        text: line.text,
        language: line.language
      });
    });
  }


  return queue;
}


/* ========================================
   CREATE UTTERANCE
   ======================================== */

function createUtterance(item) {

  const utterance =
    new SpeechSynthesisUtterance(
      item.text
    );

  utterance.lang =
    getLocale(item.language);

  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.volume = 1;

  return utterance;
}


/* ========================================
   START SPEECH
   ======================================== */

function startSpeech() {

  if (!speechIsSupported()) {

    console.warn(
      "Speech Synthesis is not supported by this browser."
    );

    return;
  }

  const slide =
    currentSlides[
      currentSlideIndex
    ];

  const queue =
    buildSpeechQueue(slide);

  if (queue.length === 0) {

    console.warn(
      "No text available for speech."
    );

    return;
  }


  stopSpeech();


  currentUtterances =
    queue.map(
      createUtterance
    );


  currentUtterances.forEach(
    (utterance, index) => {

      if (
        index ===
        currentUtterances.length - 1
      ) {

        utterance.onend = () => {

          isSpeaking = false;
          isPaused = false;

          updatePlayPauseButton();

          console.log(
            "Slide speech completed."
          );
        };
      }


      utterance.onerror = event => {

        console.error(
          "Speech error:",
          event.error
        );

        isSpeaking = false;
        isPaused = false;

        updatePlayPauseButton();
      };


      window.speechSynthesis.speak(
        utterance
      );
    }
  );


  isSpeaking = true;
  isPaused = false;

  updatePlayPauseButton();


  console.log(
    "Speech started."
  );
}


/* ========================================
   PAUSE SPEECH
   ======================================== */

function pauseSpeech() {

  if (
    !speechIsSupported() ||
    !isSpeaking
  ) {
    return;
  }


  window.speechSynthesis.pause();

  isPaused = true;

  updatePlayPauseButton();


  console.log(
    "Speech paused."
  );
}


/* ========================================
   RESUME SPEECH
   ======================================== */

function resumeSpeech() {

  if (
    !speechIsSupported() ||
    !isPaused
  ) {
    return;
  }


  window.speechSynthesis.resume();

  isPaused = false;

  updatePlayPauseButton();


  console.log(
    "Speech resumed."
  );
}


/* ========================================
   STOP SPEECH
   ======================================== */

function stopSpeech() {

  if (!speechIsSupported()) {
    return;
  }


  window.speechSynthesis.cancel();

  isSpeaking = false;
  isPaused = false;

  currentUtterances = [];

  updatePlayPauseButton();
}


/* ========================================
   PLAY / PAUSE TOGGLE
   ======================================== */

function toggleSpeech() {

  if (!isSpeaking) {

    startSpeech();

    return;
  }


  if (isPaused) {

    resumeSpeech();

    return;
  }


  pauseSpeech();
}


/* ========================================
   UPDATE PLAY BUTTON
   ======================================== */

function updatePlayPauseButton() {

  const button =
    document.getElementById(
      "playPauseButton"
    );

  if (!button) {
    return;
  }


  if (!isSpeaking) {

    button.textContent = "▶";
    button.setAttribute(
      "aria-label",
      "Play"
    );

    return;
  }


  if (isPaused) {

    button.textContent = "▶";
    button.setAttribute(
      "aria-label",
      "Resume"
    );

    return;
  }


  button.textContent = "Ⅱ";
  button.setAttribute(
    "aria-label",
    "Pause"
  );
}


/* ========================================
   START CONTENT ENGINE
   ======================================== */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    console.log(
      "Starting SIYAYO Content Engine..."
    );


    /* 1. Academy Manifest */

    const academy =
      await loadAcademyManifest();

    if (!academy) {
      return;
    }


    /* 2. Active Chapter */

    const activeChapter =
      findActiveChapter(academy);

    if (!activeChapter) {
      return;
    }


    /* 3. Chapter JSON */

    const chapterData =
      await loadChapter(
        activeChapter
      );

    if (!chapterData) {
      return;
    }


    /* 4. Store Chapter */

    currentChapterData =
      chapterData;


    /* 5. Generate Smart Slides */

    currentSlides =
      buildSlides(
        chapterData
      );


    if (
      currentSlides.length === 0
    ) {

      console.warn(
        "No slides were generated."
      );

      return;
    }


    /* 6. Start at Slide 1 */

    currentSlideIndex = 0;


    /* 7. Render */

    renderCurrentSlide();


    console.log(
      "SIYAYO Content Engine v0.5 ready."
    );
  }
);


/* ========================================
   SAFETY: STOP SPEECH WHEN LEAVING PAGE
   ======================================== */

window.addEventListener(
  "beforeunload",
  stopSpeech
);
