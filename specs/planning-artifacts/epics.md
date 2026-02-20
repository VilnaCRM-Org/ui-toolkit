---
stepsCompleted:
  - 1
  - 2
inputDocuments:
  - specs/planning-artifacts/prd.md
  - specs/planning-artifacts/architecture.md
workflowType: 'epics-and-stories'
project_name: 'ui-toolkit'
user_name: 'Dima'
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
FR5: Deliver missing reusable modules: `UiPagination`, `UiSearchInput`, `UiSelectWithSearch`, `UiMultiSelect`, `UiCalendarMultiSelect`, `UiRadioGroup`, `UiFileUploadInput`, `UiItemRow`, `UiItemsList`, `UiTaskCard`, `UiProfileSelectCard`, `UiIntegrationCard`, `UiFilterChip`, `UiPinInput`, `UiPaymentOptionCard`, `UiActionIconBar`, `UiStatusBadge`, `UiNotificationBadge`, `UiSkeleton` (primitives + composed variants).
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
- Distribution path is internal npm package registry with semver-governed releases.
- CI publish gating depends on contract checklist completion (exports, state matrix, accessibility checks, Storybook/tests).
- PRD, architecture, and implementation constraints must remain aligned with `crm` canonical behavior policy.

### FR Coverage Map

FR1: Epic 5 - Production Adoption Readiness ensures complete board-to-component coverage tracking and closure.
FR2: Epic 5 - Production Adoption Readiness enforces reuse-first provenance and source-governance compliance.
FR3: Epic 5 - Production Adoption Readiness verifies canonical behavior alignment to `crm`.
FR4: Epic 1 - Core Controls and Contract Foundation delivers required state parity for existing controls.
FR5: Epic 2, Epic 3, Epic 4 - Missing module delivery is split by user workflow domain (input/select, data/cards, skeletons).
FR6: Epic 4 - Skeleton Loading Experience Parity delivers CRM baseline reuse and animation parity.
FR7: Epic 1, Epic 2, Epic 3 - Unified API contract is applied across foundational and new interactive components.
FR8: Epic 1, Epic 2, Epic 3, Epic 4, Epic 5 - Quality gates are enforced across all delivery domains and release readiness.

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
**FRs covered:** FR1, FR2, FR3, FR8
