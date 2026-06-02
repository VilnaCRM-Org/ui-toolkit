import jestConfig from '../../../jest.config';

describe('jest config', () => {
  test('discovers JS unit tests under src/test/unit', () => {
    expect(jestConfig.testMatch).toEqual(
      expect.arrayContaining(['<rootDir>/src/test/unit/**/*.spec.js'])
    );
  });
});
