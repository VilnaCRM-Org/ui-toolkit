import { collectMutateFiles } from './scripts/ci/mutation-scope.mjs';

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  plugins: ['@stryker-mutator/jest-runner', '@stryker-mutator/typescript-checker'],
  checkers: ['typescript'],
  // Stryker's DisableTypeChecksPreprocessor runs off this option ALONE and
  // writes '// @ts-nocheck' into every sandboxed source file; the typescript
  // checker then reads those same on-disk files. Leaving the default (true)
  // makes the checker silently check nothing — no error, just Survived
  // mutants for what should have been CompileError. The Jest run itself is
  // unaffected either way: esbuild-jest strips types regardless.
  disableTypeChecks: false,
  // Narrowed to src/** only (see tsconfig.stryker.json) — the root
  // tsconfig.json also pulls in tests/, scripts/ and .storybook/, and
  // type-checking that whole tree once per mutant is the checker's dominant
  // cost. This is what makes running the checker per-mutant affordable.
  tsconfigFile: 'tsconfig.stryker.json',
  typescriptChecker: {
    // Deliberate accuracy-for-speed trade, per Stryker's own docs: skips some
    // of the checker's cross-file accuracy work in exchange for throughput,
    // which can leave a type-invalid mutant with a status other than
    // CompileError — Stryker's docs say the report "may not be 100%
    // accurate" as a result. A misclassified mutant just runs as a normal
    // Jest mutant instead of being excluded; if it survives, it counts as
    // Survived. The error is CONSERVATIVE in direction — it can only depress
    // the score, never inflate it, so it cannot turn a failing gate green —
    // but the denominator is not exact.
    prioritizePerformanceOverAccuracy: true,
  },
  concurrency: 2,
  timeoutMS: 20000,
  timeoutFactor: 4,
  jest: {
    // Mutation runs the FULL suite (unit + integration) so assertions in either
    // tier count toward killing mutants; see jest.mutation.config.ts.
    configFile: 'jest.mutation.config.ts',
    // Restrict each mutant's Jest run to the test files that actually reach the
    // mutated module. With this off, Jest resolved and loaded all 63 suites for
    // every one of the ~750 mutants and only then filtered by testNamePattern —
    // ~15.8 s per mutant, which is where the two-hour run went. It is
    // score-preserving: a mutant can
    // only be observed by a test that (transitively) imports the mutated file,
    // which is exactly the set --findRelatedTests keeps.
    enableFindRelatedTests: true,
  },
  // Both this and stryker.shard.config.mjs's sharded slice come from
  // scripts/ci/mutation-scope.mjs now, so the drift the old inline comment
  // warned about (two independent file-set definitions silently disagreeing)
  // is structurally impossible: there is only one definition left to read.
  mutate: collectMutateFiles(),
  // Keep the Stryker sandbox copy from choking on non-source dirs (the `.qlty`
  // log dir in particular triggers an EISDIR copyfile error).
  ignorePatterns: [
    '.qlty/**',
    '.stryker-tmp/**',
    'coverage/**',
    'build/**',
    'storybook-static/**',
    'reports/**',
    'test-results/**',
    'playwright-report/**',
    '.lighthouseci/**',
    'lhci-reports-desktop/**',
    'lhci-reports-mobile/**',
    'tests/memory-leak/results/**',
    '**/*.stories.tsx',
    '**/*.stories.ts',
  ],
  thresholds: { high: 90, break: 80 },
};

export default config;
