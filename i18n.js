const i18n = require('i18next');
const { initReactI18next } = require('react-i18next');
const resources = require('./i18n/localization.json');

i18n.use(initReactI18next).init({
  lng: 'en',
  resources,
  fallbackLng: process.env.REACT_APP_FALLBACK_LANGUAGE || 'en',
  interpolation: {
    // Keep interpolation escaping enabled because toolkit strings may be reused
    // outside React JSX-only rendering paths.
    escapeValue: true,
  },
});

module.exports = i18n;
