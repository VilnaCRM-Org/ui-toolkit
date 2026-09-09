import type { Preview } from '@storybook/react';
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';

// Load the Inter / Golos Text @font-face rules for EVERY story. Component stories
// import their component directly (not the `@/components` barrel that pulls in
// fonts.css), so without this the text falls back to the browser serif default.
import '../src/components/fonts.css';
import './preview.css';
import resources from '../i18n/localization.json';

i18next.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});
const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
