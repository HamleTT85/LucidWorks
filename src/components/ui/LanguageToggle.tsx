import { useTranslation } from '../../i18n/useTranslation';

export default function LanguageToggle() {
  const { lang, toggleLang } = useTranslation();

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10
                 hover:border-accent-gold/40 transition-all duration-300 text-sm font-medium"
      aria-label={`Switch to ${lang === 'de' ? 'English' : 'Deutsch'}`}
    >
      <span className={lang === 'en' ? 'text-text-primary' : 'text-text-secondary'}>EN</span>
      <span className="text-text-secondary/40">/</span>
      <span className={lang === 'de' ? 'text-text-primary' : 'text-text-secondary'}>DE</span>
    </button>
  );
}
