const VERBS_URL = "data/lexicon/verbs/actions.json";
const EXAMPLES_URL = "data/lexicon/verbs/action-examples.json";

let verbs = [];
let examplesByVerb = new Map();
let currentIndex = 0;

const speechLocales = { en: "en-US", es: "es-ES", pt: "pt-BR" };

async function loadVerbExplorer() {
  try {
    const [verbsResponse, examplesResponse] = await Promise.all([
      fetch(VERBS_URL),
      fetch(EXAMPLES_URL)
    ]);

    if (!verbsResponse.ok || !examplesResponse.ok) {
      throw new Error("Could not load verb corpus.");
    }

    verbs = await verbsResponse.json();
    const exampleCorpus = await examplesResponse.json();
    const exampleItems = Array.isArray(exampleCorpus) ? exampleCorpus : exampleCorpus.items;

    examplesByVerb = new Map(
      (exampleItems || []).map(item => [item.verb, item.examples])
    );

    renderVerbList();
    renderVerb(0);
    attachEvents();
  } catch (error) {
    console.error("SIYAYO Verb Explorer:", error);
    document.getElementById("verbLemma").textContent = "Corpus unavailable";
  }
}

function renderVerb(index) {
  if (!verbs.length) return;
  currentIndex = (index + verbs.length) % verbs.length;
  const verb = verbs[currentIndex];
  const examples = examplesByVerb.get(verb.id) || {};

  document.getElementById("verbLemma").textContent = verb.lemma;
  document.getElementById("verbMeta").textContent = [
    ...(verb.verbFunction || []),
    ...(verb.verbClass || [])
  ].join(" · ");

  ["en", "es", "pt"].forEach(language => {
    document.getElementById(`word${language[0].toUpperCase()}${language.slice(1)}`).textContent = verb.translations?.[language] || "—";
    document.getElementById(`example${language[0].toUpperCase()}${language.slice(1)}`).textContent = examples?.[language] || "—";
  });

  document.getElementById("verbProgress").textContent = `${currentIndex + 1} / ${verbs.length}`;
  document.querySelectorAll(".verb-list button").forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === currentIndex);
  });
}

function renderVerbList() {
  const list = document.getElementById("verbList");
  list.innerHTML = verbs.map((verb, index) =>
    `<button type="button" data-index="${index}">${escapeHtml(verb.lemma)}</button>`
  ).join("");
}

function speakLanguage(language) {
  if (!("speechSynthesis" in window)) return;
  const verb = verbs[currentIndex];
  const examples = examplesByVerb.get(verb.id) || {};
  const text = examples[language] || verb.translations?.[language];
  if (!text) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLocales[language];
  window.speechSynthesis.speak(utterance);
}

function attachEvents() {
  document.getElementById("previousVerb").addEventListener("click", () => renderVerb(currentIndex - 1));
  document.getElementById("nextVerb").addEventListener("click", () => renderVerb(currentIndex + 1));

  document.getElementById("verbList").addEventListener("click", event => {
    const button = event.target.closest("button[data-index]");
    if (button) renderVerb(Number(button.dataset.index));
  });

  document.querySelectorAll(".language-card").forEach(card => {
    card.addEventListener("click", () => speakLanguage(card.dataset.language));
  });
}

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadVerbExplorer();
