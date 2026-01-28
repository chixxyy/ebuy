import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zhTW from './locales/zh-TW.json'

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale:  localStorage.getItem('locale') || 'zh-TW', // Default to Traditional Chinese
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-TW': zhTW
  }
})

export default i18n
