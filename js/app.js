/* ========================================
   SIYAYO ACADEMY
   Application Loader - v0.1
   ======================================== */

const ACADEMY_MANIFEST = "data/academy.json";

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

    const chapters = academy.chapters ?? [];
    const extraModules = academy.extraModules ?? [];

    console.log(`${chapters.length} chapters loaded.`);
    console.log(`${extraModules.length} extra module(s) loaded.`);

    return academy;
  } catch (error) {
    console.error("SIYAYO ACADEMY loader error:", error);
    return null;
  }
}

function validateAcademyManifest(academy) {
  if (!academy) {
    throw new Error("academy.json está vazio ou inválido.");
  }

  if (!academy.project) {
    throw new Error("academy.json não possui o objeto 'project'.");
  }

  if (!Array.isArray(academy.chapters)) {
    throw new Error("academy.json não possui uma lista válida de capítulos.");
  }

  if (!Array.isArray(academy.extraModules)) {
    throw new Error(
      "academy.json não possui uma lista válida de módulos extras."
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const academy = await loadAcademyManifest();

  if (!academy) {
    return;
  }

  console.log("SIYAYO Content Engine v0.1 ready.");
});
