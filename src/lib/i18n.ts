// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import our German translation file
import translationDE from '../locales/de.json';

// Define the resources
const resources = {
    de: {
        ...translationDE,
    },
};

i18n.use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        resources,
        lng: 'de', // Set the default language to German
        fallbackLng: 'de', // Fallback language if a key is missing
        interpolation: {
            escapeValue: false, // React already safes from xss
        },
        // You can add debug: true here during development to see logs
        // debug: true,
    });

export default i18n;
