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

Every pull request must pass the gating targets below; run the ones your change touches
locally before pushing. See [agents.md](agents.md) for which test layer a given change needs.

| Target                  | What it gates                                                |
| ----------------------- | ------------------------------------------------------------ |
| `make lint`             | ESLint, TypeScript, markdownlint, Prettier, dependency gates |
| `make test-unit`        | Jest unit suite (components, hooks, pure logic) in jsdom     |
| `make test-integration` | Jest composition suite: composed components, real children   |
| `make test-e2e`         | Playwright behavior against a Storybook build                |
| `make test-visual`      | Playwright visual-regression snapshots                       |
| `make test-mutation`    | Stryker mutation-strength gate                               |
| `make test-bats`        | Bats coverage of Makefile shell flows and their contracts    |

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

### Releases

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

## Notes

- This repository is a React UI library, not a Next.js app.
- Source code lives under `src`; there is no `pages` app surface.
- `make lint-next` runs ESLint. The name predates the library split — it is not
  Next.js-specific — and is kept only to avoid renaming churn across CI and tooling.

## Security

Report vulnerabilities through the private reporting guidance in [SECURITY.md](SECURITY.md).

## Contributing

Contribution workflow details live in [CONTRIBUTING.md](CONTRIBUTING.md).
