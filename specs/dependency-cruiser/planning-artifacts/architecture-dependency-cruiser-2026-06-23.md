---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-06-23'
inputDocuments:
  - 'specs/dependency-cruiser/planning-artifacts/prd-dependency-cruiser-2026-06-23.md'
workflowType: 'architecture'
project_name: 'ui-toolkit'
user_name: 'platform-team'
date: '2026-06-23T13:00:00+02:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as
we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The PRD defines 24 functional requirements across eight capability areas: tooling & policy
definition (FR1-FR4), graph-hygiene rules (FR5-FR8), quality-gate enforcement (FR9-FR12),
contributor validation (FR13-FR15), CI results reporting (FR16-FR17), repository policy
consistency (FR18), contributor documentation (FR19-FR20), and naming & path normalization
(FR21-FR24). Architecturally, this is a
repository workflow initiative rather than an application-runtime feature. The solution must
support one committed `.dependency-cruiser.js` policy, one reproducible local execution path
(`make lint-dep-cruiser`), one CI execution path (a dedicated pull-request workflow), clear
success and failure reporting semantics, and documentation that fits the normal contributor
workflow and explains complementarity with ESLint.

**Non-Functional Requirements:**
The main architectural drivers are reliability, consistency, and usability. The design must
produce stable pass/fail outcomes for the same code and policy state, keep local and CI
evaluations materially aligned against the same committed policy and governed scope, and make
both successful evaluations and failure output understandable without requiring raw
tool-internal interpretation — naming the offending file and the violated rule. Performance must
be operationally acceptable for routine pull-request use inside the existing docker-compose `bun`
service, with no fixed numeric runtime target imposed by the PRD.

**Scale & Complexity:**
This is a low-complexity architectural initiative with medium operational sensitivity. It is a
single-slice repository change centered on one required CI check and one local execution path,
but it affects every pull request in the governed `src/` scope and is zero-tolerance (no
baseline).

- Primary domain: developer tooling / CI governance
- Complexity level: low
- Operational sensitivity: medium
- Estimated architectural components: 4-5 (policy file, make target, CI workflow, docs, scope
  definition)

### Technical Constraints & Dependencies

The architecture must respect existing repository conventions that favor `make` as the local
entry point and GitHub Actions as the CI orchestration layer. Every lint target runs through the
docker-compose `bun` service via `bun x`, so the gate is invoked as `bun x depcruise` rather than
through a `package.json` script (the repository deliberately keeps `package.json` script-free).
The committed policy must point `tsConfig.fileName` at `tsconfig.json` — which extends
`tsconfig.paths.json`, the sole source of the `@/*` -> `src/*` alias — so that aliased source
imports resolve during analysis. The governed scope is the `src/` graph rooted at the public
entry `src/index.ts`; only `src/components/` and `src/types/` hold real code, and the
`src/{hooks,lib,providers,routes,stores,utils}` placeholder directories are empty. Component
directories are PascalCase today, so the adopted kebab-case naming rules cannot be enabled until
the tree is normalized — Epic 1 enables the base gate on the current tree and Epic 4 performs the
kebab-case migration before turning the naming rules on (see Decision 7). The repository
has no `modules/`, `features/`, or `repositories/` layout, so CRM bulletproof-react layering
rules do not apply. The check must be zero-tolerance with no `depcruise-baseline` file, so any
pre-existing graph violations must be resolved within the same delivery slice.

### Cross-Cutting Concerns Identified

- Policy consistency across local (`make lint-dep-cruiser`) and CI execution
- Governed-scope definition rooted at `src/index.ts` and exclusion handling for build/report dirs
- Required-check integration with the pull-request workflow targeting `main`
- Zero-tolerance baseline compliance before blocking enforcement (no `depcruise-baseline`)
- Human-readable success summaries and actionable failure diagnostics (file + rule)
- Non-redundancy with ESLint — owning the disabled `import/no-cycle` gap and boundary checks
- Contributor adoption through clear documentation and a stable `make` command path

## Starter Template Evaluation

### Primary Technology Domain

Brownfield repository workflow / CI automation inside an existing React 19 + MUI 9 component
library published as `@vilnacrm/ui-toolkit`, built and linted through Bun in a docker-compose
service.

This is not a greenfield application bootstrap decision. The architectural foundation already
exists in the `ui-toolkit` repository. The relevant question is how to integrate
`dependency-cruiser` into the existing `Makefile`, docker-compose `bun` service, and GitHub
Actions setup, and whether the CI check should be its own workflow or a step inside the existing
`static-testing.yml` lint workflow.

### Existing Technical Preferences Identified

- `make` is the local developer entry point for all quality and workflow commands.
- The docker-compose `bun` service provides the Node/bun runtime; every lint target runs via
  `bun x` inside it (`BUN_X = $(BUN) x`).
- `package.json` intentionally has no `scripts`; the Makefile is the command source of truth.
- GitHub Actions is the CI orchestration layer; testing workflows use TAG-pinned actions
  (`actions/checkout@v4`), `permissions: contents: read`, and no `setup-node` because the Docker
  image supplies the runtime.
- The aggregate lint target today is
  `lint: lint-next lint-tsc lint-md format-check lint-test-structure`.
- `static-testing.yml` gates every lint step behind a "Detect runtime project files" flag
  (`package.json` + `bun.lock` present) and brackets the steps with `make start` ... `make down`.

### Foundation Options Considered

#### Option 1: Dedicated `dependency-cruiser.yml` Workflow

Add a new self-contained GitHub Actions workflow that triggers on `pull_request` -> `main`, runs
`make start` then `make lint-dep-cruiser`, and tears down with `make down`.

**What it gives us:**

- A distinct, isolated required status check whose failure signal is unambiguous
  (graph-hygiene fails independently from style/type/markdown/format gates)
- Separate job history that is easy to read, disable, or tune
- Direct mirror of the CRM `dependency-cruiser.yml` convention, keeping the two repositories
  structurally consistent
- Keeps the graph-analysis check, which is conceptually different from per-file linting, out of
  the parallel lint group

#### Option 2: Add a Step to `static-testing.yml`

Append a "Run dependency-cruiser" step to the existing static-testing workflow, gated by the same
runtime-detection flag as the other lint steps.

**What it gives us:**

- One fewer workflow file to maintain
- Reuses the existing `make start` / `make down` bracketing and runtime-detection gate

**Trade-offs:**

- Graph-hygiene failures get mixed into the same job as ESLint/tsc/markdown, blurring the failure
  signal
- Diverges from the CRM convention, where the graph-analysis gate is intentionally split out
- Harder to register, tune, or temporarily disable the boundary check independently

### Selected Foundation: Dedicated `dependency-cruiser.yml` Workflow

**Rationale for Selection:**

The dedicated workflow is selected. It mirrors the CRM repository's deliberate decision to split
the dependency-cruiser graph-analysis check out of the parallel lint group, preserves a clean
isolated failure signal for a check that is qualitatively different from per-file linting, and
keeps separate job history that is easy to register as a required status check and to tune. The
modest cost of one extra workflow file is outweighed by signal clarity and cross-repository
consistency. The workflow remains brownfield-minimal: it reuses `make start` / `make down` and
invokes the repository-owned `make lint-dep-cruiser` rather than a raw CLI, preserving local/CI
parity.

### Initialization Command

```bash
# No new starter initialization command applies.
# This is a brownfield extension of the existing ui-toolkit repository foundation.
```

### Architectural Decisions Provided by Selected Foundation

**Language & Runtime:**

- Preserve the current Bun/Node docker-compose toolchain.
- Consume `dependency-cruiser` as a devDependency invoked through `bun x depcruise` inside the
  `bun` service — no separate runtime install.

**Governed Scope Baseline:**

- The enforced gate governs the `src/` dependency graph rooted at `src/index.ts`.
- Only `src/components/` and `src/types/` carry real code; the empty placeholder directories
  carry no rules.
- Build and report directories (`node_modules`, `build`, `.next`, `storybook-static`,
  `coverage`, `.stryker-tmp`, `playwright-report`, `test-results`, `reports`, `.lighthouseci`,
  `.qlty`) are excluded / not followed. The repository `tests/` tree is outside the governed
  source graph and is instead enforced as a forbidden target of `src/`.

**Build Tooling:**

- Add a `lint-dep-cruiser` Makefile target rather than a `package.json` script.
- Keep `make` as the contributor-facing command source of truth; CI calls the same target.
- Keep local and CI invocation aligned through the same committed `.dependency-cruiser.js`.

**Quality Integration:**

- Add a dedicated `dependency-cruiser.yml` workflow and append `lint-dep-cruiser` to the
  aggregate `lint` target so `make lint` exercises the gate locally.
- Use the workflow job logs as the reporting surface for both successful and failed evaluations.

**Code Organization:**

- Centralize the policy in a single repository-owned `.dependency-cruiser.js`.
- No baseline file; no helper project.

**Development Experience:**

- Contributors gain one repository-defined `make lint-dep-cruiser` entry point for local
  validation, plus the same check folded into `make lint`.
- Pull requests to `main` use GitHub Actions as the required enforcement surface.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Tool & version — required before any invocation can run
- Config file design — required before enforcement logic exists
- Rule set design — required before the policy can fail anything meaningfully
- Make target design — required before CI can invoke the gate

**Important Decisions (Shape Architecture):**

- CI job structure — determines failure-signal granularity in PR checks
- Reporting format — determines contributor experience on failure

**Deferred Decisions (Post-MVP):**

- Richer reporting (graph artifacts, `dot`/`archi` visual output) — out of scope per PRD;
  reassess only after the gate proves useful

### Decision 1: Tool & Version

- **Strategy:** Declare `dependency-cruiser` as a devDependency and invoke it as
  `bun x depcruise` inside the existing docker-compose `bun` service — no separate binary
  download, no runtime install.
- **Version:** `dependency-cruiser` `^17.3.7` (matching the CRM pin), managed by Bun
  (`bun@1.3.5`).
- **Rationale:** The repository already runs every lint target through `bun x`; consuming
  dependency-cruiser the same way needs zero new toolchain. The caret range mirrors CRM and the
  repository's dependency-range policy.
- **Affects:** `package.json` (new devDependency), `bun.lock`.

### Decision 2: Config File Design

- **Strategy:** Commit a single `.dependency-cruiser.js` at the repository root using CommonJS
  `module.exports`, `forbidden`-only (zero-tolerance, no `depcruise-baseline`).
- **Version/Format:** CommonJS module; `forbidden` array plus an `options` block. Key options:

  ```javascript
  module.exports = {
    forbidden: [
      /* rule set — see Decision 3 */
    ],
    options: {
      doNotFollow: { path: 'node_modules' },
      tsPreCompilationDeps: true,
      combinedDependencies: true,
      detectProcessBuiltinModuleCalls: true,
      tsConfig: { fileName: 'tsconfig.json' },
      enhancedResolveOptions: {
        exportsFields: ['exports'],
        conditionNames: ['import', 'require', 'node', 'default', 'types'],
        extensions: ['.ts', '.tsx', '.d.ts', '.js'],
        mainFields: ['main', 'types', 'typings'],
      },
      skipAnalysisNotInRules: true,
      exclude: {
        path:
          '^(build|\\.next|storybook-static|coverage|\\.stryker-tmp|' +
          'playwright-report|test-results|reports|\\.lighthouseci|\\.qlty)',
      },
      reporterOptions: {
        text: { highlightFocused: true },
      },
    },
  };
  ```

- **Rationale:** `tsConfig.fileName: 'tsconfig.json'` resolves the `@/*` alias (via the extended
  `tsconfig.paths.json`) so aliased imports analyze correctly. `tsPreCompilationDeps: true`
  surfaces type-only imports needed by the type-split rules. `combinedDependencies: true` and the
  `enhancedResolveOptions` mirror CRM so package-resolution behaves identically — and
  `combinedDependencies: true` is also what makes the `not-to-dev-dep` `dependencyTypesNot`
  mechanism work, since a dual-placed module then carries both `npm-dev` and `npm-peer` tags (see
  Decision 3). `detectProcessBuiltinModuleCalls: true` mirrors CRM so `node:`-prefixed builtin
  calls are detected for the core-module rules. `exclude`
  removes build/report directories from analysis; `doNotFollow` keeps `node_modules` out of the
  graph. No baseline file is created, enforcing zero tolerance.
- **Affects:** `.dependency-cruiser.js` (new file), depends on `tsconfig.json` /
  `tsconfig.paths.json`.

### Decision 3: Rule Set Design

The rule set ports the CRM generic-health, type-split, and naming rules
(`no-uppercase-paths` plus the kebab-case `*-name` family) and replaces the CRM
bulletproof-react layering rules with components-centric boundary rules tuned to this library.
All rules are `forbidden`-only. One CRM rule — `not-to-dev-dep` — does **not** port verbatim and
is re-scoped for this library's dependency layout (see the dev+peer overlap note below). The
naming rules are adopted per stakeholder direction but cannot be enabled on the current tree
until it is normalized to kebab-case — see Decision 7 for the migration sequencing.

<!-- markdownlint-disable MD013 -->

| Rule name                          | Severity | What it forbids                                                                                                                                                                                                                            |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `no-circular`                      | error    | Any cyclic dependency chain within the `src/` graph.                                                                                                                                                                                       |
| `no-orphans`                       | error    | Modules nothing imports, with an allowlist for dotfiles, `*.d.ts`, config files, the entry barrels, and stories.                                                                                                                           |
| `no-deprecated-core`               | warn     | Imports of deprecated Node/bun core modules.                                                                                                                                                                                               |
| `not-to-deprecated`                | warn     | Imports of npm modules marked deprecated.                                                                                                                                                                                                  |
| `no-non-package-json`              | error    | Imports of npm modules not declared in `package.json` (dependencies/peer/optional).                                                                                                                                                        |
| `not-to-unresolvable`              | error    | Imports that cannot be resolved on disk.                                                                                                                                                                                                   |
| `no-duplicate-dep-types`           | warn     | A module declared under more than one dependency type in `package.json`.                                                                                                                                                                   |
| `not-to-dev-dep`                   | error    | Production `src/` code importing a **truly dev-only** devDependency (one NOT also a peerDependency). Scoped with a `pathNot` allowlist for the runtime libs mirrored into both `devDependencies` and `peerDependencies` (see note below).  |
| `not-to-test`                      | error    | Production `src/` code importing a module under the `tests/` tree.                                                                                                                                                                         |
| `not-to-spec`                      | error    | Production `src/` code importing a `*.spec.*` / `*.test.*` file.                                                                                                                                                                           |
| `optional-deps-used`               | info     | Use of an optional dependency (informational).                                                                                                                                                                                             |
| `peer-deps-used`                   | warn     | Direct use of a peerDependency from source.                                                                                                                                                                                                |
| `type-files-imported-as-type-only` | error    | Importing a type-only module (`*.d.ts`, `types.ts`) as a runtime (value) import instead of a type-only import.                                                                                                                             |
| `type-files-no-runtime-imports`    | error    | A type-only module pulling in runtime (value) imports.                                                                                                                                                                                     |
| `src-not-to-tests`                 | error    | Any `src/` module depending on the repository `tests/` tree (components-centric direction rule).                                                                                                                                           |
| `no-prod-import-of-stories`        | error    | Production `src/` code importing a `*.stories.tsx` story file.                                                                                                                                                                             |
| `components-public-api`            | error    | Reaching past a component's public entry (`index.tsx`/`index.ts`) barrel into another component's internals.                                                                                                                               |
| `no-uppercase-paths`               | error    | Any uppercase character in a governed `src/` or `tests/` file or directory path (ported verbatim from CRM line 472 — `from.path: '.*[A-Z].*'`). All governed paths must be lowercase.                                                      |
| `component-name-kebab-case`        | error    | A component directory or file under `src/components/<name>/` whose path segment is not lowercase kebab-case (CRM `src-module-name-kebab-case` / `src-feature-name-kebab-case` parity, adapted to `^src/components/(?![a-z0-9-]+/)[^/]+/`). |
| `test-name-kebab-case`             | error    | A test directory or file under `tests/<tier>/` whose path segment is not lowercase kebab-case (CRM `tests-*-name-kebab-case` parity, adapted to `^tests/(?:e2e\|visual\|...)/(?![a-z0-9-]+...)`).                                          |

Severity legend: `error` fails the gate; `warn`/`info` are advisory and do not fail. Because the
policy is zero-tolerance, the boundary-critical rules are `error`.

<!-- markdownlint-enable MD013 -->

**CRM naming rules now ADOPTED (reversing the earlier drop):** Per stakeholder direction,
`no-uppercase-paths` and the kebab-case `*-name` family are reinstated and ported to this
library (adapted to `src/components/<name>` and `tests/<tier>/...`). They appear in the rule
table above. They are NOT dropped. Because the current tree is PascalCase
(`UiButton/`, `UiCardItem/ServicesHoverCard/`) with camelCase test files, these rules would fail
the whole tree if enabled today; Decision 7 sequences the one-time kebab-case migration that
precedes turning them on.

**CRM rules explicitly dropped and why:**

- `no-cross-module-imports`, `no-components-import-modules`, repository/store/feature/DI rules,
  and the `*-allowed-folders` rules — there is no `modules/`, `features/`, `repositories/`, or
  `stores/` layout in this library (those `src/` dirs are empty placeholders), so the rules would
  match nothing or misfire. The bulletproof-react LAYERING rules remain dropped for the same
  reason.

**Rationale:** The ported generic-health and type-split rules carry directly because they are
layout-agnostic. The new `src-not-to-tests`, `no-prod-import-of-stories`, and
`components-public-api` rules encode this library's actual boundaries: `src/` must not depend on
`tests/`, production code must not import stories, and component internals are reached only
through their barrel. The `no-orphans` allowlist is expressed as REGEX CLASSES rather than
enumerated paths so it does not drift as files are added:
`\\.d\\.ts$` (covers `src/types/styles.d.ts`, `src/components/Types.d.ts`, AND
`src/react-app-env.d.ts`), `\\.stories\\.tsx$` (all 21 stories), `fonts\\.css$`, and
`^src/(components/)?index\\.(ts|tsx)$` (both entry barrels). Dotfiles and config are covered by
dependency-cruiser's default orphan `pathNot`.

**`not-to-test` / `src-not-to-tests` non-overlap (de-duplication):** These two rules are given
DISTINCT, non-overlapping scopes so they never double-report the same edge. `not-to-spec` owns
the FILE patterns (`[.](?:spec|test)[.](?:tsx?|jsx?|...)$`, mirroring CRM lines 154-167) — any
`src/` import of a spec/test file. `src-not-to-tests` owns the DIRECTORY (`^tests/` as a target
of `^src/`, mirroring CRM `not-to-test` lines 138-153). `not-to-test` is therefore folded into
`src-not-to-tests` (one directory rule), so FR6's "`src/` must not depend on `tests/`" maps to
`src-not-to-tests`, and FR5's spec/test-file clause maps to `not-to-spec`. The rule table lists
`not-to-test` and `not-to-spec` as the CRM-named source rules; in THIS policy the directory
concern is implemented once as `src-not-to-tests` to avoid a duplicate report against
`tests/**/*.spec.ts`.

**Dev+peer dependency overlap — why `not-to-dev-dep` cannot port verbatim:** As a published
React/MUI component library, `@vilnacrm/ui-toolkit` declares its runtime libraries under **both**
`devDependencies` (so they install for local dev, Storybook, and tests) **and** `peerDependencies`
(so the consumer supplies them at runtime). The ONLY entry under pure `dependencies` is `swiper`.
Concretely, `@mui/material` (~51 `src/` imports), `react` (~46), `react-hook-form`,
`@mui/system`, `@emotion/react`, `i18next`, and `react-i18next` are all dev+peer. CRM's verbatim
`not-to-dev-dep` rule (`src` ↛ `npm-dev`) works only because CRM's runtime libs are true
`dependencies`; that premise does **not** hold here. A verbatim port would resolve every one of
those 100+ component imports as `npm-dev` and fail the entire tree on the first zero-tolerance
run. The rule is therefore re-scoped to forbid only **truly dev-only** modules. The COMMITTED
mechanism is `to.dependencyTypesNot: ['npm-peer']` — NOT a hand-maintained `pathNot` allowlist.
Because `combinedDependencies: true` (Decision 2) makes any module placed in both
`devDependencies` and `peerDependencies` carry BOTH the `npm-dev` and `npm-peer` tags, a rule of
`to.dependencyTypes: ['npm-dev']` + `to.dependencyTypesNot: ['npm-peer', 'type-only']` spares all
nine dual-placed runtime libs automatically with no enumerated path list to drift. CRM's existing
`type-only` exclusion and the `node_modules/@types/` `pathNot` exception are layered under it. The
rule's `from.path: '^src'` + `from.pathNot` spec/test exclusion mirrors CRM lines 169-189. This
keeps the genuine value (catching `src/` leaks of build/test-only tooling such as `jest`,
`storybook`, `webpack`, `eslint`) while not flagging the library's legitimately mirrored runtime
peers. The `.dependency-cruiser.js` author MUST run the gate against `main` and confirm ZERO
`not-to-dev-dep` hits on those nine dev+peer modules (`@mui/material`, `react`, `react-hook-form`,
`@mui/system`, `@emotion/react`, `i18next`, `react-i18next`, plus the remaining peers); `swiper`
is the only true `dependency`.

**`components-public-api` concrete regex (modeled on CRM `no-repository-internal-imports`,
lines 241-256):** The rule forbids one component dir reaching PAST another component's public
entry into its internals, while allowing a component to import its OWN internals/subcomponents.
Using a negative-lookahead on the barrel filename:

```javascript
{
  name: 'components-public-api',
  severity: 'error',
  comment:
    "Imports between components must go through the target component's public entry " +
    '(index.ts|index.tsx), not reach into its internals.',
  from: { path: '^src/components/([^/]+)/' },
  to: {
    // a DIFFERENT component dir's non-index file
    path: '^src/components/(?!\\1/)[^/]+/(?!index[.](?:ts|tsx)$).+',
  },
},
```

The `\\1` back-reference scopes the `pathNot` so a component importing within its own directory
(its subcomponents/internals) never matches; only crossing into a sibling component's non-`index`
file fails.

**Affects:** `.dependency-cruiser.js`.

### Decision 4: Make Target Design

- **Target name:** `lint-dep-cruiser`
- **Recipe:**

  ```makefile
  lint-dep-cruiser: ## Run dependency-cruiser graph-hygiene gate inside the docker container.
      $(BUN_X) depcruise --config .dependency-cruiser.js src
  ```

- **Integration:** Register the target in `.PHONY` and append it to the aggregate `lint` target:

  ```makefile
  lint: lint-next lint-tsc lint-md format-check lint-test-structure lint-dep-cruiser
  ```

- **Rationale:** `$(BUN_X)` (= `docker compose run --rm bun bun x`) keeps the gate consistent with
  every other lint target and inside the same `bun` service. Pointing the cruise at `src` roots
  the graph in the governed scope; `src/index.ts` is the entry the policy resolves from.
  Appending to `lint` means a full local `make lint` exercises the gate, and CI invokes the same
  target.
- **Affects:** `Makefile` (`.PHONY` list, new target, `lint:` chain).

### Decision 5: CI Job Structure

- **Approach:** New dedicated workflow file `.github/workflows/dependency-cruiser.yml`.
- **Trigger:** `pull_request` targeting `main` (mirrors `static-testing.yml`).
- **Permissions:** `contents: read`.
- **Runner / runtime:** `ubuntu-latest`; the docker-compose `bun` service provides the Node/bun
  runtime, so no `setup-node` step. Action pins use TAGs (`actions/checkout@v4`), and the checkout
  step sets `with: { persist-credentials: false }` so the job's `GITHUB_TOKEN` is not left on disk.
- **Steps:** checkout -> (detect runtime project files, mirroring static-testing's gate) ->
  `make start` -> `make lint-dep-cruiser` -> `make down` (`if: always()`).
- **Required check:** Registered as a required status check in branch protection for PRs to
  `main`; the check name matches the workflow/job.
- **Rationale:** A dedicated workflow isolates the graph-hygiene failure signal, mirrors the CRM
  split-out convention, and yields independent job history. The runtime-detection gate keeps the
  workflow inert on bootstrap PRs that lack `package.json` + `bun.lock`, consistent with
  `static-testing.yml`.
- **Affects:** `.github/workflows/dependency-cruiser.yml` (new file).

### Decision 6: Reporting Format

- **Primary:** Plain job logs using the DEFAULT `text` reporter (NOT `err`). `text` prints one
  line per finding — naming the offending file and the violated rule — for BOTH `error`- and
  advisory (`warn`/`info`)-severity matches, and still exits non-zero whenever any `error`-severity
  rule matches.
- **Why not `err`:** The `err` reporter suppresses everything below `error`, which would hide the
  deliberately-kept advisory warns (`peer-deps-used`, `not-to-deprecated`, `no-duplicate-dep-types`,
  `optional-deps-used`). Those exist to stay VISIBLE in CI output, so the reporter is pinned to
  `text` to reconcile with Decision 2's `reporterOptions.text` and the advisory rules in
  Decision 3. The PRD output FRs (FR16) require advisory `warn`-severity findings to remain
  visible alongside `error` violations rather than be suppressed by an error-only reporter.
- **Success output:** A clean run prints no violations and exits zero.
- **No baseline:** There is no `depcruise-baseline` file; every violation surfaces on every run.
- **Rationale:** The `text` reporter is the most actionable default for CI and local use — it
  states file + rule directly for every severity, satisfying the "no raw tool internals"
  requirement without extra formatting setup. Visual/graph reporters (`dot`/`archi`) are out of
  scope per the PRD.
- **Affects:** `.dependency-cruiser.js` reporter behavior; `lint-dep-cruiser` recipe output.

### Decision 7: Kebab-case Path Normalization & Migration

- **Strategy:** The naming rules (`no-uppercase-paths`, `component-name-kebab-case`,
  `test-name-kebab-case`) are adopted per stakeholder direction, but they CANNOT be enabled under
  zero-tolerance against the current tree. The existing PascalCase component tree (~21 top-level
  component dirs plus nested subcomponents such as `UiFooter/PrivacyPolicy/`,
  `UiCardItem/ServicesHoverCard/`, PascalCase files like `CardContent.tsx` / `UiFooter.tsx`, and
  the `index.ts`/`index.tsx` barrels) and the camelCase test files (`authSkeleton.spec.ts`,
  `backToMain.spec.ts`) must FIRST be renamed (via `git mv`) to lowercase kebab-case, with all
  barrels, internal `@/` and relative imports, Storybook `*.stories.tsx`, and tests updated to
  match. React export IDENTIFIERS stay PascalCase (e.g. `export const UiButton`); only the file
  and directory PATHS become kebab-case (`ui-button/ui-button.tsx`). This is what FR23 requires.
- **Sequencing:** Epic 1 enables the BASE gate (generic-health, type-split, components-centric
  boundary rules) on the CURRENT tree with the naming rules OFF, so the zero-tolerance gate can go
  green without a tree-wide rename. Epic 4 then performs the kebab-case migration and, in the same
  slice, turns the three naming rules ON — the run that enables them must pass with zero
  `no-uppercase-paths` / kebab violations.
- **Rationale:** Enabling a lowercase-path rule against a PascalCase tree would fail every governed
  file at once, coupling a large mechanical rename to the gate's first introduction and inflating
  the blast radius of Epic 1. Splitting the rename into its own epic keeps each slice
  independently verifiable: Epic 1 proves the boundary/health policy holds, Epic 4 proves the
  naming policy holds after normalization. Keeping export identifiers PascalCase preserves the
  public API and every consumer import while still satisfying the path convention.
- **Affects:** `src/components/**` (dir + file renames, barrels), `tests/**` (camelCase spec
  renames), all internal imports/stories/tests referencing renamed paths,
  `.dependency-cruiser.js` (enabling the three naming rules in the Epic 4 slice).

### Decision Impact Analysis

**Implementation Sequence:**

1. Add `dependency-cruiser@^17.3.7` as a devDependency; refresh `bun.lock`.
2. Author `.dependency-cruiser.js` (CommonJS, `forbidden`-only, options per Decision 2, rule set
   per Decision 3); no baseline.
3. Add the `lint-dep-cruiser` Makefile target; register it in `.PHONY`.
4. Append `lint-dep-cruiser` to the aggregate `lint:` chain.
5. Run the gate against current `main` and resolve any pre-existing violations in the same slice
   (zero-tolerance baseline compliance).
6. Create `.github/workflows/dependency-cruiser.yml` (PR -> main, `contents: read`,
   `make start` / `make lint-dep-cruiser` / `make down`, `actions/checkout@v4`).
7. Register the workflow as a required status check in branch protection for `main`.
8. Document the gate in `CONTRIBUTING.md` and `README.md` (what it enforces, ESLint
   complementarity, local `make lint-dep-cruiser` usage, failure interpretation).

**Cross-Component Dependencies:**

- `.dependency-cruiser.js` depends on `tsconfig.json` (and the extended `tsconfig.paths.json`)
  for `@/*` resolution.
- `lint-dep-cruiser` depends on the policy file existing and on the `bun` service being up
  (`make start`).
- The aggregate `lint` target depends on `lint-dep-cruiser` being exit-code-correct.
- `dependency-cruiser.yml` depends on `make lint-dep-cruiser` and the runtime-detection gate.
- The branch-protection required-check name must match the workflow/job name exactly.

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

Six areas where implementing agents could diverge — all locked below.

### Naming Patterns

- **Make target:** `lint-dep-cruiser` (exactly; not `lint-deps`, not `lint-dependency-cruiser`).
- **Workflow file:** `.github/workflows/dependency-cruiser.yml`.
- **Policy file:** `.dependency-cruiser.js` at repository root (CommonJS).
- **Required-check name:** must match the workflow/job name exactly.

### Structure Patterns

**Governed Scope:**

- Analyzed: `src` (graph rooted at `src/index.ts`).
- Excluded / not followed: `node_modules`, `build`, `.next`, `storybook-static`, `coverage`,
  `.stryker-tmp`, `playwright-report`, `test-results`, `reports`, `.lighthouseci`, `.qlty`.
- The repository `tests/` tree is NOT analyzed as source; it is enforced as a forbidden target of
  `src/` via `src-not-to-tests` / `not-to-test`.
- All agents MUST use this exact scope — no ad-hoc path additions.

**Invocation:**

- CI calls `make lint-dep-cruiser`, never a raw `bun x depcruise` line in YAML.
- The Makefile target is the single source of truth for the command, config path, and scope.

### Format Patterns

- **Enforcement mode:** zero-tolerance. No `depcruise-baseline` file may be created.
- **Failure output:** the default `text` reporter — one line per finding naming file + rule, keeping advisory `warn`/`info` findings visible.
- **Severity discipline:** boundary-critical rules are `error`; advisory rules are `warn`/`info`
  and do not fail the gate.

### Process Patterns

- **Alias resolution:** `tsConfig.fileName` MUST be `tsconfig.json` (which extends
  `tsconfig.paths.json`). Never point it at `tsconfig.paths.json` directly — the alias-only file
  lacks `include`/compiler context.
- **Naming-rule sequencing:** the `no-uppercase-paths` and kebab-case naming rules ARE adopted,
  but they are enabled only in the Epic 4 slice AFTER the kebab-case migration (Decision 7). Never
  enable them on the current PascalCase tree in Epic 1 — they would fail it wholesale.
- **No bulletproof-react layering rules:** never port CRM's module/feature/repository layering or
  `*-allowed-folders` rules; the layout does not exist here.

### Enforcement Guidelines

**All implementing agents MUST:**

- Name the target `lint-dep-cruiser` and append it to `lint:` and `.PHONY`.
- Cruise `src` only, with the exact exclusion list.
- Resolve `@/*` through `tsconfig.json`.
- Keep the policy `forbidden`-only with no baseline.
- Have CI invoke `make lint-dep-cruiser`, not the raw CLI.

**Anti-Patterns:**

- Creating a `depcruise-baseline` file to silence pre-existing violations.
- Adding a `package.json` script instead of a Makefile target.
- Folding the check into `static-testing.yml` instead of a dedicated workflow.
- Porting CRM bulletproof-react layering rules (those stay dropped).
- Enabling the kebab-case naming rules before the Epic 4 migration (Decision 7).

## Project Structure & Boundaries

### Target-state Repository Change Delta

(target-state — planning only; none of these files are part of this PR)

This initiative extends the existing `ui-toolkit` repository. No new project root.
Planned delta totals (Epics 1-3): 2 new files and 4 modified files. Epic 4 adds a tree-wide
kebab-case rename plus enabling the three naming rules in `.dependency-cruiser.js`.

<!-- markdownlint-disable MD013 -->

| File                                       | Change   | Purpose                                                                                                                                                |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `package.json`                             | modified | Add `dependency-cruiser@^17.3.7` devDependency.                                                                                                        |
| `.dependency-cruiser.js`                   | new      | Committed CommonJS policy: options + `forbidden` rule set; no baseline. Epic 1 base rules; Epic 4 enables the three naming rules.                      |
| `Makefile`                                 | modified | Add `lint-dep-cruiser` target; add to `.PHONY`; append to `lint:` chain.                                                                               |
| `.github/workflows/dependency-cruiser.yml` | new      | Dedicated PR -> main required workflow running `make lint-dep-cruiser`.                                                                                |
| `CONTRIBUTING.md`                          | modified | Document local usage, ESLint complementarity, failure interpretation, and the kebab-case naming convention.                                            |
| `README.md`                                | modified | Document what the gate enforces, how to run it locally, and the kebab-case naming convention.                                                          |
| `src/components/**`                        | renamed  | Epic 4: `git mv` ~21 PascalCase component dirs + nested subcomponents + PascalCase files + barrels to kebab-case (export identifiers stay PascalCase). |
| `tests/**`                                 | renamed  | Epic 4: `git mv` camelCase spec files (`authSkeleton.spec.ts`, `backToMain.spec.ts`, ...) to kebab-case.                                               |
| internal imports / `*.stories.tsx`         | modified | Epic 4: update all `@/` + relative imports, barrels, and Storybook story paths to the renamed kebab-case paths.                                        |

<!-- markdownlint-enable MD013 -->

### Architectural Boundaries

**Tool Boundary:**

- `dependency-cruiser` is a pure devDependency invoked via `bun x depcruise`.
- The repository owns: version pin (`^17.3.7`), the `.dependency-cruiser.js` policy, the
  invocation (`make lint-dep-cruiser`), and reporting choice (default `text`).
- The tool owns: graph construction and rule evaluation — no custom wrappers or patches.

**CI Boundary:**

- `dependency-cruiser.yml` is self-contained: checkout, runtime detection, `make start`,
  `make lint-dep-cruiser`, `make down`.
- It does not call other workflows or reuse shared actions.

**Local/CI Parity Boundary:**

- `make lint-dep-cruiser` is the single source of truth for invocation; CI calls it, not the raw
  CLI.
- Local and CI evaluate the same committed `.dependency-cruiser.js` and the same governed scope.

### Requirements-to-Structure Mapping

<!-- markdownlint-disable MD013 -->

| FR   | Covered by                                                                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1  | `package.json` — `dependency-cruiser@^17.3.7` devDependency (Decision 1).                                                                                         |
| FR2  | `.dependency-cruiser.js` — single CommonJS, `forbidden`-only policy (Decision 2).                                                                                 |
| FR3  | `.dependency-cruiser.js` `options.tsConfig.fileName: 'tsconfig.json'` resolving `@/*` (Decision 2).                                                               |
| FR4  | `.dependency-cruiser.js` scope = `src` from `src/index.ts` + `exclude`/`doNotFollow` list (Decision 2/5).                                                         |
| FR5  | Generic-health rules: `no-circular`, `no-orphans`, `no-non-package-json`, `not-to-unresolvable`, `not-to-dev-dep`, `not-to-test`, `not-to-spec` (Decision 3).     |
| FR6  | Components-centric rules: `src-not-to-tests`, `no-prod-import-of-stories`, `components-public-api` (Decision 3).                                                  |
| FR7  | `type-files-imported-as-type-only`, `type-files-no-runtime-imports` (Decision 3).                                                                                 |
| FR8  | Zero-tolerance — `forbidden`-only policy, no `depcruise-baseline` (Decision 2/6).                                                                                 |
| FR9  | `.github/workflows/dependency-cruiser.yml` — `pull_request` -> `main` (Decision 5).                                                                               |
| FR10 | Dedicated workflow registered as a required status check in branch protection (Decision 5).                                                                       |
| FR11 | `text` reporter exits non-zero on any `error`-severity violation in the `src/` graph (Decision 3/6).                                                              |
| FR12 | `make lint-dep-cruiser` cruises the full governed `src` graph each run (Decision 4).                                                                              |
| FR13 | `Makefile` — `lint-dep-cruiser` target (Decision 4).                                                                                                              |
| FR14 | `lint-dep-cruiser` appended to the aggregate `lint:` chain (Decision 4).                                                                                          |
| FR15 | `text` reporter names offending file and violated rule (Decision 6).                                                                                              |
| FR16 | Workflow job logs render success (clean exit) and failure (`text` output incl. advisory warns) (Decision 5/6).                                                    |
| FR17 | `text` output names file + rule without raw internals (Decision 6).                                                                                               |
| FR18 | Same `.dependency-cruiser.js` + same `src` scope via the shared `make lint-dep-cruiser` (Decision 4).                                                             |
| FR19 | `CONTRIBUTING.md` / `README.md` — what it enforces + ESLint `import/no-cycle` gap complementarity (Decision: Docs).                                               |
| FR20 | `CONTRIBUTING.md` / `README.md` — local `make lint-dep-cruiser` usage + failure interpretation (Decision: Docs).                                                  |
| FR21 | `.dependency-cruiser.js` `no-uppercase-paths` rule (CRM line 472 parity) forbidding uppercase in governed `src/`/`tests/` paths (Decision 3/7).                   |
| FR22 | `.dependency-cruiser.js` `component-name-kebab-case` + `test-name-kebab-case` rules (CRM `src-*-name-kebab-case` parity) (Decision 3/7).                          |
| FR23 | Epic 4 kebab-case migration: `git mv` of `src/components/**` dirs/files + camelCase test files to kebab-case, barrels/imports/stories/tests updated (Decision 7). |
| FR24 | `CONTRIBUTING.md` / `README.md` — documents the all-lowercase kebab-case convention matching the CRM repo (Decision 7 + Docs).                                    |

<!-- markdownlint-enable MD013 -->

### Integration Points

**Makefile Integration:**

```makefile
lint: lint-next lint-tsc lint-md format-check lint-test-structure lint-dep-cruiser

lint-dep-cruiser: ## Run dependency-cruiser graph-hygiene gate inside the docker container.
    $(BUN_X) depcruise --config .dependency-cruiser.js src
```

**GitHub Actions Integration:**

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

**Branch Protection Integration:**

- Required status check name matches the workflow/job name.
- PRs to `main` are blocked until the check passes.

### Data Flow

```text
pull_request event (-> main)
  -> dependency-cruiser.yml triggered
    -> detect runtime project files
      -> make start (bun service up)
        -> make lint-dep-cruiser
          -> bun x depcruise --config .dependency-cruiser.js src
            -> graph rooted at src/index.ts, @/* resolved via tsconfig.json
              -> violations? -> text output (file + rule, all severities) -> exit 1 on any error
              -> clean?      -> no output -> exit 0
        -> make down (if: always())
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All six decisions form a coherent execution chain with no conflicts.
`bun x depcruise` runs in the same `bun` service as every other lint target; the policy resolves
`@/*` through `tsconfig.json`; the dedicated workflow invokes the single `make lint-dep-cruiser`
target. No additional toolchain step is required.

**Pattern Consistency:** Zero-tolerance enforcement aligns with the `forbidden`-only policy and
the no-baseline rule. The runtime-detection gate cleanly mirrors `static-testing.yml`, keeping
the workflow inert on bootstrap PRs.

**Structure Alignment:** The repository delta maps directly and completely to all 24 FRs
(FR1-FR20 base gate; FR21-FR24 naming rules + kebab-case migration via Decision 7 / Epic 4). The
required-check name convention satisfies branch-protection registration.

### Requirements Coverage Validation ✅

All 24 functional requirements (FR1-FR24) are covered, as shown in the
Requirements-to-Structure Mapping. FR21-FR24 — the reinstated naming rules
(`no-uppercase-paths`, `component-name-kebab-case`, `test-name-kebab-case`), the kebab-case
normalization of the current PascalCase/camelCase tree, and the naming-convention documentation —
are covered by Decision 3 (rules), Decision 7 (migration sequencing), and the Epic 4 slice; they
are enabled only after the migration so the zero-tolerance gate passes on the enabling run. All
NFRs are addressed: reliability (deterministic
`forbidden`-only evaluation against committed policy), consistency (shared
`make lint-dep-cruiser` + single `.dependency-cruiser.js` + identical `src` scope across local and
CI, non-redundant with ESLint by owning the disabled `import/no-cycle` gap and boundary checks),
usability (`text` output names file + rule; documented local workflow), and performance
(operationally acceptable inside the existing `bun` service, no fixed numeric target).

### Gap Analysis Results

**Blocking — Dev+peer dependency overlap is the dominant first-run consideration:**
Because this published library mirrors its runtime libraries into both `devDependencies` and
`peerDependencies` (only `swiper` is a true `dependency`), a verbatim CRM `not-to-dev-dep` rule
(`src` ↛ `npm-dev`) would fire on every `@mui/material`, `react`, `react-hook-form`, `i18next`,
`react-i18next`, `@mui/system`, and `@emotion/react` import — 100+ violations — and fail the whole
tree on the first zero-tolerance run. This, NOT cycles/orphans, is the largest baseline-compliance
risk. The rule MUST be authored re-scoped from the start: forbid only **truly dev-only** modules
(`npm-dev` AND not `npm-peer`), allowlisting every module that is also a `peerDependency`. The
`.dependency-cruiser.js` author must verify against `package.json` that no dev+peer module appears
in the forbidden set before the gate is enabled.

**Important — Zero-tolerance baseline compliance:**
Before registering the workflow as a required check, run `make lint-dep-cruiser` against current
`main` and resolve any pre-existing violations (cycles, orphans, leaked stories, truly dev-only
imports) within the same delivery slice. No `depcruise-baseline` file may be introduced. This is
an implementation prerequisite, not a scope change.

**Important — `no-orphans` allowlist correctness:**
The allowlist is expressed as regex CLASSES (not enumerated paths): `\.d\.ts$` (covering
`src/types/styles.d.ts`, `src/components/Types.d.ts`, and `src/react-app-env.d.ts`),
`\.stories\.tsx$` (all 21 stories), `fonts\.css`, and
`^src/(components/)?index\.(ts|tsx)$` (both entry barrels). This must be in place — otherwise the
zero-tolerance gate fails the tree on first run.

**Minor — Entry-file inconsistency:**
Component entry files are inconsistently `index.tsx` or `index.ts`. The `components-public-api`
and `no-orphans` rules must treat both as the public barrel.

### Architecture Completeness Checklist

#### ✅ Requirements Analysis

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (low complexity, medium operational sensitivity)
- [x] Technical constraints identified (make + bun service + GitHub Actions conventions)
- [x] Cross-cutting concerns mapped

#### ✅ Architectural Decisions

- [x] Tool & version specified (`dependency-cruiser@^17.3.7`, `bun x depcruise`)
- [x] Config file design defined (`.dependency-cruiser.js`, CommonJS, no baseline)
- [x] Rule set defined (ported generic + type-split + components-centric + reinstated naming rules; CRM layering rules dropped)
- [x] Make target design defined (`lint-dep-cruiser`, `.PHONY`, appended to `lint:`)
- [x] CI structure decided (dedicated `dependency-cruiser.yml`, required check)
- [x] Reporting format decided (default `text` output, no baseline)

#### ✅ Implementation Patterns

- [x] Naming conventions locked (target, workflow, policy, required-check)
- [x] Governed scope locked (`src` only, exact exclusion list)
- [x] Alias resolution locked (`tsconfig.json`)
- [x] Enforcement mode locked (zero-tolerance, no baseline)
- [x] Local/CI parity pattern locked (`make lint-dep-cruiser` single source of truth)

#### ✅ Project Structure

- [x] Complete file delta defined (2 new, 4 modified for Epics 1-3; plus Epic 4 kebab-case rename)
- [x] Component boundaries established (tool / CI / local-CI parity)
- [x] Integration points mapped (Makefile -> workflow -> branch protection)
- [x] Requirements-to-structure mapping complete (FR1-FR24)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — a low-complexity brownfield change with all six decisions locked,
patterns unambiguous, and the file delta fully specified.

**Key Strengths:**

- Minimal blast radius: 2 new files, 4 modified files
- Single source of truth for invocation (`make lint-dep-cruiser`) eliminates local/CI drift
- Rule set fitted to the real PascalCase component-library layout, not CRM's bulletproof-react
- Dedicated, self-contained CI workflow with no cross-workflow dependencies

**Areas for Future Enhancement:**

- Richer/visual reporting (`dot`/`archi` graph artifacts) — out of current scope per PRD
- Reuse of the policy across other VilnaCRM repositories — out of current scope

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all six architectural decisions exactly as documented.
- Use the locked names — `lint-dep-cruiser`, `.dependency-cruiser.js`,
  `.github/workflows/dependency-cruiser.yml`.
- `make lint-dep-cruiser` is the only valid invocation path; CI must call it, not the raw CLI.
- Resolve `@/*` through `tsconfig.json`; never add bulletproof-react layering rules. The
  kebab-case naming rules ARE adopted but are enabled only in the Epic 4 slice after the migration
  (Decision 7).
- Run the zero-tolerance baseline-compliance check before enabling the required check; never add
  a `depcruise-baseline`.

**First Implementation Step:**
Add `dependency-cruiser@^17.3.7` to `package.json`, author `.dependency-cruiser.js`, add the
`lint-dep-cruiser` Makefile target, and confirm a clean local `make lint-dep-cruiser` run against
the current `src/` graph before creating the CI workflow.
