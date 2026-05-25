import fs from 'fs';
import path from 'path';

import storybookConfig from '../../../.storybook/main';

describe('storybook staticDirs', () => {
  test('only references static assets that exist in the repository', () => {
    const staticDirs: NonNullable<typeof storybookConfig.staticDirs> =
      storybookConfig.staticDirs ?? [];

    staticDirs.forEach(entry => {
      if (typeof entry === 'string') {
        expect(fs.existsSync(path.resolve(__dirname, '../../../.storybook', entry))).toBe(true);
        return;
      }

      expect(
        fs.existsSync(path.resolve(__dirname, '../../../.storybook', entry.from))
      ).toBe(true);
    });
  });
});
