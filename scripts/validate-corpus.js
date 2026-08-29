#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ACTIONS_PATH = path.join(ROOT, 'data/lexicon/verbs/actions.json');
const SUBJECTS_PATH = path.join(ROOT, 'data/grammar/subjects.json');
const CONVERSATION_PATH = path.join(ROOT, 'data/learning/conversation-seeds.json');
const VERB_DIR = path.join(ROOT, 'data/lexicon/verbs');
const EXPLORER_PATH = path.join(ROOT, 'js/verb-explorer.js');

const EXPECTED_TENSES = ['present', 'past', 'future'];
const EXPECTED_FORMS = ['affirmative', 'negative', 'interrogative'];
const EXPECTED_LANGS = ['en', 'es', 'pt'];
const failures = [];

function fail(message, context = '') { failures.push({ message, context }); }
function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (error) { fail(`Cannot parse JSON: ${path.relative(ROOT, filePath)}`, error.message); return null; }
}
function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase()
    .replace(/[“”„‟«»]/g, '"').replace(/[’‘]/g, "'").replace(/^¿/, '')
    .replace(/[?!.,;:…]+$/g, '').trim();
}
function targetAppears(sentence, target) {
  const s = normalize(sentence), t = normalize(target);
  return Boolean(s && t && s.includes(t));
}
function validateTrilingual(node, where) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) { fail('Expected trilingual object', where); return; }
  for (const lang of EXPECTED_LANGS) {
    if (typeof node[lang] !== 'string' || !node[lang].trim()) fail(`Missing/non-string ${lang}`, where);
  }
  const extras = Object.keys(node).filter(k => !EXPECTED_LANGS.includes(k));
  if (extras.length) fail(`Unexpected language keys: ${extras.join(', ')}`, where);
}
function explorerUrls(source, name) {
  const match = source.match(new RegExp(`\\b${name}\\s*=\\s*\\[([\\s\\S]*?)\\]`, 'm'));
  return match ? [...match[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map(m => m[1]) : null;
}
function collectionItems(data) { return Array.isArray(data) ? data : data?.items; }
function escapeRegExp(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function willCarriesBase(sentence, base) {
  const s = normalize(sentence);
  return new RegExp(`\\bwill\\b[\\s\\S]*\\b${escapeRegExp(base)}\\b`).test(s);
}

function validateSentenceFile(verbId, filePath) {
  const data = readJson(filePath), items = collectionItems(data);
  if (!Array.isArray(items)) { fail('Sentence forms must be an array or contain items[]', path.relative(ROOT, filePath)); return; }
  if (items.length !== 3) fail(`Expected exactly 3 tense items, found ${items.length}`, verbId);
  const seen = new Set();
  for (const item of items) {
    const where = `${verbId}/sentence/${item?.tense ?? 'unknown'}`;
    if (!item || typeof item !== 'object') { fail('Invalid tense item', where); continue; }
    if (item.verb !== verbId) fail(`verb '${item.verb}' does not match '${verbId}'`, where);
    if (!EXPECTED_TENSES.includes(item.tense)) fail(`Unexpected tense '${item.tense}'`, where);
    if (seen.has(item.tense)) fail(`Duplicate tense '${item.tense}'`, where);
    seen.add(item.tense);
    for (const formName of EXPECTED_FORMS) {
      const form = item.forms?.[formName];
      if (!form) { fail(`Missing form '${formName}'`, where); continue; }
      validateTrilingual(form.sentences, `${where}/${formName}/sentences`);
      validateTrilingual(form.targetWords, `${where}/${formName}/targetWords`);
      for (const lang of EXPECTED_LANGS) {
        if (typeof form.sentences?.[lang] === 'string' && typeof form.targetWords?.[lang] === 'string' && !targetAppears(form.sentences[lang], form.targetWords[lang])) {
          fail(`targetWords.${lang} '${form.targetWords[lang]}' not found in sentence`, `${where}/${formName}`);
        }
      }
    }
  }
  for (const tense of EXPECTED_TENSES) if (!seen.has(tense)) fail(`Missing tense '${tense}'`, `${verbId}/sentence`);
}

function validateSubjectFile(verbId, filePath, subjectIds) {
  const data = readJson(filePath);
  if (!data) return;
  if (data.verb && data.verb !== verbId) fail(`Top-level verb '${data.verb}' does not match '${verbId}'`, `${verbId}/subject`);
  if (!data.tenses || typeof data.tenses !== 'object') { fail('Missing tenses object', `${verbId}/subject`); return; }
  for (const tense of EXPECTED_TENSES) if (!data.tenses[tense]) fail(`Missing tense '${tense}'`, `${verbId}/subject`);
  for (const extra of Object.keys(data.tenses).filter(t => !EXPECTED_TENSES.includes(t))) fail(`Unexpected tense '${extra}'`, `${verbId}/subject`);
  for (const tense of EXPECTED_TENSES) {
    const tenseNode = data.tenses[tense]; if (!tenseNode) continue;
    for (const formName of EXPECTED_FORMS) {
      const entries = tenseNode.forms?.[formName], where = `${verbId}/subject/${tense}/${formName}`;
      if (!Array.isArray(entries)) { fail('Expected subject array', where); continue; }
      if (entries.length !== subjectIds.length) fail(`Expected ${subjectIds.length} subjects, found ${entries.length}`, where);
      entries.forEach((entry, index) => {
        const expected = subjectIds[index];
        if (!entry || typeof entry !== 'object') { fail('Invalid subject entry', `${where}[${index}]`); return; }
        if (entry.subject !== expected) fail(`Expected subject '${expected}', found '${entry.subject}'`, `${where}[${index}]`);
        validateTrilingual(entry.sentences, `${where}/${entry.subject}/sentences`);
        validateTrilingual(entry.targetWords, `${where}/${entry.subject}/targetWords`);
        for (const lang of EXPECTED_LANGS) {
          if (typeof entry.sentences?.[lang] === 'string' && typeof entry.targetWords?.[lang] === 'string' && !targetAppears(entry.sentences[lang], entry.targetWords[lang])) {
            fail(`targetWords.${lang} '${entry.targetWords[lang]}' not found in sentence`, `${where}/${entry.subject}`);
          }
        }
      });
    }
  }
}

function validateEnglishAuxiliaries(action, filePath, subjectMode) {
  const data = readJson(filePath); if (!data) return;
  const base = normalize(action.lemma);
  const checks = [];
  if (!subjectMode) {
    for (const item of collectionItems(data) ?? []) for (const formName of EXPECTED_FORMS) {
      const sentence = item.forms?.[formName]?.sentences?.en;
      if (sentence) checks.push([item.tense, formName, sentence]);
    }
  } else {
    for (const [tense, node] of Object.entries(data.tenses ?? {})) for (const formName of EXPECTED_FORMS)
      for (const entry of node.forms?.[formName] ?? []) if (entry.sentences?.en) checks.push([tense, formName, entry.sentences.en]);
  }
  for (const [tense, formName, sentence] of checks) {
    const s = normalize(sentence), where = `${action.id}/morphology/${tense}/${formName}`;
    if (tense === 'past' && formName === 'negative' && s.includes('did not ') && !s.includes(`did not ${base}`)) fail(`English DID negative should use base form '${base}'`, `${where}: ${sentence}`);
    if (tense === 'past' && formName === 'interrogative' && s.startsWith('did ') && !s.includes(` ${base}`)) fail(`English DID interrogative should use base form '${base}'`, `${where}: ${sentence}`);
    if (tense === 'future' && s.includes('will ') && !willCarriesBase(sentence, base)) fail(`English WILL should use base form '${base}'`, `${where}: ${sentence}`);
  }
}

function validateConversationSeeds(actionIds) {
  if (!fs.existsSync(CONVERSATION_PATH)) { fail('Missing conversation seeds file', path.relative(ROOT, CONVERSATION_PATH)); return 0; }
  const data = readJson(CONVERSATION_PATH), items = collectionItems(data);
  if (!Array.isArray(items)) { fail('conversation-seeds.json must contain items[]', 'conversation-seeds.json'); return 0; }
  const ids = new Set();
  for (const seed of items) {
    const where = `conversation/${seed?.id ?? 'unknown'}`;
    if (!seed || typeof seed !== 'object') { fail('Invalid conversation seed', where); continue; }
    if (typeof seed.id !== 'string' || !seed.id.trim()) fail('Missing conversation seed id', where);
    else if (ids.has(seed.id)) fail(`Duplicate conversation seed id '${seed.id}'`, where);
    else ids.add(seed.id);
    if (!actionIds.includes(seed.verb)) fail(`Conversation seed references unknown action verb '${seed.verb}'`, where);
    if (typeof seed.intention !== 'string' || !seed.intention.trim()) fail('Missing intention', where);
    for (const field of ['situation', 'question', 'answer', 'followUp']) validateTrilingual(seed[field], `${where}/${field}`);
    if (seed.naturalSpoken !== undefined) validateTrilingual(seed.naturalSpoken, `${where}/naturalSpoken`);
    if (seed.tags !== undefined) {
      if (!Array.isArray(seed.tags) || seed.tags.some(tag => typeof tag !== 'string' || !tag.trim())) fail('tags must be non-empty strings', `${where}/tags`);
      else if (new Set(seed.tags).size !== seed.tags.length) fail('Duplicate conversation tags', `${where}/tags`);
    }
  }
  return items.length;
}

const actionsData = readJson(ACTIONS_PATH);
const subjectsData = readJson(SUBJECTS_PATH);
const actions = collectionItems(actionsData);
const subjects = collectionItems(subjectsData);
let conversationSeeds = 0;

if (!Array.isArray(actions)) fail('actions.json must contain an array or items[]', 'actions.json');
if (!Array.isArray(subjects)) fail('subjects.json must contain an array or items[]', 'subjects.json');

if (Array.isArray(actions) && Array.isArray(subjects)) {
  const actionIds = actions.map(v => v.id), subjectIds = subjects.map(s => s.id);
  if (new Set(actionIds).size !== actionIds.length) fail('Duplicate verb IDs in actions.json');
  if (subjectIds.length !== 8) fail(`Expected 8 canonical subjects, found ${subjectIds.length}`, 'subjects.json');
  if (new Set(subjectIds).size !== subjectIds.length) fail('Duplicate subject IDs in subjects.json');

  for (const action of actions) {
    const sentencePath = path.join(VERB_DIR, `${action.id}-sentence-forms.json`);
    const subjectPath = path.join(VERB_DIR, `${action.id}-subject-forms.json`);
    if (!fs.existsSync(sentencePath)) fail('Missing sentence forms file', path.relative(ROOT, sentencePath));
    else { validateSentenceFile(action.id, sentencePath); validateEnglishAuxiliaries(action, sentencePath, false); }
    if (!fs.existsSync(subjectPath)) fail('Missing subject forms file', path.relative(ROOT, subjectPath));
    else { validateSubjectFile(action.id, subjectPath, subjectIds); validateEnglishAuxiliaries(action, subjectPath, true); }
  }

  conversationSeeds = validateConversationSeeds(actionIds);

  if (fs.existsSync(EXPLORER_PATH)) {
    const source = fs.readFileSync(EXPLORER_PATH, 'utf8');
    const sentenceUrls = explorerUrls(source, 'SENTENCE_FORM_URLS');
    const subjectUrls = explorerUrls(source, 'SUBJECT_FORM_URLS');
    const expectedSentence = actionIds.map(id => `data/lexicon/verbs/${id}-sentence-forms.json`);
    const expectedSubject = actionIds.map(id => `data/lexicon/verbs/${id}-subject-forms.json`);
    if (!sentenceUrls) fail('Could not find SENTENCE_FORM_URLS', 'js/verb-explorer.js');
    else if (JSON.stringify(sentenceUrls) !== JSON.stringify(expectedSentence)) fail('SENTENCE_FORM_URLS incomplete, extra, or out of canonical order', 'js/verb-explorer.js');
    if (!subjectUrls) fail('Could not find SUBJECT_FORM_URLS', 'js/verb-explorer.js');
    else if (JSON.stringify(subjectUrls) !== JSON.stringify(expectedSubject)) fail('SUBJECT_FORM_URLS incomplete, extra, or out of canonical order', 'js/verb-explorer.js');
  } else fail('Missing js/verb-explorer.js');
}

console.log('SIYAYO Corpus Integrity Validator');
console.log('================================');
console.log(`Verbs discovered: ${Array.isArray(actions) ? actions.length : 0}`);
console.log(`Canonical subjects: ${Array.isArray(subjects) ? subjects.length : 0}`);
console.log(`Conversation seeds: ${conversationSeeds}`);
console.log('Checks: corpus files, PRESENT/PAST/FUTURE, A/N/I, 8-subject order, EN/ES/PT, targetWords, Explorer wiring, English DID/WILL base-form rules, conversation seed IDs/verbs/trilingual fields');
console.log('');
if (!failures.length) console.log('PASS — canonical Built-in Actions corpus and conversation seed integrity checks passed.');
else {
  console.log(`FIX — ${failures.length} issue(s) found:`);
  failures.forEach((item, i) => console.log(`${i + 1}. ${item.message}${item.context ? ` — ${item.context}` : ''}`));
}
process.exit(failures.length ? 1 : 0);
