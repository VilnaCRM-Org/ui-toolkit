# Enterprise Readiness Audit — @vilnacrm/ui-toolkit

Date: 2026-07-01
Scope: full repository, open GitHub issues (23) and pull requests (1), CI workflow health on `main`.
Method: four parallel deep audits (security/supply-chain, testing/CI-CD, code quality/frontend,
docs/AI-native readiness) plus live CI-run forensics via the GitHub API.

## Scorecard

| # | Quality attribute / NFR | Score (1–5) |
|---|---|---|
| 1 | Testing & test rigor (reliability) | 4.5 |
| 2 | Maintainability & code quality | 4.5 |
| 3 | Frontend architecture & best practices | 4 |
| 4 | Documentation | 4 |
| 5 | Performance & efficiency | 3.5 |
| 6 | Accessibility | 3.5 |
| 7 | Internationalization | 3.5 |
| 8 | Security & supply chain | 3 |
| 9 | CI/CD & release engineering | 3 |
| 10 | AI-native autonomous development readiness | 3 |
| 11 | Governance, compliance & process | 3 |
| 12 | Observability | 2 |

Overall: ~3.5 / 5. Strong engineering core (coverage/mutation/dep-graph/complexity gates are
genuinely enterprise-grade), held back by a broken release pipeline, silent/dead quality gates,
supply-chain scanning gaps, licensing ambiguity, and dead pointers in the AI-agent entry docs.

## Confirmed defects (found and verified during the audit)

1. **Release pipeline broken since ~2026-06-07.** Every `generate changelog and create release`
   run on `main` fails: tag `v0.2.0` already exists on the remote while `package.json` on `main`
   is still `0.1.0`, so `TriPSs/conventional-changelog-action` recomputes `v0.2.0` and dies at
   `git tag` ("fatal: tag 'v0.2.0' already exists", run 28547601443). The `chore(release): v0.2.0`
   commit was never pushed while the tag was. No release or changelog has shipped for ~a month.
2. **Memory-leak CI gate has never run (silent skip).** `.github/workflows/memory-leak-testing.yml`
   and `Makefile` detect `tests/memory-leak/runMemlabTests.js`, but the file is
   `tests/memory-leak/run-memlab-tests.js` (kebab-case migration). The detect step always yields
   `present=false`, so the workflow always skips and the three memlab scenarios are dead weight.
3. **CLAUDE.md points AI agents at assets that do not exist.** `_bmad/COMMANDS.md` and the ~20
   BMAD slash commands referenced in `CLAUDE.md` have no backing files in the repo; `.claude/` is
   absent. An autonomous agent following the checked-in entry point hits dead ends immediately.
4. **agents.md contradicts the Makefile.** `agents.md` states there is no separate
   `make test-integration` target; `Makefile` defines it and CONTRIBUTING.md documents it.
5. **`.env` is git-tracked** despite `.gitignore:27` — currently only localhost values, but the
   ignore rule is defeated and future edits could leak secrets silently.
6. **License not declared in the manifest.** `LICENSE` is CC0-1.0 (atypical for a distributed
   library — no patent grant), and `package.json` has no `"license"` field, so consumers and
   license scanners see an undeclared license.
7. **Dead dependencies.** `@sentry/react`, `@sentry/node`, and `web-vitals` are declared and
   imported nowhere; `@microsoft/api-extractor` is declared with no `api-extractor.json` and no
   script wiring.

## Per-attribute findings

### 1. Testing & test rigor — 4.5/5

Exists: 42 unit + 6 integration test files with **enforced 100% coverage** thresholds
(`jest.config.ts`, `jest.integration.config.ts`); sharded Stryker mutation testing with a real
80% break threshold re-enforced over the merged union and fail-closed shard checks
(`stryker.config.mjs`, `scripts/ci/merge-mutation-reports.ts`); Playwright e2e (3 browsers,
`forbidOnly`, CI retries); visual regression with enforced story-to-baseline completeness
(`tests/visual/visual.spec.ts` asserts manifest == live Storybook index); 17 Bats files testing
the CI shell tooling itself; centralized test layout enforced by `scripts/check-test-structure.sh`.

Gaps to 5/5:

- Memory-leak tier completely dead (defect 2).
- Essentially no Storybook interaction (`play`) tests; no jest-axe/axe-core layer (see issue #66).
- No programmatic keyboard/focus assertions anywhere in the suite (issue #66).

### 2. Maintainability & code quality — 4.5/5

Exists: zero `any` in `src/` (enforced); `explicit-function-return-type`, `member-ordering`,
`no-console` as errors; zero-baseline dependency-cruiser with public-API boundary rules and
kebab-case enforcement; rust-code-analysis complexity gate driven by schema-validated
`config/metrics-policy.json` (cyclomatic ≤ 10, cognitive ≤ 15, MI ≥ 20); qlty config with
trufflehog/zizmor/actionlint.

Gaps to 5/5:

- `tsconfig.json` missing hardening flags: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`,
  `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noImplicitOverride`; `target: ES6`
  is dated/inconsistent with the es2020 build.
- Seven empty scaffold dirs (`src/hooks`, `src/lib`, `src/providers`, `src/routes`, `src/stores`,
  `src/utils`, mostly-empty `src/types`).
- `react/jsx-no-bind` only `warn`; no ESLint complexity backstop if the RCA gate is bypassed.

### 3. Frontend architecture & best practices — 4/5

Exists: ESM-only tree-shakeable esbuild build (`sideEffects: ["**/*.css"]`, clean `exports` map,
externalized peers); React 19 idioms (`useId`, `forwardRef`, no top-level `window`/`document`);
per-component `types.ts`/`theme.ts` structure; provenance registry
(`specs/planning-artifacts/component-provenance.md`).

Gaps to 5/5:

- Six components each wrap their own `<ThemeProvider>` — theme fragmentation and re-instantiation.
- No exported error-boundary primitive.
- api-extractor declared but unwired — no API-surface report/rollup governance (relates to
  issue #33, export contract integrity).
- No memoization discipline in list-mapping components (`ui-card-list`, `card-swiper`).

### 4. Documentation — 4/5

Exists: exceptional CONTRIBUTING.md (394 lines: gate-by-gate remediation tables, local/CI parity);
strong agents.md test-coverage contract; rich `specs/` planning artifacts with machine-readable
`sprint-status.yaml`; Storybook autodocs; issue/PR templates.

Gaps to 5/5:

- README has no consumer usage/import example for the published package; omits several Make
  targets (README/Makefile/agents.md drift, incl. defect 4).
- Zero authored MDX docs (no Getting Started, theming, or i18n guide).
- No committed CHANGELOG between releases (and release generation is broken — defect 1).
- No ADRs / decision records; no versioning/deprecation/browser-support policy docs.

### 5. Performance & efficiency — 3.5/5

Exists: Lighthouse CI desktop+mobile with per-audit error gates; dockerfile-performance budget
workflow with base-vs-head comparison; dive/hadolint image efficiency gates; RCA maintainability
gate; memlab harness (currently dead).

Gaps to 5/5:

- **No bundle-size budget** (size-limit/bundlesize) for a published library that bundles swiper.
- Lighthouse category scores and `color-contrast` are `warn`-only; `numberOfRuns: 1` (variance).
- Memory-leak gate dead (defect 2); `web-vitals` dead dep (defect 7).
- Per-component ThemeProvider re-instantiation.

### 6. Accessibility — 3.5/5

Exists: jsx-a11y recommended rules across the TS/TSX surface; Lighthouse per-rule a11y audits as
errors on 10 sampled stories; genuinely good runtime a11y in components (dev-only accessible-name
warnings in `ui-input`, ARIA wiring via `useId` in `ui-checkbox`, full keyboard support in
`ui-tooltip`); visual focus-state screenshots.

Gaps to 5/5 (largely already specified in issue #66 — implement it):

- No axe-core in any test layer (no jest-axe, no @axe-core/playwright, no storybook a11y addon).
- No checked-in WCAG acceptance standard / conformance target; brand contrast failures
  (white on #1EAEFF ≈ 2.45:1) accepted without a formal exemption/variant mechanism.
- Zero programmatic focus/keyboard assertions; Lighthouse sample covers 10 of 38 stories.

### 7. Internationalization — 3.5/5

Exists: i18next + react-i18next wired into build (`scripts/localizationGenerator.js`, 18KB
localization.json), `Trans`/`useTranslation` in content components, `escapeValue: true`, stories
localized, agents.md mandates asserting `t()` strings.

Gaps to 5/5:

- Root `i18n.js` is CJS and not part of `exports`/build — consumers get no wired instance.
- Inconsistent contract: some components self-translate, most take strings as props — undocumented.
- Single locale (`en`) only; no pluralization/RTL evidence; no consumer i18n guide.

### 8. Security & supply chain — 3/5

Exists: CodeQL SAST on PRs; digest-pinned non-root Alpine images with checksum-verified downloads;
hadolint+dive+alpine-guard (with tamper self-test); `--frozen-lockfile` everywhere; no
`pull_request_target`; no runtime telemetry/PII; third-party actions SHA-pinned in release/perf
workflows; Dependabot weekly; clean `.env.example`; `files: ["build"]` publish allowlist.

Gaps to 5/5:

- No dependency CVE scanning gate (no npm/bun audit step) and no container image scanning
  (Trivy/Grype); no secret-scanning CI gate (gitleaks/trufflehog runs only via qlty config, not CI);
  no OSSF Scorecard; no SBOM (CycloneDX/Syft); no SLSA/npm provenance.
- Inconsistent action pinning: `actions/checkout@v4/@v6`, `codeql-action@v4`, `codecov-action@v4`
  are mutable tags while other workflows SHA-pin; no `github-actions`/`docker` Dependabot
  ecosystems to keep pins fresh.
- Dependabot single catch-all group buries security bumps in 28-package batch PRs (see PR #67).
- SECURITY.md lacks contact, SLA, supported-versions table, disclosure policy.
- `.env` tracked (defect 5); no HEALTHCHECKs; ~13 workflows lack top-level `permissions:` default.

### 9. CI/CD & release engineering — 3/5

Exists: 20 workflows with per-PR concurrency + cancel-in-progress; least-privilege job
permissions; reproducible Docker/Make parity between local and CI; exemplary fail-closed mutation
merge gate; alpine-guard self-test; conventional-changelog autorelease + prerelease preview;
commitlint config with task-number rule.

Gaps to 5/5:

- Release pipeline broken for ~a month (defect 1) — needs the tag/version divergence repaired and
  a guard so tag-collision fails loudly before mutating state.
- No npm publish workflow at all despite full publish config — no provenance-attested pipeline;
  package unpublished by CI (relates to stories #33/#34).
- commitlint not enforced in CI and husky hooks not auto-installed (no `prepare` script, no
  `.husky/`) — the commit convention that drives auto-versioning is unenforced.
- 17 of 20 workflows missing `timeout-minutes`; codecov upload non-blocking with no codecov.yml
  status targets; memory-leak workflow silently skipping (defect 2).
- Required checks / branch protection not codified in-repo (rulesets), only described in docs.

### 10. AI-native autonomous development readiness — 3/5

Exists: high-quality agents.md contract (layer-selection table, state-matrix checklist,
verify-before-done block); BMAD planning artifacts and machine-readable
`specs/implementation-artifacts/sprint-status.yaml`; schema-validated metrics policy; deterministic
Docker/Make harness; deterministic fail-closed gates (ideal for agents); story-driven issue backlog.

Gaps to 5/5:

- CLAUDE.md dead pointers: `_bmad/` and slash commands missing (defect 3); no `.claude/`
  SessionStart hooks/settings for automated bootstrap; no `.devcontainer`.
- No single `make ci`/`make verify` aggregate target — agents must discover and sequence ~10
  targets to prove a green build.
- agents.md/Makefile/README command drift (defect 4) actively misleads agents.
- Silent-skip gates (defect 2) are the worst failure mode for autonomous loops — agents read
  "green" as "verified".

### 11. Governance, compliance & process — 3/5

Exists: conventional commits + task-number linkage; issue/PR templates; CODEOWNERS; Dependabot;
epic/story governance model in `specs/` with quality-gate closure stories (#27–#34); provenance
registry; documented required-check setup steps.

Gaps to 5/5:

- License: CC0 file + no `license` field in package.json (defect 6); no license-compliance CI gate
  for transitive deps (story #34 requires it).
- CODEOWNERS is a single wildcard owner (`* @Kravalg`) — no path-scoped ownership; bus factor 1.
- No ADRs, no versioning/deprecation/support-matrix policy, no committed CODE_OF_CONDUCT.md.
- Branch protection/required checks are manual out-of-band config, not codified rulesets.

### 12. Observability — 2/5

Exists: effectively nothing in `src/` — acceptable baseline for a pure component library is small,
but the current state is contradictory rather than deliberate.

Gaps to 5/5:

- `@sentry/*` and `web-vitals` declared but never imported (defect 7) — wire or remove.
- No error-boundary primitive for consumers to hook a reporter into.
- No documented observability stance ("this library intentionally ships zero telemetry; here is
  the error-boundary + reporting integration point") — for a library, a documented stance plus an
  integration point is what 5/5 looks like, not built-in telemetry.

## Relationship to the existing backlog

- Issue #66 already specifies the a11y acceptance standard + axe/keyboard gates — attribute 6
  reaches 5/5 by implementing it (do not duplicate).
- Stories #31–#34 (Epic 5) cover board coverage, provenance, export contract, and release-readiness
  governance — attribute 11 partially closes through them; #33/#34 overlap the npm-publish and
  license-gate work above.
- PR #67 (dependabot, 28 updates in one batch) illustrates the catch-all-group problem in
  attribute 8.

## Follow-up: full Wikipedia system-quality-attribute scorecard (2026-07-01)

Per the follow-up request, all 92 attributes from
<https://en.wikipedia.org/wiki/List_of_system_quality_attributes> were scored by a 9-cluster
subagent fan-out (every attribute mapped to exactly one cluster), and one GitHub issue was filed
per problem blocking a 5/5. Issues: #71–#103 (33 total; one draft merged as a duplicate).
"N/A = 5" means satisfied by vacuity for a stateless published component library.

### Reliability & Fault Tolerance — issues #71 #74 #77 #80

reliability 3, availability 2, fault-tolerance 2, robustness 3, resilience 2, recoverability 2,
redundancy 3, degradability 3, failure transparency 2, dependability 3, stability 2,
durability 5 (N/A), survivability 2

### Maintainability & Evolution — issues #83 #86 #89 #92

maintainability 3, modifiability 3, evolvability 3, extensibility 2, flexibility 2,
adaptability 3, agility 3, modularity 4, orthogonality 3, composability 3, reusability 3,
simplicity 4, analyzability 4, understandability 3, repairability 3, serviceability 3

### Testing, Correctness & Verification — issues #96 (P0) #98 #100 #103

testability 4, correctness 4, accuracy 3, precision 3, fidelity 4, provability 3, repeatability 4,
reproducibility 4, determinability 2, predictability 3, demonstrability 4, debuggability 4,
inspectability 3

### Security, Integrity & Auditability — issues #73 (P0) #76 #79 #82

securability 3, confidentiality 3, integrity 3, vulnerability 2, accountability 3, auditability 3,
safety 4

### Usability & Developer Experience — issues #85 #88 #91 (a11y closure via #66)

usability 2, accessibility 3, learnability 2, intuitiveness 3, familiarity 3, convenience 2,
interactivity 3, discoverability 2, operability 3, seamlessness 2, relevance 4, credibility 2,
transparency 2

### Performance, Efficiency & Scalability — issues #94 #97 #101

efficiency 2, effectiveness 3, responsiveness 3, timeliness 3, scalability 2, elasticity 5 (N/A)

### Configurability, Customization & Localization — issues #72 #75 #78

configurability 2, customizability 2, tailorability 2, localizability 2

### Portability, Compatibility & Release — issues #81 (P0) #84 #87 #90

portability 3, compatibility 3, interoperability 2, interchangeability 2, installability 1,
deployability 1, distributability 1, mobility 5 (N/A), ubiquity 2, upgradability 2,
standards compliance 2

### Operations, Process & Governance — issues #93 #95 #99 #102

manageability 3, administrability 2, observability 2, operability (CI) 3, autonomy 3,
self-sustainability 2, sustainability 2, affordability 4, producibility 2, process capabilities 3,
traceability 4

### Notable corrections vs the first-pass audit

- `i18n/localization.json` contains two complete locales (`en` and `uk`, 116 leaf keys each) —
  the delivery contract is what is broken, not the content (#75).
- `crmColorTheme` and `websiteColorTheme` are byte-identical; the CRM breakpoint values differ but
  are unreachable (#72).
- `scripts/localizationGenerator.js` scans a nonexistent `src/features` directory (#78).
- `package.json` exports point at `./build/index.mjs`, which no repo script produces —
  installability/deployability/distributability scored 1 (#81, #84).
