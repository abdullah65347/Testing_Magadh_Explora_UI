import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, ChevronUp, ChevronDown, Save } from "lucide-react";
import { toast } from "sonner";
import {
    homepageService,
    type HomepageSection,
    type HomepageSectionInput,
    type HomepageSectionItem,
    type HomepageEntityType,
} from "@/api/services/homepageService";
import { packageService } from "@/api/services/packageService";
import { destinationService } from "@/api/services/destinationService";
import { blogService } from "@/api/services/blogService";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";

const ENTITY_LABELS: Record<HomepageEntityType, string> = {
    PACKAGE: "Package",
    DESTINATION: "Destination",
    BLOG: "Blog post",
};

const NEW_SECTION: HomepageSectionInput = {
    sectionKey: "",
    title: "",
    displayOrder: 0,
    active: true,
    maxItems: 6,
};

export default function AdminHomepage() {
    const qc = useQueryClient();
    const sections = useQuery({ queryKey: ["admin", "homepage"], queryFn: homepageService.adminLayout });

    const packagesQ = useQuery({ queryKey: ["admin", "packages"], queryFn: packageService.adminList });
    const destinationsQ = useQuery({ queryKey: ["admin", "destinations"], queryFn: destinationService.adminList });
    const blogsQ = useQuery({ queryKey: ["admin", "blogs"], queryFn: blogService.adminList });

    const entityIndex = useMemo(() => {
        const map: Record<HomepageEntityType, Map<number, string>> = {
            PACKAGE: new Map(),
            DESTINATION: new Map(),
            BLOG: new Map(),
        };
        (packagesQ.data ?? []).forEach((p) => map.PACKAGE.set(p.id, p.title));
        (destinationsQ.data ?? []).forEach((d) => map.DESTINATION.set(d.id, d.name));
        (blogsQ.data ?? []).forEach((b) => map.BLOG.set(b.id, b.title));
        return map;
    }, [packagesQ.data, destinationsQ.data, blogsQ.data]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Homepage Layout</h1>
                <p className="text-sm text-muted-foreground">
                    Control which sections appear on the homepage and what they contain.
                </p>
            </div>

            {sections.isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading…</div>
            ) : (
                <div className="space-y-4">
                    {(sections.data ?? []).map((s) => (
                        <SectionCard
                            key={s.id}
                            section={s}
                            entityIndex={entityIndex}
                            packages={packagesQ.data ?? []}
                            destinations={destinationsQ.data ?? []}
                            blogs={blogsQ.data ?? []}
                            onChange={() => qc.invalidateQueries({ queryKey: ["admin", "homepage"] })}
                        />
                    ))}

                    <NewSectionCard onCreated={() => qc.invalidateQueries({ queryKey: ["admin", "homepage"] })} />
                </div>
            )}
        </div>
    );
}

// -----------------------------------------------------------------------------
// New-section card
// -----------------------------------------------------------------------------
function NewSectionCard({ onCreated }: { onCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<HomepageSectionInput>(NEW_SECTION);

    const create = useMutation({
        mutationFn: () => homepageService.createSection(form),
        onSuccess: () => {
            toast.success("Section created");
            setOpen(false);
            setForm(NEW_SECTION);
            onCreated();
        },
        onError: (err: any) => toast.error(err?.message ?? "Create failed"),
    });

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="w-full p-4 rounded-lg border-2 border-dashed border-border hover:bg-muted/30 text-sm text-muted-foreground inline-flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add new section
            </button>
        );
    }

    return (
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h3 className="font-semibold">New section</h3>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Title *">
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
                </Field>
                <Field label="Key *" hint="machine-readable; lowercase">
                    <input
                        value={form.sectionKey}
                        onChange={(e) => setForm({ ...form, sectionKey: e.target.value })}
                        className="input font-mono"
                    />
                </Field>
                <Field label="Display order">
                    <input
                        type="number"
                        value={form.displayOrder}
                        onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                        className="input"
                    />
                </Field>
                <Field label="Max items">
                    <input
                        type="number"
                        min="1"
                        value={form.maxItems}
                        onChange={(e) => setForm({ ...form, maxItems: Number(e.target.value) })}
                        className="input"
                    />
                </Field>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => create.mutate()}
                    disabled={create.isPending || !form.title || !form.sectionKey}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                    {create.isPending ? "Creating…" : "Create"}
                </button>
                <button
                    onClick={() => { setOpen(false); setForm(NEW_SECTION); }}
                    className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted"
                >
                    Cancel
                </button>
            </div>
            <SharedStyle />
        </div>
    );
}

// -----------------------------------------------------------------------------
// One section card
// -----------------------------------------------------------------------------
interface SectionCardProps {
    section: HomepageSection;
    entityIndex: Record<HomepageEntityType, Map<number, string>>;
    packages: { id: number; title: string }[];
    destinations: { id: number; name: string }[];
    blogs: { id: number; title: string }[];
    onChange: () => void;
}

function SectionCard({ section, entityIndex, packages, destinations, blogs, onChange }: SectionCardProps) {
    const confirm = useConfirm();
    const [editingMeta, setEditingMeta] = useState(false);
    const [meta, setMeta] = useState<HomepageSectionInput>({
        sectionKey: section.sectionKey,
        title: section.title,
        displayOrder: section.displayOrder,
        active: section.active,
        maxItems: section.maxItems,
    });
    const [items, setItems] = useState<HomepageSectionItem[]>(section.items);
    const [addType, setAddType] = useState<HomepageEntityType>("PACKAGE");
    const [addId, setAddId] = useState<string>("");

    const saveMeta = useMutation({
        mutationFn: () => homepageService.updateSection(section.id, meta),
        onSuccess: () => {
            toast.success("Section updated");
            setEditingMeta(false);
            onChange();
        },
        onError: (err: any) => toast.error(err?.message ?? "Save failed"),
    });

    const saveItems = useMutation({
        mutationFn: () => homepageService.replaceItems(section.id, items.map(({ id: _id, ...rest }) => rest)),
        onSuccess: () => {
            toast.success("Items saved");
            onChange();
        },
        onError: (err: any) => toast.error(err?.message ?? "Save failed"),
    });

    const remove = useMutation({
        mutationFn: () => homepageService.deleteSection(section.id),
        onSuccess: () => {
            toast.success("Section deleted");
            onChange();
        },
        onError: (err: any) => toast.error(err?.message ?? "Delete failed"),
    });

    const move = (i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= items.length) return;
        const copy = [...items];
        [copy[i], copy[j]] = [copy[j], copy[i]];
        setItems(copy.map((it, idx) => ({ ...it, displayOrder: idx })));
    };

    const removeItem = (i: number) => {
        setItems(items.filter((_, idx) => idx !== i).map((it, idx) => ({ ...it, displayOrder: idx })));
    };

    const handleAdd = () => {
        const idNum = Number(addId);
        if (!idNum) return;
        if (items.some((it) => it.entityType === addType && it.entityId === idNum)) {
            toast.error("Already in this section");
            return;
        }
        setItems([...items, { entityType: addType, entityId: idNum, displayOrder: items.length }]);
        setAddId("");
    };

    const choices = addType === "PACKAGE" ? packages.map((p) => ({ id: p.id, label: p.title }))
        : addType === "DESTINATION" ? destinations.map((d) => ({ id: d.id, label: d.name }))
        : blogs.map((b) => ({ id: b.id, label: b.title }));

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            {editingMeta ? (
                <div className="p-5 border-b border-border space-y-3 bg-muted/20">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Title *">
                            <input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} className="input" />
                        </Field>
                        <Field label="Key *">
                            <input
                                value={meta.sectionKey}
                                onChange={(e) => setMeta({ ...meta, sectionKey: e.target.value })}
                                className="input font-mono"
                            />
                        </Field>
                        <Field label="Display order">
                            <input
                                type="number"
                                value={meta.displayOrder}
                                onChange={(e) => setMeta({ ...meta, displayOrder: Number(e.target.value) })}
                                className="input"
                            />
                        </Field>
                        <Field label="Max items">
                            <input
                                type="number"
                                min="1"
                                value={meta.maxItems}
                                onChange={(e) => setMeta({ ...meta, maxItems: Number(e.target.value) })}
                                className="input"
                            />
                        </Field>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={meta.active}
                            onChange={(e) => setMeta({ ...meta, active: e.target.checked })}
                        />
                        Active
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => saveMeta.mutate()}
                            disabled={saveMeta.isPending}
                            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                        >
                            {saveMeta.isPending ? "Saving…" : "Save section"}
                        </button>
                        <button
                            onClick={() => setEditingMeta(false)}
                            className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{section.title}</h3>
                            <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                section.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                            )}>
                                {section.active ? "Live" : "Off"}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                            key=<strong>{section.sectionKey}</strong> · order={section.displayOrder} · max={section.maxItems}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setEditingMeta(true)} className="p-2 rounded-md hover:bg-muted">
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={async () => {
                                const ok = await confirm({
                                    title: "Delete section?",
                                    description: `"${section.title}" and its item list will be removed.`,
                                    confirmText: "Delete",
                                    destructive: true,
                                });
                                if (ok) remove.mutate();
                            }}
                            className="p-2 rounded-md hover:bg-muted text-red-500"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="p-5 space-y-4">
                {items.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-6">No items in this section.</div>
                ) : (
                    <div className="border border-border rounded-md divide-y divide-border">
                        {items.map((it, i) => {
                            const label = entityIndex[it.entityType]?.get(it.entityId) ?? `#${it.entityId} (not found)`;
                            return (
                                <div key={`${it.entityType}-${it.entityId}`} className="flex items-center gap-3 px-3 py-2 text-sm">
                                    <span className="w-6 text-xs text-muted-foreground tabular-nums">{i + 1}.</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                        {ENTITY_LABELS[it.entityType]}
                                    </span>
                                    <span className="flex-1 truncate font-medium">{label}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => move(i, -1)}
                                            disabled={i === 0}
                                            className="p-1 rounded hover:bg-muted disabled:opacity-30"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => move(i, 1)}
                                            disabled={i === items.length - 1}
                                            className="p-1 rounded hover:bg-muted disabled:opacity-30"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeItem(i)}
                                            className="p-1 rounded hover:bg-muted text-red-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-border">
                    <Field label="Type">
                        <select
                            value={addType}
                            onChange={(e) => { setAddType(e.target.value as HomepageEntityType); setAddId(""); }}
                            className="input"
                        >
                            <option value="PACKAGE">Package</option>
                            <option value="DESTINATION">Destination</option>
                            <option value="BLOG">Blog post</option>
                        </select>
                    </Field>
                    <Field label="Item">
                        <select value={addId} onChange={(e) => setAddId(e.target.value)} className="input min-w-[240px]">
                            <option value="">Select…</option>
                            {choices.map((c) => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </Field>
                    <button
                        onClick={handleAdd}
                        disabled={!addId}
                        className="px-3 py-2 rounded-md bg-muted text-sm font-medium hover:bg-muted/80 disabled:opacity-50"
                    >
                        Add
                    </button>
                    <div className="flex-1" />
                    <button
                        onClick={() => saveItems.mutate()}
                        disabled={saveItems.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saveItems.isPending ? "Saving…" : "Save items"}
                    </button>
                </div>
            </div>

            <SharedStyle />
        </div>
    );
}

// -----------------------------------------------------------------------------
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

function SharedStyle() {
    return (
        <style>{`
            .input {
                height: 36px;
                padding: 0 10px;
                border-radius: 6px;
                border: 1px solid hsl(var(--input));
                background: hsl(var(--background));
                font-size: 14px;
            }
        `}</style>
    );
}
