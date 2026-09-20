const fs = require("fs");
const assert = require("assert");

const labRoot =
  "labs/human-semantic-surface";

const htmlPath =
  labRoot + "/index.html";

const academyPath =
  labRoot + "/data/academy.json";

const chapterPath =
  labRoot + "/data/chapter.json";

assert.ok(
  fs.existsSync(htmlPath),
  "human Semantic Surface lab route must exist"
);

assert.ok(
  fs.existsSync(academyPath),
  "human lab must own an isolated academy manifest"
);

assert.ok(
  fs.existsSync(chapterPath),
  "human lab must own isolated controlled scene data"
);

const html =
  fs.readFileSync(
    htmlPath,
    "utf8"
  );

for (const src of [
  "../../js/story-semantic-surface-realization.js",
  "../../js/story-semantic-surface-dom-materialization.js",
  "../../js/story-semantic-surface-attention.js",
  "../../js/story-semantic-surface-interaction-intent.js",
  "../../js/story-semantic-surface-action-choice.js",
  "../../js/story-semantic-surface-action-choice-dom-materialization.js",
  "../../js/story-assessment-leaf-surface.js",
  "../../js/app.js"
]) {
  assert.ok(
    html.includes(
      'src="' + src + '"'
    ),
    "human lab must load shared production module " + src
  );
}

assert.ok(
  html.includes(
    'href="../../css/style.css"'
  ),
  "human lab must reuse production styling"
);


const leafSurfaceIndex =
  html.indexOf(
    'src="../../js/story-assessment-leaf-surface.js"'
  );

const appIndex =
  html.indexOf(
    'src="../../js/app.js"'
  );

assert.ok(
  leafSurfaceIndex >= 0,
  "human lab must load Story Assessment Leaf Surface"
);

assert.ok(
  appIndex > leafSurfaceIndex,
  "Story Assessment Leaf Surface must load before app.js in the human lab"
);


const academy =
  JSON.parse(
    fs.readFileSync(
      academyPath,
      "utf8"
    )
  );

assert.strictEqual(
  academy.chapters.length,
  1,
  "human lab manifest must expose only the controlled lab chapter"
);

assert.strictEqual(
  academy.chapters[0].status,
  "active",
  "controlled lab chapter must be the active lab entry"
);

assert.strictEqual(
  academy.chapters[0].path,
  "data/chapter.json",
  "lab must resolve its own isolated chapter without touching canonical chapter data"
);

const chapter =
  JSON.parse(
    fs.readFileSync(
      chapterPath,
      "utf8"
    )
  );

const item =
  chapter.chapter.sections[0].items[0];

assert.strictEqual(
  item.sentences.en,
  "Which cheese should we choose?",
  "human lab must expose the controlled P0 sentence"
);

assert.deepStrictEqual(
  item.surfaces.map(
    surface => surface.id
  ),
  [
    "question-choice",
    "decision-agent"
  ],
  "human lab must expose the two explicit Semantic Surfaces"
);

assert.strictEqual(
  item.assessmentLeaf.anchorSurfaceId,
  "question-choice",
  "human lab Assessment Leaf must remain anchored only to question-choice"
);

console.log(
  "Human Semantic Surface browser lab route: OK"
);
