const fs = require("fs");
const assert = require("assert");

const html = fs.readFileSync("index.html", "utf8");

const realization =
  html.indexOf(
    'src="js/story-semantic-surface-realization.js"'
  );
const dom =
  html.indexOf(
    'src="js/story-semantic-surface-dom-materialization.js"'
  );
const attention =
  html.indexOf(
    'src="js/story-semantic-surface-attention.js"'
  );
const intent =
  html.indexOf(
    'src="js/story-semantic-surface-interaction-intent.js"'
  );
const actionChoice =
  html.indexOf(
    'src="js/story-semantic-surface-action-choice.js"'
  );
const app =
  html.indexOf('src="js/app.js"');

assert.ok(realization >= 0, "Surface realization must load");
assert.ok(dom > realization, "DOM materialization must load after realization");
assert.ok(attention > dom, "Surface attention must load after DOM materialization");
assert.ok(intent > attention, "Interaction Intent must load after Surface attention");
assert.ok(actionChoice > intent, "Action Choice must load after Interaction Intent");
assert.ok(app > actionChoice, "app.js must load after Story Surface specialists");

console.log(
  "Story Surface attention / intent / action choice browser load order: OK"
);
