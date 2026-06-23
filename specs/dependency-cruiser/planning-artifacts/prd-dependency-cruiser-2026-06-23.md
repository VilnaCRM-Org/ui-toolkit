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
  - 'https://github.com/VilnaCRM-Org/ui-toolkit/issues/58'
  - 'README.md'
  - 'CONTRIBUTING.md'
  - '.github/workflows/static-testing.yml'
  - 'package.json'
  - 'Makefile'
  - 'eslint.config.mjs'
workflowType: 'prd'
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 6
classification:
  projectType: 'developer_tool'
  domain: 'general'
  complexity: 'low'
  projectContext: 'brownfield'
---

# Product Requirements Document - dependency-cruiser CI check for ui-toolkit

**Author:** platform-team
**Date:** 2026-06-23T12:00:00+02:00

## Executive Summary

This initiative adds a required `dependency-cruiser` CI check to the `@vilnacrm/ui-toolkit`
repository for pull requests targeting `main`. The change turns module-boundary and
dependency-graph hygiene for this React 19 + MUI 9 component library into an explicit, automated
policy rather than a manual reviewer judgment.

The check must evaluate the `src/` dependency graph rooted at the public entry `src/index.ts`
under a committed `.dependency-cruiser.js` policy, fail on any violation with zero tolerance (no
baseline), and produce actionable failure output that names the offending file and the violated
rule. Contributors must be able to run the same check locally through `make lint-dep-cruiser`
before marking a pull request ready for review.

The policy intentionally complements the existing ESLint setup rather than duplicating it.
ESLint's `eslint-plugin-import` is active for `import/order` and `no-extraneous-dependencies`,
but `import/no-cycle` is explicitly disabled, so circular-import detection is a genuine gap that
`dependency-cruiser` fills. The gate also owns orphan detection, the `src` ↛ `tests` direction,
barrel/public-API discipline, exclusion of stories and truly dev-only dependencies from
production paths, and type-only import discipline — none of which any existing linter enforces
here.

The policy also enforces an all-lowercase kebab-case naming convention for files and folders
(matching the CRM repo), ported from CRM's `no-uppercase-paths` and `src-*-name-kebab-case`
rules. Because the repository today uses PascalCase component directories and camelCase test
files, enabling these naming rules requires a one-time normalization of the current
`src/components/` tree and the camelCase test files so the zero-tolerance gate passes on the run
that turns the rules on.

This PRD covers only this repository-level CI check effort for `ui-toolkit`. The
`rust-code-analysis` gate (issue #59), IDE/editor integration, multi-repository reuse, and
auto-fix are outside the current scope.

## Success Criteria

### User Success

- Contributors can run `dependency-cruiser` locally before pushing, via `make lint-dep-cruiser`.
- Contributors can identify the failing source file and the violated rule directly from the
  check output.
- Maintainers can rely on a single required graph-hygiene status check for pull requests to
  `main`.

### Business Success

- Module-boundary and dependency-graph enforcement for this repository moves from reviewer
  discretion to an automated repository policy.
- A pull request is not considered ready for review while the required `dependency-cruiser`
  check is failing.

### Technical Success

- CI runs `dependency-cruiser` automatically for pull requests targeting `main`.
- The check fails when the committed `.dependency-cruiser.js` policy is violated, with no
  baseline to suppress findings.
- The failure output is actionable enough for authors to fix violations without interpreting raw
  tool internals.
- Repository documentation explains how to run the same check locally and how the gate
  complements ESLint.

### Measurable Outcomes

- The repository contains a committed `.dependency-cruiser.js` policy and a `dependency-cruiser`
  devDependency.
- Pull requests to `main` surface a required `dependency-cruiser` result.
- Documentation for local execution and failure interpretation is present in project docs
  (`CONTRIBUTING.md` and `README.md`).

## Product Scope

### Current Scope

- Add `dependency-cruiser` to CI for pull requests to `main` as a required check.
- Commit a `.dependency-cruiser.js` policy tuned to this repository's `src/` structure.
- Fail the CI check on any policy violation with zero tolerance.
- Enforce an all-lowercase kebab-case convention for files and folders under `src/` and `tests/`
  (matching the CRM repo), which requires a one-time normalization of the current PascalCase
  component tree and camelCase test files so the gate passes.
- Provide a `make lint-dep-cruiser` target and register it in the aggregate `lint` flow.
- Document local usage and failure interpretation for contributors.

### Deferred Work

- No additional follow-on scope is committed in this PRD.

### Future Considerations

- Reassess richer reporting (graph artifacts, `dot`/`archi` visual output in CI) or reuse of
  this policy in other repositories only after this repository-level gate proves useful.

## User Journeys

### Journey 1: Contributor Pre-Review Success Path

A contributor changes component code under `src/components/` for the `ui-toolkit` repository and
prepares a pull request to `main`. Before marking the PR ready for review, the contributor runs
`make lint-dep-cruiser`. The command cruises the `src/` graph from `src/index.ts` against the
committed policy and reports any violations — a circular import, an orphaned module, a leaked
dev-only or story import, or a type-only discipline breach — with enough detail to identify the
failing file and rule. The contributor fixes the issues, reruns the command, and pushes a branch
that satisfies the policy. CI runs the same check on the pull request, and the contributor marks
the PR ready for review only after the required check passes.

### Journey 2: Contributor Failure and Recovery Path

A contributor pushes a change set that introduces a circular import between two component
directories. CI fails the required `dependency-cruiser` check on the pull request. The
contributor reads the failure output, which names the violated rule (`no-circular`) and the
modules forming the cycle, breaks the cycle, reruns `make lint-dep-cruiser` locally until it
passes, and pushes again. The contributor does not treat the PR as ready for review while the
required check is failing.

### Journey 3: Maintainer Readiness and Enforcement Path

A maintainer looks at a pull request targeting `main` and uses the required `dependency-cruiser`
status check as the repository's module-boundary gate. If the check is failing, the pull request
does not satisfy repository graph-hygiene policy and is not considered ready for review. If the
check is passing, the maintainer can review the change knowing the dependency-graph rules —
cycles, orphans, public-API discipline, and the `src` ↛ `tests` direction — have already been
enforced automatically and do not need manual policing in review.

### Journey Requirements Summary

- A documented local command for contributors (`make lint-dep-cruiser`)
- A required CI status check for pull requests to `main`
- A shared `.dependency-cruiser.js` policy committed in the repository
- Failure output that names the violating file and the violated rule
- Repository workflow language that ties check status to review readiness

## Developer-Tool-Specific Requirements

### Project-Type Overview

This initiative adds a repository-level developer quality tool to the `ui-toolkit` codebase. It
is an internal engineering control, not a user-facing library feature. Its purpose is to enforce
repository-defined dependency-graph and module-boundary policy for the published component
library and surface actionable failures before review.

### Technical Architecture Considerations

The repository must own the `dependency-cruiser` policy as a committed `.dependency-cruiser.js`
(CommonJS `module.exports`, `forbidden`-only, zero-tolerance with no baseline). The gate is
invoked through Bun inside the existing docker-compose `bun` service (`bun x depcruise`),
consistent with how every other lint target runs. The policy must resolve the repository's `@/*`
path alias by pointing `tsConfig.fileName` at `tsconfig.json` (which extends
`tsconfig.paths.json`, the sole alias source). Local contributor usage is exposed through a
`make` target. IDE/editor integration is out of scope.

### Governed Analysis Scope

- The governed scope is the `src/` dependency graph rooted at the public entry `src/index.ts`,
  which re-exports `src/components/`. Only `src/components/` and `src/types/` hold real code;
  the `src/{hooks,lib,providers,routes,stores,utils}` placeholder directories are empty and
  carry no rules.
- The following directories are explicitly excluded / not followed: `node_modules`, `build`,
  `.next`, `storybook-static`, `coverage`, `.stryker-tmp`, `playwright-report`, `test-results`,
  `reports`, `.lighthouseci`, and `.qlty`.
- Repository tests under `tests/` are not part of the governed source graph; the policy instead
  enforces that `src/` must not depend on `tests/`.

### Local Execution Requirements

- Contributors run the check locally through the `make lint-dep-cruiser` target for this
  initiative.
- Contributors do not need to construct the raw `bun x depcruise` invocation themselves.
- The target is appended to the aggregate `lint` target so a full local `make lint` exercises
  the gate.

### Documentation Requirements

- Repository documentation must explain:
  - what the check enforces (cycles, orphans, public-API/barrel discipline, `src` ↛ `tests`, no
    production import of stories or truly dev-only dependencies, type-only import discipline)
  - how to run it locally using `make lint-dep-cruiser`
  - what it means when the check fails and how it complements (does not duplicate) ESLint
- IDE/editor integration guidance is out of scope for this initiative.
- Example catalogs and graph-visualization tutorials are out of scope for this initiative.

### Implementation Considerations

- The repository must provide one stable local execution path that matches CI exactly.
- The committed policy must define the governed analysis scope and exclusions clearly enough to
  avoid ambiguity for both source and excluded artifact directories.
- The policy must NOT include CRM-style bulletproof-react layering rules (no modules/features/
  repositories layout exists here).
- The policy DOES enforce all-lowercase kebab-case paths (CRM `no-uppercase-paths` and
  `src-*-name-kebab-case` parity). Because component directories are PascalCase and some test
  files are camelCase today, the current tree must be normalized to kebab-case as part of the
  same delivery slice so the `no-uppercase-paths`/kebab rules pass with zero tolerance.
- Failure output must remain understandable enough for contributors to remediate quickly.

## Project Scoping & Delivery Boundaries

### Delivery Strategy

**Delivery Approach:** Single-slice repository change focused on enforcing one
`dependency-cruiser` graph-hygiene gate for `ui-toolkit`
**Resource Requirements:** One engineer delivering the change in a single implementation slice /
PR stream

This scope is intentionally narrow. Its purpose is to make `dependency-cruiser` a required
repository policy, not to create a broader code quality platform. Any work that would require
staged rollout, a non-blocking transition, or parallel implementation tracks is out of scope.

### Current Feature Set

**Core User Journeys Supported:**

- Contributor pre-review success path
- Contributor failure and recovery path
- Maintainer readiness and enforcement path

**Must-Have Capabilities:**

- Declare `dependency-cruiser` as a devDependency and commit a `.dependency-cruiser.js` policy
- Run `dependency-cruiser` automatically in CI for pull requests targeting `main`
- Fail the required check on any policy violation with zero tolerance (no baseline)
- Govern the `src/` graph from `src/index.ts` and exclude the listed build/report directories
- Enforce generic health rules, components-centric boundary rules, and type/runtime-split rules
- Provide one stable local execution path through `make lint-dep-cruiser`
- Document what the check enforces, how to run it locally, what failure means, and how it
  complements ESLint
- Include whatever repository updates are necessary so the blocking gate can be enabled without
  a non-blocking transition

### Explicitly Out of Scope

No additional follow-on work is committed by this PRD. The `rust-code-analysis` gate (issue
#59), reuse in other repositories, IDE integration, richer/visual reporting,
`depcruise-baseline` adoption, and auto-fix are deferred unless a later planning effort
explicitly adds them.

### Risk Mitigation Strategy

**Technical Risks:** A zero-tolerance policy may fail broadly on first introduction if the
existing graph already contains cycles or orphans. Mitigation: tune the committed policy to the
real `src/` structure (entry barrel, stories, dotfiles, and `.d.ts` files allowlisted for orphan
detection) and resolve any pre-existing violations as part of the same delivery slice rather
than introducing a baseline.

**Adoption Risks:** Contributors may perceive the gate as redundant with ESLint or as noisy.
Mitigation: document the complementarity explicitly (it fills the disabled `import/no-cycle` gap
and owns boundaries ESLint does not check) and require actionable failure output and a simple
`make`-based local workflow.

**Resource Risks:** Scope creep is the primary delivery risk with one engineer and one
implementation slice. Mitigation: keep IDE integration, visual reporting, baseline adoption,
multi-repo reuse, and the `rust-code-analysis` gate explicitly out of scope.

## Functional Requirements

### Tooling & Policy Definition

- FR1: The repository can declare `dependency-cruiser` as a devDependency so the check is
  available through the existing Bun-based tooling.
- FR2: The repository can commit a single `.dependency-cruiser.js` policy (CommonJS
  `module.exports`, `forbidden`-only) that defines all enforced rules.
- FR3: The committed policy can resolve the repository's `@/*` path alias by referencing
  `tsconfig.json` so aliased source imports are analyzed correctly.
- FR4: The committed policy can scope analysis to the `src/` graph rooted at `src/index.ts` and
  exclude build, report, and tooling directories (`node_modules`, `build`, `.next`,
  `storybook-static`, `coverage`, `.stryker-tmp`, `playwright-report`, `test-results`,
  `reports`, `.lighthouseci`, `.qlty`).

### Graph-Hygiene Rules

- FR5: The policy can enforce generic dependency-health rules — no circular dependencies, no
  orphan modules (with an allowlist for dotfiles, `.d.ts` files, config, the entry barrel, and
  stories), no imports of modules absent from `package.json`, no unresolvable imports, no
  production imports of **truly dev-only** dependencies (dev-only modules that are not also
  declared as `peerDependencies`, since this published library mirrors its runtime libraries into
  both `devDependencies` and `peerDependencies`), and no production imports of test or spec files.
- FR6: The policy can enforce components-centric boundary rules for this library, including that
  `src/` must not depend on the repository `tests/` tree and that production code must not
  import `*.stories.tsx` story files.
- FR7: The policy can enforce type/runtime-split discipline so that type-only modules are
  imported as types only and do not introduce runtime imports.
- FR8: The policy can enforce the boundary as zero-tolerance, with no `depcruise-baseline` file
  suppressing violations.

### Quality Gate Enforcement

- FR9: The repository can execute `dependency-cruiser` automatically in CI for pull requests
  targeting `main`.
- FR10: A pull request targeting `main` can surface a required `dependency-cruiser` result as
  part of repository quality policy.
- FR11: The required `dependency-cruiser` result can fail when the governed `src/` graph
  violates the committed policy.
- FR12: The required `dependency-cruiser` result can evaluate the full governed `src/` graph on
  each pull request.

### Contributor Validation

- FR13: Contributors can run the repository-defined `dependency-cruiser` check locally through
  the `make lint-dep-cruiser` target.
- FR14: Contributors can use the local check to evaluate the same committed policy before
  marking a pull request ready for review, and the target is included in the aggregate `make
lint` flow.
- FR15: Contributors can identify from a failed check which source file and which rule violated
  repository policy.

### CI Results Reporting

- FR16: CI runs can produce human-readable output for both successful and failed
  `dependency-cruiser` evaluations, using the actionable default/text reporter so that advisory
  `warn`-severity findings remain visible alongside `error`-severity violations rather than being
  suppressed by an error-only reporter.
- FR17: Failed CI runs can report policy violations clearly enough — naming the offending file
  and the violated rule — for contributors to remediate them without interpreting raw tool
  internals.

### Repository Policy Consistency

- FR18: CI and local execution can evaluate `dependency-cruiser` results against the same
  committed `.dependency-cruiser.js` policy and the same governed-scope definition.

### Contributor Documentation

- FR19: Contributors can access repository documentation describing what the
  `dependency-cruiser` check enforces and how it complements ESLint by filling the disabled
  circular-import gap.
- FR20: Contributors can access repository documentation describing how to run the check locally
  through `make lint-dep-cruiser` and how to interpret check failures.

### Naming & Path Normalization

- FR21: All governed source files and directories under `src/` and `tests/` MUST be lowercase
  kebab-case; the policy forbids any uppercase character in governed source paths, ported from
  CRM's `no-uppercase-paths` rule (error).
- FR22: Component directories and their files under `src/components/` MUST follow kebab-case
  naming (e.g. `ui-button/`, `card-content.tsx`), enforced by a dedicated kebab-case naming rule
  (CRM `src-*-name-kebab-case` parity), with test directories/files under `tests/` likewise
  kebab-case.
- FR23: The repository's existing PascalCase/camelCase paths (the ~21
  `src/components/<PascalName>/` dirs and their PascalCase files, the
  `src/index.ts`→`src/components/index.ts` barrels, all internal `@/` and relative imports,
  Storybook `*.stories.tsx`, and camelCase test files such as `authSkeleton.spec.ts`/
  `backToMain.spec.ts`) MUST be normalized to kebab-case so the zero-tolerance gate passes with
  no `no-uppercase-paths`/kebab violations on the run that enables the naming rules.
- FR24: Contributor documentation MUST state the kebab-case naming convention — all files and
  folders lowercase kebab-case, matching the CRM repo — alongside the existing dependency-rule
  documentation.

## Non-Functional Requirements

### Reliability

- The `dependency-cruiser` gate must be trustworthy enough that contributors and maintainers can
  treat failures as real policy signals.
- Repeated evaluations against the same code state and committed policy must not produce
  materially inconsistent pass/fail outcomes.

### Consistency

- Local execution through `make lint-dep-cruiser` and CI execution must evaluate the same
  governed `src/` scope against the same committed policy.
- The policy must remain non-redundant with ESLint: it must own the boundaries ESLint does not
  enforce (circular imports, orphans, `src` ↛ `tests`, public-API/barrel discipline, no
  production import of stories or truly dev-only dependencies, type-only discipline) rather than
  duplicating active `import/order` or `no-extraneous-dependencies` checks.

### Usability

- Failed CI output and local output must be understandable enough for routine contributor and
  maintainer use without requiring interpretation of raw tool internals, naming the offending
  file and rule.
- Local usage guidance must be understandable enough for contributors to run and interpret the
  check as part of normal repository workflow.

### Performance

- The check must be operationally acceptable for routine pull request use within the existing
  docker-compose `bun` service.
- This PRD does not impose a fixed numeric execution-time target.
