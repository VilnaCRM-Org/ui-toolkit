# Final Validation Certificate — Internal Release-Readiness Governance Report

- **Story:** Story 5.4 — Internal Release-Readiness Governance Report
  ([#34](https://github.com/VilnaCRM-Org/ui-toolkit/issues/34))
- **Epic:** Epic 5 — Production Adoption Readiness
- **certificate-version:** `1.0.0`
- **certificate-timestamp:** `2026-09-23`
- **Canonical path:** `specs/implementation-artifacts/final-validation-certificate.md`
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 5.4: Internal Release-Readiness
  Governance Report_
- **Prepared by:** the Release Manager role (evidence collection and go/no-go packaging, per
  `epics.md` "Governance Roles"). Preparing this report is not an approval: every `decision` in
  [§8 Sign-off](#8-sign-off) is `pending` until the named approver records it.
- **Enforced by:** `tests/unit/final-validation-certificate.test.ts` (sections, metadata, sign-off
  fields and tokens, blocking-issue cross-references, cited paths) and
  `scripts/ci/check-licenses.ts` through `make lint-licenses` (the licensing/IP gate, §4).

## 1. Scope and evidence baseline

This certificate consolidates the release-governance evidence produced by Epics 1-5 into one
auditable report and records the sign-off the release decision needs. It covers the four
governance gates `epics.md` Story 5.4 names — board coverage, provenance, export integrity and
quality gates — plus internal-consumer compatibility, licensing/IP clearance and requirement
traceability.

Evidence baseline, verified on 2026-09-23:

- `main` at `004c69c` (PR #172, merged 2026-09-22). `package.json` is at `0.4.0`.
- Latest GitHub release: `v0.4.0`, published 2026-09-09 with the asset
  `vilnacrm-ui-toolkit-0.4.0.tgz`; the only other release is `v0.3.0`. Both were created by a
  maintainer account, not by the release workflow (`gh release list`, `gh release view`).
- Every Epic 1-5 story issue from #10 to #33 is closed; #34 (this story) is open. Open issues
  besides #34: #70, #72, #83, #103, #171.
- Figures quoted from the governance artifacts are taken from their own roll-ups, which their
  drift guards hold equal to the parsed rows.

## 2. Release-readiness summary

| Gate                                | Verdict                                             | Evidence   |
| ----------------------------------- | --------------------------------------------------- | ---------- |
| Board coverage closure (FR1)        | Closed, provisional on one open appendix ruling     | §2.1       |
| Provenance and canonical compliance | Complete, 13 ledger rulings unratified              | §2.2       |
| Export integrity                    | Complete and machine-enforced                       | §2.3       |
| Quality gates (FR8)                 | PR gate set green; release pipeline red             | §2.4       |
| Licensing and IP (AC3)              | Gate delivered; passes on a tarball packed with #34 | §4         |
| Overall                             | Not ready: five blocking issues open                | §2.5, §3.3 |

### 2.1 Board coverage closure

`specs/planning-artifacts/board-coverage-checklist.md` "Coverage roll-up": 46 required board
elements (Board A 21, B 7, C 3, D 15), 46 `Done`, 0 `Non-goal`, 0 `Blocked`, total verdict
`CLOSED`. The single blocker the checklist ever carried, BLOCK-01 (`UiLink` disabled state), is
recorded as resolved by Story 5.1 (#31). The former sole `Non-goal`, D-15 (Board B period switcher),
was superseded by delivery of `UiSegmentedControl` in Story 3.7 (#149).

The checklist states its own verdict is provisional: the Board A titled option-group appendix
ruling (checklist line 78) still has no named ratifier in the deviation ledger's ratification
register. Eighteen items below element level (D-01 to D-18) are recorded with a kind (non-goal,
deferral, escalation, deviation, decision or superseded); none downgrades an element's `Done`
status, and none is silently closed.

Enforcement: `tests/unit/board-coverage-traceability.test.ts`. Story artifact:
`specs/implementation-artifacts/5-1-board-coverage-closure-and-traceability.md`.

### 2.2 Provenance and canonical compliance

- Registry: `specs/planning-artifacts/component-provenance.md` records a `crm` / `website` / `new`
  source and rationale for every runtime export of `src/components/index.ts` (groups A-D of the
  drift guard).
- Deviation ledger: `specs/planning-artifacts/deviation-ledger.md` holds 66 rows, `DEV-01` to
  `DEV-66`. By status: 34 `ratified`, 10 `pending-ratification`, 3 `escalated`, 10
  `deferred-tracked`, 9 `superseded`. Fifteen rows carry an `unfiled:` tracking ref rather than
  a GitHub issue.
- Ratification register: the 10 `pending-ratification` rows and the option-group appendix ruling
  have empty `Ratified by` and `Date` cells. The ledger states each needs a named person and a date
  before `v1.0.0` ships. The 3 `escalated` rows (DEV-08, DEV-09, DEV-16) wait on designer
  rulings.
- DoD compliance matrix:
  `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md`
  measures every story artifact against `specs/implementation-artifacts/story-dod-template.md`:
  8 rows `Complete`, 15 `Evidence-elsewhere`, 1 `Gap` (the parity layer's §6, ruled on in that
  artifact).

Enforcement: `tests/unit/component-provenance-traceability.test.ts`.

### 2.3 Export integrity

`specs/planning-artifacts/export-contract.md` registers all 63 directories under
`src/components/`: 56 `exported` and 7 `internal`, each internal row with a reason and a tracking
ref. Rules R1-R5 (value export, props-type export, reachable types, traceable exceptions,
filesystem-derived enforcement) are enforced by `tests/unit/export-contract-integrity.test.ts`; the
API Extractor rollup's `ae-forgotten-export` check fails the build on an unexported reachable
type. `make package` fails when the tarball lacks a promised entry point
(`scripts/ci/verify-package-tarball.sh`). Story artifact:
`specs/implementation-artifacts/5-3-export-contract-and-entry-point-integrity.md`.

### 2.4 Quality-gate status

- **Pull-request gate set.** The last merged pull request, #172, finished with 61 checks passing and
  3 skipped by design (the cubic reviewer, and the full-lockfile and full-history scans, which run
  on schedule or on `main`). The set covers ESLint, tsc, Markdown, Prettier, dependency ranges,
  peer ranges, unused dependencies, i18n keys, test structure, release version, CI paths,
  dependency-cruiser, rust-code-analysis, build, unit and integration Jest (100% coverage
  threshold), Bats, Stryker mutation over 16 shards (`break: 100` in `stryker.config.mjs`), e2e,
  visual, Storybook interaction, axe accessibility, memory leak, Lighthouse desktop and mobile,
  gitleaks, trivy, SBOM, CodeQL and SonarCloud.
- **Epic closure artifacts.** Epics 1-3 and Story 3.7 carry closure artifacts
  (`specs/implementation-artifacts/1-4-epic-1-quality-gate-closure.md`,
  `specs/implementation-artifacts/2-6-epic-2-quality-gate-closure.md`,
  `specs/implementation-artifacts/3-6-epic-3-quality-gate-closure.md`,
  `specs/implementation-artifacts/3-7-board-follow-up-controls.md`), each pinned by
  `tests/unit/epic-quality-gate-closure.test.ts`. Epic 4 has none (RB-03).
- **Release pipeline.** Red. See RB-01.
- **Story 5.4 (#34).** Adds the licensing/IP gate (§4) to the pull-request set, to `make verify`
  and to the release workflow.

### 2.5 Blocking and non-blocking issues

Blocking — each prevents a `go` decision until its status is `resolved`:

| ID    | Blocking issue                                                                                                                                                                                                                                 | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                               | Owner                                      | Status |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ------ |
| RB-01 | The release workflow cannot publish. The branch protection on `main` declines the release App's push with GH006, so the workflow has never published a release.                                                                                | None of the 50 `autorelease.yml` runs on `main` since 2026-06-04 succeeded, and both existing releases were created by a maintainer account. The newest, run 35792373500 (2026-09-22, `004c69c`), failed at "Push the release commit, then its tag" with `GH006: Protected branch update failed`. The daily `release-asset-check.yml` fails on the same condition (run 35855531136, 2026-09-23). #162 is closed but the bypass grant is not in effect. | Org admin (bypass grant for the App)       | `open` |
| RB-02 | No release artifact passes the licensing/IP gate yet. The newest published asset, `vilnacrm-ui-toolkit-0.4.0.tgz`, predates the `license` field and the third-party notices.                                                                   | `bun scripts/ci/check-licenses.ts` on the downloaded v0.4.0 asset exits 1: "package.json declares no licence, not CC0-1.0" and "swiper@14.0.6 is bundled without an entry in THIRD-PARTY-NOTICES.txt". The same check passes on a tarball packed with the #34 change (§4). Resolved by the first release cut after RB-01 is fixed.                                                                                                                     | Release Manager                            | `open` |
| RB-03 | Epic 4 has no quality-gate closure artifact. Story 4.4 (#30) was closed on 2026-09-10 without an implementation artifact, and `specs/implementation-artifacts/sprint-status.yaml` still lists it as `backlog`.                                 | `epics.md` Story 4.4 requires a Definition of Done artifact with test, story, export and parity evidence references for Epic 5. The Epic 4 modules are not in `EPIC_GATES` in `tests/unit/epic-quality-gate-closure.test.ts`. FR6 (skeleton parity) is a release blocker under `prd.md` §3.4.                                                                                                                                                          | Component Lead                             | `open` |
| RB-04 | `prd.md` §9 exit criterion 7 is unmet. FR-07 acceptance 3 requires a documented, integration-tested adapter that maps `SxProps` to `className`/`style`; nothing under `src/` provides one and no ledger row rules it out.                      | No adapter module in `src/`. `specs/planning-artifacts/deviation-ledger.md` has no row for FR-07 acceptance 3, and `specs/planning-artifacts/export-contract.md` registers no adapter.                                                                                                                                                                                                                                                                 | Component Lead / Frontend Team             | `open` |
| RB-05 | Rulings are unratified. 10 `pending-ratification` ledger rows and the option-group appendix ruling have no ratifier or date, and 3 `escalated` rows have no designer ruling. The board-coverage verdict is provisional on the appendix ruling. | `specs/planning-artifacts/deviation-ledger.md` "Roll-up" and "Ratification register"; `specs/planning-artifacts/board-coverage-checklist.md` "Coverage roll-up".                                                                                                                                                                                                                                                                                       | Release owner, Component Lead, Design Lead | `open` |

Non-blocking — tracked follow-ups that do not gate the internal release:

| ID    | Item                                                                                                                                                                                                | Owner / tracking        |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| NB-01 | #171 reports 25 fixable HIGH advisories in the full `bun.lock`, all in dev tooling. The production-closure gate (`make lint-vulns`) passes, and the package ships no runtime dependency (§3.2).     | #171                    |
| NB-02 | DEV-43 (bundled font faces with no licence note) is `deferred-tracked`. The gate now proves every shipped face embeds OFL-1.1 metadata (§4), but the full OFL text is not shipped beside the faces. | Component Lead · DEV-43 |
| NB-03 | `package.json` has no `repository`, `homepage` or `bugs` field. The GitHub-release tarball does not need them; public npm promotion does (G-10).                                                    | Release Manager         |
| NB-04 | The accessibility-visuals bucket (DEV-03, DEV-07, DEV-22, DEV-66) is deferred with an `unfiled:accessibility-lead` ref and no issue.                                                                | Accessibility Lead      |
| NB-05 | Fifteen ledger rows carry `unfiled:` refs rather than GitHub issues.                                                                                                                                | Owners named per row    |
| NB-06 | Open NFR issues: #72 and #83 (theming through private ThemeProviders), #103 (measurement rigour), #70 (enterprise-readiness scorecard).                                                             | #70, #72, #83, #103     |
| NB-07 | Status columns in the DoD matrix still read "Open — PR #132" and "issue #28 OPEN". PR #132 merged on 2026-08-24 and issues #27-#29 are closed.                                                      | Release Manager         |
| NB-08 | `specs/implementation-artifacts/sprint-status.yaml` still lists every delivered story as `review` and every epic as `in-progress`.                                                                  | Scrum Master            |

## 3. Internal consumer compatibility

### 3.1 Consumer scope

- **Consumers.** The `crm` and `website` applications of VilnaCRM-Org. They install the release
  asset `vilnacrm-ui-toolkit-<version>.tgz` from the toolkit's GitHub release by URL. The package
  is not on the npm registry (`README.md` "Releases", `CONSUMING.md`).
- **Public API.** Every name `src/components/index.ts` exports (`@vilnacrm/ui-toolkit`), the same
  names through each `@vilnacrm/ui-toolkit/<component>` subpath, `@vilnacrm/ui-toolkit/styles.css`,
  `@vilnacrm/ui-toolkit/locales` and `@vilnacrm/ui-toolkit/package.json`. For each exported
  component the API covers its props and their defaults, its roles and accessible names, and its
  callbacks. Everything else, including `chunks/`, is internal (`README.md` "Versioning and
  stability").
- **Versioning.** SemVer, computed from Conventional Commits. While the version is `0.x`, a minor
  release may break the public API and names each such change in the changelog; a patch never
  does. From `1.0.0` a breaking change is a major. Narrowing a peer range is a breaking change.

### 3.2 Runtime and dependency baseline

| Surface           | Constraint                                                                  |
| ----------------- | --------------------------------------------------------------------------- |
| Module format     | ESM only: `import` condition, `.mjs` runtime, `.d.mts` declarations         |
| Browsers          | ES2020: Chrome 80, Edge 80, Firefox 74, Safari 13.1 and later; no polyfills |
| Node (SSR, tests) | `^20.19.0`, `^22.13.0`, `>=24` (`engines`, `engineStrict`)                  |
| React             | `react`, `react-dom` `^19.0.0` (peer)                                       |
| MUI               | `@mui/material`, `@mui/system` `^9.0.0` (peer)                              |
| Emotion           | `@emotion/react`, `@emotion/styled` `^11.0.0` (peer)                        |
| Forms             | `react-hook-form` `^7.0.0` (peer)                                           |
| i18n              | `i18next` `>=23.0.0 <27.0.0`, `react-i18next` `>=14.0.0 <18.0.0` (peer)     |
| TypeScript        | 5.0 and later, `moduleResolution` `bundler` or `node16`                     |
| Bundled, not peer | `swiper` 14.0.6 (MIT), carried in the build with its licence notice         |
| Runtime deps      | None: `package.json` declares no `dependencies`                             |
| Side effects      | `**/*.css` only (`sideEffects`)                                             |

Gates that keep the baseline true: `make lint-peer-ranges`
(`scripts/ci/check-peer-compatibility.ts`), `publint` in strict mode inside `make build`, the
`exports` map pin in
`tests/unit/export-contract-integrity.test.ts`, and the bundle-footprint budget in
`config/bundle-budget.json`.

### 3.3 Release go/no-go criteria

A `go` for an internal release requires every criterion from G-01 to G-08 to be `met`. Promotion to
the public npm registry additionally requires G-09 and G-10. Any criterion `not met` is a `no-go`.

| ID   | Criterion                                                                                           | Status on 2026-09-23                                         |
| ---- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| G-01 | Every blocking issue in §2.5 is `resolved`                                                          | not met (RB-01 to RB-05 open)                                |
| G-02 | The newest `autorelease.yml` run on `main` concluded `success` and the release asset check is green | not met (RB-01)                                              |
| G-03 | The full pull-request gate set is green on the release commit                                       | met on PR #172; recheck at release                           |
| G-04 | `make lint-licenses` is green on the exact tarball the release attaches                             | met on a tarball packed with #34; not met for v0.4.0 (RB-02) |
| G-05 | The board-coverage roll-up is `CLOSED` with no provisional ruling                                   | not met (RB-05)                                              |
| G-06 | The ratification register has a ratifier and date on every row, and no ledger row is `escalated`    | not met (RB-05)                                              |
| G-07 | Epics 1-4 each have a quality-gate closure artifact pinned by the closure guard                     | not met (RB-03)                                              |
| G-08 | `prd.md` §9 exit criteria 1-7 are met                                                               | not met (criterion 7, RB-04)                                 |
| G-09 | The Legal/OSS Compliance member of the Governance Board records `go` in §8                          | pending                                                      |
| G-10 | `package.json` carries `repository`, `homepage` and `bugs` for the public registry                  | not met (NB-03)                                              |

## 4. Licensing and IP clearance

`epics.md` Story 5.4 requires a valid `LICENSE` and SPDX identifier, an automated OSS licence/IP
scan with no critical findings, a check that no proprietary code, internal-only URL or secret is
exposed, and a release pipeline that fails when any of these checks fails. The gate:

- **Target.** `make lint-licenses` runs after `make package` and scans the packed tarball, which is
  exactly what a release attaches. `scripts/ci/check-licenses.ts` runs inside the bun container. The
  pure policy lives in `scripts/ci/license-policy.ts` and the font reader in
  `scripts/ci/font-license.ts`. The same target then runs the existing gitleaks scanner
  `scripts/ci/scan-secrets.sh` in its `package` mode over the unpacked tarball, with the committed
  `.gitleaks.toml` and its seeded-credential positive control.
- **Checks.** (1) The shipped `package.json` declares `CC0-1.0` and the shipped `LICENSE` is the CC0
  1.0 Universal text. (2) Every package the build bundles, read from the shipped source maps, and
  every package in the production dependency closure carries a licence on the allow-list: `0BSD`,
  `Apache-2.0`, `BlueOak-1.0.0`, `BSD-2-Clause`, `BSD-3-Clause`, `CC0-1.0`, `ISC`, `MIT`, `OFL-1.1`
  and `Unlicense`. An SPDX expression with nested parentheses or a `WITH` exception passes only if
  every identifier in it is allowed. (3) Every bundled package has an entry in
  `build/THIRD-PARTY-NOTICES.txt`, which `build.config.mjs` now writes from the esbuild metafile
  through `scripts/ci/third-party-notices.mjs`, with each package's full licence text. (4) Every
  shipped font embeds licence metadata (name-table id 13) that matches OFL-1.1; a face whose
  metadata cannot be read fails. (5) Every runtime module ships a source map, so no bundled code
  goes unattributed. (6) No shipped text file names an internal-only URL (localhost, loopback,
  private-range IPs, `.internal`, `.local`, `.lan`, `.corp`, `.intranet`, `home.arpa`) or carries a
  proprietary marker (`CONFIDENTIAL`, `PROPRIETARY`, "internal use only", "do not distribute",
  "trade secret"). The marker rules skip third-party licence text. (7) gitleaks finds no secret.
- **Enforcement.** The `licence and IP compliance` pull-request workflow
  (`.github/workflows/license-compliance.yml`) runs start-bun, package and lint-licenses.
  `make verify` includes `package` and `lint-licenses`. `.github/workflows/autorelease.yml` now
  packs and runs `make lint-licenses` before it pushes the release commit and tag, so a failing
  check fails the release with nothing pushed and nothing attached. Tests:
  `tests/bats/license_compliance_gate.bats` (Makefile and workflow wiring, plus fixture tarballs the
  checker must pass or reject, covering a GPL-3.0 bundled package, a missing notice, a non-CC0
  manifest or LICENSE, an internal URL, a proprietary marker, an unreadable font, an unmapped module
  and a disallowed transitive production dependency), `tests/bats/secret_scanning.bats` (package
  mode) and `tests/unit/license-policy.test.ts`.
- **Findings on 2026-09-23.** A tarball packed locally with the #34 change passes: one bundled
  package (`swiper` 14.0.6, MIT, with its notice); an empty production closure; nine TTF faces
  (six Golos Text, three Inter), all embedding "SIL Open Font License, Version 1.1"; no internal
  URL or marker. gitleaks reports no leaks and its positive control passes. The published v0.4.0
  asset fails the check (RB-02). The first CI run of the gate happens on the #34 pull request.
- **Legal/OSS Compliance sign-off.** Pending in §8. `prd.md` and `epics.md` make it a precondition
  for public npm promotion (G-09).

## 5. Requirement traceability

### 5.1 FR1, FR2, FR3 and FR8 evidence

| FR  | Requirement (`epics.md`)                      | Evidence                                                                                                                                                                                                             | Status                                         |
| --- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| FR1 | Complete board coverage                       | `specs/planning-artifacts/board-coverage-checklist.md` (46/46 `Done`), `specs/implementation-artifacts/5-1-board-coverage-closure-and-traceability.md`, `tests/unit/board-coverage-traceability.test.ts`             | Met; provisional on RB-05                      |
| FR2 | Reuse-first provenance                        | `specs/planning-artifacts/component-provenance.md`, `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md`, `tests/unit/component-provenance-traceability.test.ts`             | Met                                            |
| FR3 | `crm`-canonical behaviour, `website` gap-fill | `specs/planning-artifacts/deviation-ledger.md` (every divergence ledgered, 66 rows), `specs/planning-artifacts/component-provenance.md` alignment notes                                                              | Met; 13 rulings unratified (RB-05)             |
| FR8 | Storybook, unit tests, strict tsc, exports    | `tests/unit/story-coverage.test.ts`, `tests/unit/epic-quality-gate-closure.test.ts`, `tests/unit/export-contract-integrity.test.ts`, `specs/planning-artifacts/export-contract.md`, §2.4 gate set, §4 licensing gate | Met for Epics 1-3; Epic 4 closure open (RB-03) |

### 5.2 FR4 to FR7 traceability

| FR  | Delivered in | Traceability references                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Status                                 |
| --- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| FR4 | Epic 1       | `specs/implementation-artifacts/1-2-core-control-state-parity-completion.md`, `specs/implementation-artifacts/1-3-accessibility-and-interaction-consistency-hardening.md`, `specs/implementation-artifacts/1-4-epic-1-quality-gate-closure.md`, `tests/unit/ui-button.test.tsx`, `tests/unit/ui-input.test.tsx`, `tests/unit/ui-check-box.test.tsx`, `tests/unit/ui-link.test.tsx`, `tests/unit/core-controls-accessibility.test.tsx`, `tests/visual/states.spec.ts`                                                                                                            | Met                                    |
| FR5 | Epics 2-4    | `specs/implementation-artifacts/2-1-search-and-select-foundation.md` to `specs/implementation-artifacts/2-5-pagination-workflow-component-delivery.md` and `specs/implementation-artifacts/2-4a-file-upload-input-workflows.md`; `specs/implementation-artifacts/3-1-item-row-and-list-data-presentation.md` to `specs/implementation-artifacts/3-5-board-a-micro-components.md`; `specs/implementation-artifacts/4-2-skeleton-primitive-variants.md`, `specs/implementation-artifacts/4-3-composed-skeleton-layout-variants.md`; `specs/planning-artifacts/export-contract.md` | Met; Epic 4 closure open (RB-03)       |
| FR6 | Epic 4       | `specs/implementation-artifacts/4-1-crm-skeleton-baseline-and-provenance-lock.md`, `specs/implementation-artifacts/4-2-skeleton-primitive-variants.md`, `specs/implementation-artifacts/4-3-composed-skeleton-layout-variants.md`, `tests/unit/skeleton-crm-parity.test.ts`, `specs/planning-artifacts/component-provenance.md` Epic 4 rows                                                                                                                                                                                                                                     | Evidence present; closure open (RB-03) |
| FR7 | Epics 1-3    | `specs/implementation-artifacts/1-1-core-contract-and-export-baseline.md`, `tests/unit/ui-core-contract.test.tsx`, `tests/unit/optional-props-accept-undefined.test.ts`, `specs/planning-artifacts/deviation-ledger.md` (`contract-exception` rows)                                                                                                                                                                                                                                                                                                                             | Partially met; adapter missing (RB-04) |

## 6. Release Manager validation checklist

Checked items were verified while preparing this report. Unchecked items are open, and each names
the blocker or approver it waits on.

- [x] Board coverage roll-up read and reconciled with the checklist's drift guard (§2.1).
- [x] Provenance registry, deviation ledger roll-up and ratification register read (§2.2).
- [x] DoD compliance matrix roll-up read (§2.2).
- [x] Export register and entry-point gates read (§2.3).
- [x] Pull-request gate set confirmed green on the newest merged pull request (§2.4).
- [x] Release workflow and release asset check status read from `gh run list` (RB-01).
- [x] Newest release asset downloaded and scanned with the licensing/IP gate (RB-02).
- [x] Licensing/IP gate delivered in CI and wired to fail the release pipeline (§4).
- [x] Consumer scope, runtime baseline and versioning contract recorded (§3).
- [x] FR1-FR8 traceability recorded (§5).
- [ ] Release workflow green on `main` (RB-01, org admin).
- [ ] A release cut through the gated pipeline (RB-02, after RB-01).
- [ ] Epic 4 quality-gate closure artifact authored and pinned (RB-03).
- [ ] `SxProps` adapter delivered, or FR-07 acceptance 3 formally re-ruled (RB-04).
- [ ] Ratification register completed and escalations ruled (RB-05).
- [ ] Governance Board decisions recorded in §8.

## 7. Definition of Done evidence references

- Shared checklist: `specs/implementation-artifacts/story-dod-template.md`.
- Cross-story DoD matrix:
  `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md`
  ("Matrix").
- Epic closure DoD artifacts:
  `specs/implementation-artifacts/1-4-epic-1-quality-gate-closure.md`,
  `specs/implementation-artifacts/2-6-epic-2-quality-gate-closure.md`,
  `specs/implementation-artifacts/3-6-epic-3-quality-gate-closure.md`,
  `specs/implementation-artifacts/3-7-board-follow-up-controls.md`. Epic 4: none (RB-03).
- Epic 5 story DoD artifacts:
  `specs/implementation-artifacts/5-1-board-coverage-closure-and-traceability.md`,
  `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md`,
  `specs/implementation-artifacts/5-3-export-contract-and-entry-point-integrity.md`, and this
  certificate for Story 5.4.
- Drift guards: `tests/unit/board-coverage-traceability.test.ts`,
  `tests/unit/component-provenance-traceability.test.ts`,
  `tests/unit/export-contract-integrity.test.ts`,
  `tests/unit/epic-quality-gate-closure.test.ts`,
  `tests/unit/final-validation-certificate.test.ts`.
- Licensing/IP gate: `scripts/ci/check-licenses.ts`, `scripts/ci/license-policy.ts`,
  `scripts/ci/font-license.ts`, `scripts/ci/third-party-notices.mjs`,
  `.github/workflows/license-compliance.yml`, `tests/bats/license_compliance_gate.bats`,
  `tests/unit/license-policy.test.ts`.

## 8. Sign-off

Approvers are the Release Manager and the Governance Board (`epics.md` "Governance Roles"). A
`decision` is `pending`, `go` or `no-go`. A `go` or `no-go` needs the approver's GitHub handle in
`reviewer` and an ISO date in `date`, and no row may record `go` while a blocking issue in §2.5 is
`open`. The drift guard fails on any of these. The repository owner (@Kravalg) records each
decision; the report's author records none.

| Role                                    | reviewer  | date      | decision  | blocking-issues                   | follow-ups          |
| --------------------------------------- | --------- | --------- | --------- | --------------------------------- | ------------------- |
| Release Manager                         | `pending` | `pending` | `pending` | RB-01, RB-02, RB-03, RB-04, RB-05 | NB-03, NB-05, NB-07 |
| Governance Board — Engineering Lead     | `pending` | `pending` | `pending` | RB-01, RB-03, RB-04               | NB-01, NB-06, NB-08 |
| Governance Board — QA Lead              | `pending` | `pending` | `pending` | RB-03, RB-05                      | NB-04               |
| Governance Board — Legal/OSS Compliance | `pending` | `pending` | `pending` | RB-02                             | NB-02, NB-03        |
