import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    common: { welcome: 'Welcome', clickMe: 'Click me', language: 'Language' },
    invoices: { member: 'Member', amount: 'Amount' },
  },
  es: {
    common: { welcome: 'Bienvenido', clickMe: 'Haga clic', language: 'Idioma' },
    invoices: { member: 'Miembro', amount: 'Cantidad' },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'invoices'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
