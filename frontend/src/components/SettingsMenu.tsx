import { useState } from "react";
import { Settings, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import {
  SettingsDropdown,
  SettingsDropdownTrigger,
  SettingsDropdownContent,
  SettingsDropdownItem,
  SettingsDropdownSeparator,
} from "./ui/settings-dropdown";
import { LanguageSelector } from "./LanguageSelector";

interface SettingsMenuProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  className?: string;
}

export const SettingsMenu = ({ isDarkMode, onToggleDarkMode, className }: SettingsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const handleToggleDarkMode = () => {
    onToggleDarkMode();
    setIsOpen(false);
  };

  return (
    <SettingsDropdown open={isOpen} onOpenChange={setIsOpen}>
      <SettingsDropdownTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-manga-text hover:text-manga-primary ${className}`}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </SettingsDropdownTrigger>
      <SettingsDropdownContent align="end" className="w-48">
        {/* Language Selector */}
        <LanguageSelector closeDropdown={() => setIsOpen(false)} />

        <SettingsDropdownSeparator />

        {/* Theme Toggle */}
        <SettingsDropdownItem
          onClick={handleToggleDarkMode}
          className="flex items-center cursor-pointer"
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              <span>{t('general.lightMode')}</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              <span>{t('general.darkMode')}</span>
            </>
          )}
        </SettingsDropdownItem>
      </SettingsDropdownContent>
    </SettingsDropdown>
  );
};