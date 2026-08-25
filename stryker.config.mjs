/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  plugins: ['@stryker-mutator/jest-runner'],
  tsconfigFile: 'tsconfig.json',
  concurrency: 2,
  timeoutMS: 20000,
  timeoutFactor: 4,
  jest: {
    // Mutation runs the FULL suite (unit + integration) so assertions in either
    // tier count toward killing mutants; see jest.mutation.config.ts.
    configFile: 'jest.mutation.config.ts',
    enableFindRelatedTests: false,
  },
  // If you change this set, update stryker.shard.config.mjs's collectTsxFiles walk
  // to match: the sharded CI gate derives its file set independently, and a drift
  // here would silently drop mutants from the merged score (a hidden gate weaken).
  mutate: ['./src/components/**/*.tsx', '!./src/components/**/*.stories.tsx'],
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
  ],
  // Stories are excluded from `mutate` above but must still be COPIED into the
  // sandbox: tests/unit/storybook-interaction-coverage.test.ts scans them from
  // disk, and an ignored story file would make that drift guard see an empty
  // library and fail every mutant run.
  thresholds: { high: 90, break: 80 },
};

export default config;
