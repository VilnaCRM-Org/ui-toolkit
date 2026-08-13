# Story 1.3: Storybook stories, visual baselines, and drift-guard coverage

Status: Approved

## Story

As a maintainer,
I want a story per fallback mode with committed pixel baselines,
so that the fallback rendering is reviewable in Storybook and protected from silent drift.

## Acceptance Criteria

1. Exactly these files are created:
   `src/components/ui-error-boundary/error-boundary.stories.tsx` and three PNG baselines under
   `tests/visual/visual.spec.ts-snapshots/` named `<story-id>-chromium-linux.png`.
2. Exactly one file is modified: `tests/visual/stories.json`.
3. The story filename strips the `ui-` prefix (`error-boundary.stories.tsx`), matching repository
   convention, and the meta `title` is `UiComponents/UiErrorBoundary`.
4. The file exports exactly three stories: `DefaultFallback`, `CustomNodeFallback`, and
   `RenderPropFallback` - one per fallback mode.
5. The resulting story ids are `uicomponents-uierrorboundary--default-fallback`,
   `uicomponents-uierrorboundary--custom-node-fallback`, and
   `uicomponents-uierrorboundary--render-prop-fallback`.
6. Each story renders a **module-scope** child that throws unconditionally during render, so every
   load produces the same committed pixels: no timers, no random values, no dates, and no error
   text echoed into the DOM.
7. The render-prop story renders a static "Try again" `UiButton` wired to `reset`, and the
   baseline captures its rest state only - no hover, no focus, no click in the snapshot path.
8. `argTypes` mark `fallback` and `children` as `control: false` so the docs page cannot mutate
   the snapshot.
9. `UiButton` is imported through its barrel (`../ui-button`); no deep import into another
   component's folder appears in the story file, so `make lint-deps` stays at zero new violations.
10. All three ids are registered in `tests/visual/stories.json`, keeping the file's existing
    shape - a flat array of `{ id, title, name }` objects sorted by `id` - so both completeness
    drift guards pass:
    the one in `tests/visual/visual.spec.ts` and the one in `tests/e2e/stories.smoke.spec.ts`,
    each of which compares the manifest against the live Storybook `index.json`.
11. Baselines are generated **only inside the pinned Playwright Docker image with `tests/`
    bind-mounted** so the PNGs persist to the host. None are generated on the host directly: host
    Chromium and host fonts do not match CI, and the committed files must carry the
    `-chromium-linux` suffix produced by the image.
12. `make test-visual` passes against the committed baselines.
13. `make test-e2e` reports zero `pageerror` for the three stories. React 19 routes a caught error
    to `onCaughtError` and `console.error` and calls `reportError()` only for uncaught errors, so
    a contained throw should not register. This is confirmed empirically on the first
    `make test-e2e` run, not assumed.
14. If a `pageerror` does register, the story is reworked to reach the fallback without an
    uncaught throw. **The smoke assertion is never weakened**, and
    `tests/e2e/stories.smoke.spec.ts` is not edited.
15. The smoke suite's other assertion also holds: each story's Storybook root mounts at least one
    child element (`childElementCount > 0`). The rendered fallback satisfies this.
16. `make storybook-build` succeeds and all three stories render in Storybook.
17. If the `calibreapp/image-actions` workflow recompresses the newly committed PNGs, the
    recompressed files are committed as a follow-up so the visual job is green.
18. No source file under `src/components/ui-error-boundary/` other than the new story file is
    touched; the component API frozen by Story 1.1 is not changed to suit a story.
19. No threshold in `config/metrics-policy.json`, `stryker.config.mjs`, or `jest.config.ts` is
    relaxed, and `maxDiffPixelRatio` in `tests/visual/visual.spec.ts` is not raised.

## Tasks / Subtasks

- [ ] Task 1: Author the story file (AC: 1, 3, 4, 5, 6, 7, 8, 9, 18)
  - [ ] 1.1 Create `src/components/ui-error-boundary/error-boundary.stories.tsx` with
        `title: 'UiComponents/UiErrorBoundary'`, `component: UiErrorBoundary`, and
        `tags: ['autodocs']`, matching the other component stories in this repository
  - [ ] 1.2 Declare a module-scope `Boom` component that throws unconditionally during render and
        reuse the same instance across all three stories
  - [ ] 1.3 Export `DefaultFallback` (no `fallback` prop), `CustomNodeFallback` (a static
        `ReactNode` fallback), and `RenderPropFallback` (an `(error, reset)` function returning a
        static "Try again" `UiButton` wired to `reset`)
  - [ ] 1.4 Add `argTypes: { fallback: { control: false }, children: { control: false } }`
  - [ ] 1.5 Confirm no timers, no `Math.random`, no `Date`, and no `error.message` render anywhere
        in the file
  - [ ] 1.6 Import `UiButton` from `../ui-button` and `UiErrorBoundary` from `./index`

- [ ] Task 2: Register the stories in the manifest (AC: 2, 10)
  - [ ] 2.1 Run `make storybook-build` so `storybook-static/index.json` is current
  - [ ] 2.2 Regenerate `tests/visual/stories.json` from that index using the snippet in
        `tests/visual/README.md` (map every `type === 'story'` entry to `{ id, title, name }` and
        sort by `id`), or insert the three entries by hand in the same sorted position
  - [ ] 2.3 Confirm the resulting ids match AC5 exactly and that no unrelated entry changed

- [ ] Task 3: Generate the baselines in the pinned Playwright image (AC: 1, 11, 12)
  - [ ] 3.1 `docker compose up -d --build storybook` so the served Storybook renders current `src`
  - [ ] 3.2 Wait for the served iframe with the `wait-on` command in the "Baseline generation"
        block below
  - [ ] 3.3 The `playwright` service has **no volume mount**, so bind-mount `tests/` to persist
        the writes, using the third command in that block (add `--grep` to target only the new
        stories)
  - [ ] 3.4 A missing snapshot auto-writes the baseline AND fails that run - that failure is the
        expected RED signal; re-run to confirm green
  - [ ] 3.5 Confirm the three new files landed under
        `tests/visual/visual.spec.ts-snapshots/` with the `-chromium-linux.png` suffix and are
        owned by the host user
  - [ ] 3.6 Review the three PNGs visually before committing them

- [ ] Task 4: Confirm the e2e smoke contract (AC: 13, 14, 15)
  - [ ] 4.1 Run `make test-e2e` and confirm zero `pageerror` for the three new story ids
  - [ ] 4.2 If a `pageerror` registers, rework the story so the fallback is reached without an
        uncaught throw, regenerate the affected baseline, and re-run. Do not edit
        `tests/e2e/stories.smoke.spec.ts`
  - [ ] 4.3 Record the observed outcome in the Completion Notes either way, since the architecture
        flagged this as unconfirmed

- [ ] Task 5: Gate sweep (AC: 12, 16, 19)
  - [ ] 5.1 `make lint-next`, `make lint-tsc`, `make format-check`
  - [ ] 5.2 `make lint-deps` - zero new violations from the story file's imports
  - [ ] 5.3 `make storybook-build`
  - [ ] 5.4 `make test-visual` - green against the committed baselines, drift guard included
  - [ ] 5.5 `qlty check`
  - [ ] 5.6 Confirm by diff that no threshold config and no `maxDiffPixelRatio` changed

- [ ] Task 6: Post-push follow-up (AC: 17)
  - [ ] 6.1 After pushing, check whether the `calibreapp/image-actions` workflow pushed a
        recompression commit for the new PNGs; if so, `git pull --ff-only` and confirm the visual
        job is green on the recompressed files

## Dev Notes

### Dependencies

Story 1.1 must be complete and its component API frozen: the three stories exercise the three
fallback modes exactly as `FallbackView` resolves them, and a late API change would invalidate
committed pixels.

### Story architecture (Architecture Decision 8)

| Export               | Story id                                             |
| -------------------- | ---------------------------------------------------- |
| `DefaultFallback`    | `uicomponents-uierrorboundary--default-fallback`     |
| `CustomNodeFallback` | `uicomponents-uierrorboundary--custom-node-fallback` |
| `RenderPropFallback` | `uicomponents-uierrorboundary--render-prop-fallback` |

The repository strips the `ui-` prefix from story filenames, so the file is
`error-boundary.stories.tsx` (compare `ui-card-list/card-list.stories.tsx`). Existing stories use
the `Meta` / `StoryObj` shape from `@storybook/react` with `tags: ['autodocs']`.

The `DefaultFallback` story exercises the built-in fallback delivered in Story 1.1, whose text is
`'Something went wrong.'`. That string is resolved through
`t('error_boundary.default_message', { defaultValue: 'Something went wrong.' })` and, because the
ratified i18n decision adds **no locale resource entries**, it resolves through `defaultValue` on
every path - including `.storybook/preview.tsx`'s initialized instance. The baseline is therefore
deterministic in Storybook, in CI, and in the unit tier alike.

Determinism rules for all three stories: the throwing child is module-scope and throws
unconditionally; nothing renders `error.message`; no timers, no random values, no dates. The
render-prop story's "Try again" `UiButton` is captured at rest.

Story files are excluded from `collectCoverageFrom` in `jest.config.ts` and from the Stryker
`mutate` glob, so the story file adds nothing to the coverage or mutation denominators.

### The visual and e2e wiring

`tests/visual/stories.json` is a flat array of `{ id, title, name }` objects sorted by `id`, and
it feeds **two** suites:

- `tests/visual/visual.spec.ts` - one `toHaveScreenshot` call per entry, named after the story id,
  at viewport 1280x720, chromium only, `fullPage: true`, `maxDiffPixelRatio: 0.02`, animations
  frozen; plus a completeness test asserting the manifest ids equal the live Storybook
  `index.json` story ids.
- `tests/e2e/stories.smoke.spec.ts` - renders every entry across all configured browsers,
  asserts the root mounted at least one child element and that **zero** `pageerror` fired; plus
  the same completeness assertion.

Because both drift guards compare against the live index, adding the story file without updating
the manifest fails the suites, and updating the manifest without the story file fails them too.
Land both in the same commit.

The `pageerror` assertion is the one genuinely uncertain point in this story. React 19 routes a
_caught_ error to `onCaughtError` and `console.error`, and calls `reportError()` - which raises a
window `error` event that Playwright surfaces as `pageerror` - only for _uncaught_ errors. A
boundary-contained throw should therefore not register. Confirm it on the first `make test-e2e`
run and record the result. If it does register, rework the story to reach the fallback without an
uncaught throw; never weaken the assertion.

### Baseline generation (mandatory procedure)

Baselines under `tests/visual/**/*-chromium-linux.png` MUST be generated in the pinned Playwright
Docker image (`Dockerfile.playwright`, `mcr.microsoft.com/playwright`), never on the host - host
Chromium and host fonts do not match CI and produce pixel diffs. `make test-visual` itself only
_compares_; it builds the image, brings up the `storybook` compose service, and runs
`bun x playwright test ./tests/visual` in a container that has **no volume mount**, so snapshot
writes would be discarded.

To write baselines that persist:

```bash
docker compose up -d --build storybook
docker compose run --rm playwright sh -lc \
  "bun x wait-on --timeout 180000 http-get://storybook:6006/iframe.html"
docker compose run --rm -v "$PWD/tests:/app/tests" playwright \
  bun x playwright test ./tests/visual --project=chromium
```

The container's `pwuser` is uid 1000, matching the host uid, so the written PNGs are owned
correctly. A missing snapshot is auto-written and the run fails - that is the expected RED signal;
re-run to confirm green. Afterwards, run the canonical `make test-visual` to verify the committed
baselines pass the way CI runs them.

Known CI gotchas: CI does not propagate `CI=true` into the playwright container, so
`playwright.config` sees `retries: 0`; a cold-start flake on the very first post-build run can
fail and pass on a warm re-run. The `calibreapp/image-actions` PR workflow auto-recompresses newly
committed PNGs and pushes a commit to the branch, so `git pull --ff-only` after it lands.

### Project Structure Notes

- The story file lives beside the component in `src/components/ui-error-boundary/`, not under
  `tests/`; `scripts/check-test-structure.sh` governs `*.test.*` files only.
- `components-public-api` in `.dependency-cruiser.js` permits a component's own internals plus
  another component's `index.ts(x)` barrel. `../ui-button` is a barrel, so the render-prop story's
  import is allowed; a deeper path would not be.
- All paths stay kebab-case for `no-uppercase-paths` and `component-name-kebab-case`.

### Testing Approach

- `make storybook-build` - the three stories compile and render.
- `make test-visual` - pixel comparison against the committed baselines plus the manifest
  completeness drift guard.
- `make test-e2e` - the smoke suite's mount assertion and the zero-`pageerror` assertion across
  all configured browsers.
- `make lint-deps` - the story file introduces no new graph violation.

## Definition of Done

- [ ] `make lint-next`, `make lint-tsc`, `make format-check` pass.
- [ ] `make lint-deps` reports zero new findings.
- [ ] `make storybook-build` succeeds and the three stories render in Storybook.
- [ ] `make test-visual` passes and the story-manifest drift guard reports no missing coverage.
- [ ] `make test-e2e` reports zero `pageerror` for the three new stories, and the observed result
      is recorded in the Completion Notes.
- [ ] The three baselines were generated inside the pinned Playwright Docker image with `tests/`
      bind-mounted, and none were generated on the host.
- [ ] `qlty check` reports no new findings.
- [ ] No threshold and no `maxDiffPixelRatio` was relaxed.

## References

- Epics:
  `specs/ui-error-boundary/planning-artifacts/epics-ui-error-boundary-2026-08-13.md`
  - Epic 1, Story 1.3 (scope, acceptance criteria, definition of done)
- Architecture:
  `specs/ui-error-boundary/planning-artifacts/architecture-ui-error-boundary-2026-08-13.md`
  - Decision 8 (stories table, visual and e2e wiring)
  - Gap Analysis Results (the e2e story-smoke `pageerror` assertion; visual baselines)
- Repository: `tests/visual/README.md` (manifest regeneration snippet, baseline conventions).
- FRs covered: FR25, FR26.

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
