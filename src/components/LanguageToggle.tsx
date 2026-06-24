import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: "pl", label: "Polski", flag: "🇵🇱" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "fr", label: "Français", flag: "FR" },
  { value: "de", label: "Deutsch", flag: "DE" },
];

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();
  const current = LANGUAGES.find((l) => l.value === language) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`${t("common.language")}: ${current.label}`}
          className={`text-muted-foreground hover:text-foreground gap-1.5 ${className}`}
        >
          <span aria-hidden="true">{current.flag}</span>
          <span className="text-xs font-bold uppercase">{current.value}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => setLanguage(lang.value)}
            aria-current={language === lang.value ? "true" : undefined}
            className="gap-2 cursor-pointer"
          >
            <span aria-hidden="true">{lang.flag}</span>
            <span>{lang.label}</span>
            {language === lang.value && <Check className="ml-auto h-4 w-4" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
