import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
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
