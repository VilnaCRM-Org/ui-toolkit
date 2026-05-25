const i18n = require('i18next');
const { initReactI18next } = require('react-i18next');
const resources = require('./i18n/localization.json');

i18n.use(initReactI18next).init({
  lng: 'en',
  resources,
  fallbackLng: process.env.REACT_APP_FALLBACK_LANGUAGE || 'en',
  interpolation: {
    escapeValue: false,
  },
});

module.exports = i18n;
