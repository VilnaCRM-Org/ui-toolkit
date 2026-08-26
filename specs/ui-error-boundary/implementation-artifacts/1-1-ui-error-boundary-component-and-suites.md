# Story 1.1: UiErrorBoundary component, types, public export, and test suites

Status: Approved

## Story

As a consumer of `@vilnacrm/ui-toolkit`,
I want an exported error boundary that contains a render failure and offers two recovery paths,
so that one bad prop degrades a single region instead of blanking my entire page.

## Acceptance Criteria

1. **The class-metrics spike runs before anything else.** Create
   `src/components/ui-error-boundary/` holding the Decision 1 class skeleton, `types.ts`, and a
   placeholder default fallback; run `make lint-metrics`; record the emitted `npm`, `npa`, `wmc`,
   `coa`, and `cda` values for the class in the "Class-Metrics Spike Results" table in Dev Notes
   below. Do not write the real fallback, the tests, or the stories until that table is filled in.
2. If the spike shows a breach that the designed shape does not clear, **STOP and report to the
   repository owner**. `config/metrics-policy.json` is never edited, and no threshold in
   `stryker.config.mjs` or `jest.config.ts` is relaxed at any point.
3. Exactly these files are created:
   `src/components/ui-error-boundary/index.tsx`, `.../fallback-view.tsx`,
   `.../default-fallback.tsx`, `.../types.ts`, `.../styles.ts`,
   `tests/unit/ui-error-boundary.test.tsx`, `tests/unit/utils/mock-console-error.ts`,
   `tests/integration/components/ui-error-boundary.integration.test.tsx`.
4. Exactly these files are modified: `src/components/index.ts` (one appended export line) and
   `tests/unit/components-index.test.ts` (`expectedPublicExports`, 35 entries become 36).
   **`i18n/localization.json` is NOT modified** and no new locale resource file is created.
5. `index.tsx` holds `class UiErrorBoundary` as its default export and **zero module-scope
   functions**: `rust-code-analysis` counts class methods toward the file's `nom_functions`
   ceiling of 10 and the class needs nine. Every helper is a private method or a sibling file.
6. The class declares **no class fields**: `state` is assigned in the constructor and
   `resetBoundary` is a bound private method (never an arrow-function class member), keeping
   `npa.classes` at 0 and `coa` at `5 / 9 = 0.56 <= 0.6`.
7. `fallback-view.tsx` and `default-fallback.tsx` are `.tsx` files because Stryker mutates
   `./src/components/**/*.tsx` only; sibling `.ts` files are never mutated.
8. `types.ts` exports all six type symbols: `UiErrorBoundaryProps`, `UiErrorBoundaryState`,
   `UiErrorBoundaryFallback`, `UiErrorBoundaryFallbackRender`, `UiErrorBoundaryReset`, and
   `UiErrorBoundaryErrorHandler`. `make generate-ts-doc` (api-extractor) raises no
   `ae-forgotten-export`.
9. **No prop-type export is added to `src/components/index.ts`** - that file gains exactly one
   line, the `UiErrorBoundary` value export. This matches repository precedent: no other
   component publishes its props type from the barrel.
10. `FallbackView` decides fallback resolution in exactly one place, in the order render-prop,
    then node, then default. Resolution is **nullish**: both `undefined` and an explicit `null`
    resolve to `DefaultFallback`, because the never-blank guarantee outranks a consumer's ability
    to render nothing.
11. `DefaultFallback` takes no props, carries `role="alert"`, renders text through `UiTypography`
    imported from the `../ui-typography` barrel, and **never renders `error.message`**.
12. The default message resolves as `t(FALLBACK_KEY, { defaultValue: FALLBACK_MESSAGE })` where
    `FALLBACK_KEY` is `'error_boundary.default_message'` and `FALLBACK_MESSAGE` is exactly
    `'Something went wrong.'`.
13. The failure path performs no operation that can itself throw: no theme callback in `sx`, no
    property access on `error`, no `JSON.stringify`, no date or number formatting. `styles.ts`
    holds literal values only, including the hex `#DC3939` copied from `sharedPalette.error.main`
    with a source comment.
14. Dev diagnostics call `devWarn` imported from `src/utils/dev-warn.ts`, unchanged. **No inline
    `process.env.NODE_ENV` branch appears anywhere in the new folder**, so no
    environment-dependent half-branch exists for the 100% coverage gate to demand.
15. `onError(error, info)` is invoked only from `componentDidCatch`, therefore exactly once per
    caught error; when no `onError` is supplied, `devWarn(MISSING_ON_ERROR_WARNING)` fires
    instead. No `console.error` mirroring is added.
16. `resetKeys` comparison normalizes both sides with `?? []`, compares lengths, then compares
    element-wise with `Object.is` (not `===`), and `componentDidUpdate` returns immediately when
    `this.state.error === null`.
17. **No `resetCount`, no remount `key` counter, and no arithmetic increment anywhere**: a `+ 1`
    yields a behaviourally equivalent, unkillable mutant. React discards the failed subtree, so
    re-rendering `this.props.children` after `error` returns to `null` already remounts.
18. No runtime symbol other than the default class export leaves the folder: `FallbackView`,
    `DefaultFallback`, `FALLBACK_KEY`, `FALLBACK_MESSAGE`, and the `styles` object are each
    imported by exactly one sibling; `MISSING_ON_ERROR_WARNING` is a module-scope, non-exported
    `const` in `index.tsx` (see the Dev Notes ruling).
19. `UiErrorBoundary` is importable from the package root; no deep import path into the folder is
    documented or required. `tests/unit/components-index.test.ts` asserts it in the public export
    set and the suite passes.
20. `make lint-deps` reports zero new `dependency-cruiser` violations. The only cross-component
    runtime edge is `default-fallback.tsx` to `../ui-typography`; every path is kebab-case.
21. Unit case 1: healthy children render and no `alert` role is present.
22. Unit case 2: a throwing child renders the default fallback with `role="alert"` and the English
    message while sibling markup stays mounted.
23. Unit case 3: `onError` is called exactly once with an `Error` and an object carrying
    `componentStack`, asserted with `toHaveBeenCalledTimes(1)` after forcing an extra fallback
    re-render.
24. Unit case 4: with no `onError`, `devWarn` emits `MISSING_ON_ERROR_WARNING` once.
25. Unit case 5: a `ReactNode` fallback renders verbatim and receives no injected role.
26. Unit case 6: an explicit `fallback={null}` still renders the default fallback.
27. Unit case 7: a render-prop fallback receives the thrown `Error` and a `reset`; activating its
    control clears the error and re-renders children.
28. Unit case 8: remount proof - the recovered child's mount effect fires a second time and its
    internal state is back to its initial value.
29. Unit case 9: a `resetKeys` value change recovers; a length change recovers; identical keys
    keep the fallback; a key change while healthy leaves children mounted and untouched.
30. Unit case 10: a `NaN` key compared with `NaN` does not trigger a reset, pinning `Object.is`
    over `===`.
31. Unit case 11: rendered inside an `I18nextProvider` holding an instance initialized with empty
    resources, the fallback still shows `FALLBACK_MESSAGE`, not the raw key.
32. Unit case 12: an `Error` constructed with no message still renders fallback text.
33. Integration case: a composed subtree with a sibling region plus a boundary wrapping a real
    toolkit component fed a throwing child leaves the sibling region interactive after the throw,
    then recovers through `resetKeys` and renders the real subtree again.
34. `jest.integration.config.ts`'s explicit `collectCoverageFrom` list is left unchanged; the unit
    tier owns coverage for the new files.
35. `tests/unit/utils/mock-console-error.ts` mirrors the existing
    `tests/unit/utils/mock-console-warn.ts` `beforeEach`/`afterEach` spy plus live-handle shape,
    so React's own error logging does not destabilize other suites.
36. Semantic selectors only (`getByText`, `getByRole`, `getByLabelText`); **no `data-testid`** in
    any new test, and no test file is named after an issue number.
37. `make lint-metrics` passes: every new function is within the per-function budget table (args,
    exits, LLOC) reproduced in Dev Notes.
38. `make test-unit` reaches 100% branch, function, line, and statement coverage for every new
    source file.

## Tasks / Subtasks

- [x] Task 1: Class-metrics spike, run first and frozen on evidence (AC: 1, 2, 5, 6)
  - [x] 1.1 Create `src/components/ui-error-boundary/` with `index.tsx` holding the Decision 1
        class skeleton verbatim (see Dev Notes), `types.ts` with the six exported types, and a
        placeholder `default-fallback.tsx` that renders a `UiTypography` with `role="alert"` and
        a literal string
  - [x] 1.2 Run `make lint-metrics` and capture the emitted class metrics for
        `src/components/ui-error-boundary/index.tsx`
  - [x] 1.3 Fill in the "Class-Metrics Spike Results" table in Dev Notes with the observed `npm`,
        `npa`, `wmc`, `coa`, and `cda` values plus a PASS/BREACH verdict per row
  - [x] 1.4 If any row breaches, STOP: report to the repository owner with the raw output. Do NOT
        edit `config/metrics-policy.json` and do NOT redesign around a relaxed threshold
  - [x] 1.5 If no class metrics are emitted for `.tsx` at all, record that outcome and proceed
        unchanged - the private-method decomposition stays regardless, because it also serves the
        per-function budget

- [x] Task 2: Types and styles (AC: 3, 8, 9, 13)
  - [x] 2.1 Finalize `types.ts` exactly as in Dev Notes; import React types with `import type`
        and import `types.ts` with `import type` from every consumer, satisfying both
        `type-files-no-runtime-imports` and `type-files-imported-as-type-only`
  - [x] 2.2 Create `styles.ts` as a default-exported literal object with a `fallback` key; values
        are literals only, with `#DC3939` carrying a comment naming `sharedPalette.error.main` as
        its source. No theme callback, no import from the theme module
  - [x] 2.3 Confirm no prop-type export is added to `src/components/index.ts`

- [x] Task 3: The class file (AC: 5, 6, 14, 15, 16, 17, 18)
  - [x] 3.1 Write `index.tsx` to the Decision 1 skeleton: constructor, `getDerivedStateFromError`,
        `componentDidCatch`, `componentDidUpdate`, `render`, then private `resetBoundary`,
        `shouldResetFromKeys`, `reportBoundaryError`, `renderFallback` - in that order, matching
        the `member-ordering` default
  - [x] 3.2 Assign `state` in the constructor and bind `resetBoundary` there; declare no class
        fields and no arrow-function class members
  - [x] 3.3 Declare `MISSING_ON_ERROR_WARNING` as a module-scope non-exported `const` in
        `index.tsx` with the text
        `'UiErrorBoundary caught an error but no onError handler was supplied.'`
  - [x] 3.4 Import `devWarn` from `../../utils/dev-warn`; add no `process.env.NODE_ENV` check
  - [x] 3.5 Confirm the file contains zero module-scope functions and that `renderFallback` is the
        only place `FallbackView` is constructed

- [x] Task 4: Fallback view and default fallback (AC: 7, 10, 11, 12, 13)
  - [x] 4.1 Write `fallback-view.tsx` with the three-exit resolution order; keep its props type a
        local, non-exported type
  - [x] 4.2 Use `fallback == null` (nullish), never `fallback === undefined`
  - [x] 4.3 Write `default-fallback.tsx` exporting `FALLBACK_KEY`, `FALLBACK_MESSAGE`, and a
        default `DefaultFallback` that takes no props
  - [x] 4.4 Confirm `FALLBACK_MESSAGE` is exactly `'Something went wrong.'` and that
        `t()` is always called with `{ defaultValue: FALLBACK_MESSAGE }`
  - [x] 4.5 Confirm `error.message` is never read on the failure path

- [x] Task 5: Public export and drift guard (AC: 4, 9, 19, 20)
  - [x] 5.1 Append `export { default as UiErrorBoundary } from './ui-error-boundary';` to
        `src/components/index.ts`, keeping the file's existing ordering convention
  - [x] 5.2 Add `'UiErrorBoundary'` to `expectedPublicExports` in
        `tests/unit/components-index.test.ts` in the same commit; the array grows from 35 to 36
  - [x] 5.3 Run `make lint-deps` and confirm zero new violations
  - [x] 5.4 Run `make generate-ts-doc` and confirm api-extractor reports no `ae-forgotten-export`

- [x] Task 6: Test helper and unit suite (AC: 21-32, 35, 36, 38)
  - [x] 6.1 Add `tests/unit/utils/mock-console-error.ts` mirroring `mock-console-warn.ts`: a
        default-exported function registering `beforeEach`/`afterEach` around a
        `jest.spyOn(console, 'error')` and returning a live `{ readonly spy }` handle
  - [x] 6.2 Write `tests/unit/ui-error-boundary.test.tsx` with the twelve named cases in Dev
        Notes, one describe block per behaviour group, a locally declared `Boom` child, and
        semantic selectors only
  - [x] 6.3 Reuse `mock-console-warn` for the `devWarn` assertions and `mock-console-error` to
        silence React's caught-error logging
  - [x] 6.4 Run `make test-unit` and confirm 100% coverage on all new source files

- [x] Task 7: Integration suite (AC: 33, 34, 36)
  - [x] 7.1 Write `tests/integration/components/ui-error-boundary.integration.test.tsx`: a sibling
        region holding a real interactive toolkit control outside the boundary, and a boundary
        wrapping a real toolkit subtree whose child throws
  - [x] 7.2 Assert the sibling control is still present and interactive after the throw
  - [x] 7.3 Change a `resetKeys` entry, then assert the real subtree renders again
  - [x] 7.4 Leave `jest.integration.config.ts` untouched; run `make test-integration`

- [x] Task 8: Gate sweep for this story (AC: 2, 20, 36, 37, 38)
  - [x] 8.1 `make lint-next`, `make lint-tsc`, `make lint-md`, `make format-check`
  - [x] 8.2 `make lint-deps`, `make lint-metrics`, `make lint-test-structure`
  - [x] 8.3 `make test-unit`, `make test-integration`
  - [x] 8.4 `qlty check` and `qlty fmt --check`
  - [x] 8.5 Confirm by diff that no threshold in `config/metrics-policy.json`,
        `stryker.config.mjs`, or `jest.config.ts` changed

## Dev Notes

### Ratified decisions that override the planning inputs

Apply these; they win over anything in the epics or architecture documents.

- **i18n:** key `error_boundary.default_message`, `defaultValue` exactly `'Something went wrong.'`,
  and **no new locale resource files**. `i18n/localization.json` is not modified by this story.
  The architecture's longer draft string and its `en`/`uk` resource rows are superseded. Because
  the key is absent from the loaded resources, `t()` resolves through `defaultValue` on every
  path - the initialized path, the empty-instance path, and Storybook - which is exactly what
  makes the visual baseline in Story 1.3 deterministic.
- **No prop-type exports from `src/components/index.ts`.** `types.ts` still exports all six type
  symbols so api-extractor stays quiet on the rollup; the barrel gains only the value export.
- **`MISSING_ON_ERROR_WARNING` lives in `index.tsx`** as a module-scope non-exported `const`. The
  "zero module-scope functions" rule bans functions, not constants, and a `const` is invisible to
  `nom_functions`, `nom_closures`, and the coverage function count. This keeps the warning text
  next to its only caller and guarantees nothing but the class leaves the module. (If a reviewer
  insists on the epics' literal "imported by exactly one sibling" wording, the sanctioned
  alternative is to export it from `default-fallback.tsx` and import it once in `index.tsx`; do
  not invent a sixth file for it.)
- **Duplication is gated by `qlty`.** This repository has no `jscpd` target; `qlty check` covers
  duplication analysis.
- **Never relax a threshold.** `config/metrics-policy.json`, `stryker.config.mjs`, and
  `jest.config.ts` are read-only for this epic. Refactor the code instead.

### File layout (Architecture Decision 1)

| File                   | Contents                                               |
| ---------------------- | ------------------------------------------------------ |
| `index.tsx`            | `class UiErrorBoundary` (default export), nothing else |
| `fallback-view.tsx`    | `FallbackView`: fallback resolution and rendering      |
| `default-fallback.tsx` | `DefaultFallback`: `role="alert"` translated message   |
| `types.ts`             | props, state, and public helper types                  |
| `styles.ts`            | literal `sx` objects for the default fallback          |

`index.tsx` must contain zero module-scope functions: `rust-code-analysis` counts TS class
methods toward the file's `nom_functions` ceiling of 10, and the class needs nine. Every helper
is a private method or a sibling file. The two fallback files are `.tsx` so their logic sits
inside the Stryker glob `./src/components/**/*.tsx`.

### Class shape (frozen after the Task 1 spike)

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

Member order follows the `member-ordering` default: constructor, public static method, public
instance methods, private instance methods. `eslint.config.mjs` also enforces
`explicit-member-accessibility` (constructors `no-public`), `explicit-function-return-type`,
`max-len` 100, `react/jsx-props-no-spreading`, and `no-console` (only `warn`/`error`).

### `types.ts` contract (Architecture Decision 2)

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

All six are exported: `UiErrorBoundaryState` is reachable through
`React.Component<Props, State>` on the default export, and the fallback aliases through
`UiErrorBoundaryProps`. `types.ts` is excluded from `collectCoverageFrom` and lies outside the
Stryker glob, so exporting types costs nothing on either gate. `FallbackView`'s own props type
stays a local, non-exported type in `fallback-view.tsx` - it is not reachable from the public API,
and `esbuild-jest` counts an un-imported export as an uncovered function.

### Fallback resolution and the default fallback (Architecture Decision 3)

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

Three exits, one parameter. `DefaultFallback` takes no props and never renders `error.message`:
that one decision serves the "an `Error` with no message still yields visible output" rule, the
"no property access on the error object" rule, and a deterministic visual baseline. The message
reaches the consumer through `onError`, or through the dev warning when no handler is attached.

```tsx
export const FALLBACK_KEY: string = 'error_boundary.default_message';
export const FALLBACK_MESSAGE: string = 'Something went wrong.';

export default function DefaultFallback(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <UiTypography variant="bold22" role="alert" sx={styles.fallback}>
      {t(FALLBACK_KEY, { defaultValue: FALLBACK_MESSAGE })}
    </UiTypography>
  );
}
```

`react-i18next`'s no-instance `notReadyT` returns `optsOrDefaultValue.defaultValue` when it is a
string, which is what makes unit case 11 achievable. `UiTypography` already forwards `role`.

No-throw rules for the failure path, enforced by review and asserted by tests: no theme callback
in `sx`; no property access on `error`; no `JSON.stringify`; no date or number formatting; only
`UiTypography` and plain text render.

### Accessibility rulings (pre-implementation review, 2026-08-13)

Binding results of the accessibility-lead review; do not re-litigate during implementation.

- Contrast: `#DC3939` on white is 4.480:1 and FAILS WCAG AA for normal text (4.5:1). The Figma
  error token stays untouched; the fallback instead renders as LARGE text via the existing
  `bold22` variant (22px / weight 700, above the 18.66px-bold large-text threshold, 3:1 bar).
  `variant="bold22"` in the snippet above is therefore load-bearing: removing it or swapping to
  a body variant reintroduces a measured AA failure. Unit case 13 is the size guard.
- Live region: bare `role="alert"` ONLY. Do not add `aria-live`, `aria-atomic`, or `aria-label`.
  Explicitly do NOT copy `ui-form`'s `ErrorBanner` shape (`role="alert" aria-live="polite"`):
  the explicit polite value overrides the role's implicit assertive one inconsistently across AT.
- Mount semantics: inserting a node that already carries `role="alert"` plus its text content IS
  announced by AT. The prior-art comment in
  `src/components/ui-calendar-multi-select/calendar-messages.tsx:12-15` ("role toggled onto a
  static node does not announce") describes attribute mutation on a mounted node and does not
  apply here. `default-fallback.tsx` must carry a short comment stating this distinction so a
  future maintainer does not "fix" the fallback into a pre-existing-container shape.
- Focus: when the destroyed subtree held focus, focus falls to `body`. Ruling: leave it. No
  `tabIndex` anywhere in the fallback, no programmatic `.focus()`; announce-without-focus is the
  APG alert pattern. Conditional focus recovery was evaluated and rejected (the only available
  guard misfires on errors thrown during initial mount). A built-in recovery would be a future
  opt-in prop in its own story.
- Lifecycle: the message resolution stays synchronous (`t(...)` with `defaultValue` at render);
  never mount the alert empty and inject text later (two-phase injection is rejected for v1);
  the mounted alert is never emptied, hidden, or auto-dismissed.

### `resetKeys` semantics and recovery (Architecture Decision 4)

- Normalize both sides with `?? []`, compare lengths, then compare element-wise with `Object.is`
  rather than `===`, so a `NaN` key does not read as a change on every render.
- Omitted or empty means no automatic reset with no special case: two empty arrays have equal
  length and `some` over an empty array is `false`, so moving between `undefined` and `[]` also
  does nothing.
- `componentDidUpdate` returns immediately when `state.error === null`, so a healthy boundary is
  never touched by a key change.
- Remount needs no key: React discards the failed subtree when a boundary catches, so
  re-rendering `this.props.children` after `error` returns to `null` builds a fresh tree. A
  `resetCount`-in-state design is forbidden - its `+ 1` yields an arithmetic mutant (`- 1`) that
  is behaviourally equivalent and unkillable.
- Repeated failures: state is one nullable field; a second failure overwrites it.

### `onError` contract and dev diagnostics (Architecture Decision 5)

- Exactly once per error: `onError` is called only from `componentDidCatch`, which React invokes
  once per caught error in the commit phase. `getDerivedStateFromError`, which React
  double-invokes under StrictMode, stays pure and never reports; re-rendering the fallback does
  not re-enter `componentDidCatch`.
- Signature `(error: Error, info: React.ErrorInfo) => void`, passed through untouched so the
  consumer receives React's `componentStack`.
- `devWarn` from `src/utils/dev-warn.ts` is reused unchanged. The component does **not** inline
  its own `process.env.NODE_ENV` check the way `src/components/ui-input/index.tsx` does: `devWarn`
  already performs the production strip, and re-implementing it locally would add an
  environment-dependent branch that the 100% coverage gate would then demand both halves of.
  `ui-card-list/index.tsx` and `ui-image/index.tsx` already delegate this way.
- No `console.error` mirroring. React already logs caught errors.

### Per-function metrics budget (Architecture Decision 7)

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

Hard ceilings from `config/metrics-policy.json`: per function `lloc<=10`, `nexits<=3`,
`nargs<=3`, `cyclomatic<=10`, `cognitive<=15`; per file `nom_functions<=10`, `nom_closures<=6`,
`nom_total<=15`; per class `wmc<=30`, `npm<=8`, `npa<=2`, `coa<=0.6`, `cda<=0.25`.
`scripts/lint-metrics.sh` maps `coa` to `npm.classes_average` and `cda` to
`npa.classes_average`.

`index.tsx` holds 9 functions (all class methods) plus 1 closure (the `some` callback): 9 of the
10 `nom_functions` ceiling and 10 of the 15 `nom_total` ceiling. That is why no module-level
function may live there.

### Class-Metrics Spike Results (fill in during Task 1, before freezing the shape)

`src/` contains no class today, so `class_coa_max` and `class_cda_max` have never been evaluated
against real input. Record the actual `make lint-metrics` output here.

| Metric                    | Ceiling | Designed | Observed    | Verdict          |
| ------------------------- | ------- | -------- | ----------- | ---------------- |
| `wmc`                     | <= 30   | ~12      | not emitted | PASS (null-skip) |
| `npm.classes`             | <= 8    | 5        | not emitted | PASS (null-skip) |
| `npa.classes`             | <= 2    | 0        | not emitted | PASS (null-skip) |
| `coa` (`npm.classes_avg`) | <= 0.6  | 0.56     | not emitted | PASS (null-skip) |
| `cda` (`npa.classes_avg`) | <= 0.25 | absent   | not emitted | PASS (null-skip) |

Observed outcome: **(1)** - `rust-code-analysis` 0.0.25 emits no class-shape metrics for
TypeScript/TSX at all. The `UiErrorBoundary` class space is recognised (`kind: "class"`,
`start_line: 17`) but its `metrics` object carries only
`abc, cognitive, cyclomatic, halstead, loc, mi, nargs, nexits, nom` - there is no `wmc`, `npm`
or `npa` key, so all five class ceilings are null-skipped by `scripts/lint-metrics.sh`'s
`// null` guards. Nothing breaches; the private-method decomposition stays unchanged because it
also serves the per-function budget.

What the analyzer does emit for `index.tsx`, all inside their ceilings:

| Scope | Metric                | Observed | Ceiling |
| ----- | --------------------- | -------- | ------- |
| file  | `nom.functions`       | 9        | <= 10   |
| file  | `nom.closures`        | 1        | <= 6    |
| file  | `nom.total`           | 10       | <= 15   |
| file  | `loc.lloc`            | 40       | <= 120  |
| file  | `mi.mi_visual_studio` | 31.91    | >= 20   |

Per-function worst cases: `nargs` 2 (`componentDidCatch`, `reportBoundaryError`), closure `nargs`
2 (the `some` callback), `nexits` 2 (`render`), `lloc` 7 (`componentDidUpdate`), `cyclomatic` 3,
`cognitive` 2. Every row of the Architecture Decision 7 budget table above holds.

### Test architecture (Architecture Decision 8)

Tests live only under the root `tests/` tree; `scripts/check-test-structure.sh` fails on any
`*.test.*` outside it. Filenames are descriptive kebab-case, never issue numbers.

| Path                                                                  | Owns         |
| --------------------------------------------------------------------- | ------------ |
| `tests/unit/ui-error-boundary.test.tsx`                               | cases 1-13   |
| `tests/unit/utils/mock-console-error.ts`                              | helper only  |
| `tests/integration/components/ui-error-boundary.integration.test.tsx` | containment  |
| `tests/unit/components-index.test.ts` (modified)                      | export drift |

Throwing child, declared locally per suite; no `data-testid` anywhere:

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

Console noise: React logs every caught error through `console.error`. Add
`tests/unit/utils/mock-console-error.ts` mirroring `tests/unit/utils/mock-console-warn.ts` - the
same `beforeEach`/`afterEach` spy plus live-handle shape, default-exported, returning
`{ readonly spy: jest.SpyInstance }`. `devWarn` assertions reuse `mock-console-warn`.

`tests/unit/ui-error-boundary.test.tsx` cases:

1. healthy children render and no `alert` is present;
2. a throwing child renders the default fallback with `role="alert"` and the English text while
   sibling markup stays mounted;
3. `onError` is called exactly once with an `Error` and an object carrying `componentStack`,
   asserted with `toHaveBeenCalledTimes(1)` after forcing an extra fallback re-render;
4. with no `onError`, the dev warning is emitted once;
5. a `ReactNode` fallback renders verbatim and receives no injected `role`;
6. explicit `fallback={null}` still renders the default (the nullish rule);
7. a render-prop fallback receives the thrown `Error` and a `reset`; clicking its button clears
   the error and re-renders children;
8. remount proof: the recovered child's mount effect fires a second time and its internal state
   is back to the initial value;
9. `resetKeys` value change recovers; length change recovers; identical keys keep the fallback; a
   key change while healthy leaves children mounted and untouched;
10. a `NaN` key compared with `NaN` does not trigger a reset (pins `Object.is` over `===`);
11. render inside `<I18nextProvider i18n={bareInstance}>`, where `bareInstance` is initialized
    with empty resources, and assert `FALLBACK_MESSAGE`. This fails if the implementation drops
    `defaultValue`, because the raw key would render instead;
12. an `Error` built with no message still renders the fallback text;
13. contrast size guard: the element returned by `getByRole('alert')` carries the `bold22`
    variant (assert `MuiTypography-bold22` in `className`; the selector stays semantic, the
    class is only the assertion target). Kills any mutant that drops or swaps the variant that
    keeps `#DC3939` on the WCAG large-text 3:1 bar.

Integration suite: render a real composed subtree - a sibling region holding a real interactive
toolkit control outside the boundary, and a boundary wrapping a real toolkit subtree (for example
a `UiForm` whose child throws). Assert the sibling control is still present and interactive after
the throw, then change a `resetKeys` entry and assert the real subtree renders again.
`jest.integration.config.ts` enforces 100% coverage over an explicit file list; leave that list
unchanged and let the unit tier own coverage, as its own comment describes for leaf components.

### Mutation hardening map (rows owned by this story)

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

The merged mutation sweep itself runs in Story 1.4; write these assertions strong enough now that
the sweep is a confirmation, not a rework.

### Project Structure Notes

- Kebab-case everywhere: `no-uppercase-paths` and `component-name-kebab-case` are enforced by
  `.dependency-cruiser.js`.
- `components-public-api` allows a component's own internals plus any other component's
  `index.ts(x)` barrel and nothing deeper. The only cross-component runtime edge here is
  `default-fallback.tsx` to `src/components/ui-typography/index.tsx`, exactly as
  `ui-form/index.tsx` already does. Intra-folder edges (`index.tsx` to `fallback-view.tsx` to
  `default-fallback.tsx`) are allowed by the same rule's own-component exception.
- Shared utilities come from `../../utils/dev-warn`, matching `ui-card-list` and `ui-image`.
- `jest.config.ts` excludes `types.ts` from `collectCoverageFrom` but **not** `styles.ts`;
  `styles.ts` is a plain object with no functions and is covered by being imported.
- `src/components/index.ts` is excluded from coverage, so the appended export line adds nothing to
  the denominator.

### Testing Approach

`make test-unit` runs the jsdom unit tier at a 100% global threshold; `make test-integration`
runs the composition tier against its own explicit file list. Verification for this story is:

- `make lint-metrics` - per-function budget and the class ratios;
- `make lint-deps` - zero new graph violations;
- `make lint-test-structure` - all new tests under the root `tests/` tree;
- `make test-unit` - twelve boundary cases plus the updated export drift guard, 100% coverage;
- `make test-integration` - the containment and recovery case;
- `make generate-ts-doc` - api-extractor reports no `ae-forgotten-export`;
- `qlty check` and `qlty fmt --check` - no new findings, duplication included.

## Definition of Done

- [x] The Class-Metrics Spike Results table above is filled in with real `make lint-metrics`
      output, and the class shape was frozen on that evidence.
- [x] `make lint-next`, `make lint-tsc`, `make lint-md`, `make format-check` pass.
- [x] `make lint-deps` and `make lint-metrics` pass with zero new findings.
- [x] `make lint-test-structure` passes.
- [x] `make test-unit` and `make test-integration` pass at the 100% coverage threshold.
- [x] `make generate-ts-doc` reports no `ae-forgotten-export`.
- [x] `qlty check` and `qlty fmt --check` report no new findings, including duplication.
- [x] No threshold in `config/metrics-policy.json`, `stryker.config.mjs`, or `jest.config.ts` was
      relaxed at any point.

## References

- Epics:
  `specs/ui-error-boundary/planning-artifacts/epics-ui-error-boundary-2026-08-13.md`
  - Epic 1, Story 1.1 (scope, acceptance criteria, definition of done)
  - Additional Requirements (file layout, no class fields, `.tsx` fallback files, nullish
    resolution, `devWarn` delegation, no `resetCount`, locked names)
- Architecture:
  `specs/ui-error-boundary/planning-artifacts/architecture-ui-error-boundary-2026-08-13.md`
  - Decision 1 (decomposition), Decision 2 (`types.ts`), Decision 3 (fallback), Decision 4
    (`resetKeys`), Decision 5 (`onError`), Decision 7 (metrics budget), Decision 8 (tests)
  - Gap Analysis Results (the blocking class-metrics spike)
- FRs covered: FR1-FR20. NFRs covered: NFR1, NFR2, NFR4, NFR7-NFR14, NFR16, NFR17.

## Dev Agent Record

### Agent Model Used

_Pending implementation._

### Debug Log References

See "Completion Notes (2026-08-13)" and the mutation addendum below.

### Completion Notes List

Consolidated in "Completion Notes (2026-08-13)" below.

### File List

Consolidated in "Completion Notes (2026-08-13)" below.

### Change Log

- 2026-08-13: implemented, reviewed, and mutation-hardened; see the addendum.

### Mutation addendum (targeted host Stryker, 2026-08-13)

- Touched-files run: score 95.74 against break 80. `ui-form` files 100.
- Two review-added killers: a shrinking `resetKeys` list with identical remaining entries
  (pins the length guard the element-wise walk cannot see) and an exact child render-count
  assertion (mount + increment + rerender = 3) on the healthy-keys-change case.
- Two surviving mutants on `index.tsx:36` (the `componentDidUpdate` healthy early-return
  flipped to `false` / emptied) are EQUIVALENT mutants, accepted and documented: without the
  guard the healthy boundary performs a no-op `setState`, and React bails out of re-rendering
  children whose element identity is unchanged, so no child render, DOM change, or callback is
  observable from any consumer-visible surface. The guard is kept as the story mandates
  (a healthy boundary is never touched); final `index.tsx` score 94.74, break 80.

## Completion Notes (2026-08-13)

- All eight files created and both modifications landed exactly as scoped; the barrel gained
  one line and `expectedPublicExports` went 35 -> 36.
- Spike outcome (1): rust-code-analysis 0.0.25 emits no class-shape metrics for TS/TSX, so all
  five class ceilings null-skip; the shape is kept for the per-function budget it also serves.
- Gate evidence: host jest 53 suites / 641 tests, 100% global coverage; integration tier 7
  suites / 72 tests green; tsc, eslint (0 errors), prettier, depcruise, lint-metrics ("all hard
  checks pass"), check-test-structure all green. api-extractor completed with no
  ErrorBoundary-related `ae-forgotten-export` (23 pre-existing warnings on other components).
- `make test-unit`/`make lint-*` equivalents ran on the HOST (the bun service is a baked image
  that cannot see uncommitted work); `make lint-metrics` ran in Docker (rca bind-mounts).
- Three `react/jsx-no-bind` WARNINGS (0 errors) exist in the unit suite's harness components;
  the lint gate carries no `--max-warnings` flag and the render-prop API is exercised
  idiomatically. Accepted by review.

### Review round 2 (Fable adversarial review, 2026-08-13)

Fifteen findings adjudicated; four changed this component or its suites:

- `componentDidUpdate` gained the `prevState.error` half of its guard: a `resetKeys` change
  landing in the same commit as the throw itself no longer resets straight back into the
  still-throwing child (which doubled `onError`). Pinned by the "ignores a keys change that
  arrives together with the throw" unit case.
- `FallbackView` now nullish-checks a render-prop's RETURN value too, so a render prop that
  returns `null` yields the default fallback instead of a blank region. Pinned by unit case.
- `DefaultFallback` calls `useTranslation(undefined, { useSuspense: false })`: with the default,
  an app still loading its i18next backend makes the hook throw a suspense promise while the
  fallback renders, escalating past the boundary. Pinned by the never-ready-backend unit case.
- A drift guard pins `styles.fallback.color` to `sharedPalette.error.main`.
- Post-fix targeted Stryker: 98.31 overall (boundary files); `index.tsx` 97.62 with a single
  surviving guard mutant from the documented equivalent pair; break threshold 80.

Adjudicated no-change: sparse-array `resetKeys` holes (out of contract, idiomatic `.some`),
worker-global unhandledRejection listener (accepted, sequential-per-worker), throwing
`onSubmitError`/`reset` escaping (consumer bugs should surface loudly, per browser-listener
semantics). Console-mock duplication resolved via a shared `mock-console-method.ts` factory.
