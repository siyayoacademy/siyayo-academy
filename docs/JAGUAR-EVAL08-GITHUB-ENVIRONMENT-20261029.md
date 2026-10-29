# JAGUAR EVAL-08 · ELO 2 · GitHub environment protection

**Status:** isolated GitHub branch only; no changes to `main`, PR #3, Cloudflare Worker, D1, or its billing.

The current GitHub connector provides repository code/CI inspection, but GitHub environment administrative configuration/secrets are not available through its accessible operations. A GitHub API attempt to read environments using the repository fetch tool was **not supported**; branch protection GET returned permission denied. Do not infer the environment exists.

## Required UI checkpoint (configure as human owner)

Open **https://github.com/siyayoacademy/siyayo-academy/settings/environments** using your own authenticated GitHub account. Create environment named **`eval08-staging-d1`** if it does not already exist. Configure:

1. **Deployment branches and tags:** **Selected branches and tags**. Add precisely `jaguar/eval08-wrangler-gate-20261028` (not `main`, not all branches).
2. **Required reviewers:** enable, and select an authorized reviewer. If there is only one operator, **do not enable Prevent self-review** without an alternate reviewer; the approval would become impossible. Prefer a separate reviewer for greater security, if available.
3. Add environment secrets ONLY when appropriate and safely:
  - `SIYAYO_EVAL08_CF_D1_TOKEN` — token scoped to D1 editing on correct Cloudflare account. Never paste into chat, docs or code.
  - `SIYAYO_EVAL08_CF_ACCOUNT_ID` — exact Cloudflare account identifier, verify before setup. Do not conflate it with the D1 database UUID.
4. No token or environment policy is yet verified by the GitHub connector. Request a screenshot of the protection rules and **secret names only** (never values) as independent attestation. Keep remote apply disabled.

## Important behavior

- GitHub requires `workflow_dispatch` workflow files to exist in default branch to expose **Run workflow**. Only branch-isolated workflows exist now. This deliberately prevents the current remote job from being manually started via the normal UI.
- Do not copy the entire experimental EVAL-08 branch to `main`. A separately authorized minimal review of one workflow file is required in a later ELO.
- The existing remote job is allowed only after manual `apply_0001` plus exact confirmations on the target branch; it additionally references the protected environment.
- The environment needs actual GitHub protection settings: referring to a nonexistent environment by name may create it **without protection**. The check here cannot attest those settings.
- The new CI only tests local SQLite and Wrangler D1 in an ephemeral GitHub runner; there is no remote D1 interaction.
- D1 official migrations create an additional `d1_migrations` journal table besides the seven `eval08_*` application tables. A new preflight bookmark is necessary just before eventual migration; Time Travel retention is finite.

## References

- https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments
- https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
- https://developers.cloudflare.com/d1/reference/migrations/
