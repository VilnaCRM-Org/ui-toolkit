# ui-toolkit

[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/VilnaCRM-Org/ui-toolkit/badge)](https://scorecard.dev/viewer/?uri=github.com/VilnaCRM-Org/ui-toolkit)

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

`make lint` also runs `make lint-ci-paths`, which fails when the `Makefile` or a workflow names a
repository path that does not exist — the class of drift that once left the memory-leak gate green
while it executed nothing. See
[CI gate integrity](CONTRIBUTING.md#ci-gate-integrity-fail-closed) in `CONTRIBUTING.md`.

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

Report vulnerabilities through the private reporting guidance in [SECURITY.md](SECURITY.md), which
also documents the supported-version window and the response targets.

Supply-chain posture is measured in CI: the `sbom` workflow publishes a CycloneDX SBOM for the npm
package and for each CI image, and the `OSSF Scorecard` workflow publishes the repository score
behind the badge above.

## Contributing

Contribution workflow details live in [CONTRIBUTING.md](CONTRIBUTING.md).
