---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
inputDocuments:
  - 'specs/dependency-cruiser/planning-artifacts/prd-dependency-cruiser-2026-06-23.md'
  - 'specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md'
---

# ui-toolkit - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ui-toolkit, decomposing the
requirements from the PRD and Architecture into implementable stories. The initiative adds a
required `dependency-cruiser` graph-hygiene gate to `@vilnacrm/ui-toolkit` for pull requests
targeting `main`: a committed `.dependency-cruiser.js` policy, a `make lint-dep-cruiser` local
entry point, a dedicated CI workflow, and contributor documentation. The work is a single-slice,
low-complexity, zero-tolerance (no baseline) brownfield change.

## Requirements Inventory

### Functional Requirements

FR1: The repository can declare `dependency-cruiser` as a devDependency so the check is available
through the existing Bun-based tooling.
FR2: The repository can commit a single `.dependency-cruiser.js` policy (CommonJS
`module.exports`, `forbidden`-only) that defines all enforced rules.
FR3: The committed policy can resolve the repository's `@/*` path alias by referencing
`tsconfig.json` so aliased source imports are analyzed correctly.
FR4: The committed policy can scope analysis to the `src/` graph rooted at `src/index.ts` and
exclude build, report, and tooling directories (`node_modules`, `build`, `.next`,
`storybook-static`, `coverage`, `.stryker-tmp`, `playwright-report`, `test-results`, `reports`,
`.lighthouseci`, `.qlty`).
FR5: The policy can enforce generic dependency-health rules — no circular dependencies, no orphan
modules (with an allowlist for dotfiles, `.d.ts` files, config, the entry barrel, and stories), no
imports of modules absent from `package.json`, no unresolvable imports, no production imports of
**truly dev-only** dependencies (dev-only modules that are not also declared as `peerDependencies`,
since this published library mirrors its runtime libraries into both `devDependencies` and
`peerDependencies`), and no production imports of test or spec files.
FR6: The policy can enforce components-centric boundary rules for this library, including that
`src/` must not depend on the repository `tests/` tree and that production code must not import
`*.stories.tsx` story files.
FR7: The policy can enforce type/runtime-split discipline so that type-only modules are imported
as types only and do not introduce runtime imports.
FR8: The policy can enforce the boundary as zero-tolerance, with no `depcruise-baseline` file
suppressing violations.
FR9: The repository can execute `dependency-cruiser` automatically in CI for pull requests
targeting `main`.
FR10: A pull request targeting `main` can surface a required `dependency-cruiser` result as part
of repository quality policy.
FR11: The required `dependency-cruiser` result can fail when the governed `src/` graph violates
the committed policy.
FR12: The required `dependency-cruiser` result can evaluate the full governed `src/` graph on each
pull request.
FR13: Contributors can run the repository-defined `dependency-cruiser` check locally through the
`make lint-dep-cruiser` target.
FR14: Contributors can use the local check to evaluate the same committed policy before marking a
pull request ready for review, and the target is included in the aggregate `make lint` flow.
FR15: Contributors can identify from a failed check which source file and which rule violated
repository policy.
FR16: CI runs can produce human-readable output for both successful and failed
`dependency-cruiser` evaluations.
FR17: Failed CI runs can report policy violations clearly enough — naming the offending file and
the violated rule — for contributors to remediate them without interpreting raw tool internals.
FR18: CI and local execution can evaluate `dependency-cruiser` results against the same committed
`.dependency-cruiser.js` policy and the same governed-scope definition.
FR19: Contributors can access repository documentation describing what the `dependency-cruiser`
check enforces and how it complements ESLint by filling the disabled circular-import gap.
FR20: Contributors can access repository documentation describing how to run the check locally
through `make lint-dep-cruiser` and how to interpret check failures.
FR21: All governed source files and directories under `src/` and `tests/` MUST be lowercase
kebab-case; the policy forbids any uppercase character in governed source paths, ported from
CRM's `no-uppercase-paths` rule (error).
FR22: Component directories and their files under `src/components/` MUST follow kebab-case
naming (e.g. `ui-button/`, `card-content.tsx`), enforced by a dedicated kebab-case naming rule
(CRM `src-*-name-kebab-case` parity), with test directories/files under `tests/` likewise
kebab-case.
FR23: The repository's existing PascalCase/camelCase paths (the ~21
`src/components/<PascalName>/` dirs and their PascalCase files, the
`src/index.ts`→`src/components/index.ts` barrels, all internal `@/` and relative imports,
Storybook `*.stories.tsx`, and camelCase test files such as `authSkeleton.spec.ts`/
`backToMain.spec.ts`) MUST be normalized to kebab-case so the zero-tolerance gate passes with
no `no-uppercase-paths`/kebab violations on the run that enables the naming rules.
FR24: Contributor documentation MUST state the kebab-case naming convention — all files and
folders lowercase kebab-case, matching the CRM repo — alongside the existing dependency-rule
documentation.

### Non-Functional Requirements

NFR1: Reliability — The `dependency-cruiser` gate must be trustworthy enough that contributors and
maintainers can treat failures as real policy signals.
NFR2: Reliability — Repeated evaluations against the same code state and committed policy must not
produce materially inconsistent pass/fail outcomes.
NFR3: Consistency — Local execution through `make lint-dep-cruiser` and CI execution must evaluate
the same governed `src/` scope against the same committed policy.
NFR4: Consistency — The policy must remain non-redundant with ESLint: it must own the boundaries
ESLint does not enforce (circular imports, orphans, `src` ↛ `tests`, public-API/barrel discipline,
no production import of stories or truly dev-only dependencies, type-only discipline) rather than
duplicating active `import/order` or `no-extraneous-dependencies` checks.
NFR5: Usability — Failed CI output and local output must be understandable enough for routine
contributor and maintainer use without requiring interpretation of raw tool internals, naming the
offending file and rule.
NFR6: Usability — Local usage guidance must be understandable enough for contributors to run and
interpret the check as part of normal repository workflow.
NFR7: Performance — The check must be operationally acceptable for routine pull request use within
the existing docker-compose `bun` service.
NFR8: Performance — This PRD does not impose a fixed numeric execution-time target.

### Additional Requirements

- No starter template applies — this is a brownfield extension of the existing `ui-toolkit`
  repository.
- Tool: `dependency-cruiser@^17.3.7` (matching the CRM pin), a devDependency managed by Bun
  (`bun@1.3.5`), invoked as `bun x depcruise` inside the docker-compose `bun` service.
- Policy file: a single `.dependency-cruiser.js` at repository root (CommonJS `module.exports`,
  `forbidden`-only, zero-tolerance, no `depcruise-baseline`).
- Exact local command: `$(BUN_X) depcruise --config .dependency-cruiser.js src`, exposed through
  the `make lint-dep-cruiser` target (the single source of truth for command, config path, and
  scope).
- Alias resolution: `options.tsConfig.fileName` MUST be `tsconfig.json` (which extends
  `tsconfig.paths.json`, the sole `@/*` -> `src/*` source); never point it at
  `tsconfig.paths.json` directly.
- Governed scope: analyze `src` (graph rooted at `src/index.ts`). Excluded / not followed:
  `node_modules`, `build`, `.next`, `storybook-static`, `coverage`, `.stryker-tmp`,
  `playwright-report`, `test-results`, `reports`, `.lighthouseci`, `.qlty`. The `tests/` tree is
  not analyzed as source; it is a forbidden target of `src/`.
- Rule set: ported generic-health rules (`no-circular`, `no-orphans`, `no-deprecated-core`,
  `not-to-deprecated`, `no-non-package-json`, `not-to-unresolvable`, `no-duplicate-dep-types`,
  `not-to-dev-dep`, `not-to-test`, `not-to-spec`, `optional-deps-used`, `peer-deps-used`),
  type-split rules (`type-files-imported-as-type-only`, `type-files-no-runtime-imports`), and
  components-centric rules (`src-not-to-tests`, `no-prod-import-of-stories`,
  `components-public-api`). CRM bulletproof-react layering and lowercase/kebab-path rules are
  explicitly NOT ported.
- Reporting: the default `text` reporter (NOT `err`) — one line per finding naming file + rule for
  all severities, keeping advisory `warn`/`info` findings visible, and still exiting non-zero on any
  `error`-severity match; a clean run exits zero with no output.
- CI workflow file: `.github/workflows/dependency-cruiser.yml`, job name `dependency-cruiser`,
  trigger `pull_request` -> `main`, `permissions: contents: read`, TAG-pinned actions
  (`actions/checkout@v4`), no `setup-node`, runtime-detection gate mirroring `static-testing.yml`,
  bracketed by `make start` / `make down` (`if: always()`).
- Aggregate lint chain: `lint: lint-next lint-tsc lint-md format-check lint-test-structure
lint-dep-cruiser` (append `lint-dep-cruiser`; add it to `.PHONY`).
- Planned target-state delta (not part of this PR): 2 new files
  (`.dependency-cruiser.js`, `.github/workflows/dependency-cruiser.yml`) and 4 modified
  (`package.json`, `Makefile`, `CONTRIBUTING.md`, `README.md`).
- Zero-tolerance baseline-compliance run against current `main` is required before registering the
  workflow as a required check in branch protection; no `depcruise-baseline` may be introduced.

### FR Coverage Map

FR1: Epic 1 — `dependency-cruiser@^17.3.7` declared as a devDependency
FR2: Epic 1 — single committed `.dependency-cruiser.js` (`forbidden`-only) policy
FR3: Epic 1 — `tsConfig.fileName: 'tsconfig.json'` resolves the `@/*` alias
FR4: Epic 1 — `src` scope from `src/index.ts` + `exclude`/`doNotFollow` list
FR5: Epic 1 — generic-health rules in the committed policy; the spec/test-FILE clause maps to
`not-to-spec` (the directory concern is owned by `src-not-to-tests` under FR6, so `not-to-test`
is folded into `src-not-to-tests` to avoid a duplicate report — see architecture Decision 3)
FR6: Epic 1 — components-centric boundary rules (`src-not-to-tests` owns the `src/` ↛ `tests/`
DIRECTORY rule, `no-prod-import-of-stories`, `components-public-api`)
FR7: Epic 1 — type/runtime-split rules
FR8: Epic 1 — zero-tolerance, no `depcruise-baseline`
FR9: Epic 2 — CI trigger on `pull_request` -> `main`
FR10: Epic 2 — required status check registration in branch protection
FR11: Epic 2 — `text` reporter exits non-zero on any `error`-severity violation (reinforced from
the local target in Epic 1)
FR12: Epic 2 — full governed `src/` graph evaluated each run
FR13: Epic 1 — `make lint-dep-cruiser` target
FR14: Epic 1 — `lint-dep-cruiser` appended to the aggregate `lint:` chain
FR15: Epic 1 — `text` output names offending file and violated rule (one line per finding)
FR16: Epic 2 — workflow job logs render success and failure output
FR17: Epic 2 — `text` output names file + rule without raw internals
FR18: Epic 2 — same `.dependency-cruiser.js` + `src` scope via the shared `make lint-dep-cruiser`
(established in Epic 1)
FR19: Epic 3 — documentation: what the gate enforces + ESLint `import/no-cycle` gap
complementarity
FR20: Epic 3 — documentation: local `make lint-dep-cruiser` usage + failure interpretation
FR21: Epic 4 — `no-uppercase-paths` rule (CRM line 472 parity) forbidding uppercase in governed
`src/`/`tests/` paths, enabled after the kebab-case migration
FR22: Epic 4 — `component-name-kebab-case` + `test-name-kebab-case` rules (CRM
`src-*-name-kebab-case` parity)
FR23: Epic 4 — kebab-case migration: `git mv` of `src/components/**` dirs/files + camelCase test
files to kebab-case, with barrels/imports/stories/tests updated (React export identifiers stay
PascalCase)
FR24: Epic 4 — documentation of the all-lowercase kebab-case convention (matching CRM); also
relates to the Epic 3 documentation story (Story 3.1) it cross-references

## Epic List

### Epic 1: Policy Configuration & Local Enforcement

Contributors can run `make lint-dep-cruiser` locally against a committed, zero-tolerance
`.dependency-cruiser.js` policy and receive actionable feedback naming exactly which source file
and which rule violated repository graph-hygiene policy — before pushing.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR13, FR14, FR15

### Epic 2: CI Integration & Required Check

Pull requests to `main` are automatically evaluated by a dedicated `dependency-cruiser` workflow
that is registered as a required status check, blocking merges on any policy violation and keeping
local and CI evaluation in parity through the same `make lint-dep-cruiser` target.
**FRs covered:** FR9, FR10, FR11, FR12, FR16, FR17, FR18

### Epic 3: Documentation & Quality Gate Closure

Contributors can self-serve to understand what the gate enforces, how it complements ESLint by
filling the disabled `import/no-cycle` gap, how to run it locally, and how to interpret failures.
**FRs covered:** FR19, FR20

### Epic 4: Kebab-case Path Normalization & Naming Enforcement

The repository's PascalCase component tree and camelCase test files are normalized to lowercase
kebab-case (preserving history via `git mv` and keeping React export identifiers PascalCase), the
`no-uppercase-paths` and kebab-case naming rules are turned on in `.dependency-cruiser.js`, and
the zero-tolerance gate is verified to pass at zero naming violations on the enabling run.
**FRs covered:** FR21, FR22, FR23, FR24

## Epic 1: Policy Configuration & Local Enforcement Details

Contributors can run `make lint-dep-cruiser` locally against a committed, zero-tolerance
`.dependency-cruiser.js` policy and receive actionable feedback naming exactly which source file
and which rule violated repository graph-hygiene policy — before pushing.

### Story 1.1: Declare dependency-cruiser as a devDependency

As a maintainer,
I want `dependency-cruiser` declared as a pinned devDependency installable through Bun,
So that the graph-hygiene check is available through the existing docker-compose `bun` tooling
without any new runtime install.

**Acceptance Criteria:**

**Given** the repository `package.json` is opened
**When** a contributor inspects `devDependencies`
**Then** `dependency-cruiser` is present with the version range `^17.3.7`
**And** it is declared as a devDependency, not a production dependency or peerDependency

**Given** `dependency-cruiser` is declared in `package.json`
**When** Bun resolves the lockfile
**Then** `bun.lock` records the resolved `dependency-cruiser` version
**And** `bun x depcruise --version` runs inside the `bun` service without a separate install

**Given** the repository keeps `package.json` script-free by convention
**When** the devDependency is added
**Then** no `scripts` entry is introduced for dependency-cruiser
**And** the tool is invoked only through Bun (`bun x depcruise`)

### Story 1.2: Commit the `.dependency-cruiser.js` policy with scope and alias resolution

As a maintainer,
I want a single committed `.dependency-cruiser.js` policy that defines the governed scope,
exclusions, and `@/*` alias resolution,
So that all contributors and CI execution paths analyze the same `src/` graph against identical
options.

**Acceptance Criteria:**

**Given** the repository root is inspected
**When** a contributor opens `.dependency-cruiser.js`
**Then** the file is CommonJS (`module.exports`) with a `forbidden` array and an `options` block
**And** no `depcruise-baseline` file exists anywhere in the repository

**Given** the policy `options` are inspected
**When** a contributor reads the `tsConfig` setting
**Then** `options.tsConfig.fileName` is `tsconfig.json` (which extends `tsconfig.paths.json`)
**And** the `@/*` -> `src/*` alias resolves during analysis
**And** `tsPreCompilationDeps`, `combinedDependencies`, and `enhancedResolveOptions` are set as
specified by the architecture

**Given** the policy `options` are inspected
**When** a contributor reads the scope and exclusions
**Then** `node_modules` is set under `doNotFollow`
**And** `build`, `.next`, `storybook-static`, `coverage`, `.stryker-tmp`, `playwright-report`,
`test-results`, `reports`, `.lighthouseci`, and `.qlty` are excluded from analysis
**And** the graph is rooted at the `src` entry `src/index.ts`

### Story 1.3: Author the graph-hygiene, boundary, and type-split rule set

As a maintainer,
I want the committed policy to enforce generic-health, components-centric, and type/runtime-split
rules as zero-tolerance `forbidden` rules,
So that cycles, orphans, leaked dev/test/story imports, and type-split violations fail the gate
without any baseline to suppress them.

**Acceptance Criteria:**

**Given** the `forbidden` rule set is inspected
**When** a contributor reads the generic-health rules
**Then** `no-circular` (error), `no-orphans` (error), `no-non-package-json` (error),
`not-to-unresolvable` (error), `not-to-dev-dep` (error), `not-to-test` (error), and `not-to-spec`
(error) are present
**And** advisory rules (`no-deprecated-core`, `not-to-deprecated`, `no-duplicate-dep-types`,
`optional-deps-used`, `peer-deps-used`) are present at `warn`/`info` and do not fail the gate

**Given** the `not-to-dev-dep` rule is inspected
**When** a contributor reads its scope
**Then** it forbids only **truly dev-only** modules (`npm-dev` and NOT `npm-peer`), excluding every
module that is also declared under `peerDependencies`
**And** the runtime libraries this published library mirrors into both `devDependencies` and
`peerDependencies` (`@mui/material`, `react`, `react-dom`, `react-hook-form`, `@mui/system`,
`@emotion/react`, `@emotion/styled`, `i18next`, `react-i18next`) are NOT flagged as dev-dep
violations, so the rule does not fail the tree on the first zero-tolerance run

**Given** the `no-orphans` rule is inspected
**When** a contributor reads its allowlist
**Then** dotfiles, `*.d.ts` files (`src/types/styles.d.ts`, `src/components/Types.d.ts`), config
files, the entry barrels (`src/index.ts`, `src/components/index.ts`), and the `*.stories.tsx`
files are exempt
**And** the `fonts.css` side-effect import does not trigger an orphan violation

**Given** the components-centric and type-split rules are inspected
**When** a contributor reads them
**Then** `src-not-to-tests` (error), `no-prod-import-of-stories` (error), and
`components-public-api` (error) are present
**And** `type-files-imported-as-type-only` (error) and `type-files-no-runtime-imports` (error) are
present
**And** no `no-uppercase-paths`, kebab-case path, or CRM bulletproof-react layering rules are
present

### Story 1.4: `make lint-dep-cruiser` target, lint-chain registration, and clean baseline run

As a contributor,
I want a `make lint-dep-cruiser` target that cruises the governed `src/` graph and is wired into
the aggregate `make lint` flow,
So that I can run the same committed policy locally and see a clean pass before marking a pull
request ready for review.

**Acceptance Criteria:**

**Given** the `Makefile` is opened
**When** a contributor inspects the targets
**Then** a `lint-dep-cruiser` target runs `$(BUN_X) depcruise --config .dependency-cruiser.js src`
**And** `lint-dep-cruiser` is listed in `.PHONY`
**And** the aggregate target reads
`lint: lint-next lint-tsc lint-md format-check lint-test-structure lint-dep-cruiser`

**Given** the current `src/` graph and the committed policy
**When** a contributor runs `make lint-dep-cruiser`
**Then** the gate evaluates the full governed `src/` graph rooted at `src/index.ts`
**And** the `not-to-dev-dep` rule is verified to be scoped to truly dev-only modules so the
dev+peer runtime libraries (`@mui/material`, `react`, etc.) do not produce 100+ false dev-dep
violations on this first run
**And** any pre-existing violations are remediated in the same slice (no `depcruise-baseline` is
introduced)
**And** a clean run prints no violations and exits `0`

**Given** one or more `src/` modules violate an `error`-severity rule
**When** `make lint-dep-cruiser` completes
**Then** the `text` reporter prints one line per finding naming the offending file and the
violated rule (advisory `warn`/`info` findings stay visible)
**And** the target exits non-zero

**Given** `make lint` is invoked
**When** the lint chain runs
**Then** `lint-dep-cruiser` runs as part of the chain against the same committed policy and scope

## Epic 2: CI Integration & Required Check Details

Pull requests to `main` are automatically evaluated by a dedicated `dependency-cruiser` workflow
that is registered as a required status check, blocking merges on any policy violation and keeping
local and CI evaluation in parity through the same `make lint-dep-cruiser` target.

### Story 2.1: Dedicated dependency-cruiser GitHub Actions workflow

As a maintainer,
I want a dedicated workflow that runs `make lint-dep-cruiser` on every pull request targeting
`main`,
So that the repository enforces graph-hygiene policy on all incoming changes with an isolated
failure signal and without manual intervention.

**Acceptance Criteria:**

**Given** a pull request is opened or updated targeting `main`
**When** GitHub Actions evaluates the event
**Then** the `.github/workflows/dependency-cruiser.yml` workflow is triggered
**And** a job named `dependency-cruiser` runs on `ubuntu-latest` with `permissions: contents:
read`

**Given** the workflow job starts
**When** the "Detect runtime project files" step runs
**Then** it sets a flag only when `package.json` and `bun.lock` are both present
**And** the `make start`, `make lint-dep-cruiser`, and `make down` steps are gated on that flag
**And** `make down` runs with `if: always()`

**Given** the workflow file is committed
**When** the action pins are inspected
**Then** `actions/checkout@v4` is used (TAG-pinned)
**And** no `setup-node` step is present (the docker-compose `bun` service provides the runtime)

**Given** the docker environment is up
**When** the workflow runs `make lint-dep-cruiser`
**Then** the full governed `src/` graph is evaluated against the committed
`.dependency-cruiser.js`
**And** the job exits non-zero and prints the `text` reporter findings (file + rule, one line each,
including advisory `warn`/`info`) on any `error`-severity violation
**And** the job exits `0` with no violation output on a clean graph

### Story 2.2: Required status check, local/CI parity, and baseline compliance

As a maintainer,
I want the `dependency-cruiser` workflow registered as a required status check after a clean
baseline run on `main`,
So that pull requests to `main` are blocked until the same committed policy evaluated locally also
passes in CI.

**Acceptance Criteria:**

**Given** Epic 1 and Story 2.1 are complete
**When** a maintainer runs `make lint-dep-cruiser` against the current `main` branch
**Then** the output is reviewed and any existing violations are remediated before enabling
enforcement
**And** no `depcruise-baseline` file is introduced to suppress findings

**Given** the `.github/workflows/dependency-cruiser.yml` workflow has run at least once on `main`
**When** a maintainer opens branch protection rules for `main`
**Then** `dependency-cruiser` appears as an available status check
**And** it is enabled as a required status check whose name matches the workflow/job exactly

**Given** the required check is enabled
**When** a pull request targeting `main` introduces a graph violation (for example a circular
import)
**Then** the `dependency-cruiser` check fails and the PR cannot be merged until it passes
**And** the failure output names the offending file and the violated rule (for example
`no-circular`)

**Given** the required check is enabled
**When** a contributor runs `make lint-dep-cruiser` locally and then opens a pull request with no
violations
**Then** local and CI evaluate the same committed `.dependency-cruiser.js` and the same `src`
scope
**And** the `dependency-cruiser` check shows as passing and does not block the merge

## Epic 3: Documentation & Quality Gate Closure Details

Contributors can self-serve to understand what the gate enforces, how it complements ESLint by
filling the disabled `import/no-cycle` gap, how to run it locally, and how to interpret failures.

### Story 3.1: Contributor documentation for the dependency-cruiser gate

As a contributor,
I want repository documentation explaining what `dependency-cruiser` enforces, how it complements
ESLint, how to run it locally, and how to read its output,
So that I can use the graph-hygiene gate as part of my normal workflow without interpreting raw
tool internals.

**Acceptance Criteria:**

**Given** a contributor opens `CONTRIBUTING.md` or `README.md`
**When** they look for information about the graph-hygiene check
**Then** a section explains what `dependency-cruiser` enforces (cycles, orphans,
public-API/barrel discipline, `src` ↛ `tests`, no production import of stories or dev
dependencies, type-only discipline)
**And** it states that the gate complements ESLint by filling the disabled `import/no-cycle` gap
rather than duplicating active `import/order` or `no-extraneous-dependencies` checks

**Given** a contributor wants to run the check locally
**When** they follow the documentation
**Then** `make lint-dep-cruiser` is documented as the single command to run
**And** the documentation references `make lint-dep-cruiser`, not the raw `bun x depcruise`
invocation
**And** no additional setup beyond the repository's existing docker-compose `bun` workflow is
required

**Given** a contributor's run produces violations
**When** they read the documentation
**Then** the `text` output format is explained (one line per finding naming the offending file
and the violated rule, for all severities, with advisory `warn`/`info` findings staying visible)
**And** guidance on remediating common violations (cycles, orphans, leaked stories/dev imports) is
present

**Given** the documentation section exists
**When** it is reviewed
**Then** IDE/editor integration and visual/graph reporting are explicitly noted as out of scope
**And** the zero-tolerance, no-baseline nature of the gate is stated

## Epic 4: Kebab-case Path Normalization & Naming Enforcement Details

The repository's PascalCase component tree and camelCase test files are normalized to lowercase
kebab-case (preserving history via `git mv` and keeping React export identifiers PascalCase), the
`no-uppercase-paths` and kebab-case naming rules are turned on in `.dependency-cruiser.js`, and
the zero-tolerance gate is verified to pass at zero naming violations on the enabling run.

### Story 4.1: Normalize `src/components/` to kebab-case

As a maintainer,
I want every PascalCase component directory and source file under `src/components/` renamed to
lowercase kebab-case with all references updated,
So that the governed source tree satisfies the kebab-case naming convention without changing the
published component API.

**Acceptance Criteria:**

**Given** the `src/components/` tree is inspected
**When** a contributor lists the component directories after the rename
**Then** every PascalCase directory (`UiButton`, `UiCardItem`, `UiCardList`, `UiFooter`,
`AppTheme`, `UiColorTheme`, `UiBreakpoints`, `AuthSkeleton`, `Layout`, and the remaining ~21
top-level dirs) is lowercase kebab-case (`ui-button/`, `ui-card-item/`, `app-theme/`, ...)
**And** nested subcomponent directories (e.g. `UiCardItem/ServicesHoverCard` ->
`ui-card-item/services-hover-card`, `UiFooter/PrivacyPolicy`, `UiFooter/SocialMediaItem`) are
likewise kebab-case
**And** every PascalCase source file (e.g. `CardContent.tsx` -> `card-content.tsx`,
`UiFooter.tsx` -> `ui-footer.tsx`) is kebab-case

**Given** the renames are performed
**When** a contributor inspects the git history of the renamed paths
**Then** each rename was done with `git mv` so file history is preserved

**Given** the files and directories are renamed
**When** the barrels and imports are inspected
**Then** `src/index.ts` and `src/components/index.ts` barrel re-exports point at the new
kebab-case paths
**And** all `@/` aliased and relative imports across `src/` resolve to the renamed paths
**And** every `*.stories.tsx` import path is updated
**And** the import paths used by unit/integration/e2e/visual tests resolve to the renamed paths

**Given** the rename is complete
**When** the exported React component identifiers are inspected
**Then** the exported names stay PascalCase (e.g. `export const UiButton`) — only the FILE and
DIRECTORY paths become kebab-case
**And** `make lint-tsc` and the test suites confirm the barrels, imports, stories, and tests
still resolve and compile after the rename

### Story 4.2: Normalize `tests/` paths to kebab-case

As a maintainer,
I want the camelCase/PascalCase test files and directories under `tests/` renamed to lowercase
kebab-case with all references updated,
So that the test tree satisfies the same kebab-case naming convention as the source tree.

**Acceptance Criteria:**

**Given** the `tests/` tree is inspected
**When** a contributor lists the test files after the rename
**Then** camelCase/PascalCase spec and test files are kebab-case (e.g.
`authSkeleton.spec.ts` -> `auth-skeleton.spec.ts`, `backToMain.spec.ts` -> `back-to-main.spec.ts`,
`UiBackToMain.test.tsx` -> `ui-back-to-main.test.tsx`)
**And** any matching `*-snapshots/` directories are renamed to match the kebab-case spec name

**Given** the test files are renamed
**When** a contributor inspects the git history of the renamed paths
**Then** each rename was done with `git mv` so file history is preserved

**Given** the renames are performed
**When** the test references are inspected
**Then** Playwright and Jest references resolve to the renamed paths
**And** the `check-test-structure.sh` expectations are updated if they reference the renamed
paths or directory shapes

### Story 4.3: Add `no-uppercase-paths` + kebab-case naming rules and verify a clean gate

As a maintainer,
I want the `no-uppercase-paths` and kebab-case naming rules added to `.dependency-cruiser.js` and
the gate verified clean against the migrated tree,
So that the naming convention is enforced under zero tolerance with no violations on the enabling
run.

**Acceptance Criteria:**

**Given** Stories 4.1 and 4.2 are complete (this story is sequenced AFTER the migration)
**When** a contributor inspects `.dependency-cruiser.js`
**Then** a `no-uppercase-paths` rule (error, ported from CRM line 472, scoped to the governed
`src/` + `tests/` graph) is present, forbidding any uppercase character in governed source paths
**And** kebab-case naming rules for component dirs/files (`component-name-kebab-case`) and test
dirs/files (`test-name-kebab-case`) — CRM `src-*-name-kebab-case` parity, adapted — are present

**Given** the naming rules are added and the tree has been migrated
**When** a contributor runs `make lint-dep-cruiser` against the post-migration tree
**Then** the gate evaluates the naming rules across the governed `src/` and `tests/` paths
**And** it reports ZERO `no-uppercase-paths`/kebab-case naming violations
**And** the run exits `0` with no naming-related output

**Given** the naming rules are live
**When** a contributor reintroduces a PascalCase path (for example a `UiNew/` component dir)
**Then** `make lint-dep-cruiser` fails and the `text` output names the offending path and the
violated naming rule
**And** no `depcruise-baseline` file is introduced to suppress the finding

### Story 4.4: Document the kebab-case naming convention

As a contributor,
I want documentation stating the kebab-case naming convention and how it is enforced,
So that I name new files and folders correctly and know how to verify them before review.

**Acceptance Criteria:**

**Given** a contributor opens `CONTRIBUTING.md` or `README.md`
**When** they look for naming guidance
**Then** the documentation states that all files and folders are lowercase kebab-case (matching
the CRM repo)
**And** it gives concrete examples (`ui-button/index.tsx`, `card-content.tsx`)

**Given** the naming documentation exists
**When** a contributor reads how the convention is enforced
**Then** it states the rule is enforced by `make lint-dep-cruiser` (the `no-uppercase-paths` and
kebab-case naming rules)
**And** it cross-references the existing dependency-rule documentation from Story 3.1
