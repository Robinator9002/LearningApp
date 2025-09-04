// src/lib/i18n.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// MODIFICATION: Imported both English and German translation files.
import translationDE from '../locales/de.json';
import translationEN from '../locales/en.json';

// MODIFICATION: Defined both 'en' and 'de' as available resources.
const resources = {
    en: {
        translation: translationEN.translation,
    },
    de: {
        translation: translationDE.translation,
    },
};

i18n.use(LanguageDetector) // MODIFICATION: Added browser language detection.
    .use(initReactI18next)
    .init({
        resources,
        // MODIFICATION: Set a fallback language in case detection fails or a key is missing.
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // React already escapes from XSS.
        },
        // You can add debug: true here during development to see logs
        // debug: true,
    });

export default i18n;
