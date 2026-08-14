# Story 1.4 — Epic 1 Quality Gate Closure

- **Issue:** [#27](https://github.com/VilnaCRM-Org/ui-toolkit/issues/27)
- **PR:** _assigned at hand-off_
- **Branch:** `feat/issue-27-quality-gate-closure`
- **Epic:** Epic 1 — Core Controls and Contract Foundation
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 1.4: Epic 1 Quality Gate Closure_
  (`epics.md:186`)

## Scope

Close the four gate obligations Story 1.4 places on Epic 1 — Storybook coverage review (AC-1),
unit-test validation (AC-2), end-to-end export/state/quality evidence (AC-3) and a traceable
Definition-of-Done record for Epic 5 governance (AC-4) — for the four delivered core controls:

| Module        | Public export | Story module           | Behaviour unit suites                                                         |
| ------------- | ------------- | ---------------------- | ----------------------------------------------------------------------------- |
| `ui-button`   | `UiButton`    | `button.stories.tsx`   | `tests/unit/ui-button.test.tsx`                                               |
| `ui-input`    | `UiInput`     | `input.stories.tsx`    | `tests/unit/ui-input.test.tsx`                                                |
| `ui-checkbox` | `UiCheckbox`  | `checkbox.stories.tsx` | `tests/unit/ui-check-box.test.tsx`, `tests/unit/ui-check-box-styles.test.tsx` |
| `ui-link`     | `UiLink`      | `link.stories.tsx`     | `tests/unit/ui-link.test.tsx`                                                 |

This is a closure story: it changes **no component source**. Its deliverables are the closure
guard (`tests/unit/epic-quality-gate-closure.test.ts`, shared with Stories 2.6 and 3.6), this
artifact, and the status/matrix bookkeeping the governance guards require. Gate sign-off for
Epics 2 and 3 belongs to Stories 2.6 ([#28](https://github.com/VilnaCRM-Org/ui-toolkit/issues/28))
and 3.6 ([#29](https://github.com/VilnaCRM-Org/ui-toolkit/issues/29)); skeleton parity closure to
Story 4.4 ([#30](https://github.com/VilnaCRM-Org/ui-toolkit/issues/30)); the consolidated
release-readiness report to Story 5.4
([#34](https://github.com/VilnaCRM-Org/ui-toolkit/issues/34)), which consumes this artifact
instead of re-deriving Epic 1's evidence.

## AC-1 — Storybook coverage

Every Epic 1 control ships a story module (table above), and its states are represented and
visually locked:

- Baselines registered in `tests/visual/stories.json`: `UiComponents/UiButton` ×3,
  `UiComponents/UiInput` ×1, `UiComponents/UiCheckbox` ×1, `UiComponents/UiLink` ×1, plus the
  Story 1.2 state baselines (`input hover`, `checkbox hover`, `link active`) recorded in
  `1-2-core-control-state-parity-completion.md`.
- Board-parity review surface: `specs/planning-artifacts/board-coverage-checklist.md` carries the
  per-state rows for all four controls (Boards A/B), with the Story 5.1 drift guard
  (`tests/unit/board-coverage-traceability.test.ts`) holding the checklist to the tree.

## AC-2 — Unit-test validation

Render and critical interaction behaviour are validated by the per-control suites in the table
above plus two epic-level suites:

- `tests/unit/ui-core-contract.test.tsx` — the Story 1.1 contract gate: shared API fields across
  all four controls, export completeness, and the MUI `SxProps<Theme>` contract (`prd.md` FR-07
  acceptance 3) type-asserted against every control's `sx` prop.
- `tests/unit/core-controls-accessibility.test.tsx` — the Story 1.3 accessibility gate: keyboard
  operation, focus order, disabled boundaries and error semantics across the four controls.

The full unit run for this branch is recorded under [Gate evidence](#gate-evidence); a failing
test blocks the epic by construction, since the suite is a required CI check.

## AC-3 — Export surface, state coverage, quality evidence

- **Export surface.** All four controls are value-exported and type-exported from
  `src/components/index.ts`; the surface is pinned three ways —
  `tests/unit/components-index.test.ts` (runtime keys),
  `tests/unit/export-contract-integrity.test.ts` (filesystem ↔ register agreement against
  `specs/planning-artifacts/export-contract.md`), and the closure guard added here.
- **State coverage.** The delivered state matrix per control is recorded in
  `1-2-core-control-state-parity-completion.md` and held by the board checklist rows; the one
  state-mapping exception (`UiInput` `active` → `&.Mui-focused`) is ratified as `DEV-19` in
  `specs/planning-artifacts/deviation-ledger.md`.
- **Quality evidence.** The gate table below. No unresolved blocker remains for Epics 2-5:
  every deferral in scope is a ledgered, tracked row — see
  [Documented deviations](#documented-deviations-in-scope).

## AC-4 — Traceable completion evidence

This artifact instantiates the shared Definition-of-Done checklist (below), and the machine-checked
closure surface is the guard:

`tests/unit/epic-quality-gate-closure.test.ts` pins, for every Epic 1 module: a Storybook story
module on disk, a behaviour-level unit suite naming the export (registry-style suites excluded by
ruling), the public barrel export, and at least one registered visual baseline. It also binds this
artifact itself — the file must exist, name every gated module, cite only repo paths that resolve,
and name the guard as its enforcement. The guard was verified failing-first: before the three
closure artifacts existed, its 12 artifact-bound assertions failed and its 88 component-surface
assertions passed; after them, 100/100 pass.

Epic 5 governance consumes this artifact via the Story 5.2 DoD compliance matrix row added in
`5-2-reuse-canonical-compliance-and-provenance-completion.md`.

## Documented deviations in scope

Closure does not silently waive anything; the open items Epic 1 carries are ledger rows in
`specs/planning-artifacts/deviation-ledger.md`, each with an owner and tracking ref:

- `DEV-03` (`deferred-tracked`) — focus-ring **visuals** and colour-contrast remediation are
  deferred repo-wide to one dedicated accessibility-visuals PR; behavioural focus order and
  keyboard operability shipped complete in Story 1.3.
- `DEV-19` (`ratified`) — `UiInput` `active` maps to the focused appearance; baselined as
  `input-focus.png`.
- `DEV-22` (`deferred-tracked`) — `UiCheckbox` visual required/error indicators deferred; the
  non-visual channels (native `required`, `aria-describedby`, `aria-invalid`) ship now.

## Gate evidence

Run on the host on this branch (the `bun` compose service is a baked image and would run stale
code), 2026-08-14:

| Gate                | Command                                                 | Result                                                          |
| ------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| Type check          | `npx tsc --noEmit -p tsconfig.json`                     | `TypeScript compilation completed`, exit 0                      |
| ESLint              | `eslint src tests`                                      | 0 errors (77 pre-existing warnings, none in files added here)   |
| Prettier            | `prettier --check` on every file this story touches     | clean                                                           |
| Full unit suite     | `npx jest`                                              | 91 suites, 3456 tests, all passed; 100% coverage thresholds met |
| Closure guard       | `npx jest tests/unit/epic-quality-gate-closure.test.ts` | 100/100 passed (12 artifact-bound assertions failing-first)     |
| Governance guards   | provenance/board/export suites within the full run      | green — matrix rows and status edits verified                   |
| Metrics / depcruise | not re-run                                              | no `src/` change in this diff; both gates re-verified in CI     |

Mutation, visual, e2e, memory-leak and Lighthouse gates are unaffected by this diff (no `src/`
or story change) and run as required checks on the PR.

## Definition of Done

_Instantiates `specs/implementation-artifacts/story-dod-template.md`._

### 1. Changed files

- [x] Listed in [Changed files](#changed-files) below and reviewable in the PR diff.

### 2. Provenance

- [x] Not applicable — no module delivered or materially changed; closure adds evidence, a guard
      and bookkeeping only, so `specs/planning-artifacts/component-provenance.md` gains no row.

### 3. Tests run

- [x] `tests/unit/epic-quality-gate-closure.test.ts` added (shared closure guard); full unit
      suite green — see [Gate evidence](#gate-evidence).
- [x] Type check green; lint 0 errors.
- [x] Container-only gates explicitly deferred to CI with the reason recorded (no `src/` change).

### 4. Stories (Storybook) added/updated

- [x] Not applicable — closure reviews and pins existing coverage; no story or baseline changes.
      `tests/visual/stories.json` is read by the guard, not modified.

### 5. Export changes

- [x] No export change; the Epic 1 surface is verified against the register and pinned by the
      closure guard.

### 6. Parity evidence

- [x] Not applicable — no design or source-parity mandate: no visual surface change. Board-parity
      state evidence is cited from `board-coverage-checklist.md`, not re-derived.

## Changed files

| File                                                                                         | Change                                                                                                                   |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `specs/implementation-artifacts/1-4-epic-1-quality-gate-closure.md`                          | Added — this artifact.                                                                                                   |
| `tests/unit/epic-quality-gate-closure.test.ts`                                               | Added — the shared Epic 1/2/3 closure guard (owned here, cited by Stories 2.6 and 3.6).                                  |
| `specs/implementation-artifacts/sprint-status.yaml`                                          | `1-4-epic-1-quality-gate-closure`: `backlog` → `review` (with the 2.6/3.6 keys, same change, same commit).               |
| `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md` | DoD compliance matrix: rows for Stories 1.4, 2.6 and 3.6 added; roll-up counts updated, as the Story 5.2 guard requires. |
