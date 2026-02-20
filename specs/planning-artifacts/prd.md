# UI Toolkit Completion PRD (Re-scoped)

**Date:** February 20, 2026  
**Owner:** UI Toolkit Team  
**Status:** Re-scoped Draft for Architecture Input

## 1. Product Outcome

Deliver a production-ready `ui-toolkit` release that fully covers all component modules and state variants represented in:

1. Board A
2. Board B
3. Board C
4. Board D

This release must remove the need for product teams to implement ad hoc UI controls outside the toolkit for covered surfaces.

## 2. Release Boundary

Single release scope: full coverage of all four boards in one versioned delivery.

## 3. Operating Principles and Constraints

### 3.1 Integration Boundary (Hard Constraint)

Toolkit remains strictly UI-layer:

1. Presentation and interaction contracts only.
2. No backend integrations or data-fetching ownership.
3. No domain business logic.

### 3.2 Reuse-First Delivery Rule (Hard Constraint)

Before creating new implementations, teams must reuse already implemented components from:

1. `crm`
2. `website`

### 3.3 Canonical Source Resolution

When both sources contain similar components:

1. `crm` is canonical for behavior and interaction patterns.
2. `website` is used to fill visual and variant gaps.
3. Any divergence from this policy requires explicit note in implementation artifacts.

### 3.4 Skeleton Policy (Release Blocker)

1. Skeleton implementation is copied/reused from `crm` as baseline.
2. Animation parity is mandatory: keyframes, easing, timing, shimmer/pulse behavior.
3. No animation redesign in this release.

### 3.5 API Consistency Policy

New components follow a strict unified contract where relevant:

1. `value`
2. `onChange`
3. `disabled`
4. `error`
5. `size`
6. `variant`
7. `sx`

Documented exceptions are allowed only where control semantics require it.

## 4. Scope Coverage by Board

### 4.1 Board A

1. Button states: rest, hover, active, disabled.
2. Secondary/outlined button states.
3. Link states.
4. Checkbox states in row context.
5. Select with search.
6. Radio group.
7. File upload input.
8. Supporting micro-components:
   - Filter chip (removable)
   - PIN/OTP input
   - Payment option card
   - Action icon bar
   - Status badge
   - Notification badge/counter

### 4.2 Board B

1. Input states: rest, hover, active, disabled, error.
2. Item row/list with method/status semantics.
3. Pagination states.
4. Search states with suggestion dropdown.
5. Multiselect states with selected chips.
6. Calendar-style multiselect variant.

### 4.3 Board C

1. Task/person cards and states.
2. Profile select card with menu states.
3. Integration/brand selection card behavior and states.

### 4.4 Board D

1. Skeleton primitives:
   - Round image
   - Block image
   - One-line text
   - Multi-line text
   - Generic block placeholder
2. Skeleton composed layouts:
   - Widget small
   - Widget medium
   - Menu
   - Tab bar
   - Button
   - List
   - Input
   - Checkbox + text
   - Radio + text
   - Table

## 5. In Scope

1. Missing modules from all boards.
2. Missing state parity for existing modules.
3. Storybook story coverage for each delivered/enhanced module.
4. Unit tests for each delivered/enhanced module.
5. Export coverage via `src/components/index.ts`.
6. Coverage checklist that maps board elements to component implementation status.

## 6. Out of Scope

1. Backend/API integrations (search backends, upload storage, etc.).
2. Product-specific business workflows.
3. Token redesign or global visual language refresh.
4. Visual regression program setup beyond this release’s targeted checks.

## 7. Functional Requirements

### FR-01 Board Coverage Completeness

Every board section listed in Scope Coverage must map to a delivered toolkit component or documented enhancement.

Acceptance:

1. Coverage checklist exists and is complete.
2. No unresolved board element remains without explicit non-goal decision.

### FR-02 Reuse-First Compliance

Implementations must prioritize existing `crm` and `website` assets before creating new modules.

Acceptance:

1. Component implementation notes include source origin.
2. New from-scratch modules only when no viable source exists.

### FR-03 Canonical Behavior Alignment

Interaction behavior follows `crm` when both systems have equivalent components.

Acceptance:

1. Behavior and interaction semantics match `crm`.
2. Visual gap-fill from `website` does not break canonical behavior.

### FR-04 State Parity for Existing Controls

Existing controls must support board-required states.

Acceptance:

1. `UiButton` supports required visible states.
2. `UiInput` supports required visible states.
3. `UiCheckbox` supports required visible states.
4. `UiLink` supports required visible states where applicable.

### FR-05 Missing Module Delivery

Deliver reusable components:

1. `UiPagination`
2. `UiSearchInput`
3. `UiSelectWithSearch`
4. `UiMultiSelect`
5. `UiCalendarMultiSelect`
6. `UiRadioGroup`
7. `UiFileUploadInput`
8. `UiItemRow`
9. `UiItemsList`
10. `UiTaskCard`
11. `UiProfileSelectCard`
12. `UiIntegrationCard`
13. `UiFilterChip`
14. `UiPinInput`
15. `UiPaymentOptionCard`
16. `UiActionIconBar`
17. `UiStatusBadge`
18. `UiNotificationBadge`
19. `UiSkeleton` primitives and composed variants

### FR-06 Skeleton Parity (Release Blocker)

Acceptance:

1. CRM skeleton baseline is copied before extension.
2. Animation parity is preserved exactly.
3. Added variants reuse the same animation system.

### FR-07 API Contract Consistency

Acceptance:

1. Unified API fields are used where relevant.
2. Exceptions are documented with rationale.

### FR-08 Quality Gates

Acceptance:

1. Every delivered component has Storybook coverage.
2. Every delivered component has unit tests with at least render + one core interaction assertion.
3. TypeScript strict checks pass.
4. Components are exported and importable via `src/components/index.ts`.

## 8. Non-Functional Requirements

1. Preserve backward compatibility for existing public component APIs unless explicitly approved.
2. Keep naming aligned to existing `Ui*` conventions.
3. Maintain keyboard accessibility and consistent disabled behavior.
4. Keep implementation maintainable and composable for future board expansion.

## 9. Release Exit Criteria

Release is complete only when all are true:

1. Board coverage checklist is fully closed.
2. Storybook coverage exists for all new/enhanced components.
3. Unit tests pass for new/enhanced components.
4. TypeScript checks pass.
5. Skeleton parity requirements are verified.
6. Exports are complete from toolkit entry point.

## 10. Risks and Mitigations

1. Risk: Scope pressure from single-release mandate.
   - Mitigation: enforce board checklist and strict definition of done per component.
2. Risk: Behavior drift between source systems.
   - Mitigation: enforce CRM canonical behavior policy.
3. Risk: Visual inconsistency while blending sources.
   - Mitigation: use website only for visual/variant gap-fill after behavior alignment.
4. Risk: Skeleton parity regressions.
   - Mitigation: treat animation parity as release blocker and verify before sign-off.
