# Story 2.6 — Epic 2 Quality Gate Closure

- **Issue:** [#28](https://github.com/VilnaCRM-Org/ui-toolkit/issues/28)
- **PR:** [#132](https://github.com/VilnaCRM-Org/ui-toolkit/pull/132)
- **Branch:** `feat/issue-27-quality-gate-closure`
- **Epic:** Epic 2 — Selection, Search, and Input Workflows
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 2.6: Epic 2 Quality Gate Closure_
  (`epics.md:361`)

## Scope

Close the five gate obligations Story 2.6 places on Epic 2 — Storybook/unit coverage (AC-1),
export and contract consistency (AC-2), the Story 1.3 accessibility baseline plus NFR3 (AC-3),
no unresolved downstream blockers (AC-4) and traceable FR7/FR8 completion evidence (AC-5) — for
the seven delivered components named by the acceptance criteria:

| Module                     | Public export           | Story module                        | Baselines in `tests/visual/stories.json` |
| -------------------------- | ----------------------- | ----------------------------------- | ---------------------------------------- |
| `ui-search-input`          | `UiSearchInput`         | `search-input.stories.tsx`          | 1                                        |
| `ui-select-with-search`    | `UiSelectWithSearch`    | `select-with-search.stories.tsx`    | 1                                        |
| `ui-multi-select`          | `UiMultiSelect`         | `multi-select.stories.tsx`          | 1                                        |
| `ui-calendar-multi-select` | `UiCalendarMultiSelect` | `calendar-multi-select.stories.tsx` | 1                                        |
| `ui-radio-group`           | `UiRadioGroup`          | `radio-group.stories.tsx`           | 1                                        |
| `ui-file-upload-input`     | `UiFileUploadInput`     | `file-upload-input.stories.tsx`     | 2                                        |
| `ui-pagination`            | `UiPagination`          | `pagination.stories.tsx`            | 5                                        |

Beyond the registered baselines, forced interaction states are visually locked by
`tests/visual/states.spec.ts` against the Figma-parity showcase story. This is a closure story:
it changes **no component source**. Its enforcement surface is the shared closure guard owned by
Story 1.4 (`tests/unit/epic-quality-gate-closure.test.ts` — see
`1-4-epic-1-quality-gate-closure.md` for the guard's contract and failing-first evidence).

## AC-1 — Storybook and unit coverage

Story coverage per the table above. Unit-test validation for render and core interactions:

| Module                     | Behaviour unit suites                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui-search-input`          | `tests/unit/ui-search-input.test.tsx`, `tests/unit/ui-search-input-ghost-text.test.tsx`                                                                 |
| `ui-select-with-search`    | `tests/unit/ui-select-with-search.test.tsx`, `tests/unit/ui-select-with-search-ghost.test.tsx`                                                          |
| `ui-multi-select`          | `tests/unit/ui-multi-select.test.tsx`, `tests/unit/ui-multi-select-ghost.test.tsx`, `tests/unit/multi-select-announce.test.ts`                          |
| `ui-calendar-multi-select` | `tests/unit/ui-calendar-multi-select.test.tsx`, `tests/unit/calendar-multi-select-logic.test.ts`, `tests/unit/calendar-multi-select-date-utils.test.ts` |
| `ui-radio-group`           | `tests/unit/ui-radio-group.test.tsx`                                                                                                                    |
| `ui-file-upload-input`     | `tests/unit/ui-file-upload-input.test.tsx`                                                                                                              |
| `ui-pagination`            | `tests/unit/ui-pagination.test.tsx`, `tests/unit/pagination-page-range.test.ts`                                                                         |

The shared `field-controls` internals these components compose are covered by the six
`field-controls` suites under `tests/unit/` (render input, field option, glyph, and the three
ghost-overlay suites). The full run for this branch is recorded under
[Gate evidence](#gate-evidence).

## AC-2 — Export and contract consistency

- All seven components are value- and type-exported from `src/components/index.ts`; the surface
  is pinned by `tests/unit/components-index.test.ts`,
  `tests/unit/export-contract-integrity.test.ts` (against
  `specs/planning-artifacts/export-contract.md`) and the closure guard.
- Shared contract fields (`value`, `onChange`, `disabled`, `error`, `size`, `variant`, `sx`) are
  applied per component, and every departure is a **documented exception** at the type surface,
  as `prd.md` FR-07 acceptance 2 requires: `UiCalendarMultiSelect` records `variant` as N/A
  (`src/components/ui-calendar-multi-select/types.ts`), and `UiPagination` records its exceptions
  (no free-text value, no error state) in `src/components/ui-pagination/types.ts`. Both sites are
  ruled allowed-untagged in `tests/unit/component-provenance-traceability.test.ts`.

## AC-3 — Accessibility baseline (Story 1.3, NFR3)

Keyboard navigation, focus order, keyboard operability and disabled/error boundaries are
validated per component by the unit suites above — `Tab`/`Shift+Tab` traversal and arrow-key /
`Enter` / `Escape` operation for the composite widgets (`ui-select-with-search`,
`ui-multi-select`, `ui-calendar-multi-select` with its APG grid, `ui-radio-group`,
`ui-pagination` with its `aria-disabled` boundary pattern), and both entry paths for
`ui-file-upload-input`. Visible-focus evidence and its boundaries are ledgered, not implied:

- `DEV-25` (`ratified`) — the shared `field-controls` theme deliberately **strengthens** the
  keyboard focus boundary over the Figma caret-only accent
  (`src/components/field-controls/theme.ts`).
- `DEV-03` (`deferred-tracked`) — repo-wide focus-ring visual parity and contrast remediation is
  routed to one dedicated accessibility-visuals PR; behavioural accessibility shipped complete.
- The calendar honours the WCAG 2.5.8 target-size floor
  (`src/components/ui-calendar-multi-select/style-tokens.ts`).

Accessibility failures block this epic by construction: the suites above are part of the required
unit check.

## AC-4 / AC-5 — Downstream enablement and FR7/FR8 evidence

No unresolved blocking issue remains for Epics 3-5: Epic 2's open items are ledger rows with
owners and tracking refs in `specs/planning-artifacts/deviation-ledger.md` (`DEV-03` scope as
above; the Epic 2 rows are enumerated in the ledger's own roll-up). FR8 evidence per acceptance
item: stories (AC-1 table), unit tests (AC-1 table), strict type check
([Gate evidence](#gate-evidence)), exports (AC-2). FR7 evidence: contract fields plus the two
documented type-surface exceptions (AC-2). All of it is machine-held by the closure guard, and
Story 5.4 consumes this artifact via the Story 5.2 DoD compliance matrix row.

## Gate evidence

Shared with the closure branch — one diff, one gate run, recorded once in
`1-4-epic-1-quality-gate-closure.md` § Gate evidence and valid for this artifact verbatim:
type check exit 0, ESLint 0 errors, full unit suite 91 suites / 3456 tests green with 100%
coverage thresholds met, closure guard 100/100 after failing-first, container-only gates
deferred to CI because the diff contains no `src/` change.

## Definition of Done

_Instantiates `specs/implementation-artifacts/story-dod-template.md`._

### 1. Changed files

- [x] Listed in [Changed files](#changed-files) below and reviewable in the PR diff.

### 2. Provenance

- [x] Not applicable — no module delivered or materially changed;
      `specs/planning-artifacts/component-provenance.md` gains no row. Per-component provenance
      was recorded by the delivery stories (registry §Epic 2).

### 3. Tests run

- [x] Closure guard green for the Epic 2 set; full unit suite green — see
      [Gate evidence](#gate-evidence).
- [x] Type check green; lint 0 errors.
- [x] Container-only gates explicitly deferred to CI with the reason recorded.

### 4. Stories (Storybook) added/updated

- [x] Not applicable — closure reviews and pins existing coverage; no story or baseline change.

### 5. Export changes

- [x] No export change; the Epic 2 surface is verified against the register and pinned by the
      closure guard.

### 6. Parity evidence

- [x] Not applicable — no design or source-parity mandate: no visual surface change. Figma-parity
      evidence lives in the delivery-story artifacts and `board-coverage-checklist.md`.

## Changed files

| File                                                                | Change                 |
| ------------------------------------------------------------------- | ---------------------- |
| `specs/implementation-artifacts/2-6-epic-2-quality-gate-closure.md` | Added — this artifact. |

The shared closure-branch changes (guard test, `sprint-status.yaml` keys, Story 5.2 matrix rows)
are owned and listed by `1-4-epic-1-quality-gate-closure.md`.
