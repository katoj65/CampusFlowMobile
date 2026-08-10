import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import de from './locales/de.json';

export type SupportedLocale = 'en' | 'de';

const STORAGE_KEY = 'campusflow_locale';

function detectLocale(): SupportedLocale {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'de') return saved;

  const browserLang = navigator.language?.slice(0, 2);
  return browserLang === 'de' ? 'de' : 'en';
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { en, de },
});

export default i18n;
