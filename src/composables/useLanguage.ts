import { useI18n } from 'vue-i18n';
import type { SupportedLocale } from '@/i18n';

const STORAGE_KEY = 'campusflow_locale';

export const availableLocales: { code: SupportedLocale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

export function useLanguage() {
  const { locale } = useI18n();

  function setLocale(newLocale: SupportedLocale) {
    locale.value = newLocale;
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.setAttribute('lang', newLocale);
  }

  return {
    locale,
    setLocale,
    availableLocales,
  };
}
