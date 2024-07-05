import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testMatch: ['<rootDir>/src/test/**/*.test.tsx'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'esbuild-jest',
      {
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
