import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/tests/unit/**/*.test.tsx',
    '<rootDir>/src/test/**/*.test.ts',
    '<rootDir>/src/test/**/*.test.tsx',
    '<rootDir>/scripts/test/unit/**/*.spec.js',
  ],
  moduleNameMapper: {
    '^.+\\.css$': '<rootDir>/src/test/mocks/styleMock.ts',
    '^.+\\.svg$': '<rootDir>/src/test/mocks/svgMock.ts',
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
