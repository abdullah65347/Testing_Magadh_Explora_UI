import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Palette, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { settingsService } from "@/api/services/settingsService";
import { currencyService } from "@/api/services/currencyService";
import { cn } from "@/lib/utils";

const DEFAULT_THEME = {
    primary: "#DB7706",
    accent: "#2D867F",
    gold: "#F4BF25",
};

const KNOWN_CURRENCIES = [
    "INR", "USD", "EUR", "GBP", "JPY", "AED", "SGD", "AUD", "CAD", "CHF", "CNY",
    "HKD", "KRW", "MYR", "NZD", "SAR", "SEK", "THB", "ZAR",
];
const KNOWN_LANGUAGES = ["en", "hi", "ja", "fr", "de", "es", "zh", "ar"];

function csvSet(s: string | undefined): string[] {
    if (!s) return [];
    return s.split(",").map((v) => v.trim()).filter(Boolean);
}
function setCsv(arr: string[]): string {
    return arr.join(",");
}

export default function Settings() {
    const qc = useQueryClient();
    const data = useQuery({ queryKey: ["admin", "settings"], queryFn: settingsService.all });

    const [draft, setDraft] = useState<Record<string, string>>({});

    useEffect(() => {
        if (data.data) setDraft(data.data);
    }, [data.data]);

    const set = (k: string, v: string) => setDraft((d) => ({ ...d, [k]: v }));

    const save = useMutation({
        mutationFn: () => settingsService.save(draft),
        onSuccess: () => {
            toast.success("Settings saved");
            qc.invalidateQueries({ queryKey: ["admin", "settings"] });
            qc.invalidateQueries({ queryKey: ["public", "currency"] });
            qc.invalidateQueries({ queryKey: ["public", "settings"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Save failed"),
    });

    const themeMode = (draft["theme.mode"] === "custom" ? "custom" : "default") as
        | "default"
        | "custom";
    const themePrimary = draft["theme.primary"] || DEFAULT_THEME.primary;
    const themeAccent = draft["theme.accent"] || DEFAULT_THEME.accent;
    const themeGold = draft["theme.gold"] || DEFAULT_THEME.gold;

    const waEnabled = draft["whatsapp.enabled"] === "true";
    const waNumber = draft["whatsapp.number"] ?? "";
    const waMessage = draft["whatsapp.default_message"] ?? "";

    const refresh = useMutation({
        mutationFn: currencyService.refresh,
        onSuccess: (res) => {
            toast.success(`Refreshed ${res.updated} rates`);
            qc.invalidateQueries({ queryKey: ["public", "currency"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Refresh failed"),
    });

    const currencyAllowed = useMemo(() => csvSet(draft["currency.allowed"]), [draft]);
    const languageAllowed = useMemo(() => csvSet(draft["language.allowed"]), [draft]);

    const toggleAllowed = (key: "currency.allowed" | "language.allowed", code: string) => {
        const cur = csvSet(draft[key]);
        const next = cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code];
        set(key, setCsv(next));
    };

    if (data.isLoading) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
    if (data.isError) return <div className="p-8 text-center text-red-500">Failed to load settings.</div>;

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Pricing markup, currency &amp; language policy
                </p>
            </div>

            {/* Pricing */}
            <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                <h2 className="font-semibold">Pricing</h2>

                <label className="block">
                    <span className="text-xs font-medium text-muted-foreground mb-1 block">
                        Markup % (added on top of currency-converted price)
                    </span>
                    <input
                        type="number" min={0} max={500} step="0.1"
                        value={draft["pricing.markup.percent"] ?? ""}
                        onChange={(e) => set("pricing.markup.percent", e.target.value)}
                        className="w-40 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">%</span>
                </label>
            </section>

            {/* Currency */}
            <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Currency</h2>
                    <button
                        type="button"
                        onClick={() => refresh.mutate()}
                        disabled={refresh.isPending}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", refresh.isPending && "animate-spin")} />
                        Refresh rates now
                    </button>
                </div>

                <label className="block">
                    <span className="text-xs font-medium text-muted-foreground mb-1 block">
                        Default currency (used when geo / user choice is unavailable)
                    </span>
                    <select
                        value={draft["currency.default"] ?? "INR"}
                        onChange={(e) => set("currency.default", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    >
                        {currencyAllowed.length > 0
                            ? currencyAllowed.map((c) => <option key={c}>{c}</option>)
                            : <option>INR</option>}
                    </select>
                </label>

                <div>
                    <span className="text-xs font-medium text-muted-foreground mb-2 block">
                        Allowed currencies (shown in the public switcher)
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {KNOWN_CURRENCIES.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => toggleAllowed("currency.allowed", c)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs border",
                                    currencyAllowed.includes(c)
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background border-border hover:bg-muted"
                                )}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Theme */}
            <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <h2 className="font-semibold">Theme</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                    Default uses the site's saffron-gold palette. Custom lets you pick brand colors.
                </p>

                <div className="flex gap-2">
                    {(["default", "custom"] as const).map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => set("theme.mode", mode)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium border capitalize",
                                themeMode === mode
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background border-border hover:bg-muted"
                            )}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                {themeMode === "custom" && (
                    <div className="grid sm:grid-cols-3 gap-4 pt-2">
                        {[
                            { key: "theme.primary", label: "Primary", value: themePrimary, hint: "Buttons, links" },
                            { key: "theme.accent", label: "Accent", value: themeAccent, hint: "Secondary highlights" },
                            { key: "theme.gold", label: "Gold", value: themeGold, hint: "Gradients, badges" },
                        ].map((f) => (
                            <label key={f.key} className="block">
                                <span className="text-xs font-medium text-muted-foreground mb-1 block">
                                    {f.label}
                                    <span className="text-muted-foreground/70 font-normal ml-1">— {f.hint}</span>
                                </span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={f.value}
                                        onChange={(e) => set(f.key, e.target.value)}
                                        className="w-12 h-10 rounded-md border border-border bg-background cursor-pointer p-1"
                                    />
                                    <input
                                        type="text"
                                        value={f.value}
                                        onChange={(e) => set(f.key, e.target.value)}
                                        placeholder="#RRGGBB"
                                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
                                    />
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </section>

            {/* WhatsApp */}
            <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <h2 className="font-semibold">WhatsApp</h2>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={waEnabled}
                        onClick={() => set("whatsapp.enabled", waEnabled ? "false" : "true")}
                        className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            waEnabled ? "bg-green-600" : "bg-muted"
                        )}
                    >
                        <span
                            className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                                waEnabled ? "translate-x-6" : "translate-x-1"
                            )}
                        />
                    </button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Floating "Chat on WhatsApp" button on every public page. Clicking opens wa.me with the message below.
                </p>

                <label className="block">
                    <span className="text-xs font-medium text-muted-foreground mb-1 block">
                        Business WhatsApp number (with country code, digits only)
                    </span>
                    <input
                        type="tel"
                        value={waNumber}
                        onChange={(e) => set("whatsapp.number", e.target.value.replace(/\D/g, ""))}
                        placeholder="919876543210"
                        className="w-64 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
                    />
                    <span className="block text-[11px] text-muted-foreground mt-1">
                        Example: <span className="font-mono">919876543210</span> (no +, no spaces)
                    </span>
                </label>

                <label className="block">
                    <span className="text-xs font-medium text-muted-foreground mb-1 block">
                        Default message (pre-filled when user taps the button)
                    </span>
                    <textarea
                        value={waMessage}
                        onChange={(e) => set("whatsapp.default_message", e.target.value)}
                        rows={2}
                        placeholder="Hi, I'm interested in your Bihar tours."
                        className="w-full max-w-xl px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y"
                    />
                </label>
            </section>

            {/* Language */}
            <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                <h2 className="font-semibold">Language</h2>

                <label className="block">
                    <span className="text-xs font-medium text-muted-foreground mb-1 block">
                        Default language
                    </span>
                    <select
                        value={draft["language.default"] ?? "en"}
                        onChange={(e) => set("language.default", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    >
                        {languageAllowed.length > 0
                            ? languageAllowed.map((l) => <option key={l}>{l}</option>)
                            : <option>en</option>}
                    </select>
                </label>

                <div>
                    <span className="text-xs font-medium text-muted-foreground mb-2 block">
                        Allowed languages
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {KNOWN_LANGUAGES.map((l) => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => toggleAllowed("language.allowed", l)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs border",
                                    languageAllowed.includes(l)
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background border-border hover:bg-muted"
                                )}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <div className="sticky bottom-0 bg-background py-4 border-t border-border flex justify-end">
                <button
                    onClick={() => save.mutate()}
                    disabled={save.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {save.isPending ? "Saving…" : "Save settings"}
                </button>
            </div>
        </div>
    );
}
