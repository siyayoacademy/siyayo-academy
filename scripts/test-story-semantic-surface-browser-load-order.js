const fs = require("fs");
const assert = require("assert");

const html = fs.readFileSync("index.html", "utf8");

const realization =
  'js/story-semantic-surface-realization.js';

const materialization =
  'js/story-semantic-surface-dom-materialization.js';

const app = 'js/app.js';

const realizationIndex =
  html.indexOf(realization);

const materializationIndex =
  html.indexOf(materialization);

const appIndex =
  html.indexOf(app);

assert.notStrictEqual(
  realizationIndex,
  -1,
  "Story page must load semantic Surface realization"
);

assert.notStrictEqual(
  materializationIndex,
  -1,
  "Story page must load semantic Surface DOM materialization"
);

assert.notStrictEqual(
  appIndex,
  -1,
  "Story page must load app.js"
);

assert.ok(
  realizationIndex < materializationIndex,
  "Surface realization must load before DOM materialization"
);

assert.ok(
  materializationIndex < appIndex,
  "DOM materialization must load before app.js"
);

console.log(
  "Story semantic Surface browser load order contract: OK"
);
