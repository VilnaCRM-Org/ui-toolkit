# Story 1.2: UiForm rejection contract and onSubmitError

Status: Approved

## Story

As a consumer submitting a form,
I want a rejected `onSubmit` to be contained and routed to a handler instead of escaping,
so that a failed submission is a reportable event rather than an unhandled promise rejection.

## Acceptance Criteria

1. Exactly one new file is created: `tests/unit/ui-form-submit-errors.test.tsx`.
2. Exactly one file is modified: `src/components/ui-form/index.tsx`, with the three coordinated
   edits below. No other component and no config file changes.
3. Edit 1: `UiFormProps<T>` gains `onSubmitError?: (error: unknown) => void`. The type is
   `unknown`, not `Error`, because a rejected consumer promise can carry anything.
4. Edit 2: `'onSubmitError'` is added to the `Omit<...>` union that builds `FormViewProps<T>`,
   **and** `onSubmitError` is destructured in `UiForm`'s signature, so it never leaks into the
   `...view` rest that `FormBody` renders. Both halves of edit 2 are required; the file's own
   comment above `FormViewProps` warns about exactly this.
5. Edit 3: `SubmitHandlerOptions<T>` gains `onSubmitError`, `buildSubmitHandler` destructures it,
   and the returned closure wraps its awaited `onSubmit(data, event)` in `try`/`catch`.
6. The `catch` calls a module-scope `reportSubmitError(error, onSubmitError)` helper and then
   `return`s, so the `resetOnSuccess` branch is skipped on failure and the closure keeps two
   exits. `return` is used rather than `else`, leaving the reset branch textually untouched so
   the existing reset tests stay meaningful.
7. `reportSubmitError` calls `onSubmitError(error)` when supplied, otherwise
   `devWarn(UNHANDLED_SUBMIT_REJECTION_WARNING)`. **Contain and warn** is the required behaviour
   when no handler is attached: the rejection is never re-thrown.
8. `UNHANDLED_SUBMIT_REJECTION_WARNING` is a module-scope `const` in
   `src/components/ui-form/index.tsx` with the exact text
   `'UiForm caught a rejected onSubmit; pass onSubmitError to handle it.'`.
9. `devWarn` is imported from `../../utils/dev-warn`. **No inline `process.env.NODE_ENV` branch**
   is added anywhere in `ui-form/`.
10. **`methods.setError('root', ...)` is NOT called.** Signalling failure through form state is
    explicitly out of scope; `onSubmitError` and the existing `error` display prop are the
    supported failure signals.
11. The prop's type is written inline as `(error: unknown) => void` in `UiFormProps<T>`, in
    `SubmitHandlerOptions<T>`, and in `reportSubmitError`'s signature. No named alias is
    introduced (see the Dev Notes ruling on the `SubmitErrorHandler` name collision).
12. Unit case 1: with `process.on('unhandledRejection')` registered in `beforeEach` and removed in
    `afterEach`, submitting a form whose `onSubmit` rejects never fires the listener after
    microtasks flush.
13. Unit case 2: `onSubmitError` receives the exact rejection value, exactly once.
14. Unit case 3: with `resetOnSuccess` set, the typed value is still in the field after a failed
    submit, proving `methods.reset` was not called.
15. Unit case 4: the happy path still resets, proving the branch was not inverted.
16. Unit case 5: with no `onSubmitError`, the dev warning fires and there is still no unhandled
    rejection.
17. Unit case 6: a non-`Error` rejection value (a string) is forwarded unchanged, pinning the
    `unknown` type.
18. Unit case 7: the submit control is re-enabled afterwards, proving `submitting` semantics are
    unchanged (`isSubmitting ?? methods.formState.isSubmitting`).
19. Every existing `UiForm` prop keeps its name, type, default, and position; every current call
    site type-checks with no edit; rendered output is identical.
20. The existing `UiForm` suites (`tests/unit/ui-form.test.tsx`,
    `tests/unit/ui-text-field-form.test.tsx`,
    `tests/integration/components/ui-form.integration.test.tsx`,
    `tests/integration/components/ui-text-field-form.integration.test.tsx`) pass **unmodified**.
    Neither currently asserts the removed re-throw behaviour; if one turns out to, only that
    assertion may change, and the change must be recorded in the Completion Notes.
21. Semantic selectors only (`getByRole`, `getByLabelText`, `getByText`); **no `data-testid`** in
    the new suite, and the filename carries no issue number.
22. `make lint-metrics` passes: `reportSubmitError` (2 args, 1 exit, LLOC 4), `buildSubmitHandler`
    (1 arg, 1 exit, LLOC 2), and the submit closure (2 args, 1 exit, LLOC 7) all stay inside the
    per-function budget, and `ui-form/index.tsx` stays inside `nom_functions<=10`,
    `nom_closures<=6`, `nom_total<=15`.
23. `make test-unit` and `make test-integration` pass at the 100% coverage threshold; both new
    branches (`onSubmitError` supplied / absent) and both submit outcomes are covered.
24. The `formState.isSubmitSuccessful` nuance is written into the Completion Notes as an explicit
    hand-off to Story 1.4's README section and to the release notes.
25. No threshold in `config/metrics-policy.json`, `stryker.config.mjs`, or `jest.config.ts` is
    relaxed.

## Tasks / Subtasks

- [ ] Task 1: Edit 1 - the public prop (AC: 3, 11, 19)
  - [ ] 1.1 Add `onSubmitError?: (error: unknown) => void;` to `UiFormProps<T>` in
        `src/components/ui-form/index.tsx`, after `resetOnSuccess` / `isSubmitDisabled` so no
        existing prop changes position
  - [ ] 1.2 Confirm no existing prop's name, type, or default changed

- [ ] Task 2: Edit 2 - keep it out of the view rest (AC: 4)
  - [ ] 2.1 Add `'onSubmitError'` to the `Omit<UiFormProps<T>, ...>` union that builds
        `FormViewProps<T>`
  - [ ] 2.2 Destructure `onSubmitError` in `UiForm`'s signature (alongside `onSubmit`,
        `defaultValues`, `formOptions`, `isSubmitting`, `resetOnSuccess`, `children`) so it is
        removed from `...view`
  - [ ] 2.3 Confirm `FormBody` receives no new prop and its destructured defaults are untouched

- [ ] Task 3: Edit 3 - contain the rejection (AC: 5, 6, 7, 8, 9, 10, 11)
  - [ ] 3.1 Add `onSubmitError?: (error: unknown) => void;` to `SubmitHandlerOptions<T>`
  - [ ] 3.2 Add the module-scope `UNHANDLED_SUBMIT_REJECTION_WARNING` const with the exact text
  - [ ] 3.3 Add the module-scope `reportSubmitError` helper above `buildSubmitHandler`
  - [ ] 3.4 Rewrite the closure returned by `buildSubmitHandler` with `try`/`catch` plus an early
        `return` from the `catch`
  - [ ] 3.5 Pass `onSubmitError` through the `buildSubmitHandler({ ... })` call in `UiForm`
  - [ ] 3.6 Import `devWarn` from `../../utils/dev-warn`; add no `NODE_ENV` check and no
        `methods.setError('root', ...)` call

- [ ] Task 4: The new unit suite (AC: 12-18, 21, 23)
  - [ ] 4.1 Create `tests/unit/ui-form-submit-errors.test.tsx`
  - [ ] 4.2 Register `process.on('unhandledRejection', listener)` in `beforeEach` and
        `process.off('unhandledRejection', listener)` in `afterEach`; flush microtasks before
        asserting the listener never fired
  - [ ] 4.3 Write the seven named cases in Dev Notes, using semantic selectors only
  - [ ] 4.4 Reuse `tests/unit/utils/mock-console-warn.ts` (delivered/exercised in Story 1.1) for
        the dev-warning assertion in case 5
  - [ ] 4.5 Run `make test-unit` and confirm 100% coverage, both new branches included

- [ ] Task 5: Regression and compatibility check (AC: 19, 20)
  - [ ] 5.1 Run the existing `UiForm` unit and integration suites unmodified and confirm green
  - [ ] 5.2 Grep the repository for `onSubmit` call sites of `UiForm` and confirm each still
        type-checks with no edit (`make lint-tsc`)
  - [ ] 5.3 Confirm rendered output is unchanged (no new DOM node, no new attribute)

- [ ] Task 6: Gate sweep and hand-off (AC: 22, 23, 24, 25)
  - [ ] 6.1 `make lint-next`, `make lint-tsc`, `make format-check`
  - [ ] 6.2 `make lint-metrics`, `make lint-test-structure`
  - [ ] 6.3 `make test-unit`, `make test-integration`
  - [ ] 6.4 `qlty check`
  - [ ] 6.5 Record the `formState.isSubmitSuccessful` nuance in the Completion Notes as the
        Story 1.4 README input
  - [ ] 6.6 Confirm by diff that no threshold config changed

## Dev Notes

### Sequencing

This story has no technical dependency on Story 1.1, but it is sequenced after it so the `devWarn`
usage pattern and the `tests/unit/utils/mock-console-warn.ts` harness are already exercised.

### Ratified decisions that override the planning inputs

- **Contain and warn.** With no `onSubmitError` supplied, the rejection is contained and reported
  through the development-only warning. It is never re-thrown and never surfaced through form
  state.
- **No `methods.setError('root', ...)`.** That alternative was considered and rejected: it is a
  larger, non-additive change.
- **The README documents the `formState.isSubmitSuccessful` caveat.** Story 1.4 owns the prose;
  this story owns discovering and recording it.
- **No named type alias for the handler.** The architecture snippet references a
  `SubmitErrorHandler` type that it never declares, and that identifier collides with
  `react-hook-form`'s own exported `SubmitErrorHandler<T>` (the invalid-submit handler type),
  which would be actively misleading in a file that already imports from `react-hook-form`. Write
  the signature inline as `(error: unknown) => void` in all three places instead.
- **Duplication is gated by `qlty`** (this repository has no `jscpd` target).
- **Never relax a threshold** in `config/metrics-policy.json`, `stryker.config.mjs`, or
  `jest.config.ts`. Refactor instead.

### The three coordinated edits (Architecture Decision 6)

`src/components/ui-form/index.tsx` today defines, in order: `UiFormProps<T>`,
`SubmitHandlerOptions<T>`, `SubmitControlsProps`, `FormViewProps<T>`, `FormBodyProps<T>`,
`ErrorBanner`, `FormHeader`, `buildSubmitHandler`, `SubmitControls`, `FormBody`, and the default
`UiForm`. Current shape of the handler builder:

```ts
function buildSubmitHandler<T extends FieldValues>({
  onSubmit,
  methods,
  defaultValues,
  resetOnSuccess,
}: SubmitHandlerOptions<T>): SubmitHandler<T> {
  return async (data, event) => {
    await onSubmit(data, event);

    if (resetOnSuccess) {
      methods.reset(defaultValues);
    }
  };
}
```

Target shape:

```ts
const UNHANDLED_SUBMIT_REJECTION_WARNING: string =
  'UiForm caught a rejected onSubmit; pass onSubmitError to handle it.';

function reportSubmitError(error: unknown, onSubmitError?: (error: unknown) => void): void {
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

Edit 2 in full: `FormViewProps<T>` is
`Omit<UiFormProps<T>, 'onSubmit' | 'defaultValues' | 'formOptions' | 'isSubmitting' |
'resetOnSuccess' | 'children'>`; add `'onSubmitError'` to that union and destructure
`onSubmitError` in `UiForm`'s parameter list. Missing either half lets the callback reach
`FormBody` through `...view` and, from there, potentially the DOM.

### Backward compatibility (NFR5, NFR6)

No existing prop changes name, type, default, or position, and `onSubmitError` is optional, so
every current call site type-checks unchanged. `submitting` is still
`isSubmitting ?? methods.formState.isSubmitting` and is unaffected, since `react-hook-form` clears
`isSubmitting` in a `finally` either way. Rendered output is identical. The only observable change
is the intended one: the rejection is contained, not re-thrown.

**Documented nuance (hand this to Story 1.4):** because the rejection no longer escapes,
`react-hook-form` now treats the submit as successful, so `formState.isSubmitSuccessful` becomes
`true` after a rejected submit. Consumers must use `onSubmitError` - or the existing `error`
display prop - as the failure signal. This goes in the README "Error handling" section and in the
release notes.

### Per-function metrics budget (Architecture Decision 7)

| Function             | File                | args | exits | lloc |
| -------------------- | ------------------- | ---- | ----- | ---- |
| `reportSubmitError`  | `ui-form/index.tsx` | 2    | 1     | 4    |
| `buildSubmitHandler` | `ui-form/index.tsx` | 1    | 1     | 2    |
| submit closure       | `ui-form/index.tsx` | 2    | 1     | 7    |

Hard ceilings: per function `lloc<=10`, `nexits<=3`, `nargs<=3`, `cyclomatic<=10`,
`cognitive<=15`; per file `nom_functions<=10`, `nom_closures<=6`, `nom_total<=15`.
`reportSubmitError` adds one module-scope function to `ui-form/index.tsx`; confirm the file's
`nom_functions` count still clears its ceiling after the edit, and if it does not, decompose into
a sibling module rather than relaxing the policy.

### Test cases (Architecture Decision 8)

`tests/unit/ui-form-submit-errors.test.tsx`:

1. register `process.on('unhandledRejection')` in `beforeEach` and remove it in `afterEach`;
   submit a form whose `onSubmit` rejects, flush microtasks, assert it never fired;
2. `onSubmitError` receives the exact rejection value, once;
3. with `resetOnSuccess` set, the typed value is still in the field after a failed submit, so
   `methods.reset` was not called;
4. the happy path still resets, proving the branch was not inverted;
5. with no `onSubmitError`, the dev warning fires and there is still no unhandled rejection;
6. a non-`Error` rejection value (a string) is forwarded unchanged, pinning `unknown`;
7. the submit button is re-enabled afterwards, proving `submitting` semantics are unchanged.

Selectors stay semantic: `screen.getByLabelText(...)` for the field, `screen.getByRole('button',
{ name: ... })` for submit. No `data-testid`. Test filenames are descriptive kebab-case, never
issue numbers.

### Mutation hardening map (rows owned by this story)

| Mutant                         | Killed by     |
| ------------------------------ | ------------- |
| `if (onSubmitError)` inverted  | cases 2 and 5 |
| `if (resetOnSuccess)` inverted | cases 3 and 4 |
| `catch` block `return` removed | case 3        |

`ui-form/index.tsx` is inside the Stryker glob `./src/components/**/*.tsx`. The merged mutation
sweep runs in Story 1.4; write these assertions strong enough now that the sweep confirms rather
than reworks. `UNHANDLED_SUBMIT_REJECTION_WARNING` is also mutable to `""` - case 5 must assert on
the warning text, not merely on the call count.

### Project Structure Notes

- Only `src/components/ui-form/index.tsx` changes in `src/`. `form-provider-bridge.tsx` and
  `styles.ts` are untouched, and no other component is edited.
- The new test lives at `tests/unit/ui-form-submit-errors.test.tsx`;
  `scripts/check-test-structure.sh` fails on any `*.test.*` outside the root `tests/` tree.
- `ui-form/**` is inside `jest.integration.config.ts`'s explicit `collectCoverageFrom` list, so
  the integration tier also enforces 100% over the edited file. Do not modify that list; if the
  integration tier reports an uncovered new branch, cover it in the unit tier and re-check - the
  integration list already includes `ui-form/**`, so both tiers must be green.

### Testing Approach

- `make test-unit` - the seven new cases plus the untouched existing `UiForm` unit suite.
- `make test-integration` - the untouched `ui-form` and `ui-text-field-form` composition suites,
  which also enforce 100% coverage over `ui-form/**`.
- `make lint-tsc` - proves every existing call site still type-checks with no edit.
- `make lint-metrics` - the three per-function budget rows plus the file-level `nom` ceilings.
- `qlty check` - no new findings, duplication included.

## Definition of Done

- [ ] `make lint-next`, `make lint-tsc`, `make format-check` pass.
- [ ] `make lint-metrics` passes: `reportSubmitError` (2 args, 1 exit, LLOC 4) and the submit
      closure (2 args, 1 exit, LLOC 7) stay inside the per-function budget.
- [ ] `make lint-test-structure` passes.
- [ ] `make test-unit` and `make test-integration` pass at 100% coverage.
- [ ] The `formState.isSubmitSuccessful` nuance is captured in the Completion Notes as input to
      the Story 1.4 README section and the release notes.
- [ ] `qlty check` reports no new findings.
- [ ] No threshold in `config/metrics-policy.json`, `stryker.config.mjs`, or `jest.config.ts` was
      relaxed.

## References

- Epics:
  `specs/ui-error-boundary/planning-artifacts/epics-ui-error-boundary-2026-08-13.md`
  - Epic 1, Story 1.2 (scope, acceptance criteria, definition of done)
  - Additional Requirements (the three coordinated `ui-form` edits, `devWarn` delegation, locked
    constant names)
- Architecture:
  `specs/ui-error-boundary/planning-artifacts/architecture-ui-error-boundary-2026-08-13.md`
  - Decision 6 (`UiForm` rejection contract), Decision 7 (metrics budget), Decision 8 (form test
    cases and mutation map)
  - Gap Analysis Results (`formState.isSubmitSuccessful` after a contained rejection)
- FRs covered: FR21-FR24. NFRs covered: NFR3, NFR5, NFR6, NFR10, NFR13-NFR15.

## Dev Agent Record

### Agent Model Used

_Pending implementation._

### Debug Log References

_Pending implementation._

### Completion Notes List

_Pending implementation._

### File List

_Pending implementation._

### Change Log

_Pending implementation._
