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

The package is ESM-only and exposes two entry points:

- `@vilnacrm/ui-toolkit` — the components, themes, and tokens, with bundled type declarations.
- `@vilnacrm/ui-toolkit/styles.css` — the stylesheet, carrying the Swiper carousel CSS and the
  Inter and Golos Text font faces.

## Peer dependencies the consumer must already provide

| Peer                                | Range     |
| ----------------------------------- | --------- |
| `react`, `react-dom`                | `^19.0.0` |
| `@mui/material`, `@mui/system`      | `^9.0.0`  |
| `@emotion/react`, `@emotion/styled` | `^11.0.0` |
| `react-hook-form`                   | `^7.0.0`  |
| `i18next`                           | `^23.0.0` |
| `react-i18next`                     | `^14.0.0` |

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

Add it in the consumer repository:

```bash
VERSION=0.1.0
BASE=https://github.com/VilnaCRM-Org/ui-toolkit/releases/download
bun add "$BASE/v$VERSION/vilnacrm-ui-toolkit-$VERSION.tgz"
```

That writes the full URL into `dependencies` and records the tarball's `sha512` integrity hash in
`bun.lock`. Commit both files together — the hash is what makes the pin tamper-evident.

Import the stylesheet exactly once, in the application's root entry, before any toolkit component
renders:

```ts
import '@vilnacrm/ui-toolkit/styles.css';
```

Then import components by name:

```tsx
import { UiButton, UiSearchInput } from '@vilnacrm/ui-toolkit';
```

## Checking the wiring holds

Run, in the consumer repository:

```bash
bun install --frozen-lockfile
make lint-tsc
make test-unit
```

A clean `--frozen-lockfile` install proves the committed hash matches the published asset. The
type-check proves the bundled declarations resolve. If the repository names these targets
differently, use its own type-check and unit-test targets.

## Moving to a later release

Re-run the two commands under [Wiring the dependency](#wiring-the-dependency) with the new
version; `bun add` rewrites both `package.json` and `bun.lock`. Because the URL pins an immutable
release asset there are no semver ranges: every upgrade is an explicit, reviewable diff, and
nothing moves under the consumer without a commit.

## Failure modes worth knowing

- Do not install the git tag (`bun add github:VilnaCRM-Org/ui-toolkit#v0.1.0`). The tag carries
  source only — `build/` is gitignored and there is no `prepare` script — so the install yields a
  package whose every entry point resolves to a missing file.
- Container and CI installs need network access to `objects.githubusercontent.com`, which is where
  release-asset downloads redirect. An allowlisted egress proxy has to permit it.
- Never re-cut a release with an existing version number. The old `sha512` is pinned in every
  consumer's `bun.lock`, so a replaced asset turns into a hard install failure across both repos.
  Publish a new version instead.
- The package is ESM-only. `require('@vilnacrm/ui-toolkit')` will not work; use `import`.
