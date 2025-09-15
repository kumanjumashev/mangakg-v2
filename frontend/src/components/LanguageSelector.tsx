import { Languages, Check } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Language } from "@/types/i18n";
import { getLanguageDisplayName } from "@/lib/utils/language";
import { SettingsDropdownItem } from "./ui/settings-dropdown";

interface LanguageSelectorProps {
  onLanguageSelect?: (language: Language) => void;
  closeDropdown?: () => void;
}

export const LanguageSelector = ({ onLanguageSelect, closeDropdown }: LanguageSelectorProps) => {
  const { language, switchLanguage } = useTranslation();

  const handleLanguageSelect = (selectedLanguage: Language) => {
    switchLanguage(selectedLanguage);
    onLanguageSelect?.(selectedLanguage);
    closeDropdown?.();
  };

  const languages: Language[] = ['en', 'ky'];

  return (
    <>
      {languages.map((lang) => (
        <SettingsDropdownItem
          key={lang}
          onClick={() => handleLanguageSelect(lang)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center">
            <Languages className="w-4 h-4 mr-2" />
            <span>{getLanguageDisplayName(lang)}</span>
          </div>
          {language === lang && (
            <Check className="w-4 h-4 text-manga-primary" />
          )}
        </SettingsDropdownItem>
      ))}
    </>
  );
};