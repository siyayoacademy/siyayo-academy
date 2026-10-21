# SIYAYO · JAGUAR V30.3.89D — Staging architecture contract

**Status:** design only, recorded in isolated GitHub branch. **No new Worker, D1, Access application, binding or migration exists. No staging deploy is authorized.**

## Evidence already available

The user's Oct 21 Cloudflare screenshots and previous read-only inspection established: Pages `siyayo-academy` connects to `siyayoacademy/siyayo-academy`, production branch `main` and automatic previews; previous preview Access audit did not show Access protection; Production and Preview Pages settings showed no listed bindings; account D1 list reported **0/10 databases**; the standalone `shiny-scene-4b76` Worker has Static Assets, an independent workers.dev address and zero bindings visible. A Preview **secret name** `ADMIN_ALLOWED_EMAIL` was visible; its value must not be disclosed and does not itself protect a preview through Access.

These observations are *not* evidence that other storage products are absent, that no public preview can expose source assets, or that a provider-specific session ID exists.

## Named staging topology

```
TEST USER
  ↓ Cloudflare Access, verified policy and no public hostname bypass
siyayo-academy-staging-api (PROPOSED Worker, not created)
  ↓ server-verifies JWT issuer/audience/RS256/JWKS, expiry, real revocation
  ↓ trusted student subject ≠ UI NICK; trusted Pass Contract scope
siyayo-academy-staging (PROPOSED D1, not created)
  ↓ only pending / observed_exploratory, no automatic evaluator credit
observational HOW TO SHOW preview (future, never public unprotected)
```

**Keep production Pages and all current previews disconnected from the proposed D1.** A future Explorer presentation attachment must be same-origin under a reviewed protected route, or a separately approved proxy with cross-origin and bypass tests. A public Pages preview is NOT a security boundary.

Cloudflare Access itself must enforce the visitor gate, with a Worker performing independent JWT verification and server-owned authorization. Avoid assuming the lab's invented signed `sid` claim exists in real Access JWTs; real logout/revocation behavior must be verified against supported provider mechanisms, including propagation delay. Confirm that raw `workers.dev` URLs cannot bypass Access; disable public URL or protect all reachable origins.

## Seven-step release path

1. **Done (design only):** record boundaries, naming, data flow and preservation contract.
2. Inspect and verify the actual Zero Trust Access team, application, issuer/AUD, certs, key rollover and native logout/revocation strategy.
3. Separately approve private staging hostname and Access policy; test all public-origin bypass paths.
4. Separately approve **empty staging D1**, least-privilege permissions, additive migrations, encrypted backups/recovery ownership, and actual rollback rehearsal.
5. Separately approve **staging-only Worker** creation, dedicated D1 binding and a GET-only observation endpoint.
6. Validate authorized vs anonymous/foreign/expired/revoked access, D1 integrity, no-store, device/orientation, 4 authored QWs × EN/ES/PT, and observational vs evaluator-owned accepted evidence.
7. Require human signoff of the external security gates before any wider activation. **Never automatically merge to main.**

## Rollback before activation

Keep Access policy intact. Fail-close by disabling ONLY staging observation reads, and revert staging Worker deployments, bindings or staged migration using a rehearsed recovery point. Do not delete historical learner data or change the official Explorer. Preserve `shiny-scene-4b76` until its history is classified.

The eight integration contract families in `governance/contract-evolution-registry.json` retain their original authorities; proposed 7D.3.10 DISCOVER WHY remains a **parked, exploration-only candidate**. The canonical 0/3 CHOICE/USE/TRANSFER and Green Pass logic cannot be inferred from D1 pending/observed events.

## GitHub/Pages prevention

The Cloudflare Pages Git integration automatically builds branch previews. This commit intentionally begins with `[CF-Pages-Skip]`, documented as an opt-out for the associated build: https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/ . **Check the Pages deployments afterward**; never merely assume a skip worked. GitHub Actions tests run independently.

### Source lineage
Experimental `jaguar/v30-3-recovery-archive` previous head `36150cfe576c8e6620a552ad9a8972c0caa0340c`; official Explorer remains `c7e83709`; official `main` remains `c2149f5`.
