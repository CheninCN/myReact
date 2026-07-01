import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import jaTranslation from './locales/ja/translation.json'
import enTranslation from './locales/en/translation.json'
import koTranslation from './locales/ko/translation.json'
import zhTWTranslation from './locales/zh-TW/translation.json'
import zhCNTranslation from './locales/zh-CN/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ja: { translation: jaTranslation },
      en: { translation: enTranslation },
      ko: { translation: koTranslation },
      'zh-TW': { translation: zhTWTranslation },
      'zh-CN': { translation: zhCNTranslation },
    },
    fallbackLng: 'ja',
    lng: 'ja',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'rezero-lang',
    },
  })

export default i18n
