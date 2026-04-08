import path from 'path';

import type { StorybookConfig } from '@storybook/react-webpack5';

const toPath = 'src/assets/fonts';
const fromPath = `../${toPath}`;

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
    config.module.rules = [
      ...(config.module.rules ?? []).filter(rule => {
        if (!rule || typeof rule !== 'object' || !('test' in rule)) {
          return true;
        }

        return !(rule.test instanceof RegExp && rule.test.test('.svg'));
      }),
      {
        test: /\.svg$/i,
        type: 'asset/inline',
      },
    ];

    return config;
  },
  staticDirs: [
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
  ],
};
export default config;
