import type { Config } from 'jest';

import baseConfig from './jest.config';

// Integration tests render composed components with their REAL children (no
// child mocks) to verify cross-component behaviour — the tier above unit tests.
//
// Unlike the CRM, no toolkit component performs network I/O, so there is no MSW
// server here (see tests/integration/README.md). The 100% coverage gate stays
// on the unit run; integration coverage is supplementary and not collected.
const config: Config = {
  ...baseConfig,
  collectCoverage: false,
  coverageThreshold: undefined,
  testMatch: ['<rootDir>/tests/integration/**/*.integration.test.{ts,tsx}'],
};

export default config;
