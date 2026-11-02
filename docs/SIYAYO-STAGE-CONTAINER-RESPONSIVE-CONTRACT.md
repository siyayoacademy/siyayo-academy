# SIYAYO Stage Container & Responsive Contract

**Status:** ACTIVE — R-01 registered; R-02 common layer extracted and Piano migrated.  
**Origin implementation:** Piano SIYAYO Stage.  
**Scope:** reusable SIYAYO page shell and development preview behavior.  
**Non-scope:** page-specific pedagogical content, actor choreography, semantic routing, evaluation, Evidence, GREEN, or Experience authority.

## 1. Purpose

Prevent parallel responsive implementations such as:

```
Piano Portrait = implementation A
Verb Explorer Portrait = implementation B
Verb DNA Portrait = implementation C
```

The protected target is:

```
SIYAYO Responsive Contract
          ↓
Common Responsive Layer
   CSS + JS shared
      ↙      ↓       ↘
   Piano   Verb DNA   Explorer
      ↓       ↓          ↓
page-specific responsive overrides only
```

## 2. Core distinction

### Development Preview Controller

A developer-facing desktop/laptop inspection tool.

Modes:

- Auto
- Portrait
- Landscape

It simulates constrained viewports without changing pedagogical content or device runtime authority.

### Responsive Runtime

The real-device behavior driven by CSS media features such as:

- width;
- orientation;
- hover capability;
- pointer type.

Real touch-first devices do not need the developer preview toolbar.

## 3. Shared implementation

Canonical common files:

- `css/siyayo-responsive-stage.css`
- `js/siyayo-responsive-preview.js`

Pages adopting the contract consume these files rather than recreating their own preview controller.

## 4. Required shell

A participating page provides:

```html
<div class="dev-preview-toolbar" data-siyayo-responsive-toolbar>
  <button class="preview-button" data-preview="auto">Auto</button>
  <button class="preview-button" data-preview="portrait">Portrait</button>
  <button class="preview-button" data-preview="landscape">Landscape</button>
</div>

<div class="stage-viewport"
     data-siyayo-responsive-viewport
     data-preview="auto">
  ...
</div>
```

The page may use different internal content and modules.

## 5. Shared visual contract

Common CSS owns:

- responsive viewport shell;
- preview toolbar placement;
- preview button base behavior;
- shared Portrait/Landscape simulation widths;
- touch-device hiding of developer preview UI.

Default simulation widths:

- Portrait: 430px;
- Landscape: 844px.

Pages may override the CSS custom properties, but may not create a second preview engine.

## 6. Shared controller contract

Common JavaScript owns:

- switching `data-preview`;
- active-button state;
- persistence of the developer preview mode;
- allowed modes: `auto`, `portrait`, `landscape`;
- dispatch of `siyayo:responsive-preview-changed`;
- real touch-first safety: real touch devices resolve to Auto and do not inherit a saved desktop simulation.

The shared storage key is:

`siyayo-responsive-preview-mode`.

Legacy page-specific keys may be read once for migration but are not new authorities.

## 7. Page-specific overrides

A page may define local responsive rules for its own content, for example:

- Piano keyboard dimensions;
- Frondosa hotspot placement;
- Pianinho height;
- Verb DNA module stacking;
- Explorer panel density;
- Experience dialogue cards.

These are **content-specific overrides**, not alternate implementations of Auto/Portrait/Landscape.

## 8. Cross-branch adoption rule

A shared contract is reusable across branches, but it does not mutate another branch automatically.

```
Shared Contract
≠ automatic cross-branch mutation

Shared Contract
= reusable canonical model
  applied only after explicit GO in the target branch/context
```

Before adoption in another branch:

1. read this contract;
2. audit the target page/container structure;
3. identify conflicts and local overrides;
4. preserve existing target-branch contracts;
5. obtain explicit GO for that branch;
6. consume the common files;
7. test Auto / Portrait / Landscape + real-device behavior.

## 9. Protected invariants

- Preview controls are development UI, not learner pedagogy.
- Real touch-first smartphone/tablet views must not require preview controls.
- Auto means real responsive behavior, not a fourth fixed layout.
- Portrait/Landscape simulation does not change collection, activity, language, learner choice, assessment target, Evidence, GREEN, or navigation authority.
- A page may add local responsive overrides but must not fork the common preview controller.
- Color or size alone may not hide essential learner meaning.
- Existing homologated page behavior must be preserved during migration.

## 10. Adoption lifecycle

```
R-01 REGISTER CONTRACT
→ R-02 EXTRACT COMMON LAYER + MIGRATE PIANO
→ R-03 ADOPT IN VERB DNA / EXPLORER BY EXPLICIT TARGET-BRANCH GO
```

Current state:

- R-01: complete on `jaguar/piano-stage-v0.1`.
- R-02: implemented on `jaguar/piano-stage-v0.1`; awaiting visual confirmation.
- R-03: not authorized on other branches.

## 11. Work Map relationship

The canonical human-readable `docs/SIYAYO-WORK-MAP.md` currently lives on the separate `jaguar/verb-explorer-resume-live-wire` branch.

Per the cross-branch adoption rule, this Piano branch does **not** modify that branch automatically.

When explicit authorization is given in that branch, the Work Map should register this contract by path and checkpoint rather than duplicate its full contents.
