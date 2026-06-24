/**
 * dependency-cruiser policy for @vilnacrm/ui-toolkit.
 *
 * Zero-tolerance graph-hygiene gate over the governed `src/` graph (rooted at
 * `src/index.ts`). There is intentionally NO depcruise-baseline: any violation
 * must be fixed in code, never suppressed.
 *
 * The `forbidden` rule set ports dependency-cruiser's generic-health rules,
 * adds this library's components-centric boundary rules and the type/runtime
 * split rules, and re-scopes `not-to-dev-dep` for a published component library
 * that mirrors its runtime libraries into BOTH `devDependencies` and
 * `peerDependencies`. CRM bulletproof-react layering rules are intentionally
 * NOT ported (no modules/features/repositories layout exists here). The three
 * naming rules (`no-uppercase-paths`, `component-name-kebab-case`,
 * `test-name-kebab-case`) are deferred to Epic 4 — they cannot pass under
 * zero-tolerance until the PascalCase tree is migrated to kebab-case.
 *
 * `tsConfig.fileName` points at `tsconfig.json` (which `extends`
 * `tsconfig.paths.json`) so the `@/*` -> `./src/*` alias resolves during
 * analysis. Never point it at `tsconfig.paths.json` directly — that alias-only
 * file lacks the `include`/compiler context dependency-cruiser needs.
 */
module.exports = {
  forbidden: [
    // ---- Generic graph health (ported from dependency-cruiser recommended) ----
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'This dependency is part of a circular relationship. Revise the design ' +
        '(dependency inversion / single responsibility) to break the cycle.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'error',
      comment:
        'This is an orphan module — nothing imports it. Either use it or remove ' +
        'it. Type declarations, stories, the side-effect fonts.css, the entry ' +
        'barrels, and dot/config files are allowlisted below.',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', // dotfiles (e.g. .eslintrc.js)
          '\\.d\\.ts$', // type declarations (Types.d.ts, styles.d.ts, react-app-env.d.ts)
          '(^|/)tsconfig\\.json$',
          '(^|/)(?:babel|webpack)\\.config\\.(?:js|cjs|mjs|ts|json)$',
          '\\.stories\\.tsx$', // Storybook stories are entry points, not orphans
          'fonts\\.css$', // side-effect import in src/components/index.ts
          '^src/(components/)?index\\.(ts|tsx)$', // public entry barrels
        ],
      },
      to: {},
    },
    {
      name: 'no-deprecated-core',
      severity: 'warn',
      comment:
        'This module depends on a deprecated Node/bun core module. Find an ' +
        'alternative — these are bound to exist.',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: '^(?:punycode|domain|constants|sys|_linklist|_stream_wrap)$',
      },
    },
    {
      name: 'not-to-deprecated',
      severity: 'warn',
      comment:
        'This module uses a (version of an) npm module marked deprecated. ' +
        'Upgrade or replace it.',
      from: {},
      to: { dependencyTypes: ['deprecated'] },
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      comment:
        'This module depends on an npm package not declared in package.json ' +
        '(dependencies/peer/optional). Add it so installs are reproducible.',
      from: {},
      to: { dependencyTypes: ['npm-no-pkg', 'npm-unknown'] },
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      comment:
        'This module depends on a module that cannot be resolved on disk. ' +
        'Fix the path or add the missing package.',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'no-duplicate-dep-types',
      severity: 'warn',
      comment:
        'This module is pulled in via more than one dependency type (e.g. both ' +
        'devDependency and peerDependency). For this library that dev+peer ' +
        'overlap is intentional, so this stays advisory (warn).',
      from: {},
      to: { moreThanOneDependencyType: true, dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'optional-deps-used',
      severity: 'info',
      comment:
        'This module uses an optional dependency. Confirm the import is guarded ' +
        'for the case the dependency is absent.',
      from: {},
      to: { dependencyTypes: ['npm-optional'] },
    },
    {
      name: 'peer-deps-used',
      severity: 'warn',
      comment:
        'This module uses a peerDependency directly. For a published component ' +
        'library this is expected (the consumer supplies it); kept visible as ' +
        'an advisory warn.',
      from: { pathNot: '[.](?:spec|test|stories)[.](?:tsx?|jsx?)$' },
      to: { dependencyTypes: ['npm-peer'] },
    },
    // ---- Dev-only dependency leak (re-scoped for a dev+peer library) ----
    {
      name: 'not-to-dev-dep',
      severity: 'error',
      comment:
        'Production src/ code must not import a TRULY dev-only devDependency ' +
        '(e.g. jest, storybook, webpack, eslint). Runtime libraries this ' +
        'library mirrors into both devDependencies and peerDependencies are ' +
        'spared via dependencyTypesNot: [npm-peer] (combinedDependencies tags ' +
        'them as both npm-dev and npm-peer), so only true dev-only modules fail.',
      from: { path: '^src', pathNot: '[.](?:spec|test|stories)[.](?:tsx?|jsx?)$' },
      to: {
        dependencyTypes: ['npm-dev'],
        dependencyTypesNot: ['npm-peer', 'type-only'],
        pathNot: ['node_modules/@types/'],
      },
    },
    // ---- Components-centric boundaries (replace CRM bulletproof-react layering) ----
    {
      name: 'src-not-to-tests',
      severity: 'error',
      comment:
        'Production src/ code must not depend on the tests/ tree. Tests import ' +
        'source, never the reverse.',
      from: { path: '^src' },
      to: { path: '^tests/', pathNot: '[.](?:spec|test)[.](?:tsx?|jsx?)$' },
    },
    {
      name: 'not-to-spec',
      severity: 'error',
      comment: 'Production src/ code must not import a *.spec.* / *.test.* file.',
      from: { path: '^src' },
      to: { path: '[.](?:spec|test)[.](?:tsx?|jsx?)$' },
    },
    {
      name: 'no-prod-import-of-stories',
      severity: 'error',
      comment:
        'Production src/ code must not import a *.stories.* file. Stories are ' +
        'Storybook entry points, not shippable modules.',
      from: { path: '^src', pathNot: '\\.stories\\.tsx$' },
      to: { path: '\\.stories\\.' },
    },
    {
      name: 'components-public-api',
      severity: 'error',
      comment:
        'Runtime imports between components must go through the target ' +
        "component's public entry (index.ts|index.tsx), not reach into its " +
        'internals. A component may still import its own internals/subcomponents. ' +
        'Scoped to runtime edges (dependencyTypesNot: type-only) — how type files ' +
        'are imported across components is governed by the type-split rules, so ' +
        'this rule targets value/runtime coupling only.',
      from: { path: '^src/components/([^/]+)/' },
      to: {
        // any RUNTIME edge into a file inside SOME component dir ...
        path: '^src/components/[^/]+/',
        dependencyTypesNot: ['type-only'],
        pathNot: [
          // ... but a component reaching into its OWN internals is fine ($1 = the
          // importing component captured in from.path) ...
          '^src/components/$1/',
          // ... and importing any component's public barrel is the allowed path.
          '^src/components/[^/]+/index[.](?:ts|tsx)$',
        ],
      },
    },
    // ---- Type / runtime split ----
    {
      name: 'type-files-imported-as-type-only',
      severity: 'error',
      comment:
        'A type-only module (*.d.ts or types.ts) must be imported as a ' +
        'type-only import (import type ...), not as a runtime/value import.',
      from: {},
      to: {
        // Governed (src/) type files only — never third-party node_modules .d.ts,
        // which legitimate runtime imports (e.g. react-i18next) resolve to.
        path: ['^src/.+\\.d\\.ts$', '^src/.+/types\\.ts$'],
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'type-files-no-runtime-imports',
      severity: 'error',
      comment:
        'A type-only module (*.d.ts or types.ts) must not pull in runtime ' +
        '(value) imports — it should depend on types only.',
      from: { path: ['^src/.+\\.d\\.ts$', '^src/.+/types\\.ts$'] },
      to: { dependencyTypesNot: ['type-only'] },
    },
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
