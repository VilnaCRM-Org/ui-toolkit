# Story 5.3 — Export Contract and Entry Point Integrity

- **Issue:** [#33](https://github.com/VilnaCRM-Org/ui-toolkit/issues/33)
- **PR:** [#127](https://github.com/VilnaCRM-Org/ui-toolkit/pull/127) (draft)
- **Branch:** `feat/issue-33-export-contract`
- **Epic:** Epic 5 — Production Adoption Readiness
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 5.3: Export Contract and Entry Point
  Integrity_ (`epics.md:705-726`)

## Scope

Close the three export-integrity obligations `epics.md:705-726` places on this story:

1. **AC-1 — export presence.** Every in-scope delivered component is available from
   `src/components/index.ts`, and a missing export is a blocking, machine-detected failure rather
   than a review finding. Today the barrel is checked by `tests/unit/components-index.test.ts`,
   which asserts a **hand-maintained list** against the barrel: it catches a barrel edit, but a new
   component module that is never added to either side passes silently. This story closes that hole
   by deriving the expectation from the filesystem.
2. **AC-2 — contract consistency.** An exported component whose prop type is not exported is not
   consumable: an application team cannot type a wrapper, a `props` variable, or a story fixture
   without reaching into `@vilnacrm/ui-toolkit/src/...`, which the package's `exports` map does not
   permit. 41 component modules own a `types.ts`; on the `main` this branch now sits on, every one
   except `ui-card-item` (internal) and `ui-footer` already exports its types from the barrel —
   Stories 5.1 and 5.2 landed most of that surface as they went. This story states the
   export-contract rule, closes the remainder (`ui-footer`'s two types, `UiToolbar`'s previously
   inline props, and `UiTextFieldForm`'s R2 name), applies the rule to the whole delivered set, and
   records every deliberate exception with a traceable reason.
3. **AC-3 — release-review evidence.** The evidence surface is
   `specs/planning-artifacts/export-contract.md`: one row per module under `src/components/`, its
   public value export, its public type exports, and — for a non-exported module — the exception
   reason and its tracking ref. Story 5.4 consumes that register instead of re-deriving the export
   surface.

Boundaries held deliberately:

- **Story 5.1** owns `board-coverage-checklist.md` and its drift guard; this story cites it and
  never edits it.
- **Story 5.2** owns `component-provenance.md` and `deviation-ledger.md`. This story writes to the
  ledger in exactly one place — the `DEV-42` row, whose `Justification` deferred the export
  decision to Story 5.3 ("the **export** decision is Story 5.3's, not this ledger's") — and changes
  nothing else, so
  `tests/unit/component-provenance-traceability.test.ts` stays the ledger's guard.
- **Story 5.4** owns the consolidated release-readiness report.
- The Epic 1-4 quality-gate closure stories ([#27](https://github.com/VilnaCRM-Org/ui-toolkit/issues/27),
  [#28](https://github.com/VilnaCRM-Org/ui-toolkit/issues/28),
  [#29](https://github.com/VilnaCRM-Org/ui-toolkit/issues/29),
  [#30](https://github.com/VilnaCRM-Org/ui-toolkit/issues/30)) own gate sign-off.
- **No component behaviour changes.** Every source edit in this story is an export-surface edit:
  adding `export` to an existing type, naming a props type that was previously inline, or adding a
  barrel re-export. No rendered output, no prop default, no DOM, no style.

## The export contract

Stated once here, and instantiated per module in
`specs/planning-artifacts/export-contract.md`:

- **R1 — value export.** Every directory under `src/components/` that owns a component entry point
  (`index.tsx`) is re-exported by name from `src/components/index.ts`, unless it is listed as a
  documented exception in the register.
- **R2 — props type export.** Every publicly exported component publicly exports its props type
  under the `Ui<Name>Props` name the component uses.
- **R3 — reachable types.** Every type a consumer must be able to **name** in order to satisfy
  R2 — an option/item shape, a union a prop accepts, a callback signature — is publicly exported
  too. A type that only appears in an internal child's signature (`CardContentProps`,
  `SkeletonTabsProps`, `SkeletonTableColumnSlot`, `SkeletonTextLine`, `ImageList`) is **not**
  public, and the register says so.
- **R4 — exceptions are traceable.** A module that is deliberately not exported carries a reason
  and a tracking ref in the register. "Not exported" and "forgotten" must not be distinguishable
  only by reading git history.
- **R5 — enforcement.** R1-R4 are enforced by `tests/unit/export-contract-integrity.test.ts`, which
  reads the filesystem and the register rather than a hand-maintained list, so a new component that
  is neither exported nor excepted fails CI.

## Rulings

### `ui-card-item` — internal, not a public deliverable (closes `DEV-42`)

Story 5.1 recorded `src/components/ui-card-item` as an export-surface inconsistency ("ships
stories, unit tests and committed visual baselines but is not exported"), and Story 5.2 ruled the
standalone module canonical over `src/components/ui-card-list/ui-card-item.tsx`, deferring the
export decision here. The evidence this story collected does not support exporting it, and
partially contradicts the "two near-identical implementations" premise:

- **No runtime consumer.** `card-grid.tsx:6` and `card-swiper.tsx:8` — the only two call sites in
  the repository — both import `./ui-card-item`, the in-list copy. `src/components/ui-card-item/index.tsx`
  is imported by nothing outside its own unit test.
- **The two are not interchangeable.** `src/components/ui-card-item/card-content.tsx` hardcodes the
  marketing site's "Integrate **services**" tooltip — a fixed `<Trans>` tree plus
  `ServicesHoverCard` — while `src/components/ui-card-list/card-content.tsx` is generic, driven by
  `item.tooltipTitle` / `item.tooltipLabel` and accepting `ReactNode` title/text. The standalone
  module renders one specific piece of website copy; the in-list one renders any card.
- **Its stories and baselines are not its own.** `src/components/ui-card-item/card-item.stories.tsx`
  renders `UiCardList`, not the standalone component, and the two baselines registered under
  `UiComponents/UiCardItem` in `tests/visual/stories.json` are therefore `UiCardList` screenshots.
  The "ships stories and baselines" part of the 5.1 hand-off describes a mislabelled story file.

**Ruling:** `src/components/ui-card-item` is **not** exported. It is a website-parity module whose
public-facing surface is `UiCardList`; exporting it would publish hardcoded site copy under a
generic name and add a second `UiCardItem` contract to the package. It is recorded in the register
as an R4 exception, and `DEV-42` is updated from `deferred-tracked` to a decided state with this
evidence. Removing the module, de-duplicating the two implementations, and renaming the mislabelled
story file are **not** done here — they are behaviour-affecting changes to a component with
committed visual baselines, and are handed off below.

### `ComposedSkeleton` — internal by design

`src/components/ui-skeletons/composed.tsx` is the shared a11y shell consumed by the eleven skeleton
primitives. Story 5.1 and Story 5.2 both flagged that this story's sweep must not read it as a
missing export; the register records it as an R4 exception, and the drift guard's exception list
carries the same reason, so the ruling survives without depending on either prior artifact.

## Tasks

- [x] **T1 — Register.** Author `specs/planning-artifacts/export-contract.md`: the R1-R5 rules,
      one row per directory under `src/components/`, and the exception table with reasons and
      tracking refs.
- [x] **T2 — Barrel type surface (R2/R3).** Publish the props type and its reachable types for
      every exported component. Stories 5.1/5.2 landed most of this surface as they went; the
      remainder is `ui-footer`, whose `UiFooterProps`/`UiFooterSocialLink` are exported by the
      module but were not re-exported by the barrel; `UiToolbar`, which declared its props inline —
      the type is now named `UiToolbarProps` in the module and re-exported; and
      `UiTextFieldForm`, which published its props only as `CustomTextField<T>` — R2's
      `UiTextFieldFormProps<T>` is now exported as an **alias** of it, so the delivered name keeps
      working and the module needs no R2 exception (PR #127 review). No other source change.
- [x] **T3 — `ui-card-item` ruling.** Apply the ruling above: register row, and the `DEV-42`
      correction in `specs/planning-artifacts/deviation-ledger.md`. Re-run
      `tests/unit/component-provenance-traceability.test.ts` to confirm the ledger guard still
      passes.
- [x] **T4 — Entry-point integrity.** Verify the package entry chain end to end: `src/index.ts` →
      `src/components/index.ts`; `package.json` `main` / `module` / `types` / `exports` resolve to
      artifacts `make build` and `make generate-ts-doc` actually emit; the rolled-up
      `build/index.d.ts` contains the type surface T2 adds. Record the evidence.
- [x] **T5 — Drift guard.** Add `tests/unit/export-contract-integrity.test.ts` enforcing R1-R4 from
      the filesystem and the register, and bind the new type exports so a dropped `export type`
      fails the type-check rather than passing silently.
- [x] **T6 — Gates.** Full local gate: `make lint` — which chains `lint-next`, `lint-tsc`,
      `lint-md`, `format-check`, `lint-dep-ranges`, `lint-test-structure`, `lint-deps`
      (dependency-cruiser), `lint-metrics` and `lint-ci-paths` — plus `make test-unit` with
      coverage and `make test-integration`. Update
      `specs/implementation-artifacts/sprint-status.yaml` (`5-3-...`: `backlog` → `review`).

## Hand-offs recorded, owned elsewhere

- **De-duplicating `UiCardItem`.** The standalone module and the in-list copy remain two
  implementations. This story rules only on the **export** surface, as `DEV-42` scoped it. Removing
  `src/components/ui-card-item/{index,card-content,styles}.tsx` (its `types.ts` and `constants.ts`
  are consumed by `ui-card-list` and by the story file, so they cannot follow) touches a module with
  committed visual baselines and belongs in a follow-up. Unfiled — `unfiled:component-lead`.
- **`card-item.stories.tsx` is mislabelled.** It renders `UiCardList` under the title
  `UiComponents/UiCardItem`, and `tests/visual/stories.json` registers two baselines under that
  title. Renaming the story regenerates baselines in the pinned Playwright image, so it is a visual
  change, not an export change. Unfiled — `unfiled:component-lead`.
- **Story 5.4** consumes `specs/planning-artifacts/export-contract.md` for the export-integrity
  section of the readiness report instead of re-deriving the barrel surface.

## Definition of Done

_Instantiates `specs/implementation-artifacts/story-dod-template.md`._

### 1. Changed files

- [x] Listed in [Changed files](#changed-files) below and reviewable in the PR diff.

### 2. Provenance

- [x] No new or materially changed component: this story adds no module, so
      `component-provenance.md` needs no new row. The one provenance-surface edit is the `DEV-42`
      correction in the ledger, made under Story 5.2's stated hand-off.

### 3. Tests run

- [x] `tests/unit/export-contract-integrity.test.ts` added; full unit suite green.
- [x] Type-check green — the type-only exports are bound in the guard, so a dropped export is a
      compile error.
- [x] Local gate evidence captured in [Gate evidence](#gate-evidence).

### 4. Stories (Storybook) added/updated

- [x] Not applicable — no rendered output changes, so no story and no baseline changes.
      `tests/visual/stories.json` is read (T3 evidence) and not modified.

### 5. Export changes

- [x] Public **type** exports completed across the delivered set per R2/R3 — `UiFooterProps`,
      `UiFooterSocialLink`, `UiToolbarProps` and `UiTextFieldFormProps` are the remainder after
      Stories 5.1/5.2 landed the rest of the surface; every published name is listed in the
      register. Only `ui-breakpoints` and `ui-color-theme` remain R2-exempt, and neither owns an
      `index.tsx` to have props at all. **No value export is added, removed or renamed**, so the runtime key sweep in
      `tests/unit/components-index.test.ts` is unchanged and keeps passing as an independent check.
- [x] No unintended export-surface change: the R4 exceptions (`ui-card-item`,
      `ui-skeletons`/`ComposedSkeleton`) plus the internal-only modules (`app-theme`,
      `field-controls`, `ghost-overlay`, `radio-card-controls`, `theme-scope`) are documented in
      the register with reasons.

### 6. Parity evidence

- [x] Not applicable — no design or source-parity mandate: no visual surface changes.

## Changed files

| File                                                                                         | Change                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `specs/implementation-artifacts/5-3-export-contract-and-entry-point-integrity.md`            | Added — this artifact.                                                                                                                                                                                                                                        |
| `specs/planning-artifacts/export-contract.md`                                                | Added — the export contract register (55 module rows, exceptions, type-export exclusions, entry-point chain).                                                                                                                                                 |
| `specs/planning-artifacts/deviation-ledger.md`                                               | `DEV-42` decided (`deferred-tracked` → `pending-ratification`) with the evidence below; roll-up counts and ratification register kept consistent.                                                                                                             |
| `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md` | DoD compliance matrix: Story 5.3 row added, roll-up updated, as Story 5.2's guard requires.                                                                                                                                                                   |
| `specs/implementation-artifacts/sprint-status.yaml`                                          | `5-3-export-contract-and-entry-point-integrity`: `backlog` → `review`.                                                                                                                                                                                        |
| `src/components/index.ts`                                                                    | 4 type names published (R2/R3): `UiFooterProps` and `UiFooterSocialLink` on a new `export type` line, `UiToolbarProps` on a second, and `UiTextFieldFormProps` appended to the existing `ui-text-field-form` line. No value export added, removed or renamed. |
| `src/components/ui-card-list/types.ts`                                                       | Comment recording why `StaticImageSrc` is re-exported (`UiCardItemData.imageSrc` names it, and api-extractor flags a public type that names a non-exported one). The re-export itself already existed — no export-surface change.                             |
| `src/components/ui-text-field-form/types.ts`                                                 | `UiTextFieldFormProps<T>` added as an alias of the delivered `CustomTextField<T>`, so R2's conventional name exists without renaming the contract consumers already use (PR #127 review).                                                                     |
| `src/components/ui-toolbar/index.tsx`                                                        | Inline `{ children }` props replaced by the exported `UiToolbarProps` interface; identical signature and render.                                                                                                                                              |
| `tests/unit/export-contract-integrity.test.ts`                                               | Added — the R1-R5 drift guard, 21 assertions in five groups.                                                                                                                                                                                                  |
| `jest.mutation.config.ts`                                                                    | The new guard joins the barrel-importing structural guards excluded from the mutation tier — it asserts on names and files and can kill no mutant, so excluding it can only lower the score, never inflate it.                                                |
| `tests/unit/mutation-runner-scope.test.ts`                                                   | `STRUCTURAL_GUARD_FILES` extended in lockstep, with the justification recorded inline; the guard's no-other-barrel-importer rule stays fail-closed.                                                                                                           |

## Gate evidence

Measured on the rebased branch at `13e6af5`; the jest, ESLint and dependency-cruiser figures are read back from that head's CI runs (`unit testing`, `static testing`, `dependency-cruiser`) rather than a host run, 2026-09-07. Host-side gates (the `bun` compose service is a baked image and would run stale code) are
marked as such; `node ./build.config.mjs` and `make package` were run in the real `bun` container.

| Gate                           | Command                                                             | Result                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Type check                     | `npx tsc --noEmit -p tsconfig.json`                                 | `TypeScript compilation completed`, exit 0                                                                                           |
| ESLint                         | `npx eslint src tests`                                              | 0 errors (89 pre-existing warnings, none in changed files)                                                                           |
| Prettier                       | `npx prettier . --check`                                            | All changed files formatted; remaining warnings are untracked `.claude/` and gitignored `.ralph/` paths                              |
| Markdown                       | `npx markdownlint "**/*.md"`                                        | `specs/` is markdownlint-ignored (`.markdownlintignore`); no new finding                                                             |
| Dependency boundaries          | `depcruise --config .dependency-cruiser.js src` (node:24 container) | **0 errors**, 760 pre-existing warnings, 459 modules and 1601 dependencies cruised                                                   |
| Complexity metrics             | `docker compose run --rm rca make lint-metrics-run`                 | `rust-code-analysis: all hard checks pass`                                                                                           |
| Export guard                   | `npx jest tests/unit/export-contract-integrity.test.ts`             | 21/21 passed                                                                                                                         |
| Barrel runtime surface         | `npx jest tests/unit/components-index.test.ts`                      | 5/5 passed, unchanged — proves no value export moved                                                                                 |
| Ledger guard                   | `npx jest tests/unit/component-provenance-traceability.test.ts`     | 1053/1053 passed after the `DEV-42` edit and the matrix row                                                                          |
| Full unit suite + coverage     | `npx jest`                                                          | **103 suites, 3817 tests, all passed**; 100% statements/branches/functions/lines                                                     |
| Package build + `.d.ts` rollup | `node ./build.config.mjs` (esbuild + api-extractor)                 | exit 0 in the `bun` container, **zero `ae-forgotten-export` warnings**; `make package` verifies `dist/vilnacrm-ui-toolkit-0.3.0.tgz` |

### Guard negative-test evidence

The drift guard was verified to bite, not merely to pass: deleting the `ui-link` row from
`specs/planning-artifacts/export-contract.md` turns 21/21 green into `4 failed, 17 passed` — A1
(one row per module directory), C1 (barrel runtime surface), D2 (records every type the barrel
re-exports, reporting `UiLinkProps`) and D7 (bound type surface, 76 against the pinned 77) all fire.
The row was restored and the suite re-verified at 21/21.

### Entry-point integrity (T4)

The chain resolves end to end. The defect this story surfaced was landed ahead of it, on `main`:

1. `src/index.ts` → `export * from './components'` → `src/components/index.ts`.
2. `node ./build.config.mjs` emits `build/index.mjs`, `build/index.css` and the fonts, then rolls
   up `build/index.d.ts` through api-extractor from `temp/dts/components/index.d.ts`.
3. `package.json` `main` / `module` → `./build/index.mjs`, `types` → `./build/index.d.ts`, the
   `exports` map publishes `.`, `./styles.css`, `./package.json` and the per-component `./*`, and
   `files` ships only `build`. All four are asserted by the guard's group E, so a manifest edit that
   breaks the entry chain fails the suite.
4. **Defect surfaced:** the rollup emitted two `ae-forgotten-export` warnings —
   `NeutralActionIconName` and `StaticImageSrc` were named by public types (`ActionIconName`,
   `UiCardItemData.imageSrc`) but not published by the entry point, so a consumer could use those
   props yet never name their operand types. Both were exported through their owning modules before
   this branch was replayed onto `main`; what this story adds is the rule that keeps them exported
   and the guard that binds them. The rollup is warning-free and `build/index.d.ts` publishes all 77
   registered type names.
