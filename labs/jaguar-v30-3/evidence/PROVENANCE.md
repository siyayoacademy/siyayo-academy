# SIYAYO JAGUAR V30.3 — evidence provenance (2026-10-20)

- Eight user-provided V30.3.6 source files are archived under this laboratory. Their original README is in this evidence directory.
- Earlier Codespaces console evidence recorded: 34/34 successful regression tests (V30.3.80 and V30.3.81); three experimental routes returned HTTP 404 with {"error":"route_disabled"}; local /health returned HTTP 200 {"ok":true,"table":"v30_occurrences"}.
- The original Codespaces log had SHA-256 c33c83a8a967cba74f848eff8ab776ba6f5cb41d6a5eae41af001cccd18d44d6. **Its original bytes were not recovered** and are NOT represented by any newly generated CI log.
- The original pre-guard Worker backup had SHA-256 6d1007dec279759f600bc7f326a01ab0206fbc2abfd73d92aaa3028b8f31c44c. **Its original bytes were not recovered.**
- The HTTP integration Worker in this folder was reconstructed based on recorded V30.3.78/79 contract, not recovered byte-for-byte. The experimental write/read handlers are intentionally absent: they were closed in the audit.
- A separate reconstruction in a controlled local container reproduced 34/34 baseline tests and 8/8 new HTTP tests, total 42/42, prior to GitHub archival. GitHub Actions will provide independent CI evidence after the first successful run.
- Tests use injected mocked D1 and simulated identities. No live D1 data were recovered. Nothing here constitutes authentication, production persistence, credit, Green Pass or permission to deploy.
