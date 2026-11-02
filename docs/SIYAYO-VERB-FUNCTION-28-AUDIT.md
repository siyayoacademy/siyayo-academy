# SIYAYO Verb Function Audit — 28-Verb Corpus

**Status:** AUDITED + Stage implementation prepared.  
**Canonical source:** `data/lexicon/verbs/actions.json` on `jaguar/verb-explorer-resume-live-wire`.

## Canonical axis

The verb schema defines five independent semantic functions:

- Quality
- State
- Movement
- Action
- Existence

This axis is independent from English Regular/Irregular morphology.

Canonical multilingual nodes confirm:

- QUALITY / CUALIDAD / QUALIDADE
- STATE / ESTADO / ESTADO
- MOVEMENT / MOVIMIENTO / MOVIMENTO
- ACTION / ACCIÓN / AÇÃO
- EXISTENCE / EXISTENCIA / EXISTÊNCIA

## Current 28-verb coverage

The current corpus contains:

- Action: present broadly across the corpus.
- Movement + Action overlaps: walk, go, come, run, arrive.
- State + Action overlaps: sleep, wake, understand.
- State only: need.
- Quality: no current lexical member in this 28-item Action corpus.
- Existence: no current lexical member in this 28-item Action corpus.

The absence of Quality/Existence examples in this current corpus must not be filled by inference.

## Important overlap rule

A verb may carry more than one canonical semantic function.

Example:

```
GO
→ Movement
→ Action
```

Therefore Function is not a one-choice classification system unless a future Experience explicitly asks for a single target.

## Routine / Modal / Conditional

These remain optional `verbClass` pedagogical/system labels, not replacements for `verbFunction`.

Current canonical Action node explicitly treats Routine as an application of Action rather than a sixth core function.

## Stage behavior

New Activity:

`Verbs → Function`

Touching a verb:

- preserves the selected lexical item;
- presents its canonical function(s);
- supports EN / ES / PT / Tripiano speech;
- uses visual contours as secondary cues;
- produces no Evidence and no GREEN.

## Visual grammar

- Action → solid frame.
- Movement → directional side echoes.
- State → calm double frame.
- Quality → reserved rounded cue for future grounded members.
- Existence → reserved dotted cue for future grounded members.

Visual cues are secondary to explicit text and speech.

## Scale target

Product direction: **at least 200 canonical verbs**.

The Frondosa window remains 14 items:

```
1–14
15–28
29–42
...
183–196
197–210
```

Thus 200 verbs fit naturally inside the fifteenth 14-item window; a later full-window milestone of 210 is structurally natural.

Expansion must remain corpus-first:

```
canonical admission
→ validation
→ 14-item window registration
→ Stage consumption
→ homologation
```
