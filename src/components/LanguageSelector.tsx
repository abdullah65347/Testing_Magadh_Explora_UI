import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { cn } from "@/lib/utils";

const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: "en", name: "English", nativeName: "English", flag: "gb" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "in" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "cn" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "jp" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "th" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල", flag: "lk" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "vn" },
  { code: "dz", name: "Dzongkha", nativeName: "རྫོང་ཁ", flag: "bt" },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'transparent';
  className?: string;
}

export function LanguageSelector({ variant = 'default', className }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const currentLanguage = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1 font-medium",
            variant === "transparent" &&
            "text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10",
            className
          )}
        >
          {/* <Globe className="w-4 h-4" /> */}

          {/* Desktop view */}
          <span className="flex items-center gap-1">
            <span
              className={cn(
                "fi",
                currentLanguage && `fi-${currentLanguage.flag}`,
                "w-5 h-5"
              )}
            />
            <span>{currentLanguage?.nativeName}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 p-1 mt-1 rounded-md"
      >
        <div className="max-h-[220px] overflow-y-auto custom-scroll px-1 py-2">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={cn(
                "flex items-center gap-3 cursor-pointer rounded-lg",
                language === lang.code && "bg-primary/10 text-primary"
              )}
            >
              <span
                className={cn(
                  "fi",
                  `fi-${lang.flag}`,
                  "w-5 h-5"
                )}
              />
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">
                  {lang.name}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>

    </DropdownMenu>
  );

}
