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
let pendingSpeechTimer = null;


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


function renderAcademyChapterStack(academy) {
  const stack = document.getElementById("academyChapterStack");
  if (!stack || !academy) return;

  const entries = [
    ...(academy.chapters ?? []).map(chapter => ({
      number: String(chapter.number).padStart(2, "0"),
      title: chapter.title,
      status: chapter.status,
      slug: chapter.slug
    })),
    ...(academy.extraModules ?? []).map(module => ({
      number: "QW",
      title: module.title,
      status: module.status,
      slug: module.slug
    }))
  ];

  stack.innerHTML = entries.map(entry => {
    const title = [entry.title?.en, entry.title?.es, entry.title?.pt].filter(Boolean).join(" · ");
    const active = entry.status === "active";
    return `<button class="academy-chapter-link${active ? " is-active" : ""}" type="button" data-academy-chapter="${escapeHtml(entry.slug || "")}" data-status="${escapeHtml(entry.status || "")}" aria-disabled="${active ? "false" : "true"}"><span>${escapeHtml(entry.number)}</span><strong>${escapeHtml(title)}</strong></button>`;
  }).join("");
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
   VALIDATE CHAPTER=[
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


function formatSemanticSurfaceSentence(
  sentence = "",
  line = {},
  surfaces = []
) {

  const realizationReader =
    globalThis
      .SIYAYOStorySemanticSurfaceRealization;

  const domMaterialization =
    globalThis
      .SIYAYOStorySemanticSurfaceDOMMaterialization;

  if (
    !realizationReader ||
    typeof realizationReader.read !== "function" ||
    !domMaterialization ||
    typeof domMaterialization.describe !== "function" ||
    !Array.isArray(surfaces)
  ) {
    return formatTargetSentence(
      sentence,
      line.target
    );
  }

  for (const surface of surfaces) {

    const realization =
      realizationReader.read(
        surface,
        line.language
      );

    if (!realization) {
      continue;
    }

    const descriptor =
      domMaterialization.describe(
        realization
      );

    if (!descriptor) {
      continue;
    }

    const source = String(sentence);
    const index =
      source.toLowerCase().indexOf(
        descriptor.text.toLowerCase()
      );

    if (index === -1) {
      continue;
    }

    const before =
      source.slice(0, index);

    const match =
      source.slice(
        index,
        index + descriptor.text.length
      );

    const after =
      source.slice(
        index + descriptor.text.length
      );

    return `
      ${escapeHtml(before)}
      <span
        data-surface-id="${escapeHtml(descriptor.surfaceId)}"
        data-surface-language="${escapeHtml(descriptor.language)}"
        role="button"
        tabindex="0"
      >
        ${escapeHtml(match)}
      </span>
      ${escapeHtml(after)}
    `;
  }

  return formatTargetSentence(
    sentence,
    line.target
  );
}


/* ========================================
   TRILINGUAL LINES
   ======================================== */

function createLanguageLines(
  content,
  targetWords = {},
  options = {}
) {

  const defaultLabels = {
    en: "IN ENGLISH",
    es: "EN ESPAÑOL",
    pt: "EM PORTUGUÊS"
  };


  const labels = {
    ...defaultLabels,
    ...(options.labels ?? {})
  };


  const speechLanguage =
    options.speechLanguage ?? null;


  const order = [
    {
      code: "en",
      label: labels.en
    },
    {
      code: "es",
      label: labels.es
    },
    {
      code: "pt",
      label: labels.pt
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
          ] ?? "",

        speechLanguage:
          speechLanguage ??
          language.code
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
        section.content,
        {},
        {
          labels:
            section.labels,

          speechLanguage:
            section.speechLanguage
        }
      ),
    ...(section.examples ? { examples: section.examples } : {})
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
                ),
              ...(item.definition ? { definition: item.definition } : {}),
              ...(item.relatedVocabulary ? { relatedVocabulary: item.relatedVocabulary } : {}),
              ...(item.relatedExamples ? { relatedExamples: item.relatedExamples } : {}),
              ...(item.surfaces ? { surfaces: item.surfaces } : {}),
              ...(item.assessmentLeaf ? { assessmentLeaf: item.assessmentLeaf } : {})
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
              title: item.intent
                ? `${section.title} · ${item.intent}`
                : section.title,

              lines:
                 createLanguageLines(
                   item,
                   item.targetWords ?? {}
              ),
              ...(item.intent ? { intent: item.intent } : {}),
              ...(item.extension ? {
                extensionLines: createLanguageLines(item.extension)
              } : {}),
              ...(item.surfaces ? { surfaces: item.surfaces } : {}),
              ...(item.assessmentLeaf ? { assessmentLeaf: item.assessmentLeaf } : {})
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

function renderLanguageLines(
  lines = [],
  surfaces = []
) {

  return lines
    .map(line => {

      const formattedText =
        formatSemanticSurfaceSentence(
          line.text,
          line,
          surfaces
        );

      const hasSemanticSurface =
        formattedText.includes(
          "data-surface-id="
        );

      const interactionAttributes =
        hasSemanticSurface
          ? ""
          : `
              role="button"
              tabindex="0"
              aria-label="Ouvir ${escapeHtml(line.label)}"
            `;

      return `
        <div
           class="
              language-line
             language-${line.language}
              "
              data-language="${line.language}"
              ${interactionAttributes}
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



function renderCompactTrilingualExamples(content = {}) {
  const lines = createLanguageLines(content);
  if (lines.length === 0) return "";
  return `
    <div class="slide-related-content">
      ${renderLanguageLines(lines)}
    </div>
  `;
}

function renderVocabularyRows(vocabulary = {}) {
  const lines = ["en", "es", "pt"]
    .filter(language => Array.isArray(vocabulary?.[language]) && vocabulary[language].length)
    .map(language => {
      const labels = { en: "IN ENGLISH", es: "EN ESPAÑOL", pt: "EM PORTUGUÊS" };
      return `<p class="slide-vocabulary-row"><strong>${labels[language]}</strong> · ${escapeHtml(vocabulary[language].join(" · "))}</p>`;
    })
    .join("");
  return lines ? `<div class="slide-related-content">${lines}</div>` : "";
}

function renderGrammarExample(example, language) {
  const item = typeof example === "string" ? { text: example, targets: [] } : example;
  let html = escapeHtml(item.text ?? "");

  (item.targets ?? [])
    .slice()
    .sort((left, right) => String(right).length - String(left).length)
    .forEach(target => {
      const escapedTarget = escapeHtml(target);
      html = html.split(escapedTarget).join(`<span class="word-type-target">${escapedTarget}</span>`);
    });

  return `
    <button
      type="button"
      class="grammar-example"
      data-speech-language="${language}"
      data-speech-text="${escapeHtml(item.text ?? "")}"
      aria-label="Ouvir exemplo em ${language === "en" ? "inglês" : language === "es" ? "espanhol" : "português"}"
    >
      <span class="grammar-example-speaker" aria-hidden="true">🔊</span>
      <span class="grammar-example-text">${html}</span>
    </button>
  `;
}

function renderGrammarLanguagePanels(lines = [], examples = {}) {
  const panels = lines.map((line, index) => {
    const exampleItems = Array.isArray(examples?.[line.language])
      ? examples[line.language]
      : [];

    return `
      <section
        class="grammar-language-panel${index === 0 ? " is-active" : ""}"
        data-grammar-language="${line.language}"
        aria-hidden="${index === 0 ? "false" : "true"}"
      >
        <div
          class="grammar-definition"
          role="button"
          tabindex="0"
          data-definition-language="${line.language}"
          data-definition-speech-language="${line.speechLanguage ?? "pt"}"
          data-definition-speech-text="${escapeHtml(line.text ?? "")}"
          aria-label="Ouvir explicação"
        >
          <p class="grammar-definition-text">${escapeHtml(line.text ?? "")}</p>
        </div>
        ${exampleItems.length ? `
          <div class="grammar-examples" data-example-language="${line.language}">
            <span class="grammar-examples-label">EXAMPLES</span>
            ${exampleItems.map(example => renderGrammarExample(example, line.language)).join("")}
          </div>
        ` : ""}
      </section>
    `;
  }).join("");

  return `
    <div class="grammar-language-carousel" data-grammar-carousel>
      <div class="grammar-language-tabs" role="tablist" aria-label="Language">
        ${lines.map((line, index) => `
          <button
            type="button"
            class="grammar-language-tab${index === 0 ? " is-active" : ""}"
            data-grammar-tab="${line.language}"
          >${line.language === "en" ? "ENGLISH" : line.language === "es" ? "ESPAÑOL" : "PORTUGUÊS"}</button>
        `).join("")}
      </div>
      <div class="grammar-language-track">${panels}</div>
    </div>
  `;
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

          ${renderGrammarLanguagePanels(
            slide.lines,
            slide.examples
          )}

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

          ${slide.definition?.pt ? `<p class="section-content slide-definition">${escapeHtml(slide.definition.pt)}</p>` : ""}

          <div class="trilingual-content">
            ${renderLanguageLines(
              slide.lines,
              slide.surfaces ?? []
            )}
          </div>

          ${renderVocabularyRows(slide.relatedVocabulary)}

          ${Array.isArray(slide.relatedExamples)
            ? slide.relatedExamples.map(renderCompactTrilingualExamples).join("")
            : ""}

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
              slide.lines,
              slide.surfaces ?? []
            )}
          </div>

          ${Array.isArray(slide.extensionLines) && slide.extensionLines.length
            ? `<div class="slide-extension"><p class="slide-extension-label">CONNECTION</p>${renderLanguageLines(slide.extensionLines)}</div>`
            : ""}

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
   ASSESSMENT LEAF SELECT AVAILABILITY
   ======================================== */

function semanticSurfaceSelectIsAvailable(
  surfaceId
) {

  const leafSurface =
    globalThis
      .SIYAYOStoryAssessmentLeafSurface;

  const slide =
    currentSlides[
      currentSlideIndex
    ];

  if (
    !surfaceId ||
    !slide ||
    !leafSurface ||
    typeof leafSurface.read !== "function"
  ) {
    return false;
  }

  try {
    const binding =
      leafSurface.read(
        slide
      );

    return Boolean(
      binding &&
      binding.surfaceId === surfaceId
    );
  } catch (error) {
    return false;
  }
}


/* ========================================
   SURFACE ACTION CHOICE RENDERING
   ======================================== */

function renderSemanticSurfaceActionChoice(
  line,
  choice
) {

  const domMaterialization =
    globalThis
      .SIYAYOStorySemanticSurfaceActionChoiceDOMMaterialization;

  if (
    !line ||
    typeof line.insertAdjacentHTML !== "function" ||
    !domMaterialization ||
    typeof domMaterialization.describe !== "function"
  ) {
    return;
  }

  const descriptor =
    domMaterialization.describe(
      choice
    );

  if (
    !descriptor ||
    !Array.isArray(descriptor.actions) ||
    descriptor.actions.length === 0
  ) {
    return;
  }

  const actions =
    descriptor.actions
      .map(action => {
        const label =
          action.action === "explore"
            ? "Explore"
            : action.action === "select"
              ? "Select"
              : action.action;

        return `
          <button
            type="${escapeHtml(action.type)}"
            data-surface-action="${escapeHtml(action.action)}"
          >
            ${escapeHtml(label)}
          </button>
        `;
      })
      .join("");

  const surfaceSelectorValue =
    descriptor.surfaceId
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');

  const existingChoice =
    document.querySelector(
      `[data-action-choice-for="${surfaceSelectorValue}"]`
    );

  if (
    existingChoice &&
    typeof existingChoice.remove === "function"
  ) {
    existingChoice.remove();
  }

  line.insertAdjacentHTML(
    "afterend",
    `
      <div
        class="semantic-surface-action-choice"
        data-action-choice-for="${escapeHtml(descriptor.surfaceId)}"
        role="group"
        aria-label="Surface actions"
      >
        ${actions}
      </div>
    `
  );
}


/* ========================================
   SURFACE ACTION CHOICE EVENTS
   ======================================== */

function initializeSemanticSurfaceActionChoiceEvents() {

  document.addEventListener(
    "click",
    event => {

      const target =
        event &&
        event.target;

      if (
        !target ||
        typeof target.closest !== "function"
      ) {
        return;
      }

      const actionButton =
        target.closest(
          "[data-surface-action]"
        );

      if (!actionButton) {
        return;
      }

      const actionChoice =
        actionButton.closest(
          "[data-action-choice-for]"
        );

      if (!actionChoice) {
        return;
      }

      const interactionIntent =
        globalThis
          .SIYAYOStorySemanticSurfaceInteractionIntent;

      if (
        !interactionIntent ||
        typeof interactionIntent.create !== "function"
      ) {
        return;
      }

      const intent =
        interactionIntent.create({
          surfaceId:
            actionChoice.dataset
              .actionChoiceFor,
          action:
            actionButton.dataset
              .surfaceAction
        });

      if (
        !intent ||
        intent.action !== "select"
      ) {
        return;
      }

      const slide =
        currentSlides[
          currentSlideIndex
        ];

      const leafSurface =
        globalThis
          .SIYAYOStoryAssessmentLeafSurface;

      if (
        !slide ||
        !leafSurface ||
        typeof leafSurface.read !== "function"
      ) {
        return;
      }

      let binding = null;

      try {
        binding =
          leafSurface.read(
            slide
          );
      } catch (error) {
        return;
      }

      if (
        !binding ||
        binding.surfaceId !== intent.surfaceId
      ) {
        return;
      }

      const leafSelection =
        globalThis
          .SIYAYOStoryAssessmentLeafSelection;

      if (
        !leafSelection ||
        typeof leafSelection.select !== "function"
      ) {
        return;
      }

      try {
        leafSelection.select(
          slide
        );
      } catch (error) {
        return;
      }
    }
  );
}


/* ========================================
   SLIDER EVENTS
   ======================================== */

function setGrammarLanguage(language) {
  const carousel = document.querySelector("[data-grammar-carousel]");
  if (!carousel) return;

  carousel.querySelectorAll("[data-grammar-language]").forEach(panel => {
    const active = panel.dataset.grammarLanguage === language;
    panel.classList.toggle("is-active", active);
    panel.setAttribute("aria-hidden", active ? "false" : "true");
  });

  carousel.querySelectorAll("[data-grammar-tab]").forEach(tab => {
    tab.classList.toggle("is-active", tab.dataset.grammarTab === language);
  });
}

function attachGrammarCarouselEvents() {
  const carousel = document.querySelector("[data-grammar-carousel]");
  if (!carousel) return;

  const languages = Array.from(carousel.querySelectorAll("[data-grammar-language]"))
    .map(panel => panel.dataset.grammarLanguage);

  carousel.querySelectorAll("[data-grammar-tab]").forEach(tab => {
    tab.addEventListener("click", () => setGrammarLanguage(tab.dataset.grammarTab));
  });

  carousel.querySelectorAll(".grammar-definition").forEach(definition => {
    const speakDefinition = () => {
      speakText(
        definition.dataset.definitionSpeechText ?? "",
        definition.dataset.definitionSpeechLanguage ?? "pt"
      );
    };

    definition.addEventListener("click", event => {
      event.stopPropagation();
      speakDefinition();
    });

    definition.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      speakDefinition();
    });
  });

  carousel.querySelectorAll(".grammar-example").forEach(example => {
    example.addEventListener("click", event => {
      event.stopPropagation();
      speakText(
        example.dataset.speechText ?? "",
        example.dataset.speechLanguage ?? "en"
      );
    });
  });

  let startX = null;
  let startY = null;

  carousel.addEventListener("touchstart", event => {
    const touch = event.touches[0];
    startX = touch?.clientX ?? null;
    startY = touch?.clientY ?? null;
  }, { passive: true });

  carousel.addEventListener("touchend", event => {
    if (startX === null || startY === null) return;
    const touch = event.changedTouches[0];
    const dx = (touch?.clientX ?? startX) - startX;
    const dy = (touch?.clientY ?? startY) - startY;
    startX = null;
    startY = null;

    if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;

    const active = carousel.querySelector("[data-grammar-language].is-active");
    const index = Math.max(0, languages.indexOf(active?.dataset.grammarLanguage));
    const nextIndex = dx < 0
      ? Math.min(languages.length - 1, index + 1)
      : Math.max(0, index - 1);

    if (nextIndex !== index) setGrammarLanguage(languages[nextIndex]);
  }, { passive: true });
}

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

  attachGrammarCarouselEvents();


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

     const languageLines =
    document.querySelectorAll(
      ".language-line"
    );


  languageLines.forEach(line => {

    line.addEventListener(
      "click",
      event => {

        /*
           Future Target Word navigation:
           clicking the highlighted target word
           must not trigger line speech.
        */

        const semanticSurface =
          event.target.closest(
            "[data-surface-id]"
          );

        if (semanticSurface) {
          const attention =
            globalThis
              .SIYAYOStorySemanticSurfaceAttention;

          if (
            attention &&
            typeof attention.focus === "function"
          ) {
            const focusedSurface =
              attention.focus({
                surfaceId:
                  semanticSurface.dataset
                    .surfaceId
              });

            const actionChoice =
              globalThis
                .SIYAYOStorySemanticSurfaceActionChoice;

            if (
              focusedSurface &&
              actionChoice &&
              typeof actionChoice.describe === "function"
            ) {
              const choice =
                actionChoice.describe({
                  surfaceId:
                    focusedSurface.surfaceId,
                  selectAvailable:
                    semanticSurfaceSelectIsAvailable(
                      focusedSurface.surfaceId
                    )
                });

              renderSemanticSurfaceActionChoice(
                line,
                choice
              );
            }
          }

          return;
        }

        if (
          event.target.closest(
            ".target-word"
          )
        ) {
          return;
        }


        const language =
          line.dataset.language;

        speakLanguageLine(
          language
        );
      }
    );


    line.addEventListener(
      "keydown",
      event => {

        if (
          event.key !== "Enter" &&
          event.key !== " "
        ) {
          return;
        }


        const semanticSurface =
          event.target.closest(
            "[data-surface-id]"
          );

        if (semanticSurface) {
          const attention =
            globalThis
              .SIYAYOStorySemanticSurfaceAttention;

          if (
            attention &&
            typeof attention.focus === "function"
          ) {
            const focusedSurface =
              attention.focus({
                surfaceId:
                  semanticSurface.dataset
                    .surfaceId
              });

            const actionChoice =
              globalThis
                .SIYAYOStorySemanticSurfaceActionChoice;

            if (
              focusedSurface &&
              actionChoice &&
              typeof actionChoice.describe === "function"
            ) {
              const choice =
                actionChoice.describe({
                  surfaceId:
                    focusedSurface.surfaceId,
                  selectAvailable:
                    semanticSurfaceSelectIsAvailable(
                      focusedSurface.surfaceId
                    )
                });

              renderSemanticSurfaceActionChoice(
                line,
                choice
              );
            }
          }

          return;
        }

        if (
          event.target.closest(
            ".target-word"
          )
        ) {
          return;
        }


        event.preventDefault();

        const language =
          line.dataset.language;

        speakLanguageLine(
          language
        );
      }
    );
  });

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


  /* Grammar / Examples / Conversation */

  if (
    Array.isArray(slide.lines)
  ) {

    slide.lines.forEach(line => {

      if (!line.text) {
        return;
      }

      queue.push({
  text: line.text,

  language:
    line.speechLanguage ??
    line.language,

  displayLanguage:
    line.language
});
    });
  }


  return queue;
}

/* ========================================
   SPEECH VISUAL HIGHLIGHT
   ======================================== */

function highlightSpeakingLanguage(language) {

  clearSpeechHighlight();

  const line = document.querySelector(
    `.language-line[data-language="${language}"]`
  );

  if (line) {
    line.classList.add("is-speaking");
  }
}


function clearSpeechHighlight() {

  document
    .querySelectorAll(".language-line.is-speaking")
    .forEach(line => {
      line.classList.remove("is-speaking");
    });
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
   SPEAK SINGLE LANGUAGE LINE
   ======================================== */


function speakLanguageLine(language) {

  if (!speechIsSupported()) {
    console.warn(
      "Speech Synthesis is not supported by this browser."
    );

    return;
  }

  const slide =
    currentSlides[currentSlideIndex];

  if (
    !slide ||
    !Array.isArray(slide.lines)
  ) {
    return;
  }

  const line =
    slide.lines.find(
      item =>
        item.language === language
    );

  if (!line?.text) {
    return;
  }

  stopSpeech();

  const item = {
    text:
      line.text,

    language:
      line.speechLanguage ??
      line.language,

    displayLanguage:
      line.language
  };

  const utterance =
    createUtterance(item);

  utterance.onstart = () => {

    isSpeaking = true;
    isPaused = false;

    highlightSpeakingLanguage(
      item.displayLanguage
    );

    updatePlayPauseButton();
  };

  utterance.onend = () => {

    clearSpeechHighlight();

    isSpeaking = false;
    isPaused = false;

    currentUtterances = [];

    updatePlayPauseButton();
  };

  utterance.onerror = event => {

    clearSpeechHighlight();

    isSpeaking = false;
    isPaused = false;

    currentUtterances = [];

    updatePlayPauseButton();

    console.error(
      "Selected line speech error:",
      event.error
    );
  };

  currentUtterances = [
    utterance
  ];

  window.speechSynthesis.speak(
    utterance
  );
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
    currentSlides[currentSlideIndex];

  const queue =
    buildSpeechQueue(slide);

  if (queue.length === 0) {

    console.warn(
      "No text available for speech."
    );

    return;
  }


  stopSpeech();

  currentUtterances = [];


  queue.forEach((item, index) => {

    const utterance =
      createUtterance(item);


    /* Highlight language currently spoken */

    utterance.onstart = () => {

      highlightSpeakingLanguage(
  item.displayLanguage ??
  item.language
);

      console.log(
        `Speaking language: ${item.language}`
      );
    };


    /* End of each spoken block */

    utterance.onend = () => {

      clearSpeechHighlight();

      const isLast =
        index === queue.length - 1;

      if (isLast) {

        isSpeaking = false;
        isPaused = false;

        updatePlayPauseButton();

        console.log(
          "Slide speech completed."
        );
      }
    };


    utterance.onerror = event => {

      clearSpeechHighlight();

      console.error(
        "Speech error:",
        event.error
      );

      isSpeaking = false;
      isPaused = false;

      updatePlayPauseButton();
    };


    currentUtterances.push(
      utterance
    );

    window.speechSynthesis.speak(
      utterance
    );
  });


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

  if (pendingSpeechTimer !== null) {
    window.clearTimeout(
      pendingSpeechTimer
    );

    pendingSpeechTimer = null;
  }

  if (!speechIsSupported()) {
    return;
  }

  window.speechSynthesis.cancel();

  isSpeaking = false;
  isPaused = false;

  currentUtterances = [];

  clearSpeechHighlight();

  updatePlayPauseButton();
}


/* ========================================
   SHARED SPEECH ENGINE API
   ======================================== */

function speakText(
  text,
  language = "en",
  options = {}
) {

  const content =
    typeof text === "string"
      ? text.trim()
      : "";

  if (
    !content ||
    !speechIsSupported()
  ) {
    return false;
  }

  const delay =
    Number.isFinite(
      Number(options.delay)
    )
      ? Math.max(
          0,
          Number(options.delay)
        )
      : 0;

  stopSpeech();

  const start = () => {

    pendingSpeechTimer = null;

    const utterance =
      createUtterance({
        text: content,
        language
      });

    utterance.onstart = () => {
      isSpeaking = true;
      isPaused = false;
      updatePlayPauseButton();
    };

    utterance.onend = () => {
      isSpeaking = false;
      isPaused = false;
      currentUtterances = [];
      updatePlayPauseButton();
    };

    utterance.onerror = event => {
      isSpeaking = false;
      isPaused = false;
      currentUtterances = [];
      updatePlayPauseButton();

      console.error(
        "Shared speech error:",
        event.error
      );
    };

    currentUtterances = [
      utterance
    ];

    window.speechSynthesis.speak(
      utterance
    );
  };

  if (delay > 0) {
    pendingSpeechTimer =
      window.setTimeout(
        start,
        delay
      );
  } else {
    start();
  }

  return true;
}


globalThis.SIYAYOSpeechEngine =
  Object.freeze({
    speakText
  });


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
   GLOBAL NAVIGATION
   SHARE ENGINE
   ======================================== */

function initializeShareButton() {

  const shareButton =
    document.getElementById("shareButton");

  if (!shareButton) {
    console.warn(
      "Share button was not found."
    );

    return;
  }


  shareButton.addEventListener(
    "click",
    async () => {

      const shareData = {
        title:
          document.title ||
          "SIYAYO ACADEMY",

        text:
          "SIYAYO ACADEMY — The Ten Kinds of Words",

        url:
          window.location.href
      };


      /* Native Share:
         smartphones and compatible browsers */

      if (navigator.share) {

        try {

          await navigator.share(
            shareData
          );

          console.log(
            "Page shared successfully."
          );

          return;

        } catch (error) {

          /*
             AbortError means the user simply
             closed the Share window.
          */

          if (
            error.name === "AbortError"
          ) {

            console.log(
              "Share cancelled."
            );

            return;
          }

          console.warn(
            "Native Share failed:",
            error
          );
        }
      }


      /* Fallback:
         copy current URL */

      try {

        await navigator.clipboard.writeText(
          window.location.href
        );

        showShareFeedback(
          shareButton,
          "✓"
        );

        console.log(
          "Page link copied to clipboard."
        );

      } catch (error) {

        console.error(
          "Unable to copy page link:",
          error
        );

        showShareFeedback(
          shareButton,
          "!"
        );
      }

    }
  );
}


/* ========================================
   SHARE VISUAL FEEDBACK
   ======================================== */

function showShareFeedback(
  button,
  symbol
) {

  const icon =
    button.querySelector(
      ".nav-icon"
    );

  if (!icon) {
    return;
  }

  const originalIcon =
    icon.textContent;

  icon.textContent =
    symbol;


  window.setTimeout(
    () => {

      icon.textContent =
        originalIcon;

    },
    1400
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
     
    /* Global Navigation */

    initializeShareButton();

    /* Semantic Surface Action Choice */

    initializeSemanticSurfaceActionChoiceEvents();

    /* 1. Academy Manifest */

    const academy =
      await loadAcademyManifest();

    if (!academy) {
      return;
    }

    renderAcademyChapterStack(academy);


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
