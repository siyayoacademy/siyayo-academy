#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ACTIONS_PATH = path.join(ROOT, 'data/lexicon/verbs/actions.json');
const SUBJECTS_PATH = path.join(ROOT, 'data/grammar/subjects.json');
const CONVERSATION_PATH = path.join(ROOT, 'data/learning/conversation-seeds.json');
const EXPERIENCE_PATH = process.env.SIYAYO_EXPERIENCE_PATH
  ? path.resolve(process.env.SIYAYO_EXPERIENCE_PATH)
  : path.join(ROOT, 'data/learning/experience-seeds.json');
const NOUN_PATH = process.env.SIYAYO_NOUN_PATH
  ? path.resolve(process.env.SIYAYO_NOUN_PATH)
  : path.join(ROOT, 'data/lexicon/nouns/nouns.json');
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


function validateChoiceContext(choiceContext, vocabularyIds, where) {
  if (!choiceContext || typeof choiceContext !== 'object' || Array.isArray(choiceContext)) {
    fail('choiceContext must be an object', where);
    return;
  }
  if (!vocabularyIds.has(choiceContext.focusVocabulary)) {
    fail(`focusVocabulary '${choiceContext.focusVocabulary}' is not linked by the experience`, where);
  }
  const preferredTraits = choiceContext.preferredTraits;
  if (!Array.isArray(preferredTraits) || !preferredTraits.length) {
    fail('preferredTraits must contain at least one trait', where);
  } else if (new Set(preferredTraits).size !== preferredTraits.length) {
    fail('Duplicate preferredTraits', where);
  }
  const candidates = choiceContext.canonicalCandidates;
  if (!Array.isArray(candidates) || candidates.length < 2) {
    fail('canonicalCandidates must contain at least two alternatives', where);
    return;
  }
  const candidateIds = new Set();
  const fitScores = [];
  for (const candidate of candidates) {
    const candidateWhere = `${where}/canonicalCandidates/${candidate?.id ?? 'unknown'}`;
    if (typeof candidate?.id !== 'string' || !candidate.id.trim()) fail('Missing candidate id', candidateWhere);
    else if (candidateIds.has(candidate.id)) fail(`Duplicate candidate id '${candidate.id}'`, candidateWhere);
    else candidateIds.add(candidate.id);
    validateTrilingual(candidate?.response, `${candidateWhere}/response`);
    if (!Array.isArray(candidate?.contextTraits) || !candidate.contextTraits.length) {
      fail('contextTraits must contain at least one trait', candidateWhere);
      fitScores.push(0);
    } else {
      if (new Set(candidate.contextTraits).size !== candidate.contextTraits.length) fail('Duplicate contextTraits', candidateWhere);
      fitScores.push(candidate.contextTraits.filter(trait => preferredTraits?.includes(trait)).length);
    }
  }
  if (fitScores.length > 1 && new Set(fitScores).size < 2) {
    fail('Candidates must provide different contextual fit evidence', where);
  }
}

function validateNouns() {
  if (!fs.existsSync(NOUN_PATH)) {
    fail('Missing noun corpus file', path.relative(ROOT, NOUN_PATH));
    return { count: 0, ids: new Set() };
  }
  const data = readJson(NOUN_PATH), items = collectionItems(data);
  if (!Array.isArray(items)) {
    fail('nouns.json must contain items[]', 'nouns.json');
    return { count: 0, ids: new Set() };
  }
  const ids = new Set();
  for (const noun of items) {
    const where = `noun/${noun?.id ?? 'unknown'}`;
    if (typeof noun?.id !== 'string' || !noun.id.trim()) fail('Missing noun id', where);
    else if (ids.has(noun.id)) fail(`Duplicate noun id '${noun.id}'`, where);
    else ids.add(noun.id);
    if (noun?.wordType !== 'noun') fail("wordType must be 'noun'", where);
    validateTrilingual(noun?.translations, `${where}/translations`);
    if (!['concrete', 'abstract', 'proper'].includes(noun?.nounClass)) fail('Invalid nounClass', where);
    if (!Array.isArray(noun?.semanticTags) || !noun.semanticTags.length) fail('semanticTags must contain at least one tag', where);
    else if (new Set(noun.semanticTags).size !== noun.semanticTags.length) fail('Duplicate semanticTags', where);
  }
  return { count: items.length, ids };
}

function validateExperienceSeeds(nounIds) {
  if (!fs.existsSync(EXPERIENCE_PATH)) {
    fail('Missing experience seeds file', path.relative(ROOT, EXPERIENCE_PATH));
    return 0;
  }
  const data = readJson(EXPERIENCE_PATH), items = collectionItems(data);
  if (!Array.isArray(items)) {
    fail('experience-seeds.json must contain items[]', 'experience-seeds.json');
    return 0;
  }
  const experienceIds = new Set();
  let choiceContexts = 0;
  for (const experience of items) {
    const where = `experience/${experience?.id ?? 'unknown'}`;
    if (typeof experience?.id !== 'string' || !experience.id.trim()) fail('Missing experience id', where);
    else if (experienceIds.has(experience.id)) fail(`Duplicate experience id '${experience.id}'`, where);
    else experienceIds.add(experience.id);
    const vocabularyIds = new Set(experience?.links?.vocabulary ?? []);
    for (const vocabularyId of vocabularyIds) {
      if (!nounIds.has(vocabularyId)) fail(`Vocabulary '${vocabularyId}' does not resolve to the noun corpus`, `${where}/links/vocabulary`);
    }
    for (const [index, question] of (experience?.thinkingMind ?? []).entries()) {
      if (question?.choiceContext !== undefined) {
        choiceContexts += 1;
        if (question.intention !== 'choice' || question.questionWord !== 'which') {
          fail('choiceContext requires intention=choice and questionWord=which', `${where}/thinkingMind[${index}]`);
        }
        validateChoiceContext(question.choiceContext, vocabularyIds, `${where}/thinkingMind[${index}]/choiceContext`);
      }
    }
  }
  if (!choiceContexts) fail('Expected at least one contextual choice seed', 'experience-seeds.json');
  return { experiences: items.length, choiceContexts };
}

const actionsData = readJson(ACTIONS_PATH);
const subjectsData = readJson(SUBJECTS_PATH);
const actions = collectionItems(actionsData);
const subjects = collectionItems(subjectsData);
let conversationSeeds = 0;
let experienceSeeds = { experiences: 0, choiceContexts: 0 };
let nounCorpus = { count: 0, ids: new Set() };

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

  nounCorpus = validateNouns();
  conversationSeeds = validateConversationSeeds(actionIds);
  experienceSeeds = validateExperienceSeeds(nounCorpus.ids);

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
console.log(`Experience seeds: ${experienceSeeds.experiences}`);
console.log(`Contextual choices: ${experienceSeeds.choiceContexts}`);
console.log(`Canonical nouns: ${nounCorpus.count}`);
console.log('Checks: corpus files, PRESENT/PAST/FUTURE, A/N/I, 8-subject order, EN/ES/PT, targetWords, Explorer wiring, English DID/WILL base-form rules, conversation seeds, experience IDs and contextual choice references/contrast');
console.log('');
if (!failures.length) console.log('PASS — canonical corpus, conversation seeds and contextual experience metadata integrity checks passed.');
else {
  console.log(`FIX — ${failures.length} issue(s) found:`);
  failures.forEach((item, i) => console.log(`${i + 1}. ${item.message}${item.context ? ` — ${item.context}` : ''}`));
}
process.exit(failures.length ? 1 : 0);
