import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import styles from "./LanguageSwitcher.module.css";

const LANGUAGES = [
  { code: "pt-BR", label: "Português" },
  { code: "en", label: "English" },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("pt") ? "pt-BR" : "en";

  function handleChange(langCode: string) {
    i18n.changeLanguage(langCode);
  }

  return (
    <div className={styles.switcher}>
      <Globe size={16} className={styles.icon} aria-hidden="true" />
      <div className={styles.options}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`${styles.option} ${currentLang === lang.code ? styles.optionActive : ""}`}
            onClick={() => handleChange(lang.code)}
            aria-current={currentLang === lang.code ? "true" : undefined}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
