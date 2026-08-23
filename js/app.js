/* ========================================
   SIYAYO ACADEMY
   Content Engine - v0.3
   Academy + Chapter Loader + DOM Renderer
   ======================================== */

const ACADEMY_MANIFEST = "data/academy.json";


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

    const chapters = academy.chapters ?? [];
    const extraModules = academy.extraModules ?? [];

    console.log(
      `${chapters.length} chapters loaded.`
    );

    console.log(
      `${extraModules.length} extra module(s) loaded.`
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
   VALIDATE ACADEMY MANIFEST
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

    const response = await fetch(
      chapterReference.path
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao carregar ${chapterReference.path}: ${response.status}`
      );
    }

    const chapterData = await response.json();

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
   RENDER ACTIVE CHAPTER
   ======================================== */

function renderActiveChapter(chapterData) {

  const main = document.querySelector("main");

  if (!main) {
    console.error(
      "Elemento <main> não encontrado."
    );

    return;
  }

  const chapter = chapterData.chapter;
  const sections = chapter.sections ?? [];

  if (sections.length === 0) {
    console.warn(
      "O capítulo não possui seções para exibir."
    );

    return;
  }

  const firstSection = sections[0];

  const chapterTitle = `
    ${chapter.title?.en ?? ""} ·
    ${chapter.title?.es ?? ""} ·
    ${chapter.title?.pt ?? ""}
  `;

  let sectionContent = "";

  if (firstSection.content?.pt) {
    sectionContent = firstSection.content.pt;
  } else if (firstSection.content?.en) {
    sectionContent = firstSection.content.en;
  } else if (firstSection.content?.es) {
    sectionContent = firstSection.content.es;
  }

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
          ${firstSection.title ?? ""}
        </h2>

        <p class="section-content">
          ${sectionContent}
        </p>

      </article>

      <footer class="chapter-progress">
        1 / ${sections.length}
      </footer>

    </section>
  `;

  console.log(
    "First chapter section rendered successfully."
  );
}


/* ========================================
   START SIYAYO CONTENT ENGINE
   ======================================== */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    console.log(
      "Starting SIYAYO Content Engine..."
    );

    // 1. Load master manifest
    const academy =
      await loadAcademyManifest();

    if (!academy) {
      return;
    }

    // 2. Discover active chapter
    const activeChapter =
      findActiveChapter(academy);

    if (!activeChapter) {
      return;
    }

    // 3. Load active chapter JSON
    const chapterData =
      await loadChapter(activeChapter);

    if (!chapterData) {
      return;
    }

    // 4. Render first section
    renderActiveChapter(chapterData);

    // 5. Content Engine ready
    console.log(
      "SIYAYO Content Engine v0.3 ready."
    );

    console.log(
      "Active content:",
      chapterData
    );
  }
);
