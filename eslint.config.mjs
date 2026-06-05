import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintComments from 'eslint-plugin-eslint-comments';
import importPlugin from 'eslint-plugin-import';
import jestDom from 'eslint-plugin-jest-dom';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import testingLibrary from 'eslint-plugin-testing-library';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const tsconfigPath = path.join(rootDir, 'tsconfig.json');

const sourceGlobs = ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'];
const typedGlobs = ['**/*.ts', '**/*.tsx'];
const scriptGlobs = ['scripts/**/*.js'];
const storyGlobs = ['**/*.stories.js', '**/*.stories.jsx', '**/*.stories.ts', '**/*.stories.tsx'];
const testGlobs = [
  '**/*.test.js',
  '**/*.test.jsx',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.js',
  '**/*.spec.jsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  'tests/**/*.js',
  'tests/**/*.jsx',
  'tests/**/*.ts',
  'tests/**/*.tsx',
];

const sharedLanguageOptions = {
  ecmaVersion: 2022,
  sourceType: 'module',
  globals: {
    ...globals.browser,
    ...globals.jest,
    ...globals.node,
  },
};

const sharedRules = {
  'eslint-comments/no-use': ['error', { allow: [] }],
  'react/jsx-no-bind': 'warn',
  'react/jsx-props-no-spreading': 'warn',
  'no-await-in-loop': 'warn',
  'no-restricted-syntax': 'warn',
  'no-alert': 'error',
  'no-console': 'error',
  'import/prefer-default-export': 'warn',
  'no-restricted-imports': [
    'error',
    {
      patterns: ['@/features/*/*'],
    },
  ],
  'no-extra-semi': 'off',
  'class-methods-use-this': 'off',
  'import/default': 'off',
  'import/no-named-as-default-member': 'off',
  'import/no-named-as-default': 'off',
  'import/no-unresolved': 'off',
  'import/extensions': 'off',
  'react/prop-types': 'off',
  'react/react-in-jsx-scope': 'off',
  'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
  'jsx-a11y/anchor-is-valid': 'off',
  'no-unused-vars': 'off',
};

const typedRules = {
  '@typescript-eslint/no-unused-vars': ['error'],
  '@typescript-eslint/typedef': [
    'error',
    {
      variableDeclaration: true,
      variableDeclarationIgnoreFunction: false,
      arrayDestructuring: false,
      objectDestructuring: false,
      propertyDeclaration: true,
      memberVariableDeclaration: true,
    },
  ],
  '@typescript-eslint/explicit-member-accessibility': [
    'error',
    {
      accessibility: 'explicit',
      overrides: {
        constructors: 'no-public',
      },
    },
  ],
  '@typescript-eslint/member-ordering': 'error',
  '@typescript-eslint/explicit-function-return-type': 'error',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-empty-function': 'off',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-var-requires': 'off',
};

const formattingRules = {
  'max-len': ['error', { code: 150 }],
  quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
  semi: ['error', 'always'],
  'no-multiple-empty-lines': [2, { max: 2, maxEOF: 0 }],
  'linebreak-style': ['error', 'unix'],
};

export default [
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'coverage/**',
      'storybook-static/**',
      '.stryker-tmp/**',
      'bun.lock',
      'bun.lockb',
      'eslint.config.mjs',
    ],
  },

  {
    files: sourceGlobs,
    ...js.configs.recommended,
    languageOptions: sharedLanguageOptions,
  },

  {
    files: sourceGlobs,
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'eslint-comments': eslintComments,
      'testing-library': testingLibrary,
      'jest-dom': jestDom,
    },
  },

  {
    files: sourceGlobs,
    ...react.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: sourceGlobs,
    ...react.configs.flat['jsx-runtime'],
  },

  { ...tsPlugin.configs['flat/eslint-recommended'], files: typedGlobs },
  ...tsPlugin.configs['flat/recommended'].map(config => ({
    ...config,
    files: typedGlobs,
  })),

  {
    files: typedGlobs,
    languageOptions: {
      ...sharedLanguageOptions,
      parser: tsParser,
      parserOptions: {
        project: tsconfigPath,
        tsconfigRootDir: rootDir,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: tsconfigPath,
        },
      },
    },
    rules: {
      ...importPlugin.flatConfigs.recommended.rules,
      ...importPlugin.flatConfigs.typescript.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      ...eslintComments.configs.recommended.rules,
      ...sharedRules,
      ...typedRules,
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-extraneous-dependencies': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  {
    files: scriptGlobs,
    rules: {
      ...eslintComments.configs.recommended.rules,
      'eslint-comments/no-use': ['error', { allow: [] }],
    },
  },

  {
    files: testGlobs,
    rules: {
      ...jestDom.configs['flat/recommended'].rules,
      ...testingLibrary.configs['flat/react'].rules,
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-dynamic-require': 'off',
      'import/no-extraneous-dependencies': 'off',
      'global-require': 'off',
      'no-undef': 'off',
      'no-use-before-define': 'off',
      'testing-library/no-container': 'off',
      'testing-library/no-node-access': 'off',
      'testing-library/prefer-screen-queries': 'off',
    },
  },

  ...storybook.configs['flat/recommended'].map(config => ({
    ...config,
    files: storyGlobs,
    rules: {
      ...config.rules,
      'storybook/no-renderer-packages': 'off',
    },
  })),

  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    files: sourceGlobs,
    rules: formattingRules,
  },

  prettier,
];
