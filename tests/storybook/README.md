# Storybook interaction tests

Behavioural coverage of the library's stories: every interactive component ships a
story whose `play` function drives it the way a user would — in a real browser,
against the Storybook build the library actually publishes.

## What runs

`make test-storybook` boots the `storybook` service, then runs
`scripts/ci/run-storybook-interactions.ts` inside the Playwright image. That script
is the gate:

1. **Before the run** it fetches the live `index.json` and asserts that the stories
   tagged `interaction` are exactly the ones registered in
   `interaction-stories.json`, and that at least `MINIMUM_COMPONENTS` distinct
   components are covered.
2. **The run** is `@storybook/test-runner --includeTags interaction`, chromium only.
3. **After the run** it reads the JUnit report and asserts one _passing_
   `play-test` per registered story — no failures, no skips.

Step 1 and step 3 exist because `--includeTags` rewrites every story file without a
matching story into a skipped no-op suite: Jest alone would exit `0` if the tag
vanished from the whole library. The suite fails closed instead.

## Adding an interaction

1. Add a new story export to the component's `*.stories.tsx` — never bolt `play`
   onto an existing story. Existing stories are pinned by visual baselines, and
   Storybook autoplays `play` as soon as the canvas renders.
2. Tag it `tags: ['interaction', '!autodocs']` and write the `play` function with
   `within`, `userEvent` and `expect` imported from `storybook/test`. Pass explicit
   `fn()` spies for the handlers you assert on — an implicit action arg throws when
   a play function invokes it.
3. Rebuild Storybook (`make storybook-build`, or `bun x storybook build`) and
   regenerate both manifests from the fresh index — `../visual/stories.json` (every
   story, see `../visual/README.md`) and this one (the `interaction`-tagged subset,
   plus each story's `exportName`):

   ```bash
   node -e 'const j=require("./storybook-static/index.json");const fs=require("fs");\
   const tagged=e=>e.type==="story"&&(e.tags||[]).includes("interaction");\
   const s=Object.values(j.entries).filter(tagged)\
   .map(e=>({id:e.id,title:e.title,name:e.name,exportName:e.exportName}))\
   .sort((a,b)=>a.id.localeCompare(b.id));\
   fs.writeFileSync("tests/storybook/interaction-stories.json",JSON.stringify(s,null,2)+"\n")'
   ```

`tests/unit/storybook-interaction-coverage.test.ts` statically scans the story
sources, so a `play` function that is not tagged and registered fails the unit
suite, and `tests/visual/visual.spec.ts` asserts the pixel-exemption list and this
registry are the same set.

## Why interaction stories have no pixel baseline

Their canvas mutates itself asynchronously, so a screenshot races the `play` phase
and could capture any intermediate frame. They are proven behaviourally here and
still covered by the e2e smoke suite (mount + no page error, on all three engines).
