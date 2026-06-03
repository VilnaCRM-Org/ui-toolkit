import jestConfig from '../../../jest.config';

describe('jest config', () => {
  test('discovers JS unit tests under tests/unit', () => {
    expect(jestConfig.testMatch).toEqual(
      expect.arrayContaining(['<rootDir>/tests/unit/**/*.spec.js'])
    );
  });
});
