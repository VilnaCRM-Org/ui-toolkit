# Story 2.1: Dedicated dependency-cruiser GitHub Actions workflow

Status: draft

## Story

As a maintainer,
I want a dedicated workflow that runs make lint-dep-cruiser on every pull request targeting main,
so that the repository enforces graph-hygiene policy on all incoming changes with an isolated
failure signal and without manual intervention.

## Acceptance Criteria

1. A pull request opened or updated against `main` triggers
   `.github/workflows/dependency-cruiser.yml`.
2. The workflow defines a job named exactly `dependency-cruiser` that runs on `ubuntu-latest`.
3. The job declares `permissions: contents: read`.
4. A "Detect runtime project files" step sets its output flag to `true` only when both
   `package.json` and `bun.lock` are present, and `false` otherwise.
5. The `make start`, `make lint-dep-cruiser`, and `make down` steps are gated on the
   runtime-detection flag (`steps.<id>.outputs.present == 'true'`).
6. The `make down` step runs with `if: always()` (combined with the runtime-detection flag).
7. The workflow uses TAG-pinned actions — `actions/checkout@v4` — and the checkout step sets
   `with: { persist-credentials: false }` so the job's `GITHUB_TOKEN` is not persisted to disk.
8. The workflow contains no `setup-node` step; the docker-compose `bun` service supplies the
   Node/bun runtime.
9. The workflow runs `make lint-dep-cruiser` (never a raw `bun x depcruise` line in YAML), so the
   full governed `src/` graph is evaluated against the committed `.dependency-cruiser.js`.
10. On any `error`-severity violation the job exits non-zero and prints the default `text` reporter
    output — one line per finding naming the offending file and the violated rule, with advisory
    `warn`/`info` findings staying visible.
11. On a clean graph the job exits `0` with no violation output.

## Tasks / Subtasks

- [ ] Task 1: Create the dedicated workflow file (AC: 1, 2, 3)
  - [ ] 1.1 Add `.github/workflows/dependency-cruiser.yml`
  - [ ] 1.2 Set `name: dependency-cruiser`
  - [ ] 1.3 Trigger on `pull_request` with `branches: [main]` (mirroring `static-testing.yml`)
  - [ ] 1.4 Define the job key as `dependency-cruiser` running on `ubuntu-latest`
  - [ ] 1.5 Declare job-level `permissions: contents: read`

- [ ] Task 2: Add checkout and runtime-detection gate (AC: 4, 7, 8)
  - [ ] 2.1 Add the `Checkout code` step using `actions/checkout@v4` (TAG-pinned) with
        `with: { persist-credentials: false }`
  - [ ] 2.2 Add a `Detect runtime project files` step with `id: project` that writes
        `present=true`/`present=false` to `$GITHUB_OUTPUT` based on `-f package.json && -f bun.lock`
  - [ ] 2.3 Do NOT add a `setup-node` step — the docker-compose `bun` service provides the runtime

- [ ] Task 3: Add the gated docker lifecycle and gate execution (AC: 5, 6, 9)
  - [ ] 3.1 Add `Start docker test environment` running `make start`, gated by
        `steps.project.outputs.present == 'true'`
  - [ ] 3.2 Add `Run dependency-cruiser` running `make lint-dep-cruiser` (not the raw CLI), gated by
        the same flag
  - [ ] 3.3 Add `Stop docker test environment` running `make down` with
        `if: always() && steps.project.outputs.present == 'true'`

- [ ] Task 4: Confirm the workflow consumes the repository-owned gate (AC: 9, 10, 11)
  - [ ] 4.1 Confirm the workflow calls `make lint-dep-cruiser`, relying on the Makefile target for
        config path (`.dependency-cruiser.js`), scope (`src`), `@/*` resolution, exit code, and
        `text` reporting — no thresholds/scope duplicated in YAML
  - [ ] 4.2 Confirm the `lint-dep-cruiser` target and `.dependency-cruiser.js` from Epic 1 exist so
        the workflow has something to invoke (dependency, not re-created here)

- [ ] Task 5: Verification (AC: 1-11)
  - [ ] 5.1 Confirm the trigger is `pull_request` -> `main` and the job key is exactly
        `dependency-cruiser`
  - [ ] 5.2 Confirm `permissions: contents: read` is present
  - [ ] 5.3 Confirm the runtime-detection flag gates `make start` / `make lint-dep-cruiser` /
        `make down`, and that `make down` carries `if: always()`
  - [ ] 5.4 Confirm action pins are TAGs (`actions/checkout@v4`), the checkout step sets
        `with: { persist-credentials: false }`, and no `setup-node` is present
  - [ ] 5.5 Run `make lint-dep-cruiser` locally (or in the dev container) to validate the exact
        command the workflow executes, asserting non-zero exit + `text` output on a seeded violation
        and exit `0` with no output on a clean graph

## Dev Notes

### Architecture Decisions (from specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md)

- **Dedicated workflow, not a static-testing step (Decision 5 / Foundation Option 1).** The
  graph-analysis check is split out into its own `.github/workflows/dependency-cruiser.yml` to keep
  an isolated, unambiguous failure signal (graph-hygiene fails independently of
  ESLint/tsc/markdown/format), preserve separate job history that is easy to register/tune, and
  mirror the CRM `dependency-cruiser.yml` convention. Folding it into `static-testing.yml` was
  explicitly rejected as an anti-pattern.
- **Local/CI parity boundary.** CI invokes `make lint-dep-cruiser` — never a raw `bun x depcruise`
  line in YAML. The Makefile target is the single source of truth for command, config path, and
  scope; local and CI evaluate the same committed `.dependency-cruiser.js` and the same `src` scope.
- **Workflow conventions (Decision 5).** Trigger `pull_request` -> `main`; `permissions: contents:
read`; `ubuntu-latest`; TAG-pinned `actions/checkout@v4`; NO `setup-node` (the docker-compose
  `bun` service supplies the runtime); a "Detect runtime project files" gate mirroring
  `static-testing.yml` keeps the workflow inert on bootstrap PRs lacking `package.json` + `bun.lock`;
  steps bracketed by `make start` ... `make down` with `make down` under `if: always()`.
- **Reporting (Decision 6).** The reporter is pinned to the default `text` (NOT `err`). `text`
  prints one line per finding naming file + rule for BOTH `error`-severity and advisory
  (`warn`/`info`) matches, and still exits non-zero on any `error`-severity match; a clean run
  prints nothing and exits `0`. `err` is avoided because it would suppress the deliberately-kept
  advisory warns (`peer-deps-used`, `not-to-deprecated`, `no-duplicate-dep-types`,
  `optional-deps-used`). No `depcruise-baseline` — every violation surfaces on every run.

Canonical workflow shape (from the architecture's GitHub Actions Integration block):

```yaml
name: dependency-cruiser
on:
  pull_request:
    branches:
      - main

jobs:
  dependency-cruiser:
    runs-on: ubuntu-latest
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
          if [[ -f package.json && -f bun.lock ]]; then
            echo "present=true" >> "$GITHUB_OUTPUT"
          else
            echo "present=false" >> "$GITHUB_OUTPUT"
          fi
      - name: Start docker test environment
        if: steps.project.outputs.present == 'true'
        run: make start
      - name: Run dependency-cruiser
        if: steps.project.outputs.present == 'true'
        run: make lint-dep-cruiser
      - name: Stop docker test environment
        if: always() && steps.project.outputs.present == 'true'
        run: make down
```

### Project Structure Notes

- **New file:** `.github/workflows/dependency-cruiser.yml` — the dedicated PR -> main workflow.
- **Dependencies (from Epic 1, not created here):** `make lint-dep-cruiser` in the `Makefile`
  (recipe `$(BUN_X) depcruise --config .dependency-cruiser.js src`, registered in `.PHONY` and
  appended to the aggregate `lint:` chain) and the committed `.dependency-cruiser.js` policy. This
  story consumes them; it does not modify `package.json`, the `Makefile`, or the policy.
- **No application source changes** are required for this story.
- Required-status-check registration in branch protection is intentionally out of scope here — it
  is Story 2.2. This story only ensures the workflow exists, triggers, and runs the gate.

### Testing Approach

Verification is workflow-structure based plus functional coverage through the same target the
workflow runs:

- Inspect `.github/workflows/dependency-cruiser.yml` for: trigger (`pull_request` -> `main`), job
  name (`dependency-cruiser`), `permissions: contents: read`, the runtime-detection gate, the
  `if: always()` teardown, TAG-pinned `actions/checkout@v4` with `persist-credentials: false`, and
  the absence of `setup-node`.
- Run `make lint-dep-cruiser` locally / in the dev container to validate the exact command the
  workflow executes — assert exit `0` with no output on the clean `src/` graph, and seed a
  temporary circular import to assert non-zero exit with `text` output naming file + `no-circular`.
- GitHub Actions execution on a real pull request validates the `pull_request` -> `main` event path
  and the gated docker lifecycle end to end.

### References

- Architecture:
  `specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md`
  - Decision 5: CI Job Structure; Decision 6: Reporting Format; Integration Points (GitHub Actions
    Integration); Architectural Boundaries (CI Boundary, Local/CI Parity Boundary); Data Flow
- Epics: `specs/dependency-cruiser/planning-artifacts/epics-dependency-cruiser-2026-06-23.md`
  - Epic 2: CI Integration & Required Check, Story 2.1
- PRD: `specs/dependency-cruiser/planning-artifacts/prd-dependency-cruiser-2026-06-23.md`
  - FR9, FR11, FR12, FR16, FR17
- Tracking issue: <https://github.com/VilnaCRM-Org/ui-toolkit/issues/58>

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
