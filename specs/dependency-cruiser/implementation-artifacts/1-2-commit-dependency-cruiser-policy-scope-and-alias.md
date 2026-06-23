# Story 1.2: Commit the .dependency-cruiser.js policy with scope and alias resolution

Status: draft

## Story

As a maintainer,
I want a single committed .dependency-cruiser.js policy that defines the governed scope,
exclusions, and @/\* alias resolution,
so that all contributors and CI execution paths analyze the same src/ graph against identical
options.

## Acceptance Criteria

1. A `.dependency-cruiser.js` file exists at the repository root and is a CommonJS module that
   uses `module.exports`.
2. The exported object contains a `forbidden` array and an `options` block.
3. No `depcruise-baseline` file exists anywhere in the repository (zero-tolerance enforcement).
4. `options.tsConfig.fileName` is set to `tsconfig.json` (which `extends` `tsconfig.paths.json`),
   so the `@/*` -> `src/*` alias resolves during analysis.
5. `options.tsPreCompilationDeps` is `true`.
6. `options.combinedDependencies` is `true` (this also enables the `not-to-dev-dep`
   `dependencyTypesNot: ['npm-peer']` mechanism in Story 1.3 — dual-placed dev+peer modules are
   tagged both `npm-dev` and `npm-peer`), and `options.detectProcessBuiltinModuleCalls` is `true`
   (CRM parity, so `node:`-prefixed builtin calls are detected for the core-module rules).
7. `options.enhancedResolveOptions` is set as specified by the architecture
   (`exportsFields: ['exports']`; `conditionNames: ['import', 'require', 'node', 'default',
'types']`; `extensions: ['.ts', '.tsx', '.d.ts', '.js']`; `mainFields: ['main', 'types',
'typings']`).
8. `node_modules` is configured under `options.doNotFollow`.
9. `build`, `.next`, `storybook-static`, `coverage`, `.stryker-tmp`, `playwright-report`,
   `test-results`, `reports`, `.lighthouseci`, and `.qlty` are excluded from analysis via
   `options.exclude`.
10. The analyzed graph is rooted at the `src` entry `src/index.ts` (the policy is cruised against
    `src`).

## Tasks / Subtasks

- [ ] Task 1: Author the CommonJS policy skeleton (AC: 1, 2)
  - [ ] 1.1 Create `.dependency-cruiser.js` at the repository root using `module.exports = { ... }`
  - [ ] 1.2 Add a top-level `forbidden: []` array (rule contents land in Story 1.3) and an
        `options: {}` block
  - [ ] 1.3 Confirm the file is CommonJS (no ESM `export`/`import` syntax), consistent with the
        CRM `.dependency-cruiser.js` convention

- [ ] Task 2: Configure alias and TypeScript resolution (AC: 4, 5, 6, 7)
  - [ ] 2.1 Set `options.tsConfig.fileName` to `'tsconfig.json'` (which extends
        `tsconfig.paths.json` — never point it at `tsconfig.paths.json` directly)
  - [ ] 2.2 Set `options.tsPreCompilationDeps` to `true`
  - [ ] 2.3 Set `options.combinedDependencies` to `true`
  - [ ] 2.3a Set `options.detectProcessBuiltinModuleCalls` to `true` (CRM parity)
  - [ ] 2.4 Set `options.enhancedResolveOptions` with `exportsFields`, `conditionNames`,
        `extensions`, and `mainFields` exactly as the architecture specifies
  - [ ] 2.5 Set `options.skipAnalysisNotInRules` to `true`

- [ ] Task 3: Define governed scope and exclusions (AC: 8, 9, 10)
  - [ ] 3.1 Set `options.doNotFollow` to `{ path: 'node_modules' }`
  - [ ] 3.2 Set `options.exclude.path` to a regex covering `build`, `.next`, `storybook-static`,
        `coverage`, `.stryker-tmp`, `playwright-report`, `test-results`, `reports`,
        `.lighthouseci`, and `.qlty`
  - [ ] 3.3 Confirm the cruise scope is `src` (the `lint-dep-cruiser` recipe passes `src`), so the
        graph roots at the public entry `src/index.ts`

- [ ] Task 4: Enforce zero-tolerance / no baseline (AC: 3)
  - [ ] 4.1 Do not run `depcruise --init` baseline generation and do not create a
        `depcruise-baseline` / `.dependency-cruiser-known-violations.json` file
  - [ ] 4.2 Confirm no baseline file is referenced from `.dependency-cruiser.js` `options`

- [ ] Task 5: Verification (AC: 1-10)
  - [ ] 5.1 Run `git ls-files | grep -i baseline` and confirm zero matches
  - [ ] 5.2 Run `make lint-dep-cruiser` (via `make start` in the docker `bun` service) and confirm
        `@/*` imports resolve (no `not-to-unresolvable`-style alias resolution errors)
  - [ ] 5.3 Confirm the run analyzes `src/` only and ignores the excluded build/report directories
  - [ ] 5.4 Confirm `.dependency-cruiser.js` parses as CommonJS and exports `forbidden` + `options`

## Dev Notes

### Architecture Decisions (from specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md)

This story implements **Decision 2: Config File Design** — the committed policy file and its
`options` block. The `forbidden` rule set (Decision 3) is authored in Story 1.3; this story only
establishes the file shape, scope, exclusions, and resolution options.

- **CommonJS, `forbidden`-only, no baseline.** The policy is a single `.dependency-cruiser.js` at
  the repository root using `module.exports`. There is no `depcruise-baseline` file — enforcement
  is zero-tolerance, so any pre-existing graph violation must be fixed in code, never suppressed
  by a baseline (architecture §Decision 2, §Format Patterns, §Enforcement Guidelines).
- **Alias resolution (critical).** `options.tsConfig.fileName` MUST be `tsconfig.json`. That file
  `extends` `tsconfig.paths.json`, which is the sole source of the `@/*` -> `./src/*` mapping
  (verified: `tsconfig.paths.json` declares `"paths": { "@/*": ["./src/*"] }`). Pointing at
  `tsconfig.paths.json` directly is forbidden because the alias-only file lacks `include` /
  compiler context (architecture §Process Patterns).
- **Options block (target shape):**

  ```javascript
  module.exports = {
    forbidden: [
      /* rule set authored in Story 1.3 */
    ],
    options: {
      doNotFollow: { path: 'node_modules' },
      tsPreCompilationDeps: true,
      combinedDependencies: true,
      // CRM parity; ui-toolkit src uses process.env as a global.
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

- **Governed scope.** Analyzed = `src` rooted at `src/index.ts`. `node_modules` is kept out via
  `doNotFollow`; the build/report directories are removed via `exclude`. The repository `tests/`
  tree is NOT analyzed as source — it is enforced as a forbidden target of `src/` by the rule set
  in Story 1.3 (architecture §Structure Patterns / Governed Scope).
- **`tsPreCompilationDeps: true`** surfaces type-only imports that the type-split rules (Story 1.3)
  depend on. **`combinedDependencies: true`** and `enhancedResolveOptions` mirror CRM so package
  resolution behaves identically.

### Project Structure Notes

- **New file:** `.dependency-cruiser.js` (repository root, CommonJS).
- **No baseline file** is created anywhere in the repository.
- **Read-only dependencies** this story relies on (do not modify): `tsconfig.json` (extends
  `tsconfig.paths.json`), `tsconfig.paths.json` (`@/*` -> `./src/*`), and the public entry
  `src/index.ts` -> `src/components/index.ts`.
- **Out of scope for this story:** the `forbidden` rules (Story 1.3), the `lint-dep-cruiser`
  Makefile target and `lint:`/`.PHONY` wiring (Story 1.4 / Epic 2), and the
  `.github/workflows/dependency-cruiser.yml` workflow (Epic 2). This story only needs the target
  to exist enough to run a verification cruise; if run before the target lands, verify with
  `bun x depcruise --config .dependency-cruiser.js src` inside the `bun` service.

### Testing Approach

This story is configuration-only; there are no Jest unit tests to add. Verification is shell-based
(Task 5) and runs inside the docker-compose `bun` service per repository convention (all `make`
quality commands run through that service via `$(BUN_X) = $(RUN_BUN) bun x`):

- **No-baseline assertion:** `git ls-files | grep -i baseline` returns no matches.
- **Alias resolution:** a `make lint-dep-cruiser` (or `bun x depcruise --config
.dependency-cruiser.js src`) run resolves `@/*` source imports without unresolvable errors,
  proving `tsConfig.fileName: 'tsconfig.json'` wires `tsconfig.paths.json` correctly.
- **Scope/exclusion:** the cruise reports modules only under `src/` and never descends into the
  excluded build/report directories.
- **Module shape:** the file is requirable as CommonJS and exports both `forbidden` and `options`.

### References

- Architecture: `specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md`
  - §Decision 2: Config File Design; §Core Architectural Decisions; §Implementation Patterns &
    Consistency Rules (Structure Patterns / Governed Scope, Process Patterns); §Enforcement
    Guidelines; §Requirements-to-Structure Mapping (FR2, FR3, FR4, FR8).
- Epics: `specs/dependency-cruiser/planning-artifacts/epics-dependency-cruiser-2026-06-23.md`
  (Story 1.2).
- PRD: `specs/dependency-cruiser/planning-artifacts/prd-dependency-cruiser-2026-06-23.md`
  - FR2 (single committed CommonJS `forbidden`-only policy), FR3 (`@/*` alias resolution via
    `tsConfig.fileName: 'tsconfig.json'`), FR4 (`src` scope from `src/index.ts` +
    `exclude`/`doNotFollow`), FR8 (zero-tolerance, no `depcruise-baseline`).

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
