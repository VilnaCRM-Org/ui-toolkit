# Story 1.4: README "Error handling" section and the final gate sweep

Status: Approved

## Story

As a contributor evaluating the toolkit,
I want the error-recovery contract documented in the README and every repository gate green,
so that the boundary and the form contract are usable without reading source, and the change
merges without a quality regression.

## Acceptance Criteria

1. Exactly one file is modified for documentation: `README.md`, which gains a new top-level
   `## Error handling` section placed after `## Project Layout` and before `## Notes`.
2. The section explains why the toolkit ships a boundary: one bad prop must not blank a page.
3. It gives a `UiErrorBoundary` quick start importing from the package root
   (`import { UiErrorBoundary } from '@vilnacrm/ui-toolkit';`). No deep import path into
   `src/components/ui-error-boundary/` is shown or implied.
4. It states what the boundary catches: render, lifecycle, and constructor errors below it.
5. It states what the boundary does **not** catch - event handlers, async code, server rendering,
   and errors thrown by the fallback itself - and makes the explicit link that this is exactly why
   `UiForm` carries its own contract.
6. It documents the three fallback modes - render-prop, `ReactNode`, and the built-in default -
   in the resolution order render-prop, then node, then default, and states that **`null` does not
   suppress the default fallback** (resolution is nullish).
7. It documents the two recovery paths: `reset` handed to a render-prop fallback, and `resetKeys`
   (shallow, element-wise `Object.is`; omitted or empty means no automatic reset; a key change on
   a healthy boundary does nothing; recovery remounts the subtree).
8. It documents `onError`: invoked once per caught error with the `Error` and React's `ErrorInfo`;
   the toolkit reports nowhere itself; when no `onError` is supplied a development-only warning is
   emitted instead.
9. It documents accessibility: the default fallback carries `role="alert"` and real text content -
   never an icon or colour cue alone - and a consumer-supplied fallback is the consumer's
   responsibility and gets **no injected roles or semantics**.
10. It documents the `UiForm` rejection contract: `onSubmitError`, no reset on failure, the
    development-only warning when no handler is attached, how it relates to the existing `error`
    display prop, and the `formState.isSubmitSuccessful` nuance recorded in Story 1.2 (a contained
    rejection makes `react-hook-form` treat the submit as successful, so `onSubmitError` or the
    `error` prop is the supported failure signal).
11. It states that no migration is required because the change is additive: no existing exported
    prop, default, or rendered output changed.
12. It documents the default fallback's i18n behaviour honestly: the message resolves through
    `error_boundary.default_message` with an explicit `defaultValue`, and because the toolkit ships
    no locale resource entry for it, an application that does not define the key renders the
    English default.
13. Every line added to `README.md` and to any file under `specs/` is at most 100 UTF-8 bytes and
    ASCII only. (`editorconfig-checker` inside `qlty` counts bytes, not characters.)
14. `make lint` passes end to end: `lint-next`, `lint-tsc`, `lint-md`, `format-check`,
    `lint-dep-ranges`, `lint-test-structure`, `lint-deps`, `lint-metrics`.
15. `make test-unit` and `make test-integration` pass at the 100% global coverage threshold.
16. `make test-visual` passes against the committed baselines.
17. `make test-bats` passes (Makefile shell-flow and coverage contracts).
18. `make test-e2e` passes, including zero `pageerror` for the three new stories.
19. Mutation shards run and `make merge-mutation-reports` reports a merged score at or above the
    Stryker `break` threshold of 80 for the touched files:
    `src/components/ui-error-boundary/index.tsx`, `.../fallback-view.tsx`,
    `.../default-fallback.tsx`, and `src/components/ui-form/index.tsx`.
20. Every mutant in the hardening map below has a named killing test, and **any survivor is killed
    by strengthening an assertion, never by narrowing the mutation scope** - the `mutate` glob in
    `stryker.config.mjs` and the parallel walk in `stryker.shard.config.mjs` are not edited.
21. `qlty check` and `qlty fmt --check` report no new findings; the repository has no `jscpd`
    target, so duplication is covered by `qlty`'s duplication analysis.
22. `make generate-ts-doc` reports no `ae-forgotten-export`.
23. **No threshold in `config/metrics-policy.json`, `stryker.config.mjs`, or `jest.config.ts` was
    relaxed at any point in the epic**, and `maxDiffPixelRatio` in `tests/visual/visual.spec.ts`
    is unchanged. Verify this by diffing the whole branch against `main`, not just this story.
24. The final file delta for the epic is: 10 new files, 5 modified files, and 3 generated PNG
    baselines. `i18n/localization.json` is **not** among the modified files.

## Tasks / Subtasks

- [ ] Task 1: Write the README section (AC: 1-12, 13)
  - [ ] 1.1 Insert a new `## Error handling` section in `README.md` immediately after the
        `## Project Layout` section and before `## Notes`
  - [ ] 1.2 Write subsection "Why" - one bad prop must not blank a page
  - [ ] 1.3 Write the quick start with a fenced `tsx` block importing `UiErrorBoundary` from
        `@vilnacrm/ui-toolkit`
  - [ ] 1.4 Write "What it catches" (render, lifecycle, constructor errors below it)
  - [ ] 1.5 Write "What it does not catch" (event handlers, async code, server rendering, errors
        thrown by the fallback itself) and link that explicitly to the `UiForm` contract
  - [ ] 1.6 Write "Fallback modes": render-prop, node, default; resolution order; `null` does not
        suppress the default
  - [ ] 1.7 Write "Recovery": `reset` and `resetKeys`, including the shallow `Object.is` compare,
        the empty/omitted no-op, the healthy-boundary no-op, and the remount guarantee
  - [ ] 1.8 Write "onError": once per caught error, `ErrorInfo` included, the toolkit reports
        nowhere, dev warning when unhandled
  - [ ] 1.9 Write "Accessibility": `role="alert"` on the default fallback; consumer fallbacks get
        no injected semantics
  - [ ] 1.10 Write "i18n": key, `defaultValue`, and the no-shipped-resource behaviour
  - [ ] 1.11 Write "UiForm and rejected submits": `onSubmitError`, no reset on failure, dev
        warning, relation to the `error` display prop, and the `formState.isSubmitSuccessful`
        nuance from Story 1.2
  - [ ] 1.12 Write "No migration required"
  - [ ] 1.13 Sweep every added line for length and encoding:
        `awk 'length($0) > 100 { print FILENAME": "FNR }' README.md` (and the same over any spec
        file touched), plus an ASCII-only check

- [ ] Task 2: Static gate sweep (AC: 13, 14, 21, 22)
  - [ ] 2.1 `make lint` end to end and confirm all eight sub-targets pass
  - [ ] 2.2 `make generate-ts-doc` - no `ae-forgotten-export`
  - [ ] 2.3 `qlty check` and `qlty fmt --check` - no new findings, duplication included
  - [ ] 2.4 Re-run the line-length sweep after `make format-check`, since Prettier may reflow
        code fences

- [ ] Task 3: Test gate sweep (AC: 15, 16, 17, 18)
  - [ ] 3.1 `make test-unit`
  - [ ] 3.2 `make test-integration`
  - [ ] 3.3 `make test-visual`
  - [ ] 3.4 `make test-e2e`
  - [ ] 3.5 `make test-bats`

- [ ] Task 4: Mutation sweep (AC: 19, 20, 23)
  - [ ] 4.1 Bring the bun service up (`make start-bun`), then run each shard with
        `make test-mutation-shard MUTATION_SHARD_INDEX=<i> MUTATION_SHARD_TOTAL=<n>` and copy each
        report to the host with `make copy-mutation-report MUTATION_SHARD_INDEX=<i>`
  - [ ] 4.2 `make stage-mutation-reports`, then `make merge-mutation-reports` and confirm the
        merged score clears the `break: 80` gate
  - [ ] 4.3 For each of the four touched mutated files, walk the hardening map below and confirm
        the named killer exists and actually fails when the mutant is applied
  - [ ] 4.4 For every survivor, strengthen the corresponding assertion in the unit or integration
        suite. Do NOT narrow `mutate` in `stryker.config.mjs`, do NOT touch
        `stryker.shard.config.mjs`'s walk, and do NOT lower `thresholds.break`
  - [ ] 4.5 Re-run the affected shard and the merge after each strengthening

- [ ] Task 5: Final epic verification (AC: 23, 24)
  - [ ] 5.1 Diff the whole branch against `main` and confirm `config/metrics-policy.json`,
        `stryker.config.mjs`, `stryker.shard.config.mjs`, `jest.config.ts`,
        `jest.integration.config.ts`, and `tests/visual/visual.spec.ts` are unchanged
  - [ ] 5.2 Confirm `i18n/localization.json` is unchanged and no new locale resource file exists
  - [ ] 5.3 Confirm the file delta is 10 new, 5 modified, 3 generated PNG baselines
  - [ ] 5.4 Record the merged mutation score and the per-file scores for the four touched files in
        the Completion Notes

## Dev Notes

### Dependencies

Stories 1.1, 1.2, and 1.3 must all be complete. The mutation sweep needs the final source and test
state, and the README's `UiForm` subsection needs the `formState.isSubmitSuccessful` note recorded
in Story 1.2's Completion Notes.

### Ratified decisions that shape the prose

- **i18n:** the key is `error_boundary.default_message` with `defaultValue` exactly
  `'Something went wrong.'`, and the toolkit ships **no new locale resource files or entries**.
  The README must describe that honestly (AC12) rather than promising a translated string.
- **`UiForm` contains and warns** when `onSubmitError` is absent; it never re-throws and never
  calls `methods.setError('root', ...)`. Do not document a `root` error behaviour.
- **No prop-type exports from `src/components/index.ts`.** Document props in prose and code
  fences; do not tell consumers to import `UiErrorBoundaryProps` from the package root.
- **Duplication is gated by `qlty`.** There is no `jscpd` target in this repository.
- **Never relax a threshold** to make anything fit. Refactor code or strengthen tests instead.

### README section outline (Architecture Decision 8)

New top-level section after `## Project Layout`:

1. Why the toolkit ships a boundary: one bad prop must not blank a page.
2. `UiErrorBoundary` quick start, imported from the package root.
3. What it catches: render, lifecycle, and constructor errors below it.
4. What it does **not** catch: event handlers, async code, server rendering, and errors thrown by
   the fallback itself, with the explicit link that this is exactly why `UiForm` carries its own
   contract.
5. The three fallback modes, including that `null` does not suppress the default.
6. The two recovery paths: `reset` from a render-prop fallback, and `resetKeys`.
7. `onError`: once per error, with React's `ErrorInfo`; the toolkit reports nowhere.
8. Accessibility: the default fallback is `role="alert"` rendered as large text (`bold22`), and
   a consumer fallback is the consumer's responsibility and gets no injected semantics. The
   accessibility-lead review (2026-08-13) requires this subsection to state the concrete
   consumer-fallback checklist verbatim rather than a bare "consumer owns a11y":
   - put `role="alert"` on the message element only, mounting with its text; never on a wrapper
     containing interactive elements (interactive error UI is the `alertdialog` pattern);
   - a retry control is a native button with an accessible name and a visible focus indicator;
   - if the error was interaction-triggered, focus the fallback's retry control on appearance
     (the consumer can know this; the toolkit cannot);
   - after calling `reset()`, move focus deliberately: the render-prop reset destroys the
     focused Try-again button and drops focus to `body` on every recovery (`resetKeys` is
     focus-safe by construction because the driving control lives outside the boundary);
   - never render `error.message` or stack traces into an assertive atomic region;
   - meet WCAG 1.4.1 and 1.4.3 in custom fallback styling;
   - repeated identical failures overwrite the error without a DOM change, so some screen
     readers will not re-announce; vary the message if per-attempt announcements matter.
     Also record: the default fallback text is announced in English on non-English pages unless
     the consumer defines `error_boundary.default_message` in their own i18next resources (which
     win over the built-in `defaultValue`); a rare VoiceOver+Safari caveat can drop inserted
     alerts (accepted for v1); prefer contextual per-region fallbacks (wrap widgets, not
     whole-page landmarks or the region holding the page's only `h1`).
9. The `UiForm` rejection contract: `onSubmitError`, no reset on failure, the dev warning when no
   handler is attached, how it relates to the existing `error` display prop, and the
   `formState.isSubmitSuccessful` nuance. State explicitly that the `error` banner and a
   rethrow-into-boundary are mutually exclusive escalation paths for one failure: wiring both
   yields two competing `role="alert"` regions and duplicated or dropped announcements.
10. "No migration required": the change is additive.

`README.md` currently has the top-level sections `## Stack`, `## Getting Started`,
`## Project Layout`, `## Notes`, `## Security`, `## Contributing`. Insert between
`## Project Layout` and `## Notes`. `README.md` is linted by `make lint-md` and formatted by
`make format-check`, so keep the markdown Prettier-clean.

### Line-length and encoding rule

`editorconfig-checker` inside `qlty` counts **UTF-8 bytes**, not characters, so a non-ASCII
character can pass ESLint and still fail `qlty check`. Keep every added line ASCII-only and at
most 100 bytes, in `README.md` and in every file under `specs/`. Sweep with:

```bash
awk 'length($0) > 100 { print FILENAME": "FNR": "length($0) }' README.md
```

### Mutation sweep

`stryker.config.mjs` mutates `./src/components/**/*.tsx` (stories excluded) with
`thresholds: { high: 90, break: 80 }`. The four files this epic puts inside that glob are
`ui-error-boundary/index.tsx`, `ui-error-boundary/fallback-view.tsx`,
`ui-error-boundary/default-fallback.tsx`, and `ui-form/index.tsx`. `types.ts` and `styles.ts` are
`.ts` and lie outside the glob by design.

The sharded gate derives its file set independently in `stryker.shard.config.mjs`; a drift between
the two would silently drop mutants from the merged score, which is a hidden gate weakening.
Neither file may be edited by this epic.

Full hardening map, with the owning suite:

| Mutant                                      | Killed by                        |
| ------------------------------------------- | -------------------------------- |
| `previous.length !== next.length` to `true` | boundary case 9 identical keys   |
| same, to `false`                            | boundary case 9 length change    |
| `!Object.is(...)` to `Object.is(...)`       | boundary case 9 value change     |
| `some` callback to `true` / `false`         | boundary cases 9 and 10          |
| `state.error === null` early return removed | boundary case 9 healthy boundary |
| `typeof fallback === 'function'` inverted   | boundary cases 5 and 7           |
| `fallback == null` to `!= null`             | boundary cases 2, 5 and 6        |
| `FALLBACK_MESSAGE` emptied                  | boundary cases 2 and 11          |
| `FALLBACK_KEY` emptied                      | boundary case 11                 |
| `role="alert"` removed or emptied           | boundary case 2 via `getByRole`  |
| `if (onError)` inverted                     | boundary cases 3 and 4           |
| `if (onSubmitError)` inverted               | form cases 2 and 5               |
| `if (resetOnSuccess)` inverted              | form cases 3 and 4               |
| `catch` block `return` removed              | form case 3                      |

Boundary cases are the numbered cases in `tests/unit/ui-error-boundary.test.tsx` (Story 1.1); form
cases are the numbered cases in `tests/unit/ui-form-submit-errors.test.tsx` (Story 1.2). Mutation
runs the FULL suite (unit plus integration) via `jest.mutation.config.ts`, so assertions in either
tier count toward killing a mutant.

Expect the string-literal mutants (`MISSING_ON_ERROR_WARNING`,
`UNHANDLED_SUBMIT_REJECTION_WARNING`, `FALLBACK_KEY`, `FALLBACK_MESSAGE`) to require assertions on
the exact text, not merely on call counts.

### Named make targets used by this story

`make lint` (which chains `lint-next`, `lint-tsc`, `lint-md`, `format-check`, `lint-dep-ranges`,
`lint-test-structure`, `lint-deps`, `lint-metrics`), `make test-unit`, `make test-integration`,
`make test-visual`, `make test-e2e`, `make test-bats`, `make test-mutation-shard`,
`make copy-mutation-report`, `make stage-mutation-reports`, `make merge-mutation-reports`,
`make generate-ts-doc`, plus `qlty check` and `qlty fmt --check`.

Stryker is slow (roughly 50 minutes for a full run in this repository), which is why the sharded
targets exist. Run the shards, then the merge gate; do not substitute a single unsharded
`make test-mutation` for the merged gate.

### Project Structure Notes

- Only `README.md` changes as source-of-record documentation. No source file is edited in this
  story except to kill a mutation survivor, and any such edit must keep every Story 1.1 and 1.2
  hard constraint intact (no class fields, zero module-scope functions in `index.tsx`, no
  `resetCount`, no inline `NODE_ENV` branch, no `data-testid`).
- Files under `specs/` are markdownlint-ignored but are still Prettier-formatted and still subject
  to the 100-byte line rule under `qlty`.
- `.github` is Prettier-ignored; nothing in this story touches it.

### Testing Approach

This story adds no test file. Verification is the full repository gate sweep plus the mutation
merge gate, exactly as CI runs it:

- `make lint` - all eight static targets;
- `make test-unit`, `make test-integration` - 100% coverage;
- `make test-visual`, `make test-e2e`, `make test-bats`;
- mutation shards plus `make merge-mutation-reports` - merged score at or above 80;
- `make generate-ts-doc` - api-extractor clean;
- `qlty check`, `qlty fmt --check` - no new findings, duplication included.

## Definition of Done

- [ ] `make lint` passes end to end: `lint-next`, `lint-tsc`, `lint-md`, `format-check`,
      `lint-dep-ranges`, `lint-test-structure`, `lint-deps`, `lint-metrics`.
- [ ] `make test-unit` and `make test-integration` pass at the 100% global coverage threshold.
- [ ] `make test-visual` passes against the committed baselines.
- [ ] `make test-e2e` passes with zero `pageerror` for the three new stories.
- [ ] `make test-bats` passes.
- [ ] Mutation shards plus `make merge-mutation-reports` clear the break-80 gate for all four
      touched files, and every survivor was killed by a strengthened assertion.
- [ ] `make generate-ts-doc` reports no `ae-forgotten-export`.
- [ ] `qlty check` and `qlty fmt --check` report no new findings, duplication included.
- [ ] No threshold in `config/metrics-policy.json`, `stryker.config.mjs`, or `jest.config.ts` was
      relaxed at any point in the epic, and the Stryker `mutate` scope was never narrowed.
- [ ] Every line added to `README.md` and to any spec file is at most 100 UTF-8 bytes, ASCII only.

## References

- Epics:
  `specs/ui-error-boundary/planning-artifacts/epics-ui-error-boundary-2026-08-13.md`
  - Epic 1, Story 1.4 (scope, acceptance criteria, definition of done)
  - Additional Requirements (standing no-threshold-relaxation constraint, 100-byte spec lines)
- Architecture:
  `specs/ui-error-boundary/planning-artifacts/architecture-ui-error-boundary-2026-08-13.md`
  - Decision 6 (the documented `formState.isSubmitSuccessful` nuance)
  - Decision 8 (README outline, mutation hardening map)
  - Enforcement Guidelines and Anti-patterns
- Sibling stories: `1-1-ui-error-boundary-component-and-suites.md`,
  `1-2-ui-form-rejection-contract.md`, `1-3-storybook-stories-and-visual-baselines.md`.
- FRs covered: FR27, FR28. NFRs covered: NFR5, NFR6, NFR8, NFR15.

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
