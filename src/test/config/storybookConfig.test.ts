import fs from 'fs';
import path from 'path';

import storybookConfig from '../../../.storybook/main';

describe('storybook staticDirs', () => {
  test('only references static assets that exist in the repository', () => {
    const configuredStaticDirs: typeof storybookConfig.staticDirs = storybookConfig.staticDirs;

    expect(Array.isArray(configuredStaticDirs)).toBe(true);

    if (!Array.isArray(configuredStaticDirs)) {
      throw new TypeError('storybookConfig.staticDirs must be an array');
    }

    configuredStaticDirs.forEach((entry: (typeof configuredStaticDirs)[number]) => {
      if (typeof entry === 'string') {
        expect(fs.existsSync(path.resolve(__dirname, '../../../.storybook', entry))).toBe(true);
        return;
      }

      expect(fs.existsSync(path.resolve(__dirname, '../../../.storybook', entry.from))).toBe(true);
    });
  });
});
