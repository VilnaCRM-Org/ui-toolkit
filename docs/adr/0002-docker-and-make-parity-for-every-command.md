# 0002 — Docker and Make parity for every command

- Status: accepted (backfilled)
- Date: 2026-09-20

## Context and problem statement

Gates that pass on a developer machine and fail in CI — or the reverse — waste every reviewer's
time and erode trust in the gate. Several suites (Playwright visual baselines, Lighthouse,
memlab, rust-code-analysis) are sensitive to the exact browser, font and tool versions they run
under.

## Considered options

- Run everything on the host and document the required tool versions.
- Run the suites in CI only and accept that local reproduction differs.
- Run every command through a Makefile target that executes inside a digest-pinned Docker
  service, locally and in CI alike.

## Decision outcome

Every command is a Makefile target executed inside a Docker Compose service (`bun`,
`storybook`, `playwright`, `rca`) built from a digest-pinned image, and the GitHub Actions
workflows call the same targets. `make ci` and `make verify` replay the merge bar locally;
`tests/bats/aggregate_gate_targets.bats` holds the workflow gate list and the `verify`
dependency graph together.

## Consequences

- A gate result is reproducible: the same image, fonts and browsers on every machine.
- The `bun` service is a baked image, not a bind mount, so outputs are extracted with
  `copy-*` targets (`copy-coverage`, `copy-storybook-static`, `copy-lighthouse-reports`) and a
  new root-level file must be added to the `Dockerfile` `COPY` list or the container never sees
  it.
- Fast static checks (`tsc`, ESLint, Prettier, markdownlint, `scripts/ci/*`) may also run on the
  host; the suites may not, because they depend on the pinned images.
