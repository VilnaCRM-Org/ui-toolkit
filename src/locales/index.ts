import i18next from 'i18next';
import type { InitOptions, Resource, i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';

import localization from './localization.json';

export const resources: Resource = localization;

export function initI18n(overrides: InitOptions = {}): i18n {
  void i18next.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources,
    interpolation: { escapeValue: false },
    ...overrides,
  });
  return i18next;
}
