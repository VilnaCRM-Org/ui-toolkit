# Story 3.6 — Epic 3 Quality Gate Closure

- **Issue:** [#29](https://github.com/VilnaCRM-Org/ui-toolkit/issues/29)
- **PR:** [#132](https://github.com/VilnaCRM-Org/ui-toolkit/pull/132)
- **Branch:** `feat/issue-27-quality-gate-closure`
- **Epic:** Epic 3 — Data Presentation and Cards
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 3.6: Epic 3 Quality Gate Closure_
  (`epics.md:514`)

## Scope

Close the five gate obligations Story 3.6 places on Epic 3 — Storybook/unit coverage (AC-1),
public-API integrity (AC-2), the Story 1.3 accessibility baseline plus NFR3 (AC-3), no unresolved
downstream blockers (AC-4) and traceable FR7/FR8 completion evidence (AC-5) — for the eleven
delivered components named by the acceptance criteria:

| Module                   | Public export         | Story module                      | Baselines | Behaviour unit suites                                                                   |
| ------------------------ | --------------------- | --------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `ui-item-row`            | `UiItemRow`           | `item-row.stories.tsx`            | 7         | `tests/unit/ui-item-row.test.tsx`                                                       |
| `ui-items-list`          | `UiItemsList`         | `items-list.stories.tsx`          | 1         | `tests/unit/ui-items-list.test.tsx`                                                     |
| `ui-task-card`           | `UiTaskCard`          | `task-card.stories.tsx`           | 5         | `tests/unit/ui-task-card.test.tsx`                                                      |
| `ui-profile-select-card` | `UiProfileSelectCard` | `profile-select-card.stories.tsx` | 4         | `tests/unit/ui-profile-select-card.test.tsx`                                            |
| `ui-integration-card`    | `UiIntegrationCard`   | `integration-card.stories.tsx`    | 4         | `tests/unit/ui-integration-card.test.tsx`                                               |
| `ui-filter-chip`         | `UiFilterChip`        | `filter-chip.stories.tsx`         | 3         | `tests/unit/ui-filter-chip.test.tsx`                                                    |
| `ui-pin-input`           | `UiPinInput`          | `pin-input.stories.tsx`           | 6         | `tests/unit/ui-pin-input.test.tsx` plus the three pin intent/paste/normalisation suites |
| `ui-payment-option-card` | `UiPaymentOptionCard` | `payment-option-card.stories.tsx` | 4         | `tests/unit/ui-payment-option-card.test.tsx`                                            |
| `ui-action-icon-bar`     | `UiActionIconBar`     | `action-icon-bar.stories.tsx`     | 5         | `tests/unit/ui-action-icon-bar.test.tsx`                                                |
| `ui-status-badge`        | `UiStatusBadge`       | `status-badge.stories.tsx`        | 5         | `tests/unit/ui-status-badge.test.tsx`                                                   |
| `ui-notification-badge`  | `UiNotificationBadge` | `notification-badge.stories.tsx`  | 6         | `tests/unit/ui-notification-badge.test.tsx`                                             |

Baseline counts are the `UiComponents/<Export>` entries in `tests/visual/stories.json`; forced
interaction states are additionally locked by `tests/visual/states.spec.ts`. This is a closure
story: it changes **no component source**. Its enforcement surface is the shared closure guard
owned by Story 1.4 (`tests/unit/epic-quality-gate-closure.test.ts` — see
`1-4-epic-1-quality-gate-closure.md` for the guard's contract and failing-first evidence).

## AC-2 — Public API integrity

All eleven components are value- and type-exported from `src/components/index.ts`; the surface is
pinned by `tests/unit/components-index.test.ts`, `tests/unit/export-contract-integrity.test.ts`
(against `specs/planning-artifacts/export-contract.md`) and the closure guard. Contract
consistency plus documented exceptions are complete per the register and the ledger — including
the `UiPaymentOptionCard` deliberate structural deviation from `UiIntegrationCard`, recorded at
its three code sites and ruled in `tests/unit/component-provenance-traceability.test.ts`.

## AC-3 — Accessibility baseline (Story 1.3, NFR3)

Keyboard navigation, focus order, keyboard operability and disabled behaviour are validated per
component by the unit suites above: `Tab`/`Shift+Tab` traversal and per-pattern operation —
`ui-item-row` expandable rows, `ui-task-card` actionable card, `ui-profile-select-card` APG
menu-button, `ui-integration-card` and `ui-payment-option-card` ARIA radio groups,
`ui-filter-chip` toggle, `ui-pin-input` per-cell keyboard intents and paste distribution
(`tests/unit/pin-keyboard-intents.test.ts`, `tests/unit/pin-paste-distribution.test.ts`),
`ui-action-icon-bar` toolbar actions, and the badge pair's interactive states. `ui-items-list`
is a non-interactive composition wrapper by contract: its keyboard surface **is** its rows, and
that evidence lives in the `UiItemRow` suite. WCAG 2.5.8 target-size conformance is recorded at
the code sites of `ui-filter-chip`, `ui-status-badge`, `ui-notification-badge` and
`ui-profile-select-card`, each ruled in the provenance guard's allowed-site list.

Visible-focus evidence and its boundaries are ledgered, not implied, in
`specs/planning-artifacts/deviation-ledger.md`:

- `DEV-03` (`deferred-tracked`) — repo-wide focus-ring visual parity and contrast remediation is
  routed to one dedicated accessibility-visuals PR; behavioural accessibility shipped complete.
- `DEV-07` (`deferred-tracked`) — `UiProfileSelectCard`: the Story 3.4 Amendment A1 two-selector
  focus ring is not applied there, folded into the `DEV-03` bucket; menu typeahead is an APG
  optional behaviour, on record.
- `DEV-34` (`ratified`) — `UiProfileSelectCard` menu-item hover tint exempted from the 3:1
  non-text contrast requirement (decorative; keyboard focus paints a separate ring).
- `DEV-08` / `DEV-16` (task card / integration card disabled-visual escalations) — disabled
  **behaviour** is delivered and tested; the visual treatments are escalated design questions
  with ledger rows, not silent gaps.

Accessibility failures block this epic by construction: the suites above are part of the
required unit check.

## AC-4 / AC-5 — Downstream enablement and FR7/FR8 evidence

No unresolved blocking issue remains for Epics 4-5: Epic 3's open items are ledger rows with
owners and tracking refs. FR8 evidence per acceptance item: stories (Scope table), unit tests
(Scope table), strict type check (gate run below), exports (AC-2). FR7 evidence: shared contract
fields with every departure documented at the type surface or in the ledger (AC-2). All of it is
machine-held by the closure guard, and Story 5.4 consumes this artifact via the Story 5.2 DoD
compliance matrix row.

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
      was recorded by the delivery stories (registry §Epic 3).

### 3. Tests run

- [x] Closure guard green for the Epic 3 set; full unit suite green — see
      [Gate evidence](#gate-evidence).
- [x] Type check green; lint 0 errors.
- [x] Container-only gates explicitly deferred to CI with the reason recorded.

### 4. Stories (Storybook) added/updated

- [x] Not applicable — closure reviews and pins existing coverage; no story or baseline change.

### 5. Export changes

- [x] No export change; the Epic 3 surface is verified against the register and pinned by the
      closure guard.

### 6. Parity evidence

- [x] Not applicable — no design or source-parity mandate: no visual surface change. Figma-parity
      evidence lives in the delivery-story artifacts (47 node ids in
      `3-5-board-a-micro-components.md` alone) and `board-coverage-checklist.md`.

## Changed files

| File                                                                | Change                 |
| ------------------------------------------------------------------- | ---------------------- |
| `specs/implementation-artifacts/3-6-epic-3-quality-gate-closure.md` | Added — this artifact. |

The shared closure-branch changes (guard test, `sprint-status.yaml` keys, Story 5.2 matrix rows)
are owned and listed by `1-4-epic-1-quality-gate-closure.md`.
