# Story 5.2 — Reuse/Canonical Compliance and Provenance Completion

- **Issue:** [#32](https://github.com/VilnaCRM-Org/ui-toolkit/issues/32)
- **PR:** [#126](https://github.com/VilnaCRM-Org/ui-toolkit/pull/126) (draft)
- **Branch:** `feat/issue-32-provenance-compliance`
- **Epic:** Epic 5 — Production Adoption Readiness
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 5.2: Reuse/Canonical Compliance and
  Provenance Completion_ (`epics.md:682-703`)

## Scope

Close the three provenance/compliance obligations `epics.md:682-703` places on this story:

1. **AC-1** — every delivered or enhanced component carries a `source`
   (`crm` / `website` / `new`) plus rationale in
   `specs/planning-artifacts/component-provenance.md`, with the registry's coverage contract
   stated so "unrecorded" can no longer be confused with "deliberately excluded".
2. **AC-2** — canonical-behaviour alignment is documented **using**
   `specs/implementation-artifacts/story-dod-template.md`. `epics.md:81-84` binds Stories 2.1-2.4,
   2.4A, 2.5 and 3.1-3.5 to that template by name, yet none of the six Epic 2 artifacts and none of
   the three Epic 1 artifacts contains a Definition-of-Done section at all. This story closes that
   by **instantiating the template once, across the whole delivered set**, in the compliance matrix
   below — not by retro-fitting checklists into nine merged historical artifacts.
3. **AC-3** — deviations are explicitly justified, recorded, and **visible for release review**.
   Today they are scattered across free prose in registry cells, the board checklist's board-scoped
   `D-01`…`D-18` table, and 19 story artifacts. This story adds a single enumerable surface,
   `specs/planning-artifacts/deviation-ledger.md`, and lists every unfiled follow-up in
   [Release-review action list](#release-review-action-list).

Boundaries held deliberately:

- **Story 5.1** owns the board coverage checklist and its drift guard; this story cites
  `board-coverage-checklist.md` and never edits it (editing it would also collide with
  `tests/unit/board-coverage-traceability.test.ts`).
- **Story 5.3** owns export-contract remediation — including the `ui-card-item` duplication this
  story rules on but does not resolve.
- **Story 5.4** owns the consolidated release-readiness governance report.
- The Epic 1-4 quality-gate closure stories
  ([#27](https://github.com/VilnaCRM-Org/ui-toolkit/issues/27),
  [#28](https://github.com/VilnaCRM-Org/ui-toolkit/issues/28),
  [#29](https://github.com/VilnaCRM-Org/ui-toolkit/issues/29),
  [#30](https://github.com/VilnaCRM-Org/ui-toolkit/issues/30)) own gate sign-off. A `Complete`
  verdict below asserts **documentation evidence**, never gate closure.

## Deliverables

1. `specs/planning-artifacts/component-provenance.md` — registry completion: a `## Scope` coverage
   contract, a new `### Epic 0 — Seeded parity baseline` section for the 13 pre-Epic-1 modules, an
   Epic 1 source re-audit against both pinned upstream commits, audit pins on the Epic 2/3
   preambles, reference IDs (`story · issue · PR`) on every row, per-row `Deviations:` clauses, and
   correction of the stale claims the audit surfaced.
2. `specs/planning-artifacts/deviation-ledger.md` — the single enumerable deviation surface,
   `DEV-01`…`DEV-50`, with closed `Kind`/`Status` token sets and a non-empty tracking ref on every
   row. `DEV-01`…`DEV-18` mirror the checklist's `D-01`…`D-18` **by reference**, so Story 5.1's
   decision text is never forked.
3. This artifact — the DoD compliance matrix (AC-2) and the release-review action list (AC-3).
4. `tests/unit/component-provenance-traceability.test.ts` — the registry drift guard, so
   registry-wide DoD compliance is machine-enforced instead of review-dependent (the Story 5.1
   precedent, `tests/unit/board-coverage-traceability.test.ts`). Like Story 5.1's guard, it is
   delivered by the story that cites it — installed in this branch's diff, 990 assertions green.
5. Header/metadata repair across the 18 existing story artifacts (`PR` lines, stale `Status` lines,
   the wrong-organisation issue URL in `3-5-board-a-micro-components.md`), plus the
   `sprint-status.yaml` reconciliation described under
   [Sprint-status reconciliation](#sprint-status-reconciliation).

## DoD compliance matrix (AC-2)

`epics.md:81-84` requires every Epic 2 and Epic 3 delivery story to record source, reuse rationale
and reference IDs "using the shared Definition of Done checklist at
`specs/implementation-artifacts/story-dod-template.md`". Measured against the tree:

- The three Epic 1 artifacts and all six Epic 2 artifacts contain **no** Definition-of-Done section.
- Stories 3.1-3.5 contain a `## Definition of Done` table of their own design; 3.5's has no status
  column.
- Only Stories 4.1, 4.2, 4.3 and 5.1 instantiate the six template sections by name.

Retro-editing nine merged artifacts to bolt on checklists would rewrite the historical record and
would still not be the template's instantiation. Instead this matrix instantiates the template once
per delivery story, citing the evidence that already exists. Rows: one per file in
`specs/implementation-artifacts/` other than `story-dod-template.md`, `sprint-status.yaml` and this
artifact, plus one row for the pre-Epic-1 parity layer, which has no story artifact at all.

### How to read the matrix

Every cell is `<verdict> — <evidence locator>`. The three verdict tokens are closed:

| Token                | Meaning                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Complete`           | The evidence for that template section exists in the story's own artifact (or the section is explicitly not applicable).    |
| `Evidence-elsewhere` | The evidence exists and is cited, but lives outside the story artifact — a PR diff/body, the registry, the board checklist. |
| `Gap`                | No evidence exists anywhere. The cell names the surface that is missing and the owning follow-up.                           |

The `Verdict` column is the row roll-up: the weakest token in that row's six cells. Locator
shorthands, expanded once here to keep the cells narrow:

- `art §X` — section `X` of the artifact named in the Story column.
- `reg §Epic N` — the matching Registry section of `specs/planning-artifacts/component-provenance.md`.
- `chk` — `specs/planning-artifacts/board-coverage-checklist.md`.
- `led DEV-nn` — the row with that id in `specs/planning-artifacts/deviation-ledger.md`.
- `PR #NNN` — the pull request body and diff.

`Delivery state` records merged-PR evidence, measured against `gh` on 2026-08-06 rather than
inferred from the artifacts. It is deliberately separate from the verdict: an open PR does not
weaken documentation evidence, and a merged PR does not supply evidence it never carried.

### Matrix

| Story (artifact)                                                         | §1 Changed files                                                                                                      | §2 Provenance                                                                                                                                                                                                                           | §3 Tests                                                                                                                       | §4 Storybook                                                                                                                                     | §5 Exports                                                                                                                                                                                                                                                                                                                   | §6 Parity                                                                                                                                                                                             | Verdict              | Delivery state                                                                                                                                                          |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parity layer, pre-Epic 1 — 13 seeded modules, no story artifact          | `Evidence-elsewhere` — PR #37/#38/#39/#46 diffs; seed commits `b9449a6`, `7eea76a`, `fc18c9a`; kebab rename `60b19c8` | `Complete` — `reg §Epic 0` (added by this story): 13 rows carrying both upstream remotes and both audited commits                                                                                                                       | `Evidence-elsewhere` — `tests/unit/layout.test.tsx`, `ui-footer.test.tsx`, `ui-card-list.test.tsx`, `ui-back-to-main.test.tsx` | `Evidence-elsewhere` — 11 of 13 ship a `*.stories.tsx`; `ui-color-theme` and `ui-breakpoints` are token surfaces with no story                   | `Complete` — all 13 exported from `src/components/index.ts`; surface pinned by `tests/unit/components-index.test.ts`                                                                                                                                                                                                         | `Gap` — the four stack PR bodies carry no Figma node, no source label and no issue link (their `#N` refs are PR-to-PR stack links); `reg §Epic 0` is the only evidence. See the DOD-03 ruling below   | `Gap`                | Merged as a four-PR stack: #37 (2026-06-04), #38 (2026-06-09), #39 (2026-06-12), #46 (2026-06-18)                                                                       |
| Story 1.1 (`1-1-core-contract-and-export-baseline.md`)                   | `Complete` — `art §Dev Agent Record` → `File List`, 30 paths                                                          | `Evidence-elsewhere` — `reg §Epic 1` rows plus the Epic 1 preamble added by this story; the artifact never uses the word "provenance"                                                                                                   | `Complete` — `art §Dev Agent Record` → `Completion Notes List` (19 suites / 52 tests); `tests/unit/ui-core-contract.test.tsx`  | `Complete` — not applicable: a contract/export baseline, no new variant or state delivered                                                       | `Complete` — `art §Tasks / Subtasks`, "Enforce core control export completeness"; pinned by `tests/unit/ui-core-contract.test.tsx`                                                                                                                                                                                           | `Complete` — not applicable: AC 1-3 are contract, gate and backward-compatibility only, with no design or source-parity mandate                                                                       | `Evidence-elsewhere` | No PR of its own — landed in the pre-Epic-1 stack (#37/#38/#39/#46); PRs #8 and #9 CLOSED unmerged (#38's body records the replacement); issue #10 CLOSED               |
| Story 1.2 (`1-2-core-control-state-parity-completion.md`)                | `Evidence-elsewhere` — `art §Dev Agent Record` → `File List`; PR #68 diff                                             | `Complete` — `art §Tasks / Subtasks` records the registry write; `reg §Epic 1` rows for `UiButton`, `UiInput`, `UiCheckbox`, `UiLink`                                                                                                   | `Complete` — `art §Dev Agent Record`: unit suite on the host, visual suite in the pinned Playwright image                      | `Complete` — `art §Tasks / Subtasks`: `input hover`, `checkbox hover`, `link active` baselines added; no new story export                        | `Complete` — no public export change; the artifact records prop-surface work only                                                                                                                                                                                                                                            | `Evidence-elsewhere` — no Figma node id in the artifact and none in PR #68's body; the board state scope is carried by `chk` Board A/B rows and `reg §Epic 1`                                         | `Evidence-elsewhere` | Merged — PR #68 → `main`, 2026-06-30; issue #11 CLOSED                                                                                                                  |
| Story 1.3 (`1-3-accessibility-and-interaction-consistency-hardening.md`) | `Evidence-elsewhere` — `art §Dev Agent Record` → `File List`; PR #69 diff                                             | `Complete` — `reg §Epic 1` `UiCheckbox` row (`required`/`helperText`) and the Epic 1 accessibility note                                                                                                                                 | `Complete` — `art §Dev Agent Record`; `tests/unit/core-controls-accessibility.test.tsx` is the Epic 1 accessibility gate       | `Complete` — `art §Scope Decision`: no new visual baselines, by product direction; focus-ring visuals deferred to `led DEV-03`                   | `Complete` — no export change; optional backward-compatible props only                                                                                                                                                                                                                                                       | `Complete` — not applicable: the story changes no component colours (`art §Scope Decision`), so it carries no visual-parity mandate                                                                   | `Evidence-elsewhere` | Merged — PR #69 → `main`, 2026-07-01; issue #12 CLOSED                                                                                                                  |
| Story 2.1 (`2-1-search-and-select-foundation.md`)                        | `Evidence-elsewhere` — no changed-file inventory in the artifact; satisfied by the PR #106 diff                       | `Complete` — `art §Provenance` (source `new`, canonical-source reasoning) and `reg §Epic 2` rows `UiSearchInput` / `UiSelectWithSearch`                                                                                                 | `Complete` — `art §Governance / CI gates addressed`: unit coverage, mutation gate, e2e/visual manifest tests                   | `Complete` — `art §Governance / CI gates addressed`: stories registered in `tests/visual/stories.json`, baselines in the pinned Playwright image | `Complete` — `art §Governance / CI gates addressed`: exports added to `src/components/index.ts`, `tests/unit/components-index.test.ts` updated                                                                                                                                                                               | `Evidence-elsewhere` — the artifact carries no Figma node id; PR #106's body carries two, and `chk` Board B carries the per-state ids                                                                 | `Evidence-elsewhere` | Merged — PR #106 → `main`, 2026-07-20; issue #13 CLOSED                                                                                                                 |
| Story 2.2 (`2-2-multi-select-interaction-workflow.md`)                   | `Evidence-elsewhere` — no changed-file inventory in the artifact; satisfied by the PR #109 diff                       | `Complete` — `art §Provenance` and `reg §Epic 2` `UiMultiSelect` row; the delete-affordance claim in that row is corrected by this story (`led DEV-24`)                                                                                 | `Complete` — `art §Governance / CI gates addressed`                                                                            | `Complete` — `art §Governance / CI gates addressed`: stories registered in `tests/visual/stories.json`                                           | `Complete` — `art §Governance / CI gates addressed`: `src/components/index.ts` and `tests/unit/components-index.test.ts`                                                                                                                                                                                                     | `Complete` — `art §Design decisions` carries node `535:37450`; PR #109's body carries one node id                                                                                                     | `Evidence-elsewhere` | Merged — PR #109 → `main`, 2026-07-23 (canonical). PR #108 merged 2026-07-06 into `feat/issue-15-calendar-multi-select` and is superseded; see DOD-09. Issue #14 CLOSED |
| Story 2.3 (`2-3-calendar-multi-select-variant.md`)                       | `Evidence-elsewhere` — no changed-file inventory in the artifact; satisfied by the PR #107 diff                       | `Complete` — `art §Provenance` and `reg §Epic 2` `UiCalendarMultiSelect` row                                                                                                                                                            | `Complete` — `art §Governance / CI gates addressed`                                                                            | `Complete` — `art §Governance / CI gates addressed`: stories registered in `tests/visual/stories.json`                                           | `Complete` — `art §Governance / CI gates addressed`: `src/components/index.ts` and `tests/unit/components-index.test.ts`                                                                                                                                                                                                     | `Evidence-elsewhere` — the only design-parity delivery PR whose body carries zero Figma node ids, and the artifact carries none either; see DOD-10                                                    | `Evidence-elsewhere` | Merged — PR #107 → `main`, 2026-07-25; issue #15 CLOSED                                                                                                                 |
| Story 2.4 (`2-4-radio-group-input-workflow.md`)                          | `Evidence-elsewhere` — no changed-file inventory in the artifact; satisfied by the PR #112 diff                       | `Complete` — `art §Provenance` and `reg §Epic 2` `UiRadioGroup` row                                                                                                                                                                     | `Complete` — `art §Governance / CI gates addressed`                                                                            | `Complete` — `art §Governance / CI gates addressed`: stories registered in `tests/visual/stories.json`                                           | `Complete` — `art §Governance / CI gates addressed`: `src/components/index.ts` and `tests/unit/components-index.test.ts`                                                                                                                                                                                                     | `Complete` — `art §Design decisions` carries node `151:6441`; PR #112's body carries one node id                                                                                                      | `Evidence-elsewhere` | Merged — PR #112 → `feat/issue-15-calendar-multi-select`, 2026-07-20; reached `main` inside PR #107. Issue #16 still OPEN; see the issue-state note                     |
| Story 2.4A (`2-4a-file-upload-input-workflows.md`)                       | `Evidence-elsewhere` — the only artifact carrying a `PR` line before this story's header pass; PR #114 diff           | `Complete` — `art §Provenance` and `reg §Epic 2` `UiFileUploadInput` row, whose stale "no dedicated upload component" claim and off-page node ids this story corrects (D-12)                                                            | `Complete` — `art §Governance / CI gates addressed`                                                                            | `Complete` — `art §Governance / CI gates addressed`: stories registered in `tests/visual/stories.json`                                           | `Complete` — `art §Governance / CI gates addressed`: `src/components/index.ts` and `tests/unit/components-index.test.ts`                                                                                                                                                                                                     | `Evidence-elsewhere` — three of the artifact's six node ids (`193:4763`, `269:7159`, `345:17479`) are off the "Ui kit" page; the Board A five-state cluster is recorded in `chk` and in `reg §Epic 2` | `Evidence-elsewhere` | Open — PR #114, base `main`, not a draft; issue #17 OPEN                                                                                                                |
| Story 2.5 (`2-5-pagination-workflow-component-delivery.md`)              | `Evidence-elsewhere` — no changed-file inventory in the artifact; satisfied by the PR #116 diff                       | `Complete` — `art §Provenance` and `reg §Epic 2` `UiPagination` row                                                                                                                                                                     | `Complete` — `art §Governance / CI gates addressed`                                                                            | `Complete` — `art §Governance / CI gates addressed`: stories registered in `tests/visual/stories.json`                                           | `Complete` — `art §Governance / CI gates addressed`: `src/components/index.ts` and `tests/unit/components-index.test.ts`                                                                                                                                                                                                     | `Complete` — `art §Design decisions` carries `360:12218`, `439:19463`, `439:19478`; PR #116's body carries three                                                                                      | `Evidence-elsewhere` | Merged — PR #116 → `feat/issue-17-file-upload-input`, 2026-07-23; reaches `main` only when PR #114 merges. Issue #18 OPEN                                               |
| Story 3.1 (`3-1-item-row-and-list-data-presentation.md`)                 | `Evidence-elsewhere` — no changed-file inventory in the artifact; satisfied by the PR #117 diff                       | `Complete` — `art §Provenance`, `art §Definition of Done` row "Export + provenance recorded", and `reg §Epic 3` `UiItemRow` / `UiItemsList` rows                                                                                        | `Complete` — `art §Governance / CI gates addressed` and `art §Definition of Done` row "Quality gates green"                    | `Complete` — `art §Governance / CI gates addressed`: stories plus showcase tiles registered in `tests/visual/stories.json`                       | `Complete` — `art §Definition of Done` row "Export + provenance recorded"; `src/components/index.ts`                                                                                                                                                                                                                         | `Complete` — `art §Design fidelity`, 11 node ids; PR #117's body carries four                                                                                                                         | `Evidence-elsewhere` | Open — PR #117, draft, base `feat/issue-17-file-upload-input`; issue #19 OPEN                                                                                           |
| Story 3.2 (`3-2-task-card-workflow.md`)                                  | `Evidence-elsewhere` — no changed-file inventory in the artifact; satisfied by the PR #120 diff                       | `Complete` — `art §Provenance` and `reg §Epic 3` `UiTaskCard` row; the disabled-visual escalation is `led DEV-08`                                                                                                                       | `Complete` — `art §Governance / CI gates addressed` and `art §Definition of Done`                                              | `Complete` — `art §Governance / CI gates addressed`: stories and forced-state tiles registered in `tests/visual/stories.json`                    | `Complete` — `art §Definition of Done`; `src/components/index.ts`                                                                                                                                                                                                                                                            | `Complete` — `art §Design fidelity` carries `439:19884` and `439:20208`; PR #120's body carries two                                                                                                   | `Evidence-elsewhere` | Open — PR #120, draft, base `feat/issue-19-item-row-and-list`; issue #20 OPEN                                                                                           |
| Story 3.3 (`3-3-profile-select-card-workflow.md`)                        | `Evidence-elsewhere` — no changed-file inventory in the artifact; satisfied by the PR #121 diff                       | `Complete` — `art §Provenance` and `reg §Epic 3` `UiProfileSelectCard` row                                                                                                                                                              | `Complete` — `art §Governance / CI gates addressed` and `art §Definition of Done`                                              | `Complete` — `art §Governance / CI gates addressed`: stories registered in `tests/visual/stories.json`                                           | `Complete` — `art §Definition of Done`; `src/components/index.ts`                                                                                                                                                                                                                                                            | `Complete` — `art §Design fidelity`, five node ids incl. Board C `439:19893`; PR #121's body carries five                                                                                             | `Evidence-elsewhere` | Open — PR #121, draft, base `feat/issue-20-task-card`; issue #21 OPEN                                                                                                   |
| Story 3.4 (`3-4-integration-card-workflow.md`)                           | `Evidence-elsewhere` — no changed-file inventory in the artifact; satisfied by the PR #122 diff                       | `Complete` — `art §Provenance` and `reg §Epic 3` `UiIntegrationCard` row; the disabled-visual escalation is `led DEV-16`                                                                                                                | `Complete` — `art §Governance / CI gates addressed` and `art §Definition of Done`                                              | `Complete` — `art §Governance / CI gates addressed`: stories registered in `tests/visual/stories.json`                                           | `Complete` — `art §Definition of Done`; `src/components/index.ts`                                                                                                                                                                                                                                                            | `Complete` — `art §Design fidelity`, six node ids; PR #122's body carries four                                                                                                                        | `Evidence-elsewhere` | Open — PR #122, draft, base `feat/issue-21-profile-select-card`; issue #22 OPEN                                                                                         |
| Story 3.5 (`3-5-board-a-micro-components.md`)                            | `Evidence-elsewhere` — see the expanded block below; the artifact's DoD table has `DoD item` / `AC` columns only      | `Evidence-elsewhere` — see the expanded block below; the string "provenance" occurs zero times in the artifact                                                                                                                          | `Evidence-elsewhere` — see the expanded block below                                                                            | `Evidence-elsewhere` — see the expanded block below                                                                                              | `Evidence-elsewhere` — see the expanded block below                                                                                                                                                                                                                                                                          | `Complete` — `art §Scope` → `Design sources — Figma node map` (`3-5-board-a-micro-components.md:34-67`); 47 node ids in the artifact                                                                  | `Evidence-elsewhere` | Open — PR #123, draft, base `feat/issue-22-integration-card`; issue #23 OPEN                                                                                            |
| Story 4.1 (`4-1-crm-skeleton-baseline-and-provenance-lock.md`)           | `Complete` — `art §Deliverables` and `art §Definition of Done` bullet 1                                               | `Complete` — `art §Definition of Done` bullet 2 (source `crm@0057d78…`, PRD §3.2/§3.4, issue #24) and the `reg §Epic 4` shared-baseline preamble                                                                                        | `Complete` — `tests/unit/skeleton-crm-parity.test.ts`, the animation-parity lock                                               | `Complete` — `art §Definition of Done` bullet 4: no new stories required, no visual change                                                       | `Complete` — `art §Definition of Done` bullet 5: no export-surface change                                                                                                                                                                                                                                                    | `Complete` — `art §Animation parity verification (line-level diff)`, locked by the parity test; Board D `538:38316`                                                                                   | `Complete`           | Open — PR #124, draft, base `feat/issue-23-board-a-micro-components`; issue #24 OPEN                                                                                    |
| Story 4.2 (`4-2-skeleton-primitive-variants.md`)                         | `Complete` — `art §Definition of Done` bullet 1 (module, extension, wiring, test paths)                               | `Complete` — `art §Definition of Done` bullet 2 and `reg §Epic 4` rows                                                                                                                                                                  | `Complete` — `art §Definition of Done` bullet 3: unit suite at 100% on both touched directories                                | `Complete` — `art §Definition of Done` bullet 4: Round/Block/CustomSize and ManyLines registered                                                 | `Complete` — `art §Definition of Done` bullet 5 (`UiSkeletonImage`)                                                                                                                                                                                                                                                          | `Complete` — `art §Design sources — Figma node map` plus `art §Definition of Done` bullet 6 (measured geometry)                                                                                       | `Complete`           | Open — PR #124, draft, base `feat/issue-23-board-a-micro-components`; issue #25 OPEN                                                                                    |
| Story 4.3 (`4-3-composed-skeleton-layout-variants.md`)                   | `Complete` — `art §Definition of Done` bullet 1 (six module dirs, six test files, shared shell, wiring)               | `Complete` — `art §Definition of Done` bullet 2 and `reg §Epic 4` rows; `ComposedSkeleton` recorded as deliberately internal                                                                                                            | `Complete` — `art §Definition of Done` bullet 3: unit suite at 100% on every new module                                        | `Complete` — `art §Definition of Done` bullet 4: 15 registry entries                                                                             | `Complete` — `art §Definition of Done` bullet 5, six exports                                                                                                                                                                                                                                                                 | `Complete` — `art §Design sources — Figma node map` plus `art §Definition of Done` bullet 6; deviations `led DEV-17`, `led DEV-18`                                                                    | `Complete`           | Open — PR #124, draft, base `feat/issue-23-board-a-micro-components`; issue #26 OPEN                                                                                    |
| Story 5.1 (`5-1-board-coverage-closure-and-traceability.md`)             | `Complete` — `art §Changed files`, 12 rows                                                                            | `Complete` — `art §Definition of Done` §2; the `UiLink` registry row records the delivered `disabled` state                                                                                                                             | `Complete` — `art §Definition of Done` §3; `tests/unit/board-coverage-traceability.test.ts` is the drift guard                 | `Complete` — `art §Definition of Done` §4: no new story export; a `disabled` control on the existing story plus a `link disabled` visual test    | `Complete` — `art §Definition of Done` §5: no public export change; two inconsistencies handed to Story 5.3                                                                                                                                                                                                                  | `Complete` — `art §Definition of Done` §6: boards A `439:19252`, B `439:19374`, C `439:19893`, D `538:38316`, and the re-measured `439:19364` / `439:19614`                                           | `Complete`           | Open — PR #125, draft, base `feat/issue-24-skeleton-parity`; issue #31 OPEN                                                                                             |
| Story 5.3 (`5-3-export-contract-and-entry-point-integrity.md`)           | `Evidence-elsewhere` — `art §Changed files` is still `_(completed at hand-off)_`; satisfied by the issue #33 PR diff  | `Evidence-elsewhere` — `art §Definition of Done` §2: the story adds no module, so `component-provenance.md` gains no row; its one provenance-surface edit is the `DEV-42` correction in the ledger, made under Story 5.2's own hand-off | `Complete` — `art §Definition of Done` §3; `tests/unit/export-contract-integrity.test.ts` added as the export drift guard      | `Complete` — not applicable: no rendered output changes, so no story and no baseline change; `tests/visual/stories.json` is read, not modified   | `Complete` — `art §Definition of Done` §5: public type exports added across the delivered set; `src/components/index.ts` gains type-only exports and no value export is added, removed or renamed; the surface is locked by `specs/planning-artifacts/export-contract.md` and `tests/unit/export-contract-integrity.test.ts` | `Complete` — not applicable: no design or source-parity mandate and no visual surface change                                                                                                          | `Evidence-elsewhere` | Open — PR draft opened at hand-off (number recorded in the artifact header), base `feat/issue-32-provenance-compliance`; issue #33 OPEN                                 |

Roll-up: 4 rows `Complete`, 15 rows `Evidence-elsewhere`, 1 row `Gap`. The single `Gap` is the
parity layer's §6, ruled on immediately below.

### Dependency note

The `reg §Epic 0` and `reg §Epic 1` locators above depend on the registry sections this story
delivers. If either is reduced during review, the affected cells revert to `Gap` and the roll-up
must be restated — they are not evidence that predates this changeset.

### Story 3.5 — expanded block

Story 3.5 delivered six components in one PR (`UiFilterChip`, `UiPinInput`, `UiStatusBadge`,
`UiNotificationBadge`, `UiActionIconBar`, `UiPaymentOptionCard`) and is the weakest DoD surface in
the delivered set, so its row is expanded rather than compressed:

- **The artifact never records provenance.** The string "provenance" occurs **zero** times in the
  110 KB `3-5-board-a-micro-components.md`. §2 is therefore satisfied only by the six Epic 3
  registry rows — `UiFilterChip`, `UiPinInput`, `UiPaymentOptionCard`, `UiActionIconBar`,
  `UiStatusBadge`, `UiNotificationBadge` — which this story completes with reference IDs and
  explicit `Deviations:` clauses.
- **Its DoD table has no status column.** `3-5-board-a-micro-components.md:2073-2088` is a
  12-row table with `DoD item` and `AC` columns only. Every row states an intention; none states an
  outcome. §1, §3, §4 and §5 are consequently `Evidence-elsewhere`, satisfied by the PR #123 diff
  together with the DoD rows "Barrel exports + drift guard updated", "Stories + showcase tiles +
  regenerated `stories.json`", "Visual baselines generated in the pinned Playwright image" and
  "100% coverage, `rca`, `tsc`, ESLint, Prettier, depcruise green".
- **§6 is the artifact's strongest section.** The Figma node map at
  `3-5-board-a-micro-components.md:34-67` gives per-state ids for five of the six components plus a
  per-icon table for `ui-action-icon-bar`; the artifact carries 47 distinct node ids, more than any
  other, and PR #123's body carries seven.
- **Deviations it owns.** Nine WCAG 1.4.11 decoration exemptions (`led DEV-26`…`led DEV-34`), the
  `settings-04` 30×30 slot (`led DEV-35`), the seven out-of-scope Board A paints
  (`led DEV-44`…`led DEV-50`, from `3-5-board-a-micro-components.md:1884-1898`), and the S10
  contrast inventory at `3-5-board-a-micro-components.md:1915-1973` — 17 of its 27 rows carry a
  `FAIL` verdict (13 of them `FAIL (log)`) plus three exempt-logged rows, routed to `led DEV-03`.

### DOD-03 ruling — the pre-Epic-1 parity layer is in scope

The 13 modules seeded before Epic 1 — `Layout`, `UiBackToMain`, `UiCardList`, `UiContainer`,
`UiFooter`, `UiForm`, `UiImage`, `UiTextFieldForm`, `UiToolbar`, `UiTooltip`, `UiTypography`,
`UiColorTheme`, `UiBreakpoints` — are **in scope** for provenance and DoD compliance. They are all
on the public export surface of `src/components/index.ts`, so `epics.md` FR-level provenance
tracking applies to them exactly as it applies to Epic 1-4 components. They are recorded in the
registry's new `### Epic 0 — Seeded parity baseline` section. No future story needs to re-litigate
this (AC-4).

The reason the ruling has to be written down is that the template's own fallback does not work for
this surface. Story 1.1 has **no merged PR of its own**: PRs
[#8](https://github.com/VilnaCRM-Org/ui-toolkit/pull/8) and
[#9](https://github.com/VilnaCRM-Org/ui-toolkit/pull/9) were closed unmerged, and the code landed
through the four-PR stack [#37](https://github.com/VilnaCRM-Org/ui-toolkit/pull/37),
[#38](https://github.com/VilnaCRM-Org/ui-toolkit/pull/38),
[#39](https://github.com/VilnaCRM-Org/ui-toolkit/pull/39) and
[#46](https://github.com/VilnaCRM-Org/ui-toolkit/pull/46). Those four bodies were read for this
ruling: none links an issue (their `#N` references are PR-to-PR stack pointers — PR #38 states it
replaces draft PR #9, PR #46 states it sits above PR #39), none carries a Figma node id, and none
carries a `crm` / `website` / `new` source marking. So `story-dod-template.md` §1's "directly
reviewable in the linked PR diff" fallback is **void** for this surface, and the registry row is the
only provenance evidence that exists. That is why the parity layer's §6 cell is `Gap` and not
`Evidence-elsewhere`.

### DOD-09 ruling — Story 2.2's canonical delivery PR is #109

Story 2.2 has two merged PRs.
[#108](https://github.com/VilnaCRM-Org/ui-toolkit/pull/108) and
[#109](https://github.com/VilnaCRM-Org/ui-toolkit/pull/109) share the same issue (#14), the same
head branch (`feat/issue-14-multi-select`) and the same title; #108 merged 2026-07-06 into
`feat/issue-15-calendar-multi-select` and #109 merged 2026-07-23 into `main`. #109 is canonical
because it is the one that reached `main` and it is the later of the two; #108 is **superseded by
the Epic 2 stack reorder** that re-based Epic 2 into epic order. Cite #109 in provenance and
governance records; cite #108 only as the superseded predecessor.

### DOD-10 ruling — Story 2.3's parity evidence lives outside its PR

PR [#107](https://github.com/VilnaCRM-Org/ui-toolkit/pull/107) is the only design-parity delivery PR
whose body carries **zero** Figma node ids, and `2-3-calendar-multi-select-variant.md` carries none
either. The five calendar nodes — rest `601:54620`, hover `606:41801`, range selection `606:41904`,
cross-month pair `606:42007` / `606:42218` — entered the record later, through Story 5.1's registry
and checklist pass, where they are recorded today. The §6 cell is therefore `Evidence-elsewhere`.
The merged PR is **not** edited: rewriting a merged PR body would fabricate contemporaneous evidence
that did not exist.

### Issue-state note (DOD-07)

GitHub issue open/closed state is **not** a reliable delivery signal in this repository, and Story
5.4 must not re-derive delivery status from it. Measured on 2026-08-06:

- Issues #16 and #18 are OPEN although their delivery PRs #112 and #116 are **merged**. Both merged
  into a feature base (`feat/issue-15-calendar-multi-select` and `feat/issue-17-file-upload-input`)
  rather than into `main`, so their `Closes #NN` keywords never fired.
- Issues #17, #19, #20, #21, #22, #23, #24, #25 and #26 are OPEN because their delivery PRs (#114,
  #117, #120, #121, #122, #123, #124) are themselves still open in the review stack —
  `main` ← #114 ← #117 ← #120 ← #121 ← #122 ← #123 ← #124 ← #125.
- Issues #10-#15 are CLOSED and their PRs merged into `main`, which is the only combination where
  issue state and delivery state agree.

The authoritative delivery signal is the `Delivery state` column above, derived from `gh pr view`
and from the component directories present on `origin/main`.

## Release-review action list

`epics.md:682-703` (AC-3) requires each recorded deviation to be "visible for release review". No
new GitHub issues were filed in this changeset, so with two exceptions every follow-up below carries
an `unfiled:<owner-role>` token in `deviation-ledger.md` rather than an issue number, and is
enumerated here as an explicit release-review action. The two exceptions are `DEV-41`, which is
ratified inside this story's own issue #32, and `DEV-42`, which is handed to Story 5.3
([#33](https://github.com/VilnaCRM-Org/ui-toolkit/issues/33)). Ledger ids and owner roles below are
reproduced verbatim from `specs/planning-artifacts/deviation-ledger.md`; A-02 and the `UiTooltip`
`aria-controls` note are the two items with no ledger row, so this list is the only place they are
enumerated.

| Ledger id           | Follow-up                                                                                     | Tracking ref                 | Release-review action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEV-03` (`D-03`)   | Accessibility-visuals remediation: focus-ring appearance and colour contrast, repo-wide       | `unfiled:accessibility-lead` | File before `v1.0.0` sign-off. Largest deferral bucket in the project: 12 components named in `D-03`, F1 (checkbox, Critical), F2 (buttons) and F7 (input) from Story 1.3, plus the S10 inventory at `3-5-board-a-micro-components.md:1915-1973` — 17 of 27 rows carrying a `FAIL` verdict, down to 1.20:1 (`UiStatusBadge` rest check) and 1.25:1 (`UiPinInput` rest border). Issue [#66](https://github.com/VilnaCRM-Org/ui-toolkit/issues/66) is the a11y **standard/gate** ticket and is not this work. |
| `DEV-22`            | `UiCheckbox` visual required indicator (asterisk/colour) deferred                             | `unfiled:accessibility-lead` | File separately. `D-03` is scoped to focus-ring visuals and contrast and does **not** cover it; the deferral is declared only in `src/components/ui-checkbox/types.ts`.                                                                                                                                                                                                                                                                                                                                     |
| `DEV-08` (`D-08`)   | `UiTaskCard` disabled visual has no Figma master                                              | `unfiled:design-lead`        | Designer escalation. Confirm a disabled master or ratify semantics-only.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `DEV-09` (`D-09`)   | `UiStatusBadge` rest-vs-active is fill-colour-only; forced-colors flattens the distinction    | `unfiled:design-lead`        | Designer escalation. A state-differentiating glyph or border style would close it; the design currently forbids a glyph-level distinction.                                                                                                                                                                                                                                                                                                                                                                  |
| `DEV-16` (`D-16`)   | `UiIntegrationCard` disabled visual has no Figma master                                       | `unfiled:design-lead`        | Designer escalation; same class as `DEV-08`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `DEV-15` (`D-15`)   | Board B period segmented switcher (rest `439:19868`, hover `439:19877`) ruled out of `v1.0.0` | `unfiled:component-lead`     | Confirm or overturn the release owner's non-goal ruling; Story 5.1 surfaced it for Component Lead confirmation and it is still `pending-ratification`. A dedicated component is the recommended follow-up story.                                                                                                                                                                                                                                                                                            |
| `DEV-17` (`D-17`)   | `UiSkeletonWidget` cannot render Board D's wide 1167×540 block and chart widgets              | `unfiled:frontend-team`      | File a follow-up story or ratify the deviation.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `DEV-18` (`D-18`)   | Board D's wide task-list card `632:46480` has a distinct dual-avatar anatomy                  | `unfiled:design-lead`        | File a follow-up story or ratify the deviation.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| A-02 (no ledger id) | Board A social-icon four-state row (`439:19285`, `439:19296`, `439:19307`, `439:19318`)       | `unfiled:component-lead`     | Board-painted, absent from `prd.md` §4.1, expressed by no delivered component. Recorded in the board checklist's out-of-scope appendix and `pending-ratification` since Story 5.1.                                                                                                                                                                                                                                                                                                                          |
| — (registry note)   | `UiTooltip` trigger exposes no `aria-controls` back to its disclosure content                 | `unfiled:accessibility-lead` | Recorded in the registry's `UiTooltip` row and in code at `src/components/ui-card-item/card-content.tsx:20-25`; outside the fixed `v1.0.0` ledger allocation. File with the accessibility-visuals batch or ratify the tooltip contract as-is.                                                                                                                                                                                                                                                               |
| `DEV-41`            | Epic 1 source labels and the "`crm`-canonical tokens (`ui-color-theme`)" claim                | Component Lead · #32         | **Ratify in this PR.** This story re-audits the four Epic 1 rows against both pinned upstream commits and writes the verdict the file-content evidence supports; the barrel default-exports `websiteColorTheme`, which the existing claim does not reflect. Status `pending-ratification`.                                                                                                                                                                                                                  |
| `DEV-42`            | Two near-identical `UiCardItem` implementations                                               | Story 5.3 · #33              | This story records the canonical ruling only. The **export** decision is Story 5.3's, per the hand-off below.                                                                                                                                                                                                                                                                                                                                                                                               |
| `DEV-44`…`DEV-50`   | Seven Board A paints ruled out of scope by Story 3.5 and visible in neither release artifact  | `unfiled:component-lead`     | Confirm the non-goal ruling for each, or schedule them. They are the same class as A-02, which **was** elevated, so the omission is inconsistent rather than principled. Listed at `3-5-board-a-micro-components.md:1884-1898`.                                                                                                                                                                                                                                                                             |

## Hand-offs recorded, owned elsewhere

Recorded so they are not lost; resolving them is out of this story's scope:

- **Story 5.3** owns the export decision for `src/components/ui-card-item`, which ships stories,
  unit tests and committed visual baselines but is not exported from `src/components/index.ts`.
  This story rules only on which of the two near-identical implementations
  (`src/components/ui-card-item/index.tsx` vs `src/components/ui-card-list/ui-card-item.tsx`) is
  canonical, and records it as `DEV-42`. Story 5.1 opened this hand-off and this story keeps it
  open, so the trail is continuous.
- **Story 5.3** must also not read `ComposedSkeleton` (`src/components/ui-skeletons/composed.tsx`)
  as a missing export: it is deliberately internal, and the registry marks it as such.
- **Story 5.4** consumes the `Delivery state` column and the issue-state note above instead of
  re-deriving delivery status from GitHub issue state.
- The nine `1.4.11 decoration-exempt` source comments and the other deviation comment sites are
  tagged with their ledger ids so the grep is bidirectional; the tags are comment-only edits and
  change no behaviour.

## Sprint-status reconciliation

`specs/implementation-artifacts/sprint-status.yaml` is corrected in four ways, and in no others:

1. `5-2-reuse-canonical-compliance-and-provenance-completion`: `backlog` → `review`, the convention
   every delivered story in this repository uses at hand-off.
2. `2-2-multi-select-interaction-workflow`, `2-3-calendar-multi-select-variant` and
   `2-4-radio-group-input-workflow`: `in-progress` → `review`. All three are merged (PRs #109, #107
   and #112) and all three components are exported, storied and unit-tested. Story 5.1 already
   booked this correction as a hand-off at `board-coverage-checklist.md:285-287`.
3. The key `3-5-board-a-micro-components-delivery` is renamed to `3-5-board-a-micro-components` so
   it matches `specs/implementation-artifacts/3-5-board-a-micro-components.md` 1:1, like every other
   key. The key is renamed rather than the file because PR #123's body references the filename.
4. One line is added to the file's `WORKFLOW NOTES` header recording the key↔filename invariant, so
   the drift cannot silently return.

The invariant, stated for the drift guard: every `development_status` key that is not an `epic-*`
key, not a `*-retrospective` key and not still `backlog` has a matching
`specs/implementation-artifacts/<key>.md` on disk. The six `backlog` keys (`1-4-…`, `2-6-…`,
`3-6-…`, `4-4-…`, `5-3-…`, `5-4-…`) have no artifact yet by definition — `backlog` means "story
only exists in the epic file".

## Changed files

| File                                                                                         | Change   |
| -------------------------------------------------------------------------------------------- | -------- |
| `specs/planning-artifacts/component-provenance.md`                                           | modified |
| `specs/planning-artifacts/deviation-ledger.md`                                               | new      |
| `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md` | new      |
| `specs/implementation-artifacts/sprint-status.yaml`                                          | modified |
| `tests/unit/component-provenance-traceability.test.ts`                                       | new      |
| The 18 existing story artifacts in `specs/implementation-artifacts/`                         | modified |
| Deviation comments under `src/components/`                                                   | modified |

The 18 story-artifact edits are header/metadata repair only — a `PR` line per header, stale
`Status` lines corrected to `review`, the wrong-organisation issue URL at
`3-5-board-a-micro-components.md:3` repointed at `VilnaCRM-Org/ui-toolkit` (it previously 404ed),
and one dated correction note appended beneath 3-5's exceptions table. No delivered narrative is rewritten: these artifacts are
the historical record. The `src/components/` edits are comment text only — no runtime code, no
styling and no visual baseline is affected.

## Definition of Done (instantiated from `story-dod-template.md`)

### 1. Changed files

- [x] Every created/modified file is listed in the Changed files table above and is reviewable in
      the PR diff.

### 2. Provenance (Reuse-First Delivery Rule, PRD §3.2–3.4)

- [x] **Source** — not applicable as a component source: this story delivers no component code, so
      no module carries a new `crm` / `website` / `new` marking. What it does deliver is the
      completion and correction of every other module's marking, including the 13 pre-Epic-1
      modules that had none at all and the four Epic 1 rows whose `crm` label carried no remote, no
      commit and no upstream path.
- [x] **Reuse rationale** — no new module, so no canonical-source selection was made for this
      story. The registry's canonical-source policy (`crm` behaviour-canonical, `website` visual
      gap-fill) is applied to the seeded modules and to the Epic 1 re-audit, with the deciding
      evidence recorded per row.
- [x] **Reference IDs** — issue [#32](https://github.com/VilnaCRM-Org/ui-toolkit/issues/32); every
      registry row gains `story · issue #NN · PR #NNN`; the verified PR mapping is reproduced in the
      matrix's `Delivery state` column and cross-checked against `gh pr view` on 2026-08-06.
- [x] `component-provenance.md` updated — this is the story's primary deliverable: a coverage
      contract, the `Epic 0` section, an Epic 1 preamble and source re-audit, audit pins on the
      Epic 2/3 preambles, reference IDs, per-row `Deviations:` clauses, and correction of the stale
      `UiActionIconBar`, `UiMultiSelect`, `LANDING_SHADOW`, `accept-matcher` and
      `UiFileUploadInput` claims.

### 3. Tests run

- [x] Unit test added: `tests/unit/component-provenance-traceability.test.ts` locks the registry
      against export, path, token and reference-id drift, so registry-wide DoD compliance is
      machine-enforced rather than review-dependent — the durable half of AC-1 and AC-2.
- [ ] Integration/e2e coverage — **not applicable.** This story touches no composed runtime flow;
      the only source edits are comment text, so there is no behaviour to exercise end-to-end.
- [x] Local gate evidence: the unit suite (including Story 5.1's
      `tests/unit/board-coverage-traceability.test.ts`, which this story must not break) plus the
      formatter/lint chain, run on the host. Coverage, mutation and visual gate closure remain owned
      by the Epic 1-4 closure stories (issues #27-#30) and by Story 5.4.

### 4. Stories (Storybook) added/updated

- [x] Storybook — **not applicable.** No component, variant or state is delivered, so no story is
      added or changed and `tests/visual/stories.json` is untouched. Existing Storybook coverage for
      the delivered set is inventoried in the board checklist and re-cited by the §4 column of the
      matrix above.
- [x] Visual regression baseline — **not applicable.** No baseline is added, regenerated or
      invalidated; the `src/components/` edits are comment-only.

### 5. Export changes

- [x] Export changes — **not applicable; the `ui-card-item` export gap is owned by Story 5.3.** No
      public export is added, removed or renamed and `src/components/index.ts` is untouched. This
      story establishes the registry's coverage contract against that entry point (all 47 default
      exports plus the 9 named theme/breakpoint symbols must have exactly one row) and rules on
      which `UiCardItem` implementation is canonical (`DEV-42`), but the export decision itself
      stays with Story 5.3, as Story 5.1 recorded and as the hand-offs section above repeats.
- [x] No unintended export-surface change. `tests/unit/components-index.test.ts` is unmodified and
      still pins the surface.

### 6. Parity evidence

- [x] Figma parity — **not applicable as new visual work.** This story measures no node and repaints
      nothing. It does correct the parity **record**: the stale `UiFileUploadInput` node citations
      (`193:4763`, `269:7159`, `345:17479`, all off the "Ui kit" page) are replaced by the Board A
      five-state cluster the component's styling actually tracks, and the missing-node cases are
      ruled on explicitly in DOD-10 (Story 2.3) and DOD-03 (the parity layer).
- [x] Behaviour parity against `crm` — no copied behaviour in this story. The upstream evidence is
      re-derived rather than asserted: both pins already recorded by Epic 4
      (`crm` `0057d7845923b5f32fce7f276d384cdfcab5156c`, `website`
      `ca13841d91817c160ca42c27bd58af23b4c613f8`) are readable through `gh api`, and the Epic 1
      source labels are decided from a file-content comparison against them. The Board D animation
      contract stays locked by `tests/unit/skeleton-crm-parity.test.ts`, which this story cites but
      does not modify.
