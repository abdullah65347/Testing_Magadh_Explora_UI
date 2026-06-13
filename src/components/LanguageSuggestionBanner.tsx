import { Globe, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";

const NATIVE_NAMES: Record<Language, string> = {
    en: "English",
    hi: "हिन्दी",
    zh: "中文",
    ja: "日本語",
    th: "ไทย",
    si: "සිංහල",
    vi: "Tiếng Việt",
    dz: "རྫོང་ཁ",
};

const PROMPT: Record<Language, string> = {
    en: "We noticed you might prefer",
    hi: "हमने देखा आप शायद पसंद करेंगे",
    zh: "我们注意到您可能更喜欢",
    ja: "次の言語の方が読みやすいかもしれません:",
    th: "เราคิดว่าคุณอาจชอบ",
    si: "ඔබට වඩාත් සුදුසු විය හැකි බව අපි දකිමු",
    vi: "Có vẻ bạn sẽ thấy thoải mái hơn với",
    dz: "ཁྱོད་ཀྱིས་འདི་ལེགས་པར་མཐོང་སྲིད་",
};

const SWITCH: Record<Language, string> = {
    en: "Switch",
    hi: "बदलें",
    zh: "切换",
    ja: "切り替え",
    th: "เปลี่ยน",
    si: "මාරු කරන්න",
    vi: "Đổi",
    dz: "བརྗེ་སྒྱུར",
};

export function LanguageSuggestionBanner() {
    const { geoSuggestion, acceptSuggestion, dismissSuggestion } = useLanguage();

    if (!geoSuggestion) return null;

    return (
        <div className="bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                        {PROMPT[geoSuggestion]} <strong>{NATIVE_NAMES[geoSuggestion]}</strong>.
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={acceptSuggestion}
                        className="px-3 py-1 rounded-md bg-primary-foreground/15 hover:bg-primary-foreground/25 font-medium transition-colors"
                    >
                        {SWITCH[geoSuggestion]} → {NATIVE_NAMES[geoSuggestion]}
                    </button>
                    <button
                        onClick={dismissSuggestion}
                        className="p-1 rounded-md hover:bg-primary-foreground/15 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
