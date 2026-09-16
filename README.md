# ui-toolkit

[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/VilnaCRM-Org/ui-toolkit/badge)](https://scorecard.dev/viewer/?uri=github.com/VilnaCRM-Org/ui-toolkit)

React UI component library built with Bun, Storybook, and MUI.

## Installing

`@vilnacrm/ui-toolkit` is distributed as a tarball attached to each GitHub release, not through
the npm registry. The repository is public, so the asset downloads without a token. Add the newest
release from the consuming application:

```bash
VERSION=$(gh release view --repo VilnaCRM-Org/ui-toolkit \
  --json tagName --jq '.tagName | ltrimstr("v")')
BASE=https://github.com/VilnaCRM-Org/ui-toolkit/releases/download
bun add "$BASE/v$VERSION/vilnacrm-ui-toolkit-$VERSION.tgz"
```

The application provides the peer dependencies itself; the toolkit bundles none of them:

```bash
bun add react react-dom @mui/material @mui/system @emotion/react @emotion/styled \
  react-hook-form i18next react-i18next
```

The accepted range of each peer is in the [support matrix](#module-format-and-support-matrix).
[CONSUMING.md](CONSUMING.md) covers pinning a release, verifying the recorded `sha512`, and
moving to a later one.

## Quick start

Import the stylesheet once, at the application root, before any toolkit component renders. It
carries the Inter and Golos Text `@font-face` rules and the carousel CSS; without it, text falls
back to the browser default face.

```tsx
import '@vilnacrm/ui-toolkit/styles.css';
import { UiButton, UiInput } from '@vilnacrm/ui-toolkit';

export default function SignIn() {
  return (
    <form>
      <UiInput label="Email" type="email" required />
      <UiButton variant="contained" type="submit">
        Sign in
      </UiButton>
    </form>
  );
}
```

Every component is also published on its own subpath, which is the smaller import and the one the
prop types resolve through:

```tsx
import UiButton from '@vilnacrm/ui-toolkit/ui-button';
import type { UiButtonProps } from '@vilnacrm/ui-toolkit/ui-button';
```

## Theming

The package exports the design tokens the components are built from:

- `sharedPalette` — the colour tokens, in MUI palette shape (`primary`, `secondary`, `error`,
  `success`, the method accents, hover and active variants). `websiteColorTheme` and
  `crmColorTheme` are `createTheme` results carrying that palette; `UiColorTheme` is the website
  one. The two are the same palette today, kept as separate names so the products can diverge.
- `websiteBreakpointValues` (`xs` 375, `sm` 640, `md` 768, `lg` 1024, `xl` 1440) and
  `crmBreakpointValues` (`xs` 320, `sm` 480, then the same); `websiteBreakpointsTheme` and
  `crmBreakpointsTheme` are the matching MUI themes, and `UiBreakpoints` is the website one.
- `heightBreakpoints` — the `compact` (550) and `medium` (700) viewport-height thresholds.

Compose them into the application's own theme:

```tsx
import { ThemeProvider, createTheme } from '@mui/material';
import { crmBreakpointValues, sharedPalette } from '@vilnacrm/ui-toolkit';

const theme = createTheme({
  breakpoints: { values: crmBreakpointValues },
  palette: sharedPalette,
});

export default function App({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
```

One caveat governs how far that theme reaches. `UiButton`, `UiInput`, `UiLink`, `UiTypography`,
`UiToolbar`, `UiTooltip`, `UiSearchInput`, `UiSelectWithSearch`, `UiMultiSelect`,
`UiCalendarMultiSelect` and the card text inside `UiCardList` mount their own theme scope, so an
application `ThemeProvider` does not restyle them: a palette or typography override from outside
is not seen by those components. Style them through `sx` and the MUI `slotProps` they forward. The
other components resolve against whatever theme surrounds them. Moving the eleven onto one
consumer-extensible provider is tracked in #72 and #83.

## Components

Every value the package root exports. Each one is also published on its own subpath, named
after the export in kebab case: `UiSelectWithSearch` is `@vilnacrm/ui-toolkit/ui-select-with-search`
and `Layout` is `@vilnacrm/ui-toolkit/layout`.

| Export                    | What it is                                                           |
| ------------------------- | -------------------------------------------------------------------- |
| `UiButton`                | Button: `contained`/`outlined`, plus `danger`/`socialButton` names   |
| `UiLink`                  | Text link; `target="_blank"` gets a new-tab cue and `rel`            |
| `UiTypography`            | Text in the design's heading and body variants                       |
| `UiImage`                 | Lazy `<img>` in a wrapper; takes a URL or a static import for `src`  |
| `UiTooltip`               | Hover/focus tooltip around any trigger                               |
| `UiInput`                 | Text field on MUI `TextField` with `describedBy` and `required` ARIA |
| `UiTextFieldForm`         | `UiInput` bound to a `react-hook-form` `control` via `Controller`    |
| `UiForm`                  | Form shell with a contained rejected-submit contract                 |
| `UiCheckbox`              | Checkbox with label, helper text and error state                     |
| `UiRadioGroup`            | Radio group over `UiRadioOption` items                               |
| `UiSearchInput`           | Free-text typeahead with ghost completion                            |
| `UiSelectWithSearch`      | Single-select combobox with a search box                             |
| `UiMultiSelect`           | Multi-select combobox rendering chips                                |
| `UiCalendarMultiSelect`   | Calendar grid for picking a date range                               |
| `UiFileUploadInput`       | File picker with constraints and an upload status                    |
| `UiPinInput`              | One-time-code field of discrete digit cells                          |
| `UiSegmentedControl`      | Single-choice segmented track                                        |
| `UiPagination`            | Page navigation, controlled through `page`                           |
| `UiCopyField`             | Read-only value with a copy-to-clipboard action                      |
| `UiFilterChip`            | Removable filter chip                                                |
| `UiStatusBadge`           | Status pill, static or toggleable                                    |
| `UiNotificationBadge`     | Icon button carrying an unread count                                 |
| `UiAddButton`             | Icon button for an add action                                        |
| `UiChevronButton`         | Icon button for expand and collapse                                  |
| `UiClearButton`           | Icon button that clears a field                                      |
| `UiSocialIconButton`      | Round social-network chip, link or button                            |
| `UiActionIconBar`         | Row of icon actions with toggle and menu states                      |
| `UiBackgroundPicker`      | Popover picker over grouped image and colour options                 |
| `UiOptionCard`            | Selectable card with a label and a value box                         |
| `UiIntegrationCard`       | Selectable integration card in an ARIA radio group                   |
| `UiPaymentOptionCard`     | Selectable payment provider card in an ARIA radio group              |
| `UiProfileSelectCard`     | Profile trigger opening a menu of profiles                           |
| `UiTaskCard`              | Board task card with an assignee                                     |
| `UiItemRow`               | Expandable API-method row (`get`, `put`, `post`, `delete`, `patch`)  |
| `UiItemsList`             | List container for `UiItemRow` items                                 |
| `UiCardList`              | Responsive card list: grid on wide screens, swiper on narrow ones    |
| `UiFooter`                | Site footer with social links and policy links                       |
| `UiToolbar`               | Themed MUI toolbar                                                   |
| `UiContainer`             | Page-width content container                                         |
| `Layout`                  | Page frame: header, footer, document title and meta description      |
| `UiBackToMain`            | Back link to the main page                                           |
| `UiErrorBoundary`         | Error boundary with a default fallback and reset paths               |
| `AuthSkeleton`            | Loading placeholder for the sign-in screen                           |
| `UiSkeletonBlock`         | Rectangular shimmer block                                            |
| `UiSkeletonText`          | Text-line shimmer                                                    |
| `UiSkeletonButton`        | Button-shaped shimmer                                                |
| `UiSkeletonInput`         | Input-shaped shimmer                                                 |
| `UiSkeletonImage`         | Avatar or image shimmer                                              |
| `UiSkeletonControlText`   | Control-plus-label shimmer (checkbox or radio)                       |
| `UiSkeletonList`          | Stacked row shimmer                                                  |
| `UiSkeletonMenu`          | Menu shimmer                                                         |
| `UiSkeletonTabBar`        | Tab bar shimmer                                                      |
| `UiSkeletonTable`         | Table shimmer with column tracks                                     |
| `UiSkeletonWidget`        | Dashboard widget shimmer (task list, block or chart)                 |
| `sharedPalette`           | Colour tokens in MUI palette shape ([Theming](#theming))             |
| `websiteColorTheme`       | Theme carrying `sharedPalette`; `UiColorTheme` is this one           |
| `crmColorTheme`           | The CRM colour theme, the same palette today                         |
| `UiColorTheme`            | Default export of `ui-color-theme`: `websiteColorTheme`              |
| `websiteBreakpointValues` | `xs` 375, `sm` 640, `md` 768, `lg` 1024, `xl` 1440                   |
| `crmBreakpointValues`     | `xs` 320, `sm` 480, `md` 768, `lg` 1024, `xl` 1440                   |
| `websiteBreakpointsTheme` | Theme over `websiteBreakpointValues`; `UiBreakpoints` is this one    |
| `crmBreakpointsTheme`     | Theme over `crmBreakpointValues`                                     |
| `UiBreakpoints`           | Default export of `ui-breakpoints`: `websiteBreakpointsTheme`        |
| `heightBreakpoints`       | `compact` 550 and `medium` 700 viewport-height thresholds            |

Each component's prop types are exported alongside it (`UiButtonProps`, `UiInputProps`, …).
`tests/bats/consumer_docs_contract.bats` fails when a root export is missing from this table.

## Error handling

A React render error is not recoverable in place: React unmounts the tree from the root, so one
bad prop deep inside a widget blanks the whole page. `UiErrorBoundary` exists to bound that blast
radius. Wrap the regions that can fail, and a failure costs one region instead of the document.

### Wrapping a region

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

## Localization

`UiFooter`, `UiCardList` and the default `UiErrorBoundary` fallback translate themselves through
the i18next instance the application initialises; the toolkit never initialises one, which is why
`i18next` and `react-i18next` are peer dependencies. Every other component takes already-translated
strings through its props.

The keys those components read live in `i18n/localization.json`, hand-maintained under the
`translation` namespace for `en` and `uk`. The file is the source of truth: Storybook and the Jest
setup load it, and there is no generator behind it. It is not part of the release tarball yet, so
an application copies the keys it needs into its own resources — shipping them is tracked in #75.

Two gates keep the file honest:

- `make test-unit` fails when a locale's key set drifts from `en`, or when a string is blank;
- `make lint-i18n-keys` fails when a literal `t('…')` or `i18nKey` in `src/` names a key `en`
  does not translate. A key held in a variable is not checked, and a call that passes
  `defaultValue` is exempt because the fallback is explicit.

To add a key, add it to every locale in the same change. To add a locale, add a top-level entry
carrying the full `en` key set. No string is count-based today; when the first one lands, use
i18next's `_one` / `_other` plural suffixes rather than branching in the component. Right-to-left
layouts are not supported: the component themes carry no `direction` and expose no injection point
for one, which is part of the theming contract tracked in #72 and #83.

## Development warnings

The prop types are strict, but runtime data is not, so every component that degrades gracefully
on invalid input says so through one channel: `console.warn`, prefixed `[ui-toolkit]`, then the
component name, what it received and what it renders instead. Filter the console on the prefix to
see only the toolkit's own guidance. Nothing is thrown and no rendered output changes.

The warnings exist in development only. The shared `devWarn` helper returns before logging when
`NODE_ENV` is `production`, so the production bundle emits no toolkit warning at all, and each
message is keyed to the state that caused it: it logs once on mount and again only when that state
changes, never on an ordinary re-render.

What is warned about:

- a required prop arriving nullish or blank (`cardList`, `src`, `label`, `name`, `value`, …); the
  component renders its empty or static form;
- a control with no accessible name, or an `error` state with no `helperText` to explain it
  (`UiInput`, `UiPinInput`, `UiCalendarMultiSelect`, `UiFileUploadInput`, `UiSegmentedControl`
  and the searchable fields);
- a stateful prop without the handler that would make it interactive (`selected` without
  `onSelect`, `open` without `onOpenChange`, `pressed` without `onToggle`, `value` without
  `onChange`); the control renders as static content;
- a value outside its prop's domain (`count`, `max`, `length`, a `value` matching no option,
  duplicate ids); the value is normalised;
- a `UiCardList` mixing `smallCard` and `largeCard`, or a card whose title, text or `alt` looks
  like an i18n key that the i18next instance cannot translate;
- a caught error with no `onError` (`UiErrorBoundary`), and a rejected submit with no
  `onSubmitError` (`UiForm`) — both documented under [Error handling](#error-handling).

## Module format and support matrix

The package is ESM-only, and that is a decision rather than an omission. Every entry point is
published under an `import` condition as an `.mjs` module with `.d.mts` declarations; there is no
`require` condition and no CommonJS build. React 19 and MUI 9 are ESM-first themselves, the
per-component entry split depends on ESM code splitting, and a second module format would double
the artifact for consumers that all bundle with ESM-capable tools. `main` and `module` point at the
same `.mjs` for resolvers that ignore `exports`. Use `import`: the `exports` map carries no
`require` condition, so CommonJS `require()` of the package is not supported.

| Surface           | Supported                                                            |
| ----------------- | -------------------------------------------------------------------- |
| Module format     | ESM only: `import` condition, `.mjs` runtime, `.d.mts` declarations  |
| Browsers          | ES2020 runtimes — Chrome 80, Edge 80, Firefox 74, Safari 13.1, later |
| Node (SSR, tests) | `^20.19.0`, `^22.13.0`, `>=24`                                       |
| React             | `react`, `react-dom` `^19.0.0`                                       |
| MUI               | `@mui/material`, `@mui/system` `^9.0.0`                              |
| Emotion           | `@emotion/react`, `@emotion/styled` `^11.0.0`                        |
| Forms             | `react-hook-form` `^7.0.0`                                           |
| i18n              | `i18next` `>=23.0.0 <27.0.0`, `react-i18next` `>=14.0.0 <18.0.0`     |
| TypeScript        | 5.0 and later, `moduleResolution` `bundler` or `node16`              |
| Bundler           | Any that honours `exports` and `sideEffects` (only `**/*.css`)       |

The bundle is compiled to `es2020` and ships no polyfills, so the browser floor is whichever
release of each engine first ran ES2020 syntax. The peer rows are the `peerDependencies` of
`package.json`, verbatim.

Three gates keep the matrix true. `make lint-peer-ranges` fails when a `devDependencies` mirror of
a peer starts outside the peer range, or when the installed version does — so a dependency bump
cannot leave the declared range behind. `make build` runs `publint` in strict mode against the
manifest and the emitted files, so an `exports` entry that points at nothing, or a declaration
that TypeScript would read as CommonJS, fails the build. `tests/unit/export-contract-integrity.test.ts`
pins the `exports` map itself.

Jest consumers: Jest does not transform `node_modules` by default, so either run under Jest's ESM
support, or exempt the package with
`transformIgnorePatterns: ['/node_modules/(?!@vilnacrm/ui-toolkit/)']` and map
`@vilnacrm/ui-toolkit/styles.css` to a style stub through `moduleNameMapper`.

## Versioning and stability

Releases follow [SemVer 2.0.0](https://semver.org/spec/v2.0.0.html). The version is computed
from the Conventional Commits headers the commit gate enforces: `fix` lands a patch, `feat` a
minor, and a `!` after the scope or a `BREAKING CHANGE` footer a major. The same release run
writes [CHANGELOG.md](CHANGELOG.md), one section per version with the commits behind it; the
change between the newest tag and `main` is `git log v<newest>..main`, and there is no
hand-written "unreleased" section to keep in step.

While the version is `0.x`, a minor release may change the public API — the changelog names each
such change under a breaking-changes heading — and a patch never does. From `1.0.0` a breaking
change is a major release.

The public API is:

- every name the package root exports (`src/components/index.ts`, published as
  `@vilnacrm/ui-toolkit`), and the same names through their `@vilnacrm/ui-toolkit/<component>`
  subpath;
- `@vilnacrm/ui-toolkit/styles.css` and `@vilnacrm/ui-toolkit/package.json`;
- for each exported component: its props and their defaults, the roles and accessible names it
  renders, and the callbacks it emits.

Everything else is internal and may change in any release: modules under `chunks/`, the theme
objects, and any name a subpath module carries without declaring it — `ui-card-list.mjs` re-exports
its card styles so `ui-card-item` can reach them within the dependency rules, but the `.d.mts`
does not name them, which is what keeps them out of the contract. That boundary is enforced by
`tests/unit/export-contract-integrity.test.ts` and the API Extractor rollup (#33); the
release-readiness governance report (#34) is where the gates are consolidated.

Deprecation: a public name or prop is marked `@deprecated` in its JSDoc with the replacement
named, emits a `[ui-toolkit]` development warning when used, and stays for at least one minor
release before the next breaking release removes it.

Peer dependency ranges: widening a range is a minor change; narrowing one — dropping a major a
consumer may be on — is a breaking change. `make lint-peer-ranges` keeps the declared ranges
honest against what the suite runs, and a narrowed range is a reviewed `package.json` diff.

Version monotonicity: `package.json` must be at least as high as the highest `v*` tag, so the next
computed release always lands above every existing tag. `make lint-release-version` runs that check
on every pull request from the commit convention workflow, and the release workflow runs it again
before it computes the next tag.

## Releases

The library is not published to the public npm registry. Pushing to `main` runs the release
workflow, which bumps the version, tags it, and attaches the packed
`vilnacrm-ui-toolkit-<version>.tgz` to the GitHub release; `crm` and `website` depend on that
asset URL directly. Reproduce the artifact locally with:

```bash
make start-bun
make package
```

The tarball lands in `dist/`, and the recipe fails if it does not carry the entry points that
`package.json` promises. [CONSUMING.md](CONSUMING.md) is the consumer-side brief: how `crm` and
`website` pin a release, verify it, and move to a later one.

### Bundle footprint

Every build (`make build`, `make package`, the release) fails when the emitted bundle breaks
`config/bundle-budget.json`:

- `entryBytes` caps the JavaScript a consumer loads by importing one subpath
  (`@vilnacrm/ui-toolkit/<component>`): the entry file plus every chunk it imports, transitively.
  `default` applies to every component; `index` is the whole barrel; heavier components carry
  their own line.
- `composition` is the exact list of other published components each entry may reach, and
  `sharedEntries` are the token modules any entry may reach. A component that starts pulling in
  another one fails the build until the edge is declared here.
- `isolatedPackages` confines a runtime dependency to the entries allowed to load it, so
  importing a button can never retain the carousel runtime.
- `cssBytes` caps `styles.css` and `buildBytes` caps everything `build/` ships — today mostly
  the nine bundled TTF faces and the source maps, which stay in the artifact on purpose: the
  fonts are the design's, and the maps are what makes a consumer's stack trace readable.

The build prints each entry's footprint next to its budget. Raise a number only for a change that
is meant to grow the artifact, in the same pull request, and say why in its description.

## Observability

The toolkit ships **zero runtime telemetry by design**: no analytics, no error reporting, no
session replay, and no web-vitals collection. Components render and emit callbacks; nothing in
this package phones home.

Error reporting and performance monitoring are the consuming application's responsibility. The
integration seam today is composition — wrap toolkit components in your own React error boundary
and report from its handler. A toolkit-owned `UiErrorBoundary` is tracked in issue #71.

The `make lint-unused-deps` gate keeps the stance honest: it fails on any declared package that
nothing in the source tree references, so telemetry dependencies (such as the removed `@sentry/*`
and `web-vitals`) cannot sit unused in `package.json` waiting to be wired up.

## Security

Report vulnerabilities through the private reporting guidance in [SECURITY.md](SECURITY.md), which
also documents the supported-version window and the response targets.

Supply-chain posture is measured in CI: the `sbom` workflow publishes a CycloneDX SBOM for the npm
package and for each CI image, the `OSSF Scorecard` workflow publishes the repository score
behind the badge above, `make lint-secrets` fails a pull request that commits a credential, and
`make lint-vulns` plus the `scan-image-*` targets fail one that ships a fixable HIGH/CRITICAL
advisory in the production dependency closure or in a CI image's OS packages. See
[Supply-chain pinning and inventory](CONTRIBUTING.md#supply-chain-pinning-and-inventory).

## Development

### Stack

- React 19
- MUI 9
- Storybook 10
- TypeScript 6
- Jest for unit tests
- Playwright for browser and visual checks

### Setup

Install dependencies:

```bash
bun install
```

Every environment variable has a fallback, so no `.env` is needed to build or test. To override
one, copy the template and edit the copy — `.env` is gitignored and the `secret scanning`
workflow fails a pull request that commits a credential:

```bash
cp .env.example .env
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
| `make test-storybook`   | Storybook interaction (play function) tests in a browser       |
| `make test-mutation`    | Stryker mutation-strength gate                                 |
| `make test-bats`        | Bats coverage of Makefile shell flows and their contracts      |

The `lint-metrics` target runs a `rust-code-analysis` complexity gate over `src/`. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the policy details and remediation guidance.

`make lint` also runs `make lint-ci-paths`, which fails when the `Makefile` or a workflow names a
repository path that does not exist — the class of drift that once left the memory-leak gate green
while it executed nothing. See
[CI gate integrity](CONTRIBUTING.md#ci-gate-integrity-fail-closed) in `CONTRIBUTING.md`.

### Bats shell coverage

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

### Storybook interaction tests

Every interactive component ships a story whose `play` function drives it in a real
browser, so the demonstration surface is also a behavioural gate:

```bash
make test-storybook
```

The run fails closed — it exits non-zero when no interaction story is discovered, when
the live Storybook index and `tests/storybook/interaction-stories.json` disagree, or when
any registered play test does not pass. See
[tests/storybook/README.md](tests/storybook/README.md).

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

### Project layout

- `src/components`: exported UI components, themes, and stories
- `src/index.ts`: library entrypoint
- `.storybook`: Storybook configuration
- `tests`: automated test coverage
- `scripts`: repository helper scripts used by build/test workflows

### Notes

- This repository is a React UI library, not a Next.js app.
- Source code lives under `src`; there is no `pages` app surface.
- `make lint-next` runs ESLint. The name predates the library split — it is not
  Next.js-specific — and is kept only to avoid renaming churn across CI and tooling.

### Contributing

Contribution workflow details live in [CONTRIBUTING.md](CONTRIBUTING.md).
