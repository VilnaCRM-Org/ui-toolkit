# Story 2.2: Required status check, local/CI parity, and baseline compliance

Status: draft

## Story

As a maintainer,
I want the dependency-cruiser workflow registered as a required status check after a clean
baseline run on main,
so that pull requests to main are blocked until the same committed policy evaluated locally also
passes in CI.

## Acceptance Criteria

1. With Epic 1 and Story 2.1 complete, a maintainer runs `make lint-dep-cruiser` against the
   current `main` branch and reviews its output.
2. Any existing graph violations surfaced by that run are remediated in the same delivery slice
   before enforcement is enabled.
3. No `depcruise-baseline` file is introduced anywhere in the repository to suppress findings.
4. After `.github/workflows/dependency-cruiser.yml` has run at least once on `main`, the
   `dependency-cruiser` check appears as an available status check in the branch protection rules
   for `main`.
5. The `dependency-cruiser` check is enabled as a required status check whose name matches the
   workflow/job name exactly.
6. When a pull request targeting `main` introduces a graph violation (for example a circular
   import), the `dependency-cruiser` check fails and the pull request cannot be merged until it
   passes.
7. A failing check names the offending source file and the violated rule (for example
   `no-circular`) in its output.
8. When a contributor runs `make lint-dep-cruiser` locally and then opens a pull request with no
   violations, local and CI evaluate the same committed `.dependency-cruiser.js` and the same
   `src` scope.
9. On a clean pull request the `dependency-cruiser` check shows as passing and does not block the
   merge.

## Tasks / Subtasks

- [ ] Task 1: Run the zero-tolerance baseline-compliance check on `main` (AC: 1, 2, 3)
  - [ ] 1.1 With Epic 1 (`.dependency-cruiser.js`, `lint-dep-cruiser` target) and Story 2.1
        (`.github/workflows/dependency-cruiser.yml`) merged, run `make lint-dep-cruiser` against
        the current `main` branch inside the docker-compose `bun` service.
  - [ ] 1.2 Review the default `text` reporter output and catalogue every `error`-severity violation
        (cycles, orphans, leaked stories/dev/test imports, type-split violations). Note that any
        `not-to-dev-dep` hits on the dev+peer runtime libraries (`@mui/material`, `react`, etc.)
        indicate a rule-scoping miss in Story 1.3, NOT a source defect.
  - [ ] 1.3 Remediate each pre-existing violation in source (`src/`) within this same delivery
        slice — do not relax any `error` rule and do not weaken the governed scope. The one
        exception: if `not-to-dev-dep` fires on the library's dev+peer runtime peers, correct the
        rule scope (`npm-dev` AND not `npm-peer`) in `.dependency-cruiser.js` instead of editing
        source.
  - [ ] 1.4 Confirm NO `depcruise-baseline` file is created at the repository root or anywhere
        else; the policy stays `forbidden`-only and zero-tolerance.
  - [ ] 1.5 Re-run `make lint-dep-cruiser` and confirm a clean exit `0` with no violation output.

- [ ] Task 2: Ensure the required-check name aligns across workflow and branch protection (AC: 5)
  - [ ] 2.1 Confirm the workflow `name:` and the job key in
        `.github/workflows/dependency-cruiser.yml` are both `dependency-cruiser` (from Story 2.1).
  - [ ] 2.2 Confirm no rename diverges the check name from the value that will be registered in
        branch protection.

- [ ] Task 3: Register `dependency-cruiser` as a required status check (AC: 4, 5)
  - [ ] 3.1 Confirm the `dependency-cruiser` workflow has executed at least once on `main` (merge
        of Story 2.1 to `main` produces the run history GitHub needs to list the check).
  - [ ] 3.2 In the `main` branch protection rules, enable "Require status checks to pass before
        merging".
  - [ ] 3.3 Select `dependency-cruiser` from the list of available checks and mark it required.
  - [ ] 3.4 Optionally enable "Require branches to be up to date before merging" consistent with
        the other required testing checks (`static-testing`).

- [ ] Task 4: Validate enforcement blocks violating pull requests (AC: 6, 7)
  - [ ] 4.1 On a scratch branch, introduce a deliberate `no-circular` violation in `src/` (two
        modules importing each other) and open a pull request to `main`.
  - [ ] 4.2 Confirm the `dependency-cruiser` check fails and the merge button is blocked.
  - [ ] 4.3 Confirm the failure log names the offending file and the violated rule
        (`no-circular`).
  - [ ] 4.4 Discard the scratch branch without merging.

- [ ] Task 5: Validate local/CI parity on a clean pull request (AC: 8, 9)
  - [ ] 5.1 Run `make lint-dep-cruiser` locally on a clean branch and confirm exit `0`.
  - [ ] 5.2 Open a pull request to `main` and confirm CI runs the same `make lint-dep-cruiser`
        against the same committed `.dependency-cruiser.js` and the same `src` scope (CI must call
        the Makefile target, never a raw `bun x depcruise` line).
  - [ ] 5.3 Confirm the `dependency-cruiser` check shows passing and does not block the merge.

- [ ] Task 6: Document the required check (AC: 5, 6, 9)
  - [ ] 6.1 Note in `CONTRIBUTING.md` that `dependency-cruiser` is a required status check for
        pull requests to `main` and that a failing check blocks merge until resolved (coordinated
        with Epic 3 documentation).

- [ ] Task: Verification (AC: 1-9)
  - [ ] V.1 Confirm `make lint-dep-cruiser` exits `0` on `main` and no `depcruise-baseline` exists
        (`git ls-files | grep -i baseline` returns nothing relevant).
  - [ ] V.2 Confirm the `dependency-cruiser` check is listed and marked required in `main` branch
        protection, with a name matching the workflow/job.
  - [ ] V.3 Confirm a violating PR is blocked and a clean PR passes, evaluating the identical
        policy and scope locally and in CI.

## Dev Notes

### Architecture Decisions (from specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md)

- **Zero-tolerance baseline compliance is a prerequisite, not a scope change.** Per the Gap
  Analysis, `make lint-dep-cruiser` MUST run clean against current `main` and any pre-existing
  violations must be resolved in the same slice before the check is made required. No
  `depcruise-baseline` file may be introduced (Decision 2/6, Enforcement Guidelines).

- **Dev+peer dependency overlap is the dominant first-run consideration (Gap Analysis).** This
  published library mirrors its runtime libraries into both `devDependencies` and
  `peerDependencies` (only `swiper` is a true `dependency`). The `not-to-dev-dep` rule authored in
  Story 1.3 must therefore be scoped to truly dev-only modules (`npm-dev` AND not `npm-peer`); if
  it is not, the baseline run surfaces 100+ false dev-dep violations on `@mui/material`, `react`,
  etc. Resolve such hits by correcting the rule scope, not by editing source, before registering
  the required check.

- **Required-check name must match the workflow/job exactly.** The workflow file is
  `.github/workflows/dependency-cruiser.yml` with workflow `name: dependency-cruiser` and job key
  `dependency-cruiser` (Decision 5, Naming Patterns). Branch protection registers that exact name;
  a mismatch would make the gate non-blocking.

- **Local/CI parity through a single source of truth.** CI calls `make lint-dep-cruiser`, never a
  raw `bun x depcruise` line in YAML. Both local and CI evaluate the same committed
  `.dependency-cruiser.js` and the same governed `src` scope (Local/CI Parity Boundary, Decision
  4). The target recipe is:

  ```makefile
  lint-dep-cruiser: ## Run dependency-cruiser graph-hygiene gate inside the docker container.
      $(BUN_X) depcruise --config .dependency-cruiser.js src
  ```

- **Failure reporting names file + rule.** The reporter is pinned to the default `text` (NOT
  `err`). `text` prints one line per finding naming the offending file and the violated rule for
  all severities — keeping advisory `warn`/`info` findings visible — and still exits non-zero on
  any `error`-severity match; a clean run exits `0` with no output (Decision 6).

- **Branch-protection integration is the enforcement surface.** PRs to `main` are blocked until
  the required `dependency-cruiser` check passes (Branch Protection Integration).

### Project Structure Notes

- **No new committed files are created by this story's enforcement step.** The required-check
  registration is a GitHub branch-protection configuration action, not a repository file.
- **Modified (only if remediation is needed):** source files under `src/` that carry pre-existing
  graph violations surfaced by the baseline run (Task 1). The shape and count depend on the run.
- **Modified (documentation):** `CONTRIBUTING.md` — a note that `dependency-cruiser` is a required
  check (coordinated with Epic 3).
- **Must NOT exist:** any `depcruise-baseline` / `.dependency-cruiser-baseline.json` file.
- **Depends on (already delivered):** `.dependency-cruiser.js`, the `lint-dep-cruiser` Makefile
  target + `.PHONY` + `lint:` chain entry (Epic 1), and
  `.github/workflows/dependency-cruiser.yml` (Story 2.1).

### Testing Approach

This story is verified by execution and configuration inspection rather than unit tests:

- **Baseline run:** execute `make lint-dep-cruiser` on `main` inside the docker-compose `bun`
  service; confirm exit `0` after remediation and confirm no baseline file via
  `git ls-files | grep -i baseline`.
- **Required-check registration:** inspect the `main` branch protection rules and confirm
  `dependency-cruiser` is present and marked required with the exact workflow/job name.
- **Negative path:** an intentional `no-circular` violation on a scratch PR must fail the check
  and block merge, with the log naming the file and `no-circular`.
- **Parity path:** a clean PR must pass; CI invokes the same `make lint-dep-cruiser` target, so it
  evaluates the identical policy and `src` scope a contributor runs locally.

### References

- Architecture:
  `specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md`
  - §Decision 5: CI Job Structure, §Decision 6: Reporting Format, §Branch Protection Integration,
    §Local/CI Parity Boundary, §Gap Analysis Results (zero-tolerance baseline compliance),
    §Enforcement Guidelines
- Epics: `specs/dependency-cruiser/planning-artifacts/epics-dependency-cruiser-2026-06-23.md`
  (Story 2.2)
- PRD: `specs/dependency-cruiser/planning-artifacts/prd-dependency-cruiser-2026-06-23.md`
  - FR10, FR18, FR8
- Previous story:
  `specs/dependency-cruiser/implementation-artifacts/2-1-dedicated-dependency-cruiser-workflow.md`

## Dev Agent Record

### Agent Model Used

_Pending implementation._

### Debug Log References

_Pending implementation._

### Completion Notes List

_Pending implementation._

### File List

_Pending implementation._

### Change Log

_Pending implementation._
