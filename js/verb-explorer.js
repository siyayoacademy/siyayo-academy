const VERBS_URL = "data/lexicon/verbs/actions.json";
const EXAMPLES_URL = "data/lexicon/verbs/action-examples.json";
const WORK_FORMS_URL = "data/lexicon/verbs/work-sentence-forms.json";

let verbs = [];
let exampleUnitsByVerb = new Map();
let sentenceFormsByVerb = new Map();
let currentIndex = 0;
let currentForm = "affirmative";
const speechLocales = { en: "en-US", es: "es-ES", pt: "pt-BR" };

async function loadVerbExplorer() {
  try {
    const [verbsResponse, examplesResponse, formsResponse] = await Promise.all([fetch(VERBS_URL), fetch(EXAMPLES_URL), fetch(WORK_FORMS_URL)]);
    if (!verbsResponse.ok || !examplesResponse.ok || !formsResponse.ok) throw new Error("Could not load verb corpus.");
    verbs = await verbsResponse.json();
    const exampleCorpus = await examplesResponse.json();
    const formsCorpus = await formsResponse.json();
    const exampleItems = Array.isArray(exampleCorpus) ? exampleCorpus : exampleCorpus.items;
    exampleUnitsByVerb = new Map((exampleItems || []).map(item => [item.verb, item]));
    sentenceFormsByVerb = new Map((formsCorpus.items || []).map(item => [item.verb, item]));
    renderVerbList(); renderVerb(0); attachEvents();
  } catch (error) {
    console.error("SIYAYO Verb Explorer:", error);
    document.getElementById("verbLemma").textContent = "Corpus unavailable";
  }
}

function renderVerb(index) {
  if (!verbs.length) return;
  currentIndex = (index + verbs.length) % verbs.length;
  const verb = verbs[currentIndex];
  const exampleUnit = exampleUnitsByVerb.get(verb.id) || {};
  const examples = exampleUnit.examples || {};
  const targetWords = exampleUnit.targetWords || {};
  document.getElementById("verbLemma").textContent = verb.lemma;
  document.getElementById("verbMeta").textContent = [...(verb.verbFunction || []), ...(verb.verbClass || [])].join(" · ");
  ["en", "es", "pt"].forEach(language => {
    const suffix = `${language[0].toUpperCase()}${language.slice(1)}`;
    const translation = verb.translations?.[language] || "—";
    document.getElementById(`word${suffix}`).textContent = translation;
    document.getElementById(`example${suffix}`).innerHTML = highlightTargetWord(examples?.[language] || "—", targetWords?.[language] || translation);
  });
  document.getElementById("verbProgress").textContent = `${currentIndex + 1} / ${verbs.length}`;
  document.querySelectorAll(".verb-list button").forEach((button, i) => button.classList.toggle("active", i === currentIndex));
  currentForm = "affirmative";
  renderSentenceForms(verb);
}

function renderSentenceForms(verb) {
  const panel = document.getElementById("sentenceFormsPanel");
  const unit = sentenceFormsByVerb.get(verb.id);
  if (!unit) { panel.hidden = true; return; }
  panel.hidden = false;
  document.getElementById("sentenceFormsTitle").textContent = `${verb.lemma.toUpperCase()} · ${unit.tense.toUpperCase()}`;
  document.querySelectorAll(".form-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.form === currentForm));
  const form = unit.forms[currentForm];
  ["en", "es", "pt"].forEach(language => {
    const suffix = `${language[0].toUpperCase()}${language.slice(1)}`;
    document.getElementById(`form${suffix}`).innerHTML = highlightTargetWord(form.sentences[language], form.targetWords[language]);
  });
}

function highlightTargetWord(sentence = "", target = "") {
  const source = String(sentence);
  if (!target || source === "—") return escapeHtml(source);
  const index = source.toLocaleLowerCase().indexOf(String(target).toLocaleLowerCase());
  if (index < 0) return escapeHtml(source);
  return `${escapeHtml(source.slice(0,index))}<strong class="target-word">${escapeHtml(source.slice(index,index+String(target).length))}</strong>${escapeHtml(source.slice(index+String(target).length))}`;
}

function renderVerbList() {
  document.getElementById("verbList").innerHTML = verbs.map((verb,index) => `<button type="button" data-index="${index}">${escapeHtml(verb.lemma)}</button>`).join("");
}

function speakText(text, language) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text); utterance.lang = speechLocales[language]; window.speechSynthesis.speak(utterance);
}

function attachEvents() {
  document.getElementById("previousVerb").addEventListener("click", () => renderVerb(currentIndex - 1));
  document.getElementById("nextVerb").addEventListener("click", () => renderVerb(currentIndex + 1));
  document.getElementById("verbList").addEventListener("click", event => { const button = event.target.closest("button[data-index]"); if (button) renderVerb(Number(button.dataset.index)); });
  document.querySelectorAll(".language-card").forEach(card => card.addEventListener("click", () => { const verb=verbs[currentIndex]; const unit=exampleUnitsByVerb.get(verb.id)||{}; speakText(unit.examples?.[card.dataset.language] || verb.translations?.[card.dataset.language], card.dataset.language); }));
  document.querySelectorAll(".form-tab").forEach(tab => tab.addEventListener("click", () => { currentForm=tab.dataset.form; renderSentenceForms(verbs[currentIndex]); }));
  document.querySelectorAll(".form-sentence").forEach(card => card.addEventListener("click", () => { const language=card.dataset.formLanguage; const unit=sentenceFormsByVerb.get(verbs[currentIndex].id); if (unit) speakText(unit.forms[currentForm].sentences[language], language); }));
}

function escapeHtml(text="") { return String(text).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
loadVerbExplorer();
