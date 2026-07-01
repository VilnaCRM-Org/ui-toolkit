# Story 1.3: Accessibility and Interaction Consistency Hardening

## Status

review

## Story

As an end user,
I want core controls to behave consistently for keyboard and disabled/error interactions,
so that I can use company products reliably and accessibly.

## Acceptance Criteria

1. Given core controls are used in keyboard and assistive-technology flows, when I navigate and
   interact without a mouse, then focus behavior is visible and consistent across controls, and
   keyboard interactions follow expected patterns for each control type.
2. Given controls can be set to disabled or error states, when those states are active, then
   interaction behavior is predictable and non-conflicting, and disabled/error semantics are
   consistently represented in component behavior and styling.
3. Given accessibility is part of release quality gates, when Epic 1 accessibility checks are
   executed, then core interaction and accessibility requirements are validated for all four
   controls, and any failures are treated as blocking issues for Epic 1 completion.

## Scope Decision (product direction)

Two boundaries were confirmed with the product owner before implementation:

- **Colour/visual focus indicators are deferred.** The visible focus-ring appearance (and all
  colour/contrast remediation) is owned by a dedicated **accessibility-visuals follow-up PR**. This
  story therefore changes **no component colours** and adds **no new visual baselines**. It hardens
  the _behavioural_ accessibility contract (keyboard operability, focus reachability/order,
  disabled/error semantics) and adds the Epic 1 accessibility test gate.
- **Non-colour API hardening is included now.** Optional, backward-compatible props were added to
  close AT gaps found in the audit (see Findings): `UiCheckbox` gains `required` and `helperText`
  (linked via `aria-describedby`); `UiInput` gains development-only guidance for missing accessible
  names and error states without a description.

## Tasks / Subtasks

- [x] Establish the Epic 1 accessibility test gate for the four core controls (AC: 1, 2, 3)
  - [x] Add a cross-control keyboard/focus/disabled/error suite
        (`tests/unit/core-controls-accessibility.test.tsx`) running in the required `make test-unit`
        CI job.
  - [x] Validate Tab reachability and logical focus order across all four controls.
  - [x] Validate keyboard operability per control type: `Button` Enter/Space activation, `Input`
        typing, `Checkbox` Space toggle, `Link` focusable with role + accessible name.
  - [x] Validate disabled semantics are consistent: each control exposes `disabled` and is removed
        from the keyboard tab order.
  - [x] Validate error semantics are consistent: `Input` and `Checkbox` both flag invalidity via
        `aria-invalid` and omit it when not in error.
- [x] Coordinate an accessibility specialist audit of the four controls (AC: 3)
  - [x] Delegated to the accessibility-lead specialist team; recorded confirmed passes and findings.
  - [x] Verified confirmed passes: native keyboard semantics, no keyboard traps, focus order,
        disabled correctness, and `aria-invalid` wiring on `Input`/`Checkbox`.
- [x] Land the in-scope non-colour API hardening (AC: 1, 2)
  - [x] F5 — `UiCheckbox` `required`: forward the native `required` attribute to the underlying
        input for assistive technology (no visual asterisk/colour — deferred).
  - [x] F4 — `UiCheckbox` `helperText`: render a neutral `FormHelperText`, linked to the input via
        `aria-describedby`, so a screen reader can announce the reason alongside `aria-invalid`.
  - [x] F3 — `UiInput` accessible-name guidance: dev-only `console.warn` when no name source
        (`label` / `aria-label` via `slotProps.input` / `id`) is present; stripped in production.
  - [x] F6 — `UiInput` error-description guidance: dev-only `console.warn` when `error` is set with
        no `helperText`.
  - [x] Add `required`/`helperText` `argTypes` to the checkbox story (no new story export → no
        visual-baseline churn).
- [x] Keep the change fully backward compatible and green (AC: 2, 3)
  - [x] No public prop removals/renames; all additions are optional. No colour/style changes.
  - [x] Unit suite green at the 100% coverage gate; new `index.tsx` branches fully covered.
  - [x] `lint-next` / `lint-tsc` / `format-check` clean on the changed files.
- [x] Document decisions, provenance, and deferred follow-ups (AC: 2, 3)
  - [x] Update `component-provenance.md` accessibility rows for the four controls.
  - [x] Track deferred items (visible focus indicators F1/F2/F7, describedby-merge F8, disabled-link
        inertness F9) as explicit follow-ups.
  - [x] Advance `sprint-status.yaml` `1-3` to `review`.

## Dev Notes

### Accessibility audit (specialist team)

The accessibility-lead specialist team audited all four controls against WCAG 2.1/2.2 AA, verified
against the MUI v9 source in `node_modules` (not assumed). Summary:

**Confirmed PASS (no action):**

- **Keyboard operability & focus order** — every control renders one native focusable element in DOM
  order; no positive `tabindex`, no reordering, no custom key handling. (WCAG 2.1.1, 2.1.2, 2.4.3)
- **Disabled correctness** — `Button`/`Input`/`Checkbox` use the native `disabled` attribute, so they
  leave the tab order and their handlers cannot fire.
- **`aria-invalid` wiring** — `Input` and `Checkbox` both place `aria-invalid` on the element that
  carries the role, and correctly omit it when not in error (`error ? 'true' : undefined`).
- **`UiLink`** — a native `<a>` (not `ButtonBase`), so its browser focus ring is preserved; its
  contractual absence of `disabled`/`error` is correct for `role=link` (no such ARIA states).
  `target="_blank"` correctly enforces `noopener noreferrer` plus a visually-hidden new-tab hint.

**Findings and disposition:**

| ID  | Severity | Finding                                                                                                                              | Disposition                                                                                                                                    |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Critical | `UiCheckbox` has **no** visible keyboard focus indicator (`disableRipple` + `ButtonBase` `outline:0` + no `.Mui-focusVisible` rule). | **Deferred** to the accessibility-visuals PR (colour/visual). Behavioural focus reachability is test-locked here. Tracked as the #1 follow-up. |
| F2  | Major    | Outlined/social buttons have no persistent focus indicator; contained relies on an elevation delta.                                  | **Deferred** to the accessibility-visuals PR (colour/visual).                                                                                  |
| F3  | Major    | `UiInput` permits a field with no accessible name (placeholder is not a name).                                                       | **Done** — dev-only `console.warn` guidance (non-breaking).                                                                                    |
| F4  | Major    | `UiCheckbox` `error` had no way to convey a reason.                                                                                  | **Done** — optional `helperText` + `aria-describedby`.                                                                                         |
| F5  | Major    | `UiCheckbox` had no required-field support.                                                                                          | **Done** — optional `required` → native input attribute.                                                                                       |
| F6  | Major    | `UiInput` `error` can be signalled with no text description.                                                                         | **Done** — dev-only `console.warn` guidance.                                                                                                   |
| F7  | Minor    | `UiInput` focus visibility is a same-width colour swap.                                                                              | **Deferred** to the accessibility-visuals PR (colour/visual).                                                                                  |
| F8  | Minor    | Consumer `aria-describedby` via `InputProps` can clobber MUI's auto helperText link.                                                 | **Deferred** — tracked follow-up (input slot-merge refinement).                                                                                |
| F9  | Minor    | `disabled` + `href`/`to` degrades to a still-navigable anchor.                                                                       | **Deferred** — tracked follow-up (render inert or document).                                                                                   |

### Why the focus-indicator visuals are deferred (AC 1)

AC1 asks for focus that is "visible and consistent across controls." Three of the four controls
(`Button`, `Input`, `Link`) already render a visible focus state — their `*-focus` pixel baselines
exist in `tests/visual/states.spec.ts` from earlier work. The checkbox (F1) is the outlier with no
visible focus ring, and both remaining gaps (F1, F2) are fixed by adding a focus **outline**, which
is a colour/contrast decision that WCAG couples with 2.4.11 (Focus Not Obscured) and 2.4.13 (Focus
Appearance). Per product direction those visuals are owned by the follow-up accessibility-visuals
PR. This story instead locks the **behavioural** half of AC1 — that every control is keyboard
reachable, in the correct order, and operable — which jsdom can assert deterministically and which
does not require any colour choice.

### Epic 1 accessibility gate (AC 3)

The gate is ordinary `tests/unit/**` coverage running in the existing required **unit testing** CI
job — no new workflow, no new dependency, deterministic and colour-neutral:

- `tests/unit/core-controls-accessibility.test.tsx` — cross-control keyboard operability, focus
  reachability/order, disabled tab-order exclusion, and error-semantics consistency.
- `tests/unit/ui-check-box.test.tsx` — `required` (`toBeRequired`) and `helperText`
  (`aria-describedby` link + `-helper-text` id) coverage.
- `tests/unit/ui-input.test.tsx` — accessible-name and error-description guidance (including the
  production no-op path).

Static analysis stays as the first tier via `eslint-plugin-jsx-a11y` (already in `lint-next`); its
ceiling — it only sees lowercase intrinsic elements, not MUI-wrapped semantics — is exactly what the
runtime Jest tier covers. A failing assertion in this tier fails the required unit job and therefore
blocks Epic 1 (AC 3).

### Documented deviations (AC 2)

- **No colour/visual changes.** The visible focus indicator (F1/F2/F7) and any error-colour styling
  of the new checkbox `helperText` are intentionally deferred to the accessibility-visuals PR. The
  new `FormHelperText` is rendered without the `error` colour prop (neutral) so this story introduces
  no colour.
- **Checkbox `required` is AT-only.** `required` forwards the native attribute for screen readers;
  the visual required affordance (asterisk/colour) is deferred with the rest of the visual work.
- **`UiLink` keeps no `disabled`/`error` props** — confirmed correct per HTML/ARIA (`role=link` has
  no disabled/invalid state); unchanged from the Story 1.1 contract.

### Testing requirements

- Keyboard/focus/toggle behaviour is exercised with `@testing-library/user-event` (already a
  devDependency); `:focus-visible` paint is out of jsdom's reach and stays the responsibility of the
  Playwright `*-focus` baselines. [Source: specs/planning-artifacts/architecture.md]
- The `UiInput` dev-guidance is validated on both the development (`console.warn` fired) and
  production (`NODE_ENV=production` → no-op) paths so the environment guard is fully covered and
  mutation-resistant.
- Tests run on the host; the Docker `bun` image is a baked build and can run stale.

### Scope boundaries

- **No new dependencies.** The audit noted `jest-axe` as a possible runtime a11y-audit layer; it is
  intentionally **not** added here (avoids a lockfile/Docker-image change) — the behavioural gate
  plus `eslint-plugin-jsx-a11y` covers Story 1.3. `jest-axe` is a candidate for Story 1.4 closure.
- **No new Storybook story exports** (only `argTypes`), so the visual manifest gate and existing
  pixel baselines are untouched.

### References

- `specs/planning-artifacts/epics.md#story-13-accessibility-and-interaction-consistency-hardening`
- `specs/planning-artifacts/prd.md`
- `specs/planning-artifacts/architecture.md`
- `specs/planning-artifacts/component-provenance.md`
- `specs/implementation-artifacts/1-2-core-control-state-parity-completion.md`
- `specs/implementation-artifacts/sprint-status.yaml`
- `tests/unit/core-controls-accessibility.test.tsx`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (Claude Code)

### Debug Log References

- 2026-07-01: Ran the accessibility-lead specialist audit against the four controls (verified vs MUI
  v9 source). Recorded confirmed passes + findings F1–F9.
- 2026-07-01: Authored the cross-control keyboard/focus/disabled/error gate (RED→GREEN in jsdom via
  `user-event`); confirmed Enter/Space activation, checkbox Space toggle, tab-order exclusion.
- 2026-07-01: Implemented non-colour API hardening (checkbox `required`/`helperText`, input dev
  guidance). Full unit suite green at the 100% coverage gate (42 suites / 364 tests).
- 2026-07-01: Silenced the dev-guidance `console.warn` in unit fixtures that render minimal inputs;
  `lint-next`/`lint-tsc`/`format-check` clean.

### Completion Notes List

- Story 1.3 hardens the behavioural accessibility contract for the four Epic 1 controls and stands
  up the Epic 1 accessibility test gate, with **no colour/visual changes** (deferred to the
  accessibility-visuals PR per product direction).
- Added backward-compatible, non-colour API hardening: `UiCheckbox` `required` + `helperText`
  (`aria-describedby`), and `UiInput` development-only accessible-name / error-description guidance.
- Deferred (tracked) follow-ups for the accessibility-visuals PR: F1 (checkbox visible focus — the
  Critical), F2 (button focus indicators), F7 (input focus width), plus F8 (describedby merge) and
  F9 (disabled-link inertness).

### File List

- specs/implementation-artifacts/1-3-accessibility-and-interaction-consistency-hardening.md
- specs/implementation-artifacts/sprint-status.yaml
- specs/planning-artifacts/component-provenance.md
- src/components/ui-checkbox/index.tsx
- src/components/ui-checkbox/types.ts
- src/components/ui-checkbox/checkbox.stories.tsx
- src/components/ui-input/index.tsx
- tests/unit/core-controls-accessibility.test.tsx
- tests/unit/ui-check-box.test.tsx
- tests/unit/ui-input.test.tsx
- tests/unit/ui-core-contract.test.tsx
- tests/unit/ui-text-field-form.test.tsx

## Change Log

- 2026-07-01: Created Story 1.3 implementation artifact; established the Epic 1 accessibility gate,
  landed non-colour API hardening, deferred focus-indicator visuals to the accessibility-visuals PR,
  and advanced the story to `review`.
