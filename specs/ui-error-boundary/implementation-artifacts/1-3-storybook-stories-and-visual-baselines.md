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

- [x] Task 1: Author the story file (AC: 1, 3, 4, 5, 6, 7, 8, 9, 18)
  - [x] 1.1 Create `src/components/ui-error-boundary/error-boundary.stories.tsx` with
        `title: 'UiComponents/UiErrorBoundary'`, `component: UiErrorBoundary`, and
        `tags: ['autodocs']`, matching the other component stories in this repository
  - [x] 1.2 Declare a module-scope `Boom` component that throws unconditionally during render and
        reuse the same instance across all three stories
  - [x] 1.3 Export `DefaultFallback` (no `fallback` prop), `CustomNodeFallback` (a static
        `ReactNode` fallback), and `RenderPropFallback` (an `(error, reset)` function returning a
        static "Try again" `UiButton` wired to `reset`)
  - [x] 1.4 Add `argTypes: { fallback: { control: false }, children: { control: false } }`
  - [x] 1.5 Confirm no timers, no `Math.random`, no `Date`, and no `error.message` render anywhere
        in the file
  - [x] 1.6 Import `UiButton` from `../ui-button` and `UiErrorBoundary` from `./index`

- [x] Task 2: Register the stories in the manifest (AC: 2, 10)
  - [x] 2.1 Run `make storybook-build` so `storybook-static/index.json` is current
  - [x] 2.2 Regenerate `tests/visual/stories.json` from that index using the snippet in
        `tests/visual/README.md` (map every `type === 'story'` entry to `{ id, title, name }` and
        sort by `id`), or insert the three entries by hand in the same sorted position
  - [x] 2.3 Confirm the resulting ids match AC5 exactly and that no unrelated entry changed

- [x] Task 3: Generate the baselines in the pinned Playwright image (AC: 1, 11, 12)
  - [x] 3.1 `docker compose up -d --build storybook` so the served Storybook renders current `src`
  - [x] 3.2 Wait for the served iframe with the `wait-on` command in the "Baseline generation"
        block below
  - [x] 3.3 The `playwright` service has **no volume mount**, so bind-mount `tests/` to persist
        the writes, using the third command in that block (add `--grep` to target only the new
        stories)
  - [x] 3.4 A missing snapshot auto-writes the baseline AND fails that run - that failure is the
        expected RED signal; re-run to confirm green
  - [x] 3.5 Confirm the three new files landed under
        `tests/visual/visual.spec.ts-snapshots/` with the `-chromium-linux.png` suffix and are
        owned by the host user
  - [x] 3.6 Review the three PNGs visually before committing them

- [x] Task 4: Confirm the e2e smoke contract (AC: 13, 14, 15)
  - [x] 4.1 Run `make test-e2e` and confirm zero `pageerror` for the three new story ids
  - [x] 4.2 If a `pageerror` registers, rework the story so the fallback is reached without an
        uncaught throw, regenerate the affected baseline, and re-run. Do not edit
        `tests/e2e/stories.smoke.spec.ts`
  - [x] 4.3 Record the observed outcome in the Completion Notes either way, since the architecture
        flagged this as unconfirmed

- [x] Task 5: Gate sweep (AC: 12, 16, 19)
  - [x] 5.1 `make lint-next`, `make lint-tsc`, `make format-check`
  - [x] 5.2 `make lint-deps` - zero new violations from the story file's imports
  - [x] 5.3 `make storybook-build`
  - [x] 5.4 `make test-visual` - green against the committed baselines, drift guard included
  - [x] 5.5 `qlty check`
  - [x] 5.6 Confirm by diff that no threshold config and no `maxDiffPixelRatio` changed

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

- [x] `make lint-next`, `make lint-tsc`, `make format-check` pass.
- [x] `make lint-deps` reports zero new findings.
- [x] `make storybook-build` succeeds and the three stories render in Storybook.
- [x] `make test-visual` passes and the story-manifest drift guard reports no missing coverage.
- [x] `make test-e2e` reports zero `pageerror` for the three new stories, and the observed result
      is recorded in the Completion Notes.
- [x] The three baselines were generated inside the pinned Playwright Docker image with `tests/`
      bind-mounted, and none were generated on the host.
- [x] `qlty check` reports no new findings.
- [x] No threshold and no `maxDiffPixelRatio` was relaxed.

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

`claude-opus-5[1m]` (Claude Code).

### Debug Log References

See "Completion Notes List" below - in particular the SB_PREVIEW_API_0002 finding, the
`pageerror` measurement, and the two environment deviations.

### Completion Notes List

- **AC13 confirmed empirically: zero `pageerror`.** `tests/e2e` ran green across chromium,
  firefox, and webkit (186/186), and a targeted `--grep "UiErrorBoundary"` run passed 9/9
  (3 stories x 3 browsers). React 19 routes the boundary-caught throw to `console.error`
  only; a DOM probe of each story recorded the React "caught error" console entry and no
  `pageerror` event. `tests/e2e/stories.smoke.spec.ts` was not edited and no assertion was
  weakened. The mount assertion also holds: each story root has `childElementCount === 1`.
- **Blocking discovery (not anticipated by the story): Storybook implicit actions.**
  `.storybook/preview.ts` sets `actions: { argTypesRegex: '^on[A-Z].*' }`, so Storybook
  injected an implicit action spy for `onError`. `componentDidCatch` calls that spy while the
  story is still rendering, which makes Storybook throw
  `SB_PREVIEW_API_0002 (ImplicitActionsDuringRendering)`, swallow the story, and leave
  `#storybook-root` empty (`sb-show-errordisplay`). All three stories rendered blank until an
  explicit `onError` no-op was supplied through `meta.args`, which is the fix Storybook's own
  error message prescribes. No component source changed (AC18 intact); the arg lives only in
  the story file.
- `CustomNodeFallback` first used `variant="medium16"`, whose theme colour is `grey300` -
  the baseline showed near-illegible grey body text. Switched to `bodyText16`
  (`darkPrimary`) and regenerated. Note for future baseline work: the first regeneration
  silently did nothing, because `--update-snapshots` defaults to `changed` and the colour
  swap stayed inside `maxDiffPixelRatio: 0.02`; `--update-snapshots=all` was required.
- The three baselines render with the browser's default serif (no webfont), which matches
  every pre-existing baseline in this repository (compare `uicomponents-uibutton--contained`):
  Storybook loads no `@font-face` in the preview. Nothing was changed to "fix" that.
- **Deviation 1 (environment, flagged): the Alpine image cannot be rebuilt right now.**
  `docker compose build storybook` fails on the pinned `nodejs=22.23.0-r0`; the Alpine index
  currently offers `nodejs-22.22.2-r0` (`apk add -s` reproduces it). This is pre-existing
  repo-wide pin drift, unrelated to this story, and fixing `Dockerfile` is out of scope here.
  Because `make test-visual` / `make test-e2e` both start with that build, they could not run
  verbatim. Substituted, using the cached `ui-toolkit-storybook` image with the working tree
  bind-mounted over its baked copy, so the served Storybook is current:
  `docker compose run -d --use-aliases --name uitk-sb-171 -v "$PWD/src:/app/src"`
  `-v "$PWD/.storybook:/app/.storybook" -v "$PWD/i18n:/app/i18n" storybook`, then the exact
  Playwright commands those targets run, in the pinned Playwright image. Same dev-server
  Storybook and same browser image as CI; only the image rebuild step differs.
- **Deviation 2 (procedure, flagged):** for the same reason, step 3.1's
  `docker compose up -d --build storybook` was replaced by the `docker compose run` form
  above. Step 3.3 (the `tests/` bind-mount into the Playwright container) was followed
  exactly; the PNGs landed on the host owned by `dima:dima`.
- Baseline generation command (AC11), run twice - RED on the first run (snapshots written,
  run fails) and green on the re-run:
  `docker compose run --rm -v "$PWD/tests:/app/tests" playwright bun x playwright test`
  `./tests/visual --project=chromium --grep "UiErrorBoundary" --reporter=line`.
  Nothing was generated on the host.
- Visual suite verdict: the full `./tests/visual` run (all projects, as `make test-visual`
  invokes it) reported 71 passed / 136 skipped / 0 failed - the 46 chromium screenshots
  including the three new ones, the `states.spec.ts` shots, and the manifest completeness
  drift guard on all three browsers. The 43 pre-existing baselines still pass, which also
  shows the substituted serving path is pixel-equivalent to the canonical one.
- Gate evidence (host, since the `bun` service is a baked image): `tsc --newLine LF` clean,
  `eslint` 0 problems, `prettier --check` clean, `storybook build` succeeded twice.
  `depcruise --config .dependency-cruiser.js src` exits 0 with 0 errors; the story file adds
  only the repo-wide `no-duplicate-dep-types` warning that every `react` importer carries.
  `lint-metrics` in the `rca` container: "all hard checks pass". `qlty check` on both changed
  files reports only the pre-existing sandbox issue
  (`TS5012: Cannot read file .../eslint/9.7.0-.../tsconfig.json`), reproduced identically on
  untouched `src/components/ui-button/button.stories.tsx`; `qlty fmt` changes neither file.
- AC19 verified by mtime: `config/metrics-policy.json`, `stryker.config.mjs`,
  `jest.config.ts`, `playwright.config.ts`, `tests/visual/visual.spec.ts` (which owns
  `maxDiffPixelRatio`), and `tests/e2e/stories.smoke.spec.ts` are all untouched.
- `depcruise` had to run under Node 24 (`~/.nvm/versions/node/v24.18.0`); the host's Node
  25.2.1 is rejected by dependency-cruiser's supported-version guard.
- Task 6 (image-actions recompression follow-up) remains open: it is a post-push step and no
  git operation was performed in this session.

### File List

Created:

- `src/components/ui-error-boundary/error-boundary.stories.tsx`
- three baselines under `tests/visual/visual.spec.ts-snapshots/`:
  - `uicomponents-uierrorboundary--default-fallback-chromium-linux.png`
  - `uicomponents-uierrorboundary--custom-node-fallback-chromium-linux.png`
  - `uicomponents-uierrorboundary--render-prop-fallback-chromium-linux.png`

Modified:

- `tests/visual/stories.json` (three entries inserted in sorted position; 43 -> 46 entries,
  none removed or altered)

### Change Log

- 2026-08-13: implemented; three stories, three baselines, manifest registration, and the
  `pageerror` contract confirmed. Two environment deviations recorded above.
