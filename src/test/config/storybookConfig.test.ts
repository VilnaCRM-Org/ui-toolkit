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

describe('storybook webpackFinal', () => {
  test('preserves existing exclude entries when excluding svg files', async () => {
    const rule = {
      test: /\.svg$/i,
      exclude: /\.png$/i,
    };

    const config = await storybookConfig.webpackFinal?.(
      {
        module: { rules: [rule] },
      },
      {} as Parameters<NonNullable<typeof storybookConfig.webpackFinal>>[1]
    );

    expect(config?.module?.rules).toHaveLength(2);
    expect(config?.module?.rules?.[0]).toEqual({
      ...rule,
      exclude: [/\.png$/i, /\.svg$/i],
    });
  });
});
