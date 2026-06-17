import type { Config } from 'jest';

import baseConfig from './jest.config';

// Integration tests render composed components with their REAL children (no
// child mocks) to verify cross-component behaviour — the tier above unit tests.
//
// Unlike the CRM, no toolkit component performs network I/O, so there is no MSW
// server here (see tests/integration/README.md).
//
// Like the CRM, the integration run ALSO enforces a 100% coverage gate — but
// scoped to the COMPOSITION/orchestration components it is responsible for (the
// `index.tsx` wiring of AuthSkeleton, Layout, UiForm, UiTextFieldForm and the
// UiFooter / UiCardList subtrees). Leaf components (Button, Input, Checkbox,
// Tooltip, skeleton primitives, Link, Image, Typography…) are fully covered by
// the unit tier and are out of scope here, as are theme/style/constant modules
// (mirroring CRM's exclusion of theme.ts/styles). CardSwiper is excluded too:
// its MutationObserver branches need the unit tier's mock-driven simulation that
// the real-children integration tier cannot reproduce.
const config: Config = {
  ...baseConfig,
  collectCoverage: true,
  coverageThreshold: {
    global: { branches: 100, functions: 100, lines: 100, statements: 100 },
  },
  collectCoverageFrom: [
    '<rootDir>/src/components/AuthSkeleton/**/*.{ts,tsx}',
    '<rootDir>/src/components/Layout/**/*.{ts,tsx}',
    '<rootDir>/src/components/UiForm/**/*.{ts,tsx}',
    '<rootDir>/src/components/UiTextFieldForm/**/*.{ts,tsx}',
    '<rootDir>/src/components/UiFooter/**/*.{ts,tsx}',
    '<rootDir>/src/components/UiCardList/**/*.{ts,tsx}',
    '!<rootDir>/src/**/*.stories.{ts,tsx}',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/**/types.ts',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/**/theme.ts',
    '!<rootDir>/src/**/styles.ts',
    '!<rootDir>/src/**/shared-styles.ts',
    '!<rootDir>/src/**/constants.ts',
    '!<rootDir>/src/components/UiCardList/CardSwiper.tsx',
    '!<rootDir>/src/components/UiCardList/CardGrid.tsx',
  ],
  testMatch: ['<rootDir>/tests/integration/**/*.integration.test.{ts,tsx}'],
};

export default config;
