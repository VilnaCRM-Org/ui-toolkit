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
    from: `${fromPath}/Golos/GolosText-Black.ttf`,
    to: `${toPath}/Golos/GolosText-Black.ttf`,
  },
  {
    from: `${fromPath}/Golos/GolosText-Bold.ttf`,
    to: `${toPath}/Golos/GolosText-Bold.ttf`,
  },
  {
    from: `${fromPath}/Golos/GolosText-ExtraBold.ttf`,
    to: `${toPath}/Golos/GolosText-ExtraBold.ttf`,
  },
  {
    from: `${fromPath}/Golos/GolosText-Medium.ttf`,
    to: `${toPath}/Golos/GolosText-Medium.ttf`,
  },
  {
    from: `${fromPath}/Golos/GolosText-Regular.ttf`,
    to: `${toPath}/Golos/GolosText-Regular.ttf`,
  },
  {
    from: `${fromPath}/Golos/GolosText-SemiBold.ttf`,
    to: `${toPath}/Golos/GolosText-SemiBold.ttf`,
  },
  {
    from: `${fromPath}/Inter/Inter-Bold.ttf`,
    to: `${toPath}/Inter/Inter-Bold.ttf`,
  },
  {
    from: `${fromPath}/Inter/Inter-Medium.ttf`,
    to: `${toPath}/Inter/Inter-Medium.ttf`,
  },
  {
    from: `${fromPath}/Inter/Inter-Regular.ttf`,
    to: `${toPath}/Inter/Inter-Regular.ttf`,
  },
].filter(entry => fs.existsSync(path.resolve(storybookDir, entry.from)));

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
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
