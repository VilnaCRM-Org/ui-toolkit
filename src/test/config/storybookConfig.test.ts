import fs from 'fs';
import path from 'path';

import storybookConfig from '../../../.storybook/main';

describe('storybook staticDirs', () => {
  test('only references static directories that exist in the repository', () => {
    const configuredStaticDirs: typeof storybookConfig.staticDirs = storybookConfig.staticDirs;

    expect(Array.isArray(configuredStaticDirs)).toBe(true);

    if (!Array.isArray(configuredStaticDirs)) {
      throw new TypeError('storybookConfig.staticDirs must be an array');
    }

    configuredStaticDirs.forEach((entry: (typeof configuredStaticDirs)[number]) => {
      if (typeof entry === 'string') {
        const resolvedDir: string = path.resolve(__dirname, '../../../.storybook', entry);

        expect(fs.existsSync(resolvedDir)).toBe(true);
        expect(fs.statSync(resolvedDir).isDirectory()).toBe(true);
        return;
      }

      const resolvedDir: string = path.resolve(__dirname, '../../../.storybook', entry.from);

      expect(fs.existsSync(resolvedDir)).toBe(true);
      expect(fs.statSync(resolvedDir).isDirectory()).toBe(true);
    });
  });
});

type WebpackFinalFn = NonNullable<typeof storybookConfig.webpackFinal>;
type WebpackFinalConfig = Parameters<WebpackFinalFn>[0];
type WebpackFinalReturn = Awaited<ReturnType<WebpackFinalFn>>;
type WebpackRule = { test: RegExp; exclude: RegExp };

describe('storybook webpackFinal', () => {
  test('preserves existing exclude entries when excluding svg files', async () => {
    const rule: WebpackRule = {
      test: /\.svg$/i,
      exclude: /\.png$/i,
    };

    const config: WebpackFinalReturn | undefined = await storybookConfig.webpackFinal?.(
      {
        module: { rules: [rule] },
      } as WebpackFinalConfig,
      {} as Parameters<WebpackFinalFn>[1]
    );

    expect(config?.module?.rules).toHaveLength(2);
    expect(config?.module?.rules?.[0]).toEqual({
      ...rule,
      exclude: [/\.png$/i, /\.svg$/i],
    });
  });
});
