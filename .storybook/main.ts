import fs from 'fs';
import path from 'path';

import type { StorybookConfig } from '@storybook/react-webpack5';
import type { RuleSetCondition } from 'webpack';

const toPath = 'src/assets/fonts';
const fromPath = `../${toPath}`;
const svgExclude = /\.svg$/i;
const fontDirectories = ['Golos', 'Inter'] as const;

function mergeExclude(exclude?: RuleSetCondition): RuleSetCondition {
  if (!exclude) {
    return svgExclude;
  }

  if (Array.isArray(exclude)) {
    return [...exclude, svgExclude];
  }

  return [exclude, svgExclude];
}

const staticDirs = fontDirectories
  .map(fontDirectory => ({
    from: `${fromPath}/${fontDirectory}`,
    to: `${toPath}/${fontDirectory}`,
  }))
  .filter(entry => {
    const resolvedDir = path.resolve(__dirname, entry.from);

    return fs.existsSync(resolvedDir) && fs.statSync(resolvedDir).isDirectory();
  });

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-webpack5-compiler-swc',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async config => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': path.resolve(__dirname, '../src'),
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
