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
- Shots are deterministic: `prefers-reduced-motion: reduce` is emulated (which also
  exercises the skeleton reduced-motion guard) and an injected stylesheet disables
  every `animation`/`transition`, so shimmer/pulse never flake the diff.

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

After an intentional visual change, regenerate and review the diffs:

```bash
REACT_APP_STORYBOOK_URL=http://127.0.0.1:6029 \
  bun x playwright test tests/visual --project=chromium --update-snapshots
```

Baselines are committed under `visual.spec.ts-snapshots/` as `*-chromium-linux.png`.
They are generated on Linux/Chromium to match the Playwright Docker image
(`mcr.microsoft.com/playwright`), so the `linux` platform suffix is shared.

## Adding a story

Regenerate the manifest so the new story is covered, then update baselines:

```bash
node -e 'const j=require("./storybook-static/index.json");const fs=require("fs");\
const s=Object.values(j.entries).filter(e=>e.type==="story")\
.map(e=>({id:e.id,title:e.title,name:e.name})).sort((a,b)=>a.id.localeCompare(b.id));\
fs.writeFileSync("tests/visual/stories.json",JSON.stringify(s,null,2)+"\n")'
```
