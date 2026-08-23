/* ========================================
   SIYAYO ACADEMY
   Content Engine - v0.2
   Academy + Chapter Loader
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

    // 4. Content Engine ready
    console.log(
      "SIYAYO Content Engine v0.2 ready."
    );

    console.log(
      "Active content:",
      chapterData
    );
  }
);
