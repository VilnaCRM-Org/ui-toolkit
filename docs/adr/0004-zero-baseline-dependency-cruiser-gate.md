# 0004 — Zero-baseline dependency-cruiser gate

- Status: accepted (backfilled)
- Date: 2026-09-20

## Context and problem statement

ESLint's `import` plugin orders imports and rejects extraneous packages, but it does not gate
cycles, orphans, barrel discipline or type-only boundaries in `src/`. Those are the properties a
component library's consumers depend on: a subpath import must not drag in another component's
internals, and a type module must not carry runtime code.

## Considered options

- Enable `import/no-cycle` in ESLint and leave the other properties to review.
- Adopt dependency-cruiser with a `depcruise-baseline` that grandfathers the existing violations.
- Adopt dependency-cruiser with no baseline: every rule at `error` severity, every violation
  fixed in code.

## Decision outcome

dependency-cruiser with no baseline file. `.dependency-cruiser.js` enforces `no-circular`,
`no-orphans`, `components-public-api` (a component is reached only through its barrel at runtime),
`src-not-to-tests`, `no-prod-import-of-stories`, `not-to-dev-dep` and the type-only rules;
`make lint-deps` runs it locally and the `dependency-cruiser` workflow on every pull request.

## Consequences

- Every violation is visible on every run; a suppression file cannot accumulate debt.
- Shared internals move to an explicitly exported barrel or to `src/utils/` rather than being
  reached across component directories, which is also what keeps subpath bundles small.
- Adding a rule means fixing the tree in the same change, which is deliberate: the gate's value
  is that its output is always empty.
