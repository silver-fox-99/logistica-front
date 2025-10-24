import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/shared/config/i18n/locales/en.json";
import ru from "@/shared/config/i18n/locales/ru.json";
import uz from "@/shared/config/i18n/locales/uz.json";

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        supportedLngs: ["en", "ru", "uz"],
        resources: {
            en: { translation: en },
            ru: { translation: ru },
            uz: { translation: uz }
        },
        detection: {
            order: ["localStorage", "navigator", "htmlTag", "cookie"],
            caches: ["localStorage"]
        },
        interpolation: { escapeValue: false },
        returnEmptyString: false
    });

export default i18n;
