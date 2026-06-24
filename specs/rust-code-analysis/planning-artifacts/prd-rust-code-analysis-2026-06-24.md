---
stepsCompleted:
  - 'step-01-init.md'
  - 'step-02-discovery.md'
  - 'step-03-success.md'
  - 'step-04-journeys.md'
  - 'step-05-domain.md'
  - 'step-06-innovation.md'
  - 'step-07-project-type.md'
  - 'step-08-scoping.md'
  - 'step-09-functional.md'
  - 'step-10-nonfunctional.md'
  - 'step-11-complete.md'
inputDocuments:
  - 'https://github.com/VilnaCRM-Org/ui-toolkit/issues/59'
  - 'README.md'
  - 'CONTRIBUTING.md'
  - '.github/workflows/static-testing.yml'
  - 'package.json'
  - 'Makefile'
  - 'docker-compose.yml'
  - 'Dockerfile'
  - 'VilnaCRM-Org/crm@main:config/metrics-policy.json'
  - 'VilnaCRM-Org/crm@main:scripts/lint-metrics.sh'
  - 'VilnaCRM-Org/crm@main:.github/workflows/rust-code-analysis.yml'
workflowType: 'prd'
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 11
classification:
  projectType: 'developer_tool'
  domain: 'general'
  complexity: 'low'
  projectContext: 'brownfield'
---

# Product Requirements Document - rust-code-analysis CI check for ui-toolkit

**Author:** platform-team
**Date:** 2026-06-24T12:00:00+02:00

## Executive Summary

This initiative adds a required `rust-code-analysis` complexity/metrics CI check to the
`@vilnacrm/ui-toolkit` repository for pull requests targeting `main`, mirroring the gate already
shipped in the sibling [VilnaCRM `crm`](https://github.com/VilnaCRM-Org/crm) repository. The
change turns per-function and per-file code-complexity enforcement for this React 19 + MUI 9
component library into an explicit, automated repository policy rather than a manual reviewer
judgment.

Mozilla's [`rust-code-analysis-cli`](https://github.com/mozilla/rust-code-analysis) computes
source metrics directly from the TypeScript/TSX under `src/` — cyclomatic and cognitive
complexity, ABC magnitude, number of arguments (NARGS), number of exit points (NEXITS), Halstead
measures, SLOC/PLOC/LLOC, the maintainability index, and OOP class/interface metrics. A committed
`config/metrics-policy.json` (validated against a committed `config/metrics-policy.schema.json`)
defines the governed scope and the per-metric hard-fail thresholds, and a `scripts/lint-metrics.sh`
script enforces them identically locally and in CI through the `make lint-metrics` target.

The analyzer is a native binary, not a JavaScript tool, so it is provisioned through a dedicated
dockerized `rca` service with `rust-code-analysis-cli` pre-installed at a pinned, integrity-verified
version — mirroring CRM and keeping the existing Bun/Alpine `bun` image free of a Rust toolchain.
The gate must collect **all** hard-fail violations on each run (never fail-fast), exit non-zero on
any of them, name the offending file, function/closure/class subject, line, metric, measured value,
and threshold, and — on a passing run — publish a `GITHUB_STEP_SUMMARY` with the actual measured
metric values. Contributors must be able to run the identical check locally through
`make lint-metrics` before marking a pull request ready for review.

This PRD covers only this repository-level CI check effort for `ui-toolkit`. It is a parallel
tooling-parity effort to the `dependency-cruiser` gate (issue #58); the two are independent and do
not depend on each other. IDE/editor integration, metric-artifact publishing, multi-repository
reuse, rollout/transition strategies, and automatic code remediation are outside the current scope.

## Success Criteria

### User Success

- Contributors can run `rust-code-analysis` locally before pushing, via `make lint-metrics`.
- Contributors can identify the failing file, function (or closure/class), and metric directly from
  the check output, with the measured value and the threshold it breached.
- Maintainers can rely on a single required complexity/metrics status check for pull requests to
  `main`.

### Business Success

- Code-complexity enforcement for this repository moves from reviewer discretion to an automated
  repository policy.
- A pull request is not considered ready for review while the required `rust-code-analysis` check
  is failing.

### Technical Success

- CI runs `rust-code-analysis` automatically for pull requests targeting `main`.
- The check fails when the governed `src/` scope exceeds the committed `config/metrics-policy.json`
  thresholds, with no suppression mechanism to mask findings.
- The committed policy is validated against `config/metrics-policy.schema.json` before any threshold
  is read, so a malformed policy fails fast rather than silently skipping checks.
- The failure output is actionable enough for authors to fix violations without interpreting raw
  tool internals.
- On success, CI publishes a step summary with the actual measured metric values for the governed
  scope.
- Repository documentation explains how to run the same check locally and what the gate enforces.

### Measurable Outcomes

- The repository contains a committed `config/metrics-policy.json` + `config/metrics-policy.schema.json`,
  a `scripts/lint-metrics.sh` enforcement script, `lint-metrics`/`lint-metrics-run` Makefile targets,
  and a dedicated `rust-code-analysis` GitHub Actions workflow.
- The `rust-code-analysis-cli` version is pinned in a single source and the analyzer is provisioned
  through a dedicated dockerized `rca` service.
- Pull requests to `main` surface a required `rust-code-analysis` result.
- Documentation for local execution and failure/summary interpretation is present in project docs
  (`CONTRIBUTING.md` and `README.md`).

## Product Scope

### Current Scope

- Add `rust-code-analysis` to CI for pull requests to `main` as a required check.
- Provide `rust-code-analysis-cli` at a pinned, integrity-verified version through a dedicated
  dockerized `rca` service with the binary pre-installed (mirroring CRM).
- Commit `config/metrics-policy.json` (hard-fail thresholds, plus an optional review-gate block)
  and `config/metrics-policy.schema.json`, governed over the `src/` scope.
- Commit `scripts/lint-metrics.sh`, which runs the CLI over the governed scope, self-validates the
  policy against the schema, evaluates thresholds, collects all violations, and writes a
  `GITHUB_STEP_SUMMARY`.
- Provide `lint-metrics` and `lint-metrics-run` Makefile targets, register them in `.PHONY`, and
  append `lint-metrics` to the aggregate `lint` chain.
- Run a baseline-compliance check against current `main` and commit a policy that passes (or
  calibrate thresholds to a passing baseline) before the check is made required, with no suppression
  file introduced.
- Document what the check enforces, how to run it locally, and how to interpret failures and
  passing summaries for contributors.

### Deferred Work

- No additional follow-on scope is committed in this PRD.

### Future Considerations

- Reassess tightening the committed thresholds toward stricter "target" values (with a follow-up
  code-remediation effort) only after the gate proves stable against the current baseline.
- Reassess richer reporting (trend tracking, per-PR metric deltas) or reuse of this policy in other
  repositories only after this repository-level gate proves useful.

## User Journeys

### Journey 1: Contributor Pre-Review Success Path

A contributor changes component code under `src/components/` for the `ui-toolkit` repository and
prepares a pull request to `main`. Before marking the PR ready for review, the contributor runs
`make lint-metrics`. The command analyzes the `src/` scope with `rust-code-analysis-cli` inside the
dockerized `rca` service, evaluates every governed metric against the committed
`config/metrics-policy.json`, and reports any hard-fail violations — a function over the cyclomatic
or cognitive limit, a file over its SLOC limit, too many arguments or exit points — with enough
detail to identify the failing file, the function/closure/class subject, and the breached metric.
The contributor refactors the offending code, reruns the command until it passes, and pushes a
branch that satisfies the policy. CI runs the same check on the pull request, and the contributor
marks the PR ready for review only after the required check passes.

### Journey 2: Contributor Failure and Recovery Path

A contributor pushes a change set that introduces an overly complex function (for example a
cyclomatic complexity of 14 against a limit of 10). CI fails the required `rust-code-analysis` check
on the pull request. The contributor reads the failure output, which names the file, the function,
the start line, the metric (`cyclomatic`), the measured value (14), and the limit (`<=10`), refactors
to bring the metric within policy, reruns `make lint-metrics` locally until it passes, and pushes
again. The contributor does not treat the PR as ready for review while the required check is failing.

### Journey 3: Maintainer Readiness and Enforcement Path

A maintainer looks at a pull request targeting `main` and uses the required `rust-code-analysis`
status check as the repository's code-complexity gate. If the check is failing, the pull request
does not satisfy repository complexity policy and is not considered ready for review. If the check
is passing, the maintainer can review the change knowing the committed per-metric thresholds have
already been enforced automatically across the governed `src/` scope and do not need manual policing
in review. On a passing run, the maintainer can also see the actual measured metric values in the
job's step summary.

### Journey Requirements Summary

- A documented local command for contributors (`make lint-metrics`)
- A required CI status check for pull requests to `main`
- A committed, schema-validated threshold policy (`config/metrics-policy.json`) in the repository
- Failure output that names the offending file, subject, line, metric, value, and threshold
- A passing-run step summary that reports the actual measured metric values
- Repository workflow language that ties check status to review readiness

## Developer-Tool-Specific Requirements

### Project-Type Overview

This initiative adds a repository-level developer quality tool to the `ui-toolkit` codebase. It is
an internal engineering control, not a user-facing library feature. Its purpose is to enforce
repository-defined code-complexity policy for the published component library and surface actionable
failures before review.

### Technical Architecture Considerations

The repository must own the policy as committed files: `config/metrics-policy.json` (the per-metric
thresholds) and `config/metrics-policy.schema.json` (the policy contract). Enforcement is performed
by `scripts/lint-metrics.sh`, which self-validates the policy against the schema, invokes
`rust-code-analysis-cli` over the governed scope, parses the JSON metric output with `jq`, evaluates
every governed metric, and reports results. Because the analyzer is a native binary (not a Bun/Node
tool), it is provisioned through a dedicated dockerized `rca` service with `rust-code-analysis-cli`
pre-installed at a pinned, integrity-verified version, rather than through `bun x`. The gate is
exposed through `make lint-metrics` (which runs the `rca` service) and `make lint-metrics-run` (the
in-container invocation), keeping `make` the contributor-facing command source of truth — consistent
with how every other gate runs and with the repository's script-free `package.json`. Because the
prebuilt analyzer is glibc-only, the `rca` image uses a non-Alpine base, so its Dockerfile must carry
an inline `# alpine-exception:` marker to satisfy the repository's existing Alpine base-image guard
(mirroring `Dockerfile.playwright`). IDE/editor integration is out of scope.

### Governed Analysis Scope

- The governed scope is the `src/` tree (the same source tree targeted by the parallel
  dependency-cruiser effort, #58). The substantive analyzable surface is the TypeScript/TSX under
  `src/components/` and `src/types/`.
- The following are excluded from analysis: vendored and generated directories (`node_modules`,
  `build`, `coverage`, `storybook-static`), the repository `tests/` tree, non-code assets
  (`src/assets/**` fonts and SVGs), and TypeScript declaration files (`*.d.ts`).
- The empty `src/{hooks,lib,providers,routes,stores,utils}` placeholder directories contain no
  analyzable code and carry no findings.
- Whether Storybook `*.stories.tsx` files remain in scope is confirmed by the baseline-compliance
  run; the default is to keep them in scope (they are first-class source).

### Local Execution Requirements

- Contributors run the check locally through the `make lint-metrics` target for this initiative.
- Contributors do not need to construct the raw `rust-code-analysis-cli` invocation or manage the
  analyzer binary themselves; the dockerized `rca` service supplies it.
- The target is appended to the aggregate `lint` target so a full local `make lint` exercises the
  gate.
- Because the `rca` service bind-mounts the working tree at run time, a local `make lint-metrics`
  analyzes the contributor's live source, not a stale baked image.

### Documentation Requirements

- Repository documentation must explain:
  - what the check enforces (the hard-fail metric families — per-function/closure, per-file, and
    OOP class/interface — and the review-gate metrics that are computed but never block)
  - the governed `src/` scope and its exclusions
  - how to run it locally using `make lint-metrics`
  - what it means when the check fails (the violation table) and what a passing step summary reports
- IDE/editor integration guidance is out of scope for this initiative.
- Example catalogs and metric-theory tutorials are out of scope for this initiative.

### Implementation Considerations

- The repository must provide one stable local execution path that matches CI exactly.
- The committed policy must define the governed analysis scope and exclusions clearly enough to
  avoid ambiguity, and must be valid against its committed JSON schema.
- The analyzer version must be pinned in a single source, and the binary must be integrity-verified
  on the platform that downloads a prebuilt release.
- The `rca` image is glibc-based (the prebuilt analyzer is glibc-only), so its Dockerfile must carry
  an `# alpine-exception:` marker to pass the repository's Alpine base-image guard — without it, the
  gate's own pull request would fail that existing required check.
- The gate must collect all violations before exiting (never fail-fast) so a contributor can fix
  every issue in one local run.
- Failure output must remain understandable enough for contributors to remediate quickly.
- A baseline-compliance run against current `main` is required: this React/MUI TSX codebase differs
  from CRM's, and `rust-code-analysis` v0.0.25 OOP class/interface and maintainability-index metrics
  may be sparse or unreliable for TS — so the committed thresholds must be confirmed (or calibrated
  to a passing baseline) before the check is made required, with no suppression mechanism introduced.

## Project Scoping & Delivery Boundaries

### Delivery Strategy

**Delivery Approach:** Single-slice repository change focused on enforcing one `rust-code-analysis`
complexity/metrics gate for `ui-toolkit`
**Resource Requirements:** One engineer delivering the change in a single implementation slice / PR
stream

This scope is intentionally narrow. Its purpose is to make `rust-code-analysis` a required
repository policy, not to create a broader code quality platform. Any work that would require staged
rollout, a non-blocking transition, or parallel implementation tracks is out of scope.

### Current Feature Set

**Core User Journeys Supported:**

- Contributor pre-review success path
- Contributor failure and recovery path
- Maintainer readiness and enforcement path

**Must-Have Capabilities:**

- Provide `rust-code-analysis-cli` at a pinned, integrity-verified version through a dedicated
  dockerized `rca` service
- Commit a schema-validated `config/metrics-policy.json` policy and its
  `config/metrics-policy.schema.json` contract
- Enforce the policy with `scripts/lint-metrics.sh`, collecting all hard-fail violations before
  exiting non-zero
- Run `rust-code-analysis` automatically in CI for pull requests targeting `main`
- Surface a required `rust-code-analysis` result for pull requests to `main`
- Govern the `src/` scope and exclude vendored/generated dirs, the `tests/` tree, non-code assets,
  and declaration files
- Provide one stable local execution path through `make lint-metrics`, with `lint-metrics-run` as
  the in-container invocation
- Report actual measured metric values on success and an actionable violation table on failure, on
  stdout and in `GITHUB_STEP_SUMMARY`
- Document what the check enforces, how to run it locally, and how to interpret failures and summaries
- Include whatever repository updates are necessary so the blocking gate can be enabled without a
  non-blocking transition

### Explicitly Out of Scope

No additional follow-on work is committed by this PRD. Tightening thresholds toward stricter target
values (and the code remediation that would require), reuse in other repositories, IDE integration,
richer/trend reporting, metric-artifact publishing, and automatic code remediation are deferred
unless a later planning effort explicitly adds them. The `dependency-cruiser` gate (issue #58) is a
separate, parallel tooling-parity effort and is not part of this PRD.

### Risk Mitigation Strategy

**Technical Risks:** A threshold policy ported from CRM may fail broadly on first introduction
because this repository's React/MUI TSX differs from CRM's code, and because `rust-code-analysis`
v0.0.25 OOP class/interface and maintainability-index metrics can be sparse or unreliable for TS.
Mitigation: run a baseline-compliance check against current `main`, confirm which metrics produce
meaningful values for this codebase, and commit a policy that passes (calibrating thresholds to a
passing baseline and deferring tightening) rather than introducing any suppression mechanism.

**Adoption Risks:** Contributors may perceive the gate as noisy or opaque. Mitigation: require
collect-all-then-fail output that names file, subject, line, metric, value, and threshold; publish a
passing step summary with measured values; and document remediation and the simple `make`-based
local workflow.

**Resource Risks:** Scope creep is the primary delivery risk with one engineer and one
implementation slice. Mitigation: keep IDE integration, trend reporting, threshold tightening,
multi-repo reuse, and the `dependency-cruiser` gate explicitly out of scope.

## Functional Requirements

### Analyzer Provisioning

- FR1: The repository can provide `rust-code-analysis-cli` at a pinned version through a dedicated
  dockerized `rca` service with the binary pre-installed, so no host install and no Rust toolchain
  in the Bun/Alpine `bun` image are required.
- FR2: The `rca` service's analyzer binary can be version-pinned in a single source and
  integrity-verified (a checksum-verified prebuilt release on the prebuilt-release platform; a
  version-locked source build on platforms without a prebuilt release), exposing no host ports and
  requiring no network access at analysis time. Because the prebuilt analyzer is glibc-only, the
  `rca` image's Dockerfile can carry an `# alpine-exception:` marker so it satisfies the repository's
  Alpine base-image guard, as `Dockerfile.playwright` already does.

### Policy Definition & Validation

- FR3: The repository can commit a single `config/metrics-policy.json` defining the per-metric
  hard-fail thresholds (and an optional review-gate threshold block) as the one versioned source of
  the governed limits.
- FR4: The repository can commit a `config/metrics-policy.schema.json` (JSON Schema) describing the
  policy contract, and the gate can self-validate the committed policy against the schema before any
  threshold is read, failing fast with a clear error on a malformed policy.
- FR5: The committed policy and the gate can define the governed analysis scope as `src/`, excluding
  vendored/generated directories (`node_modules`, `build`, `coverage`, `storybook-static`), the
  repository `tests/` tree, non-code assets (`src/assets/**`), and TypeScript declaration files
  (`*.d.ts`).

### Enforcement Engine

- FR6: The repository can commit a `scripts/lint-metrics.sh` script that runs `rust-code-analysis-cli`
  over the governed scope, parses the per-function/closure, per-file, and class/interface JSON
  metrics with `jq`, and evaluates each governed metric against the committed thresholds.
- FR7: The enforcement script can collect **all** hard-fail violations on a run (never fail-fast),
  exit non-zero when any hard-fail threshold is breached or any precondition/schema/analyzer-output
  check fails, and exit zero when the governed scope is within policy.
- FR8: The enforcement script can compute review-gate metrics without ever blocking CI on them; they
  do not affect the exit code and are not printed in the stdout violation summary.
- FR9: The enforcement script can be robust to analyzer quirks — tolerant metric-key reading
  (including the legacy maintainability-index key spelling and cognitive complexity as object or
  scalar), null-safe comparisons that skip metrics absent for a given language, and division guards
  for derived ratio metrics — so absent metrics never produce false violations.

### Make Targets & Local Execution

- FR10: The repository can provide a `lint-metrics` Makefile target that runs the gate inside the
  dockerized `rca` service and forwards `GITHUB_STEP_SUMMARY` into the container when it is set and
  writable, plus a `lint-metrics-run` target that performs the in-container invocation (exporting the
  `RCA_*` and policy-path variables and running `scripts/lint-metrics.sh`).
- FR11: The repository can register `lint-metrics` and `lint-metrics-run` in `.PHONY` and append
  `lint-metrics` to the aggregate `lint` chain so a full local `make lint` exercises the gate.
- FR12: Contributors can run the repository-defined check locally through `make lint-metrics`, the
  single source of truth for the command, the analyzer version, the governed scope, and the policy
  path, before marking a pull request ready for review.

### Quality Gate Enforcement

- FR13: The repository can execute `rust-code-analysis` automatically in CI for pull requests
  targeting `main` through a dedicated GitHub Actions workflow.
- FR14: A pull request targeting `main` can surface a required `rust-code-analysis` result, whose
  check name matches the workflow/job, as part of repository quality policy.
- FR15: The required `rust-code-analysis` result can evaluate the full governed `src/` scope on each
  pull request and fail when the committed thresholds are exceeded.
- FR16: The CI workflow can follow repository house style: hardened permissions (no top-level
  permissions; job-level `contents: read`), a TAG-pinned `actions/checkout@v4` with
  `persist-credentials: false`, an explicit job timeout, no `setup-node`, and a runtime-detection
  gate that keeps the workflow inert on bootstrap pull requests lacking the project runtime files.

### CI Results Reporting

- FR17: On a successful run, the gate can publish a `GITHUB_STEP_SUMMARY` (and stdout summary)
  reporting the actual measured metric values for the governed scope against the policy thresholds.
- FR18: On a failed run, the gate can report each hard-fail violation — naming the offending file,
  the function/closure/class subject, its start line, the metric, the measured value, and the
  threshold — on both stdout and `GITHUB_STEP_SUMMARY`, so contributors can remediate without
  interpreting raw tool internals.

### Repository Policy Consistency

- FR19: CI and local execution can evaluate `rust-code-analysis` results against the same committed
  `config/metrics-policy.json` thresholds and the same governed-scope definition through the shared
  `make lint-metrics` target.
- FR20: The analyzer version can be pinned in a single source referenced by both the Makefile and
  the `rca` image build, so local and CI execution run the identical analyzer version.

### Baseline Compliance & Verification

- FR21: Before the required check is enabled, a baseline-compliance run against current `main` can
  confirm the committed thresholds pass (or the thresholds can be calibrated to a passing baseline
  and tightened in a later effort), with no suppression mechanism introduced.
- FR22: The committed policy schema and the enforcement script's behavior can be covered by automated
  tests consistent with the repository's test conventions (a policy/schema validity test and a
  shell-flow coverage test for the script).

### Contributor Documentation

- FR23: Contributors can access repository documentation describing what the `rust-code-analysis`
  check enforces — the hard-fail metric families and the review-gate metrics — the governed `src/`
  scope, and the no-suppression nature of the gate.
- FR24: Contributors can access repository documentation describing how to run the check locally
  through `make lint-metrics` (not the raw CLI) and how to interpret check failures (the violation
  table) and passing CI summaries (the measured-metric table).

## Non-Functional Requirements

### Reliability

- The `rust-code-analysis` gate must be trustworthy enough that contributors and maintainers can
  treat failures as real policy signals.
- Repeated evaluations against the same code state, the same committed policy, and the same pinned
  analyzer version must not produce materially inconsistent pass/fail outcomes.

### Consistency

- Local execution through `make lint-metrics` and CI execution must evaluate the same governed `src/`
  scope against the same committed `config/metrics-policy.json`, using the same pinned analyzer
  version supplied by the `rca` image.
- The committed policy must remain the single source of thresholds; the schema must remain the single
  contract that the policy is validated against before enforcement.

### Usability

- Failed CI output and local output must be understandable enough for routine contributor and
  maintainer use without requiring interpretation of raw tool internals — naming the offending file,
  subject, line, metric, value, and threshold.
- A passing run must report the actual measured metric values so a maintainer can see headroom
  against the policy.
- Local usage guidance must be understandable enough for contributors to run and interpret the check
  as part of normal repository workflow.

### Performance

- The check must be operationally acceptable for routine pull request use; the dockerized `rca`
  service analyzing the `src/` scope completes well within a short CI job timeout.
- This PRD does not impose a fixed numeric execution-time target.

### Security & Supply Chain

- The analyzer binary must be version-pinned and integrity-verified before use, and the `rca` service
  must expose no host ports and require no network access at analysis time.
- The CI workflow must use least-privilege permissions and a pinned checkout that does not persist
  credentials, consistent with the repository's hardened workflow posture.
