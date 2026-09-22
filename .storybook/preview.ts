import type { Preview } from '@storybook/react';

// Load the Inter / Golos Text @font-face rules for EVERY story. Component stories
// import their component directly (not the `@/components` barrel that pulls in
// fonts.css), so without this the text falls back to the browser serif default.
import '../src/components/fonts.css';
import './preview.css';
import { initI18n } from '../src/locales';
import { collapseOptionalUndefined } from './optional-arg-types';

initI18n();
const preview: Preview = {
  tags: ['autodocs'],
  argTypesEnhancers: [collapseOptionalUndefined],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    options: {
      storySort: {
        order: ['Docs', ['Getting started', 'Theming', 'Localization'], '*'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
