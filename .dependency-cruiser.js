/**
 * dependency-cruiser policy for @vilnacrm/ui-toolkit.
 *
 * Zero-tolerance graph-hygiene gate over the governed `src/` graph (rooted at
 * `src/index.ts`). There is intentionally NO depcruise-baseline: any violation
 * must be fixed in code, never suppressed.
 *
 * The `forbidden` rule set is authored in Story 1.3; this file establishes the
 * module shape, governed scope, exclusions, and TypeScript/alias resolution.
 *
 * `tsConfig.fileName` points at `tsconfig.json` (which `extends`
 * `tsconfig.paths.json`) so the `@/*` -> `./src/*` alias resolves during
 * analysis. Never point it at `tsconfig.paths.json` directly — that alias-only
 * file lacks the `include`/compiler context dependency-cruiser needs.
 */
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
