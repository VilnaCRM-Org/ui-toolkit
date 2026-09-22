# 0001 — Bun as package manager and script runtime

- Status: accepted (backfilled)
- Date: 2026-09-20

## Context and problem statement

The toolkit needs one package manager for a lockfile CI can enforce, and one runtime for the
TypeScript scripts under `scripts/ci/` that the gates execute. The sibling `crm` and `website`
applications, which consume the toolkit, already run on Bun.

## Considered options

- npm or pnpm with Node, and a separate step (`tsx`, `ts-node`) to run TypeScript scripts.
- Bun for installs and for running TypeScript directly, with Node kept only where a tool needs it.

## Decision outcome

Bun. `package.json` pins `packageManager` to `bun@1.3.5`, `bun.lock` is the only lockfile, the CI
image is `oven/bun` (digest-pinned in the `Dockerfile`), and every Makefile target invokes
`bun x <tool>` or `bun <script>.ts`. `make install` and the container build run
`bun install --frozen-lockfile`, so a drifted lockfile fails instead of being rewritten.

## Consequences

- One tool installs, runs the linters and executes the gate scripts without a transpile step.
- Jest still runs under Node inside the same image (`node ./node_modules/jest/bin/jest.js`):
  Bun's test runner is not Jest, and the suites depend on Jest's module registry and transform
  pipeline. Node stays a declared engine (`^20.19.0 || ^22.13.0 || >=24`) for that reason.
- Tooling that expects `package-lock.json` (some scanners, some Dependabot flows) is configured
  against `bun.lock` explicitly, or its findings are treated as advisory.
