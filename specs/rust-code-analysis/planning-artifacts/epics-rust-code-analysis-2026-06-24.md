---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
inputDocuments:
  - 'specs/rust-code-analysis/planning-artifacts/prd-rust-code-analysis-2026-06-24.md'
  - 'specs/rust-code-analysis/planning-artifacts/architecture-rust-code-analysis-2026-06-24.md'
---

# ui-toolkit - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ui-toolkit, decomposing the
requirements from the PRD and Architecture into implementable stories. The initiative adds a
required `rust-code-analysis` complexity/metrics gate to `@vilnacrm/ui-toolkit` for pull requests
targeting `main`: a pinned analyzer provided through a dedicated dockerized `rca` service, a
committed and schema-validated `config/metrics-policy.json`, a `scripts/lint-metrics.sh` enforcement
engine, `make lint-metrics`/`lint-metrics-run` local entry points, a dedicated CI workflow, and
contributor documentation. The work is a single-slice, low-complexity, no-suppression brownfield
change that mirrors the gate already shipped in the sibling `VilnaCRM-Org/crm` repository.

## Requirements Inventory

### Functional Requirements

FR1: The repository can provide `rust-code-analysis-cli` at a pinned version through a dedicated
dockerized `rca` service with the binary pre-installed, so no host install and no Rust toolchain in
the Bun/Alpine `bun` image are required.
FR2: The `rca` service's analyzer binary can be version-pinned in a single source and
integrity-verified (a checksum-verified prebuilt release on the prebuilt-release platform; a
version-locked source build on platforms without a prebuilt release), exposing no host ports and
requiring no network access at analysis time.
FR3: The repository can commit a single `config/metrics-policy.json` defining the per-metric
hard-fail thresholds (and an optional review-gate threshold block) as the one versioned source of
the governed limits.
FR4: The repository can commit a `config/metrics-policy.schema.json` (JSON Schema) describing the
policy contract, and the gate can self-validate the committed policy against the schema before any
threshold is read, failing fast with a clear error on a malformed policy.
FR5: The committed policy and the gate can define the governed analysis scope as `src/`, excluding
vendored/generated directories (`node_modules`, `build`, `coverage`, `storybook-static`), the
repository `tests/` tree, non-code assets (`src/assets/**`), and TypeScript declaration files
(`*.d.ts`).
FR6: The repository can commit a `scripts/lint-metrics.sh` script that runs `rust-code-analysis-cli`
over the governed scope, parses the per-function/closure, per-file, and class/interface JSON metrics
with `jq`, and evaluates each governed metric against the committed thresholds.
FR7: The enforcement script can collect all hard-fail violations on a run (never fail-fast), exit
non-zero when any hard-fail threshold is breached or any precondition/schema/analyzer-output check
fails, and exit zero when the governed scope is within policy.
FR8: The enforcement script can compute review-gate metrics without ever blocking CI on them; they
do not affect the exit code and are not printed in the stdout violation summary.
FR9: The enforcement script can be robust to analyzer quirks — tolerant metric-key reading
(including the legacy maintainability-index key spelling and cognitive complexity as object or
scalar), null-safe comparisons that skip metrics absent for a given language, and division guards
for derived ratio metrics — so absent metrics never produce false violations.
FR10: The repository can provide a `lint-metrics` Makefile target that runs the gate inside the
dockerized `rca` service and forwards `GITHUB_STEP_SUMMARY` into the container when it is set and
writable, plus a `lint-metrics-run` target that performs the in-container invocation (exporting the
`RCA_*` and policy-path variables and running `scripts/lint-metrics.sh`).
FR11: The repository can register `lint-metrics` and `lint-metrics-run` in `.PHONY` and append
`lint-metrics` to the aggregate `lint` chain so a full local `make lint` exercises the gate.
FR12: Contributors can run the repository-defined check locally through `make lint-metrics`, the
single source of truth for the command, the analyzer version, the governed scope, and the policy
path, before marking a pull request ready for review.
FR13: The repository can execute `rust-code-analysis` automatically in CI for pull requests
targeting `main` through a dedicated GitHub Actions workflow.
FR14: A pull request targeting `main` can surface a required `rust-code-analysis` result, whose
check name matches the workflow/job, as part of repository quality policy.
FR15: The required `rust-code-analysis` result can evaluate the full governed `src/` scope on each
pull request and fail when the committed thresholds are exceeded.
FR16: The CI workflow can follow repository house style: hardened permissions (no top-level
permissions; job-level `contents: read`), a TAG-pinned `actions/checkout@v4` with
`persist-credentials: false`, an explicit job timeout, no `setup-node`, and a runtime-detection gate
that keeps the workflow inert on bootstrap pull requests lacking the project runtime files.
FR17: On a successful run, the gate can publish a `GITHUB_STEP_SUMMARY` (and stdout summary)
reporting the actual measured metric values for the governed scope against the policy thresholds.
FR18: On a failed run, the gate can report each hard-fail violation — naming the offending file, the
function/closure/class subject, its start line, the metric, the measured value, and the threshold —
on both stdout and `GITHUB_STEP_SUMMARY`, so contributors can remediate without interpreting raw
tool internals.
FR19: CI and local execution can evaluate `rust-code-analysis` results against the same committed
`config/metrics-policy.json` thresholds and the same governed-scope definition through the shared
`make lint-metrics` target.
FR20: The analyzer version can be pinned in a single source referenced by both the Makefile and the
`rca` image build, so local and CI execution run the identical analyzer version.
FR21: Before the required check is enabled, a baseline-compliance run against current `main` can
confirm the committed thresholds pass (or the thresholds can be calibrated to a passing baseline and
tightened in a later effort), with no suppression mechanism introduced.
FR22: The committed policy schema and the enforcement script's behavior can be covered by automated
tests consistent with the repository's test conventions (a policy/schema validity test and a
shell-flow coverage test for the script).
FR23: Contributors can access repository documentation describing what the `rust-code-analysis`
check enforces — the hard-fail metric families and the review-gate metrics — the governed `src/`
scope, and the no-suppression nature of the gate.
FR24: Contributors can access repository documentation describing how to run the check locally
through `make lint-metrics` (not the raw CLI) and how to interpret check failures (the violation
table) and passing CI summaries (the measured-metric table).

### Non-Functional Requirements

NFR1: Reliability — The `rust-code-analysis` gate must be trustworthy enough that contributors and
maintainers can treat failures as real policy signals.
NFR2: Reliability — Repeated evaluations against the same code state, the same committed policy, and
the same pinned analyzer version must not produce materially inconsistent pass/fail outcomes.
NFR3: Consistency — Local execution through `make lint-metrics` and CI execution must evaluate the
same governed `src/` scope against the same committed `config/metrics-policy.json`, using the same
pinned analyzer version supplied by the `rca` image.
NFR4: Consistency — The committed policy must remain the single source of thresholds; the schema must
remain the single contract that the policy is validated against before enforcement.
NFR5: Usability — Failed CI output and local output must be understandable enough for routine
contributor and maintainer use without requiring interpretation of raw tool internals, naming the
offending file, subject, line, metric, value, and threshold.
NFR6: Usability — A passing run must report the actual measured metric values; local usage guidance
must be understandable enough for contributors to run and interpret the check as part of normal
repository workflow.
NFR7: Performance — The check must be operationally acceptable for routine pull request use within
the dockerized `rca` service; this PRD imposes no fixed numeric execution-time target.
NFR8: Security & Supply Chain — The analyzer binary must be version-pinned and integrity-verified,
the `rca` service must expose no host ports and need no network at analysis time, and the workflow
must use least-privilege permissions and a pinned checkout that does not persist credentials.

### Additional Requirements

- No starter template applies — this is a brownfield extension of the existing `ui-toolkit`
  repository, mirroring the gate shipped in `VilnaCRM-Org/crm`.
- Tool: `rust-code-analysis-cli` pinned at `RCA_VERSION = 0.0.25` (matching CRM), provided through a
  dedicated dockerized `rca` service whose image (`Dockerfile.rca`) pre-installs the binary at
  `/usr/local/bin/rust-code-analysis-cli`. On `amd64` the Mozilla prebuilt release
  `rust-code-analysis-linux-cli-x86_64.tar.gz` is SHA-256-verified
  (`9ec2a217b8ff191e02dab5d5f2eee6158b63fd975c532b2c5d67c2e6c7249894`); on `arm64` it is built via
  `cargo install --locked --version 0.0.25 rust-code-analysis-cli`.
- Alpine base-image policy: `Dockerfile.rca` uses a glibc (Debian) base because
  `rust-code-analysis-cli` prebuilt releases are glibc-only, so it MUST carry an inline
  `# alpine-exception: <reason>` marker (mirroring `Dockerfile.playwright`), or the `alpine base
guard` workflow fails the gate's own pull request.
- docker-compose `rca` service: `profiles: [tools]`, `build` from `Dockerfile.rca`, source
  bind-mounted (`.:/app`) so local runs analyze the live tree, no host ports, no network needed.
- Policy: a committed `config/metrics-policy.json` (`hard` required, `review` optional) validated
  against a committed `config/metrics-policy.schema.json` (Draft-07, `required: ["hard"]`,
  `additionalProperties: false`). The script self-validates the policy against the schema inline in
  `jq` before reading thresholds.
- Governed scope: analyze `src/`; exclude `node_modules`, `build`, `coverage`, `storybook-static`,
  the `tests/` tree, `src/assets/**`, and `*.d.ts` via `RCA_EXCLUDES`. Storybook `*.stories.tsx`
  remain in scope unless the baseline run shows they dominate noise.
- Enforcement: `scripts/lint-metrics.sh` (POSIX sh, `set -eu`) runs `rust-code-analysis-cli -m -O
json -p src/ -X <excludes>`, evaluates every governed metric via `jq`, collects ALL violations
  (never fail-fast), exits 1 on any hard violation or precondition failure (else 0); review-gate
  metrics are computed but never block and are excluded from the stdout summary.
- Make targets: `lint-metrics` (runs `$(DOCKER_COMPOSE) run --rm rca make lint-metrics-run`, mounting
  `GITHUB_STEP_SUMMARY` when set) and `lint-metrics-run` (exports `RCA_*`/`METRICS_POLICY` and runs
  the script). Both in `.PHONY`; `lint-metrics` appended to the aggregate `lint` chain. Recipes are
  space-indented (`.RECIPEPREFIX += `). No `make start`/`make down` needed.
- Reporting: stdout measured-metric table on success and a findings table
  (`GATE FILE SCOPE SUBJECT LINE METRIC VALUE LIMIT`) on failure; the same content mirrored to
  `GITHUB_STEP_SUMMARY` as Markdown when set. No suppression/baseline file.
- CI workflow: `.github/workflows/rust-code-analysis.yml`, job name `rust-code-analysis`, trigger
  `pull_request` → `main`, top-level `permissions: {}`, job-level `contents: read`,
  `timeout-minutes: 10`, `concurrency` with `cancel-in-progress`, `actions/checkout@v4` +
  `persist-credentials: false`, runtime-detection gate, no `setup-node`, single
  `run: make lint-metrics` (no `make start`/`make down`).
- Aggregate lint chain: `lint: lint-next lint-tsc lint-md format-check lint-dep-ranges
lint-test-structure lint-metrics` (append `lint-metrics`; add `lint-metrics`/`lint-metrics-run` to
  `.PHONY`). Note: the current chain has six prerequisites and does NOT include `lint-dep-cruiser`
  (issue #58 is a sibling effort not present in this tree); `lint-metrics` is appended as the seventh.
- Planned target-state delta (not part of this PR): 6 new files (`Dockerfile.rca`,
  `config/metrics-policy.json`, `config/metrics-policy.schema.json`, `scripts/lint-metrics.sh`,
  `.github/workflows/rust-code-analysis.yml`, test files) and 4 modified (`docker-compose.yml`,
  `Makefile`, `CONTRIBUTING.md`, `README.md`).
- A no-suppression baseline-compliance run against current `main` is required before registering the
  workflow as a required check in branch protection.

### FR Coverage Map

FR1: Epic 1 — dedicated `rca` docker service + `Dockerfile.rca` with the pinned binary pre-installed
FR2: Epic 1 — single-source `RCA_VERSION` pin + integrity verification; no ports/network
FR3: Epic 1 — committed `config/metrics-policy.json` (`hard` + optional `review`)
FR4: Epic 1 — committed `config/metrics-policy.schema.json` + (the schema self-validation runs in
the Epic 2 script, against this committed schema)
FR5: Epic 1 — governed scope `src/` + `RCA_EXCLUDES` definition
FR6: Epic 2 — `scripts/lint-metrics.sh` runs the CLI and evaluates metrics via `jq`
FR7: Epic 2 — collect-all-then-fail; correct exit codes
FR8: Epic 2 — review-gate metrics non-blocking and excluded from the stdout summary
FR9: Epic 2 — robustness to analyzer quirks (tolerant keys, null-safe, division guards)
FR10: Epic 2 — `lint-metrics` (docker run + summary mount) and `lint-metrics-run` (in-container)
FR11: Epic 2 — `.PHONY` registration + `lint-metrics` appended to the `lint:` chain
FR12: Epic 2 — `make lint-metrics` as the single local entry point
FR13: Epic 3 — CI trigger on `pull_request` → `main`
FR14: Epic 3 — required status check registration (job/check name `rust-code-analysis`)
FR15: Epic 3 — full governed `src/` scope evaluated each CI run (reinforced from Epic 2's target)
FR16: Epic 3 — hardened permissions, pinned checkout, timeout, runtime-detection gate, no setup-node
FR17: Epic 2 — success measured-metric table on stdout + `GITHUB_STEP_SUMMARY` (surfaced by CI in
Epic 3)
FR18: Epic 2 — failure findings table on stdout + `GITHUB_STEP_SUMMARY` (surfaced by CI in Epic 3)
FR19: Epic 3 — same committed policy + `src/` scope via the shared `make lint-metrics`
(established in Epic 2)
FR20: Epic 3 — single-source `RCA_VERSION` referenced by the Makefile and the image build
FR21: Epic 3 — no-suppression baseline-compliance run before enabling the required check
FR22: Epic 4 — automated tests (schema validity + script shell-flow coverage)
FR23: Epic 4 — documentation: what the gate enforces, governed scope, no-suppression nature
FR24: Epic 4 — documentation: local `make lint-metrics` usage + failure/summary interpretation

## Epic List

### Epic 1: Analyzer Provisioning & Committed Policy

The pinned `rust-code-analysis-cli` is available through a dedicated dockerized `rca` service, and
the repository commits a schema-validated `config/metrics-policy.json` defining the per-metric
thresholds and the governed `src/` scope.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 2: Local Enforcement Engine & Make Targets

Contributors can run `make lint-metrics` locally against the committed policy and receive actionable
feedback naming exactly which file, function/closure/class, and metric exceeded policy — collecting
all violations in one run — before pushing.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR17, FR18

### Epic 3: CI Integration & Required Check

Pull requests to `main` are automatically evaluated by a dedicated `rust-code-analysis` workflow that
is registered as a required status check after a no-suppression baseline-compliance run, blocking
merges on any threshold breach and keeping local and CI evaluation in parity through the same
`make lint-metrics` target and the same pinned analyzer version.
**FRs covered:** FR13, FR14, FR15, FR16, FR19, FR20, FR21

### Epic 4: Verification & Contributor Documentation

The committed policy schema and the enforcement script are covered by automated tests, and
contributors can self-serve to understand what the gate enforces, how to run it locally, and how to
interpret failures and passing summaries.
**FRs covered:** FR22, FR23, FR24

## Epic 1: Analyzer Provisioning & Committed Policy Details

The pinned `rust-code-analysis-cli` is available through a dedicated dockerized `rca` service, and
the repository commits a schema-validated `config/metrics-policy.json` defining the per-metric
thresholds and the governed `src/` scope.

### Story 1.1: Provide the analyzer via a dedicated dockerized `rca` service

As a maintainer,
I want `rust-code-analysis-cli` provided at a pinned, integrity-verified version through a dedicated
dockerized `rca` service,
So that the metrics gate has a native analyzer without a host install and without adding a Rust
toolchain to the Bun/Alpine `bun` image.

**Acceptance Criteria:**

**Given** the repository root is inspected
**When** a contributor opens `Dockerfile.rca`
**Then** the image pre-installs `rust-code-analysis-cli` at `RCA_VERSION` `0.0.25` to
`/usr/local/bin/rust-code-analysis-cli`, plus the supporting tooling it needs (`ca-certificates`,
`jq`, `make`, `tar`)
**And** on the prebuilt-release platform (`amd64`) the Mozilla
`rust-code-analysis-linux-cli-x86_64.tar.gz` release is downloaded and verified against the pinned
SHA-256 before extraction, and on other platforms (`arm64`) the binary is built via `cargo install
--locked --version 0.0.25 rust-code-analysis-cli`

**Given** `Dockerfile.rca` uses a glibc (Debian) base because the prebuilt analyzer is glibc-only
**When** `scripts/ci/alpine_base_guard.sh scan` (and the `alpine base guard` workflow) run
**Then** `Dockerfile.rca` carries an inline `# alpine-exception: <reason>` marker explaining the
glibc-only analyzer, mirroring the `Dockerfile.playwright` exception
**And** the guard passes for this file

**Given** `docker-compose.yml` is inspected
**When** a contributor reads the new `rca` service
**Then** it builds from `Dockerfile.rca`, declares `profiles: [tools]`, bind-mounts the working tree
(`.:/app`) so local runs analyze the live source rather than a baked image, exposes no host ports,
and needs no network access at analysis time
**And** `rca` does not start on a default `make start`

### Story 1.2: Commit the metrics threshold policy

As a maintainer,
I want the per-metric thresholds committed in a single `config/metrics-policy.json`,
So that all contributors and CI execution paths evaluate against identical, diffable limits.

**Acceptance Criteria:**

**Given** the repository is inspected
**When** a contributor opens `config/metrics-policy.json`
**Then** it is a JSON object with a required `hard` block (the hard-fail thresholds) and an optional
`review` block (computed but non-blocking)
**And** the `hard` block defines the per-function/closure, per-file, and class/interface thresholds
(for example `cyclomatic_max`, `cognitive_max`, `nargs_function_max`, `nexits_max`,
`sloc_function_max`, `nom_total_file_max`, `sloc_file_max`, `mi_visual_studio_min`)

**Given** the committed policy is seeded from the CRM parity baseline
**When** the thresholds are reviewed
**Then** they are documented as an initial baseline (not final target values), to be confirmed or
calibrated by the Epic 3 baseline-compliance run
**And** no suppression/baseline file accompanies the policy

### Story 1.3: Commit the policy JSON schema and define the governed scope

As a maintainer,
I want a `config/metrics-policy.schema.json` contract for the policy and a single governed-scope
definition,
So that a malformed policy fails fast and the analyzed surface is unambiguous and identical locally
and in CI.

**Acceptance Criteria:**

**Given** the repository is inspected
**When** a contributor opens `config/metrics-policy.schema.json`
**Then** it is a Draft-07 JSON Schema with `type: object`, `required: ["hard"]`, and
`additionalProperties: false`
**And** `hard` is `additionalProperties: false`, lists every hard key as `required`, and constrains
each as a `number` with appropriate bounds (`*_max` lower-bounded; ratio keys bounded `0..1`;
`mi_visual_studio_min` bounded `0..100`)
**And** `review` is `additionalProperties: false` with no `required` list (the entire block is
optional)

**Given** the governed scope is defined for the gate
**When** a contributor inspects the scope/exclusion definition
**Then** the analyzed scope is `src/`
**And** the exclusions cover `node_modules`, `build`, `coverage`, `storybook-static`, the `tests/`
tree, non-code assets (`src/assets/**`), and TypeScript declaration files (`*.d.ts`)

## Epic 2: Local Enforcement Engine & Make Targets Details

Contributors can run `make lint-metrics` locally against the committed policy and receive actionable
feedback naming exactly which file, function/closure/class, and metric exceeded policy — collecting
all violations in one run — before pushing.

### Story 2.1: Author the `scripts/lint-metrics.sh` enforcement engine

As a maintainer,
I want a committed `scripts/lint-metrics.sh` that validates the policy, runs the analyzer over the
governed scope, and evaluates every governed metric,
So that complexity enforcement is versioned, testable, and identical locally and in CI.

**Acceptance Criteria:**

**Given** `scripts/lint-metrics.sh` is inspected
**When** a contributor reads its preconditions
**Then** the script is POSIX `sh` with `set -eu` and fails with a clear stderr error and exit 1 when
`jq` is missing, when `RCA_BIN` is unset or not executable, when `METRICS_POLICY` is unset/missing/
invalid JSON, or when `RCA_SCOPE`/`RCA_EXCLUDES` are unset
**And** before reading any threshold, it validates the committed policy against
`config/metrics-policy.schema.json` inline in `jq` and exits 1 with a clear error (for example
`non-object section: hard: got number`) on a malformed policy

**Given** the preconditions pass
**When** the script runs the analyzer
**Then** it invokes `rust-code-analysis-cli -m -O json -p "$RCA_SCOPE"` with one `-X <glob>` per word
in `RCA_EXCLUDES`
**And** it guards against empty or non-object analyzer output (exit 1 with a clear error)

**Given** the analyzer output is parsed
**When** the script evaluates metrics
**Then** it evaluates every governed `hard` metric at function/closure, file, and class/interface
scope against the committed thresholds
**And** it reads metrics robustly — tolerant of the maintainability-index key spelling
(`mi`/`maintanability_index`) and of `cognitive` being an object `{.sum}` or a scalar — and skips
metrics that are absent for a given file rather than reporting a false violation
**And** derived ratio metrics guard against division by zero

### Story 2.2: Collect-all-then-fail evaluation and actionable reporting

As a contributor,
I want a single local run to report a complete list of all violations with file, subject, line,
metric, value, and threshold — plus a passing summary of measured values,
So that I can identify and fix every issue in one pass and see headroom against the policy.

**Acceptance Criteria:**

**Given** one or more functions/files in `src/` exceed a hard threshold
**When** `make lint-metrics` completes
**Then** the script collects ALL hard-fail violations (never fail-fast) and prints a findings table
naming the offending file, the function/closure/class subject, the start line, the metric, the
measured value, and the limit
**And** the same content is written to `GITHUB_STEP_SUMMARY` as Markdown when that env var is set
**And** the gate exits non-zero

**Given** the governed `src/` scope is within policy
**When** `make lint-metrics` completes
**Then** the script prints `rust-code-analysis: all hard checks pass` and a measured-metric summary
table (hard metrics only) reporting the actual measured values against the thresholds
**And** the measured-metric summary is written to `GITHUB_STEP_SUMMARY` when set
**And** the gate exits `0`

**Given** the policy defines review-gate metrics
**When** the script evaluates them
**Then** review-gate metrics are computed but never affect the exit code
**And** review-gate findings are excluded from the stdout violation/summary output

### Story 2.3: `lint-metrics` / `lint-metrics-run` targets and lint-chain registration

As a contributor,
I want `make lint-metrics` and `make lint-metrics-run` targets wired into the aggregate `make lint`
flow,
So that I can run the committed policy locally through one command and a full `make lint` exercises
the gate.

**Acceptance Criteria:**

**Given** the `Makefile` is opened
**When** a contributor inspects the variables and targets
**Then** `RCA_VERSION` (`0.0.25`), `RCA_SCOPE` (`src/`), `RCA_EXCLUDES`, `METRICS_POLICY_PATH`
(`config/metrics-policy.json`), and `RCA_BIN` (`/usr/local/bin/rust-code-analysis-cli`) are defined
once
**And** `lint-metrics` runs `$(DOCKER_COMPOSE) run --rm rca make lint-metrics-run`, forwarding
`GITHUB_STEP_SUMMARY` into the container only when it is set and writable
**And** `lint-metrics-run` exports the `RCA_*` and `METRICS_POLICY` variables and runs
`sh scripts/lint-metrics.sh`
**And** both targets are listed in `.PHONY` and recipes use the Makefile's space recipe-prefix

**Given** the aggregate target is inspected
**When** a contributor reads the `lint:` chain
**Then** it reads
`lint: lint-next lint-tsc lint-md format-check lint-dep-ranges lint-test-structure lint-metrics`
**And** `lint-metrics` runs as part of `make lint` against the same committed policy and scope

**Given** the docker environment
**When** a contributor runs `make lint-metrics` locally
**Then** the gate spins up the ephemeral `rca` container (no `make start`/`make down` required),
analyzes the bind-mounted live `src/` tree, and reports results through the script

## Epic 3: CI Integration & Required Check Details

Pull requests to `main` are automatically evaluated by a dedicated `rust-code-analysis` workflow that
is registered as a required status check after a no-suppression baseline-compliance run, blocking
merges on any threshold breach and keeping local and CI evaluation in parity through the same
`make lint-metrics` target and the same pinned analyzer version.

### Story 3.1: Dedicated `rust-code-analysis` GitHub Actions workflow

As a maintainer,
I want a dedicated workflow that runs `make lint-metrics` on every pull request targeting `main`,
So that the repository enforces complexity policy on all incoming changes with an isolated failure
signal and without manual intervention.

**Acceptance Criteria:**

**Given** a pull request is opened or updated targeting `main`
**When** GitHub Actions evaluates the event
**Then** the `.github/workflows/rust-code-analysis.yml` workflow is triggered
**And** a job named `rust-code-analysis` runs on `ubuntu-latest` with top-level `permissions: {}`,
job-level `permissions: contents: read`, `timeout-minutes: 10`, and a `concurrency` group with
`cancel-in-progress: true`

**Given** the workflow job starts
**When** the "Detect runtime project files" step runs
**Then** it sets a flag only when the project runtime files and `config/metrics-policy.json` are
present
**And** the `make lint-metrics` step is gated on that flag, with a "Skip" step for bootstrap pull
requests
**And** no `make start`/`make down` bracketing is needed because `make lint-metrics` manages its own
ephemeral `rca` container

**Given** the workflow file is committed
**When** the action pins are inspected
**Then** `actions/checkout@v4` is used (TAG-pinned) with `persist-credentials: false`
**And** no `setup-node` step is present

**Given** the docker environment
**When** the workflow runs `make lint-metrics`
**Then** the full governed `src/` scope is evaluated against the committed
`config/metrics-policy.json`
**And** the job exits non-zero and prints the findings table (and writes the step summary) on any
hard-fail violation
**And** the job exits `0` and writes the measured-metric step summary on a clean run

### Story 3.2: Baseline compliance, required check, local/CI parity, and version pinning

As a maintainer,
I want the `rust-code-analysis` workflow registered as a required status check after a
no-suppression baseline run on `main`,
So that pull requests to `main` are blocked until the same committed policy and pinned analyzer
evaluated locally also pass in CI.

**Acceptance Criteria:**

**Given** Epic 1, Epic 2, and Story 3.1 are complete
**When** a maintainer runs `make lint-metrics` against the current `main` branch
**Then** the output is reviewed and the committed thresholds are confirmed to pass, or calibrated to
a passing baseline (with tightening deferred to a later effort)
**And** no suppression/baseline file is introduced to mask findings

**Given** the `.github/workflows/rust-code-analysis.yml` workflow has run at least once on `main`
**When** a maintainer opens branch protection rules for `main`
**Then** `rust-code-analysis` appears as an available status check
**And** it is enabled as a required status check whose name matches the workflow/job exactly

**Given** the required check is enabled
**When** a pull request targeting `main` introduces a function whose metric exceeds a hard threshold
(for example cyclomatic complexity 14 against a limit of 10)
**Then** the `rust-code-analysis` check fails and the PR cannot be merged until it passes
**And** the failure output names the offending file, subject, line, metric, value, and threshold

**Given** the required check is enabled
**When** a contributor runs `make lint-metrics` locally and then opens a clean pull request
**Then** local and CI evaluate the same committed `config/metrics-policy.json`, the same `src/`
scope, and the same pinned `RCA_VERSION` analyzer (referenced once and consumed by both the Makefile
and the image build)
**And** the `rust-code-analysis` check shows as passing and does not block the merge

## Epic 4: Verification & Contributor Documentation Details

The committed policy schema and the enforcement script are covered by automated tests, and
contributors can self-serve to understand what the gate enforces, how to run it locally, and how to
interpret failures and passing summaries.

### Story 4.1: Automated tests for the policy schema and the enforcement script

As a maintainer,
I want automated tests covering the policy schema and the `scripts/lint-metrics.sh` behavior,
So that a malformed policy or a regression in the enforcement script is caught automatically,
consistent with the repository's test conventions.

**Acceptance Criteria:**

**Given** the committed policy and schema
**When** the schema-validity test runs
**Then** it asserts that `config/metrics-policy.json` validates against
`config/metrics-policy.schema.json`
**And** it asserts that a policy with the optional `review` block omitted still validates (the
`hard` block alone is sufficient)
**And** it asserts that any configured review min/max range pair is in a valid order

**Given** the enforcement script
**When** the shell-flow coverage test runs (using the repository's existing shell-coverage harness)
**Then** it asserts the passing path prints the measured-metric summary and the expected `Scope:`
line
**And** it asserts the script fails with a `jq`-missing error when `jq` is unavailable
**And** it asserts the script fails when the analyzer produces no JSON output objects
**And** it asserts the script fails with a schema error (for example `non-object section: hard: got
number`) on a malformed policy

### Story 4.2: Contributor documentation for the metrics gate

As a contributor,
I want repository documentation explaining what `rust-code-analysis` enforces, how to run it locally,
and how to read its output,
So that I can use the complexity gate as part of my normal workflow without interpreting raw tool
internals.

**Acceptance Criteria:**

**Given** a contributor opens `CONTRIBUTING.md`
**When** they look for information about the metrics gate
**Then** a new section (adjacent to the existing `### Dependency version ranges` /
`### Test directory layout` policy sections) explains what `rust-code-analysis` enforces — the
hard-fail metric families (per-function/closure, per-file, class/interface) and the review-gate
metrics — in plain language
**And** it states the governed `src/` scope and the no-suppression nature of the gate

**Given** a contributor wants to run the check locally
**When** they follow the documentation
**Then** `make lint-metrics` is documented as the single command to run
**And** the documentation references `make lint-metrics`, not the raw `rust-code-analysis-cli`
invocation
**And** no additional setup beyond the repository's existing Docker workflow is required

**Given** a contributor's run produces violations or passes
**When** they read the documentation
**Then** the failure findings-table format (file, subject, line, metric, value, threshold) and the
passing measured-metric summary are explained
**And** guidance on remediating common violations (over-complex functions, oversized files, too many
arguments/exit points) is present

**Given** the documentation is reviewed
**When** a contributor reads the scope notes
**Then** IDE/editor integration is explicitly noted as out of scope
**And** `README.md` carries a brief mention of the metrics gate that points to `CONTRIBUTING.md`
