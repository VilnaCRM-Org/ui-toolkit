import type { Config } from 'jest';

import baseConfig from './jest.config';

// Stryker runs the FULL test suite (unit + integration) against each mutant so
// that an assertion in EITHER tier can kill it. The unit-only config would let
// mutants whose only covering assertions live in the integration tier survive
// (e.g. the composed-tree `id` checks in *.integration.test.tsx).
//
// Coverage collection and the 100% gate are disabled here: they are irrelevant
// to mutation testing, and the gate would error because integration runs are
// not part of the coverage contract.
const config: Config = {
  ...baseConfig,
  collectCoverage: false,
  coverageThreshold: undefined,
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/tests/unit/**/*.test.tsx',
    '<rootDir>/tests/unit/**/*.spec.js',
    '<rootDir>/tests/integration/**/*.integration.test.{ts,tsx}',
  ],
};

export default config;
