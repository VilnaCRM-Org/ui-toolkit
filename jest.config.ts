import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  // Scope coverage to shippable source. Stories, type-only modules, the public
  // barrel and ambient declarations carry no testable logic.
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/*.stories.tsx',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/**/types.ts',
    '!<rootDir>/src/index.ts',
    '!<rootDir>/src/components/index.ts',
  ],
  // 100% gate, mirroring the CRM's coverage contract.
  coverageThreshold: {
    global: { branches: 100, functions: 100, lines: 100, statements: 100 },
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.tsx',
    '<rootDir>/tests/unit/**/*.spec.js',
  ],
  moduleNameMapper: {
    '^swiper/css.*$': '<rootDir>/tests/unit/mocks/styleMock.ts',
    '^swiper/(react|modules)$': '<rootDir>/tests/unit/mocks/swiperMock.tsx',
    '^.+\\.css$': '<rootDir>/tests/unit/mocks/styleMock.ts',
    '^.+\\.svg$': '<rootDir>/tests/unit/mocks/svgMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'esbuild-jest',
      {
        jsx: 'automatic',
        sourcemap: true,
        loaders: {
          '.test.ts': 'tsx',
          '.test.tsx': 'tsx',
        },
      },
    ],
  },
};

export default config;
