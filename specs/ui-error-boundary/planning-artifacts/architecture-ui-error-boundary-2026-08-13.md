---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-08-13'
inputDocuments:
  - 'specs/ui-error-boundary/planning-artifacts/prd-ui-error-boundary-2026-08-13.md'
workflowType: 'architecture'
project_name: 'ui-toolkit'
user_name: 'platform-team'
date: '2026-08-13T14:00:00+02:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as
we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:** FR1-FR28 in six groups: the boundary component (FR1-FR4),
fallback rendering (FR5-FR10), error reporting (FR11-FR13), recovery (FR14-FR17), the export
surface (FR18-FR20), the `UiForm` contract (FR21-FR24), stories/visual/docs (FR25-FR28). This
is a runtime library feature, not repository tooling: one new exported component plus one
optional prop on an existing one, landing inside a mature quality-gate harness.

**Non-Functional Requirements:** reliability first (a contained failure must never escalate;
the fallback itself must never throw), then compatibility (purely additive), accessibility and
i18n (`role="alert"` plus `t()` with an explicit `defaultValue`), maintainability (every
function inside the `rust-code-analysis` ceilings), testability (root `tests/` tree,
descriptive filenames, semantic selectors, 100% coverage, mutation score at or above 80).

**Scale & Complexity:** low complexity, high precision. Domain: React 19 + MUI 9 library
published as `@vilnacrm/ui-toolkit`. Operational sensitivity medium (published API surface;
behaviour change on a rejecting submit). Five architectural components: boundary class,
fallback view, default fallback, types module, `UiForm` submit-handler change.

### Technical Constraints & Dependencies

The repository fixes nearly every implementation choice, so this architecture is about fitting
inside existing rails rather than choosing new ones.

- React 19 has no hook that intercepts a render-phase throw. `getDerivedStateFromError` and
  `componentDidCatch` exist only on classes, so the catching shell must be a class. It is the
  first class in `src/`.
- `eslint.config.mjs`: `explicit-member-accessibility` (`accessibility: 'explicit'`,
  constructors `no-public`), `member-ordering`, `explicit-function-return-type`, `max-len` 100,
  `react/jsx-props-no-spreading`, `no-console` allowing only `warn`/`error`.
- `config/metrics-policy.json`: per function `lloc<=10`, `nexits<=3`, `nargs<=3`,
  `cyclomatic<=10`, `cognitive<=15`; per file `nom_functions<=10`, `nom_closures<=6`,
  `nom_total<=15`; per class `wmc<=30`, `npm<=8`, `npa<=2`, `coa<=0.6`, `cda<=0.25`.
  `scripts/lint-metrics.sh` maps `coa` to `npm.classes_average` and `cda` to
  `npa.classes_average`. Both are ratios hostile to a React class whose members are all public
  (Decision 7 and Gap Analysis).
- `jest.config.ts`: coverage from `src/**/*.{ts,tsx}` minus stories, `*.d.ts`, `types.ts`,
  `src/index.ts`, `src/components/index.ts`, at 100% global. `esbuild-jest` reports
  un-imported exports as uncovered functions.
- `stryker.config.mjs` mutates `./src/components/**/*.tsx` only, `thresholds.break: 80`.
  Sibling `.ts` files are never mutated.
- `.dependency-cruiser.js`: `components-public-api` allows a component's own internals plus any
  other component's `index.ts(x)` barrel, nothing deeper; `type-files-no-runtime-imports` and
  `type-files-imported-as-type-only` govern `types.ts`; `no-uppercase-paths` and
  `component-name-kebab-case` force kebab-case paths.
- `scripts/check-test-structure.sh` fails on any `*.test.*` outside the root `tests/` tree.
- `jest.setup.ts` imports `./i18n`, initializing i18next from `i18n/localization.json` with
  `lng: 'en'`; `.storybook/preview.tsx` initializes the same resources for Storybook.
- `react-i18next`'s no-instance `notReadyT` returns `optsOrDefaultValue.defaultValue` when it
  is a string, so `t(key, { defaultValue })` degrades to readable English with no instance.
  That mechanism is what makes AC8 achievable; verified in `node_modules/react-i18next`.
- `tests/visual/stories.json` feeds both `tests/visual/visual.spec.ts` and
  `tests/e2e/stories.smoke.spec.ts`; the latter asserts zero `pageerror` per story, which
  matters because our stories throw on purpose.
- `api-extractor.json` rolls up `src/components/index.ts`; a type reachable from an exported
  symbol should itself be exported to keep `ae-forgotten-export` quiet.

### Cross-Cutting Concerns Identified

- **Fault containment vs. self-inflicted failure.** Everything on the error path is a last line
  of defence; a throw there re-enters the same boundary and reproduces the blank page.
- **Accessibility.** The default fallback needs `role="alert"` and real text; a consumer
  fallback is the consumer's responsibility and gets no injected semantics.
- **Internationalization.** One new key, `error_boundary.default_message`, in `en` and `uk`,
  with an identical English `defaultValue` constant so both resolution paths render the same
  string and the visual baseline stays deterministic.
- **Observability.** `onError` is the seam #93 will use; the toolkit reports nowhere.
- **Backward compatibility.** Additive props only, but a rejecting `UiForm` submit changes
  observable behaviour (Decision 6, Gap Analysis).

## Starter Template Evaluation

### Primary Technology Domain

React 19 + TypeScript 5 + MUI 9 library, bundled by `build.config.mjs`, tested with
esbuild-jest + Testing Library, Playwright (e2e/visual) and Stryker.

### Existing Technical Preferences Identified

Kebab-case `src/components/<name>/` folders holding `index.tsx`, `types.ts`, optional
`styles.ts`, sub-component files and `<name-without-ui-prefix>.stories.tsx`; one default export
per folder re-exported from `src/components/index.ts`; dev-only guidance through
`src/utils/dev-warn.ts`; tests only under the root `tests/` tree.

### Foundation Options Considered

| Option                                   | Verdict                                           |
| ---------------------------------------- | ------------------------------------------------- |
| Depend on `react-error-boundary`         | Rejected: NFR17 forbids a new runtime dependency  |
| Hook-based boundary                      | Impossible: React has no render-throw hook        |
| Hand-rolled class + module decomposition | **Selected**: matches repo layout and gate budget |

### Initialization Command

```text
# No starter initialization applies. Brownfield extension of ui-toolkit.
```

### Architectural Decisions Provided by Selected Foundation

Folder layout, naming, barrel export and drift-guard update are dictated by the repository; the
class shell shape is dictated by React's error-handling API; fallback order and reset semantics
follow the norm set by `react-error-boundary` (render-prop first, then node, then default;
shallow key compare) so consumer expectations transfer without importing that package.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical (block implementation):** component decomposition and file layout; the `types.ts`
contract and the exported/internal symbol boundary; fallback resolution and the default
fallback; `resetKeys` semantics and recovery.

**Important (shape architecture):** `onError` contract and dev diagnostics; the `UiForm`
rejection contract; the quality-gate conformance budget; test, story, visual and doc
architecture.

**Deferred (post-MVP):** telemetry sink behind `onError` (#93); generalized dev diagnostics
(#77); boundaries inside existing toolkit components (#70).

### Decision 1: Component Decomposition & File Layout

Five source files in `src/components/ui-error-boundary/`, each with one responsibility, sized
so no file approaches the per-file `nom` ceilings.

| File                   | Contents                                               |
| ---------------------- | ------------------------------------------------------ |
| `index.tsx`            | `class UiErrorBoundary` (default export), nothing else |
| `fallback-view.tsx`    | `FallbackView`: fallback resolution and rendering      |
| `default-fallback.tsx` | `DefaultFallback`: `role="alert"` translated message   |
| `types.ts`             | props, state and public helper types                   |
| `styles.ts`            | literal `sx` objects for the default fallback          |

**Why the class file holds no module-scope functions:** `rust-code-analysis` counts TS class
methods toward the file's `nom.functions` (ceiling 10). The class needs nine methods
(Decision 7), so `index.tsx` must contain zero module-level functions. Every helper is either a
private method on the class or a sibling file.

**Why the two fallback files are `.tsx`:** Stryker mutates `src/components/**/*.tsx` only.
Keeping fallback resolution and the default message in `.tsx` puts the logic the acceptance
criteria care about inside the mutation gate rather than outside it.

```tsx
const NO_ERROR: UiErrorBoundaryState = { error: null };

export default class UiErrorBoundary extends React.Component<
  UiErrorBoundaryProps,
  UiErrorBoundaryState
> {
  constructor(props: UiErrorBoundaryProps) {
    super(props);
    this.state = NO_ERROR;
    this.resetBoundary = this.resetBoundary.bind(this);
  }
  public static getDerivedStateFromError(error: Error): UiErrorBoundaryState {
    return { error };
  }
  public componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.reportBoundaryError(error, info);
  }
  public componentDidUpdate(prevProps: UiErrorBoundaryProps): void {
    if (this.state.error === null) {
      return;
    }
    if (this.shouldResetFromKeys(prevProps)) {
      this.resetBoundary();
    }
  }
  public render(): React.ReactNode {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }
    return this.renderFallback(error);
  }
  private resetBoundary(): void {
    this.setState(NO_ERROR);
  }
  private shouldResetFromKeys(prevProps: UiErrorBoundaryProps): boolean {
    const previous: unknown[] = prevProps.resetKeys ?? [];
    const next: unknown[] = this.props.resetKeys ?? [];
    if (previous.length !== next.length) {
      return true;
    }
    return next.some((key, index) => !Object.is(key, previous[index]));
  }
  private reportBoundaryError(error: Error, info: React.ErrorInfo): void {
    const { onError } = this.props;
    if (onError) {
      onError(error, info);
      return;
    }
    devWarn(MISSING_ON_ERROR_WARNING);
  }
  private renderFallback(error: Error): React.ReactElement {
    return <FallbackView fallback={this.props.fallback} error={error} reset={this.resetBoundary} />;
  }
}
```

Member order follows `member-ordering` defaults: constructor, public static method, public
instance methods, private instance methods. No class _fields_ are declared: `state` is assigned
in the constructor and `resetBoundary` is a bound private method, not an arrow field. That is
deliberate. It keeps the class attribute count at zero (Decision 7) and gives the `reset` handed
to a render-prop fallback a stable identity across renders.

### Decision 2: `types.ts` Contract and the Exported/Internal Boundary

```ts
import type { ErrorInfo, ReactNode } from 'react';

export type UiErrorBoundaryReset = () => void;

export type UiErrorBoundaryFallbackRender = (
  error: Error,
  reset: UiErrorBoundaryReset
) => ReactNode;

export type UiErrorBoundaryFallback = ReactNode | UiErrorBoundaryFallbackRender;

export type UiErrorBoundaryErrorHandler = (error: Error, info: ErrorInfo) => void;

export interface UiErrorBoundaryProps {
  children: ReactNode;
  fallback?: UiErrorBoundaryFallback;
  onError?: UiErrorBoundaryErrorHandler;
  resetKeys?: unknown[];
}

export interface UiErrorBoundaryState {
  error: Error | null;
}
```

**Why all six are exported:** `UiErrorBoundaryState` is reachable through
`React.Component<Props, State>` on the default export and the fallback aliases through
`UiErrorBoundaryProps`, so exporting them keeps `api-extractor` from raising
`ae-forgotten-export`. `types.ts` is excluded from `collectCoverageFrom` and from the Stryker
glob, so exporting types costs nothing on either gate. `types.ts` imports React types with
`import type` and every consumer imports it with `import type`, satisfying both type rules.

**Internal symbols that must never reach `src/components/index.ts`:** `FallbackView`,
`DefaultFallback`, `MISSING_ON_ERROR_WARNING`, `FALLBACK_KEY`, `FALLBACK_MESSAGE` and the
`styles` object. Each is exported from its own module only because exactly one sibling imports
it; `esbuild-jest` counts an export as an uncovered function only when nothing imports it.
`FallbackView`'s props type stays a local, non-exported type in `fallback-view.tsx` because it
is not reachable from the public API.

### Decision 3: Fallback Resolution and the Default Fallback

Resolution order is render-prop > node > default, decided in exactly one place:

```tsx
function FallbackView({ fallback, error, reset }: FallbackViewProps): React.ReactElement {
  if (typeof fallback === 'function') {
    return <>{fallback(error, reset)}</>;
  }
  if (fallback == null) {
    return <DefaultFallback />;
  }
  return <>{fallback}</>;
}
```

Three exits (`nexits<=3`), one parameter, `lloc` well under 10. **Nullish, not undefined:** both
`undefined` and an explicit `null` resolve to the default, because the never-blank guarantee
outranks a consumer's ability to render nothing; the README says so.

**`DefaultFallback` takes no props and never renders `error.message`.** That one decision serves
NFR2 (an `Error` with no message still yields visible output), FR9 (no property access on the
error object on the failure path) and a deterministic visual baseline. The message reaches the
consumer through `onError`, or through the dev warning when no handler is attached.

```tsx
export const FALLBACK_KEY: string = 'error_boundary.default_message';
export const FALLBACK_MESSAGE: string = 'Something went wrong while displaying this section.';

export default function DefaultFallback(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <UiTypography role="alert" sx={styles.fallback}>
      {t(FALLBACK_KEY, { defaultValue: FALLBACK_MESSAGE })}
    </UiTypography>
  );
}
```

**No-throw rules for the failure path** (enforced by review, asserted by tests): no theme
callback in `sx` (`styles.fallback` holds literal values only, including the hex `#DC3939`
copied from `sharedPalette.error.main` with a source comment, so the fallback performs no
cross-module runtime lookup); no property access on `error`; no optional-chaining gaps, no
`JSON.stringify`, no date or number formatting; only `UiTypography` and plain text render.

**i18n:** `i18n/localization.json` gains `error_boundary.default_message` under `en` and `uk`.
The `en` value is byte-identical to `FALLBACK_MESSAGE`, so the initialized path and the
`defaultValue` path render the same string. `UiTypography` already forwards `role`.

### Decision 4: `resetKeys` Semantics and Recovery

- **Comparison:** normalize both sides with `?? []`, compare lengths, then element-wise
  `Object.is`. Total, cheap, no deep traversal (NFR16). `Object.is` rather than `===` so a `NaN`
  key does not read as a change on every render.
- **Omitted or empty means no automatic reset** with no special case: two empty arrays have
  equal length and `some` over an empty array is `false`, so moving between `undefined` and `[]`
  also does nothing.
- **Guarded by error state:** `componentDidUpdate` returns immediately when
  `state.error === null`, so a healthy boundary is never touched by a key change (FR16).
- **Remount on recovery (FR17) needs no key.** React discards the failed subtree when a boundary
  catches, so re-rendering `this.props.children` after `error` returns to `null` builds a fresh
  tree. A `resetCount`-in-state design was rejected: its `+ 1` yields an arithmetic mutant
  (`- 1`) that is behaviourally equivalent and unkillable, costing mutation score for nothing.
- **Repeated failures (NFR4):** state is one nullable field; a second failure overwrites it.

### Decision 5: `onError` Contract and Dev Diagnostics

- **Exactly once per error (FR12):** `onError` is called only from `componentDidCatch`, which
  React invokes once per caught error in the commit phase. `getDerivedStateFromError`, which
  React double-invokes under StrictMode, stays pure and never reports; re-rendering the fallback
  does not re-enter `componentDidCatch`.
- **Signature** `(error: Error, info: React.ErrorInfo) => void`, passed through untouched so the
  consumer receives React's `componentStack`.
- **Dev diagnostics reuse `src/utils/dev-warn.ts` unchanged** (#77 is out of scope). The
  component does **not** inline its own `process.env.NODE_ENV` check the way
  `src/components/ui-input/index.tsx:35-61` does: `devWarn` already performs the production
  strip, and re-implementing it locally would add an environment-dependent branch that the 100%
  coverage gate would then demand both halves of. `ui-card-list/index.tsx` and
  `ui-image/index.tsx` already delegate this way.
- **The one boundary diagnostic:** when an error is caught with no `onError` supplied,
  `reportBoundaryError` emits `MISSING_ON_ERROR_WARNING`, text
  `'UiErrorBoundary caught an error but no onError handler was supplied.'`. It fires from the
  commit phase, once per caught error, so no effect keying and no `useDevWarning` are needed.
- **No `console.error` mirroring.** React already logs caught errors; duplicating it would add
  noise and a second gate-relevant branch.

### Decision 6: `UiForm` Rejection Contract

New prop `onSubmitError?: (error: unknown) => void`. `unknown`, not `Error`, because a rejected
consumer promise can carry anything. Three coordinated edits in
`src/components/ui-form/index.tsx`: (1) add the prop to `UiFormProps`; (2) add
`'onSubmitError'` to the `Omit<...>` union that builds `FormViewProps` and destructure it in
`UiForm`'s signature so it never leaks into the `...view` rest that `FormBody` renders (the
file's own comment at lines 47-49 warns about exactly this); (3) add it to
`SubmitHandlerOptions<T>` and rewrite `buildSubmitHandler`.

```ts
const UNHANDLED_SUBMIT_REJECTION_WARNING: string =
  'UiForm caught a rejected onSubmit; pass onSubmitError to handle it.';

function reportSubmitError(error: unknown, onSubmitError?: SubmitErrorHandler): void {
  if (onSubmitError) {
    onSubmitError(error);
    return;
  }
  devWarn(UNHANDLED_SUBMIT_REJECTION_WARNING);
}

function buildSubmitHandler<T extends FieldValues>({
  onSubmit,
  methods,
  defaultValues,
  resetOnSuccess,
  onSubmitError,
}: SubmitHandlerOptions<T>): SubmitHandler<T> {
  return async (data, event) => {
    try {
      await onSubmit(data, event);
    } catch (error) {
      reportSubmitError(error, onSubmitError);
      return;
    }

    if (resetOnSuccess) {
      methods.reset(defaultValues);
    }
  };
}
```

**Reset is skipped on failure (FR22)** because the `catch` returns before the `resetOnSuccess`
branch; `return` rather than `else` keeps the closure at two exits and leaves the reset branch
textually untouched, so the existing reset tests stay meaningful.

**Backward compatibility:** no existing prop changes name, type, default or position, and
`onSubmitError` is optional, so every current call site type-checks unchanged. `submitting` is
still `isSubmitting ?? methods.formState.isSubmitting` and is unaffected, since
`react-hook-form` clears `isSubmitting` in a `finally` either way. Rendered output is identical.
The only observable change is the one the PRD asks for: the rejection is contained, not
re-thrown.

**Documented nuance (NFR6):** because the rejection no longer escapes, `react-hook-form` now
treats the submit as successful, so `formState.isSubmitSuccessful` becomes `true` after a
rejected submit. Consumers must use `onSubmitError` (or the existing `error` display prop) as
the failure signal. This goes in the README and is raised as an open question.

### Decision 7: Quality-Gate Conformance Budget

Every function is named and pre-sized so the implementer does not discover a breach late:

| Function                   | File                   | args | exits | lloc |
| -------------------------- | ---------------------- | ---- | ----- | ---- |
| `constructor`              | `index.tsx`            | 1    | 0     | 3    |
| `getDerivedStateFromError` | `index.tsx`            | 1    | 1     | 1    |
| `componentDidCatch`        | `index.tsx`            | 2    | 0     | 1    |
| `componentDidUpdate`       | `index.tsx`            | 1    | 1     | 5    |
| `render`                   | `index.tsx`            | 0    | 2     | 4    |
| `resetBoundary`            | `index.tsx`            | 0    | 0     | 1    |
| `shouldResetFromKeys`      | `index.tsx`            | 1    | 2     | 5    |
| `reportBoundaryError`      | `index.tsx`            | 2    | 1     | 5    |
| `renderFallback`           | `index.tsx`            | 1    | 1     | 2    |
| `FallbackView`             | `fallback-view.tsx`    | 1    | 3     | 5    |
| `DefaultFallback`          | `default-fallback.tsx` | 0    | 1     | 3    |
| `reportSubmitError`        | `ui-form/index.tsx`    | 2    | 1     | 4    |
| `buildSubmitHandler`       | `ui-form/index.tsx`    | 1    | 1     | 2    |
| submit closure             | `ui-form/index.tsx`    | 2    | 1     | 7    |

**Per file:** `index.tsx` holds 9 functions (all class methods) and 1 closure (the `some`
callback): 9 of a 10 `nom_functions` ceiling and 10 of a 15 `nom_total` ceiling. That is why no
module-level function may live there. The two fallback files hold one function each.

**Per class, the sharp edge.** `class_coa_max` is checked against `npm.classes_average` (public
methods over all methods) and `class_cda_max` against `npa.classes_average` (public attributes
over all attributes). A naive React class component is 100% public on both, i.e. `coa = 1.0`
and `cda = 1.0`, breaching 0.6 and 0.25. The design answers both without touching policy:

- **`cda`:** declare no class fields at all. `state` is assigned in the constructor (the
  `React.Component` base already declares `state: Readonly<S>`) and `resetBoundary` is a bound
  method, not an arrow field. With zero attributes, `npa.classes` is `0` (ceiling 2) and
  `npa.classes_average` is absent, which `scripts/lint-metrics.sh` null-skips via its `// null`
  guards.
- **`coa`:** five public members (constructor, `getDerivedStateFromError`, `componentDidCatch`,
  `componentDidUpdate`, `render`) against four private ones (`resetBoundary`,
  `shouldResetFromKeys`, `reportBoundaryError`, `renderFallback`) gives `5 / 9 = 0.56 <= 0.6`.
  The four private methods are genuine decomposition, not padding: each is a unit the
  per-function table already requires.
- `wmc` is about 12 against a ceiling of 30; `npm = 5 <= 8`. This is the first class in `src/`,
  so these thresholds have never run against real input, hence the mandatory spike below.

**Coverage:** `types.ts` is excluded; `styles.ts` is a plain object with no functions, covered by
being imported. Every function above is reached by a Decision 8 test, and no `process.env`
branch is introduced anywhere (Decision 5), so there is no environment-dependent half-branch.

**Mutation:** mutated files are `ui-error-boundary/index.tsx`, `fallback-view.tsx`,
`default-fallback.tsx` and `ui-form/index.tsx`; `types.ts` and `styles.ts` are `.ts` and lie
outside the glob. Mutant families and their killers are in Decision 8.

### Decision 8: Test, Story, Visual and Documentation Architecture

Test files live in the root `tests/` tree with descriptive kebab-case names, never issue
numbers:

| Path                                                                  | Proves        |
| --------------------------------------------------------------------- | ------------- |
| `tests/unit/ui-error-boundary.test.tsx`                               | AC2, AC3, AC8 |
| `tests/unit/ui-form-submit-errors.test.tsx`                           | AC4           |
| `tests/integration/components/ui-error-boundary.integration.test.tsx` | AC1 (NFR1)    |
| `tests/unit/utils/mock-console-error.ts`                              | helper only   |
| `tests/unit/components-index.test.ts` (modified)                      | AC1 drift     |
| `tests/visual/stories.json` (modified)                                | AC7 manifest  |

**Throwing child**, declared locally per suite; no `data-testid` anywhere:

```tsx
function Boom({ shouldThrow }: { shouldThrow: boolean }): React.ReactElement {
  if (shouldThrow) {
    throw new Error('boom');
  }
  return <p>healthy child</p>;
}
```

Selectors stay semantic: `screen.getByText('healthy child')`, `screen.getByRole('alert')`,
`screen.getByRole('button', { name: 'Try again' })`.

**Console noise:** React logs every caught error through `console.error`. Add
`tests/unit/utils/mock-console-error.ts` mirroring the existing
`tests/unit/utils/mock-console-warn.ts` (same `beforeEach`/`afterEach` spy plus live-handle
shape). `devWarn` assertions reuse `mock-console-warn`.

**`tests/unit/ui-error-boundary.test.tsx` cases:**

1. healthy children render and no `alert` is present;
2. a throwing child renders the default fallback with `role="alert"` and the English text while
   sibling markup stays mounted (AC2);
3. `onError` is called exactly once with an `Error` and an object carrying `componentStack`,
   asserted with `toHaveBeenCalledTimes(1)` after forcing an extra fallback re-render (FR12);
4. with no `onError`, the dev warning is emitted once;
5. a `ReactNode` fallback renders verbatim and receives no injected `role`;
6. explicit `fallback={null}` still renders the default (nullish rule);
7. a render-prop fallback receives the thrown `Error` and a `reset`; clicking its button clears
   the error and re-renders children (AC3);
8. remount proof: the recovered child's mount effect fires a second time and its internal state
   is back to the initial value (FR17);
9. `resetKeys` value change recovers; length change recovers; identical keys keep the fallback;
   a key change while healthy leaves children mounted and untouched (FR15, FR16);
10. a `NaN` key compared with `NaN` does not trigger a reset (pins `Object.is` over `===`);
11. AC8: render inside `<I18nextProvider i18n={bareInstance}>`, where `bareInstance` is
    initialized with empty resources, and assert `FALLBACK_MESSAGE`. This fails if the
    implementation drops `defaultValue`, because the raw key would render instead;
12. an `Error` built with no message still renders the fallback text (NFR2).

**`tests/unit/ui-form-submit-errors.test.tsx` cases (AC4):**

1. register `process.on('unhandledRejection')` in `beforeEach` and remove it in `afterEach`;
   submit a form whose `onSubmit` rejects, flush microtasks, assert it never fired;
2. `onSubmitError` receives the exact rejection value, once;
3. with `resetOnSuccess` set, the typed value is still in the field after a failed submit, so
   `methods.reset` was not called;
4. the happy path still resets, proving the branch was not inverted;
5. with no `onSubmitError`, the dev warning fires and there is still no unhandled rejection;
6. a non-`Error` rejection value (a string) is forwarded unchanged, pinning `unknown`;
7. the submit button is re-enabled afterwards, proving `submitting` semantics are unchanged.

**Integration suite:** render a real composed subtree, a sibling region plus a boundary wrapping
a real toolkit component fed a throwing child, assert the sibling region is still interactive
after the throw (NFR1, FR3), then recover through `resetKeys` and assert the real subtree
renders again. `jest.integration.config.ts` enforces 100% coverage over an explicit file list;
leave that list unchanged and let the unit tier own coverage, as its comment describes for leaf
components.

**Mutation hardening map:**

| Mutant                                      | Killed by               |
| ------------------------------------------- | ----------------------- |
| `previous.length !== next.length` to `true` | case 9 identical keys   |
| same, to `false`                            | case 9 length change    |
| `!Object.is(...)` to `Object.is(...)`       | case 9 value change     |
| `some` callback to `true` / `false`         | cases 9 and 10          |
| `state.error === null` early return removed | case 9 healthy boundary |
| `typeof fallback === 'function'` inverted   | cases 5 and 7           |
| `fallback == null` to `!= null`             | cases 2, 5 and 6        |
| `FALLBACK_MESSAGE` emptied                  | cases 2 and 11          |
| `FALLBACK_KEY` emptied                      | case 11                 |
| `role="alert"` removed or emptied           | case 2 via `getByRole`  |
| `if (onError)` inverted                     | cases 3 and 4           |
| `if (onSubmitError)` inverted               | form cases 2 and 5      |
| `if (resetOnSuccess)` inverted              | form cases 3 and 4      |
| `catch` block `return` removed              | form case 3             |

**Stories** live in `src/components/ui-error-boundary/error-boundary.stories.tsx` (the repo
strips the `ui-` prefix from story filenames), title `UiComponents/UiErrorBoundary`:

| Export               | Story id                                             |
| -------------------- | ---------------------------------------------------- |
| `DefaultFallback`    | `uicomponents-uierrorboundary--default-fallback`     |
| `CustomNodeFallback` | `uicomponents-uierrorboundary--custom-node-fallback` |
| `RenderPropFallback` | `uicomponents-uierrorboundary--render-prop-fallback` |

Each story renders a module-scope child that throws unconditionally during render, so every load
produces the same committed pixels: no timers, no random values, no error text echoed into the
DOM. The render-prop story renders a static "Try again" `UiButton` wired to `reset` and the
baseline captures its rest state only. `argTypes` mark `fallback` and `children` as
`control: false` so the docs page cannot mutate the snapshot.

**Visual and e2e wiring:** add the three ids to `tests/visual/stories.json` in the file's
existing per-component grouping, then generate
`tests/visual/visual.spec.ts-snapshots/<id>-chromium-linux.png` inside the pinned Playwright
Docker image with `tests/` bind-mounted so the PNGs persist to the host. The same manifest feeds
`tests/e2e/stories.smoke.spec.ts`, which asserts zero `pageerror` per story; that is expected to
hold because React 19 routes a _caught_ error to `onCaughtError` and `console.error` and calls
`reportError()` (which raises a window `error` event) only for _uncaught_ ones. Confirm on the
first `make test-e2e` run.

**README `## Error handling` section outline** (new top-level section after `## Project
Layout`):

1. Why the toolkit ships a boundary: one bad prop must not blank a page.
2. `UiErrorBoundary` quick start, imported from the package root.
3. What it catches: render, lifecycle and constructor errors below it.
4. What it does **not** catch: event handlers, async code, server rendering, and errors thrown
   by the fallback itself, with the explicit link that this is exactly why `UiForm` carries its
   own contract.
5. The three fallback modes, including that `null` does not suppress the default.
6. The two recovery paths: `reset` from a render-prop fallback, and `resetKeys`.
7. `onError`: once per error, with React's `ErrorInfo`; the toolkit reports nowhere.
8. Accessibility: the default fallback is `role="alert"`; a consumer fallback is the consumer's
   responsibility and gets no injected semantics.
9. The `UiForm` rejection contract: `onSubmitError`, no reset on failure, the dev warning when
   no handler is attached, how it relates to the existing `error` display prop, and the
   `formState.isSubmitSuccessful` nuance from Decision 6.
10. "No migration required": the change is additive.

### Decision Impact Analysis

Decision 1 fixes the paths every later decision references and is why `index.tsx` carries no
module functions. Decision 2 makes `types.ts` the single home of public types, keeping
`api-extractor` quiet and the coverage denominator clean. Decision 3 turns the reliability
requirement into reviewable prohibitions. Decision 4 deletes a class of unkillable mutants by
removing the reset counter. Decision 5 removes the only environment-dependent branch the
component could have had, which is what makes 100% coverage cheap. Decision 6 is the only source
of observable behaviour change and therefore the only one needing a compatibility note.
Decision 7 is what forces the private-method decomposition in Decision 1: the class shape is a
metrics decision as much as a React one. Decision 8 turns every acceptance criterion into a
named test case and every risky mutant into a named killer.

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

- "Push logic into module functions" (PRD) versus the `nom_functions<=10` per-file ceiling and
  the `class_coa_max` ratio. Resolved by pushing logic into **private class methods** in
  `index.tsx` and into **sibling `.tsx` modules** for anything that renders.
- "Never export internal symbols" (coverage) versus "export everything reachable"
  (`api-extractor`). Resolved by the type/runtime split: types exported freely from `types.ts`
  (excluded from coverage), runtime internals exported only to their single importer.
- Mutation-score pressure versus behaviourally equivalent code. Resolved by removing the reset
  counter rather than writing tests that cannot distinguish `+1` from `-1`.

### Naming Patterns

- Directory `src/components/ui-error-boundary/`; files `index.tsx`, `fallback-view.tsx`,
  `default-fallback.tsx`, `types.ts`, `styles.ts`, `error-boundary.stories.tsx`.
- Component identifier `UiErrorBoundary`; barrel line
  `export { default as UiErrorBoundary } from './ui-error-boundary';`.
- Types `UiErrorBoundaryProps`, `UiErrorBoundaryState`, `UiErrorBoundaryFallback`,
  `UiErrorBoundaryFallbackRender`, `UiErrorBoundaryReset`, `UiErrorBoundaryErrorHandler`.
- Constants `MISSING_ON_ERROR_WARNING`, `UNHANDLED_SUBMIT_REJECTION_WARNING`, `FALLBACK_KEY`,
  `FALLBACK_MESSAGE`; i18n key `error_boundary.default_message`.
- Tests `ui-error-boundary.test.tsx`, `ui-form-submit-errors.test.tsx`,
  `ui-error-boundary.integration.test.tsx`; helper `mock-console-error.ts`.

### Structure Patterns

One responsibility per file; the class file holds only the class. Cross-component runtime
imports go through the target barrel (`../ui-typography`); shared utilities come from
`../../utils/dev-warn`, matching `ui-card-list` and `ui-image`. Tests live only under the root
`tests/` tree, helpers under `tests/unit/utils/`.

### Format Patterns

`import type` for every type-only import; explicit return type on every function and method;
explicit `public`/`private` on every class member with no keyword on the constructor; no prop
spreading; line length 100 in source and in this spec (bytes, ASCII only).

### Process Patterns

Write the branch matrix (Decision 8) before implementing, then implement to it. Run the metrics
spike before freezing the class shape. Regenerate visual baselines only inside the pinned
Playwright image with `tests/` mounted. Update `tests/unit/components-index.test.ts` in the same
commit as the barrel line.

### Enforcement Guidelines

**Must:** keep `index.tsx` free of module-scope functions; keep the failure path free of theme
callbacks, error-property access and anything that can throw; pass `defaultValue` to every `t()`
call in the fallback; keep `onSubmitError` in the `FormViewProps` `Omit` union; export
`UiErrorBoundary` from `src/components/index.ts` and nothing else from the folder.

**Anti-patterns:** declaring class fields (breaks the `cda` ratio) or arrow-function class
members; inlining a `process.env.NODE_ENV` check instead of calling `devWarn`; adding a
`resetCount` or `key` remount counter; rendering `error.message` in the default fallback; using
`data-testid` or naming a test after the issue number; relaxing any threshold in
`config/metrics-policy.json`, `stryker.config.mjs` or `jest.config.ts` to make the code fit.

## Project Structure & Boundaries

### Target-state Repository Change Delta

(target-state, planning only; none of these files are part of this document)

| Path                                                                  | Change   |
| --------------------------------------------------------------------- | -------- |
| `src/components/ui-error-boundary/index.tsx`                          | new      |
| `src/components/ui-error-boundary/fallback-view.tsx`                  | new      |
| `src/components/ui-error-boundary/default-fallback.tsx`               | new      |
| `src/components/ui-error-boundary/types.ts`                           | new      |
| `src/components/ui-error-boundary/styles.ts`                          | new      |
| `src/components/ui-error-boundary/error-boundary.stories.tsx`         | new      |
| `tests/unit/ui-error-boundary.test.tsx`                               | new      |
| `tests/unit/ui-form-submit-errors.test.tsx`                           | new      |
| `tests/unit/utils/mock-console-error.ts`                              | new      |
| `tests/integration/components/ui-error-boundary.integration.test.tsx` | new      |
| `src/components/index.ts`                                             | modified |
| `src/components/ui-form/index.tsx`                                    | modified |
| `tests/unit/components-index.test.ts`                                 | modified |
| `tests/visual/stories.json`                                           | modified |
| `i18n/localization.json`                                              | modified |
| `README.md`                                                           | modified |

Plus three generated PNG baselines under `tests/visual/visual.spec.ts-snapshots/`.

### Architectural Boundaries

**Public API:** `src/components/index.ts` is the only public surface and gains one line. No deep
import path into `ui-error-boundary/` is supported or documented.

**Component:** `ui-error-boundary/` imports `../ui-typography` (a barrel) and
`../../utils/dev-warn`. It imports no other component and no other component imports it.
`UiForm` is not wrapped in a boundary by this work (#70 scope).

**Consumer:** the toolkit catches and displays; it never reports, retries, persists or
schedules. `onError` hands ownership to the consumer at the first opportunity.

**Type:** `types.ts` is type-only in both directions, satisfying both `dependency-cruiser` type
rules.

**Why zero new `dependency-cruiser` violations:** the only cross-component runtime edge is
`default-fallback.tsx` to `src/components/ui-typography/index.tsx`, which `components-public-api`
allows through its `^src/components/[^/]+/index[.](?:ts|tsx)$` exception, exactly as
`ui-form/index.tsx` already does. Intra-folder edges (`index.tsx` to `fallback-view.tsx` to
`default-fallback.tsx`) are allowed by the same rule's own-component exception, and
`src/components/index.ts` importing `./ui-error-boundary` resolves to that folder's `index.tsx`,
again a barrel. All paths are kebab-case, satisfying `no-uppercase-paths` and
`component-name-kebab-case`.

### Requirements-to-Structure Mapping

| Requirements    | Covered by                                                |
| --------------- | --------------------------------------------------------- |
| FR1-FR3, NFR1   | Decision 1, the class in `index.tsx`                      |
| FR4, NFR11      | Decision 2, `types.ts` and the export/internal boundary   |
| FR5-FR9, NFR2   | Decision 3, `DefaultFallback` and the no-throw rules      |
| FR10            | Decision 3, `FallbackView` resolution order               |
| NFR7-NFR9       | Decision 3, `role="alert"`, text only, `defaultValue`     |
| FR11-FR13       | Decision 5, `componentDidCatch` plus `devWarn` delegation |
| FR14-FR17, NFR4 | Decision 4, bound `reset`, key compare, subtree discard   |
| NFR16           | Decision 4, guarded shallow `Object.is` compare           |
| FR18, FR19      | Decision 1 and Boundaries, barrel export, no deep imports |
| FR20            | Decision 8, `components-index.test.ts` update             |
| FR21-FR24, NFR3 | Decision 6, `buildSubmitHandler` plus `reportSubmitError` |
| NFR5, NFR6      | Decision 6, optional prop plus the documented nuance      |
| FR25, FR26      | Decision 8, three stories plus `stories.json` entries     |
| FR27, FR28      | Decision 8, README "Error handling" outline               |
| NFR10           | Decision 7, per-function budget table                     |
| NFR12           | Naming patterns, kebab-case everywhere                    |
| NFR13-NFR15     | Decision 8, placement, semantic selectors, mutation map   |
| NFR17           | Foundation options, no new runtime dependency             |

### Integration Points

**Barrel:** one line appended to `src/components/index.ts`, and `'UiErrorBoundary'` added to
`expectedPublicExports` in `tests/unit/components-index.test.ts` (35 entries become 36).
**Locale:** `i18n/localization.json` gains `error_boundary.default_message` in `en` and `uk`,
with the `en` value equal to `FALLBACK_MESSAGE` byte for byte. **Manifest:** three entries in
`tests/visual/stories.json`, consumed by the visual and e2e suites. **Form:** three edits inside
`src/components/ui-form/index.tsx`; no other component changes.

### Data Flow

```text
descendant throws during render
  -> React unwinds to the nearest boundary and discards the failed subtree
    -> static getDerivedStateFromError(error) -> { error }
      -> render() sees state.error != null -> renderFallback(error)
        -> FallbackView: function? -> fallback(error, reset)
                         nullish?  -> <DefaultFallback />  (role=alert, t + defaultValue)
                         node?     -> the node as given
      -> componentDidCatch(error, info)
        -> onError ? onError(error, info) : devWarn(MISSING_ON_ERROR_WARNING)   (once)

recovery
  reset()                     -> setState({ error: null }) -> children remount
  resetKeys change (in error) -> componentDidUpdate -> shouldResetFromKeys -> reset()
  resetKeys change (healthy)  -> componentDidUpdate returns immediately, nothing happens

UiForm submit
  handleSubmit -> await onSubmit(data, event)
    resolved -> resetOnSuccess ? methods.reset(defaultValues) : noop
    rejected -> catch -> reportSubmitError
                  -> onSubmitError ? onSubmitError(error) : devWarn(...)
                  -> return   (reset skipped, no rejection escapes)
```

## Architecture Validation Results

### Coherence Validation

The eight decisions chain without conflict: the class shape (Decision 1) is the shape the
metrics budget (Decision 7) requires; the type split (Decision 2) is what lets the coverage gate
and `api-extractor` both pass; the counter-free recovery (Decision 4) is what makes the mutation
map (Decision 8) achievable; the `devWarn` delegation (Decision 5) keeps the coverage
denominator branch-free. Folder layout, barrel export, `types.ts` split, `styles.ts`, story
filename convention and root-`tests/` placement all mirror `ui-input`, `ui-card-list`,
`ui-image` and `ui-form`; the only novelty is the class, confined to one file.

### Requirements Coverage Validation

All 28 functional and 17 non-functional requirements are mapped above. Every acceptance
criterion has a named owner: AC1 barrel plus drift guard plus `dependency-cruiser`; AC2, AC3 and
AC8 the unit boundary suite; AC4 the form suite; AC5 the mutation map; AC6 the README outline;
AC7 the three stories, manifest entries and baselines.

### Gap Analysis Results

**Blocking: the class-metrics spike must run before the class shape is frozen.** `src/` contains
no class today, so `class_coa_max` (0.6) and `class_cda_max` (0.25) have never been evaluated
against real input, and both are ratios a naive React class fails outright. Decision 7 designs
around them, but the numbers must be confirmed by running `make lint-metrics` against a minimal
committed-shape class before the rest of the work is built on it. Three outcomes: (1) no class
metrics are emitted for `.tsx`, so nothing to do and the private-method decomposition stays
anyway because it also serves the per-function budget; (2) metrics appear and the designed shape
passes, so proceed unchanged; (3) metrics appear and the shape still breaches, so escalate to
the repository owner. Do **not** edit `config/metrics-policy.json`: the standing instruction is
to refactor code to pass the gate, never to calibrate the gate.

**Important: the e2e story-smoke `pageerror` assertion.** `tests/e2e/stories.smoke.spec.ts`
fails a story if the page raises any `pageerror`, and our three stories deliberately throw.
React 19 routes a caught error to `onCaughtError` and `console.error` and calls `reportError()`
only for uncaught errors, so a boundary-contained throw should not register. Confirm on the
first `make test-e2e` run; if it does register, make the story reach the fallback without an
uncaught throw, and never weaken the smoke assertion.

**Important: `formState.isSubmitSuccessful` after a contained rejection.** Containing the
rejection makes `react-hook-form` treat the submit as successful, so a consumer keying off
`isSubmitSuccessful` changes behaviour silently. Mitigation: document it in the README and the
release notes, with `onSubmitError` as the supported failure signal. Raised as an open question
in case the owner prefers also calling `methods.setError('root', ...)`, a larger, non-additive
change.

**Minor: integration-tier coverage scope.** `jest.integration.config.ts` enforces 100% coverage
over an explicit file list; adding `ui-error-boundary` would require the integration suite alone
to cover every branch. Recommendation: leave the list untouched, unit tier owns coverage.

**Minor: visual baselines.** New PNGs must be generated inside the pinned Playwright image with
`tests/` bind-mounted, and the image-actions workflow recompresses newly committed PNGs, which
can require a follow-up commit before the visual job is green.

**Minor: no Figma source.** The design board has no error-boundary component, so the default
fallback's styling is a minimal, literal-valued placeholder. Flagged in case a Figma spec should
be authored first.

### Architecture Completeness Checklist

- [x] PRD FR/NFR set enumerated and mapped; gate constraints read from the live configs
- [x] Decisions 1-8 fixed: decomposition, types contract, fallback, `resetKeys`, `onError`,
      `UiForm`, quality-gate budget, test/story/visual/doc architecture
- [x] Naming, structure, format, process and anti-patterns locked
- [x] File delta defined (10 new, 6 modified, 3 generated baselines)
- [x] Boundaries established (public API, component, consumer, type) with a zero-violation
      `dependency-cruiser` argument
- [x] Requirements-to-structure mapping complete (FR1-FR28, NFR1-NFR17)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION, gated on the class-metrics spike.

**Confidence Level:** high on the component design and the test architecture; medium on the
first-run interaction between a TypeScript class and the `rust-code-analysis` class ratios,
which is why that spike is the first implementation step.

**Key Strengths:** the reliability requirement is expressed as concrete prohibitions rather than
intent; every function is pre-sized against the metrics policy before a line is written; every
acceptance criterion has a named test case and every risky mutant a named killer; the change is
additive at the type level with the single behavioural nuance documented.

**Areas for Future Enhancement:** a telemetry sink behind `onError` (#93); generalized dev
diagnostics (#77); a repository-wide accessibility contract that would also govern the fallback
(#66); retrofitting boundaries inside composed toolkit components (#70).

### Implementation Handoff

**AI Agent Guidelines:** follow the eight decisions exactly, with locked names from "Naming
Patterns"; `index.tsx` holds the class and nothing else, helpers are private methods or sibling
files; declare no class fields, assign `state` in the constructor and bind `resetBoundary`
there; never inline a `NODE_ENV` check, call `devWarn`; never render `error.message` in the
default fallback and always pass `defaultValue` to `t()`; never relax a threshold in any config
to make the new code fit.

**First Implementation Step:** create `src/components/ui-error-boundary/` with the Decision 1
class skeleton, `types.ts` and a placeholder default fallback, run `make lint-metrics`, and
record the emitted `npm`, `npa`, `wmc`, `coa` and `cda` values for the class. Freeze the class
shape on that evidence before writing the fallback, the tests, the stories or the `UiForm`
change.
