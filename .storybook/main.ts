import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-webpack5';
import type { RuleSetCondition } from 'webpack';

const storybookDir =
  typeof __dirname === 'string' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
const toPath = 'src/assets/fonts';
const fromPath = `../${toPath}`;
const svgExclude = /\.svg$/i;

function mergeExclude(exclude?: RuleSetCondition): RuleSetCondition {
  if (!exclude) {
    return svgExclude;
  }

  if (Array.isArray(exclude)) {
    return [...exclude, svgExclude];
  }

  return [exclude, svgExclude];
}

const staticDirs = [
  {
    from: `${fromPath}/Golos/GolosText-Black.woff2`,
    to: `${toPath}/Golos/GolosText-Black.woff2`,
  },
  {
    from: `${fromPath}/Golos/GolosText-Bold.woff2`,
    to: `${toPath}/Golos/GolosText-Bold.woff2`,
  },
  {
    from: `${fromPath}/Golos/GolosText-ExtraBold.woff2`,
    to: `${toPath}/Golos/GolosText-ExtraBold.woff2`,
  },
  {
    from: `${fromPath}/Golos/GolosText-Medium.woff2`,
    to: `${toPath}/Golos/GolosText-Medium.woff2`,
  },
  {
    from: `${fromPath}/Golos/GolosText-Regular.woff2`,
    to: `${toPath}/Golos/GolosText-Regular.woff2`,
  },
  {
    from: `${fromPath}/Golos/GolosText-SemiBold.woff2`,
    to: `${toPath}/Golos/GolosText-SemiBold.woff2`,
  },
  {
    from: `${fromPath}/Inter/Inter-Bold.woff2`,
    to: `${toPath}/Inter/Inter-Bold.woff2`,
  },
  {
    from: `${fromPath}/Inter/Inter-Medium.woff2`,
    to: `${toPath}/Inter/Inter-Medium.woff2`,
  },
  {
    from: `${fromPath}/Inter/Inter-Regular.woff2`,
    to: `${toPath}/Inter/Inter-Regular.woff2`,
  },
].filter(entry => fs.existsSync(path.resolve(storybookDir, entry.from)));

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-links',
    '@storybook/addon-onboarding',
    '@storybook/addon-webpack5-compiler-swc',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: async config => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': path.resolve(storybookDir, '../src'),
    };
    config.module = config.module ?? { rules: [] };
    config.module.rules = (config.module.rules ?? []).map(rule => {
      if (!rule || typeof rule !== 'object' || !('test' in rule)) {
        return rule;
      }

      if (!(rule.test instanceof RegExp) || !rule.test.test('.svg')) {
        return rule;
      }

      return {
        ...rule,
        exclude: mergeExclude(rule.exclude),
      };
    });
    config.module.rules.push({
      test: svgExclude,
      type: 'asset/inline',
    });

    return config;
  },
  staticDirs,
};
export default config;
