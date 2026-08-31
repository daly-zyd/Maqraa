import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar }
    },
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

// Set HTML attributes globally for Arabic and RTL
const updateHtmlAttributes = (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = 'rtl';
};

// Initial set
updateHtmlAttributes('ar');

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  updateHtmlAttributes(lng);
});

export default i18n;

