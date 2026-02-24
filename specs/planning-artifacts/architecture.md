---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - specs/planning-artifacts/prd.md
  - specs/planning-artifacts/implementation-plan.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-20T18:15:15+02:00'
project_name: 'ui-toolkit'
user_name: 'platform-team'
date: '2026-02-20T15:10:14+02:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The PRD defines 8 functional requirement groups that drive architecture:

- FR-01 Board Coverage Completeness: every board element must map to a delivered component/enhancement and be tracked by checklist.
- FR-02 Reuse-First Compliance: implementations must prioritize existing assets from `crm` and `website`.
- FR-03 Canonical Behavior Alignment: behavior must align to `crm`; `website` is for visual/variant gap-fill.
- FR-04 State Parity for Existing Controls: `UiButton`, `UiInput`, `UiCheckbox`, `UiLink` must satisfy required state matrices.
- FR-05 Missing Module Delivery: broad module set including form controls, cards, micro-components, and skeleton suite.
- FR-06 Skeleton Parity: CRM skeleton baseline and exact animation parity are mandatory and release-blocking.
- FR-07 API Contract Consistency: unified prop model with documented exceptions.
- FR-08 Quality Gates: Storybook + unit tests + TS strict + export completeness.

Architecturally, this means we need a consistent component contract model, source provenance tracking, and enforcement mechanisms for parity and export completeness.

**Non-Functional Requirements:**
Key non-functional drivers from PRD and constraints:

- Backward compatibility for existing public APIs unless explicitly approved.
- Naming consistency under `Ui*` conventions.
- Keyboard accessibility and consistent disabled behavior across interactive controls.
- Maintainability/composability for future expansion.
- Release exit criteria requiring complete board coverage, test/story/documentation completeness, TS health, and skeleton parity verification.

**Scale & Complexity:**
This is a large-surface frontend architecture effort with strict consistency controls.

- Primary domain: web frontend component toolkit
- Complexity level: high
- Estimated architectural components: ~24 (new modules, existing parity updates, and shared governance/verification mechanisms)

Complexity drivers include breadth of UI patterns, strict cross-repo reuse policy, and release-blocking parity requirements. Complexity is reduced by the explicit UI-only boundary (no backend/data ownership).

### Technical Constraints & Dependencies

- UI-layer boundary only: no backend integration ownership, no domain business logic.
- Reuse-first dependency on existing implementations in `crm` and `website`.
- Canonical source rule: `crm` behavior first; `website` fills visual/variant gaps.
- Skeleton dependency: CRM skeleton source is required baseline with exact animation parity.
- Tooling baseline from implementation context: React 18, TypeScript strict mode, MUI v5, Storybook 8, Jest + Testing Library.
- Single-release boundary for all board coverage increases need for strict definition-of-done and traceability.

### Cross-Cutting Concerns Identified

- API contract governance across all modules and state variants.
- Source provenance and drift control between toolkit and upstream `crm`/`website`.
- Uniform state semantics (rest/hover/active/disabled/error) across component families.
- Accessibility consistency (keyboard interaction, disabled semantics).
- Verification strategy standardization (unit tests, parity checks, export contract checks, Storybook coverage).
- Release traceability via board-to-component coverage checklist and explicit exit criteria.

## Starter Template Evaluation

### Primary Technology Domain

Web frontend component library within an existing React + TypeScript workspace.

### Starter Options Considered

1. Existing repository baseline (no re-bootstrap)
- Best fit for current project state and minimizes migration risk.
- Preserves current contracts, test suites, Storybook setup, and release cadence.

2. `create-tsdown` React starter (greenfield library-first)
- Good option for a brand-new component library.
- Modern library bundling defaults and templates.
- Not selected due to migration overhead for this already-established codebase.

3. `create-next-app` + `create-storybook` (greenfield app-first)
- Strong for new app-oriented projects with Storybook added.
- Not selected because this workstream is toolkit completion, not app bootstrap.

### Selected Starter: Existing Repository Baseline (No Re-bootstrap)

**Rationale for Selection:**
Current architecture already matches project constraints and quality gates. Rebootstrapping would add unnecessary churn without improving delivery of board coverage, parity, and reuse-first goals.

**Initialization Command:**

```bash
pnpm install
pnpm run storybook-start
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript strict mode, React 18, Node 20+ baseline.

**Styling Solution:**
MUI v5 + Emotion-based component styling model.

**Build Tooling:**
Existing Next.js-oriented build/export pipeline already integrated in repository scripts.

**Testing Framework:**
Jest + Testing Library for unit tests; Playwright for E2E/visual checks.

**Code Organization:**
`src/components` module structure with central export management and Storybook stories per component.

**Development Experience:**
Established lint/test/storybook command surface and team-familiar workflows.

**Note:** No new starter generation story is needed. First implementation story should begin directly with component-source reuse mapping (`crm` then `website`) and coverage checklist enforcement.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data Architecture: no persistent data layer; UI-library-only runtime model.
- API & Communication: props + callbacks only for component contracts.
- Distribution Model: internal npm registry as the single official consumption path.
- Security/Auth Scope: UI-library scoped only; no auth system architecture in this project.
- Contract Enforcement: mandatory per-component checklist (exports, state matrix, accessibility, Storybook/tests, provenance note).

**Important Decisions (Shape Architecture):**
- Reuse governance from PRD remains active: `crm` canonical behavior, `website` visual/variant gap-fill.
- Existing repository baseline retained (no re-bootstrap).

**Deferred Decisions (Post-MVP):**
- Any adapter/hook integration abstractions for app-specific backend coupling.
- Any internal metadata service beyond file-based governance artifacts.

### Data Architecture

- Decision: No persistent data layer.
- Version/Technology: N/A (no DB, migrations, or caching tier).
- Rationale: Aligns with UI-only library boundary and avoids non-essential infrastructure.
- Affects: component props contracts, Storybook fixtures, unit test fixtures.
- Provided by Starter: Aligned with current frontend-only baseline.

### Authentication & Security

- Decision: Security/auth considerations limited to UI-library surface.
- Scope Includes:
  - Safe prop handling and rendering behavior.
  - Accessibility and interaction safety (disabled/focus/keyboard consistency).
  - Consumer-facing API clarity to prevent misuse.
- Scope Excludes:
  - Identity provider design.
  - Token/session lifecycle.
  - Backend authorization models.
- Rationale: Keeps architecture aligned to product outcome and prevents scope creep.

### API & Communication Patterns

- Decision: Props + callbacks only.
- Pattern:
  - Controlled/uncontrolled component interfaces where relevant.
  - Standard callback surfaces such as `onChange`, `onClick`, selection events.
  - No event-bus or global context orchestration as a default library pattern.
- Evidence:
  - Existing components already follow this model (`UiInput`, `UiButton`, `UiCheckbox`, `UiTextFieldForm`).
- Rationale: Consistency with current codebase and predictable integration for internal consumers.

### Frontend Architecture

- Decision Set:
  - Keep existing React + TypeScript strict + MUI-based architecture baseline.
  - Enforce unified component contract policy from PRD.
  - Maintain module-first organization under `src/components`.
- Quality Architecture:
  - Storybook and unit test coverage required for each new/enhanced component.
  - Export surface managed centrally in `src/components/index.ts`.
- Rationale: Maximizes delivery speed while preserving consistency and maintainability.

### Infrastructure & Deployment

- Decision: Internal npm package registry for distribution.
- Release Policy Direction:
  - Semver-managed versioning.
  - CI publish gate on contract checklist completion.
  - Consumer compatibility policy for internal projects (`crm`, `website`, others).
- Rationale: Standardized consumption path, clear upgrade flow, and governance-ready distribution.

### Decision Impact Analysis

**Implementation Sequence:**
1. Define and enforce contract checklist as definition-of-done.
2. Implement/upgrade components using reuse-first policy.
3. Validate state matrix, tests, stories, exports per component.
4. Package and publish through internal registry with versioned release gates.

**Cross-Component Dependencies:**
- Contract checklist influences every component implementation and release eligibility.
- API communication model constrains prop design across all modules.
- Distribution model constrains versioning, changelog discipline, and CI release behavior.
- UI-only data/security scope keeps architecture focused and reduces accidental backend coupling.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
5 major areas where AI agents could diverge: naming, prop contracts, file placement, state/error semantics, and provenance tracking.

### Naming Patterns

**Code Naming Conventions:**
- Component folders/files use kebab-case.
- Component exported symbol names remain `UiPascalCase`.
- Variables/functions use camelCase.
- Type/interface names use PascalCase.

**Examples:**
- Folder: `src/components/ui-button/`
- File: `src/components/ui-button/index.tsx`
- Export: `export default function UiButton(...)`

**Transition Rule (Required due to current repo state):**
- Existing `UiPascalCase` folders remain valid until migration tasks are explicitly planned.
- New components follow kebab-case from this point forward.
- Do not rename legacy folders opportunistically inside feature tasks.

### Structure Patterns

**Project Organization:**
- Components remain module-first under `src/components`.
- Stories are co-located with component implementation files.
- Unit tests remain centralized in `src/test/testing-library`.
- Public exports remain centralized in `src/components/index.ts`.

**File Structure Patterns (per new component):**
- `src/components/<kebab-name>/index.tsx`
- `src/components/<kebab-name>/types.ts`
- `src/components/<kebab-name>/<Name>.stories.tsx`
- `src/test/testing-library/<Name>.test.tsx`

### Format Patterns

**Public Component Contract:**
- Shared base props for interactive components where relevant:
  - `value`
  - `onChange`
  - `disabled`
  - `error`
  - `size`
  - `variant`
  - `sx`
- Exceptions must be documented in component-level notes and reflected in stories/tests.

**Data Exchange Formats:**
- Props/events use TypeScript-typed shapes.
- Event callback payloads should favor native React event signatures unless a value-first API is explicitly chosen and documented.
- No backend transport payload formats are defined in this library architecture.

### Communication Patterns

**Component Communication:**
- Props + callbacks only.
- No global event bus pattern in library architecture.
- No hidden cross-component side effects through shared mutable state.

**State Management Pattern:**
- Components are async-stateless.
- Consumer applications own loading, retry, and async error flows.
- Library exposes visual/control props (`loading`, `error`, `disabled`) when needed.

### Process Patterns

**Error Handling Patterns:**
- Library components render deterministic error visuals from props.
- No internal domain error mapping logic.
- Accessibility and disabled behavior consistency are mandatory across components.

**Loading State Patterns:**
- Loading UI is visual-only and externally driven by consumers.
- Components must not start network calls or retry loops internally.

### Provenance & Governance Patterns

**Source Provenance Tracking:**
- Maintain a central registry:
  - `specs/planning-artifacts/component-provenance.md`
- For each component, record:
  - `source`: `crm` | `website` | `new`
  - rationale
  - notes on behavior/visual alignment decisions

**Contract Enforcement Checklist (Mandatory per component):**
- Export present in `src/components/index.ts`
- Required state matrix covered
- Accessibility baseline checks included
- Storybook coverage present
- Unit tests present in `src/test/testing-library`
- Provenance entry exists in central registry

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow naming and structure patterns exactly for new components.
- Apply shared prop contract policy and document exceptions.
- Complete contract checklist before considering a component done.
- Update provenance registry for each delivered/enhanced component.

**Pattern Enforcement:**
- Enforce via PR checklist + CI gates (tests/type checks/export checks).
- Pattern violations are documented in the relevant implementation artifact and corrected before release tagging.

### Pattern Examples

**Good Examples:**
- New component created under kebab-case path with co-located story and centralized test.
- Component exposes standardized `disabled/error/variant/size/sx` and documents any exception.
- Provenance updated with `crm` canonical behavior and `website` visual gap-fill note.

**Anti-Patterns:**
- Introducing a global event bus for component interactions.
- Embedding async fetch/retry in library UI components.
- Shipping component changes without export update, checklist completion, or provenance entry.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
ui-toolkit/
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.paths.json
├── jest.config.ts
├── playwright.config.ts
├── build.config.mjs
├── .eslintrc.js
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── .github/
│   └── workflows/
│       ├── static-testing.yml
│       ├── unit-testing.yml
│       ├── visual-testing.yml
│       ├── e2e-testing.yml
│       ├── autorelease.yml
│       └── autoprerelease.yml
├── pages/
│   └── _app.tsx
├── scripts/
│   ├── localizationGenerator.js
│   └── test/
│       └── unit/
│           └── localizationGenerator.spec.js
├── specs/
│   ├── planning-artifacts/
│   │   ├── prd.md
│   │   ├── epics.md
│   │   ├── implementation-plan.md
│   │   ├── architecture.md
│   │   └── component-provenance.md                    # to create
│   └── implementation-artifacts/
├── src/
│   ├── components/
│   │   ├── index.ts                                   # public API boundary
│   │   ├── fonts.css
│   │   ├── Types.d.ts
│   │   ├── AppTheme/
│   │   ├── UiButton/                                  # legacy (existing)
│   │   ├── UiInput/                                   # legacy (existing)
│   │   ├── UiCheckbox/                                # legacy (existing)
│   │   ├── UiLink/                                    # legacy (existing)
│   │   ├── UiTypography/                              # legacy (existing)
│   │   ├── UiImage/                                   # legacy (existing)
│   │   ├── UiToolbar/                                 # legacy (existing)
│   │   ├── UiTooltip/                                 # legacy (existing)
│   │   ├── UiTextFieldForm/                           # legacy (existing)
│   │   ├── UiCardItem/                                # legacy (existing)
│   │   ├── UiCardList/                                # legacy (existing)
│   │   ├── UiFooter/                                  # legacy (existing)
│   │   ├── UiBreakpoints/                             # legacy (existing)
│   │   ├── UiColorTheme/                              # legacy (existing)
│   │   ├── ui-pagination/                             # new
│   │   ├── ui-search-input/                           # new
│   │   ├── ui-select-with-search/                     # new
│   │   ├── ui-multi-select/                           # new
│   │   ├── ui-calendar-multi-select/                  # new
│   │   ├── ui-radio-group/                            # new
│   │   ├── ui-file-upload-input/                      # new
│   │   ├── ui-item-row/                               # new
│   │   ├── ui-items-list/                             # new
│   │   ├── ui-task-card/                              # new
│   │   ├── ui-profile-select-card/                    # new
│   │   ├── ui-integration-card/                       # new
│   │   ├── ui-filter-chip/                            # new
│   │   ├── ui-pin-input/                              # new
│   │   ├── ui-payment-option-card/                    # new
│   │   ├── ui-action-icon-bar/                        # new
│   │   ├── ui-status-badge/                           # new
│   │   ├── ui-notification-badge/                     # new
│   │   ├── ui-skeleton/                               # new
│   │   └── ui-skeleton-composed/                      # new
│   ├── test/
│   │   ├── testing-library/                           # centralized component tests
│   │   ├── e2e/
│   │   └── memory-leak/
│   ├── assets/
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   ├── routes/
│   ├── stores/
│   ├── types/
│   └── utils/
└── docs/
```

### Architectural Boundaries

**API Boundaries:**
- Public component API is exported only through `src/components/index.ts`.
- Internal component files are non-public implementation details.
- No backend API surface is owned by this repository.

**Component Boundaries:**
- Component communication is props + callbacks only.
- No global event-bus architecture.
- Async orchestration (fetch/retry/session) stays in consumer apps (`crm`, `website`).

**Service Boundaries:**
- No application service layer in toolkit scope.
- Integration logic belongs to consuming applications, not library components.

**Data Boundaries:**
- No persistent data layer (no DB schema/migrations/caching tier).
- Data contracts exist as TypeScript props and test/story fixtures only.

### Requirements to Structure Mapping

**FR-01 Board Coverage Completeness**
- Component implementation: `src/components/*`
- Coverage governance artifacts: `specs/planning-artifacts/*`
- Validation surfaces: stories in component folders + tests in `src/test/testing-library`

**FR-02 Reuse-First Compliance**
- Provenance registry: `specs/planning-artifacts/component-provenance.md`
- Source alignment notes per component entry (`crm`/`website`/`new`)

**FR-03 Canonical Behavior Alignment**
- Behavioral baseline encoded in component implementations and tests:
  - `src/components/*`
  - `src/test/testing-library/*`

**FR-04 Existing Control State Parity**
- Existing controls:
  - `src/components/UiButton/`
  - `src/components/UiInput/`
  - `src/components/UiCheckbox/`
  - `src/components/UiLink/`
- State tests:
  - `src/test/testing-library/UiButton.test.tsx`
  - `src/test/testing-library/UiInput.test.tsx`
  - `src/test/testing-library/UiCheckBox.test.tsx`
  - `src/test/testing-library/UiLink.test.tsx`

**FR-05 Missing Module Delivery**
- New modules under `src/components/<kebab-name>/`
- Matching tests in `src/test/testing-library/`

**FR-06 Skeleton Parity**
- Skeleton implementation:
  - `src/components/ui-skeleton/`
  - `src/components/ui-skeleton-composed/`
- Parity verification tests in `src/test/testing-library/`

**FR-07 API Contract Consistency**
- Prop/type definitions in each component `types.ts`
- Public export discipline in `src/components/index.ts`

**FR-08 Quality Gates**
- Stories co-located in component folders
- Unit tests centralized under `src/test/testing-library/`
- CI gates in `.github/workflows/`

### Integration Points

**Internal Communication:**
- Props down, callbacks up, typed event payloads.
- Shared UI patterns through MUI theme/config and common prop contract rules.

**External Integrations:**
- Distribution via internal npm registry.
- Consumer projects (`crm`, `website`, others) import published package surface.

**Data Flow:**
- Consumer app state drives component props.
- Components emit interaction callbacks to consumer handlers.
- No repository-owned external data fetch lifecycle.

### File Organization Patterns

**Configuration Files:**
- Root-level build/lint/test config files remain authoritative.

**Source Organization:**
- `src/components` is primary delivery area.
- Legacy `UiPascalCase` remains until explicit migration.
- New components use kebab-case folders/files.

**Test Organization:**
- Unit tests centralized in `src/test/testing-library`.
- E2E and memory-leak tests remain in existing `src/test/*` subtrees.

**Asset Organization:**
- Static visual assets in `src/assets`.
- Component-local style/type/theme files stay near implementation.

### Development Workflow Integration

**Development Server Structure:**
- Storybook and local dev scripts operate against `src/components` and shared config.

**Build Process Structure:**
- Build scripts and TypeScript/Jest pipeline validate exported library surface and test suite.

**Deployment Structure:**
- CI workflow publishes versioned package to internal npm registry after quality gates pass.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All major decisions align: UI-only scope, no persistent data layer, props/callback communication, centralized quality checklist, and internal npm distribution. No blocking contradictions detected.

**Pattern Consistency:**
Patterns are internally consistent with one managed tension: new kebab-case component folders vs legacy `UiPascalCase` folders. This is resolved by explicit transition rule (legacy untouched unless dedicated migration task).

**Structure Alignment:**
Project structure supports all decisions: central export boundary, centralized unit tests, co-located stories, governance artifacts under `specs/planning-artifacts`, and clear consumer/app boundary.

### Requirements Coverage Validation ✅

**Feature Coverage:**
All PRD feature groups are represented in architecture sections (existing parity, missing modules, skeleton parity, governance/checklists).

**Functional Requirements Coverage:**
FR-01..FR-08 are explicitly mapped to implementation locations and validation surfaces.

**Non-Functional Requirements Coverage:**
Compatibility, accessibility consistency, maintainability, and release-gate discipline are all addressed through patterns and checklist enforcement.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Critical decisions are documented and actionable for implementation sequencing.

**Structure Completeness:**
Complete project tree and boundary map are defined with specific directories/files.

**Pattern Completeness:**
Naming, structure, contract, communication, and process patterns are specified with anti-patterns and enforcement rules.

### Gap Analysis Results

**Critical Gaps:**
- None.

**Important Gaps:**
- `specs/planning-artifacts/component-provenance.md` is defined but not yet created.
- Internal npm distribution policy needs explicit compatibility matrix:
  - supported consumer projects
  - minimum Node version for consumers
  - peer dependency expectations (`react`, `@mui/material`, etc.)
- CI publish gate is defined conceptually but requires concrete workflow-level checklist.

**Nice-to-Have Gaps:**
- Add a migration playbook for eventual legacy `UiPascalCase` → kebab-case folder convergence.

### Validation Issues Addressed

- Naming convention conflict resolved by transition rule:
  - legacy folders remain valid;
  - all new components use kebab-case;
  - no opportunistic renames during feature implementation.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented
- [x] Technology stack baseline specified
- [x] Integration patterns defined
- [x] Security scope boundaries defined

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements-to-structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION  
**Confidence Level:** High

**Key Strengths:**
- Strong scope discipline for a shared internal UI library.
- Clear cross-repo reuse governance (`crm` canonical behavior).
- Practical enforcement model (tests, stories, exports, provenance).

**Areas for Future Enhancement:**
- Formal consumer compatibility matrix.
- Planned legacy folder naming migration path.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow architectural decisions and patterns exactly.
- Treat checklist completion as definition-of-done.
- Keep component behavior deterministic and async-stateless.

**First Implementation Priority:**
Create governance artifact + bootstrap enforcement:
1. Create `specs/planning-artifacts/component-provenance.md`
2. Implement export/checklist scaffolding for first new component slice.
