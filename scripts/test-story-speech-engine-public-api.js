#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const spoken = [];
const scheduled = [];
const cleared = [];

function SpeechSynthesisUtterance(text) {
  this.text = text;
  this.lang = '';
  this.rate = 1;
  this.pitch = 1;
  this.volume = 1;
  this.onstart = null;
  this.onend = null;
  this.onerror = null;
}

const document = {
  addEventListener() {},
  getElementById() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  querySelector() {
    return null;
  }
};

let timerId = 0;
const window = {
  SpeechSynthesisUtterance,
  speechSynthesis: {
    speak(utterance) {
      spoken.push(utterance);
    },
    cancel() {},
    pause() {},
    resume() {}
  },
  setTimeout(fn, delay) {
    timerId += 1;
    scheduled.push({ id: timerId, fn, delay });
    return timerId;
  },
  clearTimeout(id) {
    cleared.push(id);
  },
  addEventListener() {},
  location: { href: 'https://example.test/' }
};

const sandbox = vm.createContext({
  console,
  document,
  window,
  navigator: {},
  SpeechSynthesisUtterance,
  setTimeout: window.setTimeout,
  clearTimeout: window.clearTimeout
});
sandbox.globalThis = sandbox;

vm.runInContext(
  fs.readFileSync('js/app.js', 'utf8'),
  sandbox,
  { filename: 'js/app.js' }
);

const speech = sandbox.SIYAYOSpeechEngine;
assert.ok(speech, 'app.js must expose one shared SIYAYO Speech Engine');
assert.equal(typeof speech.speakText, 'function');

assert.equal(
  speech.speakText(
    'We should choose the fresh, mild cheese.',
    'en',
    { delay: 320 }
  ),
  true
);

assert.equal(spoken.length, 0, 'delayed speech must not speak before its timer fires');
assert.equal(scheduled.length, 1);
assert.equal(scheduled[0].delay, 320);

scheduled[0].fn();

assert.equal(spoken.length, 1);
assert.equal(spoken[0].text, 'We should choose the fresh, mild cheese.');
assert.equal(spoken[0].lang, 'en-US');
assert.equal(spoken[0].rate, 0.92);
assert.equal(spoken[0].pitch, 1);
assert.equal(spoken[0].volume, 1);

assert.equal(
  speech.speakText('', 'en', { delay: 320 }),
  false,
  'empty text must fail closed'
);

assert.equal(
  speech.speakText('Hola', 'es'),
  true
);
assert.equal(spoken.length, 2);
assert.equal(spoken[1].lang, 'es-ES');

console.log(
  'Story Speech Engine public API: PASS — arbitrary text uses the shared speech state/locales, supports synchronized delay, and fails closed on empty input.'
);
