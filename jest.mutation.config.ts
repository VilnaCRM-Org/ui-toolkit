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
// The structural guards below assert on the PUBLIC BARREL — export names, the
// registry documents, the on-disk board layout — so they import
// `src/components/index.ts` and, through it, every component in the toolkit.
// That makes jest's reverse dependency graph treat them as "related" to every
// mutated file, so `jest.enableFindRelatedTests` would reload the whole toolkit
// for every mutant and the run would stay as slow as an unfiltered one.
//
// They are safe to drop from the mutation tier because none of them can kill a
// mutant: they assert on names and files, never on rendered behaviour. That
// zero-kill property was verified point-in-time against the baseline mutation
// report's `killedBy` data (main run 32894014689, 750 mutants: both suites
// recorded zero kills, sole or shared). The guard test
// (`tests/unit/mutation-runner-scope.test.ts`) pins the exclusion list and the
// no-other-barrel-importer rule, not a live kill count. Dropping a suite from
// the mutation tier can only ever LOWER the score, never inflate it, so this
// cannot manufacture a passing gate. All of them still run in the unit gate.
const STRUCTURAL_GUARDS = [
  '<rootDir>/tests/unit/components-index\\.test\\.ts$',
  '<rootDir>/tests/unit/ui-core-contract\\.test\\.tsx$',
];

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
  // '/node_modules/' restates Jest's default, which naming this option replaces.
  testPathIgnorePatterns: [
    '/node_modules/',
    ...(baseConfig.testPathIgnorePatterns ?? []),
    ...STRUCTURAL_GUARDS,
  ],
};

export default config;
