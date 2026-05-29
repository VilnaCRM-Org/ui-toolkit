import jestConfig from '../../../jest.config';

describe('jest config', () => {
  test('discovers JS unit tests under scripts/test/unit', () => {
    expect(jestConfig.testMatch).toEqual(
      expect.arrayContaining(['<rootDir>/scripts/test/unit/**/*.spec.js'])
    );
  });
});
