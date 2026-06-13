import { useEffect, useRef, useState } from "react";
import {
    ChevronDown,
    DollarSign,
    IndianRupee,
    Euro,
    PoundSterling,
    JapaneseYen,
    SwissFranc,
    Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

const CURRENCY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    INR: IndianRupee,
    USD: DollarSign,
    CAD: DollarSign,
    AUD: DollarSign,
    SGD: DollarSign,
    HKD: DollarSign,
    NZD: DollarSign,
    EUR: Euro,
    GBP: PoundSterling,
    JPY: JapaneseYen,
    CNY: JapaneseYen,
    CHF: SwissFranc,
};

function getCurrencyIcon(code: string) {
    return CURRENCY_ICONS[code.toUpperCase()] ?? Banknote;
}

interface Props {
    variant?: "default" | "transparent";
}

export function CurrencySwitcher({ variant = "default" }: Props) {
    const { currency, setCurrency, allowedCurrencies, loading } = useCurrency();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    if (loading || allowedCurrencies.length <= 1) return null;

    const ActiveIcon = getCurrencyIcon(currency);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    variant === "transparent"
                        ? "text-primary-foreground/90 hover:bg-primary-foreground/10"
                        : "text-foreground hover:bg-muted"
                )}
            >
                <ActiveIcon className="w-4 h-4" />
                {currency}
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
                    {allowedCurrencies.map((code) => {
                        const Icon = getCurrencyIcon(code);
                        return (
                            <button
                                key={code}
                                onClick={() => {
                                    setCurrency(code);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-muted",
                                    code === currency && "bg-primary/10 text-primary font-medium"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {code}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
