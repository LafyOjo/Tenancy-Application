import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { welcome: 'Welcome', clickMe: 'Click me' } },
  es: { translation: { welcome: 'Bienvenido', clickMe: 'Haga clic' } },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
