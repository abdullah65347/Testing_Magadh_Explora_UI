import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Upload, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

import { packageService, type PackageRequest, type PackageImage } from "@/api/services/packageService";
import { categoryService } from "@/api/services/categoryService";
import { destinationService } from "@/api/services/destinationService";
import { uploadService } from "@/api/services/uploadService";
import {
    EntityTranslationsEditor,
    SUPPORTED_LANGS,
    PACKAGE_TRANSLATABLE_FIELDS,
} from "@/components/admin/EntityTranslationsEditor";

const TRAVELER_TYPES = ["COUPLE", "SOLO", "FAMILY", "GROUP", "SCHOOL", "COLLEGE", "CORPORATE"];

const empty: PackageRequest = {
    slug: "",
    title: "",
    summary: "",
    description: "",
    priceInr: 0,
    originalPriceInr: undefined,
    durationDays: undefined,
    rating: undefined,
    reviewsCount: 0,
    groupSizeMin: undefined,
    groupSizeMax: undefined,
    heroImageUrl: "",
    mode: "HOLIDAY",
    travelerTypes: "",
    itinerary: "",
    inclusions: "",
    exclusions: "",
    published: false,
    featured: false,
    categoryIds: [],
    destinationIds: [],
    images: [],
};

export default function PackageForm() {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [form, setForm] = useState<PackageRequest>(empty);
    const [uploading, setUploading] = useState(false);

    const categories = useQuery({ queryKey: ["categories"], queryFn: () => categoryService.list() });
    const destinations = useQuery({ queryKey: ["destinations"], queryFn: destinationService.adminList });

    const existing = useQuery({
        queryKey: ["admin", "packages", id],
        queryFn: () => packageService.adminGet(Number(id)),
        enabled: isEdit,
    });

    useEffect(() => {
        if (isEdit && existing.data) {
            const p = existing.data;
            setForm({
                slug: p.slug,
                title: p.title,
                summary: p.summary ?? "",
                description: p.description ?? "",
                priceInr: Number(p.priceInr),
                originalPriceInr: p.originalPriceInr ? Number(p.originalPriceInr) : undefined,
                durationDays: p.durationDays,
                rating: p.rating ? Number(p.rating) : undefined,
                reviewsCount: p.reviewsCount,
                groupSizeMin: p.groupSizeMin,
                groupSizeMax: p.groupSizeMax,
                heroImageUrl: p.heroImageUrl ?? "",
                mode: p.mode,
                travelerTypes: p.travelerTypes ?? "",
                itinerary: p.itinerary ?? "",
                inclusions: p.inclusions ?? "",
                exclusions: p.exclusions ?? "",
                published: p.published,
                featured: p.featured,
                categoryIds: p.categories.map((c) => c.id),
                destinationIds: p.destinations.map((d) => d.id),
                images: p.images.map((i) => ({
                    url: i.url, altText: i.altText, primary: i.primary, displayOrder: i.displayOrder,
                })),
            });
        }
    }, [isEdit, existing.data]);

    const themes = useMemo(
        () => (categories.data ?? []).filter((c) => c.kind === "THEME"),
        [categories.data]
    );
    const tiers = useMemo(
        () => (categories.data ?? []).filter((c) => c.kind === "TIER"),
        [categories.data]
    );

    const mutation = useMutation({
        mutationFn: (req: PackageRequest) =>
            isEdit ? packageService.update(Number(id), req) : packageService.create(req),
        onSuccess: () => {
            toast.success(isEdit ? "Package updated" : "Package created");
            qc.invalidateQueries({ queryKey: ["admin", "packages"] });
            navigate("/admin/packages");
        },
        onError: (err: any) => {
            const ve = err?.errors;
            if (ve) {
                const msg = Object.entries(ve).map(([k, v]) => `${k}: ${v}`).join("\n");
                toast.error(msg);
            } else {
                toast.error(err?.message ?? "Save failed");
            }
        },
    });

    const set = <K extends keyof PackageRequest>(k: K, v: PackageRequest[K]) =>
        setForm((f) => ({ ...f, [k]: v }));

    const toggleId = (key: "categoryIds" | "destinationIds", id: number) =>
        setForm((f) => ({
            ...f,
            [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id],
        }));

    const toggleTraveler = (t: string) => {
        const cur = (form.travelerTypes ?? "").split(",").map((s) => s.trim()).filter(Boolean);
        const next = cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t];
        set("travelerTypes", next.join(","));
    };

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;
        setUploading(true);
        try {
            const urls = await Promise.all(Array.from(files).map((f) => uploadService.upload(f)));
            const startIdx = form.images.length;
            const newImages: PackageImage[] = urls.map((url, i) => ({
                url,
                altText: "",
                primary: form.images.length === 0 && i === 0,
                displayOrder: startIdx + i,
            }));
            set("images", [...form.images, ...newImages]);
            toast.success(`Uploaded ${urls.length} image(s)`);
        } catch (err: any) {
            toast.error(err?.message ?? "Upload failed");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const setPrimary = (idx: number) =>
        set("images", form.images.map((img, i) => ({ ...img, primary: i === idx })));

    const removeImage = (idx: number) =>
        set("images", form.images.filter((_, i) => i !== idx));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.slug || !form.title) {
            toast.error("Slug and title are required");
            return;
        }
        if (!form.priceInr && form.priceInr !== 0) {
            toast.error("Price is required");
            return;
        }
        mutation.mutate(form);
    };

    if (isEdit && existing.isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-3">
                <Link to="/admin/packages" className="p-2 rounded hover:bg-muted">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-2xl font-bold">{isEdit ? "Edit Package" : "New Package"}</h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Basics */}
                <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                    <h2 className="font-semibold">Basics</h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Title *">
                            <input
                                value={form.title}
                                onChange={(e) => set("title", e.target.value)}
                                className="input"
                                required
                            />
                        </Field>
                        <Field label="Slug * (URL-safe)">
                            <input
                                value={form.slug}
                                onChange={(e) => set("slug", e.target.value)}
                                className="input"
                                placeholder="buddhist-circuit-premium"
                                required
                            />
                        </Field>
                    </div>

                    <Field label="Summary (one-line tagline)">
                        <input
                            value={form.summary ?? ""}
                            onChange={(e) => set("summary", e.target.value)}
                            className="input"
                        />
                    </Field>

                    <Field label="Description">
                        <textarea
                            value={form.description ?? ""}
                            onChange={(e) => set("description", e.target.value)}
                            className="input min-h-[120px]"
                        />
                    </Field>
                </section>

                {/* Pricing & specs */}
                <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                    <h2 className="font-semibold">Pricing & specs</h2>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <Field label="Price (INR) *">
                            <input
                                type="number" min={0} step="0.01"
                                value={form.priceInr}
                                onChange={(e) => set("priceInr", Number(e.target.value))}
                                className="input" required
                            />
                        </Field>
                        <Field label="Original price (INR)">
                            <input
                                type="number" min={0} step="0.01"
                                value={form.originalPriceInr ?? ""}
                                onChange={(e) => set("originalPriceInr", e.target.value ? Number(e.target.value) : undefined)}
                                className="input"
                            />
                        </Field>
                        <Field label="Duration (days)">
                            <input
                                type="number" min={1}
                                value={form.durationDays ?? ""}
                                onChange={(e) => set("durationDays", e.target.value ? Number(e.target.value) : undefined)}
                                className="input"
                            />
                        </Field>
                    </div>

                    <div className="grid sm:grid-cols-4 gap-4">
                        <Field label="Rating (0-5)">
                            <input
                                type="number" min={0} max={5} step="0.1"
                                value={form.rating ?? ""}
                                onChange={(e) => set("rating", e.target.value ? Number(e.target.value) : undefined)}
                                className="input"
                            />
                        </Field>
                        <Field label="Reviews count">
                            <input
                                type="number" min={0}
                                value={form.reviewsCount ?? 0}
                                onChange={(e) => set("reviewsCount", Number(e.target.value))}
                                className="input"
                            />
                        </Field>
                        <Field label="Min group size">
                            <input
                                type="number" min={1}
                                value={form.groupSizeMin ?? ""}
                                onChange={(e) => set("groupSizeMin", e.target.value ? Number(e.target.value) : undefined)}
                                className="input"
                            />
                        </Field>
                        <Field label="Max group size">
                            <input
                                type="number" min={1}
                                value={form.groupSizeMax ?? ""}
                                onChange={(e) => set("groupSizeMax", e.target.value ? Number(e.target.value) : undefined)}
                                className="input"
                            />
                        </Field>
                    </div>

                    <Field label="Mode">
                        <select
                            value={form.mode}
                            onChange={(e) => set("mode", e.target.value as PackageRequest["mode"])}
                            className="input"
                        >
                            <option value="HOLIDAY">Holiday</option>
                            <option value="PILGRIMAGE">Pilgrimage</option>
                        </select>
                    </Field>

                    <Field label="Traveler types">
                        <div className="flex flex-wrap gap-2">
                            {TRAVELER_TYPES.map((t) => {
                                const selected = (form.travelerTypes ?? "").split(",").map((s) => s.trim()).includes(t);
                                return (
                                    <button
                                        type="button"
                                        key={t}
                                        onClick={() => toggleTraveler(t)}
                                        className={`px-3 py-1 rounded-full text-xs border ${
                                            selected
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background border-border hover:bg-muted"
                                        }`}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>
                    </Field>
                </section>

                {/* Taxonomy */}
                <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                    <h2 className="font-semibold">Themes & tiers</h2>

                    <Field label="Themes">
                        <div className="flex flex-wrap gap-2">
                            {themes.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => toggleId("categoryIds", c.id)}
                                    className={`px-3 py-1 rounded-full text-xs border ${
                                        form.categoryIds.includes(c.id)
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background border-border hover:bg-muted"
                                    }`}
                                >
                                    {c.name}
                                </button>
                            ))}
                            {themes.length === 0 && (
                                <p className="text-xs text-muted-foreground">No themes — add some in Categories.</p>
                            )}
                        </div>
                    </Field>

                    <Field label="Tier">
                        <div className="flex flex-wrap gap-2">
                            {tiers.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => toggleId("categoryIds", c.id)}
                                    className={`px-3 py-1 rounded-full text-xs border ${
                                        form.categoryIds.includes(c.id)
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background border-border hover:bg-muted"
                                    }`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </Field>

                    <Field label="Destinations">
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-auto">
                            {destinations.data?.map((d) => (
                                <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => toggleId("destinationIds", d.id)}
                                    className={`px-3 py-1 rounded-full text-xs border ${
                                        form.destinationIds.includes(d.id)
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background border-border hover:bg-muted"
                                    }`}
                                >
                                    {d.name}
                                </button>
                            ))}
                        </div>
                    </Field>
                </section>

                {/* Images */}
                <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                    <h2 className="font-semibold">Images</h2>

                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border cursor-pointer hover:bg-muted">
                        <Upload className="w-4 h-4" />
                        {uploading ? "Uploading…" : "Upload images"}
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={onUpload}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>

                    {form.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {form.images.map((img, idx) => (
                                <div key={idx} className="relative group border border-border rounded-lg overflow-hidden">
                                    <img src={img.url} alt={img.altText ?? ""} className="w-full h-32 object-cover" />
                                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                        <button
                                            type="button"
                                            onClick={() => setPrimary(idx)}
                                            className={`p-1.5 rounded ${img.primary ? "bg-yellow-500 text-white" : "bg-white/90 text-black"}`}
                                            title="Mark as primary"
                                        >
                                            <Star className="w-3.5 h-3.5" fill={img.primary ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="p-1.5 rounded bg-red-500 text-white"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    {img.primary && (
                                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-yellow-500 text-white text-[10px] font-medium">
                                            Primary
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Long-form content */}
                <section className="bg-card border border-border rounded-lg p-5 space-y-4">
                    <h2 className="font-semibold">Itinerary & inclusions</h2>
                    <Field label="Itinerary">
                        <textarea
                            value={form.itinerary ?? ""}
                            onChange={(e) => set("itinerary", e.target.value)}
                            className="input min-h-[120px]"
                        />
                    </Field>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Inclusions">
                            <textarea
                                value={form.inclusions ?? ""}
                                onChange={(e) => set("inclusions", e.target.value)}
                                className="input min-h-[100px]"
                            />
                        </Field>
                        <Field label="Exclusions">
                            <textarea
                                value={form.exclusions ?? ""}
                                onChange={(e) => set("exclusions", e.target.value)}
                                className="input min-h-[100px]"
                            />
                        </Field>
                    </div>
                </section>

                {/* Visibility */}
                <section className="bg-card border border-border rounded-lg p-5 space-y-3">
                    <h2 className="font-semibold">Visibility</h2>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.published}
                            onChange={(e) => set("published", e.target.checked)}
                        />
                        Published — show on the public site
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={(e) => set("featured", e.target.checked)}
                        />
                        Featured — eligible for the homepage "Featured" section
                    </label>
                </section>

                <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-background py-4 border-t border-border">
                    <Link
                        to="/admin/packages"
                        className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create package"}
                    </button>
                </div>
            </form>

            {isEdit && existing.data && (
                <div className="mt-6">
                    <EntityTranslationsEditor
                        type="package"
                        entityId={existing.data.id}
                        languages={SUPPORTED_LANGS}
                        fields={PACKAGE_TRANSLATABLE_FIELDS}
                        baseValues={{
                            title: existing.data.title,
                            summary: existing.data.summary ?? "",
                            description: existing.data.description ?? "",
                            itinerary: existing.data.itinerary ?? "",
                            inclusions: existing.data.inclusions ?? "",
                            exclusions: existing.data.exclusions ?? "",
                        }}
                    />
                </div>
            )}

            {/* tiny utility class for inputs */}
            <style>{`
                .input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid hsl(var(--border)); border-radius: 0.5rem; background: hsl(var(--background)); font-size: 0.875rem; }
                .input:focus { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; }
            `}</style>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="text-xs font-medium text-muted-foreground mb-1 block">{label}</span>
            {children}
        </label>
    );
}
