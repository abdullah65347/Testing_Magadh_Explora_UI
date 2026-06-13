import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { translationService, TranslationMap } from "@/api/services/translationService";
import { Language } from "@/i18n/translations";
import { cn } from "@/lib/utils";

const LANGS: { code: Language; label: string }[] = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "zh", label: "中文" },
    { code: "ja", label: "日本語" },
    { code: "th", label: "ไทย" },
    { code: "si", label: "සිංහල" },
    { code: "vi", label: "Tiếng Việt" },
    { code: "dz", label: "རྫོང་ཁ" },
];

interface Row {
    id: string;          // local id for React keys
    key: string;
    value: string;
    persisted: boolean;  // exists on the server (so empty value = delete intent)
}

let rowSeq = 0;
const nextRowId = () => `r${++rowSeq}`;

function toRows(map: TranslationMap): Row[] {
    return Object.entries(map).map(([key, value]) => ({
        id: nextRowId(),
        key,
        value: value ?? "",
        persisted: true,
    }));
}

export default function AdminTranslations() {
    const qc = useQueryClient();
    const [lang, setLang] = useState<Language>("en");
    const [rows, setRows] = useState<Row[]>([]);
    const [filter, setFilter] = useState("");

    const query = useQuery({
        queryKey: ["admin", "translations", lang],
        queryFn: () => translationService.adminList(lang),
    });

    useEffect(() => {
        if (query.data) setRows(toRows(query.data));
    }, [query.data, lang]);

    const save = useMutation({
        mutationFn: (entries: TranslationMap) => translationService.adminSave(lang, entries),
        onSuccess: (data) => {
            toast.success("Translations saved");
            qc.invalidateQueries({ queryKey: ["admin", "translations", lang] });
            setRows(toRows(data));
        },
        onError: (err: any) => toast.error(err?.message ?? "Save failed"),
    });

    const filtered = useMemo(() => {
        if (!filter.trim()) return rows;
        const q = filter.toLowerCase();
        return rows.filter(
            (r) => r.key.toLowerCase().includes(q) || (r.value ?? "").toLowerCase().includes(q),
        );
    }, [rows, filter]);

    const handleAddRow = () => {
        setRows((prev) => [...prev, { id: nextRowId(), key: "", value: "", persisted: false }]);
    };

    const handleRowChange = (id: string, field: "key" | "value", value: string) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    };

    const handleRemove = (id: string) => {
        const r = rows.find((x) => x.id === id);
        if (!r) return;
        if (r.persisted && r.key) {
            // Mark for delete by emptying the value — save() will issue the delete on the server.
            setRows((prev) => prev.map((x) => (x.id === id ? { ...x, value: "" } : x)));
        } else {
            setRows((prev) => prev.filter((x) => x.id !== id));
        }
    };

    const handleSave = () => {
        const payload: TranslationMap = {};
        const seen = new Set<string>();
        for (const r of rows) {
            const key = r.key.trim();
            if (!key) continue;
            if (seen.has(key)) {
                toast.error(`Duplicate key: ${key}`);
                return;
            }
            seen.add(key);
            // Empty value = delete on the server (controller treats blank as delete).
            payload[key] = r.value ?? "";
        }
        save.mutate(payload);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">UI Translations</h1>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        Override individual UI strings per language. Empty value deletes the override
                        and re-applies the built-in default. Keys are dotted paths
                        (e.g. <code className="px-1 rounded bg-muted">nav.home</code>).
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={save.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {save.isPending ? "Saving…" : "Save changes"}
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-border">
                {LANGS.map((l) => (
                    <button
                        key={l.code}
                        onClick={() => setLang(l.code)}
                        className={cn(
                            "px-3 py-2 -mb-px text-sm font-medium border-b-2 transition-colors",
                            lang === l.code
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {l.label}{" "}
                        <span className="text-xs text-muted-foreground">({l.code})</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filter by key or value…"
                    className="w-full max-w-sm h-9 px-3 rounded-md border border-input bg-background text-sm"
                />
                <span className="text-xs text-muted-foreground">{filtered.length} of {rows.length}</span>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                {query.isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading…</div>
                ) : query.isError ? (
                    <div className="p-8 text-center text-red-500">Failed to load translations.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium w-1/3">Key</th>
                                <th className="px-4 py-3 font-medium">Value</th>
                                <th className="px-4 py-3 font-medium w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                        No overrides yet. Click "Add row" below.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((r) => (
                                    <tr key={r.id} className="border-t border-border">
                                        <td className="px-4 py-2">
                                            <input
                                                value={r.key}
                                                onChange={(e) => handleRowChange(r.id, "key", e.target.value)}
                                                placeholder="nav.home"
                                                className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm font-mono"
                                                disabled={r.persisted}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                value={r.value}
                                                onChange={(e) => handleRowChange(r.id, "value", e.target.value)}
                                                placeholder="(leave empty to delete)"
                                                className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                onClick={() => handleRemove(r.id)}
                                                className="p-2 rounded-md hover:bg-muted text-red-500"
                                                aria-label="Remove"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
                <div className="border-t border-border p-3">
                    <button
                        onClick={handleAddRow}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted"
                    >
                        <Plus className="w-4 h-4" /> Add row
                    </button>
                </div>
            </div>
        </div>
    );
}
