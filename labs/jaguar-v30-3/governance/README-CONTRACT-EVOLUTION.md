# SIYAYO — Contract Evolution & Dependency Registry (isolated canonical-map extension)

**Status: proposal versioned on the experimental recovery branch; NOT merged into the official Explorer canonical map.**

Source canonical baselines at pinned Explorer commit `c7e83709cacf8479847df0f3cee4ed8a563aaae6`:
- `data/canonical/siyayo-development-map.json`
- `docs/siyayo-canonical-development-map.md`
- `docs/SIYAYO-WORK-MAP.md`

The structured extension is `labs/jaguar-v30-3/governance/contract-evolution-registry.json`. No existing canonical JSON or Explorer runtime is overwritten. After design approval and before a future canonical promotion, compare the official Explorer branch HEAD, existing contract definitions and test matrix, then apply an additive merge with an independent human review.

## Registry decision rule

Every proposed capability must declare: **where it belongs**, upstream dependencies, its responsible authority, data/evidence policy, source provenance, version, backwards-compatibility plan, tests, and human homologation. Prefer **reuse**; otherwise compatible revision; create a new contract only for a genuinely new behavioral/authority boundary. Breaking changes require an explicit migration.

Eight current integration contract families (SEC-IDENTITY, SEC-KEYS, SEC-SESSION, PED-ASSESSMENT, DATA-OCCURRENCE, DATA-RESTORE, UI-HOW-TO-SHOW and OPS-RELEASE) are taxonomy, **not eight newly approved runtime contracts**. Statuses are specific to current code/laboratory evidence and do not imply real Cloudflare Access authentication.

## Protected pedagogical candidate: JAGUAR 7D.3.10 DISCOVER WHY

Recorded as a *future study*, not implemented. Sequence: QUESTION → CHOICE R1/R2 → contextual 0/4–4/4 → REVIEW → DISCOVER WHY → REFLECT & TRANSFER.

- The 0/4–4/4 contextual adequacy scale is separate from the 0/3–3/3 canonical CHOICE/USE/TRANSFER assessment requirements.
- Opening the four criteria is initially exploration only; no Attempt/Evidence/Green Pass.
- Existing REVIEW order, speaker, question/pronominal comparison and accepted-witness Learning Trail/Word Path authority are unchanged.
- The remembered example (fresh, mild, pairs with salmon, special dinner) is **proposal-level**, not yet verified from current corpus JSON.
- A contrasting transfer scenario (aged cheese in another dining context) must be canonically authored and an Assessment Target must be explicitly authorized before evidence can count.
- The desired HOW TO SHOW relationship (observational discovery separately from accepted witnesses) is recorded for future design, without adding UI to production.

## Current immediate NEXT GO: V30.3.88

Continue the security track: trusted public JWKS rotation semantics and session revocation contract. Use offline tests only. The public Explorer, main, existing Cloudflare preview and remote D1 remain unchanged. The 87D twelve pre-staging gates remain BLOCKED.

*Recording an architecture decision is not running its proposed implementation.*
