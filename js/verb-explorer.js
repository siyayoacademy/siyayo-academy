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

    if (!verbsResponse.ok || !examplesResponse.ok) throw new Error("Could not load verb corpus.");

    verbs = await verbsResponse.json();
    const exampleCorpus = await examplesResponse.json();
    const exampleItems = Array.isArray(exampleCorpus) ? exampleCorpus : exampleCorpus.items;

    examplesByVerb = new Map((exampleItems || []).map(item => [item.verb, item.examples]));

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
  document.getElementById("verbMeta").textContent = [...(verb.verbFunction || []), ...(verb.verbClass || [])].join(" · ");

  ["en", "es", "pt"].forEach(language => {
    const suffix = `${language[0].toUpperCase()}${language.slice(1)}`;
    const translation = verb.translations?.[language] || "—";
    const sentence = examples?.[language] || "—";
    document.getElementById(`word${suffix}`).textContent = translation;
    document.getElementById(`example${suffix}`).innerHTML = highlightTargetWord(sentence, translation);
  });

  document.getElementById("verbProgress").textContent = `${currentIndex + 1} / ${verbs.length}`;
  document.querySelectorAll(".verb-list button").forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === currentIndex);
  });
}

function highlightTargetWord(sentence = "", target = "") {
  const source = String(sentence);
  const escapedSource = escapeHtml(source);
  if (!target || source === "—") return escapedSource;

  const forms = buildTargetForms(target);
  const match = forms
    .map(form => ({ form, index: source.toLocaleLowerCase().indexOf(form.toLocaleLowerCase()) }))
    .filter(item => item.index >= 0)
    .sort((a, b) => a.index - b.index || b.form.length - a.form.length)[0];

  if (!match) return escapedSource;

  const before = source.slice(0, match.index);
  const word = source.slice(match.index, match.index + match.form.length);
  const after = source.slice(match.index + match.form.length);

  return `${escapeHtml(before)}<strong class="target-word">${escapeHtml(word)}</strong>${escapeHtml(after)}`;
}

function buildTargetForms(target) {
  const base = String(target).toLocaleLowerCase();
  const forms = new Set([base]);

  if (base.endsWith("y") && base.length > 1) forms.add(`${base.slice(0, -1)}ies`);
  forms.add(`${base}s`);
  forms.add(`${base}es`);

  const irregular = {
    eat: ["eats", "ate", "eaten"], drink: ["drinks", "drank", "drunk"], sleep: ["sleeps", "slept"],
    wake: ["wakes", "woke", "woken"], read: ["reads"], write: ["writes", "wrote", "written"],
    speak: ["speaks", "spoke", "spoken"], go: ["goes", "went", "gone"], come: ["comes", "came"],
    run: ["runs", "ran"], buy: ["buys", "bought"]
  };

  (irregular[base] || []).forEach(form => forms.add(form));
  return [...forms].sort((a, b) => b.length - a.length);
}

function renderVerbList() {
  const list = document.getElementById("verbList");
  list.innerHTML = verbs.map((verb, index) => `<button type="button" data-index="${index}">${escapeHtml(verb.lemma)}</button>`).join("");
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
  return String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

loadVerbExplorer();
