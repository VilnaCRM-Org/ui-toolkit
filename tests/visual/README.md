# Visual regression tests

Pixel baselines for every Storybook story, asserted with Playwright
`toHaveScreenshot` against the running Storybook iframe.

## Scope

- **Chromium only.** Pixel baselines are environment-locked, so visual regression
  runs on a single engine; cross-browser _behaviour_ is covered by the e2e suite
  (`tests/e2e`, run on chromium + firefox + webkit). `visual.spec.ts` calls
  `test.skip` on any non-chromium project.
- One snapshot per story. The story list lives in `stories.json`, derived from the
  Storybook index and committed so the run is identical locally and in Docker.
- **Except interaction stories.** Stories registered in
  `../storybook/interaction-stories.json` autoplay a `play` function that mutates
  their own canvas, so a screenshot would race the interaction. They are pixel-exempt
  and proven behaviourally by `make test-storybook`; `visual.spec.ts` asserts the
  exempt set and that registry are identical, so a story can never fall out of both.
- Shots are deterministic: `prefers-reduced-motion: reduce` is emulated (which also
  exercises the skeleton reduced-motion guard) and an injected stylesheet disables
  every `animation`/`transition`, so shimmer/pulse never flake the diff.
- **Exact comparison.** `playwright.config.ts` sets `threshold: 0`, `maxDiffPixels: 0`
  and `maxDiffPixelRatio: 0` for every `toHaveScreenshot`, and no spec declares a per-shot
  budget. Playwright's default `threshold: 0.2` let a real regression pass green: a 3px
  shift of the pin field's focused digit moved 640 pixels and was still inside the
  tolerance. A budget "in the low hundreds" would have caught that one, but the gate is
  only trustworthy when a changed pixel is a failed test.
- **Pinned rasteriser.** The `chromium` project launches with `--disable-lcd-text`,
  `--disable-gpu-rasterization` and `--disable-skia-runtime-opts` (Playwright itself already
  passes `--force-color-profile=srgb` and, in headless mode, `--hide-scrollbars`). Subpixel
  text anti-aliasing, GPU tile rasterisation and Skia's per-CPU runtime code paths are the
  usual sources of the 2-68 pixel run-to-run residue on box-shadow and 1px-border recipes
  over near-white greys; with all three off, Skia rasterises the same bytes on every host.
  The project is shared with `tests/e2e`, so the flags apply there too (behaviour-only, so
  inert); the Storybook interaction runner launches its own browser and is unaffected.
- **No retries.** `retries: 0` is unconditional, so a comparison that fails once fails the
  job instead of being retried and reported as flaky.
- **Settled captures.** `openStory`/`openFrozenStory` wait for a _visible child_ of the
  story root (the empty root is already "visible" before React mounts), await
  `document.fonts.ready`, then park the pointer at `(0, 0)` so no hover recipe leaks into a
  rest or focus shot. Every capture first waits two `requestAnimationFrame`s (`settle`),
  because `.hover()` / `.press('Tab')` resolve when the input event is dispatched, not when
  the style it triggers has composited.

## Running

- **Docker (canonical, matches CI):** `make test-visual` — builds the Playwright
  image, serves Storybook, and compares fresh shots against the committed baselines.
- **Locally:** build Storybook and serve it, then point Playwright at it:

  ```bash
  bun x storybook build
  python3 -m http.server 6029 --bind 127.0.0.1 --directory storybook-static &
  REACT_APP_STORYBOOK_URL=http://127.0.0.1:6029 \
    bun x playwright test tests/visual --project=chromium
  ```

## Updating baselines

After an intentional visual change, regenerate the baselines inside the same pinned Playwright
image CI compares against, then review every changed PNG before committing it:

```bash
make test-visual-update
git status --short tests/visual/visual.spec.ts-snapshots
```

The target bind-mounts `tests/` into the container so the new PNGs land in the working tree.
Baselines are committed under `visual.spec.ts-snapshots/` as `*-chromium-linux.png`; a PNG
captured on a host browser renders differently and fails `make test-visual` in CI, which is the
guard against an unreproducible baseline. Attach the before/after diff to the pull request.

### Promoting baselines from CI

`make test-visual` is also what the `Visual Tests` workflow runs, and the job bind-mounts
`test-results/` and `playwright-report/` out of the container, so a red run is the
regeneration recipe when Docker is not available locally:

```bash
gh run download <run-id> -n visual-test-results -D test-results
promote() {
  local name
  name="$(basename "${1%-actual.png}")-chromium-linux.png"
  mv "$1" "tests/visual/$2.spec.ts-snapshots/$name"
}
for actual in test-results/visual-states-*/*-actual.png; do promote "$actual" states; done
for actual in test-results/visual-visual-*/*-actual.png; do promote "$actual" visual; done
```

Result directories are prefixed by spec: `test-results/visual-states-*` belongs to
`states.spec.ts-snapshots/`, `test-results/visual-visual-*` to `visual.spec.ts-snapshots/`.
Review each `*-diff.png` from the same artifact before committing the promoted PNG; a diff
that is only anti-aliasing is a reshoot, anything structural is a regression to fix first.

## Adding a story

Regenerate the manifest so the new story is covered, then update baselines:

```bash
node -e 'const j=require("./storybook-static/index.json");const fs=require("fs");\
const s=Object.values(j.entries).filter(e=>e.type==="story")\
.map(e=>({id:e.id,title:e.title,name:e.name})).sort((a,b)=>a.id.localeCompare(b.id));\
fs.writeFileSync("tests/visual/stories.json",JSON.stringify(s,null,2)+"\n")'
```
