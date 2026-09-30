# Agent brief: consume the ui-toolkit release tarball

Instructions for an agent wiring `@vilnacrm/ui-toolkit` into the `crm` or `website` repository.
Work in the consumer repository, not in `ui-toolkit`.

## What is published

`@vilnacrm/ui-toolkit` is not on the public npm registry. Every push to `main` runs
`.github/workflows/autorelease.yml`, which derives the next version from the conventional-commit
history, tags it, packs the library with `npm pack`, and attaches
`vilnacrm-ui-toolkit-<version>.tgz` to the GitHub release. That tarball is byte-for-byte what
`npm publish` would have uploaded — same entry points, same `exports` map, same peer ranges.

`VilnaCRM-Org/ui-toolkit` is public, so the asset downloads without a token, an `.npmrc` entry, or
a CI secret.

The package is ESM-only and exposes four kinds of entry point:

- `@vilnacrm/ui-toolkit` — every component, theme, and token, with bundled type declarations.
- `@vilnacrm/ui-toolkit/<component>` — one component on its own, e.g.
  `@vilnacrm/ui-toolkit/ui-button`. The subpath is the component's directory name, and it exports
  the component as `default` plus its prop types as named type exports.
- `@vilnacrm/ui-toolkit/styles.css` — the stylesheet, carrying the Swiper carousel CSS and the
  Inter and Golos font faces (WOFF2, `font-display: swap`).
- `@vilnacrm/ui-toolkit/locales` — the `en` and `uk` translation `resources` and the `initI18n`
  helper that loads them into i18next (see the README's Localization section).

Swiper is bundled into both entry points rather than declared as a peer, so the consumer does not
install it for the toolkit's sake.

## Peer dependencies the consumer must already provide

| Peer                                | Range              |
| ----------------------------------- | ------------------ |
| `react`, `react-dom`                | `^19.0.0`          |
| `@mui/material`, `@mui/system`      | `^9.0.0`           |
| `@emotion/react`, `@emotion/styled` | `^11.0.0`          |
| `react-hook-form`                   | `^7.0.0`           |
| `i18next`                           | `>=23.0.0 <27.0.0` |
| `react-i18next`                     | `>=14.0.0 <18.0.0` |

`website` already satisfies all of these. `crm` is on React 18.3 and MUI 7, so its install will
report peer mismatches until its React 19 / MUI 9 upgrade lands. If you are working in `crm` and
that upgrade has not happened, stop and report the mismatch instead of forcing the install — the
components use MUI 9 APIs and will fail at runtime under MUI 7.

## Wiring the dependency

Resolve the tarball URL of the newest release:

```bash
gh release view --repo VilnaCRM-Org/ui-toolkit \
  --json tagName,assets --jq '.assets[] | select(.name | endswith(".tgz")) | .url'
```

Add it in the consumer repository, taking the version from that same release:

```bash
VERSION=$(gh release view --repo VilnaCRM-Org/ui-toolkit \
  --json tagName --jq '.tagName | ltrimstr("v")')
BASE=https://github.com/VilnaCRM-Org/ui-toolkit/releases/download
bun add "$BASE/v$VERSION/vilnacrm-ui-toolkit-$VERSION.tgz"
```

Set `VERSION` by hand instead to pin an older release.

That writes the full URL into `dependencies` and `bun.lock`. Commit both files together.

`bun.lock` stores no integrity hash for a tarball URL, so the lockfile alone does not make the pin
tamper-evident. Releases are immutable, and the releases API reports a server-computed `digest`
for every asset. `release provenance` re-packs each release from its tag, attests the tarball and
fails when the published asset's digest differs. Verify in the consumer's CI:

```bash
curl -fsSLO "$BASE/v$VERSION/vilnacrm-ui-toolkit-$VERSION.tgz"
gh api "repos/VilnaCRM-Org/ui-toolkit/releases/tags/v$VERSION" \
  --jq ".assets[] | select(.name == \"vilnacrm-ui-toolkit-$VERSION.tgz\") | .digest"
gh attestation verify "vilnacrm-ui-toolkit-$VERSION.tgz" --repo VilnaCRM-Org/ui-toolkit
EXPECTED_SHA256='<digest committed in the consumer repository>'
printf '%s  %s\n' "$EXPECTED_SHA256" "vilnacrm-ui-toolkit-$VERSION.tgz" | sha256sum -c -
```

Releases after v0.6.0 also carry `vilnacrm-ui-toolkit-<version>.tgz.sha256`, attached in the same
call that creates the release; `sha256sum -c` against it works the same way. Earlier releases have
no `.sha256` asset.

The `digest` field and the `.sha256` sidecar only prove the tarball matches what the release
publishes. The last `sha256sum -c` compares against `EXPECTED_SHA256`, a digest recorded once in
the consumer repository (commit it next to the pinned `VERSION`) and never re-derived from the
release itself; that is the check that actually proves the asset matches what the consumer pinned.

Import the stylesheet exactly once, in the application's root entry, before any toolkit component
renders:

```ts
import '@vilnacrm/ui-toolkit/styles.css';
```

Then import components. Prefer the per-component subpath:

```tsx
import UiButton from '@vilnacrm/ui-toolkit/ui-button';
import type { UiButtonProps } from '@vilnacrm/ui-toolkit/ui-button';
```

The barrel still works and stays supported:

```tsx
import { UiButton, UiSearchInput } from '@vilnacrm/ui-toolkit';
```

### Why the subpath is worth preferring

Thirteen modules in the library build a MUI theme at module scope. A bundler cannot prove a
`createTheme(...)` call pure, so while the library shipped as ONE bundled file those calls were
top-level statements every importer had to retain — pulling a single component dragged every theme
in the kit with it. Measured on a consumer bundling one component with everything else external:
**240.9 KB before, 4.3 KB after.**

The library is now built as one entry per component with shared code hoisted into chunks, which is
what makes that possible. The barrel benefits too — it re-exports across chunk boundaries instead
of inlining — but the subpath is the explicit, guaranteed form, and it is what the prop types
resolve through.

## Checking the wiring holds

Run, in the consumer repository:

```bash
bun install --frozen-lockfile
make lint-tsc
make test-unit
```

A clean `--frozen-lockfile` install proves the URL resolves; the checksum step above proves the
asset is the one that was pinned. The type-check proves the bundled declarations resolve. If the
repository names these targets differently, use its own type-check and unit-test targets.

## Moving to a later release

Re-run the commands under [Wiring the dependency](#wiring-the-dependency); `VERSION` picks up
whatever release is newest, and `bun add` rewrites both `package.json` and `bun.lock`. Because the
URL pins an immutable release asset there are no semver ranges: every upgrade is an explicit,
reviewable diff, and nothing moves under the consumer without a commit.

## Failure modes worth knowing

- Do not install the git tag (`bun add github:VilnaCRM-Org/ui-toolkit#v0.1.0`). The tag carries
  source only — `build/` is gitignored and there is no `prepare` script — so the install yields
  a package whose every entry point resolves to a missing file.
- Container and CI installs need network access to `objects.githubusercontent.com`, which is where
  release-asset downloads redirect. An allowlisted egress proxy has to permit it.
- Never re-cut a release with an existing version number. Its digest is pinned in every consumer,
  so a replaced asset turns into a checksum failure across both repos. Publish a new version
  instead.
- The package is ESM-only. `require('@vilnacrm/ui-toolkit')` will not work; use `import`. Every
  JavaScript entry point also carries a `default` condition, so a CommonJS-mode Jest resolves the
  root and every JS subpath without a `moduleNameMapper` entry; it still has to transform the
  package (see the README's Jest note). `./styles.css` is the exception: it is exported as a
  direct file target with no `default` condition, so it still needs its own `moduleNameMapper`
  entry mapping it to a style stub, same as any other stylesheet import.

## CRM-specific opt-ins

The defaults are the website's behaviour. CRM opts into its own with props:

- `UiButton` `loadingMode="native"`: natively disabled grey loader, `loadingIndicator` honoured,
  no status region.
- `UiForm` `titleComponent="h1"`: the title is the page heading.
- `UiForm` `offlineNotice={{ offline, restored }}`: an offline status notice after the title; the
  submit is disabled and described by it while offline.
- `UiForm` `submitLoadingMode="native"`: the submit button's `loadingMode`.
- `UiFooter` `variant="crm"`: the logo plus same-tab privacy and usage-policy links.
- `AuthSkeleton` `idPrefix=""`: bare `auth-skeleton-*` ids.
- `UiTypography` `inheritTheme`: variants from the app's own MUI theme, so the kit theme need not
  sit at the root.
- `UiButton` `focusOutline`: CRM's `:focus-visible` ring, a 2px `#404142` outline offset by 2px.
- `UiForm` `submitFocusOutline`: the submit button's `focusOutline`.
- `UiForm` `inheritTheme`: the title, subtitle and error banner take the app theme's typography.
- `UiLink` `tone="accessible"`: CRM's `#0074B5` ink (5.04:1 on white), `#00588A` on hover.
  `underline="hover"` or `"none"` drops the forced underline. Other MUI `Link` props (`id`,
  `aria-*`, `onClick`) are forwarded.
- `createUiTheme({ variant: 'crm' })` / `<UiThemeProvider variant="crm">`: CRM breakpoints
  (`sm` 480) and the CRM palette (`crmPalette`: success `#4CAF50`, warning `#FF9800`, info
  `#2196F3`). The container, footer, back-to-main, form and skeleton breakpoints resolve from
  it at render time.
- `<UiThemeProvider scope="tokens" variant="crm">`: kit components under an app theme that is not
  a UI theme resolve the CRM tokens, while plain MUI components keep the app theme. Without the
  scope they fall back to the website tokens.
- `UiButton` `appearance="theme"`: no kit variant, font or busy `sx`, so the app theme's
  `MuiButton` overrides style it; link handling, the busy guard and `focusOutline` still apply.
- `UiButton` `loadingMode="native"` hands `loading` and `loadingIndicator` to MUI while busy
  (`.MuiButton-loading` and MUI's indicator markup) and starts no announcement timer.
- `UiButton` `kitInk`: a contained label takes the kit white instead of the app theme's
  `primary.contrastText`. `responsiveLabel={false}` drops the contained-medium `sm` label rule.
- `UiForm` `submitKitInk` (the submit's `kitInk`, with no hover or active shadow),
  `submitResponsiveLabel={false}` and `submitLoadingIndicator`. In `submitLoadingMode="native"`
  the form renders one sr-only `role="status"` carrying `submittingLabel` while submitting;
  `submittingAnnouncement` drives it on its own.
- `UiLink` `tone="inherit"`: no rest, hover or active colour, so the app theme and your `sx`
  decide it. `responsiveSize={false}` drops the 1130px and `sm` font-size rules.
- `UiInput` / `UiTextFieldForm` `density="crm"`: CRM field geometry (border-box, 79px from `md`,
  64px max from `xl`), CRM placeholder steps, Inter 500 `#57595B` value text and a transparent
  `<input>`; the kit focus outline stays.
- `UiFooter` `variant="crm"`: `logo` replaces the logo image (`null` renders none) and
  `slotProps.link.sx` styles both links. The links keep their colour when visited, and the footer
  height is capped at `lg` and `xl`.
- `AuthSkeleton` `landmark="section"` (a named busy region), `layout="fill"` (fills and centres
  in a flex column) and `cardTone="crm"` (`#EAECEE` border, CRM shadow).
- Theme subpaths keep the website theme as their `default` export. Import the named
  `crmBreakpointsTheme` and `crmColorTheme` instead.
- `styles.css` declares one `Golos` family (WOFF2, `font-display: swap`). Point
  `--ui-toolkit-font-golos` at your own face to use it instead.
