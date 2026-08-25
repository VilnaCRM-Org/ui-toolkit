---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
inputDocuments:
  - 'specs/ui-error-boundary/planning-artifacts/prd-ui-error-boundary-2026-08-13.md'
  - 'specs/ui-error-boundary/planning-artifacts/architecture-ui-error-boundary-2026-08-13.md'
---

# ui-toolkit - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the `UiErrorBoundary` and
error-recovery contract initiative (issue #71), decomposing the requirements from the PRD and
the Architecture Decision Document into implementable stories. The library ships 25 exported
components and no fault-containment primitive: a render throw blanks the consumer's whole page,
and `buildSubmitHandler` in `src/components/ui-form/index.tsx` awaits the consumer callback with
no `try`/`catch`, so a rejected submit escapes as an unhandled promise rejection.

The work adds one exported class component at `src/components/ui-error-boundary/`, one optional
backward-compatible `onSubmitError` prop on `UiForm`, three Storybook stories with committed
visual baselines, and a README "Error handling" section. It is a single-slice, additive,
brownfield change: no existing exported prop, default, or rendered output changes, and no new
runtime dependency enters the bundle. Delivery is one epic of four sequential stories.

## Requirements Inventory

### Functional Requirements

FR1: `UiErrorBoundary` at `src/components/ui-error-boundary/` as a class component using
`getDerivedStateFromError` and `componentDidCatch`.
FR2: It renders `children` while healthy and swaps the protected subtree for a fallback once a
descendant throws in render, a lifecycle, or a constructor.
FR3: It contains the failure so ancestors and outside siblings stay mounted and interactive.
FR4: It declares props in a sibling `types.ts`, exporting every type reachable from the props
interface so `api-extractor` reports no `ae-forgotten-export`.
FR5: A built-in default fallback renders when no `fallback` prop is given, so the failed region
is never an empty screen.
FR6: The default fallback is a small function component rendering a theme-consistent inline
message through `UiTypography`, imported through that component's public barrel.
FR7: The default fallback carries `role="alert"`.
FR8: The default fallback message resolves through `react-i18next` with an explicit
`defaultValue`, so an uninitialized `i18next` renders readable English, not a raw key.
FR9: The fallback path avoids any operation that may itself throw.
FR10: `fallback` accepts a `ReactNode` or an `(error, reset)` function whose return value is
rendered, handing the consumer the error and a reset handle.
FR11: An optional `onError(error, info)` is invoked from `componentDidCatch` with the caught
`Error` and React's `ErrorInfo`.
FR12: `onError` is invoked exactly once per caught error.
FR13: Dev-only diagnostics are emitted through `src/utils/dev-warn.ts`.
FR14: A `reset` function passed to a render-prop fallback clears error state and returns the
boundary to rendering `children`.
FR15: An optional `resetKeys` array clears error state automatically when any entry changes
identity between renders, including a length change.
FR16: An omitted or empty `resetKeys` means "no automatic reset", and a key change on a healthy
boundary leaves it untouched.
FR17: Recovery remounts the subtree so it starts from clean state.
FR18: `UiErrorBoundary` is exported from `src/components/index.ts` with no deep import.
FR19: The new export satisfies the `components-public-api` `dependency-cruiser` rule with zero
new violations.
FR20: The drift guard in `tests/unit/components-index.test.ts` asserts the new export.
FR21: `buildSubmitHandler` wraps its awaited `onSubmit(data, event)` in `try`/`catch`, so a
rejected consumer callback never escapes as an unhandled rejection.
FR22: `UiForm` skips the `resetOnSuccess` reset when the submit callback rejects.
FR23: `UiFormProps` gains an optional `onSubmitError?: (error: unknown) => void` that receives
the caught error, leaving every existing prop unchanged.
FR24: With no `onSubmitError` supplied, the rejection is still contained and reported through a
development-only warning rather than re-thrown.
FR25: Stories cover all three fallback modes.
FR26: Every new story is registered in `tests/visual/stories.json`, with baselines generated in
the pinned Playwright Docker image.
FR27: The README carries an "Error handling" section documenting `UiErrorBoundary`, its three
fallback modes, and its two recovery paths.
FR28: The README states what a boundary does not catch (event handlers, async code, server
rendering, errors in the boundary itself) and connects that to the `UiForm` contract and to how
`onSubmitError` relates to the existing `error` display prop.

### Non-Functional Requirements

NFR1: Reliability - a render throw inside a protected subtree must not unmount any ancestor.
NFR2: Reliability - the fallback must produce visible output for any `Error`, including one with
no `message`, rather than throwing.
NFR3: Reliability - no new unhandled promise rejection path, and the known one in
`buildSubmitHandler` is removed.
NFR4: Reliability - repeated failures in one boundary behave consistently with no state growth.
NFR5: Compatibility - the change is additive; no existing exported component's props, defaults,
or rendered output may change.
NFR6: Compatibility - the behavioural change to a rejecting `UiForm` submit is documented.
NFR7: Accessibility - the default fallback is announced via `role="alert"` and carries text
content, never an icon or colour cue alone.
NFR8: Accessibility - a consumer-supplied fallback gets no injected roles, and the README says so.
NFR9: i18n - every user-visible fallback string goes through `react-i18next` with an explicit
`defaultValue`, and resolution failure degrades to that default.
NFR10: Maintainability - every new function satisfies the `rust-code-analysis` per-function
limits (approximately LLOC <= 10, NEXITS <= 3, NARGS <= 3).
NFR11: Maintainability - internal-only symbols are not exported; `esbuild-jest` counts an
un-imported export as an uncovered function.
NFR12: Maintainability - file and folder naming is kebab-case.
NFR13: Testability - new suites live under the root `tests/` tree with descriptive filenames.
NFR14: Testability - semantic selectors only; `data-testid` is forbidden.
NFR15: Testability - new source files reach 100% branch, function, line, and statement coverage
and a merged mutation score at or above the Stryker break threshold of 80.
NFR16: Performance - the healthy path costs at most one extra component, and the `resetKeys`
comparison is a shallow element-wise check.
NFR17: Performance - no new runtime dependency enters the bundle.

### Additional Requirements

- No starter template applies. This is a brownfield extension of `@vilnacrm/ui-toolkit`.
- File layout (Architecture Decision 1): `index.tsx` holds only `class UiErrorBoundary`;
  `fallback-view.tsx` holds `FallbackView`; `default-fallback.tsx` holds `DefaultFallback`;
  `types.ts` holds props/state/public helper types; `styles.ts` holds literal `sx` objects.
- `index.tsx` must contain zero module-scope functions: `rust-code-analysis` counts class
  methods toward the file's `nom.functions` ceiling of 10 and the class needs nine.
- The class declares no class fields: `state` is assigned in the constructor and `resetBoundary`
  is a bound private method, keeping `npa.classes` at 0 and `coa` at `5 / 9 = 0.56 <= 0.6`.
- The two fallback files are `.tsx` because Stryker mutates `src/components/**/*.tsx` only.
- Fallback resolution order is render-prop, then node, then default, decided once in
  `FallbackView`. Nullish (`undefined` or explicit `null`) resolves to the default.
- `DefaultFallback` takes no props and never renders `error.message` (NFR2, FR9, and a
  deterministic visual baseline).
- Dev diagnostics call `devWarn` from `src/utils/dev-warn.ts` unchanged. No inline
  `process.env.NODE_ENV` check anywhere, so no environment-dependent half-branch exists.
- `resetKeys` comparison: normalize both sides with `?? []`, compare lengths, then element-wise
  `Object.is`, guarded by `state.error === null` returning early in `componentDidUpdate`.
- No `resetCount` or remount key: `+ 1` yields an unkillable equivalent mutant.
- `UiForm` needs three coordinated edits in `src/components/ui-form/index.tsx`: add the prop to
  `UiFormProps`; add `'onSubmitError'` to the `Omit<...>` union building `FormViewProps` and
  destructure it so it never leaks into the `...view` rest; add it to `SubmitHandlerOptions<T>`
  and rewrite `buildSubmitHandler` with `try`/`catch` plus a `reportSubmitError` helper.
- i18n: `i18n/localization.json` gains `error_boundary.default_message` under `en` and `uk`, with
  the `en` value byte-identical to `FALLBACK_MESSAGE`.
- Locked names: `MISSING_ON_ERROR_WARNING`, `UNHANDLED_SUBMIT_REJECTION_WARNING`, `FALLBACK_KEY`,
  `FALLBACK_MESSAGE`, `UiErrorBoundaryProps`, `UiErrorBoundaryState`, `UiErrorBoundaryFallback`,
  `UiErrorBoundaryFallbackRender`, `UiErrorBoundaryReset`, `UiErrorBoundaryErrorHandler`.
- Story file `src/components/ui-error-boundary/error-boundary.stories.tsx` (the repo strips the
  `ui-` prefix from story filenames), title `UiComponents/UiErrorBoundary`.
- Target-state delta: 10 new files, 6 modified files, 3 generated PNG baselines.
- Standing constraint: never relax a threshold in `config/metrics-policy.json`,
  `stryker.config.mjs`, or `jest.config.ts` to make the new code fit. Refactor instead.
- Every line in `specs/*.md` is at most 100 UTF-8 bytes, ASCII English only.

### FR Coverage Map

FR1: Story 1.1 - the class in `src/components/ui-error-boundary/index.tsx`
FR2: Story 1.1 - `getDerivedStateFromError` plus the `render` branch
FR3: Story 1.1 - containment proven by the integration suite
FR4: Story 1.1 - `types.ts` with all six types exported
FR5: Story 1.1 - `DefaultFallback` reached through the nullish branch
FR6: Story 1.1 - `UiTypography` via `../ui-typography`
FR7: Story 1.1 - `role="alert"` on the default fallback
FR8: Story 1.1 - `t(FALLBACK_KEY, { defaultValue: FALLBACK_MESSAGE })`
FR9: Story 1.1 - the no-throw rules for the failure path
FR10: Story 1.1 - `FallbackView` resolution order
FR11: Story 1.1 - `componentDidCatch` calling `onError`
FR12: Story 1.1 - reporting only from `componentDidCatch`
FR13: Story 1.1 - `devWarn(MISSING_ON_ERROR_WARNING)`
FR14: Story 1.1 - bound `resetBoundary` handed to the render-prop fallback
FR15: Story 1.1 - `shouldResetFromKeys` length plus `Object.is` compare
FR16: Story 1.1 - empty-array equivalence and the healthy-state early return
FR17: Story 1.1 - React discards the failed subtree, no counter needed
FR18: Story 1.1 - one line appended to `src/components/index.ts`
FR19: Story 1.1 - barrel-only cross-component edge, verified by `make lint-deps`
FR20: Story 1.1 - `expectedPublicExports` grows from 35 to 36 entries
FR21: Story 1.2 - `try`/`catch` around the awaited `onSubmit`
FR22: Story 1.2 - `catch` returns before the `resetOnSuccess` branch
FR23: Story 1.2 - optional `onSubmitError` on `UiFormProps` and `SubmitHandlerOptions<T>`
FR24: Story 1.2 - `reportSubmitError` falling back to `devWarn`
FR25: Story 1.3 - three story exports, one per fallback mode
FR26: Story 1.3 - `tests/visual/stories.json` entries plus committed baselines
FR27: Story 1.4 - README "Error handling" section
FR28: Story 1.4 - README limitations subsection linking to the `UiForm` contract

## Epic List

### Epic 1: Fault Containment and the Error-Recovery Contract

The toolkit exports a `UiErrorBoundary` fault-containment primitive, `UiForm` contains a rejected
submit behind a documented `onSubmitError` contract, all three fallback modes carry Storybook
stories with committed visual baselines, and the README documents the error-recovery contract -
all of it landing with zero new violations across the repository's quality gates.
**FRs covered:** FR1 through FR28
**NFRs covered:** NFR1 through NFR17

## Epic 1: Fault Containment and the Error-Recovery Contract Details

The toolkit exports a `UiErrorBoundary` fault-containment primitive, `UiForm` contains a rejected
submit behind a documented `onSubmitError` contract, all three fallback modes carry Storybook
stories with committed visual baselines, and the README documents the error-recovery contract.

### Story 1.1: `UiErrorBoundary` component, types, public export, and test suites

As a consumer of `@vilnacrm/ui-toolkit`,
I want an exported error boundary that contains a render failure and offers two recovery paths,
So that one bad prop degrades a single region instead of blanking my entire page.

**Scope (exact files):**

New:

- `src/components/ui-error-boundary/index.tsx` (the class only, no module-scope functions)
- `src/components/ui-error-boundary/fallback-view.tsx` (`FallbackView`)
- `src/components/ui-error-boundary/default-fallback.tsx` (`DefaultFallback`, constants)
- `src/components/ui-error-boundary/types.ts` (six exported types)
- `src/components/ui-error-boundary/styles.ts` (literal `sx` objects)
- `tests/unit/ui-error-boundary.test.tsx`
- `tests/unit/utils/mock-console-error.ts`
- `tests/integration/components/ui-error-boundary.integration.test.tsx`

Modified:

- `src/components/index.ts` (one appended export line)
- `tests/unit/components-index.test.ts` (`expectedPublicExports`, 35 entries become 36)
- `i18n/localization.json` (`error_boundary.default_message` under `en` and `uk`)

**Acceptance Criteria:**

- [ ] The class-metrics spike runs first: commit the Decision 1 class skeleton plus `types.ts`
      and a placeholder fallback, run `make lint-metrics`, and record the emitted `npm`, `npa`,
      `wmc`, `coa`, and `cda` values before the class shape is frozen.
- [ ] If the spike shows a breach that the designed shape does not clear, escalate to the
      repository owner; `config/metrics-policy.json` is not edited.
- [ ] `UiErrorBoundary` is importable from the package root (`src/components/index.ts`) and no
      deep import path into the folder is documented or required. (FR18)
- [ ] `make lint-deps` reports zero new `dependency-cruiser` violations; the only
      cross-component runtime edge is `default-fallback.tsx` to `../ui-typography`. (FR19)
- [ ] `tests/unit/components-index.test.ts` asserts `UiErrorBoundary` in the public export set
      and the suite passes. (FR20)
- [ ] `types.ts` exports `UiErrorBoundaryProps`, `UiErrorBoundaryState`,
      `UiErrorBoundaryFallback`, `UiErrorBoundaryFallbackRender`, `UiErrorBoundaryReset`, and
      `UiErrorBoundaryErrorHandler`; `api-extractor` raises no `ae-forgotten-export`. (FR4)
- [ ] No runtime symbol other than the default class export leaves the folder: `FallbackView`,
      `DefaultFallback`, `FALLBACK_KEY`, `FALLBACK_MESSAGE`, `MISSING_ON_ERROR_WARNING`, and
      `styles` are imported by exactly one sibling each. (NFR11)
- [ ] Unit case: healthy children render and no `alert` role is present.
- [ ] Unit case: a throwing child renders the default fallback with `role="alert"` and the
      English message while sibling markup stays mounted. (FR2, FR5, FR7, NFR1)
- [ ] Unit case: `onError` is called exactly once with an `Error` and an object carrying
      `componentStack`, asserted with `toHaveBeenCalledTimes(1)` after forcing an extra fallback
      re-render. (FR11, FR12)
- [ ] Unit case: with no `onError`, `devWarn` emits `MISSING_ON_ERROR_WARNING` once. (FR13)
- [ ] Unit case: a `ReactNode` fallback renders verbatim and receives no injected role. (NFR8)
- [ ] Unit case: an explicit `fallback={null}` still renders the default fallback. (FR5)
- [ ] Unit case: a render-prop fallback receives the thrown `Error` and a `reset`; activating its
      control clears the error and re-renders children. (FR10, FR14)
- [ ] Unit case: remount proof - the recovered child's mount effect fires a second time and its
      internal state is back to its initial value. (FR17)
- [ ] Unit case: a `resetKeys` value change recovers; a length change recovers; identical keys
      keep the fallback; a key change while healthy leaves children mounted. (FR15, FR16)
- [ ] Unit case: a `NaN` key compared with `NaN` does not trigger a reset, pinning `Object.is`
      over `===`.
- [ ] Unit case: rendered inside an `I18nextProvider` holding an instance initialized with empty
      resources, the fallback still shows `FALLBACK_MESSAGE`, not the raw key. (FR8, NFR9)
- [ ] Unit case: an `Error` constructed with no message still renders fallback text. (NFR2)
- [ ] Integration case: a composed subtree with a sibling region plus a boundary wrapping a real
      toolkit component fed a throwing child leaves the sibling region interactive after the
      throw, then recovers through `resetKeys` and renders the real subtree again. (FR3, NFR1)
- [ ] `jest.integration.config.ts`'s explicit coverage file list is left unchanged; the unit
      tier owns coverage for the new files.
- [ ] `tests/unit/utils/mock-console-error.ts` mirrors the existing `mock-console-warn.ts`
      `beforeEach`/`afterEach` spy plus live-handle shape, so React's own error logging does not
      destabilize other suites.
- [ ] Semantic selectors only (`getByText`, `getByRole`, `getByLabelText`); no `data-testid`
      appears in any new test. (NFR14)
- [ ] `make lint-metrics` passes: every new function is within the per-function budget table
      (args, exits, LLOC) recorded in Architecture Decision 7. (NFR10)

**Dependencies:** none. This story is the foundation for 1.3 and 1.4.

**Definition of Done:**

- [ ] `make lint-next`, `make lint-tsc`, `make lint-md`, `make format-check` pass.
- [ ] `make lint-deps` and `make lint-metrics` pass with zero new findings.
- [ ] `make lint-test-structure` passes (all new tests under the root `tests/` tree).
- [ ] `make test-unit` and `make test-integration` pass at the 100% global coverage threshold.
- [ ] `qlty check` and `qlty fmt --check` report no new findings, including duplication.
- [ ] No threshold in any config file was relaxed to make the code fit.

### Story 1.2: `UiForm` rejection contract and `onSubmitError`

As a consumer submitting a form,
I want a rejected `onSubmit` to be contained and routed to a handler instead of escaping,
So that a failed submission is a reportable event rather than an unhandled promise rejection.

**Scope (exact files):**

New:

- `tests/unit/ui-form-submit-errors.test.tsx`

Modified:

- `src/components/ui-form/index.tsx` (three coordinated edits, per Architecture Decision 6)

**Acceptance Criteria:**

- [ ] `UiFormProps` gains `onSubmitError?: (error: unknown) => void`; the type is `unknown`
      because a rejected consumer promise can carry anything. (FR23)
- [ ] `'onSubmitError'` is added to the `Omit<...>` union that builds `FormViewProps` and is
      destructured in `UiForm`'s signature, so it never leaks into the `...view` rest that
      `FormBody` renders.
- [ ] `SubmitHandlerOptions<T>` gains `onSubmitError`, and `buildSubmitHandler` wraps its awaited
      `onSubmit(data, event)` in `try`/`catch`. (FR21)
- [ ] The `catch` calls a module-scope `reportSubmitError(error, onSubmitError)` helper and then
      `return`s, so the `resetOnSuccess` branch is skipped on failure and the closure keeps two
      exits. (FR22)
- [ ] `reportSubmitError` calls `onSubmitError(error)` when supplied, otherwise
      `devWarn(UNHANDLED_SUBMIT_REJECTION_WARNING)`. (FR24)
- [ ] Unit case: with `process.on('unhandledRejection')` registered in `beforeEach` and removed
      in `afterEach`, submitting a form whose `onSubmit` rejects never fires the listener after
      microtasks flush. (FR21, NFR3)
- [ ] Unit case: `onSubmitError` receives the exact rejection value, exactly once. (FR23)
- [ ] Unit case: with `resetOnSuccess` set, the typed value is still in the field after a failed
      submit, proving `methods.reset` was not called. (FR22)
- [ ] Unit case: the happy path still resets, proving the branch was not inverted.
- [ ] Unit case: with no `onSubmitError`, the dev warning fires and there is still no unhandled
      rejection. (FR24)
- [ ] Unit case: a non-`Error` rejection value (a string) is forwarded unchanged, pinning the
      `unknown` type.
- [ ] Unit case: the submit control is re-enabled afterwards, proving `submitting` semantics are
      unchanged (`isSubmitting ?? methods.formState.isSubmitting`).
- [ ] Every existing `UiForm` prop keeps its name, type, default, and position; every current
      call site type-checks with no edit, and rendered output is identical. (NFR5)
- [ ] The existing `UiForm` suites pass unmodified except where they assert the removed
      re-throw behaviour.

**Dependencies:** none technically, but sequenced after Story 1.1 so the `devWarn` usage pattern
and the `mock-console-warn` harness are already exercised.

**Definition of Done:**

- [ ] `make lint-next`, `make lint-tsc`, `make format-check` pass.
- [ ] `make lint-metrics` passes: `reportSubmitError` (2 args, 1 exit) and the submit closure
      (2 args, 1 exit, LLOC 7) stay inside the per-function budget.
- [ ] `make test-unit` and `make test-integration` pass at 100% coverage.
- [ ] The `formState.isSubmitSuccessful` nuance is captured as a note for the Story 1.4 README
      section and for the release notes. (NFR6)
- [ ] `qlty check` reports no new findings.

### Story 1.3: Storybook stories, visual baselines, and drift-guard coverage

As a maintainer,
I want a story per fallback mode with committed pixel baselines,
So that the fallback rendering is reviewable in Storybook and protected from silent drift.

**Scope (exact files):**

New:

- `src/components/ui-error-boundary/error-boundary.stories.tsx`
- Three baselines under `tests/visual/visual.spec.ts-snapshots/` named
  `<story-id>-chromium-linux.png`

Modified:

- `tests/visual/stories.json` (three ids added to the existing per-component grouping)

**Acceptance Criteria:**

- [ ] The story file is titled `UiComponents/UiErrorBoundary` and exports `DefaultFallback`,
      `CustomNodeFallback`, and `RenderPropFallback`. (FR25)
- [ ] Story ids are `uicomponents-uierrorboundary--default-fallback`,
      `uicomponents-uierrorboundary--custom-node-fallback`, and
      `uicomponents-uierrorboundary--render-prop-fallback`.
- [ ] Each story renders a module-scope child that throws unconditionally during render, so
      every load produces the same committed pixels: no timers, no random values, and no error
      text echoed into the DOM.
- [ ] The render-prop story renders a static "Try again" `UiButton` wired to `reset`, and the
      baseline captures its rest state only.
- [ ] `argTypes` mark `fallback` and `children` as `control: false` so the docs page cannot
      mutate the snapshot.
- [ ] All three ids are registered in `tests/visual/stories.json` and the completeness
      drift-guard passes. (FR26)
- [ ] Baselines are generated inside the pinned Playwright Docker image with `tests/`
      bind-mounted so the PNGs persist to the host; none are generated on the host directly.
- [ ] `make test-visual` passes against the committed baselines.
- [ ] `tests/e2e/stories.smoke.spec.ts` reports zero `pageerror` for the three stories. React 19
      routes a caught error to `onCaughtError` and `console.error` and calls `reportError()`
      only for uncaught errors, so a contained throw should not register. Confirm on the first
      `make test-e2e` run.
- [ ] If a `pageerror` does register, the story is reworked to reach the fallback without an
      uncaught throw; the smoke assertion is never weakened.
- [ ] If the image-actions workflow recompresses the newly committed PNGs, the recompressed
      files are committed as a follow-up so the visual job is green.

**Dependencies:** Story 1.1 (the component and its fallback modes must exist and be frozen).

**Definition of Done:**

- [ ] `make lint-next`, `make lint-tsc`, `make format-check` pass.
- [ ] `make storybook-build` succeeds and the three stories render in Storybook.
- [ ] `make test-visual` passes and the story-manifest drift guard reports no missing coverage.
- [ ] `qlty check` reports no new findings.

### Story 1.4: README "Error handling" section and the final gate sweep

As a contributor evaluating the toolkit,
I want the error-recovery contract documented in the README and every repository gate green,
So that the boundary and the form contract are usable without reading source, and the change
merges without a quality regression.

**Scope (exact files):**

Modified:

- `README.md` (new top-level `## Error handling` section after `## Project Layout`)

**Acceptance Criteria:**

- [ ] The section explains why the toolkit ships a boundary: one bad prop must not blank a page.
- [ ] It gives a `UiErrorBoundary` quick start importing from the package root. (FR27)
- [ ] It states what the boundary catches: render, lifecycle, and constructor errors below it.
- [ ] It states what the boundary does **not** catch - event handlers, async code, server
      rendering, and errors thrown by the fallback itself - and makes the explicit link that
      this is exactly why `UiForm` carries its own contract. (FR28)
- [ ] It documents the three fallback modes, including that `null` does not suppress the
      default fallback.
- [ ] It documents the two recovery paths: `reset` from a render-prop fallback, and `resetKeys`.
- [ ] It documents `onError`: once per caught error, with React's `ErrorInfo`; the toolkit
      reports nowhere itself.
- [ ] It documents accessibility: the default fallback is `role="alert"`, and a consumer-supplied
      fallback is the consumer's responsibility and gets no injected semantics. (NFR8)
- [ ] It documents the `UiForm` rejection contract: `onSubmitError`, no reset on failure, the
      dev warning when no handler is attached, how it relates to the existing `error` display
      prop, and the `formState.isSubmitSuccessful` nuance from Story 1.2. (NFR6)
- [ ] It states that no migration is required because the change is additive. (NFR5)
- [ ] Mutation shards run and `make merge-mutation-reports` reports a merged score at or above
      80 for the touched files - `ui-error-boundary/index.tsx`, `fallback-view.tsx`,
      `default-fallback.tsx`, and `ui-form/index.tsx`. (NFR15)
- [ ] Every mutant in the Architecture Decision 8 hardening map has a named killing test, and
      any survivor is killed by strengthening an assertion, never by narrowing the mutation
      scope.
- [ ] Every line added to `README.md` and to any spec file is at most 100 UTF-8 bytes.

**Dependencies:** Stories 1.1, 1.2, and 1.3 must all be complete; the mutation sweep needs the
final source and test state.

**Definition of Done:**

- [ ] `make lint` passes end to end: `lint-next`, `lint-tsc`, `lint-md`, `format-check`,
      `lint-dep-ranges`, `lint-test-structure`, `lint-deps`, `lint-metrics`.
- [ ] `make test-unit` and `make test-integration` pass at the 100% global coverage threshold.
- [ ] `make test-visual` passes against the committed baselines.
- [ ] `make test-bats` passes (Makefile shell-flow coverage contracts).
- [ ] Mutation shards plus `make merge-mutation-reports` clear the break-80 gate.
- [ ] `qlty check` and `qlty fmt --check` report no new findings; the repository has no `jscpd`
      target, so duplication is covered by `qlty`'s duplication analysis.
- [ ] No threshold in `config/metrics-policy.json`, `stryker.config.mjs`, or `jest.config.ts`
      was relaxed at any point in the epic.
