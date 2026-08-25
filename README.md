# ui-toolkit

React UI component library built with Bun, Storybook, and MUI.

## Stack

- React 19
- MUI 9
- Storybook 10
- TypeScript 6
- Jest for unit tests
- Playwright for browser and visual checks

## Getting Started

Install dependencies:

```bash
bun install
```

`make help` prints the authoritative, self-documenting list of every target — run it first:

```bash
make help
```

### Proving your branch green

Two aggregate targets replay the merge bar locally, so you never have to reassemble it from
the workflow YAMLs by hand:

```bash
make ci       # fast pre-push set: lint, build, unit, integration, Bats
make verify   # everything a merge requires: make ci plus the heavy suites
```

Both run their gates in order, stop at the first failure, exit non-zero, and print a
`gate → pass/FAIL/skipped` summary. A clean checkout with Docker goes from clone to
fully-proven green with `make install && make verify`. `make verify` is the slow, complete
proof (mutation, browser, and Lighthouse suites included); `make ci` is the one to run before
every push. The pull-request workflows do not call `make ci` or `make verify` — they invoke the
same underlying gate targets directly, alongside their own setup and teardown steps. What keeps
the two definitions from drifting is `tests/bats/aggregate_gate_targets.bats`, which fails if a
workflow ever runs a gate `make verify` cannot reach. Adding a gate to a workflow therefore also
means adding it to `VERIFY_GATES`; editing the gate set alone does not reconfigure CI.

Every pull request must pass the gating targets below; run the ones your change touches
locally before pushing. See [agents.md](agents.md) for which test layer a given change needs.

| Target                  | What it gates                                                  |
| ----------------------- | -------------------------------------------------------------- |
| `make ci`               | Aggregate fast gate set — lint, build, unit, integration, Bats |
| `make verify`           | Aggregate full merge bar — `make ci` plus the heavy suites     |
| `make lint`             | ESLint, TypeScript, markdownlint, Prettier, dependency gates   |
| `make test-unit`        | Jest unit suite (components, hooks, pure logic) in jsdom       |
| `make test-integration` | Jest composition suite: composed components, real children     |
| `make test-e2e`         | Playwright behavior against a Storybook build                  |
| `make test-visual`      | Playwright visual-regression snapshots                         |
| `make test-mutation`    | Stryker mutation-strength gate                                 |
| `make test-bats`        | Bats coverage of Makefile shell flows and their contracts      |

The `lint-metrics` target runs a `rust-code-analysis` complexity gate over `src/`. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the policy details and remediation guidance.

### Bats Shell Coverage

Use the Bats suite for fast regression coverage of `Makefile` shell behavior without running the
full browser or mutation stacks:

```bash
make test-bats
```

For CI-friendly output:

```bash
make test-bats BATS_FORMATTER=tap
```

When you add or change a public Make target, update `tests/bats/make-target-coverage.tsv` in the
same change. Either add or adjust direct Bats coverage for uncovered shell behavior, or point the
manifest at the pull-request workflow that already exercises the target.

### Dependency graph hygiene

A zero-tolerance [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) gate guards
the `src/` graph against cycles, orphans, cross-component barrel breaches, `src` → `tests`
imports, leaked stories/dev dependencies, and type-only violations. Run it locally with:

```bash
make lint-deps
```

See the
[dependency graph hygiene guide](CONTRIBUTING.md#dependency-graph-hygiene-dependency-cruiser)
in `CONTRIBUTING.md` for what it enforces, how it complements ESLint, and how to read its output.

## Project Layout

- `src/components`: exported UI components, themes, and stories
- `src/index.ts`: library entrypoint
- `.storybook`: Storybook configuration
- `tests`: automated test coverage
- `scripts`: repository helper scripts used by build/test workflows

## Error handling

A React render error is not recoverable in place: React unmounts the tree from the root, so one
bad prop deep inside a widget blanks the whole page. `UiErrorBoundary` exists to bound that blast
radius. Wrap the regions that can fail, and a failure costs one region instead of the document.

### Quick start

```tsx
import { UiErrorBoundary } from '@vilnacrm/ui-toolkit';

export default function Dashboard() {
  return (
    <UiErrorBoundary onError={reportToMonitoring}>
      <RevenueWidget />
    </UiErrorBoundary>
  );
}
```

The component is exported from the package root. There is no supported deep import path.

### What it catches

Errors thrown below the boundary during render, in lifecycle methods, and in the constructors of
the components it wraps.

### What it does not catch

The same exclusions React's own boundary contract carries:

- event handlers;
- asynchronous code (`setTimeout`, promise callbacks, work resumed after an `await`);
- server-side rendering;
- errors thrown by the fallback itself.

A rejected form submit is asynchronous, so no boundary above it will ever see it. That is exactly
why `UiForm` carries its own rejection contract, documented below.

### Fallback modes

`fallback` accepts either a render prop or a `ReactNode`, and resolution runs in this order:

1. a function: it is called as `fallback(error, reset)` and its result is rendered;
2. any other non-nullish value: that node is rendered as is;
3. omitted or nullish: the built-in default fallback is rendered.

Resolution is nullish, so `fallback={null}` does **not** suppress the default fallback: the
never-blank guarantee outranks a consumer's ability to render nothing. To render nothing on
purpose, pass a render prop that returns an empty fragment.

### Recovery paths

There are two, and both remount the subtree below the boundary:

- `reset` is the second argument handed to a render-prop fallback. Call it from a retry control
  inside your fallback.
- `resetKeys` is an array the boundary watches while it is holding an error. When the array
  changes, the boundary clears itself.

`resetKeys` is compared shallowly and element-wise with `Object.is`, and a length change counts as
a change on its own. Omitted or empty means no automatic reset. A key change on a healthy boundary
does nothing, because the comparison only runs while an error is held. Recovery remounts rather
than re-renders: the subtree is rebuilt from its initial state, so a boundary that recovers into
the same broken input simply catches again.

### onError

`onError(error, info)` is invoked once per caught error, with the `Error` and React's `ErrorInfo`
(which carries `componentStack`). The toolkit reports nowhere itself: there is no built-in
telemetry sink, so wire `onError` to whatever your application already uses. When no `onError` is
supplied, a development-only warning is emitted in its place, so a caught error is never silent in
development.

### Accessibility

The default fallback carries `role="alert"` and real text content, never an icon or a colour cue
alone, and the node is mounted with its text already in place, which is what makes it announce.

A consumer-supplied fallback is the consumer's responsibility and gets no injected roles or
semantics. The accessibility review requires the following checklist for a custom fallback:

- put `role="alert"` on the message element only, mounting with its text; never on a wrapper
  containing interactive elements (interactive error UI is the `alertdialog` pattern);
- a retry control is a native button with an accessible name and a visible focus indicator;
- if the error was interaction-triggered, focus the fallback's retry control on appearance (the
  consumer can know this; the toolkit cannot);
- after calling `reset()`, move focus deliberately: the render-prop reset destroys the focused
  Try-again button and drops focus to `body` on every recovery (`resetKeys` is focus-safe by
  construction because the driving control lives outside the boundary);
- never render `error.message` or stack traces into an assertive atomic region;
- meet WCAG 1.4.1 and 1.4.3 in custom fallback styling;
- repeated identical failures overwrite the error without a DOM change, so some screen readers
  will not re-announce; vary the message if per-attempt announcements matter.

Three further notes. The default fallback text is announced in English on non-English pages unless
the consumer defines `error_boundary.default_message` in their own i18next resources, which win
over the built-in `defaultValue`. A rare VoiceOver plus Safari caveat can drop inserted alerts,
and is accepted for v1. Prefer contextual per-region fallbacks: wrap widgets, not whole-page
landmarks and not the region holding the page's only `h1`.

### i18n

The default fallback's message resolves through the i18next key `error_boundary.default_message`
with an explicit `defaultValue` of `Something went wrong.`. The toolkit ships no locale resource
entry for that key, so an application that does not define it renders the English default,
including under an i18next instance carrying no resources at all. Define the key in your own
resources to translate it.

### UiForm and rejected submits

`UiForm` contains a rejected `onSubmit` instead of letting it escape as an unhandled promise
rejection:

- `onSubmitError(error)` receives whatever value the rejection carried, and is the supported
  failure signal;
- with no handler attached the rejection is still contained and a development-only warning is
  emitted in its place; it is never re-thrown. The production bundle strips that warning, so a
  production app that wants failed submits visible anywhere (a toast, a monitoring SDK, a log)
  must attach `onSubmitError` — without it, a failed submit produces no signal at all;
- the `resetOnSuccess` reset is skipped on failure, so a rejected submit never clears the user's
  input;
- the existing `error` display prop is unchanged and independent: `onSubmitError` is the callback,
  `error` is the rendering. The usual wiring stores a message in `onSubmitError` and passes it
  back through `error`.

**The `formState.isSubmitSuccessful` nuance.** Because a rejection is contained rather than
re-thrown, `react-hook-form` sees the submit as having completed and leaves
`formState.isSubmitSuccessful` set to `true` after a rejected submit. Do not read it as a success
signal; use `onSubmitError` or the `error` prop instead.

**Pick exactly one escalation path per failure.** The `error` banner and a rethrow into a
surrounding `UiErrorBoundary` are mutually exclusive. Wiring both yields two competing
`role="alert"` regions, and their announcements are duplicated, interrupted, or dropped.

### No migration required

The change is additive. No existing exported prop, default, or rendered output changed:
`UiErrorBoundary` is a new export and `onSubmitError` is a new optional prop on `UiForm`. Existing
call sites compile and render exactly as before.

One behavioural exception, both halves documented above: a rejected `onSubmit` no longer escapes.
An app that observed failed submits through a global `unhandledrejection` listener, or that reads
`formState.isSubmitSuccessful` as a failure signal, must switch those call sites to
`onSubmitError`.

## Notes

- This repository is a React UI library, not a Next.js app.
- Source code lives under `src`; there is no `pages` app surface.
- `make lint-next` runs ESLint. The name predates the library split — it is not
  Next.js-specific — and is kept only to avoid renaming churn across CI and tooling.

## Security

Report vulnerabilities through the private reporting guidance in [SECURITY.md](SECURITY.md).

## Contributing

Contribution workflow details live in [CONTRIBUTING.md](CONTRIBUTING.md).
