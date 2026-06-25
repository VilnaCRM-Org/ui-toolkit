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

Run the common workflows through `make`:

```bash
make build
make lint
make lint-next
make lint-tsc
make storybook-start
make storybook-build
make test-unit
make test-e2e
make test-visual
make lighthouse-desktop
make lighthouse-mobile
make lint-metrics
```

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
make lint-dep-cruiser
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

## Security

Report vulnerabilities through the private reporting guidance in [SECURITY.md](SECURITY.md).

## Contributing

Contribution workflow details live in [CONTRIBUTING.md](CONTRIBUTING.md).
