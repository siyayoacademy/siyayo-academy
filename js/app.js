/* ========================================
   SIYAYO ACADEMY
   Content Engine - v0.5
   Smart Slides + Speech Engine
   ======================================== */

const ACADEMY_MANIFEST = "data/academy.json";

let currentAcademyData = null;
let currentChapterData = null;
let currentSlides = [];
let currentSlideIndex = 0;
let currentChapterIndex = 0;

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
    const available = ["active", "ready"].includes(entry.status);
    return `<button class="academy-chapter-link${active ? " is-active" : ""}" type="button" data-academy-chapter="${escapeHtml(entry.slug || "")}" data-status="${escapeHtml(entry.status || "")}" aria-disabled="${available ? "false" : "true"}"><span>${escapeHtml(entry.number)}</span><strong>${escapeHtml(title)}</strong></button>`;
  }).join("");

  stack.querySelectorAll("[data-academy-chapter]").forEach(button => {
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-disabled") === "true") return;

      const entries = academyChapterEntries();
      const index = entries.findIndex(
        entry => entry.slug === button.dataset.academyChapter
      );

      if (index >= 0) {
        openChapterAtIndex(index);
      }
    });
  });
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


function escapeHtmlWithLineBreaks(text = "") {
  return escapeHtml(text).replaceAll("\n", "<br>");
}


/* ========================================
   TARGET WORD FORMATTER
   ======================================== */

function isStandaloneBoundaryCharacter(character = "") {
  return !character || !/[\p{L}\p{N}_]/u.test(character);
}

function findStandaloneTargetIndex(
  sentence = "",
  targetWord = ""
) {
  const source = String(sentence);
  const target = String(targetWord);

  if (!target) {
    return -1;
  }

  const sourceLower = source.toLocaleLowerCase();
  const targetLower = target.toLocaleLowerCase();

  let searchFrom = 0;

  while (searchFrom <= source.length - target.length) {
    const index = sourceLower.indexOf(targetLower, searchFrom);

    if (index === -1) {
      return -1;
    }

    const before = index > 0 ? source[index - 1] : "";
    const afterIndex = index + target.length;
    const after = afterIndex < source.length ? source[afterIndex] : "";

    if (
      isStandaloneBoundaryCharacter(before) &&
      isStandaloneBoundaryCharacter(after)
    ) {
      return index;
    }

    searchFrom = index + 1;
  }

  return -1;
}

function formatGoldenSemanticAnchors(
  text = "",
  focusWords = []
) {
  const source = String(text);
  const targets = Array.isArray(focusWords)
    ? focusWords
        .map(item => String(item))
        .filter(Boolean)
        .sort((left, right) => right.length - left.length)
    : [];

  if (!targets.length) {
    return escapeHtml(source);
  }

  let cursor = 0;
  let html = "";

  while (cursor < source.length) {
    let bestIndex = -1;
    let bestTarget = "";

    for (const target of targets) {
      const sourceLower = source.toLocaleLowerCase();
      const targetLower = target.toLocaleLowerCase();
      let searchFrom = cursor;

      while (searchFrom <= source.length - target.length) {
        const index = sourceLower.indexOf(targetLower, searchFrom);

        if (index === -1) {
          break;
        }

        const before = index > 0 ? source[index - 1] : "";
        const afterIndex = index + target.length;
        const after = afterIndex < source.length ? source[afterIndex] : "";

        if (
          isStandaloneBoundaryCharacter(before) &&
          isStandaloneBoundaryCharacter(after)
        ) {
          if (
            bestIndex === -1 ||
            index < bestIndex ||
            (index === bestIndex && target.length > bestTarget.length)
          ) {
            bestIndex = index;
            bestTarget = target;
          }
          break;
        }

        searchFrom = index + 1;
      }
    }

    if (bestIndex === -1) {
      html += escapeHtml(source.slice(cursor));
      break;
    }

    html += escapeHtml(source.slice(cursor, bestIndex));
    html += '<strong><em class="golden-semantic-anchor">' +
      escapeHtml(source.slice(bestIndex, bestIndex + bestTarget.length)) +
      '</em></strong>';

    cursor = bestIndex + bestTarget.length;
  }

  return html;
}

function formatTargetSentence(
  sentence = "",
  targetWord = ""
) {
  const source = String(sentence);
  const targets = Array.isArray(targetWord)
    ? targetWord.map(item => String(item)).filter(Boolean)
    : targetWord
      ? [String(targetWord)]
      : [];

  if (!targets.length) {
    return escapeHtmlWithLineBreaks(source);
  }

  const matches = [];

  targets.forEach(target => {
    let searchFrom = 0;

    while (searchFrom <= source.length - target.length) {
      const relativeIndex = findStandaloneTargetIndex(
        source.slice(searchFrom),
        target
      );

      if (relativeIndex === -1) {
        break;
      }

      const index = searchFrom + relativeIndex;
      matches.push({ index, target });
      searchFrom = index + target.length;
    }
  });

  if (!matches.length) {
    return escapeHtmlWithLineBreaks(source);
  }

  matches.sort((left, right) =>
    left.index - right.index || right.target.length - left.target.length
  );

  let cursor = 0;
  let html = "";

  for (const matchInfo of matches) {
    if (matchInfo.index < cursor) {
      continue;
    }

    html += escapeHtmlWithLineBreaks(
      source.slice(cursor, matchInfo.index)
    );

    html += '<strong><em class="target-word">'
      + escapeHtml(
          source.slice(
            matchInfo.index,
            matchInfo.index + matchInfo.target.length
          )
        )
      + '</em></strong>';

    cursor = matchInfo.index + matchInfo.target.length;
  }

  html += escapeHtmlWithLineBreaks(source.slice(cursor));

  return html;
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

    return escapeHtml(before)
      + '<span data-surface-id="' + escapeHtml(descriptor.surfaceId)
      + '" data-surface-language="' + escapeHtml(descriptor.language)
      + '" role="button" tabindex="0">'
      + escapeHtml(match)
      + '</span>'
      + escapeHtml(after);
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
          language.code,

        focusWords:
          options.focusWords?.[
            language.code
          ] ?? []
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
          content,
          ...(section.focusWords ? { focusWords: section.focusWords } : {})
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
            section.speechLanguage,

          focusWords:
            section.focusWords
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
              ...(item.definitionFocusWords ? { definitionFocusWords: item.definitionFocusWords } : {}),
              ...(item.relatedVocabulary ? { relatedVocabulary: item.relatedVocabulary } : {}),
              ...(item.relatedExamples ? { relatedExamples: item.relatedExamples } : {}),
              ...(item.masterConnections ? { masterConnections: item.masterConnections } : {}),
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
                ? `${section.title}\n· ${item.intentLabel ?? item.intent.replaceAll("_", " ")}`
                : section.title,

              lines:
                 createLanguageLines(
                   item,
                   item.targetWords ?? {}
              ),
              ...(item.intent ? { intent: item.intent } : {}),
              ...(item.extension ? {
                extensionLines: createLanguageLines(item.extension, item.extensionTargetWords ?? {})
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
              data-line-speech-language="${escapeHtml(line.speechLanguage ?? line.language)}"
              data-line-speech-text="${escapeHtml(line.text ?? "")}"
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
  const lines = createLanguageLines(content)
    .map(line => ({ ...line, label: "" }));
  if (lines.length === 0) return "";
  return `
    <div class="slide-related-content related-example-group">
      ${renderLanguageLines(lines)}
    </div>
  `;
}

function renderVocabularyRows(vocabulary = {}) {
  const languageNames = { en: "inglês", es: "espanhol", pt: "português" };
  const groups = ["en", "es", "pt"]
    .filter(language => Array.isArray(vocabulary?.[language]) && vocabulary[language].length)
    .map(language => `
      <button
        type="button"
        class="noun-vocabulary-language"
        data-vocabulary-language="${language}"
        data-vocabulary-speech-text="${escapeHtml(vocabulary[language].join(", "))}"
        aria-label="Ouvir substantivos em ${languageNames[language]}"
      >
        ${vocabulary[language].map(word => `<span class="word-type-target noun-vocabulary-target" data-vocabulary-word="${escapeHtml(word)}">${escapeHtml(word)}</span>`).join('<span class="noun-vocabulary-separator" aria-hidden="true"> · </span>')}
      </button>
    `)
    .join("");

  if (!groups) return "";

  return `
    <details class="slide-vocabulary-disclosure">
      <summary>+ NOUNS</summary>
      <div class="noun-vocabulary-groups">${groups}</div>
    </details>
  `;
}

function renderMasterConnections(connections = []) {
  if (!Array.isArray(connections) || connections.length === 0) return "";

  const languageNames = { en: "ENGLISH", es: "ESPAÑOL", pt: "PORTUGUÊS" };
  const rows = ["en", "es", "pt"].map(language => {
    const pairs = connections
      .map(connection => {
        const common = connection.common?.[language];
        const proper = connection.proper?.[language];
        if (!common || !proper) return "";
        return `<span class="master-connection-pair"><span class="master-common">${escapeHtml(common)}</span><span class="master-arrow" aria-hidden="true"> → </span><span class="word-type-target master-proper">${escapeHtml(proper)}</span></span>`;
      })
      .filter(Boolean)
      .join('<span class="master-pair-separator" aria-hidden="true"> · </span>');

    if (!pairs) return "";
    const speech = connections
      .map(connection => connection.proper?.[language])
      .filter(Boolean)
      .join(", ");

    return `
      <button type="button" class="noun-vocabulary-language master-connection-language"
        data-vocabulary-language="${language}"
        data-vocabulary-speech-text="${escapeHtml(speech)}"
        aria-label="Ouvir nomes próprios em ${languageNames[language]}">
        ${pairs}
      </button>`;
  }).filter(Boolean).join("");

  return `
    <details class="slide-vocabulary-disclosure master-connections-disclosure">
      <summary>+ MASTER</summary>
      <div class="noun-vocabulary-groups master-connection-groups">${rows}</div>
    </details>`;
}

function renderGrammarExample(example, language) {
  const item =
    typeof example === "string"
      ? { text: example, targets: [] }
      : example;

  const sourceText =
    String(item.text ?? "");

  const targets =
    (item.targets ?? [])
      .map(target => String(target))
      .filter(Boolean)
      .sort(
        (left, right) =>
          right.length - left.length
      );

  const targetSet =
    new Set(targets);

  let html =
    escapeHtml(sourceText);

  if (targets.length) {
    const escapedTargets =
      targets.map(target =>
        target.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )
      );

    const targetPattern =
      new RegExp(
        `(^|[^\\p{L}\\p{N}_])(${escapedTargets.join("|")})(?=$|[^\\p{L}\\p{N}_])`,
        "gu"
      );

    html =
      escapeHtml(sourceText).replace(
        targetPattern,
        (_match, prefix, target) =>
          escapeHtml(prefix) +
          `<span class="word-type-target">${escapeHtml(target)}</span>`
      );
  }

  return `
    <button
      type="button"
      class="grammar-example"
      data-speech-language="${language}"
      data-speech-text="${escapeHtml(sourceText)}"
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
          <p class="grammar-definition-text">${formatGoldenSemanticAnchors(line.text ?? "", line.focusWords ?? [])}</p>
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

          <p
            class="section-content explanatory-text"
            tabindex="0"
          >
            ${formatGoldenSemanticAnchors(
              slide.content ?? "",
              slide.focusWords?.pt ?? slide.focusWords ?? []
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

          ${slide.definition?.pt ? `<div class="example-definition" role="button" tabindex="0" data-example-definition-speech-language="pt" data-example-definition-speech-text="${escapeHtml(slide.definition.pt)}" aria-label="Ouvir explicação"><p class="section-content slide-definition">${formatGoldenSemanticAnchors(slide.definition.pt, slide.definitionFocusWords?.pt ?? slide.definitionFocusWords ?? [])}</p></div>` : ""}

          <div class="trilingual-content example-language-lines">
            ${renderLanguageLines(
              slide.lines.map(line => ({ ...line, label: "" })),
              slide.surfaces ?? []
            )}
          </div>

          ${renderVocabularyRows(slide.relatedVocabulary)}

          ${renderMasterConnections(slide.masterConnections)}

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
            ${escapeHtmlWithLineBreaks(
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
            ? `<div class="slide-extension">${renderLanguageLines(slide.extensionLines)}</div>`
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
   CHAPTER ENGINE / VERTICAL FLOORS
   ======================================== */

function academyChapterEntries() {
  return [
    ...(currentAcademyData?.chapters ?? []),
    ...(currentAcademyData?.extraModules ?? [])
  ];
}

function chapterIsAvailable(chapterReference) {
  return ["active", "ready"].includes(chapterReference?.status);
}

function renderPlannedChapter(chapterReference) {
  stopSpeech();

  const main = document.querySelector("main");
  if (!main || !chapterReference) return;

  const title = [
    chapterReference.title?.en,
    chapterReference.title?.es,
    chapterReference.title?.pt
  ].filter(Boolean).join(" · ");

  const chapters = academyChapterEntries();

  main.innerHTML = `
    <section class="chapter-view chapter-floor-placeholder">
      <header class="chapter-header">
        <p class="chapter-number">Chapter ${chapterReference.number}</p>
        <h1 class="chapter-title">${escapeHtml(title)}</h1>
      </header>

      <div class="chapter-floor-wait" role="status">
        <strong>NEXT FLOOR</strong>
        <p>Chapter content is being prepared.</p>
      </div>

      <footer class="chapter-footer">
        <div class="chapter-floor-progress">
          ${String(currentChapterIndex + 1).padStart(2, "0")} de ${String(chapters.length).padStart(2, "0")}
        </div>
        ${renderChapterFloorControls()}
      </footer>
    </section>
  `;

  attachChapterFloorEvents();
}

function renderChapterFloorControls() {
  const chapters = academyChapterEntries();
  const previousDisabled = currentChapterIndex <= 0;
  const nextDisabled = currentChapterIndex >= chapters.length - 1;

  return `
    <nav class="chapter-floor-controls" aria-label="Chapter floors">
      <button type="button" data-chapter-floor="previous" ${previousDisabled ? "disabled" : ""} aria-label="Previous chapter">↑</button>
      <span>CHAPTERS</span>
      <button type="button" data-chapter-floor="next" ${nextDisabled ? "disabled" : ""} aria-label="Next chapter">↓</button>
    </nav>
  `;
}

function renderNextChapterInvitation() {
  const chapters = academyChapterEntries();
  const nextChapter = chapters[currentChapterIndex + 1];

  if (nextChapter) {
    const titleEn = nextChapter.title?.en ?? "NEXT CHAPTER";
    const titleEs = nextChapter.title?.es ?? "PRÓXIMO CAPÍTULO";
    const titlePt = nextChapter.title?.pt ?? "PRÓXIMO CAPÍTULO";
    const buttonLabel =
      nextChapter.slug === "interrogative-words"
        ? "QUESTION WORDS →"
        : `${titleEn} →`;

    return `
      <aside class="next-chapter-invitation" aria-label="Continue to the next chapter">
        <p>Ready for the next discovery? Continue to ${escapeHtml(titleEn)}.</p>
        <p>¿Listo para el próximo descubrimiento? Continúa con ${escapeHtml(titleEs)}.</p>
        <p>Pronto para a próxima descoberta? Continue para ${escapeHtml(titlePt)}.</p>
        <button type="button" class="next-chapter-invitation-button" data-next-chapter-invitation="next">
          ${escapeHtml(buttonLabel)}
        </button>
      </aside>
    `;
  }

  return `
    <aside class="next-chapter-invitation next-chapter-invitation-complete" aria-label="Learning path completed">
      <p>You completed this path. Explore the Academy again.</p>
      <p>Completaste este recorrido. Explora nuevamente la Academy.</p>
      <p>Você completou este percurso. Explore novamente a Academy.</p>
      <button type="button" class="next-chapter-invitation-button" data-next-chapter-invitation="tree">
        RETURN TO WORD TREE ↑
      </button>
    </aside>
  `;
}

function attachNextChapterInvitationEvents() {
  const button = document.querySelector("[data-next-chapter-invitation]");
  if (!button) return;

  button.addEventListener("click", () => {
    if (button.dataset.nextChapterInvitation === "next") {
      openChapterAtIndex(currentChapterIndex + 1);
      return;
    }

    const homeButton = document.querySelector(".lionsgate-button");
    if (homeButton) {
      homeButton.click();
      return;
    }

    openChapterAtIndex(0);
  });
}


async function openChapterAtIndex(index, options = {}) {
  const chapters = academyChapterEntries();
  if (!chapters.length) return;

  const boundedIndex = Math.max(0, Math.min(index, chapters.length - 1));
  const chapterReference = chapters[boundedIndex];

  currentChapterIndex = boundedIndex;
  currentSlideIndex = 0;

  document.querySelectorAll("[data-academy-chapter]").forEach(button => {
    button.classList.toggle(
      "is-active",
      button.dataset.academyChapter === chapterReference.slug
    );
  });

  if (!chapterIsAvailable(chapterReference)) {
    currentChapterData = null;
    currentSlides = [];
    renderPlannedChapter(chapterReference);
    return;
  }

  const chapterData = await loadChapter(chapterReference);
  if (!chapterData) {
    currentChapterData = null;
    currentSlides = [];
    renderPlannedChapter(chapterReference);
    return;
  }

  currentChapterData = chapterData;
  currentSlides = buildSlides(chapterData);

  if (!currentSlides.length) {
    renderPlannedChapter(chapterReference);
    return;
  }

  renderCurrentSlide();
}

function attachChapterFloorEvents() {
  const root = document.querySelector(".chapter-view");
  if (!root) return;

  root.querySelectorAll("[data-chapter-floor]").forEach(button => {
    button.addEventListener("click", () => {
      const delta = button.dataset.chapterFloor === "next" ? 1 : -1;
      openChapterAtIndex(currentChapterIndex + delta);
    });
  });

  let startX = null;
  let startY = null;

  root.addEventListener("touchstart", event => {
    const touch = event.touches?.[0];
    startX = touch?.clientX ?? null;
    startY = touch?.clientY ?? null;
  }, { passive: true });

  root.addEventListener("touchend", event => {
    if (startX === null || startY === null) return;

    const touch = event.changedTouches?.[0];
    const dx = (touch?.clientX ?? startX) - startX;
    const dy = (touch?.clientY ?? startY) - startY;

    startX = null;
    startY = null;

    if (Math.abs(dy) < 64 || Math.abs(dy) <= Math.abs(dx)) return;

    const interactive = event.target?.closest?.(
      "[data-grammar-carousel], details, button, input, textarea, select"
    );
    if (interactive) return;

    const delta = dy < 0 ? 1 : -1;
    openChapterAtIndex(currentChapterIndex + delta);
  }, { passive: true });
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
        chapter-${chapter.number}
        current-${slide.type}
      "
    >

      <header class="chapter-header">

        <p class="chapter-number">
          ${chapter.slug === "interrogative-words" ? "QUESTION WORDS" : `Chapter ${chapter.number}`}
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
          de
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

        <div class="chapter-floor-progress">
          ${String(currentChapterIndex + 1).padStart(2, "0")}
          de
          ${String(academyChapterEntries().length).padStart(2, "0")}
        </div>

        ${renderChapterFloorControls()}

      </footer>

    </section>
  `;


  if (isLast) {
    const slideContent = main.querySelector(".slide-content");
    if (slideContent) {
      slideContent.insertAdjacentHTML(
        "beforeend",
        renderNextChapterInvitation()
      );
    }
  }

  attachSliderEvents();
  attachNextChapterInvitationEvents();
  attachChapterFloorEvents();


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

  document.querySelectorAll(".noun-vocabulary-language").forEach(group => {
    group.addEventListener("click", event => {
      event.stopPropagation();
      speakText(
        group.dataset.vocabularySpeechText ?? "",
        group.dataset.vocabularyLanguage ?? "en"
      );
    });
  });

  document.querySelectorAll(".example-definition").forEach(definition => {
    const speakDefinition = () => {
      speakText(
        definition.dataset.exampleDefinitionSpeechText ?? "",
        definition.dataset.exampleDefinitionSpeechLanguage ?? "pt"
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


        speakText(
          line.dataset.lineSpeechText ?? "",
          line.dataset.lineSpeechLanguage ?? line.dataset.language ?? "en"
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

        speakText(
          line.dataset.lineSpeechText ?? "",
          line.dataset.lineSpeechLanguage ?? line.dataset.language ?? "en"
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

  const isOn =
    isSpeaking &&
    !isPaused;

  button.classList.toggle(
    "is-on",
    isOn
  );

  button.setAttribute(
    "aria-pressed",
    isOn ? "true" : "false"
  );


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

    currentAcademyData = academy;

    const activeChapter = findActiveChapter(academy);
    if (!activeChapter) return;

    const activeIndex = academy.chapters.findIndex(
      chapter => chapter.slug === activeChapter.slug
    );

    await openChapterAtIndex(
      activeIndex >= 0 ? activeIndex : 0
    );

    console.log(
      "SIYAYO Content Engine v0.6 Chapter Engine ready."
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
