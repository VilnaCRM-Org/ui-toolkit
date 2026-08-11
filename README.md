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
every push. The Makefile is the single source of truth for the gate set — each pull-request
workflow is a thin wrapper around the same targets, and `tests/bats/aggregate_gate_targets.bats`
fails if a workflow ever runs a gate `make verify` cannot reach.

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
| `make test-mutation`    | Stryker mutation-strength gate                                 |
| `make test-bats`        | Bats coverage of Makefile shell flows and their contracts      |

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
