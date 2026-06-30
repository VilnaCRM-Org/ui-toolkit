# Story 1.2: Core Control State Parity Completion

## Status

review

## Story

As a product-team developer,
I want the existing core controls to implement all required state variants,
so that users get consistent behavior and visuals across company applications.

## Acceptance Criteria

1. Given the core controls in scope are `UiButton`, `UiInput`, `UiCheckbox`, and `UiLink`, when state behavior is reviewed against the PRD and board requirements, then each control supports the required states for its role (rest, hover, active, disabled, plus error where applicable), and state behavior is consistent with canonical `crm` behavior where equivalent.
2. Given visual/interaction parity can drift during implementation, when updates are delivered for these controls, then state semantics remain backward compatible for existing consumers, and any unavoidable deviation is explicitly documented with rationale.
3. Given this story must be independently verifiable, when QA validation is executed, then required state coverage is demonstrable for all four controls, and unresolved parity gaps are tracked as blocking issues for this epic.

## Tasks / Subtasks

- [x] Review current state coverage for the four core controls against the PRD board state lists (AC: 1)
  - [x] Build a per-control × per-state coverage matrix (rest/hover/active/disabled/error) from the actual `theme.ts`/`styles.ts` source.
  - [x] Classify each state cell as implemented+tested, implemented+untested, missing, or N/A for the control's role.
  - [x] Confirm no required state is missing from component code before adding tests (no restyle required).
- [x] Close the demonstrability gaps with visual state-grid coverage (AC: 1, 3)
  - [x] Add the missing per-state visual baselines so every required state is demonstrable: `input hover`, `checkbox hover`, `link active`.
  - [x] Generate the Chromium/Linux pixel baselines inside the pinned Playwright Docker image so they match CI rendering.
  - [x] Keep the pre-existing focus baselines untouched (they are Story 1.3-adjacent and out of scope here).
- [x] Confirm prop-driven state semantics remain unit-demonstrable and backward compatible (AC: 1, 2, 3)
  - [x] Verify `disabled` → `disabled` attribute and `error` → `aria-invalid` are asserted by existing unit specs for the relevant controls.
  - [x] Make no public prop or behavior changes; states are already styled from central `crm`-canonical tokens.
- [x] Document parity decisions and track residual gaps (AC: 2, 3)
  - [x] Record the documented deviations (input `active` ≡ `Mui-focused`; link `disabled`/`error` props not exposed per contract; button `error/invalid` optional/deferred per FR-04) with rationale.
  - [x] Add the four core controls to `specs/planning-artifacts/component-provenance.md` with their canonical source and deviations.
  - [x] Track the deferred `socialButton` per-state visual coverage as a non-blocking follow-up note.
- [x] Finalize Story 1.2 evidence (AC: 3)
  - [x] Run the visual suite to green inside Docker and the unit suite on the host.
  - [x] Advance `sprint-status.yaml` `1-2-core-control-state-parity-completion` to `review`.

## Dev Notes

### Story Foundation

- Story 1.2 builds on the stable contract/export baseline from Story 1.1; it is about completing the **state machine** (rest/hover/active/disabled/error) for `UiButton`, `UiInput`, `UiCheckbox`, and `UiLink`, not the contract surface. [Source: specs/planning-artifacts/epics.md#story-12-core-control-state-parity-completion]
- The authoritative per-control state lists come from the PRD board requirements (§4.1/§4.2): Button `rest, hover, active, disabled` (Board A; `error/invalid` optional per FR-04, only in form-validation contexts); Input `rest, hover, active, disabled, error`; Link and Checkbox states per their board rows. [Source: specs/planning-artifacts/prd.md#78] [Source: specs/planning-artifacts/prd.md#95] [Source: specs/planning-artifacts/prd.md#179]
- Behavior aligns to canonical `crm`; `website` only fills visual/variant gaps. Any deviation must be documented as provenance/rationale. [Source: specs/planning-artifacts/prd.md#32-reuse-first-delivery-rule-hard-constraint] [Source: specs/planning-artifacts/architecture.md#requirements-to-structure-mapping]

### State Coverage Matrix (evidence)

Legend: `IMPL+TEST` styled and demonstrated by a test · `N/A` not valid for the role · `Deferred`/`Not exposed` out of board/contract scope · all required cells are covered after this story.

| Control                         | rest                                                        | hover                                                             | active                                                                               | disabled                                                                                   | error                                                                                                      |
| ------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `UiButton` (contained/outlined) | IMPL+TEST (`ui-button/theme.ts`, `visual.spec.ts`)          | IMPL+TEST (`theme.ts:20-22,37-40`, `states.spec.ts` button hover) | IMPL+TEST (`theme.ts:23-25,41-43`, `states.spec.ts` button active)                   | IMPL+TEST (`theme.ts:26-29,44-48`, `states.spec.ts` + `ui-button.test.tsx` `toBeDisabled`) | Deferred — optional per FR-04 (`prd.md:179`), form-validation only; outside Board A scope, not implemented |
| `UiInput`                       | IMPL+TEST (`ui-input/theme.ts:29-31`, `visual.spec.ts`)     | IMPL+TEST (`theme.ts:12-14,32-34`, **new** `input-hover`)         | IMPL+TEST via `Mui-focused` (`theme.ts:15-17`, `input-focus`) — deviation documented | IMPL+TEST (`theme.ts:21-27,70-74`, `states.spec.ts` + `ui-input.test.tsx` `toBeDisabled`)  | IMPL+TEST (`theme.ts:18-20,83-91`, `states.spec.ts` + `ui-input.test.tsx` `aria-invalid`)                  |
| `UiCheckbox`                    | IMPL+TEST (`ui-checkbox/styles.ts:48-51`, `visual.spec.ts`) | IMPL+TEST (`styles.ts:34-37`, **new** `checkbox-hover`)           | N/A (no pressed state in the grid)                                                   | IMPL+TEST (`styles.ts:38-42`, `states.spec.ts` + `ui-check-box.test.tsx` `toBeDisabled`)   | IMPL+TEST (`styles.ts:53-59` + `index.tsx:27` `aria-invalid`, `states.spec.ts` + unit)                     |
| `UiLink`                        | IMPL+TEST (`ui-link/theme.ts:11-17`, `visual.spec.ts`)      | IMPL+TEST (`theme.ts:24-26`, `states.spec.ts` link hover)         | IMPL+TEST (`theme.ts:27-29`, **new** `link-active`)                                  | Not exposed — contract exception (`ui-link/types.ts`)                                      | Not exposed — contract exception (`ui-link/types.ts`)                                                      |

### Documented Deviations (AC 2)

- **Input `active` ≡ `Mui-focused`.** An MUI text field has no distinct CSS `:active`/pressed appearance separate from focus; the board "active/typing" cell maps to `&.Mui-focused` (`src/components/ui-input/theme.ts:15-17`), already baselined as `input-focus.png`. This is a visual-parity mapping, not a keyboard-semantics change (which is Story 1.3 scope).
- **Link `disabled`/`error` — not exposed.** Declared contract exceptions in `src/components/ui-link/types.ts` (Story 1.1). FR-04 (`prd.md:182`) lists `disabled` for link and marks `error/invalid` optional; reconciling the link `disabled` prop with FR-04 is a contract decision, not a Story 1.2 visual-state gap.
- **Button `error`/`invalid` — optional, deferred.** Board A (`prd.md:78`) scopes the button to rest/hover/active/disabled; FR-04 (`prd.md:179`) makes `error/invalid` optional, applicable only in form-validation contexts. It is outside this story's board scope and not implemented — deferred, not a parity gap.

### crm Parity Notes

- The canonical `crm` source tree is not vendored in this repo; parity is therefore anchored to the Figma state grid that `tests/visual/states.spec.ts` enforces and the committed pixel baselines. [Source: specs/planning-artifacts/architecture.md#requirements-to-structure-mapping]
- State colors are centralized as `crm`-canonical tokens in `src/components/ui-color-theme/index.ts` (`containedButtonHover`/`containedButtonActive`, `textLinkHover`/`textLinkActive`, `error`/`strokeDanger`) and consumed by every control, so color-level parity is structurally consistent. No restyle was required for this story.

### Scope Boundaries

- **No component code changes.** Every PRD-required state was already styled from central tokens; this story adds _demonstrability_ (visual baselines) and _documentation_ only.
- **Focus-visible appearance and keyboard operability are explicitly out of scope** — they belong to Story 1.3 (Accessibility and Interaction Consistency Hardening). The pre-existing `*-focus` baselines are left as-is. [Source: specs/planning-artifacts/epics.md#story-13-accessibility-and-interaction-consistency-hardening]
- **Deferred (non-blocking):** the `socialButton` variant has its own hover/active/disabled styling (`src/components/ui-button/theme.ts:103-123`) not yet exercised per-state by the visual grid; contained/outlined already prove the button state machine. Tracked here as a follow-up, not a blocking gap.

### Testing Requirements

- `:hover`/`:active` are CSS pseudo-classes that jsdom cannot evaluate, so per-state visual parity is demonstrated by the Playwright visual grid (`tests/visual/states.spec.ts`); prop→semantic mappings (`disabled` attribute, `aria-invalid`) are demonstrated by Jest unit specs under `tests/unit`. [Source: specs/planning-artifacts/architecture.md#integration-test-conventions]
- Visual baselines are generated and compared inside the pinned Playwright Docker image (`Dockerfile.playwright`, `mcr.microsoft.com/playwright:v1.59.1-jammy`) against the `storybook` compose service, identical to the `Visual Tests` CI workflow (`make test-visual`). Host-generated pixels are not authoritative.

### References

- `specs/planning-artifacts/epics.md`
- `specs/planning-artifacts/prd.md`
- `specs/planning-artifacts/architecture.md`
- `specs/planning-artifacts/component-provenance.md`
- `specs/implementation-artifacts/1-1-core-contract-and-export-baseline.md`
- `specs/implementation-artifacts/sprint-status.yaml`
- `tests/visual/states.spec.ts`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (Claude Code)

### Debug Log References

- 2026-06-30: Built the state-coverage matrix from `theme.ts`/`styles.ts` and the existing visual/unit suites; confirmed all PRD-required states are already styled (no restyle needed).
- 2026-06-30: Added three failing visual state tests (`input hover`, `checkbox hover`, `link active`) to `tests/visual/states.spec.ts`; ran the visual suite in Docker and watched them fail on missing baselines (RED).
- 2026-06-30: Generated the three Chromium/Linux baselines inside the pinned Playwright image and re-ran the full visual suite to green (GREEN).
- 2026-06-30: Recorded canonical source + deviations in `component-provenance.md`; advanced `sprint-status.yaml` 1-2 to `review`.

### Completion Notes List

- Story 1.2 was already ~90% implemented in code; the delivered work is demonstrability + documentation, with no public prop or behavior change (fully backward compatible).
- Added `input-hover`, `checkbox-hover`, and `link-active` visual baselines so every required state is demonstrable for all four controls.
- Documented the role-based deviations (input active≡focus; link `disabled`/`error` not exposed per contract; button `error/invalid` optional/deferred per FR-04) here and in the new component-provenance record.
- Deferred `socialButton` per-state visual coverage as a tracked, non-blocking follow-up.

### File List

- specs/implementation-artifacts/1-2-core-control-state-parity-completion.md
- specs/implementation-artifacts/sprint-status.yaml
- specs/planning-artifacts/component-provenance.md
- tests/visual/states.spec.ts
- tests/visual/states.spec.ts-snapshots/input-hover-chromium-linux.png
- tests/visual/states.spec.ts-snapshots/checkbox-hover-chromium-linux.png
- tests/visual/states.spec.ts-snapshots/link-active-chromium-linux.png

## Change Log

- 2026-06-30: Created Story 1.2 implementation artifact from PRD, epics, architecture, and current repository inspection.
- 2026-06-30: Completed state-parity demonstrability — added three visual state baselines, documented deviations and provenance, and advanced the story to `review`.
