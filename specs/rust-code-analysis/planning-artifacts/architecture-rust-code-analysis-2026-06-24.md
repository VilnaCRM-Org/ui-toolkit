---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-06-24'
inputDocuments:
  - 'specs/rust-code-analysis/planning-artifacts/prd-rust-code-analysis-2026-06-24.md'
workflowType: 'architecture'
project_name: 'ui-toolkit'
user_name: 'platform-team'
date: '2026-06-24T13:00:00+02:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as
we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The PRD defines 24 functional requirements across nine capability areas: analyzer provisioning
(FR1-FR2), policy definition & validation (FR3-FR5), enforcement engine (FR6-FR9), make targets &
local execution (FR10-FR12), quality-gate enforcement (FR13-FR16), CI results reporting
(FR17-FR18), repository policy consistency (FR19-FR20), baseline compliance & verification
(FR21-FR22), and contributor documentation (FR23-FR24). Architecturally, this is a repository
workflow initiative rather than an application-runtime feature. The solution must supply a native
analyzer binary without a host install, own a committed and schema-validated threshold policy, run
one reproducible local execution path (`make lint-metrics`), run one CI execution path (a dedicated
pull-request workflow), produce clear success summaries and actionable failure diagnostics, and
document the gate within the normal contributor workflow.

**Non-Functional Requirements:**
The main architectural drivers are reliability, consistency, usability, and supply-chain safety. The
design must produce stable pass/fail outcomes for the same code, policy, and pinned analyzer version;
keep local and CI evaluations materially aligned against the same committed policy and governed
scope; make both successful summaries and failure output understandable without raw tool-internal
interpretation; and pin and integrity-verify the analyzer binary. Performance must be operationally
acceptable for routine pull-request use inside the dockerized `rca` service, with no fixed numeric
runtime target imposed by the PRD.

**Scale & Complexity:**
This is a low-complexity architectural initiative with medium operational sensitivity. It is a
single-slice repository change centered on one required CI check and one local execution path, but
it affects every pull request in the governed `src/` scope and blocks merges on threshold breaches.

- Primary domain: developer tooling / CI governance
- Complexity level: low
- Operational sensitivity: medium
- Estimated architectural components: 6-7 (rca service image, compose service, policy JSON, policy
  schema, enforcement script, make targets, CI workflow, docs)

### Technical Constraints & Dependencies

The architecture must respect existing repository conventions. `make` is the local entry point for
all quality commands, and `package.json` is intentionally script-free, so the gate must be a Makefile
target rather than an npm/bun script. Most lint targets run through the docker-compose `bun` service
via `bun x`, but `rust-code-analysis-cli` is a native (Rust) binary, not a Bun/Node tool — so it
cannot run through `bun x` and must be provisioned through a dedicated dockerized service with the
binary pre-installed. The repository enforces an **Alpine base-image policy** (`### Docker base-image
policy (Alpine)`), checked by `scripts/ci/alpine_base_guard.sh scan` and the `alpine base guard`
workflow on every `Dockerfile`/`Dockerfile.<suffix>`: any non-Alpine base is default-denied unless it
carries an inline `# alpine-exception: <reason>` marker (today only `Dockerfile.playwright` carries
one, because its browser base is glibc-only). `rust-code-analysis-cli`'s prebuilt releases are
glibc-only as well, so a CRM-parity Debian image for the analyzer must carry the same documented
exception (see Decision 1). The repository's docker-compose exposes no host ports and uses the
default `ui-toolkit_default` network; the `bun`/`storybook` services build from the root `Dockerfile`
(`oven/bun:1.3.14-alpine`) and `playwright` builds from `Dockerfile.playwright`. The aggregate lint
target today is `lint: lint-next lint-tsc lint-md format-check lint-dep-ranges lint-test-structure`
(the `dependency-cruiser` gate of issue #58 is a sibling effort and is **not** present in this tree).
The Makefile sets `.RECIPEPREFIX += ` so recipes are space-indented, not tab-indented. CI workflows
use TAG-pinned actions, least-privilege permissions, no `setup-node`, and a "Detect runtime project
files" gate that keeps a workflow inert on bootstrap pull requests.

### Cross-Cutting Concerns Identified

- Native-binary provisioning without a host install or a Rust toolchain in the `bun` image
- Alpine base-image policy compliance for the analyzer image (documented exception)
- Policy consistency across local (`make lint-metrics`) and CI execution
- Schema validation of the committed policy before any threshold is read
- Governed-scope definition (`src/`) and exclusion handling for assets, declarations, and generated dirs
- Required-check integration with the pull-request workflow targeting `main`
- Collect-all-then-fail enforcement and a no-suppression baseline before blocking
- Human-readable success summaries and actionable failure diagnostics (file + subject + line + metric)
- Supply-chain safety: pinned, integrity-verified analyzer; hardened workflow permissions
- Contributor adoption through clear documentation and a stable `make` command path

## Starter Template Evaluation

### Primary Technology Domain

Brownfield repository workflow / CI automation inside an existing React 19 + MUI 9 component library
published as `@vilnacrm/ui-toolkit`, built and linted through Bun in a docker-compose service.

This is not a greenfield application bootstrap decision. The architectural foundation already exists
in the `ui-toolkit` repository, and the gate it must mirror already ships in the sibling
`VilnaCRM-Org/crm` repository (`config/metrics-policy.json` + schema, `scripts/lint-metrics.sh`, a
dedicated `rca` docker service, `lint-metrics`/`lint-metrics-run` targets, and a
`rust-code-analysis.yml` workflow). The relevant question is how to integrate that shipped CRM design
into ui-toolkit's `Makefile`, docker-compose setup, Alpine base-image policy, and GitHub Actions
house style.

### Existing Technical Preferences Identified

- `make` is the local developer entry point for all quality and workflow commands.
- `package.json` intentionally has no `scripts`; the Makefile is the command source of truth.
- The docker-compose `bun` service runs Bun/Node lint targets via `bun x`; native binaries need a
  dedicated service.
- Every Dockerfile must use an Alpine base unless it carries an `# alpine-exception:` marker.
- docker-compose exposes no host ports; `playwright` is the precedent for a dedicated
  `Dockerfile.<tool>` per service.
- GitHub Actions is the CI orchestration layer; testing workflows use TAG-pinned actions
  (`actions/checkout@v4`), least-privilege permissions, no `setup-node`, and a runtime-detection gate.
- The hardened workflow shape (`bats-testing.yml`) uses top-level `permissions: {}`, job-level
  `contents: read`, `timeout-minutes`, and `actions/checkout@v4` with `persist-credentials: false`.

### Foundation Options Considered

#### Option 1: Port the shipped CRM rust-code-analysis design (config-file policy + script + rca service)

Mirror CRM's shipped implementation: committed `config/metrics-policy.json` + schema, a
`scripts/lint-metrics.sh` enforcement script, a dedicated dockerized `rca` service with the pinned
binary pre-installed, and `lint-metrics`/`lint-metrics-run` targets — adapted to ui-toolkit's
conventions (Alpine policy, no host ports, hardened workflow).

**What it gives us:**

- Direct tooling-parity with CRM (the explicit goal of issue #59)
- A single committed, schema-validated policy source rather than thresholds buried in a Makefile recipe
- A native-binary-friendly execution model (dedicated service) that does not pollute the `bun` image
- A proven enforcement script (collect-all-then-fail, robustness to tool quirks, step-summary output)

#### Option 2: Inline thresholds in the Makefile recipe (CRM's earlier planning design)

CRM's original 2026-03 planning artifacts kept thresholds inline in the `lint-metrics` recipe and
downloaded the binary to a gitignored `./bin/` with `actions/cache`.

**Trade-offs:**

- Thresholds inline in a recipe are harder to validate, diff, and reuse than a committed JSON policy
- A host-downloaded binary needs a Rust toolchain or a glibc runner and is not how CRM actually
  shipped; it diverges from the issue's "validated against its JSON schema" acceptance criterion
- CRM itself superseded this design with the config-file + script + rca-service approach

### Selected Foundation: Port the shipped CRM design (Option 1)

**Rationale for Selection:**

Option 1 is selected. It mirrors what CRM actually ships and what issue #59 explicitly requests
(`config/metrics-policy.json` + schema, `scripts/lint-metrics.sh`, `lint-metrics`/`lint-metrics-run`
targets, a dedicated Docker-based workflow). It keeps the threshold policy in one committed,
schema-validated source; isolates the native analyzer in a dedicated service so the `bun` image stays
lean; and reuses CRM's proven enforcement script behavior. The cost — a new `config/` directory and a
new analyzer image — is outweighed by parity, validatability, and a clean native-binary execution
model. The port adapts CRM to ui-toolkit's Alpine base-image policy (documented exception), no-host-port
convention, and hardened workflow shape.

### Initialization Command

```bash
# No new starter initialization command applies.
# This is a brownfield extension of the existing ui-toolkit repository foundation.
```

### Architectural Decisions Provided by Selected Foundation

**Language & Runtime:**

- Preserve the current Bun/Node docker-compose toolchain for existing gates.
- Provision `rust-code-analysis-cli` as a pinned native binary inside a dedicated `rca` service image,
  invoked through `make`, not through `bun x`.

**Governed Scope Baseline:**

- The enforced gate governs the `src/` tree (TypeScript/TSX under `src/components/` and `src/types/`).
- Excluded: `node_modules`, `build`, `coverage`, `storybook-static`, the repository `tests/` tree,
  non-code assets (`src/assets/**`), and TypeScript declaration files (`*.d.ts`). The empty
  `src/{hooks,lib,providers,routes,stores,utils}` placeholders carry no findings.

**Build Tooling:**

- Add `lint-metrics` and `lint-metrics-run` Makefile targets rather than `package.json` scripts.
- Keep `make` as the contributor-facing command source of truth; CI calls the same target.
- Keep local and CI invocation aligned through the same committed policy and pinned analyzer version.

**Quality Integration:**

- Add a dedicated `rust-code-analysis.yml` workflow and append `lint-metrics` to the aggregate `lint`
  target so `make lint` exercises the gate locally.
- Use the workflow job logs plus `GITHUB_STEP_SUMMARY` as the reporting surface.

**Code Organization:**

- Centralize the threshold policy in `config/metrics-policy.json`, contracted by
  `config/metrics-policy.schema.json`, and the enforcement logic in `scripts/lint-metrics.sh`.
- No suppression/baseline file; the policy is the only knob.

**Development Experience:**

- Contributors gain one `make lint-metrics` entry point for local validation, folded into `make lint`.
- The `rca` service bind-mounts the working tree so local runs analyze live source, not a baked image.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Analyzer provisioning & version — required before any analysis can run
- Policy & schema file design — required before thresholds exist to enforce
- Governed metrics & thresholds — required before the policy can fail anything meaningfully
- Enforcement script design — required before CI/local can invoke the gate

**Important Decisions (Shape Architecture):**

- Make target design — determines local/CI parity and the invocation contract
- CI job structure — determines failure-signal granularity in PR checks
- Reporting format — determines contributor experience on success and failure

**Deferred Decisions (Post-MVP):**

- Threshold tightening toward stricter "target" values — out of scope per PRD; reassess after the
  gate proves stable against the committed baseline

### Decision 1: Analyzer Provisioning & Version

- **Strategy:** Provision `rust-code-analysis-cli` through a dedicated dockerized `rca` service whose
  image pre-installs the binary at a pinned version — mirroring CRM. Add a new `Dockerfile.rca`
  (following the `Dockerfile.playwright` dedicated-image precedent) and an `rca` service in
  `docker-compose.yml`. Do **not** vendor a host binary or add a Rust toolchain to the `bun` image.
- **Version:** `RCA_VERSION = 0.0.25` (matching CRM). The canonical pin lives in the Makefile (as
  `RCA_VERSION` and `RCA_SHA256`) and is propagated to the image build through the compose service's
  `build.args` (environment interpolation); the `Dockerfile.rca` `ARG` defaults mirror them only as a
  fallback for a standalone `docker build` and must be kept in sync with the Makefile.
- **Image & integrity:** On the prebuilt-release platform (`amd64`), download Mozilla's
  `rust-code-analysis-linux-cli-x86_64.tar.gz` for `v0.0.25` and verify it against the pinned SHA-256
  (`9ec2a217b8ff191e02dab5d5f2eee6158b63fd975c532b2c5d67c2e6c7249894`) before extracting to
  `/usr/local/bin`. On other platforms (`arm64`), build with `cargo install --locked --version 0.0.25
rust-code-analysis-cli`. The image also installs `jq`, `make`, and `tar` for the enforcement script,
  and pins its base to the AWS ECR Docker mirror (matching CRM) to avoid Docker Hub rate limits.

  ```dockerfile
  # Dockerfile.rca — rust-code-analysis toolchain image for the metrics gate.
  # alpine-exception: rust-code-analysis-cli ships glibc-only prebuilt releases
  # (no Alpine/musl variant); building on musl would require the full Rust toolchain.
  FROM public.ecr.aws/docker/library/debian:12-slim

  ARG RCA_VERSION=0.0.25
  ARG RCA_SHA256=9ec2a217b8ff191e02dab5d5f2eee6158b63fd975c532b2c5d67c2e6c7249894
  ARG TARGETARCH

  SHELL ["/bin/sh", "-c"]
  RUN set -eux; \
      apt-get update; \
      apt-get install -y --no-install-recommends ca-certificates jq make tar; \
      if [ "${TARGETARCH}" = "amd64" ]; then \
        apt-get install -y --no-install-recommends curl; \
      else \
        apt-get install -y --no-install-recommends build-essential cargo; \
      fi; \
      rm -rf /var/lib/apt/lists/*; \
      if [ "${TARGETARCH}" = "amd64" ]; then \
        url="https://github.com/mozilla/rust-code-analysis/releases/download/v${RCA_VERSION}/rust-code-analysis-linux-cli-x86_64.tar.gz"; \
        curl --retry 5 --retry-delay 2 -fsSL "$url" -o /tmp/rca.tar.gz; \
        printf '%s  %s\n' "${RCA_SHA256}" /tmp/rca.tar.gz | sha256sum -c -; \
        tar -xz -C /usr/local/bin -f /tmp/rca.tar.gz; \
      else \
        cargo install --locked --version "${RCA_VERSION}" rust-code-analysis-cli --root /usr/local; \
      fi; \
      chmod +x /usr/local/bin/rust-code-analysis-cli; \
      /usr/local/bin/rust-code-analysis-cli --version; \
      rm -f /tmp/rca.tar.gz
  ENV RCA_BIN=/usr/local/bin/rust-code-analysis-cli
  WORKDIR /app
  ```

  ```yaml
  # docker-compose.yml — new service (no host ports; source bind-mounted so the
  # gate analyzes the live working tree, not a baked image).
  rca:
    profiles: [tools]
    build:
      context: .
      dockerfile: Dockerfile.rca
      args:
        RCA_VERSION: ${RCA_VERSION:-0.0.25}
        RCA_SHA256: ${RCA_SHA256:-9ec2a217b8ff191e02dab5d5f2eee6158b63fd975c532b2c5d67c2e6c7249894}
    volumes:
      - .:/app
  ```

- **Alpine-policy compliance:** Because `debian:12-slim` is non-Alpine, `Dockerfile.rca` MUST carry an
  inline `# alpine-exception: <reason>` marker (shown above). This mirrors the existing
  `Dockerfile.playwright` exception and is required for `alpine_base_guard.sh scan` (and the `alpine
base guard` workflow) to pass on this gate's own pull request. The alternative — an Alpine image that
  `cargo install`s the CLI for musl — was considered and rejected as the primary path because it
  compiles the analyzer from source on every image build (slow) and adds a heavy Rust build toolchain;
  the documented exception is the lighter, CRM-faithful choice.
- **Bind-mount rationale:** Unlike the `bun` service (a baked `COPY . .` image), the `rca` service
  bind-mounts `.:/app`, so `make lint-metrics` analyzes the contributor's live source rather than a
  stale image. The service uses `profiles: [tools]` so it never starts on a default `make start`, and
  exposes no host ports and needs no network access at analysis time.
- **Affects:** `Dockerfile.rca` (new), `docker-compose.yml` (new `rca` service).

### Decision 2: Policy & Schema File Design

- **Strategy:** Commit the threshold policy as `config/metrics-policy.json` and its contract as
  `config/metrics-policy.schema.json`. This introduces a new top-level `config/` directory (no
  precedent today; existing policy data lives in TS modules such as
  `scripts/ci/dependency-range-policy.ts`), chosen for CRM parity and because the issue dictates these
  exact paths.
- **Policy structure (`config/metrics-policy.json`):** A JSON object with a required `hard` block (the
  hard-fail thresholds that block CI) and an optional `review` block (computed but non-blocking). The
  policy is seeded from CRM's shipped values and confirmed/calibrated by the baseline run (Decision 3):

  ```json
  {
    "hard": {
      "cyclomatic_max": 10,
      "cognitive_max": 15,
      "abc_magnitude_max": 17,
      "nargs_function_max": 3,
      "nargs_closure_max": 3,
      "nexits_max": 3,
      "lloc_function_max": 10,
      "ploc_function_max": 40,
      "sloc_function_max": 45,
      "halstead_volume_function_max": 1000,
      "halstead_bugs_function_max": 0.35,
      "nom_functions_file_max": 10,
      "nom_closures_file_max": 6,
      "nom_total_file_max": 15,
      "lloc_file_max": 120,
      "ploc_file_max": 300,
      "sloc_file_max": 350,
      "halstead_volume_file_max": 8000,
      "halstead_bugs_file_max": 1.58,
      "mi_visual_studio_min": 20,
      "class_wmc_max": 30,
      "class_npm_max": 8,
      "class_npa_max": 2,
      "class_coa_max": 0.6,
      "class_cda_max": 0.25,
      "interface_npm_max": 10,
      "interface_npa_max": 15
    },
    "review": {
      "mi_original_min": 65,
      "mi_sei_min": 65,
      "cloc_ratio_min": 0.1,
      "cloc_ratio_max": 0.6,
      "blank_ratio_min": 0.02,
      "blank_ratio_max": 0.3
    }
  }
  ```

  The `review` block above is abbreviated; the committed policy carries CRM's full review set
  (per-function and per-file Halstead operand/operator detail — `n1`, `N1`, `n2`, `N2`, length,
  estimated length, vocabulary, difficulty, level [min], effort, time, purity-ratio [range]). Every
  `review` threshold also has a hardcoded fallback default inside `scripts/lint-metrics.sh`, so an
  omitted `review` block still works.

- **Schema (`config/metrics-policy.schema.json`):** Draft-07, `$id: "metrics-policy.schema.json"`,
  `type: object`, `required: ["hard"]`, `additionalProperties: false`, with `hard` and `review`
  sub-objects. `hard` is `additionalProperties: false` and `required` lists all 27 hard keys, each a
  `number` with bound constraints (count/size `*_max` keys `minimum: 1`; the Halstead `*_max` keys —
  including `halstead_bugs_file_max` (1.58) — `minimum: 0` with no upper bound; the COA/CDA ratio keys
  `class_coa_max`/`class_cda_max` `minimum: 0, maximum: 1`; `mi_visual_studio_min` `minimum: 0,
maximum: 100`). `review` is `additionalProperties:
false` with no `required` list (the entire block is optional).
- **Governed scope & exclusions (committed via the Makefile variables, Decision 5):** scope `src/`;
  excludes `**/node_modules/** **/build/** **/coverage/** **/storybook-static/** **/tests/** **/*.d.ts
**/src/assets/**`. Storybook `*.stories.tsx` files remain in scope unless the baseline run shows they
  dominate noise.
- **Rationale:** A committed JSON policy validated by a committed schema satisfies the issue's
  acceptance criterion ("thresholds sourced from a committed `config/metrics-policy.json` validated
  against its JSON schema") and is diffable, reusable, and testable in a way an inline-Makefile policy
  is not.
- **Affects:** `config/metrics-policy.json` (new), `config/metrics-policy.schema.json` (new).

### Decision 3: Governed Metrics & Thresholds

The gate governs the following metric families. All `hard` thresholds block CI; `review` thresholds
are computed but never block (Decision 4 / FR8). `*_max` is an upper bound (fail if exceeded);
`*_min` is a lower bound (fail if below).

<!-- markdownlint-disable MD013 -->

| Scope            | Metric (policy key)                                                                                | Gate   | JSON path in `rust-code-analysis-cli` v0.0.25 output                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| function/closure | `cyclomatic_max`, `cognitive_max`                                                                  | hard   | `.metrics.cyclomatic.sum`; `.metrics.cognitive.sum` (or scalar)                                                                            |
| function/closure | `abc_magnitude_max`                                                                                | hard   | `.metrics.abc.magnitude`                                                                                                                   |
| function/closure | `nargs_function_max`, `nargs_closure_max`                                                          | hard   | `.metrics.nargs.functions_max`; `.metrics.nargs.closures_max`                                                                              |
| function/closure | `nexits_max`                                                                                       | hard   | `.metrics.nexits.average`                                                                                                                  |
| function/closure | `lloc_function_max`, `ploc_function_max`, `sloc_function_max`                                      | hard   | `.metrics.loc.lloc` / `.ploc` / `.sloc`                                                                                                    |
| function/closure | `halstead_volume_function_max`, `halstead_bugs_function_max`                                       | hard   | `.metrics.halstead.volume` / `.bugs`                                                                                                       |
| file             | `nom_functions_file_max`, `nom_closures_file_max`, `nom_total_file_max`                            | hard   | `.metrics.nom.functions` / `.closures` (total = functions + closures)                                                                      |
| file             | `lloc_file_max`, `ploc_file_max`, `sloc_file_max`                                                  | hard   | `.metrics.loc.lloc` / `.ploc` / `.sloc`                                                                                                    |
| file             | `halstead_volume_file_max`, `halstead_bugs_file_max`                                               | hard   | `.metrics.halstead.volume` / `.bugs`                                                                                                       |
| file             | `mi_visual_studio_min`                                                                             | hard   | `.metrics.mi.mi_visual_studio` (tolerant of legacy `.metrics.maintanability_index`)                                                        |
| class            | `class_wmc_max`, `class_npm_max`, `class_npa_max`, `class_coa_max`, `class_cda_max`                | hard   | `.metrics.wmc.classes_sum`; `.metrics.npm.classes`; `.metrics.npa.classes`; `.metrics.npm.classes_average`; `.metrics.npa.classes_average` |
| interface        | `interface_npm_max`, `interface_npa_max`                                                           | hard   | `.metrics.npm.interfaces`; `.metrics.npa.interfaces`                                                                                       |
| function & file  | `mi_original_min`, `mi_sei_min`, `cloc_ratio` (range), `blank_ratio` (range), full Halstead detail | review | `.metrics.mi.*`; derived `cloc/sloc`, `blank/sloc`; `.metrics.halstead.*`                                                                  |

<!-- markdownlint-enable MD013 -->

- **Threshold source:** The committed values are seeded from CRM's shipped `config/metrics-policy.json`
  (the `hard` block above). They are a starting baseline, not final target values.
- **v0.0.25 caveats (carried forward from CRM):**
  - **Maintainability-index key spelling.** v0.0.25 emits the parent key misspelled as
    `maintanability_index` in some builds; the script reads `.metrics.mi // .metrics.maintanability_index`
    tolerantly.
  - **OOP metrics for TS.** `class_*`/`interface_*` (WMC/NPM/NPA/COA/CDA) are Java-oriented in v0.0.25
    and are frequently zero or absent for TypeScript. The baseline run must confirm which produce
    meaningful values for this TSX codebase; null-safe comparisons (Decision 4) ensure absent metrics
    never fabricate violations.
  - **Derived ratios.** `cloc_ratio` and `blank_ratio` are derived (`cloc/sloc`, `blank/sloc`) and are
    kept as review-gate (range-band) metrics, not hard-fail, until validated against this codebase.
  - **CRM-faithful extraction.** Two field choices mirror the shipped CRM script rather than the
    analyzer's most obvious field: `nexits_max` is enforced against `.metrics.nexits.average` (v0.0.25
    does not expose a per-space exit max), and `nom_total_file_max` is enforced against
    `nom_functions + nom_closures` (CRM derives the total rather than reading a native
    `.metrics.nom.total`). Keep these as CRM does for parity; the baseline run confirms they behave on
    this codebase.
- **Baseline calibration:** Run `make lint-metrics` against current `main` before enabling the required
  check. If real code breaches a committed `hard` threshold, either remediate the code or raise that
  threshold to a passing baseline and defer tightening to a later effort — never introduce a
  suppression file.
- **Rationale:** Porting CRM's policy gives immediate parity and a sensible industry-average starting
  point; the baseline run prevents the gate from failing the tree wholesale on first introduction.
- **Affects:** `config/metrics-policy.json`, `scripts/lint-metrics.sh` (metric extraction).

### Decision 4: Enforcement Script Design

- **File:** `scripts/lint-metrics.sh` — POSIX `sh`, `set -eu`. (Lives at `scripts/` to match the CRM
  path exactly and the `scripts/check-test-structure.sh` shell-gate precedent.)
- **Preconditions (each fails with a clear stderr error and exit 1):** `jq` present in `PATH`;
  `RCA_BIN` set and executable; `METRICS_POLICY` set, present, and valid JSON;
  `METRICS_POLICY_SCHEMA` (default `config/metrics-policy.schema.json`) present and valid JSON;
  `RCA_SCOPE` (default `src/`) and `RCA_EXCLUDES` set.
- **Schema self-validation:** Before reading any threshold, the script validates the committed policy
  against the committed schema **inline in `jq`** (not via `ajv`) — emitting errors for unknown/missing
  keys, non-object sections (`non-object section: <k>: got <type>`), non-numeric values, and
  out-of-bound values — and exits 1 on any. This makes the runtime gate self-contained.
- **Analysis invocation:** `"$RCA_BIN" -m -O json -p "$RCA_SCOPE"` with one `-X <glob>` per word in
  `RCA_EXCLUDES` (`set -f`/`set +f` around the loop for glob safety), capturing per-file JSON (each
  file object carries a nested `spaces[]` array of functions/closures). The script guards against empty
  or non-object analyzer output.
- **Evaluation (collect-all-then-fail):** A single `jq` pass over the analyzer output emits
  pipe-delimited rows `SEVERITY|file|scope|subject|line|metric|value|limit`, recursing into `spaces[]`
  for function/closure rows and reading file-level metrics for file rows. Helpers: `gt` (value > max),
  `lt` (value < min, null-skipped), `range` (outside min..max, null-skipped), `ratio(num;den)`
  (guards division by zero), and a `number_or_null` that handles `cognitive` as object `{.sum}` or
  scalar. The script collects **all** findings, never fails fast, and exits 1 if any row is `FAIL`
  (else 0). `review`-severity rows are computed but never affect the exit code and are excluded from
  the stdout summary (FR8).
- **Robustness (FR9):** tolerant key reading (the `mi`/`maintanability_index` spelling; cognitive
  object-or-scalar), null-safe `lt`/`range` (absent metrics are skipped, not failed), and division
  guards for derived ratios. Every `review` threshold has a hardcoded fallback default matching the
  policy, so an omitted `review` block still works.
- **Rationale:** A committed script keeps the (non-trivial) enforcement logic versioned, testable, and
  identical locally and in CI, and isolates all tool-quirk handling in one place.
- **Affects:** `scripts/lint-metrics.sh` (new).

### Decision 5: Make Target Design

- **Targets:** `lint-metrics` (the docker-driven entry point) and `lint-metrics-run` (the in-container
  invocation). Variables are pinned once at the top of the Makefile.
- **Variables:**

  ```makefile
  RCA_VERSION         = 0.0.25
  RCA_SHA256          = 9ec2a217b8ff191e02dab5d5f2eee6158b63fd975c532b2c5d67c2e6c7249894
  RCA_SCOPE           = src/
  RCA_EXCLUDES        = **/node_modules/** **/build/** **/coverage/** **/storybook-static/** **/tests/** **/*.d.ts **/src/assets/**
  METRICS_POLICY_PATH = config/metrics-policy.json
  RCA_BIN             = /usr/local/bin/rust-code-analysis-cli
  export RCA_VERSION RCA_SHA256   # exported so docker compose build.args can interpolate the canonical pin
  ```

- **Recipes** (recipes in this Makefile are **space-indented** because `.RECIPEPREFIX += `; the
  `lint-metrics` recipe forwards `GITHUB_STEP_SUMMARY` into the container only when it is set and
  writable, mirroring CRM):

  ```makefile
  lint-metrics: ## Run the rust-code-analysis complexity/metrics gate inside the dockerized rca service.
      @summary_path="$$GITHUB_STEP_SUMMARY"; \
      if [ -n "$$summary_path" ] && { { [ -e "$$summary_path" ] && [ ! -d "$$summary_path" ] && [ -w "$$summary_path" ]; } || { [ ! -e "$$summary_path" ] && [ -w "$$(dirname "$$summary_path")" ]; }; }; then \
          : > "$$summary_path" 2>/dev/null || touch "$$summary_path"; \
          $(DOCKER_COMPOSE) run --rm --build -e GITHUB_STEP_SUMMARY="$$summary_path" -v "$$summary_path:$$summary_path" rca make lint-metrics-run; \
      else \
          $(DOCKER_COMPOSE) run --rm --build rca make lint-metrics-run; \
      fi

  lint-metrics-run: ## In-container metrics invocation (rca image has the binary pre-installed).
      @RCA_BIN="$(RCA_BIN)" RCA_VERSION="$(RCA_VERSION)" RCA_SCOPE="$(RCA_SCOPE)" \
          RCA_EXCLUDES="$(RCA_EXCLUDES)" METRICS_POLICY="$(METRICS_POLICY_PATH)" \
          sh scripts/lint-metrics.sh
  ```

- **Integration:** Register both targets in `.PHONY` and append `lint-metrics` to the aggregate `lint`
  target:

  ```makefile
  lint: lint-next lint-tsc lint-md format-check lint-dep-ranges lint-test-structure lint-metrics
  ```

- **Rationale:** `lint-metrics` runs `$(DOCKER_COMPOSE) run --rm --build rca` (an ephemeral container,
  rebuilt if the pin or `Dockerfile.rca` changed — matching the `--build` convention of `test-bats` and
  `test-e2e-local`; no `make start`/`make down` needed because it does not use the persistent `bun`
  service), and delegates to `lint-metrics-run` inside the container where the binary and `jq` exist and
  the source is bind-mounted.
  Pinning the variables once keeps local and CI identical. Appending to `lint` means `make lint`
  exercises the gate.
- **Affects:** `Makefile` (variables, `.PHONY`, two targets, `lint:` chain).

### Decision 6: CI Job Structure

- **Approach:** New dedicated workflow `.github/workflows/rust-code-analysis.yml`.
- **Trigger:** `pull_request` targeting `main` (mirrors `static-testing.yml`).
- **Permissions:** top-level `permissions: {}`; job-level `permissions: contents: read` (hardened
  shape, per `bats-testing.yml`).
- **Hardening:** `concurrency` group `rca-${{ github.ref }}` with `cancel-in-progress: true`;
  `timeout-minutes: 10`; `actions/checkout@v4` (TAG-pinned, per house style and the issue) with
  `persist-credentials: false`; no `setup-node`.
- **Runtime-detection gate:** a "Detect runtime project files" step sets `present=true` only when the
  project runtime files and the metrics policy are present, gating the gate step and providing a "Skip"
  step for bootstrap pull requests.
- **No `make start`/`make down`:** unlike `static-testing.yml`, the metrics workflow does not bracket
  with `make start`/`make down` because `make lint-metrics` manages its own ephemeral `rca` container.

  ```yaml
  name: rust-code-analysis

  on:
    pull_request:
      branches:
        - main

  permissions: {}

  concurrency:
    group: rca-${{ github.ref }}
    cancel-in-progress: true

  jobs:
    rust-code-analysis:
      runs-on: ubuntu-latest
      timeout-minutes: 10
      permissions:
        contents: read
      steps:
        - name: Checkout code
          uses: actions/checkout@v4
          with:
            persist-credentials: false

        - name: Detect runtime project files
          id: project
          run: |
            if [[ -f package.json && -f bun.lock && -f config/metrics-policy.json ]]; then
              echo "present=true" >> "$GITHUB_OUTPUT"
            else
              echo "present=false" >> "$GITHUB_OUTPUT"
            fi

        - name: Skip code metrics gate
          if: steps.project.outputs.present != 'true'
          run: echo "Skipping rust-code-analysis because this bootstrap PR does not include the metrics policy yet."

        - name: Run code metrics gate
          if: steps.project.outputs.present == 'true'
          run: make lint-metrics
  ```

- **Required check:** Registered as a required status check in branch protection for PRs to `main`; the
  check name matches the workflow/job name `rust-code-analysis`.
- **Rationale:** A dedicated workflow isolates the complexity-gate failure signal (independent of
  style/type/markdown gates), mirrors CRM's dedicated `rust-code-analysis.yml`, and yields independent
  job history that is easy to register as a required check and to tune.
- **Affects:** `.github/workflows/rust-code-analysis.yml` (new file).

### Decision 7: Reporting Format

- **Primary (stdout):** On a clean run, the script prints `rust-code-analysis: all hard checks pass`
  followed by a fixed-width measured-metric table (`METRIC GATE THRESHOLD MEASURED`, hard rows only)
  and a `Scope:` line. On a failing run, it prints `rust-code-analysis: N hard violation(s) found`,
  the measured-metric table, and a `Violations:` findings table (`GATE FILE SCOPE SUBJECT LINE METRIC
VALUE LIMIT`) listing only `FAIL` rows, then exits 1.
- **Secondary (`GITHUB_STEP_SUMMARY`):** When the env var is set (CI), the script appends a Markdown
  summary — on success a measured-metric table (`| Metric | Gate | Threshold | Measured |`), on failure
  a violation table (`| Gate | File | Scope | Subject | Line | Metric | Value | Limit |`). The Makefile
  mounts the host summary file into the `rca` container (Decision 5); locally the var is unset and the
  summary write is simply skipped.
- **Collect-all-then-fail:** every violation surfaces in one run; the gate never fails fast.
- **No suppression:** there is no baseline/ignore file; the committed policy is the only knob.
- **Rationale:** stdout tables give immediate local actionability (file + subject + line + metric +
  value + limit), and the step summary surfaces the same in the PR checks tab — both without extra
  formatting setup and without exposing raw analyzer JSON.
- **Affects:** `scripts/lint-metrics.sh` reporting logic; `lint-metrics` recipe (summary mount).

### Decision Impact Analysis

**Implementation Sequence:**

1. Add `Dockerfile.rca` (with the `# alpine-exception:` marker) and the `rca` docker-compose service
   (`profiles: [tools]`, bind-mount, no ports).
2. Commit `config/metrics-policy.json` and `config/metrics-policy.schema.json`.
3. Author `scripts/lint-metrics.sh` (preconditions, inline schema validation, analysis,
   collect-all-then-fail, review non-blocking, robustness, reporting).
4. Add `RCA_*`/`METRICS_POLICY_PATH` variables and the `lint-metrics` + `lint-metrics-run` targets;
   register in `.PHONY`; append `lint-metrics` to the `lint:` chain.
5. Run `make lint-metrics` against current `main`; confirm or calibrate thresholds to a passing
   baseline (no suppression file).
6. Add automated tests (schema validity + script shell-flow coverage) per repo conventions.
7. Create `.github/workflows/rust-code-analysis.yml` (PR → main, hardened, runtime-detection gate).
8. Register the workflow as a required status check in branch protection for `main`.
9. Document the gate in `CONTRIBUTING.md` and `README.md`.

**Cross-Component Dependencies:**

- `scripts/lint-metrics.sh` depends on `config/metrics-policy.json` and `config/metrics-policy.schema.json`.
- `lint-metrics-run` depends on the `rca` image having the binary + `jq` + `make` and the source
  bind-mounted at `/app`.
- `lint-metrics` depends on the `rca` docker-compose service and the `GITHUB_STEP_SUMMARY` env handling.
- The aggregate `lint` target depends on `lint-metrics` being exit-code-correct.
- `rust-code-analysis.yml` depends on `make lint-metrics` and the runtime-detection gate.
- `Dockerfile.rca` depends on the pinned `RCA_VERSION`/`RCA_SHA256` and the `alpine_base_guard` exception.
- The branch-protection required-check name must match the workflow/job name exactly.

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

Seven areas where implementing agents could diverge — all locked below.

### Naming Patterns

- **Make targets:** `lint-metrics` and `lint-metrics-run` (exactly).
- **Workflow file/job:** `.github/workflows/rust-code-analysis.yml`, job name `rust-code-analysis`.
- **Policy files:** `config/metrics-policy.json` and `config/metrics-policy.schema.json`.
- **Enforcement script:** `scripts/lint-metrics.sh`.
- **Analyzer image:** `Dockerfile.rca`; docker-compose service `rca`.
- **Version variable:** `RCA_VERSION` (single source).
- **Required-check name:** must match the workflow/job name `rust-code-analysis` exactly.

### Structure Patterns

**Governed Scope:**

- Analyzed: `src/`.
- Excluded: `node_modules`, `build`, `coverage`, `storybook-static`, the `tests/` tree, `src/assets/**`,
  and `*.d.ts` (via `RCA_EXCLUDES`).
- All agents MUST use this exact scope/exclusion set — no ad-hoc path additions.

**Invocation:**

- CI calls `make lint-metrics`, never a raw `rust-code-analysis-cli` line in YAML.
- The Makefile targets are the single source of truth for the command, version, scope, and policy path.

**Analyzer image:**

- The `rca` image carries only the toolchain (CLI + `jq` + `make`); the source is **bind-mounted**, not
  baked. `RCA_BIN` is `/usr/local/bin/rust-code-analysis-cli` inside the container.

### Format Patterns

- **Enforcement mode:** collect-all-then-fail — collect every violation, print the full table, exit 1
  if any `FAIL` (else 0). Never fail-fast.
- **No suppression:** no baseline/ignore file may be created.
- **Severity discipline:** `hard` rows block and are printed; `review` rows are computed, never block,
  and are excluded from the stdout summary.
- **Schema-first:** the policy is validated against the schema before any threshold is read.

### Process Patterns

- **Alpine policy:** `Dockerfile.rca` MUST carry an inline `# alpine-exception: <reason>` marker (its
  base is glibc-only, like `Dockerfile.playwright`). Never add it without the marker — the `alpine base
guard` workflow will fail the PR.
- **Recipe prefix:** recipes in this Makefile are **space-indented** (`.RECIPEPREFIX += `), not
  tab-indented. Honor this for the new targets.
- **No `bun x`:** the analyzer is native; never attempt to run it through the `bun` service / `bun x`.
- **Version single-source:** the Makefile is the canonical pin for `RCA_VERSION`/`RCA_SHA256` (exported
  and propagated to the image build via the compose service's `build.args`); the `Dockerfile.rca` `ARG`
  defaults mirror them only as a standalone-build fallback and must be kept in sync with the Makefile.

### Enforcement Guidelines

**All implementing agents MUST:**

- Name the targets `lint-metrics`/`lint-metrics-run`, register them in `.PHONY`, and append
  `lint-metrics` to `lint:`.
- Govern `src/` only, with the exact `RCA_EXCLUDES` set.
- Provision the binary via the dockerized `rca` service with `Dockerfile.rca` carrying the
  `# alpine-exception:` marker.
- Keep the policy in `config/metrics-policy.json` validated by `config/metrics-policy.schema.json`.
- Have CI invoke `make lint-metrics`, not the raw CLI.
- Run a no-suppression baseline-compliance check before enabling the required check.

**Anti-Patterns:**

- Adding a non-Alpine `Dockerfile.rca` without the `# alpine-exception:` marker.
- Baking the source into the `rca` image (it must be bind-mounted, or local runs go stale).
- Inlining thresholds in the Makefile recipe instead of `config/metrics-policy.json`.
- Adding a `package.json` script instead of Makefile targets.
- Running the analyzer through `bun x` / the `bun` service.
- Failing fast on the first violation instead of collecting all.
- Introducing a suppression/baseline file to silence pre-existing violations.
- Letting the `Dockerfile.rca` `ARG` defaults drift from the Makefile's canonical
  `RCA_VERSION`/`RCA_SHA256` pin (the Makefile value must reach the build via compose `build.args`).

## Project Structure & Boundaries

### Target-state Repository Change Delta

(target-state — planning only; none of these files are part of this PR)

This initiative extends the existing `ui-toolkit` repository. No new project root. Planned delta:
6 new files and 4 modified files.

<!-- markdownlint-disable MD013 -->

| File                                       | Change   | Purpose                                                                                                                |
| ------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Dockerfile.rca`                           | new      | Debian-based analyzer image; pins + integrity-verifies `rust-code-analysis-cli@0.0.25`; carries `# alpine-exception:`. |
| `docker-compose.yml`                       | modified | Add the `rca` service (`profiles: [tools]`, `Dockerfile.rca`, bind-mount `.:/app`, no host ports).                     |
| `config/metrics-policy.json`               | new      | Committed `hard` (+ optional `review`) per-metric thresholds; the single threshold source.                             |
| `config/metrics-policy.schema.json`        | new      | Draft-07 schema contracting the policy; `required: ["hard"]`, `additionalProperties: false`.                           |
| `scripts/lint-metrics.sh`                  | new      | POSIX-sh enforcement engine: schema self-validation, analysis, collect-all-then-fail, review non-blocking, reporting.  |
| `Makefile`                                 | modified | Add `RCA_*`/`METRICS_POLICY_PATH` vars, `lint-metrics` + `lint-metrics-run` targets, `.PHONY`, `lint:` append.         |
| `.github/workflows/rust-code-analysis.yml` | new      | Dedicated PR → main required workflow running `make lint-metrics` (hardened, runtime-detection gate).                  |
| `tests/**`                                 | new      | Schema-validity test + `scripts/lint-metrics.sh` shell-flow coverage, per repo test conventions.                       |
| `CONTRIBUTING.md`                          | modified | Document what the gate enforces, the governed scope, local `make lint-metrics` usage, and failure/summary reading.     |
| `README.md`                                | modified | Brief mention of the metrics gate and pointer to `CONTRIBUTING.md`.                                                    |

<!-- markdownlint-enable MD013 -->

### Architectural Boundaries

**Tool Boundary:**

- `rust-code-analysis-cli` is a pinned native binary inside the `rca` image.
- The repository owns: the version pin (`RCA_VERSION=0.0.25`) + integrity check, the
  `config/metrics-policy.json` policy + schema, the `scripts/lint-metrics.sh` enforcement, the
  invocation (`make lint-metrics`), and the reporting format.
- The tool owns: metric computation only — no custom analyzer wrappers or patches.

**CI Boundary:**

- `rust-code-analysis.yml` is self-contained: checkout, runtime detection, `make lint-metrics`.
- It does not call other workflows or reuse shared actions, and needs no `make start`/`make down`.

**Local/CI Parity Boundary:**

- `make lint-metrics` is the single source of truth for invocation; CI calls it, not the raw CLI.
- Local and CI evaluate the same committed policy, the same governed scope, and the same pinned
  analyzer version. The only CI-specific branch is the `GITHUB_STEP_SUMMARY` write.

### Requirements-to-Structure Mapping

<!-- markdownlint-disable MD013 -->

| FR   | Covered by                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| FR1  | `Dockerfile.rca` + `rca` docker-compose service with the pinned binary pre-installed (Decision 1).                                         |
| FR2  | `RCA_VERSION` single-source pin + SHA-256 verification (amd64) / `cargo install --locked` (arm64); no ports/network (Decision 1).          |
| FR3  | `config/metrics-policy.json` — `hard` (+ optional `review`) thresholds (Decision 2).                                                       |
| FR4  | `config/metrics-policy.schema.json` + inline `jq` schema self-validation in the script (Decision 2/4).                                     |
| FR5  | `RCA_SCOPE=src/` + `RCA_EXCLUDES` (vendored/generated dirs, `tests/`, `src/assets/**`, `*.d.ts`) (Decision 2/5).                           |
| FR6  | `scripts/lint-metrics.sh` runs the CLI + parses metrics with `jq` (Decision 4).                                                            |
| FR7  | Collect-all-then-fail; exit 1 on any hard violation or precondition failure, else 0 (Decision 4/7).                                        |
| FR8  | `review` rows computed but non-blocking and excluded from the stdout summary (Decision 4/7).                                               |
| FR9  | Tolerant key reading, null-safe comparisons, division guards, review fallback defaults (Decision 3/4).                                     |
| FR10 | `lint-metrics` (docker run + summary mount) and `lint-metrics-run` (in-container) targets (Decision 5).                                    |
| FR11 | Both targets in `.PHONY`; `lint-metrics` appended to `lint:` (Decision 5).                                                                 |
| FR12 | `make lint-metrics` as the single local entry point (Decision 5).                                                                          |
| FR13 | `.github/workflows/rust-code-analysis.yml` — `pull_request` → `main` (Decision 6).                                                         |
| FR14 | Dedicated workflow/job `rust-code-analysis` registered as a required status check (Decision 6).                                            |
| FR15 | `make lint-metrics` evaluates the full governed `src/` scope each run and fails on threshold breach (Decision 5/7).                        |
| FR16 | Hardened permissions, `actions/checkout@v4` + `persist-credentials: false`, timeout, runtime-detection gate, no `setup-node` (Decision 6). |
| FR17 | Success measured-metric table on stdout + `GITHUB_STEP_SUMMARY` (Decision 7).                                                              |
| FR18 | Failure findings table (file/subject/line/metric/value/limit) on stdout + `GITHUB_STEP_SUMMARY` (Decision 7).                              |
| FR19 | Same `config/metrics-policy.json` + `src/` scope via the shared `make lint-metrics` (Decision 5).                                          |
| FR20 | Canonical `RCA_VERSION`/`RCA_SHA256` pin in the Makefile, propagated to the image build via compose `build.args` (Decision 1/5).           |
| FR21 | Baseline-compliance run against `main`; calibrate to a passing baseline, no suppression file (Decision 3).                                 |
| FR22 | Schema-validity test + `scripts/lint-metrics.sh` shell-flow coverage test (Decision Impact step 6).                                        |
| FR23 | `CONTRIBUTING.md` — what the gate enforces, governed scope, no-suppression nature (Docs).                                                  |
| FR24 | `CONTRIBUTING.md` / `README.md` — local `make lint-metrics` usage + violation/summary interpretation (Docs).                               |

<!-- markdownlint-enable MD013 -->

### Integration Points

**Makefile Integration:**

```makefile
RCA_VERSION         = 0.0.25
RCA_SHA256          = 9ec2a217b8ff191e02dab5d5f2eee6158b63fd975c532b2c5d67c2e6c7249894
RCA_SCOPE           = src/
RCA_EXCLUDES        = **/node_modules/** **/build/** **/coverage/** **/storybook-static/** **/tests/** **/*.d.ts **/src/assets/**
METRICS_POLICY_PATH = config/metrics-policy.json
RCA_BIN             = /usr/local/bin/rust-code-analysis-cli
export RCA_VERSION RCA_SHA256

lint: lint-next lint-tsc lint-md format-check lint-dep-ranges lint-test-structure lint-metrics
```

**GitHub Actions Integration:** see the `rust-code-analysis.yml` block in Decision 6.

**Branch Protection Integration:**

- Required status check name matches the workflow/job name `rust-code-analysis`.
- PRs to `main` are blocked until the check passes.

### Data Flow

```text
pull_request event (-> main)
  -> rust-code-analysis.yml triggered
    -> detect runtime project files (package.json + bun.lock + config/metrics-policy.json)
      -> make lint-metrics
        -> docker compose run --rm --build rca make lint-metrics-run   (source bind-mounted at /app)
          -> sh scripts/lint-metrics.sh
            -> validate config/metrics-policy.json against config/metrics-policy.schema.json (jq)
              -> rust-code-analysis-cli -m -O json -p src/ -X <excludes...>
                -> jq evaluates every governed metric, collecting all findings
                  -> any FAIL? -> stdout findings table + GITHUB_STEP_SUMMARY -> exit 1
                  -> clean?    -> stdout measured-metric table + GITHUB_STEP_SUMMARY -> exit 0
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** The seven decisions form a coherent execution chain with no conflicts.
The native analyzer runs in a dedicated `rca` service (not `bun x`); the policy is validated by its
schema before thresholds are read; the dedicated workflow invokes the single `make lint-metrics`
target; the version is pinned once and consumed by both the Makefile and the image build.

**Pattern Consistency:** Collect-all-then-fail aligns with the script's single-pass `jq` evaluation
and the no-suppression rule. The hardened workflow and runtime-detection gate mirror `bats-testing.yml`
/ `static-testing.yml`. The `# alpine-exception:` marker reconciles a Debian analyzer image with the
repository's Alpine base-image policy, using the established `Dockerfile.playwright` precedent.

**Structure Alignment:** The repository delta maps directly and completely to all 24 FRs. The
required-check name convention satisfies branch-protection registration.

### Requirements Coverage Validation ✅

All 24 functional requirements (FR1-FR24) are covered, as shown in the Requirements-to-Structure
Mapping. All NFRs are addressed: reliability (deterministic evaluation against a committed policy and a
pinned analyzer), consistency (shared `make lint-metrics` + single policy + identical scope + single
version source), usability (collect-all-then-fail output naming file/subject/line/metric/value/limit;
measured-metric summary; documented workflow), performance (operationally acceptable inside the `rca`
service within a 10-minute timeout, no fixed numeric target), and supply-chain safety (pinned,
integrity-verified analyzer; hardened workflow permissions; no host ports/network).

### Gap Analysis Results

**Blocking — Alpine base-image policy compliance is the dominant first-PR consideration:**
`rust-code-analysis-cli` prebuilt releases are glibc-only, so the analyzer image is Debian-based,
which the `alpine base guard` default-denies. `Dockerfile.rca` MUST carry an inline `# alpine-exception:
<reason>` marker (mirroring `Dockerfile.playwright`). Without it, the gate's own pull request fails the
`alpine base guard` workflow. This, not the thresholds, is the largest first-PR risk.

**Important — Baseline-compliance run before enforcement:**
This React/MUI TSX codebase differs from CRM's, and v0.0.25 OOP class/interface and
maintainability-index metrics can be sparse or unreliable for TS. Run `make lint-metrics` against
current `main`, confirm which metrics produce meaningful values, and commit thresholds that pass (or
calibrate to a passing baseline and defer tightening). No suppression file may be introduced.

**Important — Bind-mount, not bake:**
The `bun` service is a baked `COPY . .` image, so its container runs against stale source. The `rca`
service MUST bind-mount `.:/app` so `make lint-metrics` analyzes the live working tree; otherwise local
runs silently analyze stale code.

**Minor — v0.0.25 metric-key quirks:**
The maintainability-index parent key may be the misspelled `maintanability_index`, and `cognitive`
may be an object `{.sum}` or a scalar. The script reads both tolerantly and null-skips absent metrics.

### Architecture Completeness Checklist

#### ✅ Requirements Analysis

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (low complexity, medium operational sensitivity)
- [x] Technical constraints identified (make + native binary + Alpine policy + GitHub Actions conventions)
- [x] Cross-cutting concerns mapped

#### ✅ Architectural Decisions

- [x] Analyzer provisioning & version specified (`rca` service, `Dockerfile.rca`, `RCA_VERSION=0.0.25`)
- [x] Policy & schema file design defined (`config/metrics-policy.json` + `.schema.json`)
- [x] Governed metrics & thresholds defined (families + JSON path mapping + v0.0.25 caveats)
- [x] Enforcement script design defined (`scripts/lint-metrics.sh`, collect-all-then-fail)
- [x] Make target design defined (`lint-metrics` + `lint-metrics-run`, `.PHONY`, `lint:` append)
- [x] CI structure decided (dedicated `rust-code-analysis.yml`, required check)
- [x] Reporting format decided (stdout tables + `GITHUB_STEP_SUMMARY`, no suppression)

#### ✅ Implementation Patterns

- [x] Naming conventions locked (targets, workflow, policy, script, image, version var, required-check)
- [x] Governed scope locked (`src/` + exact exclusion set)
- [x] Alpine-exception requirement locked (`Dockerfile.rca` marker)
- [x] Enforcement mode locked (collect-all-then-fail, no suppression)
- [x] Local/CI parity pattern locked (`make lint-metrics` single source of truth)

#### ✅ Project Structure

- [x] Complete file delta defined (6 new, 4 modified)
- [x] Component boundaries established (tool / CI / local-CI parity)
- [x] Integration points mapped (Makefile → workflow → branch protection)
- [x] Requirements-to-structure mapping complete (FR1-FR24)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — a low-complexity brownfield change mirroring a shipped sibling
implementation, with all seven decisions locked, patterns unambiguous, and the file delta fully
specified.

**Key Strengths:**

- Direct tooling-parity with CRM's shipped design (the explicit goal of issue #59)
- A committed, schema-validated policy as the single threshold source
- A native-binary-friendly execution model that keeps the `bun` image lean
- Single source of truth for invocation (`make lint-metrics`) eliminating local/CI drift
- Dedicated, self-contained CI workflow with no cross-workflow dependencies

**Areas for Future Enhancement:**

- Tightening thresholds toward stricter target values (plus the code remediation it implies) — out of
  current scope per PRD
- Trend/delta reporting and reuse of the policy across other VilnaCRM repositories — out of scope

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all seven architectural decisions exactly as documented.
- Use the locked names — `lint-metrics`/`lint-metrics-run`, `config/metrics-policy.json`,
  `config/metrics-policy.schema.json`, `scripts/lint-metrics.sh`, `Dockerfile.rca`, the `rca` service,
  and `.github/workflows/rust-code-analysis.yml`.
- `make lint-metrics` is the only valid invocation path; CI must call it, not the raw CLI.
- `Dockerfile.rca` MUST carry the `# alpine-exception:` marker; bind-mount the source, do not bake it.
- Run the no-suppression baseline-compliance check before enabling the required check.

**First Implementation Step:**
Add `Dockerfile.rca` (with the `# alpine-exception:` marker) and the `rca` docker-compose service,
commit `config/metrics-policy.json` + `config/metrics-policy.schema.json`, author
`scripts/lint-metrics.sh`, add the `RCA_*` variables and the `lint-metrics`/`lint-metrics-run` targets,
and confirm a clean local `make lint-metrics` baseline run against the current `src/` tree before
creating the CI workflow.
