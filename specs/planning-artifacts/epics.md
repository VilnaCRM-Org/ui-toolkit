---
stepsCompleted:
  - 1
  - 2
  - 3
inputDocuments:
  - specs/planning-artifacts/prd.md
  - specs/planning-artifacts/architecture.md
workflowType: 'epics-and-stories'
project_name: 'ui-toolkit'
user_name: 'platform-team'
date: '2026-02-20T18:26:30+02:00'
---

# ui-toolkit - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ui-toolkit, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Ensure complete board coverage by mapping every board element to a delivered component or documented enhancement.
FR2: Enforce reuse-first implementation by prioritizing existing `crm` and `website` assets before creating new modules.
FR3: Align behavior canonically to `crm` for equivalent components, using `website` only for visual/variant gap-fill.
FR4: Achieve required state parity for existing controls (`UiButton`, `UiInput`, `UiCheckbox`, `UiLink`).
FR5: Deliver missing reusable modules: `ui-pagination`, `ui-search-input`, `ui-select-with-search`, `ui-multi-select`, `ui-calendar-multi-select`, `ui-radio-group`, `ui-file-upload-input`, `ui-item-row`, `ui-items-list`, `ui-task-card`, `ui-profile-select-card`, `ui-integration-card`, `ui-filter-chip`, `ui-pin-input`, `ui-payment-option-card`, `ui-action-icon-bar`, `ui-status-badge`, `ui-notification-badge`, `ui-skeleton` (primitives + composed variants).
FR6: Implement skeletons from `crm` baseline with exact animation parity as a release blocker.
FR7: Apply unified component API contract (`value`, `onChange`, `disabled`, `error`, `size`, `variant`, `sx`) with documented exceptions.
FR8: Satisfy quality gates for all delivered/enhanced modules: Storybook coverage, unit tests, strict TypeScript checks, and complete public exports.

### NonFunctional Requirements

NFR1: Preserve backward compatibility for existing public component APIs unless explicitly approved.
NFR2: Maintain naming and API conventions aligned with `Ui*` public component standards.
NFR3: Ensure keyboard accessibility and consistent disabled/error interaction behavior.
NFR4: Keep implementation maintainable and composable for future board expansion.
NFR5: Keep architecture scoped strictly to UI-layer concerns (no backend ownership, no domain business logic).
NFR6: Maintain deterministic, async-stateless component behavior with consumer-owned orchestration.

### Additional Requirements

- Existing repository baseline is retained; no starter re-bootstrap is required.
- Public API boundary is enforced via `src/components/index.ts` exports.
- New component folders/files follow kebab-case naming; existing legacy `UiPascalCase` folders remain until explicit migration.
- Stories are co-located with components; unit tests remain centralized in `src/test/testing-library`.
- Source provenance must be tracked centrally at `specs/planning-artifacts/component-provenance.md` with `crm|website|new` source labels and rationale.
- Distribution path is public npm package registry with semver-governed releases.
- Public npm promotion requires a blocking Epic 5 licensing/IP governance gate before release approval.
- CI publish gating depends on contract checklist completion (exports, state matrix, accessibility checks, Storybook/tests).
- PRD, architecture, and implementation constraints must remain aligned with `crm` canonical behavior policy.

### Governance Roles

- **Release Manager:** owns release checklist execution, evidence collection, and go/no-go recommendation packaging.
- **Governance Board:** cross-functional approvers (Engineering Lead, QA Lead, and Legal/OSS Compliance representative) with authority to approve or block public npm promotion.
- **Role distinction:** the Release Manager prepares and presents validation artifacts; the Governance Board provides final release authorization.

### FR Coverage Map

FR1: Epic 5 - Production Adoption Readiness ensures complete board-to-component coverage tracking and closure.
FR2: Epics 2-4 delivery stories record reuse-first provenance details via the shared Definition of Done checklist; Epic 5 validates and closes cross-epic compliance.
FR3: Epics 2-4 delivery stories record canonical behavior/source decisions via the shared Definition of Done checklist; Epic 5 validates and closes cross-epic alignment.
FR4: Epic 1 - Core Controls and Contract Foundation delivers required state parity for existing controls.
FR5: Epic 2, Epic 3, Epic 4 - Missing module delivery is split by user workflow domain (input/select, data/cards, skeletons).
FR6: Epic 4 - Skeleton Loading Experience Parity delivers CRM baseline reuse and animation parity.
FR7: Epic 1, Epic 2, Epic 3 - Unified API contract is applied across foundational and new interactive components.
FR8: Epic 1, Epic 2, Epic 3, Epic 4, Epic 5 - Quality gates are enforced across all delivery domains and release readiness.

### NFR Coverage Map

NFR1: Epic 1 (Stories 1.1-1.4) preserves public API compatibility; Epic 5: Production Readiness (Stories 5.3-5.4) performs backward-compatibility/contract/export review and closes quality-gate evidence before release approval.
NFR2: Epic 1 (Stories 1.1-1.4), Epic 2 (Stories 2.1-2.6 including Story 2.4A), Epic 3 (Stories 3.1-3.6), and Epic 4: Skeleton Loading (ui-skeleton) (Stories 4.1-4.4) enforce naming and API convention alignment.
NFR3: Epic 1 Story 1.3 establishes accessibility baseline controls; Epic 2 Story 2.6, Epic 3 Story 3.6, and Epic 4: Skeleton Loading (ui-skeleton) Story 4.4 enforce keyboard accessibility plus disabled/error checks where applicable; Epic 5: Production Readiness validates closure evidence.
NFR4: Epic 2 (Stories 2.1-2.6 including Story 2.4A), Epic 3 (Stories 3.1-3.6), and Epic 4: Skeleton Loading (ui-skeleton) ensure maintainable composability from primitive to composed variants; Epic 5: Production Readiness consolidates cross-epic traceability for sustained maintainability.
NFR5: Epic 1 Story 1.1 plus Epic 2/3 quality-gate stories enforce UI-layer-only boundaries.
NFR6: Epic 2 and Epic 3 delivery stories enforce deterministic component behavior with consumer-owned orchestration.

### Shared Definition of Done Checklist

All delivery stories in Epic 2 (Stories 2.1-2.4, Story 2.4A, and Story 2.5) and Epic 3 (Stories 3.1-3.5) carry an implicit provenance obligation.
Each delivery story must record source, reuse rationale, and reference IDs in PR/issue metadata using the shared Definition of Done checklist at `specs/implementation-artifacts/story-dod-template.md`.

## Epic List

### Epic 1: Core Controls and Contract Foundation

Deliver stable, production-ready foundational controls and consistent contracts so product teams can build interactive UI without custom rework.
**FRs covered:** FR4, FR7, FR8

### Epic 2: Selection, Search, and Input Workflows

Enable users to search, select, and submit values through reusable input-selection components that support company app workflows.
**FRs covered:** FR5, FR7, FR8

### Epic 3: Data Presentation and Cards

Enable users to understand and act on structured information via reusable item rows, lists, and card patterns.
**FRs covered:** FR5, FR7, FR8

### Epic 4: Skeleton Loading Experience Parity

Provide trusted loading experiences by delivering skeleton primitives and composed variants with exact CRM animation parity.
**FRs covered:** FR5, FR6, FR8

### Epic 5: Production Adoption Readiness

Make the toolkit safely adoptable across company projects by closing coverage, provenance, export, and release-gate governance.
**FRs covered:** FR1, FR2, FR3, FR8 (plus consolidated traceability references for FR4, FR5, FR6, and FR7 delivered in Epics 1-4)

## Epic 1: Core Controls and Contract Foundation

Deliver stable, production-ready foundational controls and consistent contracts so product teams can build interactive UI without custom rework.

### Story 1.1: Core Contract and Export Baseline

As a consumer-team developer,
I want core controls to expose a consistent public contract and entrypoint exports,
So that I can integrate toolkit components predictably across company projects.

**Acceptance Criteria:**

**Given** the existing core control components are present
**When** I inspect their public props and export surface
**Then** each core control has documented and typed contract fields aligned to the shared API policy (or documented exception)
**And** each core control is exported from `src/components/index.ts`.

**Given** contract behavior is part of release quality gates
**When** contract verification checks are run
**Then** failing export/contract mismatches are detectable before release
**And** results are reported in a way that blocks non-compliant changes.

**Given** this epic must preserve compatibility
**When** contract adjustments are introduced
**Then** existing public API behavior remains backward compatible unless explicitly approved
**And** any approved exception is documented.

### Story 1.2: Core Control State Parity Completion

As a product-team developer,
I want the existing core controls to implement all required state variants,
So that users get consistent behavior and visuals across company applications.

**Acceptance Criteria:**

**Given** the core controls in scope are `UiButton`, `UiInput`, `UiCheckbox`, and `UiLink`
**When** state behavior is reviewed against the PRD and board requirements
**Then** each control supports required states for its role (rest, hover, active, disabled, plus error where applicable)
**And** state behavior is consistent with canonical `crm` behavior where equivalent.

**Given** visual/interaction parity can drift during implementation
**When** updates are delivered for these controls
**Then** state semantics remain backward compatible for existing consumers
**And** any unavoidable deviation is explicitly documented with rationale.

**Given** this story must be independently verifiable
**When** QA validation is executed for this story
**Then** required state coverage is demonstrable for all four controls
**And** unresolved parity gaps are tracked as blocking issues for this epic.

### Story 1.3: Accessibility and Interaction Consistency Hardening

As an end user,
I want core controls to behave consistently for keyboard and disabled/error interactions,
So that I can use company products reliably and accessibly.

**Acceptance Criteria:**

**Given** core controls are used in keyboard and assistive-technology flows
**When** I navigate and interact without a mouse
**Then** focus behavior is visible and consistent across controls
**And** keyboard interactions follow expected patterns for each control type.

**Given** controls can be set to disabled or error states
**When** those states are active
**Then** interaction behavior is predictable and non-conflicting
**And** disabled/error semantics are consistently represented in component behavior and styling.

**Given** accessibility is part of release quality gates
**When** Epic 1 accessibility checks are executed
**Then** core interaction and accessibility requirements are validated for all four controls
**And** any failures are treated as blocking issues for Epic 1 completion.

### Story 1.4: Epic 1 Quality Gate Closure

As a release owner,
I want Storybook coverage and unit-test validation finalized for Epic 1 controls,
So that this foundation can be confidently consumed by company projects.

**Acceptance Criteria:**

**Given** Epic 1 controls are implemented and updated
**When** I review Storybook coverage for these controls
**Then** each control has stories that represent required states and core usage
**And** story artifacts are ready for board-parity and interaction review.

**Given** Epic 1 quality requires test-backed behavior
**When** unit tests are executed for Epic 1 controls
**Then** render and critical interaction behavior are validated
**And** failing tests block Epic 1 completion.

**Given** release readiness depends on contract and export integrity
**When** Epic 1 checks are run end-to-end
**Then** export surface, state coverage, and quality evidence are complete for Epic 1
**And** Epic 1 is marked ready to enable subsequent epics without unresolved blockers.

**Given** Epic 1 closure requires traceable completion evidence
**When** Epic 1 is finalized
**Then** a Definition of Done artifact and test/story/export evidence references are captured in implementation artifacts
**And** those references are available for Epic 5 governance validation.

## Epic 2: Selection, Search, and Input Workflows

Enable users to search, select, and submit values through reusable input-selection components that support company app workflows.

### Story 2.1: Search and Select Foundation

As a product-team user,
I want search-capable input and select controls,
So that I can quickly find and choose values in complex forms.

**Acceptance Criteria:**

**Given** search/select workflows are required across company apps
**When** I use `ui-search-input` and `ui-select-with-search`
**Then** I can input search text and receive appropriate selectable options behavior
**And** controls support shared API contract fields where relevant (`value`, `onChange`, `disabled`, `error`, `size`, `variant`, `sx`).

**Given** canonical behavior must align with `crm` where equivalent
**When** these components are implemented
**Then** behavior patterns follow reuse/canonical governance rules
**And** visual/variant gaps are filled without violating canonical behavior.

**Given** these components are foundational for later stories in this epic
**When** Story 2.1 is complete
**Then** it is independently usable and testable
**And** subsequent Epic 2 stories can build on it without requiring future-story dependencies.

### Story 2.2: Multi-Select Interaction Workflow

As a product-team user,
I want to select multiple values and manage selected chips clearly,
So that I can complete multi-value form tasks efficiently.

**Acceptance Criteria:**

**Given** multi-value selection is required in board workflows
**When** I interact with `ui-multi-select`
**Then** I can select multiple options and see clear selected-chip/tag representations
**And** I can remove or update selections through consistent interaction patterns.

**Given** this component must remain contract-consistent
**When** `ui-multi-select` is used in forms
**Then** it supports shared contract expectations where relevant (`value`, `onChange`, `disabled`, `error`, `size`, `variant`, `sx`)
**And** any contract exceptions are explicitly documented.

**Given** quality and usability are mandatory
**When** disabled or error states are applied
**Then** interactions are correctly constrained and visually clear
**And** behavior remains independently testable as a standalone story outcome.

### Story 2.3: Calendar Multi-Select Variant

As a product-team user,
I want a calendar-style multi-select control,
So that I can choose date-based values with a UI pattern consistent with toolkit standards.

**Acceptance Criteria:**

**Given** date-oriented multi-selection is required in board scope
**When** I use `ui-calendar-multi-select`
**Then** I can select and manage date-oriented values using a calendar-style interaction
**And** the component behavior is consistent with shared selection-control semantics.

**Given** this story extends selection capabilities from earlier stories
**When** Story 2.3 is implemented
**Then** it reuses established contract and interaction patterns from Epic 2 where relevant
**And** it does not introduce dependencies on future stories in this epic.

**Given** accessibility and quality gates apply to all interactive controls
**When** this component is validated
**Then** keyboard/disabled/error behavior is consistent and testable
**And** component behavior is documented with Storybook scenarios and unit-test coverage expectations.

### Story 2.4: Radio Group Input Workflow

As a product-team user,
I want a reusable radio-group control,
So that I can complete single-choice tasks consistently across apps.

**Acceptance Criteria:**

**Given** board scope includes single-choice radio interactions
**When** I use `ui-radio-group`
**Then** I can select one option with clear focus and selection-state behavior
**And** interaction behavior is consistent with toolkit control patterns.

**Given** this control is used in form contexts
**When** disabled/error and callback behaviors are exercised
**Then** `ui-radio-group` follows shared contract expectations where relevant
**And** any component-specific contract exceptions are documented.

**Given** this story should remain independently completable
**When** Story 2.4 is delivered
**Then** `ui-radio-group` is usable and verifiable without relying on future Epic 2 stories
**And** quality expectations for Storybook scenarios and unit validation are defined.

### Story 2.4A: File Upload Input Workflows

As a product-team user,
I want a reusable file-upload input control,
So that I can complete file-submission tasks consistently across apps.

**Acceptance Criteria:**

**Given** board scope includes file-upload interactions
**When** I use `ui-file-upload-input`
**Then** async upload states (`idle`, `uploading`, `success`, `error`) are represented clearly
**And** progress reporting is available for long-running uploads.

**Given** upload inputs must handle validation and failure paths
**When** files violate type/size rules or upload requests fail
**Then** validation and upload error states are surfaced with actionable messages
**And** file type/size constraints are testable and documented.

**Given** drag-and-drop and keyboard/assistive-technology access are required
**When** files are provided via drag-and-drop or non-pointer interaction
**Then** the component supports drag-and-drop behaviors and keyboard-operable upload actions
**And** screen-reader announcements communicate selection/progress/error outcomes.

**Given** this story should remain independently completable
**When** Story 2.4A is delivered
**Then** Storybook scenarios cover async, progress, validation, error, and drag-and-drop cases
**And** unit tests validate render plus core upload interaction behavior.

### Story 2.5: Pagination Workflow Component Delivery

As a product-team user,
I want a reusable pagination control,
So that I can navigate long result sets with consistent toolkit behavior.

**Acceptance Criteria:**

**Given** board scope requires paginated list navigation
**When** I use `ui-pagination`
**Then** I can navigate pages with clear current/next/previous semantics
**And** component interactions follow shared contract expectations where relevant.

**Given** this component must be reusable across company apps
**When** `ui-pagination` is delivered
**Then** Storybook scenarios document key states and usage patterns
**And** unit tests validate render and core interaction behavior.

**Given** Epic 2 outcomes require export and governance traceability
**When** Story 2.5 is complete
**Then** `ui-pagination` is exported from `src/components/index.ts`
**And** provenance/source decisions are recorded using the shared Definition of Done checklist at `specs/implementation-artifacts/story-dod-template.md` (source, reuse rationale, and reference IDs in PR/issue metadata).

### Story 2.6: Epic 2 Quality Gate Closure

As a release owner,
I want Epic 2 components to pass contract, coverage, and quality gates,
So that selection and input workflows are safe for production adoption.

**Acceptance Criteria:**

**Given** Epic 2 components are implemented (`ui-search-input`, `ui-select-with-search`, `ui-multi-select`, `ui-calendar-multi-select`, `ui-radio-group`, `ui-file-upload-input`, `ui-pagination`)
**When** release-quality checks are executed
**Then** each component has Storybook coverage for relevant states and usage flows
**And** each component has unit-test validation for render and core interactions.

**Given** export and contract consistency are required
**When** Epic 2 deliverables are reviewed
**Then** Epic 2 components are correctly exported from toolkit entrypoint
**And** contract consistency and documented exceptions are complete.

**Given** Epic 2 must satisfy the Story 1.3 accessibility baseline and NFR3
**When** Epic 2 accessibility checks are executed
**Then** keyboard navigation (`Tab`/`Shift+Tab`), logical focus order, visible focus indicators, keyboard-operable controls, and disabled/error behavior are validated across Epic 2 components
**And** accessibility failures are treated as blocking issues for Epic 2 completion.

**Given** Epic 2 must enable future epics cleanly
**When** Epic 2 is marked complete
**Then** no unresolved blocking issues remain for downstream epics
**And** evidence for FR7/FR8 coverage is captured for this epic.

**Given** Epic 2 closure requires traceable completion evidence
**When** Epic 2 is finalized
**Then** a Definition of Done artifact and test/story/export evidence references are captured in implementation artifacts
**And** those references are available for Epic 5 governance validation.

## Epic 3: Data Presentation and Cards

Enable users to understand and act on structured information via reusable item rows, lists, and card patterns.

### Story 3.1: Item Row and List Data Presentation

As a product-team user,
I want reusable item-row and list components for structured data,
So that I can view and act on list-based records consistently.

**Acceptance Criteria:**

**Given** board requirements include row/list data presentation patterns
**When** I use `ui-item-row` and `ui-items-list`
**Then** rows and list containers render structured data with clear semantics
**And** state and interaction behavior remains consistent with toolkit conventions.

**Given** method/status semantics are part of required board behavior
**When** row variants are displayed
**Then** method/status visual distinctions are supported
**And** row interaction patterns are predictable and testable.

**Given** this story must be independently completable
**When** Story 3.1 is delivered
**Then** `ui-item-row` and `ui-items-list` are usable without future-story dependencies
**And** component contracts and usage examples are ready for downstream card stories.

### Story 3.2: Task Card Workflow

As a product-team user,
I want a reusable task/person card component,
So that I can view card-based information with consistent interaction states.

**Acceptance Criteria:**

**Given** card-based task/person presentation is required
**When** I use `ui-task-card`
**Then** key card content and state behavior are supported consistently with board expectations
**And** interaction semantics are clear for rest/active/disabled usage contexts.

**Given** this component is part of a reusable library
**When** `ui-task-card` is integrated in consuming applications
**Then** its API aligns with shared toolkit contract principles where relevant
**And** contract exceptions are documented when needed.

**Given** Epic 3 stories must remain sequential and independent
**When** Story 3.2 is completed
**Then** `ui-task-card` is independently usable and testable
**And** no future-story dependency is required for core behavior.

### Story 3.3: Profile Select Card Workflow

As a product-team user,
I want a profile-select card with menu interactions,
So that I can choose profile-related options through a consistent card UI pattern.

**Acceptance Criteria:**

**Given** profile card selection/menu behavior is required by board scope
**When** I use `ui-profile-select-card`
**Then** profile information and selection/menu interaction states are supported
**And** behavior is consistent with established card and control patterns.

**Given** this card may include selectable and dropdown-like interactions
**When** interaction states are exercised
**Then** the component handles active/disabled/error-relevant behavior predictably
**And** callback and contract behavior is clearly defined.

**Given** this story must stand on its own
**When** Story 3.3 is complete
**Then** `ui-profile-select-card` is independently usable and testable
**And** it does not depend on any future Epic 3 story to function.

### Story 3.4: Integration Card Workflow

As a product-team user,
I want an integration/brand selection card component,
So that I can select integration options through a consistent card interaction model.

**Acceptance Criteria:**

**Given** integration/brand card selection is required by board scope
**When** I use `ui-integration-card`
**Then** selection behavior and state feedback are clear and consistent
**And** card behavior aligns with toolkit interaction and contract standards.

**Given** this component is used in configurable selection flows
**When** selected/unselected and disabled states are exercised
**Then** state transitions are predictable and testable
**And** callback semantics are well-defined for consuming applications.

**Given** this story must be independently completable
**When** Story 3.4 is delivered
**Then** `ui-integration-card` is usable and testable without future-story dependency
**And** its behavior is ready for inclusion in Epic 3 quality closure.

### Story 3.5: Board A Micro-Components Delivery

As a product-team developer,
I want reusable micro-components from Board A,
So that I can compose common interaction patterns without custom one-off implementations.

**Acceptance Criteria:**

**Given** Board A requires multiple supporting micro-components
**When** Epic 3 micro-components are delivered
**Then** the following reusable components exist with defined contracts and interaction behavior:
`ui-filter-chip`, `ui-pin-input`, `ui-payment-option-card`, `ui-action-icon-bar`, `ui-status-badge`, `ui-notification-badge`
**And** each component follows shared styling/contract conventions where relevant.

**Given** these micro-components are often used compositionally
**When** they are integrated in consuming UIs
**Then** they behave consistently and predictably with disabled/error/state semantics where applicable
**And** documented exceptions are captured where shared contract fields are not applicable.

**Given** this story should remain independently completable
**When** Story 3.5 is complete
**Then** each listed micro-component is individually usable and testable
**And** no future Epic 3 story is required for baseline functionality.

### Story 3.6: Epic 3 Quality Gate Closure

As a release owner,
I want all Epic 3 components to meet export, test, and Storybook quality requirements,
So that data-presentation and card workflows are production-ready for company adoption.

**Acceptance Criteria:**

**Given** Epic 3 components are implemented (`ui-item-row`, `ui-items-list`, `ui-task-card`, `ui-profile-select-card`, `ui-integration-card`, `ui-filter-chip`, `ui-pin-input`, `ui-payment-option-card`, `ui-action-icon-bar`, `ui-status-badge`, `ui-notification-badge`)
**When** Epic 3 quality validation is executed
**Then** each component has Storybook coverage for required usage and state behavior
**And** each component has unit-test validation for render and core interactions.

**Given** public API integrity is mandatory
**When** Epic 3 output is reviewed
**Then** all Epic 3 components are exported correctly from toolkit entrypoint
**And** contract consistency plus documented exceptions are complete.

**Given** Epic 3 must satisfy the Story 1.3 accessibility baseline and NFR3
**When** Epic 3 accessibility checks are executed
**Then** keyboard navigation (`Tab`/`Shift+Tab`), logical focus order, visible focus indicators, keyboard-operable controls, and disabled/error behavior are validated across Epic 3 components
**And** accessibility failures are treated as blocking issues for Epic 3 completion.

**Given** Epic 3 should enable subsequent epics cleanly
**When** Epic 3 is marked complete
**Then** there are no unresolved blockers for downstream epic execution
**And** FR7/FR8 quality evidence for Epic 3 is captured and traceable.

**Given** Epic 3 closure requires traceable completion evidence
**When** Epic 3 is finalized
**Then** a Definition of Done artifact and test/story/export evidence references are captured in implementation artifacts
**And** those references are available for Epic 5 governance validation.

## Epic 4: Skeleton Loading Experience Parity

Provide trusted loading experiences by delivering skeleton primitives and composed variants with exact CRM animation parity.

### Story 4.1: CRM Skeleton Baseline and Provenance Lock

As a release owner,
I want the toolkit skeleton foundation to be sourced from CRM baseline,
So that loading experiences remain behaviorally consistent across company products.

**Acceptance Criteria:**

**Given** skeleton parity is a release blocker
**When** skeleton implementation work starts
**Then** CRM skeleton source is identified and reused as baseline
**And** provenance/source details are recorded with the shared Definition of Done checklist at `specs/implementation-artifacts/story-dod-template.md` (source, reuse rationale, and reference IDs in PR/issue metadata).

**Given** canonical animation behavior is mandatory
**When** baseline skeleton code is integrated
**Then** key animation characteristics (timing/easing/keyframe behavior) are preserved
**And** no redesign of animation behavior is introduced in this story.

**Given** this story must be independently completable
**When** Story 4.1 is complete
**Then** a verified baseline exists for further skeleton variant/composition stories
**And** no future-story dependency is required to validate baseline provenance/parity setup.

### Story 4.2: Skeleton Primitive Variants

As an end user,
I want consistent primitive loading placeholders,
So that content-loading states are understandable and visually stable.

**Acceptance Criteria:**

**Given** primitive skeleton variants are required by board scope
**When** `ui-skeleton` primitive variants are implemented
**Then** required primitive patterns are available (`image`, `text one-line`, `text many-lines`, `block`)
**And** variant APIs and behavior are consistent with toolkit component standards.

**Given** animation parity is mandatory
**When** primitive variants render loading states
**Then** they use the established CRM-derived animation system
**And** no variant introduces incompatible animation behavior.

**Given** this story must be independently completable
**When** Story 4.2 is finished
**Then** primitive skeleton variants are usable/testable on their own
**And** they provide a stable base for composed skeleton layouts without future-story dependency.

### Story 4.3: Composed Skeleton Layout Variants

As an end user,
I want realistic composed loading layouts,
So that complex screens communicate structure while data is loading.

**Acceptance Criteria:**

**Given** board scope includes composed skeleton layouts
**When** composed skeleton variants are implemented
**Then** required composed patterns are available (widget small/medium, menu, tab bar, button, list, input, checkbox+text, radio+text, table)
**And** composed variants are built from primitive skeleton foundations with consistent behavior.

**Given** animation and interaction consistency are required
**When** composed variants are rendered
**Then** they preserve CRM-aligned animation behavior inherited from baseline/primitives
**And** no composed variant introduces conflicting animation or state semantics.

**Given** this story should be independently completable
**When** Story 4.3 is delivered
**Then** composed skeleton variants are independently usable/testable
**And** completion does not require any future Epic 4 story to enable their baseline functionality.

### Story 4.4: Skeleton Parity and Quality Gate Closure

As a release owner,
I want full skeleton parity and quality evidence validated,
So that loading-state components are safe for production adoption.

**Acceptance Criteria:**

**Given** Epic 4 baseline, primitive, and composed variants are implemented
**When** parity validation is executed
**Then** CRM alignment for skeleton animation behavior is verified for the delivered scope
**And** any parity deviation is treated as a blocking issue for Epic 4 completion.

**Given** release-quality requirements apply to skeleton components
**When** Epic 4 quality checks are run
**Then** skeleton components have Storybook coverage for relevant variants
**And** unit-test validation exists for render and key behavior expectations.

**Given** provenance and export integrity are required for release readiness
**When** Epic 4 is reviewed for completion
**Then** source provenance is documented, `ui-skeleton` (primitive + composed) delivery artifacts are recorded with origin details, and export surface is complete
**And** Epic 4 exits with traceable FR5/FR6/FR8 evidence and no unresolved blockers.

**Given** Epic 5 governance reporting consolidates FR evidence across epics
**When** Story 4.4 closure artifacts are finalized
**Then** the provenance/export checklist and traceability matrix include explicit links to the delivered `ui-skeleton` artifact and its source
**And** those links are ready for direct consolidation in subsequent Epic 5 governance validation/reporting.

**Given** Epic 4 closure requires traceable completion evidence
**When** Epic 4 is finalized
**Then** a Definition of Done artifact and test/story/export/parity evidence references are captured in implementation artifacts
**And** those references are available for Epic 5 governance validation.

## Epic 5: Production Adoption Readiness

Make the toolkit safely adoptable across company projects by closing coverage, provenance, export, and release-gate governance.

**Cross-Epic Dependency Note:** Epic 5 validates and consolidates outputs from Epics 1-4. It does not block execution start of Epics 1-4.

### Story 5.1: Board Coverage Closure and Traceability

As a release owner,
I want board-to-component coverage fully tracked and closed,
So that no required UI scope is omitted before production adoption.

**Acceptance Criteria:**

**Given** all boards define required component and state scope
**When** coverage mapping is finalized
**Then** each required board element is mapped to a delivered component or documented non-goal
**And** unresolved items are visible and treated as blockers.

**Given** traceability is required for implementation confidence
**When** coverage documentation is reviewed
**Then** mappings are clear enough to verify completion objectively
**And** board-level completion status is explicit and auditable.

**Given** this story must be independently completable
**When** Story 5.1 is done
**Then** board coverage status is complete and actionable
**And** downstream readiness stories do not depend on future untracked scope decisions.

### Story 5.2: Reuse/Canonical Compliance and Provenance Completion

As a release owner,
I want source provenance and canonical behavior compliance documented for all delivered components,
So that company teams can trust consistency with CRM/website governance rules.

**Acceptance Criteria:**

**Given** reuse-first and canonical policies are mandatory
**When** provenance documentation is completed
**Then** each delivered/enhanced component is marked with `source` (`crm`, `website`, `new`) and rationale
**And** canonical behavior alignment decisions are clearly documented using the shared Definition of Done checklist at `specs/implementation-artifacts/story-dod-template.md` (source, reuse rationale, and reference IDs in PR/issue metadata).

**Given** deviations may be necessary in limited cases
**When** a component diverges from canonical expectations
**Then** the deviation is explicitly justified and recorded
**And** the decision is visible for release review.

**Given** this story must be independently completable
**When** Story 5.2 is complete
**Then** provenance/compliance artifacts are production-review ready
**And** future stories do not need to redefine component source governance.

### Story 5.3: Export Contract and Entry Point Integrity

As a consumer-team developer,
I want all delivered components to be correctly exported from the toolkit entry point,
So that application teams can adopt components without import-surface inconsistencies.

**Acceptance Criteria:**

**Given** delivered components must be publicly consumable
**When** export integrity checks are executed
**Then** all in-scope components are available from `src/components/index.ts`
**And** missing or broken exports are treated as blocking issues.

**Given** API contract consistency is required for adoption
**When** export and contract verification is reviewed
**Then** exported components align with expected public contract definitions
**And** contract exceptions are documented and traceable.

**Given** this story must be independently completable
**When** Story 5.3 is complete
**Then** entrypoint/export integrity evidence is ready for release review
**And** no future Epic 5 story is needed to establish export correctness baseline.

### Story 5.4: Internal Release-Readiness Governance Report

As a release owner,
I want a consolidated readiness report covering coverage, provenance, quality, and compatibility checks,
So that internal package publication is a controlled and auditable decision.

**Acceptance Criteria:**

**Given** release depends on multiple governance gates
**When** release-readiness evidence is consolidated
**Then** board coverage closure, provenance compliance, export integrity, and quality-gate status are summarized in one report
**And** blocking vs non-blocking issues are explicitly identified.

**Given** internal consumers rely on predictable compatibility
**When** readiness is finalized
**Then** compatibility expectations for internal consumers are documented (consumer scope, baseline runtime/dependency constraints)
**And** release-go/no-go decision criteria are explicit.

**Given** public npm publication requires licensing/IP clearance
**When** pre-publish compliance checks are executed in CI
**Then** a valid `LICENSE` file and SPDX identifier are present, automated OSS license/IP scanning reports no critical findings, and repository checks confirm no proprietary code, internal-only URLs, or secrets are exposed
**And** Legal/OSS Compliance sign-off is recorded before public npm promotion, with release pipeline failure enforced if any licensing/IP gate check fails.

**Given** this is the final Epic 5 story
**When** Story 5.4 is completed
**Then** Epic 5 can be marked complete with traceable evidence for FR1/FR2/FR3/FR8 and consolidated traceability references for FR4/FR5/FR6/FR7 delivered in Epics 1-4
**And** the Release Manager performs a checklist-driven final validation review across epic and implementation artifacts.

**Given** final governance sign-off requires auditable closure
**When** the Release Manager and Governance Board (see Governance Roles) complete final validation
**Then** the canonical output artifact is a signed `specs/implementation-artifacts/final-validation-certificate.md` containing sign-off fields (`reviewer`, `date`, `decision`, `blocking-issues`, `follow-ups`) plus linked Definition of Done evidence references
**And** if `specs/planning-artifacts/epics.md` is additionally annotated, the annotation must include a canonical pointer to `specs/implementation-artifacts/final-validation-certificate.md` plus `certificate-version` and `certificate-timestamp` metadata
**And** the canonical certificate is stored under `specs/implementation-artifacts/` before Epic 5 can be marked complete and release go/no-go is approved.
