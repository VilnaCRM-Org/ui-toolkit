---
stepsCompleted:
  - 'step-01-init.md'
  - 'step-02-discovery.md'
  - 'step-03-success.md'
  - 'step-04-journeys.md'
  - 'step-05-domain.md'
  - 'step-06-innovation.md'
  - 'step-07-project-type.md'
  - 'step-08-scoping.md'
  - 'step-09-functional.md'
  - 'step-10-nonfunctional.md'
  - 'step-11-complete.md'
inputDocuments:
  - 'https://github.com/VilnaCRM-Org/ui-toolkit/issues/71'
  - 'src/components/index.ts'
  - 'src/components/ui-form/index.tsx'
  - 'src/components/ui-input/index.tsx'
  - 'src/utils/dev-warn.ts'
  - 'tests/unit/components-index.test.ts'
  - 'tests/visual/stories.json'
  - '.dependency-cruiser.js'
  - 'stryker.config.mjs'
  - 'jest.config.ts'
  - 'README.md'
workflowType: 'prd'
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 11
classification:
  projectType: 'component_library'
  domain: 'general'
  complexity: 'low'
  projectContext: 'brownfield'
---

# Product Requirements Document - UiErrorBoundary and error-recovery contract

**Author:** platform-team
**Date:** 2026-08-13T12:00:00+02:00

## Executive Summary

This initiative closes the Reliability finding in issue #71 for `@vilnacrm/ui-toolkit`: the
library exports 25 components from `src/components/index.ts` and ships no fault-containment
primitive. A repository scan finds zero occurrences of `ErrorBoundary`, `componentDidCatch`,
or `getDerivedStateFromError` under `src/`. A single render throw therefore unmounts the
consumer's entire React tree and blanks the page, with no supported way to contain it.

The same gap exists on the async path. `buildSubmitHandler` in
`src/components/ui-form/index.tsx` awaits `onSubmit(data, event)` with no `try`/`catch`.
`react-hook-form` re-throws a rejected submit callback, so a failed submission surfaces as an
unhandled promise rejection instead of a recoverable event. The existing
`error?: string | null` prop renders a banner but is an undocumented convention that nothing
connects a rejected submit to.

The delivery adds one exported component, `UiErrorBoundary`, at
`src/components/ui-error-boundary/`, following the existing component layout (`index.tsx`,
`types.ts`, stories, unit and integration tests at the 100% coverage threshold). It is a
class component -- required, because `getDerivedStateFromError` and `componentDidCatch` have
no hook equivalent -- with a declarative `fallback`, an `onError` reporting hook, and
`resetKeys` for automatic recovery. Its default fallback is a small function component
rendering a theme-consistent `role="alert"` message, never an empty screen. The delivery also
repairs the `UiForm` submit contract with a backward-compatible optional `onSubmitError`, and
documents both in a new README "Error handling" section. Dev-warning generalization (#77),
observability wiring (#93), and the accessibility standard (#66) stay out of scope.

## Success Criteria

### User Success

- A consumer can wrap any subtree in `UiErrorBoundary` and keep the rest of the application
  mounted when that subtree throws during render.
- A consumer sees a readable, theme-consistent message instead of a blank page, without
  writing any fallback code of their own, and can recover without a page reload via the
  supplied `reset` or via `resetKeys`.
- A consumer of `UiForm` can handle a rejected `onSubmit` through a documented callback
  instead of an unhandled promise rejection in the console.

### Business Success

- The published library stops being a single-point-of-failure surface: one component's defect
  no longer necessarily takes down a consumer's whole page, and error-recovery behaviour
  becomes a documented package contract rather than tribal knowledge across consumers.
- The Reliability finding in #71 is closed and can be marked covered by the #70 audit.

### Technical Success

- `UiErrorBoundary` is exported from the package root with no deep import and zero new
  `dependency-cruiser` violations.
- A throwing child renders the fallback, calls `onError` exactly once, and does not propagate
  the crash past the boundary; `reset()` and a changed `resetKeys` entry both return the
  boundary to rendering children.
- A rejecting `onSubmit` produces no unhandled rejection, reaches `onSubmitError`, and does
  not reset the form; the default fallback never throws, even with `i18next` uninitialized.
- New files hold every existing gate: 100% Jest coverage, mutation score at or above the
  Stryker `thresholds.break` of 80, `rust-code-analysis` per-function limits, and the
  visual-baseline completeness drift guard.

### Measurable Outcomes

- Package-root named exports grow from 35 to 36, asserted by the export drift guard;
  fault-containment primitives move from 0 to 1; unhandled-rejection paths from 1 to 0.
- Three stories exist (default, custom node, render-prop fallback), all registered in
  `tests/visual/stories.json`, and the README gains one "Error handling" section.

## Product Scope

### Current Scope

- Add `src/components/ui-error-boundary/` with `index.tsx` and `types.ts` in the existing
  kebab-case component layout: a class component with `getDerivedStateFromError` and
  `componentDidCatch`, and props `fallback`, `onError`, `resetKeys`, `children`.
- Provide a default fallback: a small function component rendering a `UiTypography`-based
  inline message with `role="alert"`, translated through `react-i18next` with an explicit
  `defaultValue` so an uninitialized `i18next` still renders readable English.
- Provide dev-only diagnostics through `src/utils/dev-warn.ts`, stripped in production by the
  `NODE_ENV` guard already used by `ui-input`, and export `UiErrorBoundary` from
  `src/components/index.ts`, updating the export drift guard.
- Fix the `UiForm` contract: catch a rejected `onSubmit`, skip the `resetOnSuccess` reset on
  failure, and surface the error through a new optional `onSubmitError`.
- Add unit and integration tests under the root `tests/` tree with descriptive filenames,
  stories per fallback mode with baselines from the pinned Playwright Docker image, and a
  README "Error handling" section documenting both contracts.

### Deferred Work

- No additional follow-on scope is committed in this PRD.

### Future Considerations

- Reassess routing `onError` into a real telemetry sink once #93 decides the observability
  stance; the `onError` signature is designed to be that seam.
- Reassess generalizing dev diagnostics once #77 lands, and whether any toolkit component
  should wrap its own internals in a boundary by default, only after the opt-in primitive
  proves itself in consumer applications.

## User Journeys

### Journey 1: Consumer Contains a Render Failure

A consumer renders a dashboard built from toolkit components. One card receives malformed API
data and throws during render; today the whole page unmounts and the user sees a blank
screen. After this delivery the consumer wraps that region in `UiErrorBoundary`:
`getDerivedStateFromError` catches the throw, the boundary swaps its subtree for the
fallback, and navigation, sidebar, and sibling cards stay mounted. `componentDidCatch` calls
`onError` once with the error and React's `ErrorInfo`, and the user reads a short message
announced through `role="alert"`.

### Journey 2: Consumer Recovers Without a Page Reload

The consumer wants the failed region usable again once the cause clears. They pass a
render-prop fallback and render a retry control calling the supplied `reset()`; the boundary
clears its error state and re-renders children. Alternatively they pass
`resetKeys={[selectedAccountId]}`: picking a different account changes the key, the boundary
clears itself, and the subtree remounts against the new input. Neither path reloads the page.

### Journey 3: Consumer Handles a Failed Form Submission

A consumer renders `UiForm` and its `onSubmit` posts to an API returning a 500. Today the
rejection escapes `buildSubmitHandler`, `react-hook-form` re-throws, and the browser logs an
unhandled rejection. After this delivery the consumer passes `onSubmitError`: the rejection
is caught, the form is not reset, and the consumer maps the error to a message fed back
through the existing `error` prop. A consumer passing no `onSubmitError` compiles unchanged,
with the rejection contained and reported through a development-only warning.

### Journey Requirements Summary

- An exported, opt-in boundary that contains render-phase failures
- A default fallback that is never blank and is announced assistively
- Two documented recovery paths (imperative `reset`, declarative `resetKeys`) and a
  single-call error reporting hook suitable for a consumer logger
- A `UiForm` rejection contract that never leaks an unhandled rejection, backward compatible
  for every existing call site, and documentation stating what is and is not caught

## Component-Library-Specific Requirements

### Project-Type Overview and Architecture Considerations

This adds user-facing capability to a published React 19 + MUI 9 component library, so
backward compatibility, the exported type contract, and documentation carry the same weight
as the runtime behaviour. React offers no hook that intercepts a render-phase throw, so the
catching shell must be a class implementing static `getDerivedStateFromError` (state
transition) and instance `componentDidCatch` (reporting). Everything else -- default fallback
rendering, fallback resolution, `resetKeys` comparison, diagnostic message construction --
belongs in small module-scope functions or a small function component, keeping the class thin
and satisfying `rust-code-analysis` limits (roughly LLOC <= 10, NEXITS <= 3, NARGS <= 3).

The `components-public-api` `dependency-cruiser` rule lets a component import another
component's public barrel but forbids runtime edges into its internals, so the default
fallback must consume `UiTypography` through `../ui-typography`, as `ui-form` does today.
`esbuild-jest` counts un-imported exports as uncovered functions, so internal-only symbols
(fallback resolver, key comparator, default fallback) must not be exported, while
`api-extractor` raises `ae-forgotten-export` for any type reachable from
`UiErrorBoundaryProps` that `types.ts` does not export.

### Public API Surface

- `UiErrorBoundary` is the default export of `src/components/ui-error-boundary/index.tsx` and
  a named export of `src/components/index.ts`. Props, defined in `types.ts`:
  `children: ReactNode`;
  `fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)`;
  `onError?: (error: Error, info: React.ErrorInfo) => void`; `resetKeys?: unknown[]`.
- No other symbol from the folder is public; no deep import path is supported.
- `UiFormProps` gains one optional prop, `onSubmitError?: (error: unknown) => void`. No
  existing prop changes name, type, or default, so every current call site still compiles.

### Accessibility and Internationalization Requirements

- The default fallback ships `role="alert"` even though the accessibility standard (#66) is
  out of scope; the attribute is the minimum that makes a fallback perceivable. Its message
  resolves through `react-i18next` with an explicit `defaultValue`.
- The fallback path must never throw. A throwing fallback re-enters the failing boundary and
  produces exactly the blank page this work prevents, so it must avoid optional-chaining
  gaps, unguarded theme lookups, and rendering of anything but plain text.
- A consumer-supplied fallback is rendered as given; the toolkit injects no role and no
  translation into it, and the README says the consumer owns its accessibility.

### Testing and Quality Gate Requirements

- Tests live under the root `tests/` tree with descriptive kebab-case filenames --
  `tests/unit/ui-error-boundary.test.tsx`, `tests/unit/ui-form-submit-errors.test.tsx`,
  `tests/integration/ui-error-boundary.integration.test.tsx` -- never issue-number names, and
  use semantic selectors only; `data-testid` is forbidden.
- Assertions must kill string-literal and conditional mutants in the fallback text and the
  `resetKeys` comparison, since the merged Stryker gate needs 80 alongside 100% coverage.
- Throwing children emit React's own console error; the suites must handle that noise
  deliberately rather than letting it destabilize other tests.

### Documentation and Implementation Considerations

- The README "Error handling" section must document what `UiErrorBoundary` catches (render,
  lifecycle, and constructor errors below it); what it does not catch (event handlers, async
  code, server rendering, errors in the boundary itself) and why that is exactly why `UiForm`
  carries its own contract; the three fallback modes; the two recovery paths; and how
  `onSubmitError` relates to the existing `error` display prop. The change is additive, so
  the README states that no migration is required.
- `resetKeys` comparison must be cheap and total: element-wise identity plus a length check,
  with `undefined` and `[]` both meaning "no automatic reset". Clearing error state must
  remount children so the failed component starts clean.
- The `UiForm` fix must not change resolved `submitting` semantics; only the reset decision
  and error routing change. Dev diagnostics reuse `src/utils/dev-warn.ts` unchanged.

## Project Scoping & Delivery Boundaries

### Delivery Strategy

**Delivery Approach:** Single-slice library change adding one exported component and one
backward-compatible prop to an existing component
**Resource Requirements:** One engineer, one implementation slice / PR stream

The scope is intentionally narrow: a fault-containment primitive and a defined async-failure
contract, not an error-reporting platform, and not a retrofit into the existing components.

### Current Feature Set

**Core User Journeys Supported:** the three journeys above -- containing a render failure,
recovering without a page reload, and handling a failed form submission.

**Must-Have Capabilities:** a class-based `UiErrorBoundary`; three fallback modes; a
never-blank `role="alert"` default fallback that cannot throw; a single-invocation `onError`
seam; recovery through `reset` and `resetKeys`; a package-root export with an updated drift
guard; the `UiForm` rejection contract; full unit, integration, and visual coverage; and a
README "Error handling" section.

### Explicitly Out of Scope

- **#77 dev-warning generalization.** This work consumes `src/utils/dev-warn.ts` as it is and
  does not refactor, extend, or generalize the warning surface.
- **#93 observability stance.** No telemetry SDK, transport, default sink, or aggregation.
  `onError` is the seam a later effort will use; the toolkit reports nowhere itself.
- **#66 accessibility standard.** No repository-wide contract, audit, or shared pattern. The
  single exception is that the default fallback ships `role="alert"`, because a fallback
  nobody can perceive does not satisfy the reliability goal.
- **#70 umbrella audit.** This PRD closes one finding under it and does not resolve it.
  Retrofitting boundaries inside existing components, error persistence or retry scheduling,
  stack parsing, and a server-rendering error contract are all deferred.

### Risk Mitigation Strategy

**Technical Risks:** The fallback is the last line of defence; if it throws, the boundary
re-enters its own failure and the blank page returns. Mitigation: require an explicit
`defaultValue` on every translated string, forbid unguarded lookups in the fallback, and
cover the uninitialized-i18next case in tests. A class component also attracts
`rust-code-analysis` findings; keep it to state transition plus reporting and push all logic
into small module functions.

**Compatibility Risks:** The `UiForm` change converts a thrown rejection into a contained
one, so a consumer relying on a global rejection listener would see a silent path.
Mitigation: keep `onSubmitError` optional, emit a development-only warning when a rejection
is contained with no handler attached, and document the change as a stated contract.

**Quality-Gate Risks:** New files must clear 100% coverage and an 80 mutation score at once.
Mitigation: write the branch matrix (default/node/render-prop fallback, reset paths, key
changes, handler present/absent) before implementation, and export no internal symbol
`esbuild-jest` would count as uncovered.

## Functional Requirements

### Error Boundary Component

- FR1: The library can provide `UiErrorBoundary` at `src/components/ui-error-boundary/`
  as a class component using `getDerivedStateFromError` and `componentDidCatch`.
- FR2: `UiErrorBoundary` can render `children` while healthy and swap the whole protected
  subtree for a fallback once a descendant throws in render, a lifecycle, or a constructor.
- FR3: `UiErrorBoundary` can contain the failure so ancestors and outside siblings stay
  mounted and interactive.
- FR4: `UiErrorBoundary` can declare its props in a sibling `types.ts`, exporting every type
  reachable from the props interface so `api-extractor` reports no forgotten export.

### Fallback Rendering

- FR5: `UiErrorBoundary` can render a built-in default fallback when no `fallback` prop is
  given, so the failed region is never an empty screen.
- FR6: The default fallback can be a small function component rendering a theme-consistent
  inline message through `UiTypography`, imported through that component's public barrel.
- FR7: The default fallback can carry `role="alert"` so the failure is announced.
- FR8: The default fallback message can resolve through `react-i18next` with an explicit
  `defaultValue`, so an uninitialized `i18next` renders readable English, not a raw key.
- FR9: The fallback path can avoid any operation that may itself throw, so a contained
  failure never escalates.
- FR10: `UiErrorBoundary` can accept a `ReactNode` fallback, or a `(error, reset)` function
  fallback whose return value it renders, giving the consumer the error and a reset handle.

### Error Reporting

- FR11: `UiErrorBoundary` can invoke an optional `onError(error, info)` from
  `componentDidCatch` with the caught `Error` and React's `ErrorInfo`.
- FR12: `UiErrorBoundary` can invoke `onError` exactly once per caught error, so a fallback
  re-render never duplicates a log entry.
- FR13: `UiErrorBoundary` can emit dev-only diagnostics through `src/utils/dev-warn.ts`.

### Recovery

- FR14: `UiErrorBoundary` can pass a `reset` function to a render-prop fallback that clears
  its error state and returns it to rendering `children`.
- FR15: `UiErrorBoundary` can accept an optional `resetKeys` array and clear its error state
  automatically when any entry changes identity between renders, including a length change.
- FR16: `UiErrorBoundary` can treat an omitted or empty `resetKeys` as "no automatic reset",
  leaving a healthy boundary untouched when keys change.
- FR17: `UiErrorBoundary` can remount the subtree on recovery so it starts from clean state.

### Public Export Surface

- FR18: The library can export `UiErrorBoundary` from `src/components/index.ts`, so consumers
  import it from the package root with no deep import.
- FR19: The new export can satisfy the `components-public-api` `dependency-cruiser` rule with
  zero new violations, routing every cross-component runtime edge through a public barrel.
- FR20: The drift guard in `tests/unit/components-index.test.ts` can assert the new export.

### UiForm Error Contract

- FR21: `buildSubmitHandler` can wrap its awaited `onSubmit(data, event)` call in
  `try`/`catch`, so a rejected consumer callback never escapes as an unhandled rejection.
- FR22: `UiForm` can skip the `resetOnSuccess` reset when the submit callback rejects.
- FR23: `UiFormProps` can gain an optional `onSubmitError?: (error: unknown) => void` and
  `UiForm` can deliver the caught error to it, leaving every existing prop unchanged.
- FR24: `UiForm` can contain a rejection even with no `onSubmitError` supplied, reporting it
  through a development-only warning rather than re-throwing.

### Stories, Visual Coverage, and Documentation

- FR25: The repository can provide stories covering all three fallback modes.
- FR26: Every new story can be registered in `tests/visual/stories.json` so the completeness
  drift guard passes, with baselines generated in the pinned Playwright Docker image.
- FR27: The README can carry an "Error handling" section documenting `UiErrorBoundary`, its
  three fallback modes, and its two recovery paths.
- FR28: The README can state what an error boundary does not catch -- event handlers, async
  code, server rendering, errors in the boundary itself -- and connect that limitation to the
  `UiForm` rejection contract and to how `onSubmitError` relates to the `error` display prop.

## Non-Functional Requirements

### Reliability

- NFR1: A render throw inside a protected subtree must not unmount any ancestor of the
  boundary; containment is the primary quality attribute this work delivers.
- NFR2: The fallback must produce visible output for any `Error`, including one with no
  `message`, rather than throwing.
- NFR3: The library must introduce no new unhandled promise rejection path, and must remove
  the known one in `buildSubmitHandler`.
- NFR4: Repeated failures in one boundary must behave consistently, with no state growth.

### Compatibility

- NFR5: The change must be additive; no existing exported component's props, defaults, or
  rendered output may change, so consumers upgrade without code edits.
- NFR6: The behavioural change to a rejecting `UiForm` submit must be documented.

### Accessibility and Internationalization

- NFR7: The default fallback must be announced via `role="alert"` and must carry text
  content, never an icon or colour cue alone.
- NFR8: A consumer-supplied fallback is the consumer's responsibility; the toolkit must not
  inject roles into it, and the README must say so.
- NFR9: Every user-visible string in the fallback must go through `react-i18next` with an
  explicit `defaultValue`, and resolution failure must degrade to that default value.

### Maintainability

- NFR10: Every new function must satisfy the `rust-code-analysis` per-function limits
  (approximately LLOC <= 10, NEXITS <= 3, NARGS <= 3), forcing small module-scope helpers.
- NFR11: Internal-only symbols must not be exported; `esbuild-jest` counts un-imported
  exports as uncovered functions against the 100% coverage threshold.
- NFR12: File and folder naming must be kebab-case, matching every existing component.

### Testability

- NFR13: New suites must live under the root `tests/` tree with descriptive filenames.
- NFR14: Tests must use semantic selectors only; `data-testid` is forbidden.
- NFR15: New source files must reach 100% branch, function, line, and statement coverage, and
  a mutation score at or above the Stryker break threshold of 80 in the merged report gate.

### Performance

- NFR16: The healthy path must cost no more than one extra component in the tree, and the
  `resetKeys` comparison must be a shallow element-wise check.
- NFR17: The added component must not pull any new runtime dependency into the bundle.

## Acceptance Criteria

Each criterion traces to the acceptance criteria stated in issue #71.

- AC1: `UiErrorBoundary` is importable from the package root and `dependency-cruiser` reports
  zero new violations. (FR1, FR18, FR19, FR20)
- AC2: A unit test renders a throwing child and asserts the fallback is shown, `onError` was
  called once, the crash did not propagate, and coverage holds. (FR2, FR3, FR11, FR12)
- AC3: A unit test asserts `reset()` returns the boundary to rendering children, and that
  changing a `resetKeys` entry does the same. (FR10, FR14, FR15, FR16, FR17)
- AC4: A unit test asserts a rejecting `onSubmit` produces no unhandled rejection, that
  `onSubmitError` receives the error, and that the form is not reset. (FR21-FR24)
- AC5: The merged mutation gate reports a score at or above 80 for touched files. (NFR15)
- AC6: The README "Error handling" section documents `UiErrorBoundary` and the `UiForm`
  rejection contract, including what a boundary does not catch. (FR27, FR28)
- AC7: Stories cover all three fallback modes and the visual gate passes. (FR25, FR26)
- AC8: The default fallback renders `role="alert"` and readable English when `i18next` is not
  initialized. (FR7, FR8, NFR7, NFR9)

## Success Metrics

- **Fault containment:** 1 exported primitive where the library had 0, with a render throw
  contained to its boundary in the integration suite.
- **Unhandled rejections:** the one known path (`buildSubmitHandler`) reduced to zero, and the
  undocumented `error` prop convention replaced by a README contract.
- **Quality gates:** 100% coverage and a mutation score at or above 80 on new files, with no
  `rust-code-analysis`, `dependency-cruiser`, or visual-drift regressions.
- **Issue closure:** the Reliability finding in #71 is closed, and the #70 umbrella audit can
  mark fault containment and the async error-recovery contract as covered.
