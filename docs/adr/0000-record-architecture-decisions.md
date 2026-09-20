# 0000 — Record architecture decisions

- Status: accepted
- Date: 2026-09-20

## Context and problem statement

The decisions that shape this repository — the runtime, the Docker/Make execution model, the
mutation-testing gate, the dependency-graph policy, the release channel, the telemetry stance
and the licence — lived only in commit messages, pull-request descriptions and prose in
`specs/planning-artifacts/architecture.md`. A maintainer who asks _why_ has to reconstruct the
answer from history.

## Decision outcome

Record every load-bearing decision as an architecture decision record (ADR) in this directory,
one Markdown file per decision, in the
[MADR](https://adr.github.io/madr/) shape: context and problem statement, considered options,
decision outcome, consequences.

- Files are named `NNNN-kebab-case-title.md`; `NNNN` is the next free number.
- A record is `proposed` while under review, `accepted` once merged, and `superseded by NNNN`
  when a later record replaces it. Records are never edited into a different decision; write a
  new one and link both ways.
- A pull request that changes one of the recorded decisions, or introduces a new one of the same
  weight (a runtime, a gate, a release channel, a licence, a public contract), carries the ADR in
  the same change. `make lint-md` and `make format-check` lint the records like any other
  Markdown.

The records below `0000` are backfilled from the decisions already in force on the date above.

## Consequences

- The reasoning behind a gate or a constraint is discoverable from the tree without archaeology.
- Reversing a decision costs one short document, which is the point: the cost of _not_ writing
  it down was paid every time the question came up.
