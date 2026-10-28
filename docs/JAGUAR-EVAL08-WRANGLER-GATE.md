# JAGUAR · EVAL-08 · Wrangler-managed migration, no Codespaces

Decision after the Cloudflare agent correctly stopped: the Cloudflare REST D1 SQL query API is **not** a substitution for the Wrangler migration journal. **No remote migration occurred.**

Cloudflare agent read-only audit (reported by user):
- D1 `siyayo-academy-staging`, UUID `cc48dd16-ac40-4af1-a206-f2d72ed4e7f0`, 0 tables, no verified applied migrations.
- Worker `siyayo-academy-staging-api` bound using `ASSESSMENT_DB`; URLs/preview disabled; no routes/domains/triggers; 404-only.
- Latest pre-migration Time Travel bookmark: `00000004-00000000-00005112-2cb78f48d31a57a2d2b26ac43bf9ec3e` (restore point, **not a permanent backup**; Cloudflare Workers Free has a 7-day window).
- Earlier bookmark differs; use the *latest confirmed* bookmark, subject to Cloudflare retention, and refresh immediately before apply.

## Prepared (do not execute without separate authorization and prerequisites)
- `staging/eval08/wrangler.jsonc`: D1-only staging target. `migrations_dir: "migrations"` is relative to this config file, so exactly the existing `staging/eval08/migrations/0001_eval08_initial.sql` is selected.
- `test_wrangler_preflight.py`: checks target name/UUID, no public routes/deploy entrypoint, exact migration Git blob `9ec9e52f471abf7218bfeb11f82bdb9591050ae2`.
- GitHub Actions workflow `.github/workflows/jaguar-eval08-wrangler-gate.yml`: push on isolated branch is **offline-only**; remote job requires manual dispatch *with exact confirmations*, environment `eval08-staging-d1` and two GitHub encrypted **environment secrets**. This workflow does **not** run `wrangler deploy`.

## GitHub default branch limitation
GitHub requires a workflow file on the default branch for the **Run workflow** UI / `workflow_dispatch` activation. Since `main` and PR #3 are protected, this branch **cannot yet be manually dispatched**. A separate, narrowly scoped authorization would be needed to add only the reviewed workflow to `main`; no evaluator or Explorer code would be merged. Alternatively use a locally installed Wrangler CLI (not Codespaces).

## Before enabling remote
1. Human review security and SQL. `D1 Edit` token scoped to the appropriate Cloudflare account; enter only in encrypted GitHub environment secrets `SIYAYO_EVAL08_CF_D1_TOKEN` and `SIYAYO_EVAL08_CF_ACCOUNT_ID` (never paste into chats or commits). Restrict environment to authorized staging branch and enable required reviewer approval.
2. Validate migration with `Wrangler` in a local sandbox first, not only CPython `sqlite3`.
3. Verify D1 metadata and fresh Time Travel bookmark immediately before applying; remote write approval separate from this preparatory branch.
4. Confirm only the one migration file is discovered. Remote `migrations apply --remote` creates `d1_migrations`, which is an **additional eighth table**, alongside seven `eval08_*` tables.
5. Apply once and verify table count, triggers, and zero seeded learner rows; Worker remains 404-only.
6. Never automatically invoke `time-travel restore`—it is destructive. Get a separate recovery decision in case of failure.

Official docs: https://developers.cloudflare.com/d1/reference/migrations/ ; https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/ ; https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow
