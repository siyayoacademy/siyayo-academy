/* ========================================
   SIYAYO ACADEMY
   Content Engine - v0.4A
   Chapter Slider: Previous / Next
   ======================================== */

const ACADEMY_MANIFEST = "data/academy.json";

let currentChapterData = null;
let currentSectionIndex = 0;


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

    console.log("SIYAYO ACADEMY manifest loaded successfully.");
    console.log("Project:", academy.project?.name);
    console.log("Product:", academy.project?.product);
    console.log("Languages:", academy.project?.languageOrder);

    console.log(`${academy.chapters.length} chapters loaded.`);
    console.log(
      `${academy.extraModules.length} extra module(s) loaded.`
    );

    return academy;

  } catch (error) {
    console.error("SIYAYO ACADEMY loader error:", error);
    return null;
  }
}


/* ========================================
   VALIDATE ACADEMY MANIFEST
   ======================================== */

function validateAcademyManifest(academy) {

  if (!academy) {
    throw new Error("academy.json está vazio ou inválido.");
  }

  if (!academy.project) {
    throw new Error(
      "academy.json não possui o objeto 'project'."
    );
  }

  if (!Array.isArray(academy.chapters)) {
    throw new Error(
      "academy.json não possui uma lista válida de capítulos."
    );
  }

  if (!Array.isArray(academy.extraModules)) {
    throw new Error(
      "academy.json não possui uma lista válida de módulos extras."
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
    console.warn("No active chapter was found.");
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
    const response = await fetch(chapterReference.path);

    if (!response.ok) {
      throw new Error(
        `Erro ao carregar ${chapterReference.path}: ${response.status}`
      );
    }

    const chapterData = await response.json();

    validateChapter(chapterData);

    console.log("Chapter JSON loaded successfully.");
    console.log("Chapter number:", chapterData.chapter?.number);
    console.log("Chapter slug:", chapterData.chapter?.slug);
    console.log("Chapter title:", chapterData.chapter?.title);
    console.log(
      "Sections:",
      chapterData.chapter?.sections?.length
    );

    return chapterData;

  } catch (error) {
    console.error("SIYAYO Chapter Loader error:", error);
    return null;
  }
}


/* ========================================
   VALIDATE CHAPTER
   ======================================== */

function validateChapter(chapterData) {

  if (!chapterData) {
    throw new Error("chapter.json está vazio ou inválido.");
  }

  if (!chapterData.chapter) {
    throw new Error(
      "chapter.json não possui o objeto 'chapter'."
    );
  }

  if (!Array.isArray(chapterData.chapter.sections)) {
    throw new Error(
      "chapter.json não possui uma lista válida de sections."
    );
  }
}


/* ========================================
   GET SECTION CONTENT
   ======================================== */

function getSectionContent(section) {

  if (!section?.content) {
    return "";
  }

  /*
    Nesta primeira versão:
    PT é usado como conteúdo principal para os
    parágrafos explicativos.

    Mais adiante o seletor EN / ES / PT
    controlará esta escolha.
  */

  return (
    section.content.pt ??
    section.content.en ??
    section.content.es ??
    ""
  );
}


/* ========================================
   RENDER CURRENT SLIDE
   ======================================== */

function renderCurrentSlide() {

  if (!currentChapterData) {
    return;
  }

  const main = document.querySelector("main");

  if (!main) {
    console.error("Elemento <main> não encontrado.");
    return;
  }

  const chapter = currentChapterData.chapter;
  const sections = chapter.sections ?? [];

  if (sections.length === 0) {
    console.warn("O capítulo não possui seções.");
    return;
  }

  const section = sections[currentSectionIndex];

  const chapterTitle = [
    chapter.title?.en,
    chapter.title?.es,
    chapter.title?.pt
  ]
    .filter(Boolean)
    .join(" · ");

  const sectionContent =
    getSectionContent(section);

  const isFirst =
    currentSectionIndex === 0;

  const isLast =
    currentSectionIndex === sections.length - 1;


  main.innerHTML = `
    <section class="chapter-view">

      <header class="chapter-header">

        <p class="chapter-number">
          Chapter ${chapter.number}
        </p>

        <h1 class="chapter-title">
          ${chapterTitle}
        </h1>

      </header>


      <article class="chapter-section">

        <h2 class="section-title">
          ${section.title ?? ""}
        </h2>

        <p class="section-content">
          ${sectionContent}
        </p>

      </article>


      <footer class="chapter-footer">

        <div class="chapter-progress">
          ${currentSectionIndex + 1} / ${sections.length}
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
            disabled
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
    `Rendered section ${currentSectionIndex + 1}/${sections.length}:`,
    section.id
  );
}


/* ========================================
   SLIDER EVENTS
   ======================================== */

function attachSliderEvents() {

  const previousButton =
    document.getElementById("previousButton");

  const nextButton =
    document.getElementById("nextButton");


  previousButton?.addEventListener(
    "click",
    showPreviousSection
  );


  nextButton?.addEventListener(
    "click",
    showNextSection
  );
}


/* ========================================
   PREVIOUS
   ======================================== */

function showPreviousSection() {

  if (!currentChapterData) {
    return;
  }

  if (currentSectionIndex > 0) {

    currentSectionIndex--;

    renderCurrentSlide();
  }
}


/* ========================================
   NEXT
   ======================================== */

function showNextSection() {

  if (!currentChapterData) {
    return;
  }

  const sections =
    currentChapterData.chapter.sections;

  if (
    currentSectionIndex <
    sections.length - 1
  ) {

    currentSectionIndex++;

    renderCurrentSlide();
  }
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


    // 1. Load Academy
    const academy =
      await loadAcademyManifest();

    if (!academy) {
      return;
    }


    // 2. Find active chapter
    const activeChapter =
      findActiveChapter(academy);

    if (!activeChapter) {
      return;
    }


    // 3. Load chapter
    const chapterData =
      await loadChapter(activeChapter);

    if (!chapterData) {
      return;
    }


    // 4. Store application state
    currentChapterData = chapterData;
    currentSectionIndex = 0;


    // 5. Render first slide
    renderCurrentSlide();


    console.log(
      "SIYAYO Content Engine v0.4A ready."
    );
  }
);
