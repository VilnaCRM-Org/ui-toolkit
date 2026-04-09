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
  mutate: ['./src/components/**/index.tsx'],
  thresholds: { high: 90, break: 80 },
};

export default config;
