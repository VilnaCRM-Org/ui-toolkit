# 0003 — Sharded mutation testing with a fail-closed merge

- Status: accepted (backfilled)
- Date: 2026-09-20

## Context and problem statement

A 100% line-coverage threshold says a test executed each line, not that it would notice a
change. Stryker mutation testing closes that gap, but a single-process run over the component
tree took close to two hours, which pushed contributors toward skipping it.

## Considered options

- Run mutation testing nightly or on demand only.
- Lower the break threshold so a partial run is "good enough".
- Shard the run across a matrix and re-enforce the unchanged threshold over the merged result.

## Decision outcome

Shard. `mutation-testing.yml` fans `make test-mutation-shard` across a 16-way matrix bin-packed
by file weight (`scripts/ci/mutation-scope.mjs` is the single source of the mutated file set), each
shard uploads its JSON report, and a final `merge and enforce gate` job runs
`make merge-mutation-reports`, which unions the reports and applies the `break` threshold from
`stryker.config.mjs` (`break: 100`) exactly as an unsharded run would. A missing or failed shard
fails the merge; the job runs `if: ${{ !cancelled() }}` so a skipped shard can never read as a
pass. Each mutant's Jest run is scoped to its related suites (`enableFindRelatedTests: true`), and
the TypeScript checker drops type-invalid mutants from the denominator.

## Consequences

- The gate runs on every pull request in roughly a quarter of an hour instead of two.
- Unit tests must deep-import the component under test, never the public barrel: a barrel
  import makes a test "related" to every module and defeats the scoping. The two structural
  guards that must import the barrel are excluded from the mutation tier.
- Changing the shard count is a Makefile/workflow edit; the threshold is never touched to get a
  run green.
