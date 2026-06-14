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
    configFile: 'jest.config.ts',
    enableFindRelatedTests: false,
  },
  mutate: ['./src/components/**/*.tsx'],
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
