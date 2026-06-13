import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Languages, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    entityTranslationService,
    type EntityTranslatableType,
} from "@/api/services/entityTranslationService";

interface FieldDef {
    name: string;
    label: string;
    multiline?: boolean;
    rows?: number;
    placeholderFromBase?: (base: Record<string, string>) => string;
}

interface Props {
    type: EntityTranslatableType;
    entityId: number;
    languages: { code: string; label: string }[];
    fields: FieldDef[];
    /** Original (English) values shown as placeholder/hint for each field */
    baseValues?: Record<string, string>;
}

export function EntityTranslationsEditor({
    type,
    entityId,
    languages,
    fields,
    baseValues = {},
}: Props) {
    const [activeLang, setActiveLang] = useState(languages[0]?.code ?? "hi");
    const [values, setValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        entityTranslationService
            .get(type, entityId, activeLang)
            .then((data) => {
                if (!cancelled) setValues(data ?? {});
            })
            .catch(() => {
                if (!cancelled) setValues({});
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [type, entityId, activeLang]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const saved = await entityTranslationService.put(type, entityId, activeLang, values);
            setValues(saved);
            toast.success(`Saved ${languages.find((l) => l.code === activeLang)?.label ?? activeLang} translations`);
        } catch (err: any) {
            toast.error(err?.message ?? "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Languages className="w-4 h-4 text-primary" />
                    Translations
                </h3>
                <Button size="sm" onClick={handleSave} disabled={saving || loading}>
                    {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save {activeLang.toUpperCase()}
                </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 border-b border-border pb-3">
                {languages.map((l) => (
                    <button
                        key={l.code}
                        type="button"
                        onClick={() => setActiveLang(l.code)}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-sm transition-colors",
                            activeLang === l.code
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                    >
                        {l.label}
                        <span className="ml-1 text-xs opacity-60">({l.code})</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    Loading translations…
                </div>
            ) : (
                <div className="space-y-4">
                    {fields.map((f) => {
                        const v = values[f.name] ?? "";
                        const base = baseValues[f.name] ?? "";
                        return (
                            <div key={f.name}>
                                <label className="text-sm font-medium block mb-1">
                                    {f.label}
                                </label>
                                {base && (
                                    <p className="text-xs text-muted-foreground mb-1.5 italic line-clamp-2">
                                        EN: {base}
                                    </p>
                                )}
                                {f.multiline ? (
                                    <Textarea
                                        rows={f.rows ?? 3}
                                        value={v}
                                        onChange={(e) =>
                                            setValues({ ...values, [f.name]: e.target.value })
                                        }
                                        placeholder={`${f.label} in ${activeLang.toUpperCase()}…`}
                                    />
                                ) : (
                                    <Input
                                        value={v}
                                        onChange={(e) =>
                                            setValues({ ...values, [f.name]: e.target.value })
                                        }
                                        placeholder={`${f.label} in ${activeLang.toUpperCase()}…`}
                                    />
                                )}
                            </div>
                        );
                    })}
                    <p className="text-xs text-muted-foreground">
                        Leave a field empty to remove its translation.
                    </p>
                </div>
            )}
        </div>
    );
}

export const SUPPORTED_LANGS = [
    { code: "hi", label: "Hindi" },
    { code: "zh", label: "Chinese" },
    { code: "ja", label: "Japanese" },
    { code: "th", label: "Thai" },
    { code: "si", label: "Sinhala" },
    { code: "vi", label: "Vietnamese" },
    { code: "dz", label: "Dzongkha" },
];

export const PACKAGE_TRANSLATABLE_FIELDS: FieldDef[] = [
    { name: "title", label: "Title" },
    { name: "summary", label: "Summary", multiline: true, rows: 2 },
    { name: "description", label: "Description", multiline: true, rows: 4 },
    { name: "itinerary", label: "Itinerary", multiline: true, rows: 6 },
    { name: "inclusions", label: "Inclusions", multiline: true, rows: 3 },
    { name: "exclusions", label: "Exclusions", multiline: true, rows: 3 },
];

export const DESTINATION_TRANSLATABLE_FIELDS: FieldDef[] = [
    { name: "name", label: "Name" },
    { name: "region", label: "Region" },
    { name: "description", label: "Description", multiline: true, rows: 4 },
];

type FieldDef_export = FieldDef;
export type { FieldDef_export as FieldDef };
