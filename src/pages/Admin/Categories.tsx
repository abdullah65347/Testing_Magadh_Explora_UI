import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { categoryService, type Category, type CategoryInput, type CategoryKind } from "@/api/services/categoryService";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";

const KIND_LABELS: Record<CategoryKind, string> = {
    THEME:   "Themes",
    TIER:    "Tiers",
    GENERIC: "Other",
};

const KIND_DESCRIPTIONS: Record<CategoryKind, string> = {
    THEME:   "Used for package filter chips (Buddhist, Jain, Heritage, etc.)",
    TIER:    "Pricing/quality tiers (Essential, Deluxe, Premium)",
    GENERIC: "Misc tags that don't fit elsewhere",
};

const EMPTY: CategoryInput = {
    slug: "",
    kind: "THEME",
    name: "",
    description: "",
    displayOrder: 0,
    active: true,
};

export default function AdminCategories() {
    const qc = useQueryClient();
    const confirm = useConfirm();
    const list = useQuery({ queryKey: ["admin", "categories"], queryFn: () => categoryService.list() });

    const [editing, setEditing] = useState<Category | null>(null);
    const [creating, setCreating] = useState<CategoryKind | null>(null);
    const [form, setForm] = useState<CategoryInput>(EMPTY);

    const save = useMutation({
        mutationFn: async () => {
            if (editing) return categoryService.update(editing.id, form);
            return categoryService.create(form);
        },
        onSuccess: () => {
            toast.success(editing ? "Category updated" : "Category created");
            qc.invalidateQueries({ queryKey: ["admin", "categories"] });
            closePanel();
        },
        onError: (err: any) => toast.error(err?.message ?? "Save failed"),
    });

    const remove = useMutation({
        mutationFn: (id: number) => categoryService.remove(id),
        onSuccess: () => {
            toast.success("Category deleted");
            qc.invalidateQueries({ queryKey: ["admin", "categories"] });
        },
        onError: (err: any) => toast.error(err?.message ?? "Delete failed"),
    });

    const startEdit = (c: Category) => {
        setEditing(c);
        setCreating(null);
        setForm({
            slug: c.slug,
            kind: c.kind,
            name: c.name,
            description: c.description ?? "",
            displayOrder: c.displayOrder,
            active: c.active,
        });
    };

    const startCreate = (kind: CategoryKind) => {
        setEditing(null);
        setCreating(kind);
        setForm({ ...EMPTY, kind });
    };

    const closePanel = () => {
        setEditing(null);
        setCreating(null);
        setForm(EMPTY);
    };

    const handleDelete = async (c: Category) => {
        const ok = await confirm({
            title: "Delete category?",
            description: `"${c.name}" will be permanently removed. This cannot be undone.`,
            confirmText: "Delete",
            destructive: true,
        });
        if (ok) remove.mutate(c.id);
    };

    const grouped: Record<CategoryKind, Category[]> = { THEME: [], TIER: [], GENERIC: [] };
    (list.data ?? []).forEach((c) => grouped[c.kind]?.push(c));

    const isPanelOpen = editing != null || creating != null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Categories</h1>
                <p className="text-sm text-muted-foreground">
                    Manage filter chips and tiers shown on the packages page.
                </p>
            </div>

            <div className={cn("grid gap-6", isPanelOpen ? "lg:grid-cols-[1fr_360px]" : "grid-cols-1")}>
                <div className="space-y-6">
                    {(Object.keys(KIND_LABELS) as CategoryKind[]).map((kind) => (
                        <div key={kind} className="bg-card border border-border rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <div>
                                    <h2 className="font-semibold">{KIND_LABELS[kind]}</h2>
                                    <p className="text-xs text-muted-foreground">{KIND_DESCRIPTIONS[kind]}</p>
                                </div>
                                <button
                                    onClick={() => startCreate(kind)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>

                            {list.isLoading ? (
                                <div className="p-6 text-center text-muted-foreground text-sm">Loading…</div>
                            ) : grouped[kind].length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/30 text-left text-xs">
                                        <tr>
                                            <th className="px-4 py-2 font-medium">Name</th>
                                            <th className="px-4 py-2 font-medium">Slug</th>
                                            <th className="px-4 py-2 font-medium w-16">Order</th>
                                            <th className="px-4 py-2 font-medium w-20">Active</th>
                                            <th className="px-4 py-2 font-medium w-24 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grouped[kind].map((c) => (
                                            <tr key={c.id} className="border-t border-border hover:bg-muted/20">
                                                <td className="px-4 py-2 font-medium">{c.name}</td>
                                                <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{c.slug}</td>
                                                <td className="px-4 py-2">{c.displayOrder}</td>
                                                <td className="px-4 py-2">
                                                    <span className={cn(
                                                        "text-xs px-2 py-0.5 rounded-full",
                                                        c.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                                                    )}>
                                                        {c.active ? "Live" : "Off"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <div className="inline-flex gap-1">
                                                        <button onClick={() => startEdit(c)} className="p-1.5 rounded-md hover:bg-muted">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(c)} className="p-1.5 rounded-md hover:bg-muted text-red-500">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-6 text-center text-sm text-muted-foreground">None yet.</div>
                            )}
                        </div>
                    ))}
                </div>

                {isPanelOpen && (
                    <aside className="bg-card border border-border rounded-lg p-5 h-fit lg:sticky lg:top-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">
                                {editing ? `Edit "${editing.name}"` : `New ${KIND_LABELS[creating!]}`}
                            </h3>
                            <button onClick={closePanel} className="p-1 rounded-md hover:bg-muted">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
                            className="space-y-3"
                        >
                            <Field label="Name *">
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    className="input"
                                />
                            </Field>

                            <Field label="Slug *" hint="lowercase-with-dashes">
                                <input
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                    required
                                    pattern="[a-z0-9-]+"
                                    className="input font-mono"
                                />
                            </Field>

                            <Field label="Kind *">
                                <select
                                    value={form.kind}
                                    onChange={(e) => setForm({ ...form, kind: e.target.value as CategoryKind })}
                                    className="input"
                                >
                                    <option value="THEME">Theme</option>
                                    <option value="TIER">Tier</option>
                                    <option value="GENERIC">Generic</option>
                                </select>
                            </Field>

                            <Field label="Description">
                                <textarea
                                    value={form.description ?? ""}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="input"
                                />
                            </Field>

                            <Field label="Display Order">
                                <input
                                    type="number"
                                    value={form.displayOrder}
                                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                                    className="input"
                                />
                            </Field>

                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.active}
                                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                />
                                Active
                            </label>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={save.isPending}
                                    className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                                >
                                    {save.isPending ? "Saving…" : editing ? "Update" : "Create"}
                                </button>
                                <button
                                    type="button"
                                    onClick={closePanel}
                                    className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </aside>
                )}
            </div>

            <style>{`
                .input {
                    width: 100%;
                    height: 36px;
                    padding: 0 10px;
                    border-radius: 6px;
                    border: 1px solid hsl(var(--input));
                    background: hsl(var(--background));
                    font-size: 14px;
                }
                textarea.input { height: auto; padding: 8px 10px; }
            `}</style>
        </div>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
                {label}{hint && <span className="ml-1 font-normal">— {hint}</span>}
            </label>
            {children}
        </div>
    );
}
