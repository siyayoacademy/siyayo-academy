# JAGUAR — MASTER VIP PRIVATE ACCESS GATE 01
Date: 2026-11-02. Status: PLANNED / BLOCKED UNTIL CLOUDFLARE ACCESS VERIFIED. No deploy or Access policy applied by this document.
Scope: NEW, independent Pages project only. Proposed project: master-vip-siyayo, repo siyayoacademy/siyayo-academy, production branch jaguar/master-vip-modular-site-print-20261026, static build output master-vip, build command blank, framework none.

## Access requirement
Private editorial laboratory: exactly one owner email in an Access **Allow / Include / Emails** rule. Store the actual email only in Cloudflare Access policy, **not in this public repository**. Enable One-time PIN identity provider; OTP is a login method, not a sufficient Include condition. NO Everyone, email-domain allowlist, any-Gmail, Login methods OTP as sole Include, bypass or unreviewed policies. Session lifetime owner-selected and tested. No fixed passwords or secrets in frontend.

## Critical hostname coverage
Cloudflare Pages automatically generates a production `PROJECT.pages.dev` hostname and individual preview aliases `HASH.PROJECT.pages.dev` and branch aliases.
Per official Cloudflare documentation (Oct 2026):
- Settings > General > Enable access policy protects **preview hostnames only**.
- To protect the production `PROJECT.pages.dev`, follow Pages Known Issues > Enable Access on *.pages.dev domain: manage the Access application and remove wildcard '*' from Public hostname subdomain. Reenable separate preview policy after that, and verify **two** hostnames/policies (production exact host + wildcard previews).
- If a custom domain is later added, it requires its own Access application / policy.
- Never claim PRIVATE before both production and preview hostnames, direct JSON/assets and atomic deployment links are verified anonymously blocked.
Official references: https://developers.cloudflare.com/pages/configuration/preview-deployments/ ; https://developers.cloudflare.com/pages/platform/known-issues/ ; https://developers.cloudflare.com/cloudflare-one/access-controls/policies/ ; https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/

## Safe sequence and release gate
1. STOP before the Pages create/deploy confirmation; screenshots currently show default project name siyayo-academy and branch main, which are NOT acceptable.
2. In a controlled maintenance window, create only dedicated project with verified project name and Master VIP branch; **Cloudflare Pages may expose the initial deploy publicly before Access can be configured**. Therefore classify this transition as PUBLIC EXPOSURE RISK. If no unavoidable exposure is acceptable, first obtain a Cloudflare-supported pre-deploy protection arrangement or use a temporary sanitized landing page until Access is active. Never expose sensitive editorial assets during this transient interval.
3. Immediately configure OTP provider and exact-email Allow policy; set Access for main Pages host + all previews following vendor documentation.
4. Verify anonymously in fresh private browser: root, nested routes, /data/catalog.json, fonts, images, JS/CSS, atomic hash preview and branch alias all redirect to Access or deny. Verify authorized owner OTP route and functioning site separately.
5. Record domain, branch, commit, deployment status, policy IDs (nonsecret), observed tests, rollback path. Mark PRIVATE only after tests pass; keep private until explicit 'MASTER VIP — PUBLIC RELEASE · GO'.
6. Do not modify main, Explorer, Piano, MCE, D1, existing Cloudflare project or prior preview URLs. Previous project previews remain independently public unless separately gated; this private gate does NOT retroactively protect them.

## Editorial status
Dedicated production hostname means stable owner access, NOT finished book / public release. Master VIP source catalog and future Dependency Bridge, visuals, A4 proof remain governed by their own gates.
