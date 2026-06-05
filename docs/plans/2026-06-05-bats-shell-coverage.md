# UI Toolkit Bats Shell Coverage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Bats coverage for every `Makefile` target and shell flow that is not already exercised by CI, wire the suite into CI, and document the maintenance contract for new targets.

**Architecture:** Reuse the `website`/`crm` Bats pattern with a repo-local test helper that runs `make` against a sandboxed copy of the `Makefile` and stubs external commands like `docker`. Keep CI-covered targets documented in a manifest and only add direct Bats assertions for uncovered shell behavior and manifest/documentation contracts.

**Tech Stack:** GNU Make, Bats, Bun, Docker Compose, GitHub Actions

### Task 1: Plan and target inventory

**Files:**
- Modify: `Makefile`
- Modify: `.github/workflows/*.yml`
- Create: `tests/bats/make-target-coverage.tsv`

**Step 1: Write the failing manifest contract test**

Create a Bats contract test that compares the current `Makefile` target list against `tests/bats/make-target-coverage.tsv`.

**Step 2: Run the contract test to verify it fails**

Run: `make test-bats BATS_FORMATTER=tap`
Expected: FAIL because the Bats suite and target coverage manifest do not exist yet.

**Step 3: Add the manifest with one row per public Make target**

Document each target as either:
- `ci` with the workflow file that already executes it directly or through a prerequisite
- `bats` with the Bats file that validates its shell behavior

**Step 4: Re-run the contract test**

Run: `make test-bats BATS_FORMATTER=tap`
Expected: FAIL later in the suite because more harness pieces are still missing.

### Task 2: Add the Bats harness and failing target tests

**Files:**
- Create: `tests/bats/test_helper.bash`
- Create: `tests/bats/makefile_targets.bats`
- Create: `tests/bats/issue_43_contract.bats`

**Step 1: Write target-level failing tests for uncovered shell flows**

Cover the uncovered `Makefile` targets:
- `help`
- `build`
- `git-hooks-install`
- `storybook-start`
- `storybook-build`
- `generate-ts-doc`
- `playwright-install`
- `test-e2e-local`
- `update`
- `sh`
- `ps`
- `logs`
- `new-logs`
- `stop`
- `build-k6-docker`
- `load-tests`
- `lighthouse-desktop`
- `lighthouse-mobile`

Also cover the uncovered branches for:
- `up` through the `start` alias path already CI-covered indirectly
- `copy-coverage` when the Bun container is not running and when coverage is absent
- `test-unit` for both `docker compose exec` and `docker compose run` branches if needed by the shell flow

**Step 2: Run the suite to verify the tests fail for expected missing harness reasons**

Run: `make test-bats BATS_FORMATTER=tap`
Expected: FAIL because `test_helper.bash`, `test-bats`, and command stubs are not complete yet.

**Step 3: Implement the minimal helper harness**

Add a reusable helper that:
- creates a sandbox copy of the `Makefile`
- prepends stub binaries into `PATH`
- records command invocations into a log
- exposes helpers like `run_make_target`, `reset_command_log`, `assert_log_contains`, and `assert_output_contains`

**Step 4: Re-run the suite**

Run: `make test-bats BATS_FORMATTER=tap`
Expected: Some tests still fail until `Makefile` and CI wiring are added.

### Task 3: Wire Bats execution into the repo

**Files:**
- Modify: `Makefile`
- Modify: `package.json`
- Modify: `bun.lock`
- Create: `.github/workflows/bats-testing.yml`

**Step 1: Add the failing entry point expectation**

Ensure the Bats tests expect `make help` to list `test-bats` and expect a PR workflow to run `make test-bats` with read-only contents permissions.

**Step 2: Run the suite to verify those expectations fail**

Run: `make test-bats BATS_FORMATTER=tap`
Expected: FAIL because `test-bats` is not yet present in the `Makefile`, the dependency is missing, and the workflow does not exist.

**Step 3: Add the minimal implementation**

- Add `bats` as a dev dependency
- Add `BATS_FORMATTER ?= pretty`
- Add `test-bats` to `.PHONY`
- Implement `make test-bats` using the Bun Docker container and `bun x bats`
- Add a dedicated `.github/workflows/bats-testing.yml` PR workflow

**Step 4: Re-run the suite**

Run: `make test-bats BATS_FORMATTER=tap`
Expected: Bats tests pass or fail only on documentation gaps.

### Task 4: Document the maintenance contract

**Files:**
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`
- Create: `tests/bats/README.md`

**Step 1: Write failing documentation expectations in the contract test**

Require `README.md` to mention `make test-bats` and `CONTRIBUTING.md` to mention `make-target-coverage.tsv`.

**Step 2: Run the suite to verify the docs expectations fail**

Run: `make test-bats BATS_FORMATTER=tap`
Expected: FAIL because the docs do not mention the suite yet.

**Step 3: Add the minimal documentation**

- Explain how to run `make test-bats`
- Explain the manifest maintenance rule for new public targets
- Add a focused `tests/bats/README.md`

**Step 4: Re-run the suite**

Run: `make test-bats BATS_FORMATTER=tap`
Expected: PASS.

### Task 5: Verify, publish, and open a draft PR

**Files:**
- Modify: any files from prior tasks

**Step 1: Run focused verification**

Run:
- `make test-bats BATS_FORMATTER=tap`
- any additional targeted checks needed if the Bats suite reveals workflow or formatting issues

Expected: PASS with no unexpected warnings.

**Step 2: Review the diff**

Confirm the manifest matches every current Make target and that CI coverage references point at real workflows.

**Step 3: Commit**

```bash
git add Makefile package.json bun.lock README.md CONTRIBUTING.md .github/workflows/bats-testing.yml tests/bats docs/plans/2026-06-05-bats-shell-coverage.md
git commit -m "test(#43): add bats coverage for make commands"
```

**Step 4: Push and create draft PR**

Push the branch and create a draft PR linked to `#43` with a summary of:
- the new `make test-bats` entry point
- the Bats harness and manifest contract
- the CI workflow and documentation updates
