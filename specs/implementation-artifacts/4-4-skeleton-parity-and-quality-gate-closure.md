# Story 4.4 — Skeleton Parity and Quality Gate Closure

- **Issue:** [#30](https://github.com/VilnaCRM-Org/ui-toolkit/issues/30)
- **PR:** [#178](https://github.com/VilnaCRM-Org/ui-toolkit/pull/178) (issue [#34](https://github.com/VilnaCRM-Org/ui-toolkit/issues/34))
- **Epic:** Epic 4 — Skeleton Loading Experience Parity
- **Status:** done
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 4.4: Skeleton Parity and Quality
  Gate Closure_ (`epics.md:620`)

## Scope

Close the obligations Story 4.4 places on Epic 4 — CRM skeleton-animation parity (AC-1),
Storybook and unit coverage (AC-2), provenance and export integrity (AC-3), consolidation-ready
links for Epic 5 (AC-4) and the Definition of Done artifact (AC-5) — for the twelve skeleton
modules the export register marks `exported`. All twelve were delivered by PR
[#124](https://github.com/VilnaCRM-Org/ui-toolkit/pull/124), merged into `main` on 2026-09-02,
under issues [#24](https://github.com/VilnaCRM-Org/ui-toolkit/issues/24) (Story 4.1),
[#25](https://github.com/VilnaCRM-Org/ui-toolkit/issues/25) (Story 4.2) and
[#26](https://github.com/VilnaCRM-Org/ui-toolkit/issues/26) (Story 4.3):

| Module                     | Public export           | Story module                        | Baselines | Behaviour unit suites                          |
| -------------------------- | ----------------------- | ----------------------------------- | --------- | ---------------------------------------------- |
| `auth-skeleton`            | `AuthSkeleton`          | `auth-skeleton.stories.tsx`         | 3         | `tests/unit/auth-skeleton.test.tsx`            |
| `ui-skeleton-block`        | `UiSkeletonBlock`       | `skeleton-block.stories.tsx`        | 3         | `tests/unit/ui-skeleton-block.test.tsx`        |
| `ui-skeleton-button`       | `UiSkeletonButton`      | `skeleton-button.stories.tsx`       | 1         | `tests/unit/ui-skeleton-button.test.tsx`       |
| `ui-skeleton-control-text` | `UiSkeletonControlText` | `skeleton-control-text.stories.tsx` | 2         | `tests/unit/ui-skeleton-control-text.test.tsx` |
| `ui-skeleton-image`        | `UiSkeletonImage`       | `skeleton-image.stories.tsx`        | 3         | `tests/unit/ui-skeleton-image.test.tsx`        |
| `ui-skeleton-input`        | `UiSkeletonInput`       | `skeleton-input.stories.tsx`        | 2         | `tests/unit/ui-skeleton-input.test.tsx`        |
| `ui-skeleton-list`         | `UiSkeletonList`        | `skeleton-list.stories.tsx`         | 2         | `tests/unit/ui-skeleton-list.test.tsx`         |
| `ui-skeleton-menu`         | `UiSkeletonMenu`        | `skeleton-menu.stories.tsx`         | 1         | `tests/unit/ui-skeleton-menu.test.tsx`         |
| `ui-skeleton-tab-bar`      | `UiSkeletonTabBar`      | `skeleton-tab-bar.stories.tsx`      | 2         | `tests/unit/ui-skeleton-tab-bar.test.tsx`      |
| `ui-skeleton-table`        | `UiSkeletonTable`       | `skeleton-table.stories.tsx`        | 3         | `tests/unit/ui-skeleton-table.test.tsx`        |
| `ui-skeleton-text`         | `UiSkeletonText`        | `skeleton-text.stories.tsx`         | 4         | `tests/unit/ui-skeleton-text.test.tsx`         |
| `ui-skeleton-widget`       | `UiSkeletonWidget`      | `skeleton-widget.stories.tsx`       | 5         | `tests/unit/ui-skeleton-widget.test.tsx`       |

Baseline counts are the `UiComponents/<Export>` entries in `tests/visual/stories.json`. The
internal `ui-skeletons` barrel (the shimmer system and the `ComposedSkeleton` accessibility shell)
is `internal` in the register and stays out of this table by design; its own suites are
`tests/unit/ui-skeletons-composed.test.tsx`, `tests/unit/ui-skeletons-counts.test.ts` and
`tests/unit/ui-skeleton-key-prefixes.test.tsx`.

This is a closure story: it changes **no component source**. Its enforcement surface is the
shared closure guard owned by Story 1.4 (`tests/unit/epic-quality-gate-closure.test.ts`), which
gains an `Epic 4` entry for all twelve modules. The guard accepts only a behaviour suite whose
filename is keyed to the module, and the five primitives (`UiSkeletonBlock`, `UiSkeletonButton`,
`UiSkeletonImage`, `UiSkeletonInput`, `UiSkeletonText`) were tested in one shared suite, so their
tests were moved, unchanged, into dedicated per-module suites. `tests/unit/ui-skeletons.test.tsx`
keeps the checks that span every primitive: decorative semantics, the base tokens, default-prop
styling, reduced motion and forced colours.

## AC-1 — CRM skeleton-animation parity

The baseline is identified and locked by Story 4.1
(`specs/implementation-artifacts/4-1-crm-skeleton-baseline-and-provenance-lock.md`): source
`crm@0057d78…`, the CRM repository's base skeleton styles module.
`tests/unit/skeleton-crm-parity.test.ts` pins the exact shimmer gradient, `backgroundSize`, the
shimmer keyframes identity, the `1.5s ease-in-out infinite alternate` timing, the reduced-motion
guard, both keyframe stop sets and the four shared constants, so any drift from the CRM contract
fails CI. Stories 4.2 and 4.3 reuse `baseSkeletonStyle` and the shared primitives unchanged; no
delivered module defines its own animation.

Parity deviations touching skeletons are ledgered in
`specs/planning-artifacts/deviation-ledger.md`, and none of them is against the animation
contract:

- `DEV-10` (`reuse-deviation`, `ratified`) — Board D "Button" and "Input" are served by the CRM
  baseline skeletons rather than new components.
- `DEV-11` (`visual-parity`, `ratified`) — `UiSkeletonControlText` keeps the shared shimmer where
  the board paints a flat fill, because PRD §3.4 forbids an animation redesign.
- `DEV-14` (`a11y-conformance`, `ratified`) — composed skeletons stay decorative, with no table or
  tab roles.
- `DEV-17` / `DEV-18` (`visual-parity`, `deferred-tracked`) — the `UiSkeletonWidget` wide
  block/chart silhouettes and the dual-avatar card anatomy: geometry gaps with owners, not
  animation drift.

No unratified animation deviation exists, so the blocking condition of AC-1 is not triggered.

## AC-2 — Storybook and unit coverage

Every module in the Scope table ships a story module and at least one registered visual baseline
(31 in total), and every module is exercised by a behaviour-level unit suite listed in the same
table. The closure guard holds all twelve modules to those surfaces.

## AC-3 — Provenance and export integrity

Provenance: every module has a row in `specs/planning-artifacts/component-provenance.md` §Epic 4:
the Story 4.1 rows for `UiSkeletonText`, `UiSkeletonButton`, `UiSkeletonInput`, `UiSkeletonBlock`
and `AuthSkeleton` (`component-provenance.md:508-512`, source `crm`), the Story 4.2
`UiSkeletonImage` row (`component-provenance.md:545`) and the Story 4.3 rows
(`component-provenance.md:548-553`). The registry is pinned by
`tests/unit/component-provenance-traceability.test.ts`.

Exports: `specs/planning-artifacts/export-contract.md` marks `auth-skeleton` and the eleven
`ui-skeleton-*` modules `exported` (`export-contract.md:72` and `export-contract.md:114-124`) and
`ui-skeletons` `internal` with a written exception. The surface is pinned by
`tests/unit/export-contract-integrity.test.ts`. FR5/FR6/FR8 exit with no unresolved blocker: the
two open items are `deferred-tracked` ledger rows with owners.

## AC-4 — Downstream traceability for Epic 5

Links ready for Story 5.4 consolidation:

- Delivery artifacts:
  `specs/implementation-artifacts/4-1-crm-skeleton-baseline-and-provenance-lock.md`,
  `specs/implementation-artifacts/4-2-skeleton-primitive-variants.md` and
  `specs/implementation-artifacts/4-3-composed-skeleton-layout-variants.md`, plus this artifact.
- Source: the CRM baseline cited under AC-1; Board D geometry from Figma frame `538:38316`.
- Board coverage: the Board D rows of `specs/planning-artifacts/board-coverage-checklist.md`.
- DoD compliance: the Story 4.4 row of the matrix in
  `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md`.

## Definition of Done

_Instantiates `specs/implementation-artifacts/story-dod-template.md`._

### 1. Changed files

- [x] Listed in [Changed files](#changed-files) below and reviewable in the PR diff.

### 2. Provenance

- [x] Not applicable — no module delivered or materially changed;
      `specs/planning-artifacts/component-provenance.md` gains no row. Per-component provenance
      was recorded by Stories 4.1-4.3 (registry §Epic 4).

### 3. Tests run

- [x] Closure guard extended with the `Epic 4` entry; its assertions were replicated on the host
      against the tree before commit.
- [x] The five primitives' tests moved out of the shared suite into dedicated suites; the test
      count is unchanged (61 before and after).
- [x] Type check, lint and Prettier green on the changed files.
- [x] Jest and the container-only gates deferred to CI; the Story 4.4 changes touch no `src/` file.

### 4. Stories (Storybook) added/updated

- [x] Not applicable — closure reviews and pins existing coverage; no story or baseline change.

### 5. Export changes

- [x] No export change; the Epic 4 surface is verified against the register.

### 6. Parity evidence

- [x] Behaviour parity against `crm` is held by `tests/unit/skeleton-crm-parity.test.ts`; Figma
      parity evidence lives in the Story 4.2 and 4.3 artifacts and the ledger rows above.

## Changed files

| File                                                                                         | Change                                                 |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `specs/implementation-artifacts/4-4-skeleton-parity-and-quality-gate-closure.md`             | Added — this artifact.                                 |
| `tests/unit/epic-quality-gate-closure.test.ts`                                               | `Epic 4` entry added to the closure guard.             |
| `tests/unit/ui-skeletons.test.tsx`                                                           | Per-primitive tests moved to dedicated suites.         |
| `tests/unit/ui-skeleton-block.test.tsx` and the button, image, input and text suites         | Added — the moved per-primitive tests.                 |
| `tests/unit/utils/skeleton-dom.ts`                                                           | Added — the DOM helpers the split suites share.        |
| `specs/implementation-artifacts/sprint-status.yaml`                                          | Delivered stories and epics 1-4 set to `done`.         |
| `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md` | Story 4.4 matrix row; stale delivery states refreshed. |
